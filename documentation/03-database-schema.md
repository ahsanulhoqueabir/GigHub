# 3. Database Schema Reference

> Source of truth: [`web/schema/*.sql`](../../web/schema) (Supabase/PostgreSQL). Migrations are numerically prefixed and must run in order. This document is a human-readable mirror — if it ever disagrees with the SQL files, the SQL files win.

## 3.1 Migration Order

| Priority | File | Description |
|---|---|---|
| 0 | `000_extensions.sql` | PostgreSQL extensions (`uuid-ossp`) |
| 1 | `010_enums.sql` | ENUM types |
| 2 | `020_department.sql` | `department` table |
| 2 | `021_ad_banner.sql` | `ad_banners` table |
| 2 | `022_announcements.sql` | `announcements` table |
| 2 | `023_system_config.sql` | `system_config` singleton table |
| 2 | `024_hero_banners.sql` | `hero_banners` table |
| 3 | `030_category.sql` | `category` table (self-referencing FK) |
| 4 | `040_profile.sql` | `profile` table |
| 5 | `050_gig.sql` | `gig` table |
| 6 | `060_job.sql` | `job` table |
| 7 | `070_job_proposal.sql` | `job_proposal` table |
| 8 | `080_order.sql` | `"order"` table (reserved word — always quoted) |
| 9 | `090_chat_room.sql` | `chat_room` table |
| 10 | `100_chat_message.sql` | `chat_message` table |
| 11 | `110_wallet.sql` | `wallet` table |
| 12 | `120_wallet_record.sql` | `wallet_record` table (+ RLS) |
| 13 | `130_escrow.sql` | `escrow` table (+ RLS) |
| 14 | `140_reviews.sql` | `reviews` table |
| — | `150_system.sql` | Consolidated system/banner/announcement tables (see note below) |
| 90 | `900_triggers.sql` | `updated_at` triggers on all tables |
| 91 | `910_rls.sql` | Row-Level Security policies |
| 99 | `990_stored_procedures.sql` | Stored procedures index |
| 99 | `991_signup_transaction.sql` | Signup transaction (profile + wallet created atomically) |
| 99x | `99*_*.sql` | Individual RPC stored procedures (§3.4) |

> **Note:** `150_system.sql` defines `system_config`, `hero_banners`, `ad_banners`, `announcements` in one file with `gen_random_uuid()`; `021`–`024` define the same tables individually with `uuid-ossp`'s `uuid_generate_v4()`. Treat them as alternate/legacy-vs-current versions of the same tables — verify which is actually applied in the live Supabase project before writing new migrations against them.

## 3.2 ENUM Types (`010_enums.sql`)

| Enum | Values |
|---|---|
| `user_role` | `USER`, `ADMIN` |
| `gig_package_tier` | `BASIC`, `STANDARD`, `PREMIUM` |
| `job_type` | `PARTTIME`, `FULLTIME`, `CONTRACT`, `TUTION`, `VOLUNTEER`, `OTHER` |
| `order_source` | `JOB`, `GIG` |
| `record_status` | `DRAFT`, `PENDING`, `ACTIVE`, `DELETED`, `ON_HOLD`, `COMPLETED`, `CANCELLED`, `DECLINED`, `IN_PROGRESS`, `EXPIRED`, `PAUSED`, `DELIVERED`, `REVIEW`, `REVISION`, `SUSPENDED`, `ACCEPTED`, `APPROVED` |
| `wallet_record_type` | `CREDIT`, `DEBIT` |

`record_status` is a single shared enum reused across almost every table's `status` column, with each table only using the subset relevant to its lifecycle (e.g. `gig.status` defaults `DRAFT`; `job.status`/`chat_room.status`/`chat_message.status` default `ACTIVE`; `profile.status` defaults `PENDING`; `job_proposal.status`/`escrow.status`/`"order".status` default `PENDING`).

## 3.3 Tables

### `department`
No FK dependencies.
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | default `uuid_generate_v4()` |
| created_at / updated_at | TIMESTAMPTZ | |
| status | `record_status` | default `ACTIVE` |
| name | TEXT NOT NULL | |
| acronym, description, code, image, id_pattern | TEXT | nullable |

### `category`
Self-referencing hierarchy.
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| status | `record_status` | default `ACTIVE` |
| name | TEXT NOT NULL | |
| slug | TEXT NOT NULL UNIQUE | |
| description, image | TEXT | nullable |
| parent | UUID FK → `category.id` | `ON DELETE SET NULL` (nullable — top-level categories have no parent) |
| ordering | INTEGER | default 0, drives display order |

