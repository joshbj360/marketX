// USER LAYER - BACKEND IMPLEMENTATION PLAN

/\*\*

- PRIORITY LEVELS:
- 🔴 CRITICAL - Must have for MVP
- 🟡 HIGH - Should have soon
- 🟢 MEDIUM - Nice to have
- 🔵 LOW - Future enhancement
  \*/

// ==================== PHASE 1: CRITICAL (MVP) ====================

// 🔴 Profile Management
server/layers/user/api/
├── profile.get.ts ✅ EXISTING
├── profile.patch.ts ✅ EXISTING
├── profile-public.get.ts 🔴 NEW - GET /@[username]
└── profile-by-id.get.ts 🔴 NEW - GET /profile/[id]

// 🔴 Posts (Core Feature)
server/layers/user/api/posts/
├── index.get.ts 🔴 GET /api/user/posts (my posts)
├── index.post.ts 🔴 POST /api/user/posts (create)
├── [id].get.ts 🔴 GET /api/user/posts/[id]
├── [id].patch.ts 🔴 PATCH /api/user/posts/[id]
├── [id].delete.ts 🔴 DELETE /api/user/posts/[id]
└── public/
├── [username]/index.get.ts 🔴 GET /@[username]/posts
└── [username]/[id].get.ts 🔴 GET /@[username]/posts/[id]

// 🔴 Follow System
server/layers/user/api/follow/
├── [username].post.ts 🔴 POST /@[username]/follow
├── [username].delete.ts 🔴 DELETE /@[username]/follow
├── [username]/status.get.ts 🔴 GET /@[username]/follow-status
├── followers/index.get.ts 🔴 GET /profile/followers (my)
├── followers/[username].get.ts 🔴 GET /@[username]/followers
├── following/index.get.ts 🔴 GET /profile/following (my)
└── following/[username].get.ts 🔴 GET /@[username]/following

// 🔴 Post Likes
server/layers/user/api/posts/[id]/
├── like.post.ts 🔴 POST /api/user/posts/[id]/like
├── like.delete.ts 🔴 DELETE /api/user/posts/[id]/like
└── likes/index.get.ts 🔴 GET /api/user/posts/[id]/likes

// 🔴 Account Management (EXISTING)
server/layers/user/api/
├── account.delete.ts ✅ EXISTING
├── email.patch.ts ✅ EXISTING
├── password.patch.ts ✅ EXISTING
├── settings.get.ts ✅ EXISTING
└── settings.patch.ts ✅ EXISTING

---

// ==================== PHASE 2: HIGH PRIORITY ====================

// 🟡 Comments on Posts
server/layers/user/api/posts/[id]/comments/
├── index.get.ts 🟡 GET comments
├── index.post.ts 🟡 POST create comment
├── [commentId].patch.ts 🟡 PATCH edit comment
├── [commentId].delete.ts 🟡 DELETE comment
├── [commentId]/like.post.ts 🟡 POST like comment
└── [commentId]/like.delete.ts 🟡 DELETE unlike comment

// 🟡 Stories
server/layers/user/api/stories/
├── index.get.ts 🟡 GET my stories
├── index.post.ts 🟡 POST create story
├── [id].delete.ts 🟡 DELETE story
├── [id].get.ts 🟡 GET story details
├── public/
│ ├── [username]/index.get.ts 🟡 GET /@[username]/stories
│ └── [username]/[id].get.ts 🟡 GET view story

// 🟡 Share Posts
server/layers/user/api/posts/[id]/
├── share.post.ts 🟡 POST /api/user/posts/[id]/share
└── shares/index.get.ts 🟡 GET /api/user/posts/[id]/shares

// 🟡 Liked Posts
server/layers/user/api/
└── profile/likes.get.ts 🟡 GET /api/user/profile/likes

// 🟡 Notifications
server/layers/user/api/notifications/
├── index.get.ts 🟡 GET notifications
├── unread.get.ts 🟡 GET unread count
├── [id].patch.ts 🟡 PATCH mark as read
├── [id].delete.ts 🟡 DELETE notification
└── read-all.patch.ts 🟡 PATCH mark all as read

---

// ==================== PHASE 3: MEDIUM PRIORITY ====================

// 🟢 Blocking
server/layers/user/api/block/
├── [username].post.ts 🟢 POST block user
├── [username].delete.ts 🟢 DELETE unblock
└── index.get.ts 🟢 GET blocked users

// 🟢 Reporting
server/layers/user/api/report/
├── user/[username].post.ts 🟢 POST report user
├── posts/[id].post.ts 🟢 POST report post
└── comments/[id].post.ts 🟢 POST report comment

// 🟢 Search & Discovery
server/layers/user/api/
├── search.get.ts 🟢 GET /api/user/search?q=[query]
├── discover.get.ts 🟢 GET /api/user/discover
├── trending/posts.get.ts 🟢 GET /api/user/trending/posts
└── trending/creators.get.ts 🟢 GET /api/user/trending/creators

---

// ==================== PHASE 4: LOW PRIORITY ====================

// 🔵 Media Management
server/layers/user/api/media/
├── upload.post.ts 🔵 POST upload
├── [id].delete.ts 🔵 DELETE
└── index.get.ts 🔵 GET library

// 🔵 Analytics
server/layers/user/api/analytics/
├── posts.get.ts 🔵 GET post stats
├── followers.get.ts 🔵 GET follower growth
└── dashboard.get.ts 🔵 GET overall dashboard

// 🔵 Verification
server/layers/user/api/verification/
├── status.get.ts 🔵 GET status
└── request.post.ts 🔵 POST request verification

---

