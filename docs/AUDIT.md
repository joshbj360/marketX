# ReelShop Audit Playbook

This document is the practical audit guide for this codebase.

The goal is not to read every file in isolation. The goal is to prove that each important user and business flow works correctly, fails safely, and is test-covered at the right level.

This repo is a layered Nuxt application with server APIs, Prisma-backed data, background queues, and external integrations for payments, shipping, email, auth, and AI-assisted content. That architecture means the real risk is in cross-layer behavior, not in any single component.

## Audit Principles

Use these rules throughout the audit:

- Audit by flow, not by file.
- Prioritize money, auth, permissions, and state transitions before UI polish.
- Verify both happy paths and failure paths.
- Prefer evidence over confidence. A flow is not "done" until it has reproducible checks.
- Add tests around existing behavior before large refactors in risky areas.
- Treat AI-generated code as untrusted until validated by tests and ownership checks.

## Repo Reality Check

From a quick inventory, this repo currently has:

- Nuxt app layers under `layers/ai`, `layers/commerce`, `layers/core`, `layers/feed`, `layers/map`, `layers/profile`, `layers/seller`, and `layers/social`
- shared server infrastructure under `server/`
- Prisma schema and seed data under `prisma/`
- queue-backed side effects for audit, email, and notifications
- external integrations for Paystack, PayPal, Shippo, Sendbox, Resend, Pusher/Soketi, Redis, and Neon/Postgres
- very light automated test coverage today

That means the audit should start with high-risk flows and build confidence outward.

## What Counts As A Flow

A flow is one end-to-end behavior with a clear business outcome.

Each flow usually spans:

1. page or component
2. client composable/store/service
3. API route
4. server service/repository
5. Prisma writes/reads
6. queue, email, webhook, or third-party side effect

Examples:

- guest adds item to cart and checks out with OTP
- user registers and becomes a seller
- seller creates a product
- buyer pays for an order
- payment webhook updates order state
- seller fulfills and ships an order

## Audit Order

Audit in this order unless a live incident changes priorities.

### P0: Must Audit First

- auth and session lifecycle
- checkout OTP flow
- cart to order creation
- payment initialization and verification
- payment webhook handling
- seller registration and seller-only access
- product create/edit/delete ownership checks
- order status transitions
- shipping quote and shipment creation

### P1: Audit Next

- buyer order history and receipt confirmation
- notifications and unread counts
- messages and conversation permissions
- social posting, comments, likes, and story actions
- AI listing generation and enhancement endpoints
- audit log coverage for sensitive actions

### P2: Audit After Core Paths Are Stable

- search and discovery relevance
- feed/view tracking
- SEO/meta behavior
- caching correctness
- non-critical background jobs and cron tasks
- visual/UI consistency issues

## Flow Inventory Template

Create one row per flow and track it like a testable work item.

Use this table structure:

| Flow | Entry Route/Page | API Routes | Auth | External Systems | DB Writes | Queue/Async | Risk | Test Status | Audit Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| Guest checkout OTP | `layers/commerce/app/pages/checkout.vue` | `/api/auth/checkout-otp/send`, `/api/auth/checkout-otp/verify` | public -> authenticated | email/OTP store | user/session/cart merge | possible email/audit | P0 | missing | not started | verify expiry, replay, cart merge |

Recommended `Audit Status` values:

- not started
- in progress
- passed with evidence
- bug found
- blocked by environment
- needs refactor before trust

## First-Pass Flow Inventory For This Repo

Start with this backlog and expand it as you inspect more routes.

### Auth And Identity

- register user
- login with email/password
- logout
- refresh session / restore session
- verify email
- resend verification email
- forgot/reset password
- social auth redirect/callback
- checkout OTP send
- checkout OTP verify
- seller registration

Primary code areas:

- `layers/core/app/composables/useAuth.ts`
- `layers/core/app/services/auth.api.ts`
- `layers/core/app/plugins/auth-init.ts`
- `server/middleware/auth.global.ts`
- `server/layers/shared/middleware/requireAuth.ts`
- `server/utils/auth/*`
- `layers/core/server/api/auth/*`
- `server/api/auth/*`

### Commerce

- browse products
- view product details
- add to cart
- update cart quantity
- remove from cart
- merge guest cart into authenticated cart
- create order
- view buyer orders
- cancel order
- confirm receipt
- initialize Paystack payment
- verify Paystack payment
- create PayPal payment
- capture PayPal payment
- handle payment webhook

Primary code areas:

