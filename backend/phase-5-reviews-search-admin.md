# Backend Phase 5 — Quality & Discovery: Reviews, Search, Admin & Polish

> **Duration Estimate:** 2 weeks
> **Dependencies:** Phase 4 complete (all core features built)
> **Outcomes:** Review system, advanced search, bookmarks, reports, admin panel, platform configuration

---

## Phase Overview

Complete the MVP by building the review system, optimizing search, adding bookmarks and reporting, implementing admin endpoints, and polishing the entire API for production readiness.

---

## Task Checklist

### 5.1 Directus Collections Setup

- [ ] **5.1.1** Create `gh_reviews` collection with all fields and indexes
- [ ] **5.1.2** Create `gh_bookmarks` collection with UNIQUE constraint on (`profile_id`, `entity_type`, `entity_id`)
- [ ] **5.1.3** Create `gh_reports` collection with all fields
- [ ] **5.1.4** Set up foreign key relations:
  - `gh_reviews.order_id` → `gh_orders.id`
  - `gh_reviews.gig_id` → `gh_gigs.id`
  - `gh_reviews.reviewer_id` / `reviewee_id` → `gh_profiles.id`
  - `gh_bookmarks.profile_id` → `gh_profiles.id`
  - `gh_reports.reporter_id` / `resolved_by` → `gh_profiles.id`

### 5.2 Reviews Module

- [ ] **5.2.1** Create `ReviewsModule` with:
  - `ReviewsService` — review creation & aggregation
  - `ReviewsController` — REST endpoints
  - DTOs: `CreateReviewDto`, `ReviewResponseDto`, `ReviewResponseReplyDto`

- [ ] **5.2.2** Implement `POST /orders/:orderId/reviews` — Submit review:
  1. Validate order exists and is `completed`
  2. Determine reviewer and reviewee:
     - If current user is buyer → reviewing seller
     - If current user is seller → reviewing buyer
  3. Check reviewer hasn't already reviewed this order
  4. Validate ratings (1.0–5.0 range, 0.5 increments)
  5. Create `gh_reviews` record
  6. Set `gig_id` if order source_type is 'gig'
  7. **Recalculate reviewee's aggregate ratings:**
     - Update `gh_profiles.avg_rating` and `total_reviews` for the reviewee
     - Update `gh_gigs.avg_rating` and `total_reviews` for the gig (if applicable)
  8. **Trigger notification** to reviewee

- [ ] **5.2.3** Implement `GET /reviews/gig/:gigId` — List reviews for a gig:
  - Paginated, sorted by created_at desc
  - Include reviewer info (display_name, username, avatar)
  - Include review response if exists
  - Show rating breakdown stats (5-star: X%, 4-star: Y%, etc.)

- [ ] **5.2.4** Implement `GET /reviews/user/:username` — List reviews for a user:
  - Same format as gig reviews
  - Filter by: received (default), given
  - Include order info (title, source_type)

- [ ] **5.2.5** Implement `POST /reviews/:id/response` — Respond to review:
  1. Verify current user is the reviewee
  2. Verify review doesn't already have a response
  3. Update `gh_reviews.response` and `response_at`

- [ ] **5.2.6** Implement rating aggregation utility:

  ```typescript
  async recalculateRatings(profileId: string): Promise<void>
  async recalculateGigRatings(gigId: string): Promise<void>
  ```

  - Calculate weighted average from all visible reviews
  - Update profile and/or gig aggregate fields

- [ ] **5.2.7** Complete `GET /profiles/:username` (from Phase 1):
  - Now includes real avg_rating, total_reviews data

- [ ] **5.2.8** Complete `GET /profiles/:username/reviews` (from Phase 1):
  - Wire up to `GET /reviews/user/:username`

### 5.3 Bookmarks Module

- [ ] **5.3.1** Create `BookmarksModule` with:
  - `BookmarksService`
  - `BookmarksController`

- [ ] **5.3.2** Implement `POST /bookmarks` — Add bookmark:
  1. Validate entity exists (gig or job)
  2. Check not already bookmarked (UNIQUE constraint)
  3. Create `gh_bookmarks` record

- [ ] **5.3.3** Implement `GET /bookmarks` — List my bookmarks:
  - Filter by `entity_type` (gig/job)
  - Include basic entity info (title, price/budget, image, status)
  - Paginated

- [ ] **5.3.4** Implement `DELETE /bookmarks/:id` — Remove bookmark

- [ ] **5.3.5** Implement `GET /bookmarks/check` — Check if bookmarked:
  - Query params: `entity_type`, `entity_id`
  - Return `{ is_bookmarked: true/false }`

### 5.4 Reports Module

- [ ] **5.4.1** Create `ReportsModule` with:
  - `ReportsService`
  - `ReportsController`