### `profile`
Depends on `department`. This is the canonical user identity table (`profiles.id` referenced everywhere).
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| status | `record_status` | default `PENDING` |
| name | TEXT NOT NULL | |
| username | TEXT NOT NULL UNIQUE | |
| password | TEXT NOT NULL | Supabase-managed hash |
| email | TEXT NOT NULL UNIQUE | |
| role | `user_role` | default `USER` |
| phone, bio, avatar, cover, website, portfolio, google | TEXT | nullable |
| skills | TEXT[] | default `{}` |
| socials | JSONB | default `{}` |
| verified | BOOLEAN NOT NULL | default `false` |
| fcm_token | TEXT | nullable — currently unused (topic-based push instead) |
| department | UUID FK → `department.id` | `ON DELETE SET NULL` |
| student_id | TEXT | nullable |

### `gig`
Depends on `profile`, `category`.
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| status | `record_status` | default `DRAFT` |
| seller | UUID FK → `profile.id` | `ON DELETE CASCADE` |
| category | UUID FK → `category.id` | `ON DELETE RESTRICT` |
| title | TEXT NOT NULL | |
| slug | TEXT NOT NULL UNIQUE | |
| description | TEXT NOT NULL | |
| images | TEXT[] | default `{}` — R2 URLs, Cloudinary-served |
| tags | TEXT[] | default `{}`, GIN-indexed |
| views | INTEGER | default 0 |
| packages | JSONB NOT NULL | default `[]` — array of `{tier: BASIC/STANDARD/PREMIUM, price, delivery_days, ...}` |
| faq | JSONB NOT NULL | default `[]` |

### `job`
Depends on `profile`, `category`.
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| status | `record_status` | default `ACTIVE` |
| owner | UUID FK → `profile.id` | `ON DELETE CASCADE` |
| category | UUID FK → `category.id` | `ON DELETE RESTRICT` |
| title | TEXT NOT NULL | |
| slug | TEXT NOT NULL UNIQUE | |
| description | TEXT NOT NULL | |
| attachments | TEXT[] | default `{}` |
| type | `job_type` | default `OTHER` |
| budget | TEXT NOT NULL | free-text (range or fixed) |
| deadline | TIMESTAMPTZ NOT NULL | |
| location, required_skills, tags | TEXT / TEXT[] | nullable, GIN-indexed where array |
| views | INTEGER | default 0 |

### `job_proposal`
Depends on `job`, `profile`.
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| status | `record_status` | default `PENDING` |
| job | UUID FK → `job.id` | `ON DELETE CASCADE` |
| applicant | UUID FK → `profile.id` | `ON DELETE CASCADE` |
| description | TEXT NOT NULL | cover letter |
| attachments | TEXT[] | default `{}` |

### `"order"` (reserved word — always double-quoted in SQL)
Depends on `profile`, `gig`, `job`, `job_proposal`.
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| status | `record_status` | default `PENDING` |
| code | TEXT NOT NULL UNIQUE | human-readable order code |
| buyer | UUID FK → `profile.id` | `ON DELETE CASCADE` |
| seller | UUID FK → `profile.id` | `ON DELETE CASCADE` |
| gig | UUID FK → `gig.id` | nullable, `ON DELETE SET NULL` |
| job | UUID FK → `job.id` | nullable, `ON DELETE SET NULL` |
| package | `gig_package_tier` | nullable — set for gig-sourced orders |
| proposal | UUID FK → `job_proposal.id` | nullable, `ON DELETE SET NULL` — set for job-sourced orders |
| description, note | TEXT | nullable |
| source | `order_source` NOT NULL | `JOB` or `GIG` — exactly one of `gig`/`job`+`proposal` should be populated accordingly |
| total_price | NUMERIC(12,2) | default 0 |
| title | TEXT NOT NULL | |
| amount | INTEGER | default 1 (quantity) |
| deadline | TIMESTAMPTZ | nullable |
| cancellation_reason | TEXT | nullable |
| cancellation_request_by | UUID FK → `profile.id` | nullable — either party can request cancellation |
| cancellation_request_at | TIMESTAMPTZ | nullable |

### `chat_room`
Depends on `"order"`, `profile`. One room per order.
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| status | `record_status` | default `ACTIVE` |
| title | TEXT NOT NULL | |
| order | UUID FK → `"order".id` NOT NULL | `ON DELETE CASCADE` |
| buyer, seller | UUID FK → `profile.id` NOT NULL | `ON DELETE CASCADE` |

