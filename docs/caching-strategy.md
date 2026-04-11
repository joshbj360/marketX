# ReelShop Caching Strategy

## Overview

ReelShop uses **Upstash Redis** as its caching layer between the Nuxt/Nitro server and the PostgreSQL database (via Prisma).

The goal is simple: **stop hitting the database for the same data repeatedly.**

---

## The Problem Without Caching

Every time a user loads the feed, the server runs expensive Prisma queries:

```
User A loads feed → DB query (200ms)
User B loads feed → DB query (200ms)   ← same result as A
User C loads feed → DB query (200ms)   ← same result as A and B
...1000 users = 1000 identical DB queries
```

With caching:
```
User A loads feed → DB query (200ms) → store result in Redis
User B loads feed → Redis read (2ms)  ← no DB hit
User C loads feed → Redis read (2ms)  ← no DB hit
...1000 users = 1 DB query + 999 Redis reads
```

---

## What We Cache

| Endpoint | Cache Key | TTL | Strategy | Why |
|----------|-----------|-----|----------|-----|
| `GET /api/feed/posts` | `feed:posts:page:{n}` | 2 min | Shared + creator bypass | New posts come in frequently |
| `GET /api/feed/products` | `feed:products:page:{n}` | 2 min | Shared + creator bypass | Products change occasionally |
| `GET /api/seller/featured` | `feed:sellers:featured` | 5 min | Shared | Follower counts shift slowly |
| `GET /api/commerce/categories` | `data:categories` | 1 hour | Shared | Almost never changes |
| `GET /api/sellers/profile/[slug]` | `seller:profile:{slug}` | 3 min | Shared | High-traffic, changes rarely |
| `GET /api/commerce/products` | `products:list:page:{n}` | 2 min | Shared + creator bypass | Stock/price can change |

### What We DO NOT Cache

| Endpoint | Why |
|----------|-----|
| `GET /api/commerce/cart` | Per-user, must be real-time |
| `GET /api/commerce/orders/*` | Financial data, must be accurate |
| `GET /api/shared/notifications` | Must reflect live state |
| `POST/PATCH/DELETE *` | Write operations, never cached |
| `GET /api/auth/*` | Security-sensitive |
| `GET /api/commerce/payments/*` | Financial, never stale |

---

## Cache Invalidation Strategy

### The Cache Stampede Problem

If 100 users create posts at the same time and each one deletes the shared cache key, then 100 simultaneous requests all miss the cache and hammer the database at once. This defeats the purpose.

```
❌ Bad approach:
User A posts → delete cache → next 100 requests hit DB simultaneously
```

### Our Solution: Option 1 + 2

We use a **hybrid approach**:

---

#### For the Global Discover Feed (Shared cache, no active invalidation)

```
New post created → write to DB only, do NOT touch cache
Cache expires naturally after 2 minutes
All users see new content within 2 minutes
```

**Creator bypass:** The person who just created a post/product always bypasses the cache for their own next request so they see their content immediately.

```ts
// Pseudocode in feed endpoint
const isCreator = userId && recentlyCreated.has(userId)
if (isCreator) return freshFromDB()   // skip cache
return fromCacheOrDB(cacheKey)        // everyone else gets cache
```

We track "recently created" using a short-lived Redis key set on post creation:
```
cache.set(`creator:bypass:${userId}`, '1', { ex: 30 }) // 30 second window
```

---

#### For the Following Feed (Per-user cache keys)

Each user gets their own cache key:
```
feed:following:user:{userId}:page:{n}
```

