# ReelShop — Architecture & Engineering Reference

A full-stack social commerce platform built with **Nuxt 3**, **Prisma**, **PostgreSQL (Neon)**, and **Redis**.
Users post content, tag products, follow sellers, and buy directly from the feed.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Project Structure](#2-project-structure)
3. [Naming Conventions](#3-naming-conventions)
4. [Layered Architecture](#4-layered-architecture)
5. [Server Architecture](#5-server-architecture)
6. [Database Schema](#6-database-schema)
7. [Auth System](#7-auth-system)
8. [Caching Layer](#8-caching-layer)
9. [Job Queue System](#9-job-queue-system)
10. [Real-time (Soketi/Pusher)](#10-real-time)
11. [Payments & Shipping](#11-payments--shipping)
12. [Media Uploads (Cloudinary)](#12-media-uploads)
13. [API Conventions](#13-api-conventions)
14. [State Management (Pinia)](#14-state-management)
15. [SSR Safety Rules](#15-ssr-safety-rules)
16. [Internationalization](#16-internationalization)
17. [Performance Optimizations](#17-performance-optimizations)
18. [Environment Variables](#18-environment-variables)
19. [Scheduled Tasks (Cron)](#19-scheduled-tasks)
20. [Key Decisions & Trade-offs](#20-key-decisions--trade-offs)

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Nuxt 3 (Vue 3, Vite, Nitro) |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Cache | Upstash Redis (REST/HTTP) |
| Job Queue | BullMQ + standard Redis TCP (Redis Cloud) |
| Auth | JWT (access + refresh tokens) + Argon2 password hashing |
| Media | Cloudinary (images, video, audio) |
| Email | Resend |
| Payments | Paystack (primary), PayPal (stub) |
| Shipping | Shippo, SendBox |
| Real-time | Soketi (self-hosted Pusher-compatible) |
| CSS | TailwindCSS |
| State | Pinia + pinia-plugin-persistedstate |
| Validation | Zod |
| i18n | @nuxtjs/i18n v10 (7 languages) |

---

## 2. Project Structure

```
reelshop/
├── app/                        # App-level pages, layouts, components
│   ├── components/             # Shared UI components
│   ├── composables/            # App-level composables
│   ├── layouts/                # HomeLayout, StoreLayout + children
│   ├── pages/                  # App-level routes
│   ├── types/                  # Shared TypeScript types
│   └── utils/                  # Client utilities
├── layers/                     # Feature layers (Nuxt extends)
│   ├── AI/                     # AI chat integration
│   ├── base/                   # Auth, core services, base API client
│   ├── commerce/               # Products, cart, orders, wallet, shipping
│   ├── feed/                   # Feed algorithm, stories
│   ├── post/                   # Posts, comments, likes, shares
│   ├── profile/                # Profiles, chat, follow, notifications
│   ├── seller/                 # Seller dashboard, store management
│   └── post/                   # Post CRUD, modals, PostCard
├── server/                     # Nitro backend
│   ├── api/                    # HTTP route handlers (file-based)
│   ├── layers/                 # Server-side domain logic
│   │   ├── auth/               # Auth service + repository
│   │   ├── commerce/           # Product, cart, order, wallet
│   │   ├── feed/               # Feed service + utils
│   │   ├── posts/              # Post, story repositories & services
│   │   ├── profile/            # Profile, social, chat, notification
│   │   ├── seller/             # Store service + repository
│   │   └── shared/             # Audit, requireAuth middleware, helpers
│   ├── middleware/             # Global Nitro middleware
│   ├── plugins/                # Nitro plugins (run on boot)
│   ├── queues/                 # BullMQ queue producers + workers
│   ├── tasks/                  # Nitro scheduled tasks (cron)
│   └── utils/                  # Server utilities (db, cache, queue, auth)
├── prisma/
│   ├── schema.prisma           # Database schema (40+ models)
│   └── seed.ts                 # Demo data seeder
├── i18n/locales/               # Translation files (7 languages)
├── scripts/                    # Utility scripts (seed-shipping, etc.)
├── nuxt.config.ts              # Nuxt configuration
├── tailwind.config.ts          # TailwindCSS theme
└── .env                        # Environment variables
```

---

## 3. Naming Conventions

### Files

| Type | Convention | Example |
|---|---|---|
| Vue components | PascalCase | `PostCard.vue`, `CartSidebar.vue` |
| Composables | camelCase with `use` prefix | `usePost.ts`, `useCart.ts` |
| Pinia stores | camelCase with `.store.ts` | `post.store.ts`, `cart.store.ts` |
| API services (client) | camelCase with `.api.ts` | `post.api.ts`, `cart.api.ts` |
| Server repositories | camelCase with `.repository.ts` | `post.repository.ts` |
| Server services | camelCase with `.service.ts` | `post.service.ts` |
| Zod schemas | camelCase with `.schema.ts` | `post.schema.ts` |
| Server API routes | `[method].ts` suffix | `index.get.ts`, `index.post.ts` |
| Nitro tasks | camelCase | `processQueues.ts` |
| Queue files | domain + `.queue.ts` | `audit.queue.ts` |

### Variables & Functions

| Type | Convention | Example |
|---|---|---|
| Reactive state | camelCase ref/reactive | `const isLoading = ref(false)` |
| Store actions | camelCase verb | `setFollowStatus`, `appendToFeed` |
| API functions | camelCase verb+noun | `getHomeFeed`, `createPost` |
| Service methods | camelCase verb+noun | `createComment`, `deletePost` |
| Repository methods | camelCase verb+noun | `getPostById`, `createPostLike` |
| TypeScript interfaces | PascalCase with `I` prefix | `IPost`, `IFeedItem`, `ICartItem` |
| TypeScript types | PascalCase | `NotificationJob`, `AuditJob` |
| Enums | PascalCase | `OrderStatus`, `PaymentStatus` |
| DB field names | snake_case | `created_at`, `store_slug` |
| Prisma model names | PascalCase | `Post`, `SellerProfile`, `OrderItem` |

### Routes

```
GET    /api/posts                      → list
POST   /api/posts                      → create
GET    /api/posts/:id                  → get one
PATCH  /api/posts/:id                  → update
DELETE /api/posts/:id                  → delete
POST   /api/posts/:id/like             → nested action
DELETE /api/posts/:id/like             → nested action
GET    /api/posts/:id/comments         → nested list
```

---

## 4. Layered Architecture

Nuxt 3 **extends** lets each feature be a self-contained layer with its own pages, components, composables, stores, and services. The main `nuxt.config.ts` merges them all.

### Layer Load Order

```typescript
// nuxt.config.ts
extends: [
  './layers/AI',       // AI chat
  './layers/base',     // Auth, core API client, media upload
  './layers/feed',     // Feed algorithm, stories
  './layers/seller',   // Seller dashboard, store management
  './layers/profile',  // User profiles, chat, follow, notifications
  './layers/commerce', // Cart, orders, wallet, shipping, products
  './layers/post',     // Posts, comments, likes, modals
]
```

Later layers override earlier ones when file paths collide. Place shared/foundational code in `base`.

### What Each Layer Contains

```
layers/<name>/
  app/
    components/      # Vue components auto-imported
    composables/     # useXxx() composables auto-imported
    pages/           # Routes (merged with file-based router)
    services/        # Client-side API wrappers
    stores/          # Pinia stores
    types/           # TypeScript interfaces
  nuxt.config.ts     # Layer-specific config (rarely needed)
```

### Layer Dependency Rules

- `base` has no dependencies on other layers
- All other layers may depend on `base`
- Layers should NOT import from each other (use events or stores instead)
- Server-side layers (`server/layers/`) mirror the same domain separation

---

## 5. Server Architecture

### Request Flow

```
HTTP Request
  → server/middleware/auth.global.ts   (attaches user to event.context)
  → server/api/[domain]/file.method.ts (route handler)
      → requireAuth(event)             (throws 401 if needed)
      → server/layers/[domain]/services/[name].service.ts
          → server/layers/[domain]/repositories/[name].repository.ts
              → Prisma (PostgreSQL)
          → auditQueue.enqueue(...)    (fire-and-forget)
          → notificationQueue.enqueue(...) (fire-and-forget)
      → return { success: true, data: ... }
```

### Auth Middleware — PASSIVE

`server/middleware/auth.global.ts` runs on every request but **never blocks**. It only decodes the JWT and attaches:

```typescript
event.context.auth = { user: { userId: string } }
```

To protect a route, explicitly call `requireAuth(event)` at the top of the handler:

```typescript
// server/layers/shared/middleware/requireAuth.ts
export function requireAuth(event: H3Event) {
  const user = event.context.auth?.user
  if (!user?.userId) throw createError({ statusCode: 401, message: 'Unauthorized' })
  return user  // returns { id: string } — NOTE: field is `id`, not `userId`
}
```

### Service / Repository Pattern

Every domain follows this separation:

```
Route handler    → validates input (Zod), calls service, returns HTTP response
Service          → business logic, orchestration, throws UserError
Repository       → raw Prisma queries, no business logic
```

```typescript
// Route handler
export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const data = await readBody(event)
  const result = await contentService.createPost(user.id, data, ...)
  return { success: true, data: result }
})

// Service
async createPost(userId, data, ipAddress, userAgent) {
  const validated = createPostSchema.parse(data)  // throws ZodError → 400
  const post = await postRepository.createPost(userId, validated)
  auditQueue.enqueue({ ... })  // fire-and-forget
  return post
}

// Repository
async createPost(userId, data) {
  return prisma.post.create({
    data: { authorId: userId, ...data, media: { create: data.mediaData } }
  })
}
```

### Error Types

```typescript
// UserError — domain errors (404, 403, 400)
throw new UserError('POST_NOT_FOUND', 'Post not found', 404)

// createError — Nitro/H3 HTTP errors
throw createError({ statusCode: 401, message: 'Unauthorized' })

// ZodError — automatically caught and returns 400
```

---

## 6. Database Schema

### Key Models

| Model | Purpose |
|---|---|
| `Profile` | User account (auth, avatar, bio) |
| `SellerProfile` | Store/seller (slug, logo, ship-from address) |
| `Products` | Sellable items (price, status, variants) |
| `ProductVariant` | Size/color/SKU variants (stock, price) |
| `Orders` | Customer purchases (payment, shipping, status) |
| `OrderItem` | Line items (variant, qty, price at time of order) |
| `CartItem` | Shopping cart (userId + variantId unique) |
| `Post` | Social posts (caption, visibility, media) |
| `Media` | Files (url, type, isBgMusic flag) |
| `Comment` | Threaded comments (parentId for replies) |
| `PostLike` | Post reactions (composite PK: userId + postId) |
| `Follow` | Follow graph (followingType: USER/SELLER) |
| `Notification` | In-app notifications (read, type, actorId) |
| `Story` | Ephemeral stories (expiresAt) |
| `Conversation` | Chat threads (participant1 + participant2/seller) |
| `Message` | Chat messages (isAiResponse flag) |
| `SellerWallet` | Seller earnings (balance, pending_balance) |
| `GlobalShippingZone` | Platform-level shipping rates |
| `AuditLog` | Security audit trail |
| `Session` | Auth sessions (refreshToken, device, IP) |

### Enums

```prisma
enum ProductStatus  { DRAFT PUBLISHED ARCHIVED }
enum MediaType      { IMAGE VIDEO AUDIO }
enum OrderStatus    { PENDING CONFIRMED COMPLETED CANCELLED PAID SHIPPED DELIVERED RETURNED }
enum PaymentStatus  { UNPAID PENDING PAID FAILED REFUNDED }
enum NotificationType { ORDER REVIEW PRODUCT GENERAL NEW_COMMENT COMMENT_LIKE REPLY PRODUCT_SHARE NEW_FOLLOWER NEW_POST POST_LIKE }
enum VisibilityType { PUBLIC PRIVATE FOLLOWERS }
```

### DB Client Setup

`server/utils/db.ts` — Single Prisma instance per process using `pg.Pool`:

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
})

// Required: prevents uncaughtException when Neon auto-suspends idle connections
pool.on('error', (err) => console.warn('[db] pg pool error:', err.message))
```

> **Why `pg.Pool` and not Neon serverless driver?**
> Neon's `@neondatabase/serverless` uses HTTP/WebSocket and doesn't read `DATABASE_URL` in the same way during Nitro's module loading phase. `pg.Pool` + `keepAlive` is reliable with Neon's free tier auto-suspend behavior.

---

## 7. Auth System

### Token Flow

```
Register/Login → server returns { accessToken, refreshToken }
Client stores:
  - accessToken  → memory (authStore.accessToken)
  - refreshToken → httpOnly cookie (set by server)

Every API request → BaseApiClient injects Authorization: Bearer <accessToken>
accessToken expires → client calls /api/auth/refresh-token
  → server validates refreshToken cookie
  → issues new accessToken + rotates refreshToken
```

### JWT Payload

```typescript
{ userId: string, email: string, iat: number, exp: number }
```

### Password Security

- Argon2id hashing (not bcrypt)
- `FailedLoginAttempt` table — brute force protection with lockout
- `PasswordResetToken` — single-use, expires in 1 hour

### Session Management

`Session` model tracks all active sessions:

```typescript
{ refreshToken, ip, userAgent, device, country, expiresAt, lastUsedAt, revokedAt }
```

Logout revokes the session. `revokedAt` is set, future refresh attempts fail.

### Client-Side Auth Header

```typescript
// layers/base/app/services/base.api.ts
// Only inject on client — never on server (would cause SSR → server hang)
if (import.meta.client) {
  const token = authStore.accessToken || localStorage.getItem('accessToken')
  if (token) headers['Authorization'] = `Bearer ${token}`
}
```

---

## 8. Caching Layer

`server/utils/cache.ts` uses **Upstash Redis** (REST-based, works in serverless).

### Usage

```typescript
import { remember, forget } from '~/server/utils/cache'

// Cache for 60 seconds
const data = await remember('cache:key', 60, async () => {
  return await expensiveQuery()
})

// Invalidate
await forget('cache:key')
```

### What Is Cached

| Endpoint | TTL | Stale-While-Revalidate |
|---|---|---|
| `/api/feed/home` | 60s | 120s |
| `/api/feed/discover` | 60s | 120s |
| `/api/commerce/categories` | 600s | 3600s |
| `/api/seller/featured` | 120s | 300s |

### Cache Key Format

```
feed:home:page:{page}:limit:{limit}
feed:discover:page:{page}:limit:{limit}
data:categories
feed:sellers:featured:page:{page}:limit:{limit}
```

> Creators (authenticated users posting) bypass the feed cache so their own content appears immediately.

---

## 9. Job Queue System

Three BullMQ queues, each with its own Redis-backed queue and in-process worker.

### Why BullMQ (not inline)

Inline `await service.doSomething()` inside a route adds latency the user waits for. Queued jobs run after the response is sent:

- Audit logging: was 20ms per request → now 1ms
- Notifications: was 30ms per request → now 1ms
- Emails: was 200ms+ per request → now 1ms

### Architecture

```
server/utils/queue.ts          → exports queueConnection (ConnectionOptions | null)
server/queues/audit.queue.ts   → auditQueue.enqueue() + startAuditWorker()
server/queues/notification.queue.ts → notificationQueue.enqueue() + startNotificationWorker()
server/queues/email.queue.ts   → emailQueue.enqueue() + startEmailWorker()
server/plugins/workers.ts      → starts all workers on Nitro boot
```

### Producer (call from any service)

```typescript
// Fire-and-forget — NEVER await
auditQueue.enqueue({
  userId,
  action: 'POST_CREATED',
  resource: 'Post',
  resourceId: post.id,
  ipAddress,
  userAgent,
})
```

### Two Redis Instances

| Instance | Library | Purpose |
|---|---|---|
| Upstash Redis | `@upstash/redis` (REST/HTTP) | Caching (`remember()`) |
| Redis Cloud / Railway | `ioredis` (TCP) | BullMQ job queues |

> BullMQ requires a **standard TCP Redis connection** (ioredis). Upstash only exposes a REST API — BullMQ cannot use it.

### Worker Configuration

| Queue | Concurrency | Backoff | Use |
|---|---|---|---|
| audit | 10 | exponential 2s | DB writes (fast) |
| notification | 20 | exponential 2s | DB writes (very fast) |
| email | 5 | exponential 5s | Resend API (rate limited) |

### Fallback (no QUEUE_REDIS_URL)

If `QUEUE_REDIS_URL` is not set, jobs run inline synchronously. No jobs are lost — behavior is identical, just slower:

```typescript
} else {
  auditService.logUserAction(data).catch((e) => console.error(...))
}
```

### Eviction Policy

BullMQ requires Redis eviction policy set to **`noeviction`**. With `volatile-lru`, Redis can evict queued jobs under memory pressure. Set this in your Redis provider dashboard.

---

## 10. Real-time

**Soketi** — self-hosted Pusher-compatible WebSocket server.

### Server-side (emit events)

```typescript
import { pusher } from '~/server/utils/pusher'

await pusher.trigger(`user-${userId}`, 'new-message', { message })
```

### Client-side (subscribe)

```typescript
const { $pusher } = useNuxtApp()
const channel = $pusher.subscribe(`user-${userId}`)
channel.bind('new-message', (data) => { ... })
```

### Channels

- `user-{userId}` — private user notifications, messages
- `store-{storeSlug}` — seller order updates
- `post-{postId}` — live comment/like updates

---

## 11. Payments & Shipping

### Paystack Flow

```
POST /api/commerce/payments/initialize
  → paystack.initializeTransaction({ email, amount, reference })
  → returns { authorization_url }  → redirect user

User pays on Paystack hosted page
  → Paystack redirects to /success?reference=xxx
  → POST /api/commerce/payments/verify
      → paystack.verifyTransaction(reference)
      → if paid: update Order.paymentStatus = PAID
               update seller wallet
               create notifications
               enqueue confirmation email
```

### Webhook (backup verification)

`POST /api/commerce/payments/webhook` — Paystack posts events here. Handles `charge.success` to mark orders paid in case the redirect fails.

### Shipping

Two providers integrated:

| Provider | Use |
|---|---|
| **Shippo** | International + US domestic |
| **SendBox** | Nigeria domestic |

`server/utils/shipping/index.ts` orchestrates both — routes to the correct provider based on destination.

`GlobalShippingZone` table stores platform-level rates (8 zones seeded via `scripts/seed-shipping.mjs`).

### Commission

`server/utils/fees.ts` calculates the platform cut and affiliate cut per order. `PLATFORM_COMMISSION_RATE` is set in `.env`.

---

## 12. Media Uploads

All media goes through Cloudinary. The flow is:

```
Client → POST /api/media/upload (multipart form)
  → server streams to Cloudinary (signed upload)
  → returns { url, public_id, type }

Client stores url + public_id, attaches to post/product creation payload
```

### Media Model

```prisma
model Media {
  id         String    @id @default(uuid())
  url        String
  type       MediaType  // IMAGE | VIDEO | AUDIO
  public_id  String
  isBgMusic  Boolean   @default(false)  // distinguishes background music from content
  postId     String?
  productId  Int?
  authorId   String?
  sellerId   String?
}
```

### Multiple Media on Posts

Posts support up to 10 images/videos plus optional background music:

```typescript
interface ICreatePostData {
  caption?: string
  contentType: string
  visibility: string
  mediaData: Array<{ url: string; public_id: string; type: string }>
  musicData?: { url: string; public_id: string; type: string }
}
```

`isBgMusic = true` distinguishes the audio track from content files.

---

## 13. API Conventions

### Response Format

All endpoints return:

```typescript
// Single resource
{ success: true, data: T }

// Paginated list
{ success: true, data: T[], meta: { total, limit, offset, hasMore } }

// Error
{ statusCode: number, message: string }
```

### Pagination

```typescript
// Query params: ?limit=20&offset=0
// Response meta:
{ total: number, limit: number, offset: number, hasMore: boolean }
```

### Client — BaseApiClient

`layers/base/app/services/base.api.ts`

```typescript
const result = await BaseApiClient.request<{ data: Post[] }>('/api/posts')
// result is the raw JSON — caller must extract .data
const posts = result.data
```

Auth header is injected automatically on client-side (`import.meta.client` guard prevents SSR hangs).

### Cache-Control Headers

Added manually on cacheable endpoints:

```typescript
setHeader(event, 'Cache-Control', 'public, max-age=60, stale-while-revalidate=120')
```

---

## 14. State Management

All state lives in **Pinia** stores, organized by domain.

### Store Locations

| Domain | Store | Persisted |
|---|---|---|
| Auth | `layers/base/app/stores/auth.store.ts` | Yes (token) |
| Post | `layers/post/app/store/post.store.ts` | No |
| Comment | `layers/post/app/store/comment.store.ts` | No |
| Feed | `layers/feed/app/stores/feed.stores.ts` | No |
| Profile | `layers/profile/app/stores/profile.store.ts` | No |
| Follow | `layers/profile/app/stores/follow.store.ts` | No |
| Chat | `layers/profile/app/stores/chat.store.ts` | No |
| Notification | `layers/profile/app/stores/notification.store.ts` | No |
| Cart | `layers/commerce/app/stores/cart.store.ts` | Yes (cartItems) |
| Product | `layers/commerce/app/stores/product.store.ts` | No |
| Seller | `layers/seller/app/store/seller.store.ts` | No |

### Key Post Store State

```typescript
likedPostIds: Set<string>    // Set for O(1) lookup
savedPostIds: string[]       // Bookmarked posts
userPosts: Map<string, Post[]>  // Keyed by userId
```

### Follow Store

```typescript
// followStatus keyed by userId OR username (batch check populates both)
followStatus: Record<string, boolean>
```

---

## 15. SSR Safety Rules

Nuxt renders pages on the server first, then hydrates on the client. Certain patterns break SSR:

### DO NOT

```typescript
// ❌ Runs during SSR — causes server-to-server fetch hang
watch(someRef, fetchData, { immediate: true })

// ❌ window/document not available on server
const width = window.innerWidth

// ❌ Auth header injection during SSR causes server loops
const token = authStore.accessToken
headers['Authorization'] = `Bearer ${token}`
```

### DO

```typescript
// ✅ Only runs on client
onMounted(() => { fetchData() })

// ✅ Client-only composable
if (import.meta.client) { ... }

// ✅ useLazyAsyncData with server: false
const { data } = useLazyAsyncData('key', () => fetchData(), {
  server: false,
  dedupe: 'defer',  // prevents duplicate calls from cancelling each other
})
```

### `dedupe: 'defer'` Rule

When multiple components call the same `useLazyAsyncData` key simultaneously, the default `dedupe: 'cancel'` cancels and restarts each time — causing 3-5× duplicate API calls. Use `dedupe: 'defer'` so the first call completes and subsequent callers wait for it.

---

## 16. Internationalization

7 languages supported via `@nuxtjs/i18n` v10.

### Config

```typescript
// nuxt.config.ts
i18n: {
  defaultLocale: 'en',
  langDir: 'i18n/locales/',
  lazy: true,          // Only load the user's locale (not all 7)
  strategy: 'no_prefix', // URLs don't change — locale in cookie
  locales: [
    { code: 'en', file: 'en.json' },
    { code: 'fr', file: 'fr.json' },
    { code: 'es', file: 'es.json' },
    { code: 'de', file: 'de.json' },
    { code: 'pt', file: 'pt.json' },
    { code: 'zh', file: 'zh.json' },
    { code: 'ar', file: 'ar.json', dir: 'rtl' },
  ],
}
```

### Usage

```vue
<script setup>
const { t } = useI18n()
</script>

<template>
  <span>{{ $t('nav.home') }}</span>
  <span>{{ t('post.like') }}</span>
</template>
```

### Locale Switcher

`app/components/LanguageSwitcher.vue` — dropdown in the right sidebar footer.

---

## 17. Performance Optimizations

### Build

- `nitro.compressPublicAssets: true` — gzip static assets
- `nitro.minify: true` — minify server output
- `vite.build.rollupOptions.manualChunks` — separate vendor bundles:
  - `vendor-vue`: vue, vue-router, pinia
  - `vendor-ui`: @vueuse/core

### Code Splitting

All modals are lazy-loaded with `defineAsyncComponent` — they only download when opened:

```typescript
const CreateModal = defineAsyncComponent(() =>
  import('~/components/modals/CreateModal.vue')
)
```

### API Response Size

`productFeedInclude` (slim Prisma select for feed cards) vs `productInclude` (full for detail pages):

```typescript
// Feed cards — minimal data
const productFeedInclude = {
  media: { take: 1, select: { url: true, type: true } },
  variants: { take: 1, select: { id: true, size: true, stock: true, price: true } },
}

// Detail pages — full data
const productInclude = {
  media: true, variants: true, categories: true, tags: true, offers: true, ...
}
```

### Feed Caching

Home and discover feeds are cached in Upstash Redis:
- First request: ~800ms (DB query)
- Cached requests: ~50ms (Redis read)

### Batch Follow Status

Instead of each `FollowButton` making its own API call on mount:

```typescript
// After feed loads, batch check all author follow statuses in one request
const authorIds = feedItems.map(item => item.author.id)
await checkFollowingBatch(authorIds, 'USER', idToUsernameMap)
```

### IntersectionObserver for Infinite Scroll

```typescript
// Observer target is inside v-else — not in DOM at onMounted
// Use watch instead of direct observe call
watch(loadMoreTrigger, (el) => {
  if (el) observer.value?.observe(el)
})
```

---

## 18. Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Cache (Upstash Redis — REST/HTTP)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Job Queues (Standard Redis TCP — NOT Upstash)
QUEUE_REDIS_URL=redis://default:pass@host:port

# Auth
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
CLOUDINARY_UPLOAD_PRESET=xxx

# Email
RESEND_API_KEY=re_xxx
SENDER_EMAIL=noreply@reelshop.com

# Payments
PAYSTACK_SECRET_KEY=sk_xxx
PAYSTACK_PUBLIC_KEY=pk_xxx
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx

# Shipping
SHIPPO_API_KEY=xxx
SHIPPO_WEBHOOK_SECRET=xxx
SENDBOX_API_KEY=xxx
SENDBOX_WEBHOOK_SECRET=xxx

# Real-time (Soketi)
SOKETI_APP_ID=1
SOKETI_KEY=app-key
SOKETI_SECRET=app-secret
SOKETI_HOST=127.0.0.1
SOKETI_PORT=6001
SOKETI_USE_TLS=false

# AI
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
GROK_API_KEY=xxx
GOOGLE_API_KEY=xxx

# Platform
PLATFORM_COMMISSION_RATE=0.10
NUXT_PUBLIC_SITE_NAME=ReelShop
NUXT_PUBLIC_BASE_URL=https://reelshop.com
```

---

## 19. Scheduled Tasks

Nitro tasks (configured in `nuxt.config.ts`):

```typescript
nitro: {
  experimental: { tasks: true },
  scheduledTasks: {
    '* * * * *':   ['processQueues'],        // Every minute
    '0 */6 * * *': ['releaseShippedOrders'], // Every 6 hours
  }
}
```

### processQueues (`server/tasks/processQueues.ts`)

Health-check stub. BullMQ workers (started via `server/plugins/workers.ts`) process jobs in real-time — no manual draining needed.

### releaseShippedOrders (`server/tasks/releaseShippedOrders.ts`)

Auto-releases held funds to seller wallets for orders that have been in `SHIPPED` status for 7+ days without a dispute.

---

## 20. Key Decisions & Trade-offs

### Why Layered Architecture?

Features are large enough to warrant isolation. A `post` page shouldn't import from `commerce` internals. Layers enforce domain boundaries and let teams work independently.

### Why `pg.Pool` over Neon Serverless Driver?

Neon's `@neondatabase/serverless` driver reads the connection string differently during Nitro's server module loading phase — caused "user not found" errors defaulting to the OS username. `pg.Pool` with `keepAlive` is reliable with Neon's TCP endpoint.

### Why Two Redis Instances?

- **Upstash** (REST/HTTP) — works in serverless/edge, no persistent TCP connection. Only for caching.
- **Redis Cloud** (TCP) — BullMQ requires ioredis which needs a persistent TCP connection. Upstash REST API is incompatible with BullMQ.

### Why BullMQ over a Simple In-Memory Queue?

In-memory queues lose jobs on server restart. BullMQ persists jobs in Redis with retries, stalled job recovery, and a dead-letter set. Critical for audit trails and transactional emails.

### Why Passive Auth Middleware?

Blocking all unauthenticated requests in middleware would prevent public pages (feed, product detail, store profiles) from loading. Passive middleware lets public routes work while protected routes explicitly call `requireAuth(event)`.

### Why `dedupe: 'defer'` in useLazyAsyncData?

The default `dedupe: 'cancel'` cancels in-flight requests when a new caller appears, which triggers a fresh fetch — causing exponential duplicate calls when 3+ components share a key. `defer` queues additional callers to wait for the existing request to resolve.

### Why Fire-and-Forget for Audit/Notifications?

`await auditService.logUserAction()` added 20-50ms to every mutating request. Audit logs are non-critical for the HTTP response. `notificationQueue.enqueue()` drops latency to 1ms and makes the notification system failure-isolated from the main request.

---

*Last updated: March 2026*