- `layers/commerce/app/pages/checkout.vue`
- `layers/commerce/app/composables/useCart.ts`
- `layers/commerce/app/composables/useOrder.ts`
- `layers/commerce/app/services/*.api.ts`
- `layers/commerce/server/api/commerce/cart/*`
- `layers/commerce/server/api/commerce/orders/*`
- `layers/commerce/server/api/commerce/payments/*`
- `server/utils/paystack.ts`
- `server/utils/paypal.ts`
- `server/utils/fees.ts`

### Seller

- create seller/store
- access seller dashboard
- create product
- edit product
- delete/archive product
- view seller orders
- update seller order status
- manage store settings

Primary code areas:

- `layers/seller/app/pages/sellers/create.vue`
- `layers/seller/app/pages/seller/[storeSlug]/products/create.vue`
- `layers/seller/app/pages/seller/[storeSlug]/products/[id]/edit.vue`
- `layers/seller/app/pages/seller/[storeSlug]/orders.vue`
- `layers/core/server/api/auth/register-seller.post.ts`
- `layers/commerce/server/api/commerce/products/*`
- seller-facing server services/repositories in `layers/seller/server/` and `layers/commerce/server/`

### Shipping

- fetch shipping rates
- select shipping option
- create shipment
- track shipment status
- receive shipping webhook

Primary code areas:

- `layers/commerce/app/composables/useShipping.ts`
- `layers/commerce/server/api/commerce/shipping/*`
- `server/utils/shipping/index.ts`
- `server/utils/shipping/sendbox.ts`
- `server/utils/shipping/shippo.ts`

### Social / Profile / Messaging

- create post
- edit/delete own post
- like/unlike post
- comment on post
- story creation/deletion
- notification read/unread
- messages and conversation access

Primary code areas:

- `layers/social/server/api/posts/*`
- `layers/social/server/services/*`
- `server/api/shared/notifications/*`
- `layers/profile/app/pages/messages/*`

### AI

- generate listing
- enhance description

Primary code areas:

- `layers/ai/server/api/ai/generate-listing.post.ts`
- `layers/ai/server/api/ai/enhance-description.post.ts`
- `layers/core/app/services/ai.api.ts`

Audit these for prompt injection exposure, cost control, validation, moderation, timeout handling, and output sanitization.

## Per-Flow Audit Checklist

Run this checklist for every P0 and P1 flow.

### 1. Entry Point

- Is the route/page discoverable and linked correctly?
- Does protected UI rely only on client-side gating?
- Can the flow be triggered twice by double-click or refresh?
- Are loading, disabled, and retry states present?

### 2. Client Behavior

- Does the composable/store call the correct endpoint?
- Are auth headers and tokens used correctly?
- Are local optimistic updates reversible on failure?
- Does stale client state create wrong behavior after login/logout?
- Are query params, redirect params, and route params validated?

### 3. API Contract

- Is input validated server-side?
- Are method and route semantics correct?
- Are unsafe defaults accepted silently?
- Are errors consistent and safe to expose?
- Does the handler call `requireAuth(event)` where needed?

### 4. Authorization

- Can a user access another user's resource by changing an ID or slug?
- Can a buyer perform seller-only actions?
- Can a seller mutate another seller's product or order?
- Are admin-only or internal endpoints accidentally public?

### 5. Business Logic

- Are totals, fees, currency, stock, and status transitions correct?
- Are duplicate requests idempotent or safely rejected?
- Are order and payment states impossible to corrupt through retries?
- Are deletes soft/hard as intended?
- Are partial failures handled explicitly?

### 6. Persistence

- Are the expected Prisma writes happening exactly once?
- Are transactions needed but missing?
- Are relations loaded/updated consistently?
- Can stale reads or race conditions break this flow?

### 7. Background Work

- Does the flow enqueue audit, notification, or email jobs correctly?
- If Redis is unavailable, does inline fallback preserve correctness?
- If the queue fails, is the main request still safe?
- Is job retry behavior safe for duplicate delivery?

### 8. External Integrations

- Is provider input validated before sending?
- Are secrets and runtime config used safely?
- Is webhook authenticity verified?
- What happens on timeout, 4xx, 5xx, or duplicate callback?
- Are provider IDs stored for reconciliation?

### 9. Security

- Are CSRF protections correct for cookie-based flows?
- Are tokens leaked into logs or URLs?
- Are user-controlled strings sanitized before render or persistence?
- Are rate limits present for auth and abuse-prone endpoints?
- Are sensitive actions recorded in audit logs?

