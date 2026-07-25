# 1. Overview & Features

## 1.1 Product Overview

**GigHub** is a closed, campus-exclusive freelance and task marketplace built exclusively for the students of **Jagannath University (JnU), Dhaka, Bangladesh**. It merges the two dominant freelance-platform models into one:

- **Gig Marketplace** (Fiverr-style) — sellers publish fixed-scope service listings ("Gigs") with tiered pricing.
- **Job Board** (Upwork-style) — buyers post custom tasks/jobs and receive proposals from applicants.

There is **no separate "Freelancer" vs "Client" account type** — every verified student is inherently dual-sided and can simultaneously sell gigs, buy gigs, post jobs, and apply to jobs from a single account.

Trust is enforced through:

- **Campus-only access** — closed ecosystem, verified JnU identity (`student_id`, `department`).
- **Escrow-protected payments** — buyer funds are held by the platform and only released to the seller on delivery approval.
- **Mutual reviews** — both parties build a portfolio/reputation from completed orders.

## 1.2 Roles

| Role                 | Description                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Student (`USER`)** | The only "real" account type. Can create gigs, buy gigs, post jobs, submit proposals, chat, hold a wallet, leave reviews — all from one profile. |
| **Admin (`ADMIN`)**  | Platform moderator. Manages departments/categories, banners, announcements, system configuration, user accounts, and resolves escrow disputes.   |

Functionally (for UX/use-case purposes) a Student profile plays several situational personas: **Buyer**, **Seller**, **Job Owner**, **Applicant** — see [09-use-cases.md](./09-use-cases.md).

## 1.3 Feature Set

### 🔐 Authentication & Identity

- Email/password signup & login via Supabase Auth (`web/app/api/auth/*`).
- Session/token verification on every protected API call (`withAuth` middleware).
- Username availability check, change-password flow, profile self-service (`own-profile` schema with a server-side `FORBIDDEN_FIELDS` guard so users can't self-elevate role/verification).
- Institution-fixed identity: department + student ID captured at signup.

### 🏪 Gig Marketplace

- Gig creation with **3-tier packages** (`BASIC` / `STANDARD` / `PREMIUM`) stored as JSONB.
- Multi-image gallery (Cloudflare R2 origin → Cloudinary-optimized delivery), tags, FAQ (JSONB), category assignment, view counter.
- Browse/search/filter by category, price, tags; slug-based detail pages.
- Seller-only management endpoints (`gig/manage`) protected against self-ordering (a seller cannot order their own gig).

### 📝 Job Board & Proposals

- Job posting with budget, deadline, required skills, location, tags, and type (`PARTTIME`, `FULLTIME`, `CONTRACT`, `TUTION`, `VOLUNTEER`, `OTHER`).
- Freelancers submit **Job Proposals** (cover letter/description + attachments).
- Job owner reviews incoming proposals and **accepts** one — this atomically creates an `order` + `escrow` row via a Postgres stored procedure (`997_approve_job_proposal.sql`), rejecting/locking out the rest.
- Guard against self-bidding (owner cannot propose on their own job).

### 🔒 Orders & Escrow (Financial Safety Layer)

- Unified `order` entity supports both **gig-sourced** and **job-sourced** orders (`order_source`: `JOB` | `GIG`).
- Order lifecycle driven by `record_status`: `PENDING → IN_PROGRESS → DELIVERED → REVISION → COMPLETED`, with `DISPUTED` / `CANCELLED` branches.
- Every order has exactly one `escrow` row: buyer funds are held (`payment_status: UNPAID → PAID`), then either `RELEASED` (seller paid out), `REFUNDED` (buyer refunded), or routed through `DISPUTED → resolved_by (admin)`.
- Platform fee (default **5%**, configurable via `system_config.platform_fee_percent`) is deducted from `escrow.platform_fee` at release.
- Server-side stored procedures back every transition (`997_create_gig_order`, `997_create_job_order`, `997_accept_order`, `997_deliver_order`, `997_complete_order`, `997_cancel_order`, `997_request_dispute`, `997_resolve_dispute`) — all financial mutations happen atomically in the DB, never purely in application code.
- Deliverable submission (multi-file attachments + notes), revision requests, cancellation-request workflow (either party can request; the counterparty must respond).

### 💬 Real-Time Messaging

- One `chat_room` per `order`, scoped to that order's buyer & seller.
- `chat_message` supports text + single attachment (URL/name/type) per message.
- Powered by **Supabase Realtime Broadcast** — no separate WebSocket server.

### 💳 Wallet & Ledger

- One `wallet` per user (`currency` default `BDT`).
- `wallet_record` is the append-only ledger: every `CREDIT`/`DEBIT` references the originating `order` and `escrow`, plus `payment_method`/`payment_gateway`/`transaction_id` for external gateway reconciliation (SSLCommerz).
- Payment flow: `payment/initiate → SSLCommerz → payment/success|fail|cancel` webhooks → `997_process_payment_success.sql` credits escrow/wallet atomically.

### ⭐ Reviews

- One review per completed order (`UNIQUE("order")`), 1–5 star `rating` + optional note.
- Denormalized `seller` column for fast profile/gig aggregate queries.

### 🔔 Notifications

- Firebase Cloud Messaging **topic** push (`announcements` topic) — no per-device token storage needed for this feature.
- Mobile: `expo-notifications` + `expo-device`, foreground/background/terminated tap handling, deep-links into the Announcements screen.
- In-app announcement bell + list/detail screens, admin-authored announcements with `send_push` toggle.

### 🛡 Admin Panel (`web/app/admin/*`)

- **Analytics dashboard**: user growth, active orders, financial metrics (`998_get_admin_dashboard_data.sql`, daily summary cron `998_get_db_daily_summary.sql`).
- **User governance**: list/search users, change role/status, view detail.
- **Content management**: Departments, Categories (self-referencing hierarchy), Hero Banners, Ad Banners (placement-targeted), Announcements.
- **Escrow oversight**: view all escrow, dispute queue, resolve disputes in favor of buyer or seller.
- **System configuration**: maintenance mode, registration toggle, platform fee %, upload limits, support contact — singleton `system_config` row.
- **Schema Visualizer**: `web/components/admin/visualizer` renders the live DB schema (parsed by `web/lib/schema-parser.ts`) inside the admin UI.

## 1.4 Key Differentiators

- Exclusively for one university — a trusted, closed campus ecosystem (not a generic global marketplace).
- Every student is dual-sided by default — no forced Buyer/Seller account split.
- Supabase (Postgres + Auth + Realtime) as a single unified backend — no separate DB/auth/WebSocket services to operate.
- Cloudflare R2 (all raw files) + Cloudinary (image-only optimization) as two independent, purpose-specific storage layers.
- Shared Zod schemas/types (`@gig-hub/types`, published from `npm-types/`) guarantee request/response type-safety across the Next.js backend, the Next.js web frontend, and the Expo mobile app.
- Local payment rail (SSLCommerz) for the Bangladesh market, with an internal wallet/escrow ledger on top.

## 1.5 Non-Goals / Out of Scope (current MVP)

- Multi-institution support (hard-coded to one university for now).
- Milestone-split payments within a single order (schema supports single lump-sum escrow per order today).
- Per-device push targeting (topic-based push only; `profile.fcm_token` column exists but is currently unused/stripped by the API).