### `chat_message`
Depends on `chat_room`, `profile`.
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| status | `record_status` | default `ACTIVE` |
| room | UUID FK → `chat_room.id` NOT NULL | `ON DELETE CASCADE` |
| sender | UUID FK → `profile.id` NOT NULL | `ON DELETE CASCADE` |
| content | TEXT | nullable (attachment-only messages allowed) |
| attachment_url, attachment_name, attachment_type | TEXT | nullable — single attachment per message, R2-hosted |

### `wallet`
Depends on `profile`. One wallet per user.
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| status | `record_status` | default `ACTIVE` |
| name | TEXT NOT NULL | |
| user | UUID FK → `profile.id` NOT NULL | `ON DELETE CASCADE` |
| balance | NUMERIC(12,2) | default 0 |
| currency | TEXT | default `'BDT'` |

### `wallet_record` — append-only ledger (RLS enabled)
Depends on `wallet`, `"order"`, `escrow`.
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| status | `record_status` | default `ACTIVE` |
| wallet | UUID FK → `wallet.id` NOT NULL | `ON DELETE CASCADE` |
| amount | NUMERIC(12,2) NOT NULL | |
| type | `wallet_record_type` NOT NULL | `CREDIT` / `DEBIT` |
| description, metadata (JSONB), note | | nullable |
| order | UUID FK → `"order".id` NOT NULL | `ON DELETE CASCADE` |
| escrow | UUID FK → `escrow.id` NOT NULL | `ON DELETE CASCADE` |
| payment_method | TEXT NOT NULL | default `'BALANCE'` |
| transaction_id | TEXT | nullable — external gateway reference |
| payment_gateway | TEXT NOT NULL | default `'BALANCE'` |

**RLS policies:** users can `SELECT` only records belonging to their own wallet (or if admin); `INSERT`/`UPDATE`/`DELETE` restricted to `is_admin()` (i.e., only server-side RPCs running with elevated rights can write).

### `escrow` — financial holding record per order (RLS enabled)
Depends on `"order"`, `profile`.
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| status | `record_status` | default `PENDING` |
| order | UUID FK → `"order".id` NOT NULL | `ON DELETE CASCADE` |
| sender | UUID FK → `profile.id` NOT NULL | buyer |
| receiver | UUID FK → `profile.id` NOT NULL | seller |
| amount | NUMERIC(12,2) NOT NULL | |
| platform_fee | NUMERIC(12,2) | default 0 |
| released_at, auto_released_at | TIMESTAMPTZ | nullable |
| note | TEXT | nullable |
| payment_status | TEXT NOT NULL | default `'UNPAID'` (e.g. `UNPAID` → `PAID`) |
| payment_method, transaction_id | TEXT | nullable |
| disputed_at, resolved_at | TIMESTAMPTZ | nullable |
| resolved_by | UUID FK → `profile.id` | nullable, admin who resolved |
| dispute_reason, admin_note | TEXT | nullable |

**RLS policies:** `SELECT` allowed for `sender`, `receiver`, or admin; `INSERT`/`UPDATE`/`DELETE` restricted to `is_admin()` (rows are only ever mutated through RPC stored procedures).

### `reviews`
Depends on `profile`, `gig`, `"order"`.
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | default `gen_random_uuid()` |
| reviewer | UUID FK → `profile.id` NOT NULL | `ON DELETE CASCADE` |
| gig | UUID FK → `gig.id` NOT NULL | `ON DELETE CASCADE` |
| seller | UUID FK → `profile.id` NOT NULL | denormalized for fast lookups |
| order | UUID FK → `"order".id` NOT NULL | `ON DELETE CASCADE`, **UNIQUE** (one review per order) |
| rating | SMALLINT NOT NULL | `CHECK (rating BETWEEN 1 AND 5)` |
| note | TEXT | nullable |

Constraint: `UNIQUE(reviewer, gig, "order")` in addition to `UNIQUE("order")`.

### `system_config` — singleton
| Column | Type | Notes |
|---|---|---|
| id | BOOLEAN PK | default `true`, `CHECK (id = true)` — enforces exactly one row |
| maintenance_mode | BOOLEAN | default `false` |
| registration_enabled | BOOLEAN | default `true` |
| platform_fee_percent | NUMERIC(5,2) | default `5.00` |
| max_gig_images | INTEGER | default `6` |
| max_portfolio_images | INTEGER | default `10` |
| max_upload_size_mb | INTEGER | default `25` |
| support_email, support_phone | TEXT | nullable |

### `hero_banners`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| title | TEXT NOT NULL | |
| subtitle | TEXT | nullable |
| image_url, alt_text | TEXT NOT NULL | Cloudinary-hosted |
| button_text, button_url | TEXT | nullable |
| sort_order | INTEGER | default 0 |
| is_active | BOOLEAN | default `true` |
| starts_at, ends_at | TIMESTAMPTZ | nullable — scheduling window |