When User A creates a post:
- Delete **only** `feed:following:user:{userId}:page:0` (A's own key)
- All followers' caches remain untouched — they see the new post within 2 min naturally
- Real-time notification via Soketi signals to followers that new content exists

```
User A posts
  → DB write
  → delete feed:following:user:A:page:0   (A sees it immediately)
  → Soketi emits "new-post" event to A's followers
  → Followers see "New posts available" banner
  → Clicking banner busts their personal cache on demand
```

This means:
- **No stampede** — only one cache key deleted per post creation
- **Creator sees content immediately** — their key is gone, fresh DB fetch
- **Followers are notified** via Soketi without cache being touched
- **DB is never hammered** by 100 simultaneous cache misses

---

## Cache Key Naming Convention

All keys follow a predictable pattern so they're easy to manage:

```
{domain}:{resource}:{identifier}:{page}

Examples:
  feed:posts:page:0              ← global feed page 1
  feed:posts:page:1              ← global feed page 2
  feed:following:user:abc123:page:0  ← user abc123's following feed
  seller:profile:adire-lagos     ← seller profile by slug
  products:list:page:0           ← product listing page 1
  data:categories                ← all categories
  feed:sellers:featured          ← top sellers sidebar
  creator:bypass:abc123          ← 30s bypass flag after creating content
```

---

## TTL (Time To Live) Reference

| TTL | Used For | Reasoning |
|-----|----------|-----------|
| 30 seconds | Creator bypass flag | Just long enough for their next page load |
| 2 minutes | Feed posts/products | Fresh enough, low enough DB load |
| 3 minutes | Seller profiles | Balance between freshness and load |
| 5 minutes | Featured sellers | Follower counts don't shift that fast |
| 1 hour | Categories | Almost never changes at runtime |

---

## Tech Stack

- **Redis provider:** [Upstash](https://upstash.com) — serverless Redis, pay per request, free tier available
- **SDK:** `@upstash/redis` — official Nuxt/Nitro compatible client
- **Helper:** `server/utils/cache.ts` — thin wrapper with `get`, `set`, `del`, `remember` helpers
- **Real-time complement:** Soketi (already integrated) — notifies clients when cache-busting-worthy events occur

---

## The `remember` Helper Pattern

Instead of writing cache logic inline everywhere, all endpoints use a `remember()` helper:

```ts
// Without cache (before)
const posts = await prisma.post.findMany({ ... })

// With cache (after)
const posts = await remember(
  'feed:posts:page:0',   // cache key
  120,                   // TTL in seconds
  () => prisma.post.findMany({ ... })  // fallback if cache miss
)
```

`remember()` internally:
1. Checks Redis for the key
2. If found → return cached value (fast path)
3. If not found → run the fallback function → store result in Redis → return result

---

## Cache Utility Location

```
server/
  utils/
    cache.ts          ← Redis client + remember() + del() helpers
```

---

## Soketi + Cache: How They Work Together

These two systems complement each other:

```
Cache  → handles LOAD (reduces DB queries)
Soketi → handles REAL-TIME (tells clients when to refresh)
```

Flow for a new post:
```
1. User creates post
2. Server writes to DB
3. Server deletes creator's personal cache key
4. Server emits Soketi event: channel=feed, event=new-post
5. All connected clients receive the event
6. Client shows "X new posts — click to refresh" banner
7. User clicks banner → client busts its local cache key on demand
8. Fresh feed loads with new post included
```

This is the **Facebook-style** approach for future implementation — the banner pattern means the feed never auto-reloads (jarring UX), users choose when to refresh.

---

## Future: Full Personalization (Level 2)

When ready to implement interest-based feeds, the cache key structure is already prepared for it:

```ts
// Current (shared)
const key = `feed:posts:page:${page}`

// Future (personalized)
const key = `feed:posts:user:${userId}:interests:${interestHash}:page:${page}`
```

The `interestHash` is a short hash of the user's top 3 category preferences, computed once and cached separately. This means users with the same interests share a cache key — you don't need millions of unique keys.

```
User A (likes Fashion, Thrift)      → key: feed:posts:cat:fashion-thrift:page:0
User B (also likes Fashion, Thrift) → same key ← shared ✅
User C (likes Luxury, Formal)       → key: feed:posts:cat:luxury-formal:page:0
```

This caps the number of unique feed cache keys to the number of **interest combinations**, not the number of users.

---

## Monitoring

Keys to watch in production:

| Metric | What it means | Action if bad |
|--------|--------------|---------------|
| Cache hit rate < 80% | TTLs too short or too many unique keys | Increase TTL or reduce key granularity |
| Redis memory > 80% | Too many keys stored | Add key eviction policy (`allkeys-lru`) |
| DB query time spikes | Cache stampede happening | Check for simultaneous invalidations |
| Upstash request count | How many Redis ops per day | Stays within free tier at moderate scale |
