# Backend Phase 2 — Core Marketplace: Gigs, Jobs & Proposals

> **Duration Estimate:** 2–3 weeks
> **Dependencies:** Phase 1 complete (Auth, Profiles, R2 uploads)
> **Outcomes:** Full gig marketplace, job board, proposal system, search & filtering

---

## Phase Overview

Build the two core marketplace features: the Fiverr-style gig system (with packages, gallery, categories) and the Upwork-style job board (with proposals). Implement search, filtering, and discovery features.

---

## Task Checklist

### 2.1 Categories Module (Complete)

- [ ] **2.1.1** Create `CategoriesModule` with:
  - `CategoriesService` — Static methods for `gh_categories` CRUD
  - `CategoriesController` — REST endpoints
  - `types/categories.types.ts` — Category interfaces and enums
- [ ] **2.1.2** Implement `GET /categories` — list all active categories (public, cached)
- [ ] **2.1.3** Implement `POST /categories` — admin-only: create new category
- [ ] **2.1.4** Implement `PATCH /categories/:id` — admin-only: update category
- [ ] **2.1.5** Implement `DELETE /categories/:id` — admin-only: soft-delete (set `is_active = false`)
- [ ] **2.1.6** Add in-memory cache for categories (TTL: 1 hour)

### 2.2 Directus Collections Setup

- [ ] **2.2.1** Create `gh_gigs` collection with all fields and indexes
- [ ] **2.2.2** Create `gh_gig_packages` collection with UNIQUE constraint on (`gig`, `tier`)
- [ ] **2.2.3** Create `gh_gig_images` collection
- [ ] **2.2.4** Create `gh_jobs` collection with all fields and indexes
- [ ] **2.2.5** Create `gh_proposals` collection with UNIQUE constraint on (`job`, `applicant`)
- [ ] **2.2.6** Set up relations in Directus:
  - `gh_gigs.seller` → `gh_profiles.id`
  - `gh_gigs.category` → `gh_categories.id`
  - `gh_gig_packages.gig` → `gh_gigs.id` (cascade delete)
  - `gh_jobs.poster` → `gh_profiles.id`
  - `gh_jobs.category` → `gh_categories.id`
  - `gh_proposals.job` → `gh_jobs.id`
  - `gh_proposals.applicant` → `gh_profiles.id`
- [ ] **2.2.7** Create full-text search indexes on `gh_gigs(title, description)` and `gh_jobs(title, description)`
- [ ] **2.2.8** Create GIN indexes on `gh_gigs.tags` and `gh_jobs.required_skills`

### 2.3 Gigs Module

- [ ] **2.3.1** Create `GigsModule` with:
  - `GigService` — Static methods for `gh_gigs` and `gh_gig_packages` logic
  - `GigsController` — REST endpoints
  - `types/gigs.types.ts` — Gig, Package, and Image interfaces
  - DTOs: `CreateGigDto`, `UpdateGigDto`, `GigQueryDto`, `GigResponseDto`, `GigDetailResponseDto`

#### Gig CRUD

- [ ] **2.3.2** Implement `POST /gigs` — Create gig:
  1. Validate input (title, description, category_id, tags, packages)
  2. Validate at least 1 package (basic required, standard/premium optional)
  3. Validate price > 0, delivery_days > 0 for each package
  4. Generate unique slug from title
  5. Create `gh_gigs` record
  6. Create `gh_gig_packages` records (1–3 packages)
  7. Return created gig with packages and images array

- [ ] **2.3.3** Implement `PATCH /gigs/:id` — Update gig:
  1. Verify current user is the seller (`seller = profile_id`)
  2. Validate updated fields
  3. Update `gh_gigs` record
  4. Upsert packages (delete old, create new)
  5. Update images array if changed

- [ ] **2.3.4** Implement `DELETE /gigs/:id` — Soft-delete gig:
  1. Verify ownership
  2. Check no active orders exist for this gig
  3. Set status to `deleted`

- [ ] **2.3.5** Implement `PATCH /gigs/:id/status` — Toggle gig status:
  1. Verify ownership
  2. Allow: `active` ↔ `paused`

#### Gig Listing & Detail