- [ ] **5.4.2** Implement `POST /reports` — Submit report:
  1. Validate entity exists
  2. Check not already reported by same user (prevent spam)
  3. Create `gh_reports` record
  4. **Trigger notification** to admin

- [ ] **5.4.3** Implement `GET /reports/me` — List my submitted reports

### 5.5 Admin Module

- [ ] **5.5.1** Create `AdminModule` with:
  - `AdminService` — admin business logic
  - `AdminController` — admin REST endpoints
  - Apply `RolesGuard('admin')` to all routes

#### User Management

- [ ] **5.5.2** Implement `GET /admin/users` — List all users:
  - Filters: role, is_verified, search (name/username/email)
  - Include: total_orders, total_earnings, avg_rating
  - Paginated

- [ ] **5.5.3** Implement `PATCH /admin/users/:id/verify` — Verify student:
  - Set `is_verified = true` (or false to unverify)
  - Update NestJS JWT claims on next token refresh
  - **Trigger notification** to user

- [ ] **5.5.4** Implement `PATCH /admin/users/:id/suspend` — Suspend user:
  - Add `suspended_at` timestamp
  - Deactivate all user's gigs (set status to paused)
  - Reject pending proposals
  - **Trigger notification** to user

- [ ] **5.5.5** Implement `PATCH /admin/users/:id/ban` — Ban user:
  - Add `banned_at` timestamp
  - Deactivate all gigs, close all jobs
  - Invalidate all sessions
  - **Trigger notification** to user

#### Dispute Resolution

- [ ] **5.5.6** Implement `GET /admin/disputes` — List disputed orders:
  - Include buyer & seller info
  - Include order details and chat history
  - Filter by: status (pending, resolved)

- [ ] **5.5.7** Implement `PATCH /admin/disputes/:orderId/resolve` — Resolve dispute:
  - Resolution types:
    - `refund`: full refund to buyer, set escrow to refunded
    - `release`: release full amount to seller
    - `split`: split by percentage (split_percent_buyer, split_percent_seller)
  - Process financial transactions
  - Set order status to `refunded` or `completed`
  - **Trigger notification** to both parties

#### Content Moderation

- [ ] **5.5.8** Implement `GET /admin/reports` — List all reports:
  - Filter by: entity_type, reason, status
  - Include reporter info and entity details
  - Paginated

- [ ] **5.5.9** Implement `PATCH /admin/reports/:id/resolve` — Resolve report:
  - Set status, admin_note, resolved_by, resolved_at
  - Optionally hide/remove reported content
  - Optionally warn/suspend user

#### Withdrawal Processing

- [ ] **5.5.10** Implement `GET /admin/withdrawals` — List all withdrawal requests:
  - Filter by: status (pending, processing, completed, rejected)
  - Include user info and account details

- [ ] **5.5.11** Implement `PATCH /admin/withdrawals/:id/process`:
  - Accept: set status to `processing` → then `completed` after manual transfer
  - Reject: set status to `rejected`, add admin_note, credit back user balance
  - **Trigger notification** to user

#### Analytics & Config

- [ ] **5.5.12** Implement `GET /admin/stats` — Platform statistics:
  - Total/active users, verified users
  - Total gigs, jobs, orders
  - Active/completed/disputed orders
  - Revenue metrics
  - Pending withdrawals count

- [ ] **5.5.13** Implement `GET /admin/revenue` — Revenue analytics:
  - Daily/weekly/monthly revenue breakdown
  - Total platform fees collected
  - Payment method distribution
  - Top earning categories

- [ ] **5.5.14** Implement `GET /admin/config` — Get all platform config
- [ ] **5.5.15** Implement `PATCH /admin/config/:key` — Update config value

### 5.6 Search Optimization

- [ ] **5.6.1** Optimize full-text search on PostgreSQL:
  - Create `tsvector` columns or use Directus filter capability
  - Rank by relevance (ts_rank)
  - Support partial matching

- [ ] **5.6.2** Implement trending gigs:
  - Score: recent orders _ weight + recent views _ weight + rating \* weight
  - Cache trending list (refresh every 30 min)

- [ ] **5.6.3** Implement recommended freelancers for a job:
  - Match job `required_skills` against `gh_profiles.skills`
  - Rank by: skill match count, avg_rating, total_orders
  - `GET /jobs/:id/recommended-freelancers`

- [ ] **5.6.4** Implement search suggestions / autocomplete:
  - `GET /search/suggestions?q=des` → ["Design", "Desktop App", "Description Writing"]
  - Based on gig titles, category names, popular tags

### 5.7 Production Hardening

