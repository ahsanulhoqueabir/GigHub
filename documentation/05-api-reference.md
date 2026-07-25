# 5. API Reference

> All endpoints live under [`web/app/api/`](../../web/app/api) as Next.js App Router route handlers (`route.ts`). This is the **only** backend both the web frontend and the mobile app talk to — neither client accesses Supabase directly for writes. Auth-protected routes are wrapped in `withAuth({ allowedRoles: [...] })`; public routes explicitly opt out of auth.

Base path (both clients): `/api`

## 5.1 Auth (`/api/auth`)

| Method | Path                    | Notes                                                                                                             |
| ------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| POST   | `/auth/signup`          | Creates `profile` + `wallet` via `991_signup_transaction`                                                         |
| POST   | `/auth/login`           | Supabase Auth session                                                                                             |
| GET    | `/auth/me`              | Current session's profile                                                                                         |
| GET    | `/auth/check-username`  | Username availability check                                                                                       |
| PATCH  | `/auth/profile`         | Self profile update (`own-profile.schema.ts`, `FORBIDDEN_FIELDS` guard blocks role/verified/etc. self-escalation) |
| POST   | `/auth/change-password` | Password change                                                                                                   |

## 5.2 Profile domain

| Method | Path                              | Notes                                    |
| ------ | --------------------------------- | ---------------------------------------- |
| GET    | `/department`, `/department/[id]` | Public department list/detail            |
| GET    | `/category`, `/category/[id]`     | Public category list/detail (tree-aware) |

## 5.3 Gig Marketplace (`/api/gig`)

| Method | Path                | Notes                                                                                    |
| ------ | ------------------- | ---------------------------------------------------------------------------------------- |
| GET    | `/gig`              | Public browse/search/filter (category, price, tags)                                      |
| GET    | `/gig/[id]`         | Public gig detail (slug or id), calls `996_get_gig_by_id`                                |
| GET    | `/gig/[id]/details` | Extended detail view                                                                     |
| *      | `/gig/manage`       | Auth-required seller CRUD (create/update/delete), ownership-checked via `993`/`994` RPCs |

## 5.4 Job Board (`/api/job`, `/api/job-proposal`, `/api/applied-jobs`)

| Method | Path                                                    | Notes                                                                  |
| ------ | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| GET    | `/job`                                                  | Public browse/search                                                   |
| GET    | `/job/[id]`, `/job/[id]/details`                        | Public detail                                                          |
| *      | `/job/manage`                                           | Auth-required owner CRUD                                               |
| POST   | `/job-proposal`                                         | Applicant submits a proposal (blocked if applicant = job owner)        |
| GET    | `/job-proposal/[id]`                                    | Proposal detail                                                        |
| GET    | `/job-proposal/incoming`, `/job-proposal/incoming/[id]` | Job owner's inbox of proposals for their jobs                          |
| *      | `/job-proposal/manage`                                  | Owner accept/reject — accept path triggers `997_approve_job_proposal`  |
| GET    | `/applied-jobs`, `/applied-jobs/[id]`                   | Applicant's own submitted proposals, via `997_get_applied_job_details` |

## 5.5 Orders (`/api/order`)

| Method | Path                   | Notes                                                                         |
| ------ | ---------------------- | ----------------------------------------------------------------------------- |
| POST   | `/order`               | Create gig-sourced order → `997_create_gig_order`                             |
| POST   | `/order/job`           | Create job-sourced order (from an accepted proposal) → `997_create_job_order` |
| GET    | `/order/[id]`          | Order detail (buyer/seller/admin only)                                        |
| POST   | `/order/[id]/accept`   | → `997_accept_order`                                                          |
| POST   | `/order/[id]/deliver`  | Seller submits deliverables → `997_deliver_order`                             |
| POST   | `/order/[id]/complete` | Buyer approves delivery → `997_complete_order` (releases escrow)              |
| POST   | `/order/[id]/cancel`   | Cancellation request/response → `997_cancel_order`                            |

## 5.6 Escrow & Disputes (`/api/escrow`)

| Method   | Path                                      | Notes                                                 |
| -------- | ----------------------------------------- | ----------------------------------------------------- |
| GET      | `/escrow/my`                              | Current user's escrow records (as sender or receiver) |
| GET      | `/escrow/order/[orderId]`                 | Escrow for a specific order                           |
| POST     | `/escrow/dispute`                         | Raise a dispute → `997_request_dispute`               |
| GET/POST | `/admin/escrow`, `/admin/escrow/disputes` | Admin: list all / dispute queue                       |
| POST     | `/admin/escrow/resolve`                   | Admin resolves dispute → `997_resolve_dispute`        |

## 5.7 Payments (`/api/payment`)

| Method | Path                | Notes                                                      |
| ------ | ------------------- | ---------------------------------------------------------- |
| POST   | `/payment/initiate` | Starts an SSLCommerz payment session for an order          |
| POST   | `/payment/success`  | SSLCommerz success webhook → `997_process_payment_success` |
| POST   | `/payment/fail`     | SSLCommerz failure webhook                                 |
| POST   | `/payment/cancel`   | SSLCommerz cancel webhook                                  |