// ==================== DIRECTORY STRUCTURE ====================

server/layers/user/
├── api/
│ ├── profile.get.ts (✅ existing, update for auth)
│ ├── profile.patch.ts (✅ existing)
│ ├── profile-public.get.ts (🔴 NEW)
│ ├── profile-by-id.get.ts (🔴 NEW)
│ ├── account.delete.ts (✅ existing)
│ ├── email.patch.ts (✅ existing)
│ ├── password.patch.ts (✅ existing)
│ ├── settings.get.ts (✅ existing)
│ ├── settings.patch.ts (✅ existing)
│ │
│ ├── posts/
│ │ ├── index.get.ts (🔴 NEW)
│ │ ├── index.post.ts (🔴 NEW)
│ │ ├── [id].get.ts (🔴 NEW)
│ │ ├── [id].patch.ts (🔴 NEW)
│ │ ├── [id].delete.ts (🔴 NEW)
│ │ ├── [id]/
│ │ │ ├── like.post.ts (🔴 NEW)
│ │ │ ├── like.delete.ts (🔴 NEW)
│ │ │ ├── likes.get.ts (🔴 NEW)
│ │ │ ├── share.post.ts (🟡 NEW)
│ │ │ ├── shares.get.ts (🟡 NEW)
│ │ │ └── comments/
│ │ │ ├── index.get.ts (🟡 NEW)
│ │ │ ├── index.post.ts (🟡 NEW)
│ │ │ └── [id]/
│ │ │ ├── patch.ts (🟡 NEW)
│ │ │ ├── delete.ts (🟡 NEW)
│ │ │ ├── like.post.ts
│ │ │ └── like.delete.ts
│ │ └── public/
│ │ └── [@username]/
│ │ ├── index.get.ts
│ │ └── [id].get.ts
│ │
│ ├── follow/
│ │ ├── [@username].post.ts
│ │ ├── [@username].delete.ts
│ │ ├── [@username]/status.get.ts
│ │ ├── followers/
│ │ │ ├── index.get.ts
│ │ │ └── [@username].get.ts
│ │ └── following/
│ │ ├── index.get.ts
│ │ └── [@username].get.ts
│ │
│ ├── stories/
│ │ ├── index.get.ts (🟡 NEW)
│ │ ├── index.post.ts (🟡 NEW)
│ │ ├── [id].get.ts (🟡 NEW)
│ │ ├── [id].delete.ts (🟡 NEW)
│ │ └── public/
│ │ └── [@username]/
│ │ ├── index.get.ts
│ │ └── [id].get.ts
│ │
│ ├── notifications/
│ │ ├── index.get.ts (🟡 NEW)
│ │ ├── unread.get.ts (🟡 NEW)
│ │ ├── [id].patch.ts (🟡 NEW)
│ │ ├── [id].delete.ts (🟡 NEW)
│ │ └── read-all.patch.ts (🟡 NEW)
│ │
│ ├── block/ (🟢 NEW)
│ ├── report/ (🟢 NEW)
│ ├── search.get.ts (🟢 NEW)
│ ├── discover.get.ts (🟢 NEW)
│ ├── trending/ (🟢 NEW)
│ ├── media/ (🔵 NEW)
│ ├── analytics/ (🔵 NEW)
│ └── verification/ (🔵 NEW)
│
├── services/
│ ├── user.service.ts (update)
│ ├── post.service.ts (🔴 NEW)
│ ├── follow.service.ts (🔴 NEW)
│ ├── like.service.ts (🔴 NEW)
│ ├── comment.service.ts (🟡 NEW)
│ ├── story.service.ts (🟡 NEW)
│ ├── notification.service.ts (🟡 NEW)
│ ├── block.service.ts (🟢 NEW)
│ ├── report.service.ts (🟢 NEW)
│ └── search.service.ts (🟢 NEW)
│
├── repositories/
│ ├── user.repository.ts (update)
│ ├── post.repository.ts (🔴 NEW)
│ ├── follow.repository.ts (🔴 NEW)
│ ├── like.repository.ts (🔴 NEW)
│ └── ... (same pattern)
│
├── schemas/
│ ├── user.schema.ts (update)
│ ├── post.schema.ts (🔴 NEW)
│ ├── follow.schema.ts (🔴 NEW)
│ ├── comment.schema.ts (🟡 NEW)
│ └── ... (same pattern)
│
└── types/
├── user.types.ts (update)
├── post.types.ts (🔴 NEW)
├── follow.types.ts (🔴 NEW)
└── ... (same pattern)

---

// ==================== IMPLEMENTATION ORDER ====================

WEEK 1 (PHASE 1 - MVP):

1. Create Post service/repository/schema/types
2. Create Follow service/repository/schema/types
3. Create Like service/repository/schema/types
4. Implement all PHASE 1 endpoints

WEEK 2 (PHASE 2):

1. Create Comment service/repository/schema/types
2. Create Story service/repository/schema/types
3. Create Notification service/repository/schema/types
4. Implement all PHASE 2 endpoints

WEEK 3+ (PHASE 3 & 4):

- Implement remaining features as needed

---

// ==================== SUMMARY ====================

TOTAL ENDPOINTS:

- 🔴 CRITICAL (Phase 1): 24 endpoints
- 🟡 HIGH (Phase 2): 20 endpoints
- 🟢 MEDIUM (Phase 3): 15 endpoints
- 🔵 LOW (Phase 4): 12 endpoints

TOTAL = 71 endpoints

FOR MVP (Phase 1 + Phase 2):

- 44 endpoints
- 5 services
- 5 repositories
- 5 schema files
- 5 type files