### 10. Observability

- Can you tell when this flow fails in production?
- Is there structured logging with correlation IDs or enough context?
- Do audit logs record who did what, to which resource, and when?
- Are failures in external providers visible somewhere actionable?

## Test Pyramid For This Repo

Do not jump straight to browser E2E for everything. Use the cheapest reliable layer first.

### 1. Unit Tests

Use for:

- fee calculations
- formatting/parsing helpers
- auth utilities
- pure validation logic
- state transition helpers

Good targets:

- `server/utils/fees.ts`
- `server/utils/auth/passwordValidator.ts`
- `server/utils/security/*`
- pure helpers in shipping/payment layers

### 2. Service Tests

Use for business logic that can be exercised without the browser.

Examples:

- order creation rules
- seller ownership enforcement
- inventory/variant checks
- shipment selection logic
- audit logging trigger expectations

These usually sit around server services/repositories with controlled fixtures.

### 3. API Integration Tests

This should be the main investment for P0 flows.

Each critical endpoint should have tests for:

- success path
- invalid input
- unauthenticated access
- unauthorized access
- not found
- duplicate submission / replay
- third-party failure mapping
- DB side effects

Top candidates:

- auth routes
- checkout OTP routes
- cart routes
- order routes
- payment verify/webhook routes
- seller product CRUD routes

### 4. Browser E2E Tests

Keep these focused on a small number of critical user journeys.

Recommended first E2E scenarios:

- login and redirect to protected page
- guest checkout OTP to authenticated checkout continuation
- successful order placement
- payment return flow
- seller creates product
- seller edits product
- protected seller route rejects non-seller access

## Failure Modes To Hunt Aggressively

AI-generated code often looks complete while hiding edge-case breaks. Hunt these first:

- endpoint missing `requireAuth(event)`
- ownership check done in UI but not in API
- duplicate order/payment creation from retry or refresh
- webhook updates accepted without signature/verification
- cart merge that drops or duplicates items
- status transitions that skip required states
- race conditions around stock/order confirmation
- inconsistent currency handling between client and server
- silent catch blocks that hide real failures
- queue fallback behavior that changes semantics
- optimistic UI that never rolls back
- stale auth store after refresh/logout
- HTML/AI content rendered without sanitization

## Evidence Standard

A flow is only considered audited when it has at least one of the following:

- automated test coverage with meaningful assertions
- a documented manual test with exact steps and observed result
- code references proving auth, validation, and side effects were checked
- a recorded bug ticket with reproduction and impact

Avoid marking a flow complete based only on reading code.

## Manual Test Script Template

Use this for any flow that is not yet automated.

### Flow

`<name>`

### Preconditions

- user/account state
- required seed data
- env vars and providers available

### Steps

1. open `<page>`
2. perform `<action>`
3. submit `<form/button>`
4. inspect `<UI/API/DB/log>`

### Expected Result

- UI result
- API result
- DB side effect
- queue/email/webhook side effect

### Failure Cases Also Checked

- invalid input
- retry/double submit
- unauthorized access
- provider failure

## Suggested Working Rhythm

Use this sequence for each audit slice:

1. pick one flow
2. map page -> composable -> API -> service -> repository -> DB/queue/provider
3. write down assumptions
4. execute manual test
5. add or improve automated test
6. log bugs and risks
7. only then refactor

This rhythm keeps the audit grounded and stops cleanup work from rewriting bugs into new shapes.

## Initial 2-Week Audit Plan

### Week 1

- inventory all P0 flows into a tracking table
- audit auth/session lifecycle
- audit checkout OTP
- audit cart to order creation
- audit Paystack/PayPal verification paths
- audit payment webhook handling

### Week 2

- audit seller registration
- audit seller product create/edit/delete
- audit order status transitions
- audit shipping quote and shipment creation
- add first browser E2E coverage for checkout and seller product creation

## Definition Of Done For This Audit

The audit is in good shape when:

- every P0 flow is in the inventory
- every P0 flow has owner, status, and evidence
- critical auth/commerce/seller/payment flows have integration tests
- top 3 to 6 user journeys have browser E2E coverage
- known bugs and unsafe areas are documented rather than hidden
- logs, audit trails, and failure handling are good enough to trust production behavior

## Recommended Next Step

Use this document as the operating checklist, then create a companion tracker from it.

A good next artifact would be:

- `docs/AUDIT_TRACKER.md`

That file should contain the actual row-by-row flow inventory and audit status so this playbook stays stable while execution details evolve.