## 5.8 Wallet (`/api/wallet`)

| Method | Path              | Notes                              |
| ------ | ----------------- | ---------------------------------- |
| GET    | `/wallet/my`      | Current user's wallet balance      |
| GET    | `/wallet/records` | Paginated ledger (`wallet_record`) |

## 5.9 Chat (`/api/chat`)

| Method   | Path                        | Notes                                                            |
| -------- | --------------------------- | ---------------------------------------------------------------- |
| GET/POST | `/chat/rooms`               | List rooms / (implicitly created alongside orders)               |
| GET      | `/chat/rooms/[id]`          | Room detail → `997_get_chat_room_by_id`                          |
| GET/POST | `/chat/rooms/[id]/messages` | List (`997_list_chat_messages`) / send (`997_send_chat_message`) |
| POST     | `/chat/token`               | Supabase Realtime auth token for the room's broadcast channel    |

## 5.10 Announcements & Push (`/api/announcements`, `/api/push`)

| Method   | Path                                                | Auth       | Notes                                                                                                                                             |
| -------- | --------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET      | `/announcements`                                    | **Public** | Paginated (`page`, `pageSize`, max 20/page), filters `is_active` + date window, fields limited to `id, title, type, created_at` (never `content`) |
| GET      | `/announcements/[id]`                               | **Public** | Full detail (`title, content, type, created_at`); 404 if inactive/expired/not-started/not-found                                                   |
| POST     | `/push/subscribe`                                   | **Public** | Mobile device subscribes its FCM token to the `announcements` topic (`subscribeTokenToAnnouncements`)                                             |
| GET/POST | `/admin/announcements`, `/admin/announcements/[id]` | Admin      | CRUD; `send_push: true` on create fires a fire-and-forget topic push, never blocks/fails the request                                              |

## 5.11 Homepage / Public Aggregate

| Method | Path         | Notes                                                                                                                                            |
| ------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| GET    | `/homepage`  | Featured gigs/jobs for the web homepage                                                                                                          |
| GET    | `/site-data` | Public aggregate payload (RPC `999_get_public_site_data`): active hero banners, ad banners, announcements — consumed by mobile's `home.store.ts` |

## 5.12 Uploads

| Method | Path                 | Notes                                                                                                                         |
| ------ | -------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/signed-upload-url` | Issues a pre-signed Cloudflare R2 upload URL (client uploads directly to R2, bypassing the API for the file bytes themselves) |

## 5.13 Cron

| Method   | Path                  | Notes                                             |
| -------- | --------------------- | ------------------------------------------------- |
| GET/POST | `/cron/daily-summary` | Scheduled job invoking `998_get_db_daily_summary` |

## 5.14 Admin (`/api/admin/*`) — all require `ADMIN` role via `withAuth({ allowedRoles: ["ADMIN"] })`

| Method                     | Path                                                                    | Notes                                        |
| -------------------------- | ----------------------------------------------------------------------- | -------------------------------------------- |
| GET                        | `/admin/dashboard`                                                      | Analytics via `998_get_admin_dashboard_data` |
| GET/POST, GET/PATCH/DELETE | `/admin/users`, `/admin/users/[id]`                                     | User governance (role/status changes)        |
| GET/POST, GET/PATCH/DELETE | `/admin/departments`, `/admin/departments/[id]`                         | Department CRUD                              |
| GET/POST, GET/PATCH/DELETE | `/admin/hero-banners`, `/admin/hero-banners/[id]`                       | Hero banner CRUD                             |
| GET/POST, GET/PATCH/DELETE | `/admin/ad-banners`, `/admin/ad-banners/[id]`                           | Ad banner CRUD                               |
| GET/POST, GET/PATCH/DELETE | `/admin/announcements`, `/admin/announcements/[id]`                     | Announcement CRUD (§5.10)                    |
| GET/PATCH                  | `/admin/system-config`                                                  | Singleton system configuration               |
| GET/POST                   | `/admin/escrow`, `/admin/escrow/disputes`, POST `/admin/escrow/resolve` | §5.6                                         |

## 5.15 Conventions

- **Validation:** every route validates its input against a Zod schema — either directly from `@gig-hub/types` (`npm-types/src/validations/*.schema.ts`) or a route-local shim in `web/lib/validations/*.schema.ts` for endpoint-specific query/response shapes not worth centralizing.
- **Auth:** `withAuth({ allowedRoles })` middleware verifies the Supabase session and optionally gates by `profile.role`; public endpoints explicitly document `no auth required` in-file.
- **Error shape:** malformed IDs on public GET endpoints return `404` (not `500`); Firebase/webhook failures are logged and never block the primary DB-backed response (`200`/`201`).
- **Pagination:** list endpoints use `page` + `pageSize` query params (public announcements capped at `pageSize<=20`).