### `ad_banners`
Same shape as `hero_banners` plus:
| Column | Type | Notes |
|---|---|---|
| name | TEXT NOT NULL | |
| placement | TEXT NOT NULL | e.g. homepage slot identifier |
| target_url | TEXT | nullable |

### `announcements`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| title, content | TEXT NOT NULL | `content` never exposed on public list endpoint, only detail |
| type | TEXT | default `'info'` |
| is_active | BOOLEAN | default `true` |
| send_push | BOOLEAN | default `true` — triggers a Firebase topic push on admin create |
| starts_at, ends_at | TIMESTAMPTZ | nullable — scheduling window; public API 404s outside this window |

## 3.4 Stored Procedures (RPC)

All financial/multi-table mutations are implemented as PostgreSQL functions (`web/schema/99*_*.sql`) and invoked via Supabase RPC — never assembled as multiple separate client-driven writes. This guarantees atomicity for money-moving operations.

| Procedure | Purpose |
|---|---|
| `991_signup_transaction` | Creates `profile` + `wallet` atomically on registration |
| `992_delete_category_if_unused` | Safe category delete (only if no gigs/jobs/subcategories reference it) |
| `993_delete_gig_if_owner_or_admin` / `993_delete_job_if_owner_or_admin` / `993_delete_job_proposal_if_owner_or_admin` | Ownership-checked soft/hard delete |
| `994_update_gig_if_owner_or_admin` / `994_update_job_if_owner_or_admin` | Ownership-checked update |
| `995_increment_gig_views` / `995_increment_job_views` | Atomic view counters |
| `996_get_gig_by_id` / `996_get_job_by_id` | Detail fetch with joined seller/category data |
| `997_create_gig_order` | Places a gig order: validates seller ≠ buyer, creates `"order"` + `escrow` (`PENDING`/`UNPAID`) |
| `997_create_job_order` | Same, for job-sourced orders |
| `997_approve_job_proposal` | Job owner accepts a proposal → creates order + escrow, rejects sibling proposals |
| `997_accept_order` | Seller/buyer accepts an order, transitions to `IN_PROGRESS` |
| `997_deliver_order` | Seller submits deliverables, order → `DELIVERED` |
| `997_complete_order` | Buyer approves delivery → releases escrow (`RELEASED`), credits seller wallet via `wallet_record`, order → `COMPLETED` |
| `997_cancel_order` | Cancellation-request/response flow, refunds escrow if applicable |
| `997_request_dispute` | Either party raises a dispute → escrow/order → `DISPUTED` |
| `997_resolve_dispute` | Admin resolves in favor of buyer (refund) or seller (release) |
| `997_process_payment_success` | SSLCommerz webhook handler: marks escrow `PAID`, writes `wallet_record` |
| `997_get_applied_job_details` | Applicant's view of a job + their own proposal status |
| `997_get_chat_room_by_id` / `997_list_chat_rooms` / `997_list_chat_messages` / `997_send_chat_message` | Chat data access/mutation with participant checks |
| `998_get_admin_dashboard_data` | Aggregated admin analytics |
| `998_get_db_daily_summary` | Scheduled (cron) daily platform summary |
| `999_get_public_site_data` | Public homepage payload: active hero banners, ad banners, announcements, featured gigs/jobs |

## 3.5 Row-Level Security (RLS)

- Enabled explicitly on `wallet_record` and `escrow` (§3.3), with a shared `is_admin()` helper function.
- Broader policy set defined in `910_rls.sql` (see file for the full per-table policy list — general pattern: owners/participants can `SELECT` their own rows; `INSERT`/`UPDATE`/`DELETE` on financial tables is restricted to admin/RPC, and non-financial tables (`gig`, `job`, `job_proposal`, etc.) allow owner-scoped writes).
- `900_triggers.sql` attaches a generic `trigger_set_updated_at()` trigger to every table so `updated_at` is always server-maintained.

## 3.6 Design-Time Source Material

The `web/data/schema/` directory holds the original design artifacts these migrations were implemented from:
- `er_diagram.mmd` — early ER diagram sketch (superseded by [04-er-diagram.md](./04-er-diagram.md), which reflects the actual SQL).
- `gighub-sql.sql` — early full schema draft.
- `use_cases.json`, `use_case_diagram.drawio`, `use_case_diagram (1).puml` — use-case modeling source, rendered in [09-use-cases.md](./09-use-cases.md).