- [ ] **2.3.6** Implement `GET /gigs` — List gigs with filters:
  - Filters: `category`, `min_price`, `max_price`, `max_delivery`, `min_rating`, `tags`, `seller_id`
  - Search: full-text search on `title` and `description`
  - Sort: `-created_at` (default), `price_asc`, `price_desc`, `rating`, `orders`
  - Pagination: page, limit
  - Only return `active` gigs
  - Include: seller (id, display_name, username, avatar, avg_rating), basic package price, first image

- [ ] **2.3.7** Implement `GET /gigs/:slug` — Gig detail:
  - Return full gig data with:
    - All packages (basic, standard, premium)
    - All gallery images
    - Category info
    - Seller info (id, display_name, username, avatar, bio, avg_rating, total_reviews)
    - Stats (avg_rating, total_reviews, total_orders)
  - Increment `view_count` (debounced, not on every request — use IP/user-based dedup)

- [ ] **2.3.8** Implement `GET /gigs/me` — List current user's gigs:
  - Include all statuses (active, paused, draft, deleted)
  - Include package count, order count per gig

### 2.4 Jobs Module

- [ ] **2.4.1** Create `JobsModule` with:
  - `JobService` — Static methods for `gh_jobs` logic
  - `JobsController` — REST endpoints
  - `types/jobs.types.ts` — Job interfaces and enums
  - DTOs: `CreateJobDto`, `UpdateJobDto`, `JobQueryDto`, `JobResponseDto`

#### Job CRUD

- [ ] **2.4.2** Implement `POST /jobs` — Create job:
  1. Validate input (title, description, category_id, job_type, budget, deadline, skills)
  2. Validate budget_min ≤ budget_max (if both provided)
  3. Validate deadline is in the future
  4. Generate unique slug from title
  5. Create `gh_jobs` record
  6. Return created job

- [ ] **2.4.3** Implement `PATCH /jobs/:id` — Update job:
  1. Verify ownership (`poster_id = profile_id`)
  2. Only allow editing if status is `open`
  3. Update `gh_jobs` record

- [ ] **2.4.4** Implement `DELETE /jobs/:id` — Close/cancel job:
  1. Verify ownership
  2. Set status to `cancelled`
  3. Reject all pending proposals

#### Job Listing & Detail

- [ ] **2.4.5** Implement `GET /jobs` — List jobs with filters:
  - Filters: `category`, `job_type`, `budget_min`, `budget_max`, `skills`, `status`
  - Search: full-text on `title`, `description`
  - Sort: `-created_at` (default), `budget_desc`, `deadline_asc`
  - Only return `open` jobs by default
  - Include: poster (id, display_name, username, avatar), total_proposals

- [ ] **2.4.6** Implement `GET /jobs/:slug` — Job detail:
  - Return full job data with:
    - Poster info
    - Category info
    - Required skills
    - Attachments
    - Total proposals count
  - Do NOT include proposals list here (separate endpoint)

- [ ] **2.4.7** Implement `GET /jobs/me` — List current user's job posts:
  - All statuses
  - Include total_proposals per job

### 2.5 Proposals Module

- [ ] **2.5.1** Create `ProposalsModule` with:
  - `ProposalService` — Static methods for `gh_proposals` logic
  - `ProposalsController` — REST endpoints
  - `types/proposals.types.ts` — Proposal interfaces and enums
  - DTOs: `CreateProposalDto`, `ProposalResponseDto`

- [ ] **2.5.2** Implement `POST /jobs/:jobId/proposals` — Submit proposal:
  1. Validate: job exists and is `open`
  2. Validate: applicant is NOT the job poster
  3. Validate: applicant hasn't already submitted a proposal for this job
  4. Validate: cover_letter, quoted_price (if paid job), estimated_days
  5. Create `gh_proposals` record
  6. Increment `gh_jobs.total_proposals`
  7. **Trigger notification** to job poster (notification module placeholder)

- [ ] **2.5.3** Implement `GET /jobs/:jobId/proposals` — List proposals for a job:
  1. Verify current user is the job poster
  2. Return proposals with applicant info (display_name, username, avatar, avg_rating, skills)
  3. Sort by created_at desc

- [ ] **2.5.4** Implement `GET /proposals/me` — List my submitted proposals:
  - Include job info (title, status, poster)
  - Filter by status: pending, accepted, rejected, withdrawn

- [ ] **2.5.5** Implement `GET /proposals/:id` — Get proposal detail:
  - Accessible by applicant or job poster only