- [ ] **5.7.1** Add request logging middleware (structured JSON logs)
- [ ] **5.7.2** Add health check endpoint: `GET /health`
- [ ] **5.7.3** Add API versioning setup (v1 prefix)
- [ ] **5.7.4** Review and tighten CORS configuration
- [ ] **5.7.5** Review rate limiting across all routes
- [ ] **5.7.6** Add request ID tracking (UUID per request)
- [ ] **5.7.7** Set up Swagger/OpenAPI documentation:
  ```typescript
  @nestjs/swagger — auto-generate from DTOs and decorators
  ```
- [ ] **5.7.8** Database query optimization review:
  - Ensure all list queries use proper indexes
  - Add query caching where appropriate
  - No N+1 queries
- [ ] **5.7.9** Security audit:
  - Input sanitization on all text fields (prevent XSS)
  - SQL injection prevention (parameterized queries via Directus SDK)
  - File upload validation (MIME type check, file size limits)
  - JWT best practices (short expiry, secure refresh rotation)
- [ ] **5.7.10** Error monitoring setup (Sentry or similar)

### 5.8 Testing

- [ ] **5.8.1** Unit tests for ReviewsService:
  - Create review
  - Prevent duplicate review
  - Rating aggregation
  - Review response
- [ ] **5.8.2** Unit tests for BookmarksService
- [ ] **5.8.3** Unit tests for ReportsService
- [ ] **5.8.4** Unit tests for AdminService:
  - User verify/suspend/ban
  - Dispute resolution with financial impact
  - Withdrawal processing
- [ ] **5.8.5** E2E tests for complete flows:
  - Order completion → review → rating update
  - Report → admin resolution
  - Dispute → admin resolution → financial settlement
- [ ] **5.8.6** Load testing basic endpoints (verify performance targets)
- [ ] **5.8.7** Full regression test suite run

---

## Endpoints Delivered in This Phase

| Method   | Endpoint                            | Status |
| -------- | ----------------------------------- | ------ |
| `POST`   | `/orders/:orderId/reviews`          | 🔲     |
| `GET`    | `/reviews/gig/:gigId`               | 🔲     |
| `GET`    | `/reviews/user/:username`           | 🔲     |
| `POST`   | `/reviews/:id/response`             | 🔲     |
| `GET`    | `/bookmarks`                        | 🔲     |
| `POST`   | `/bookmarks`                        | 🔲     |
| `DELETE` | `/bookmarks/:id`                    | 🔲     |
| `GET`    | `/bookmarks/check`                  | 🔲     |
| `POST`   | `/reports`                          | 🔲     |
| `GET`    | `/reports/me`                       | 🔲     |
| `GET`    | `/admin/users`                      | 🔲     |
| `PATCH`  | `/admin/users/:id/verify`           | 🔲     |
| `PATCH`  | `/admin/users/:id/suspend`          | 🔲     |
| `PATCH`  | `/admin/users/:id/ban`              | 🔲     |
| `GET`    | `/admin/disputes`                   | 🔲     |
| `PATCH`  | `/admin/disputes/:orderId/resolve`  | 🔲     |
| `GET`    | `/admin/reports`                    | 🔲     |
| `PATCH`  | `/admin/reports/:id/resolve`        | 🔲     |
| `GET`    | `/admin/withdrawals`                | 🔲     |
| `PATCH`  | `/admin/withdrawals/:id/process`    | 🔲     |
| `GET`    | `/admin/stats`                      | 🔲     |
| `GET`    | `/admin/revenue`                    | 🔲     |
| `GET`    | `/admin/config`                     | 🔲     |
| `PATCH`  | `/admin/config/:key`                | 🔲     |
| `GET`    | `/jobs/:id/recommended-freelancers` | 🔲     |
| `GET`    | `/search/suggestions`               | 🔲     |
| `GET`    | `/health`                           | 🔲     |

---

## Directus Collections Created

| Collection     | Status |
| -------------- | ------ |
| `gh_reviews`   | 🔲     |
| `gh_bookmarks` | 🔲     |
| `gh_reports`   | 🔲     |

---

## Definition of Done

- [ ] Mutual review system working (both parties review after order completion)
- [ ] Rating aggregation accurate on profiles and gigs
- [ ] Review response functionality working
- [ ] Bookmarks CRUD working
- [ ] Content reporting system working
- [ ] All admin endpoints implemented and tested
- [ ] Dispute resolution with financial settlement working
- [ ] Withdrawal processing by admin working
- [ ] Full-text search optimized with relevance ranking
- [ ] Trending gigs and recommended freelancers working
- [ ] Swagger documentation generated
- [ ] Health check endpoint responding
- [ ] Security audit passed
- [ ] All test suites passing
- [ ] Performance targets met (< 200ms p95)
- [ ] **MVP Backend Complete** ✅