- [ ] **2.5.6** Implement `PATCH /proposals/:id/withdraw` — Withdraw proposal:
  1. Verify applicant is current user
  2. Only allow if status is `pending`
  3. Set status to `withdrawn`
  4. Decrement `gh_jobs.total_proposals`

- [ ] **2.5.7** Implement `PATCH /proposals/:id/accept` — Accept proposal:
  1. Verify current user is the job poster
  2. Set proposal status to `accepted`
  3. Set job status to `in_progress`
  4. Reject all other pending proposals for this job
  5. **Trigger notification** to accepted applicant
  6. Auto-create order if job is paid (or return data for order creation in Phase 3)

- [ ] **2.5.8** Implement `PATCH /proposals/:id/reject` — Reject proposal:
  1. Verify current user is the job poster
  2. Set status to `rejected`
  3. **Trigger notification** to applicant

### 2.6 Search & Discovery Utilities

- [ ] **2.6.1** Implement full-text search helper:
  - PostgreSQL `tsvector` / `tsquery` via Directus raw SQL or filtered queries
  - Rank results by relevance

- [ ] **2.6.2** Implement tag-based filtering for gigs (GIN index on JSON array)

- [ ] **2.6.3** Implement skill-based filtering for jobs (GIN index on JSON array)

- [ ] **2.6.4** Implement combined sort: relevance, price, rating, date

### 2.7 Testing

- [ ] **2.7.1** Unit tests for GigsService:
  - Create gig with packages
  - Update gig
  - Soft-delete gig
  - List with filters
- [ ] **2.7.2** Unit tests for JobsService:
  - Create job
  - Update job
  - Close job
- [ ] **2.7.3** Unit tests for ProposalsService:
  - Submit proposal
  - Accept/reject proposal
  - Prevent duplicate proposal
  - Prevent self-proposal
- [ ] **2.7.4** E2E tests for gig flow (create → list → detail → update → delete)
- [ ] **2.7.5** E2E tests for job flow (create → list → detail → proposal → accept)
- [ ] **2.7.6** E2E tests for search and filtering

---

## Endpoints Delivered in This Phase

| Method   | Endpoint                  | Status |
| -------- | ------------------------- | ------ |
| `POST`   | `/categories`             | 🔲     |
| `PATCH`  | `/categories/:id`         | 🔲     |
| `DELETE` | `/categories/:id`         | 🔲     |
| `GET`    | `/gigs`                   | 🔲     |
| `GET`    | `/gigs/:slug`             | 🔲     |
| `POST`   | `/gigs`                   | 🔲     |
| `PATCH`  | `/gigs/:id`               | 🔲     |
| `DELETE` | `/gigs/:id`               | 🔲     |
| `GET`    | `/gigs/me`                | 🔲     |
| `PATCH`  | `/gigs/:id/status`        | 🔲     |
| `GET`    | `/jobs`                   | 🔲     |
| `GET`    | `/jobs/:slug`             | 🔲     |
| `POST`   | `/jobs`                   | 🔲     |
| `PATCH`  | `/jobs/:id`               | 🔲     |
| `DELETE` | `/jobs/:id`               | 🔲     |
| `GET`    | `/jobs/me`                | 🔲     |
| `POST`   | `/jobs/:jobId/proposals`  | 🔲     |
| `GET`    | `/jobs/:jobId/proposals`  | 🔲     |
| `GET`    | `/proposals/me`           | 🔲     |
| `GET`    | `/proposals/:id`          | 🔲     |
| `PATCH`  | `/proposals/:id/withdraw` | 🔲     |
| `PATCH`  | `/proposals/:id/accept`   | 🔲     |
| `PATCH`  | `/proposals/:id/reject`   | 🔲     |

---

## Directus Collections Created

| Collection        | Status |
| ----------------- | ------ |
| `gh_gigs`         | 🔲     |
| `gh_gig_packages` | 🔲     |
| `gh_jobs`         | 🔲     |
| `gh_proposals`    | 🔲     |

---

## Definition of Done

- [ ] Full gig CRUD with 3-tier package system
- [ ] Gig gallery image management
- [ ] Full job CRUD with all job types
- [ ] Proposal submit/accept/reject/withdraw flow
- [ ] Search & filter working for both gigs and jobs
- [ ] Pagination working on all list endpoints
- [ ] Slug-based URLs for gigs and jobs
- [ ] View counting for gigs
- [ ] Ownership checks on all mutating operations
- [ ] All unit and e2e tests passing
