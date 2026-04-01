# GigHub Backend — Database Schema Design

> All Directus collections use the `gh_` prefix.
> All foreign keys referencing users point to `gh_profiles.id` (never `firebase_uid`).
> File/image fields store **Cloudflare R2 URL strings** — Directus file management is NOT used.

---

## Table of Contents

1. [gh_profiles](#1-gh_profiles)
2. [gh_categories](#2-gh_categories)
3. [gh_gigs](#3-gh_gigs)
4. [gh_gig_packages](#4-gh_gig_packages)
5. [gh_gig_images](#5-gh_gig_images)
6. [gh_jobs](#6-gh_jobs)
7. [gh_proposals](#7-gh_proposals)
8. [gh_orders](#8-gh_orders)
9. [gh_order_milestones](#9-gh_order_milestones)
10. [gh_order_deliveries](#10-gh_order_deliveries)
11. [gh_escrow](#11-gh_escrow)
12. [gh_transactions](#12-gh_transactions)
13. [gh_withdrawals](#13-gh_withdrawals)
14. [gh_conversations](#14-gh_conversations)
15. [gh_messages](#15-gh_messages)
16. [gh_reviews](#16-gh_reviews)
17. [gh_notifications](#17-gh_notifications)
18. [gh_bookmarks](#18-gh_bookmarks)
19. [gh_reports](#19-gh_reports)
20. [gh_platform_config](#20-gh_platform_config)
21. [Entity Relationship Diagram](#21-entity-relationship-diagram)

---

## 1. gh_profiles

> Canonical user identity. Created automatically on first login.

| Column                | Type            | Constraints         | Description                                                         |
| --------------------- | --------------- | ------------------- | ------------------------------------------------------------------- |
| `id`                  | `uuid`          | PK, auto-generated  | Canonical user identifier used everywhere                           |
| `firebase_uid`        | `varchar(255)`  | UNIQUE, NOT NULL    | Firebase Auth UID — internal linkage only                           |
| `display_name`        | `varchar(100)`  | NOT NULL            | User's display name                                                 |
| `username`            | `varchar(50)`   | UNIQUE, NOT NULL    | Unique handle (e.g., @rafiq)                                        |
| `email`               | `varchar(255)`  | UNIQUE, NOT NULL    | User's email address                                                |
| `avatar`              | `text`          | NULL                | Cloudflare R2 URL string                                            |
| `bio`                 | `text`          | NULL                | Short biography                                                     |
| `skills`              | `json`          | DEFAULT '[]'        | Array of skill strings, e.g. `["Design", "React", "Video Editing"]` |
| `availability_status` | `varchar(20)`   | DEFAULT 'available' | Enum: `available`, `busy`, `offline`                                |
| `is_verified`         | `boolean`       | DEFAULT false       | JnU student verification status                                     |
| `role`                | `varchar(20)`   | DEFAULT 'student'   | Enum: `student`, `admin`                                            |
| `total_earnings`      | `decimal(12,2)` | DEFAULT 0.00        | Lifetime earnings on platform                                       |
| `avg_rating`          | `decimal(3,2)`  | DEFAULT 0.00        | Aggregated average rating                                           |
| `total_reviews`       | `integer`       | DEFAULT 0           | Total number of reviews received                                    |
| `fcm_token`           | `text`          | NULL                | Firebase Cloud Messaging token for push notifications               |
| `notification_prefs`  | `json`          | DEFAULT '{}'        | Notification preferences per type                                   |
| `created_at`          | `timestamp`     | DEFAULT NOW()       | Account creation time                                               |
| `updated_at`          | `timestamp`     | DEFAULT NOW()       | Last profile update                                                 |

**Indexes:**

- `idx_profiles_username` on `username`
- `idx_profiles_firebase_uid` on `firebase_uid`
- `idx_profiles_skills` GIN index on `skills`

---

## 2. gh_categories

> Predefined categories for gigs and jobs.

| Column        | Type          | Constraints        | Description                    |
| ------------- | ------------- | ------------------ | ------------------------------ |
| `id`          | `uuid`        | PK, auto-generated | Category identifier            |
| `name`        | `varchar(50)` | UNIQUE, NOT NULL   | Category name (e.g., "Design") |
| `slug`        | `varchar(50)` | UNIQUE, NOT NULL   | URL-safe slug (e.g., "design") |
| `icon`        | `varchar(50)` | NULL               | Icon identifier or emoji       |
| `description` | `text`        | NULL               | Category description           |
| `sort_order`  | `integer`     | DEFAULT 0          | Display order                  |
| `is_active`   | `boolean`     | DEFAULT true       | Whether category is visible    |
| `created_at`  | `timestamp`   | DEFAULT NOW()      | —                              |

**Seed Data:** Design, Development, Writing, Video & Animation, Marketing, Data & Analytics, Music & Audio, Translation, Business, Tutoring

---

## 3. gh_gigs

> Service listings created by students.

| Column          | Type           | Constraints                       | Description                                  |
| --------------- | -------------- | --------------------------------- | -------------------------------------------- |
| `id`            | `uuid`         | PK, auto-generated                | Gig identifier                               |
| `seller_id`     | `uuid`         | FK → `gh_profiles.id`, NOT NULL   | Creator of the gig                           |
| `category_id`   | `uuid`         | FK → `gh_categories.id`, NOT NULL | Gig category                                 |
| `title`         | `varchar(200)` | NOT NULL                          | Gig title                                    |
| `slug`          | `varchar(220)` | UNIQUE, NOT NULL                  | URL-safe slug                                |
| `description`   | `text`         | NOT NULL                          | Detailed gig description                     |
| `tags`          | `json`         | DEFAULT '[]'                      | Array of tag strings                         |
| `status`        | `varchar(20)`  | DEFAULT 'active'                  | Enum: `draft`, `active`, `paused`, `deleted` |
| `avg_rating`    | `decimal(3,2)` | DEFAULT 0.00                      | Average rating for this gig                  |
| `total_reviews` | `integer`      | DEFAULT 0                         | Total reviews for this gig                   |
| `total_orders`  | `integer`      | DEFAULT 0                         | Total completed orders                       |
| `view_count`    | `integer`      | DEFAULT 0                         | Number of views                              |
| `created_at`    | `timestamp`    | DEFAULT NOW()                     | —                                            |
| `updated_at`    | `timestamp`    | DEFAULT NOW()                     | —                                            |

**Indexes:**

- `idx_gigs_seller` on `seller_id`
- `idx_gigs_category` on `category_id`
- `idx_gigs_status` on `status`
- `idx_gigs_title_fts` full-text index on `title`, `description`
- `idx_gigs_tags` GIN index on `tags`

---

## 4. gh_gig_packages

> Pricing tiers for each gig (Basic / Standard / Premium).

| Column           | Type            | Constraints                                    | Description                                     |
| ---------------- | --------------- | ---------------------------------------------- | ----------------------------------------------- |
| `id`             | `uuid`          | PK, auto-generated                             | Package identifier                              |
| `gig_id`         | `uuid`          | FK → `gh_gigs.id`, NOT NULL, ON DELETE CASCADE | Parent gig                                      |
| `tier`           | `varchar(20)`   | NOT NULL                                       | Enum: `basic`, `standard`, `premium`            |
| `title`          | `varchar(100)`  | NOT NULL                                       | Package name (e.g., "Basic Package")            |
| `description`    | `text`          | NULL                                           | What's included                                 |
| `price`          | `decimal(10,2)` | NOT NULL                                       | Price in BDT                                    |
| `delivery_days`  | `integer`       | NOT NULL                                       | Delivery time in days                           |
| `revision_count` | `integer`       | DEFAULT 0                                      | Number of revisions included (-1 for unlimited) |
| `features`       | `json`          | DEFAULT '[]'                                   | Array of included features                      |
| `created_at`     | `timestamp`     | DEFAULT NOW()                                  | —                                               |

**Constraints:**

- UNIQUE(`gig_id`, `tier`) — one package per tier per gig

---

## 5. gh_gig_images

> Gallery images for gigs.

| Column       | Type        | Constraints                                    | Description       |
| ------------ | ----------- | ---------------------------------------------- | ----------------- |
| `id`         | `uuid`      | PK, auto-generated                             | Image identifier  |
| `gig_id`     | `uuid`      | FK → `gh_gigs.id`, NOT NULL, ON DELETE CASCADE | Parent gig        |
| `image_url`  | `text`      | NOT NULL                                       | Cloudflare R2 URL |
| `sort_order` | `integer`   | DEFAULT 0                                      | Display order     |
| `created_at` | `timestamp` | DEFAULT NOW()                                  | —                 |

**Constraint:** Max 5 images per gig (enforced at application level)

---

## 6. gh_jobs

> Job/task postings created by students.

| Column            | Type            | Constraints                       | Description                                                |
| ----------------- | --------------- | --------------------------------- | ---------------------------------------------------------- |
| `id`              | `uuid`          | PK, auto-generated                | Job identifier                                             |
| `poster_id`       | `uuid`          | FK → `gh_profiles.id`, NOT NULL   | Creator of the job                                         |
| `category_id`     | `uuid`          | FK → `gh_categories.id`, NOT NULL | Job category                                               |
| `title`           | `varchar(200)`  | NOT NULL                          | Job title                                                  |
| `slug`            | `varchar(220)`  | UNIQUE, NOT NULL                  | URL-safe slug                                              |
| `description`     | `text`          | NOT NULL                          | Detailed job description                                   |
| `job_type`        | `varchar(20)`   | NOT NULL                          | Enum: `paid`, `free`, `internship`, `volunteer`, `contest` |
| `budget_type`     | `varchar(20)`   | DEFAULT 'fixed'                   | Enum: `fixed`, `hourly`, `negotiable`                      |
| `budget_min`      | `decimal(10,2)` | NULL                              | Minimum budget (BDT)                                       |
| `budget_max`      | `decimal(10,2)` | NULL                              | Maximum budget (BDT)                                       |
| `deadline`        | `timestamp`     | NULL                              | Job deadline                                               |
| `required_skills` | `json`          | DEFAULT '[]'                      | Array of required skill strings                            |
| `attachments`     | `json`          | DEFAULT '[]'                      | Array of R2 URL strings for reference files                |
| `status`          | `varchar(20)`   | DEFAULT 'open'                    | Enum: `open`, `in_progress`, `closed`, `cancelled`         |
| `total_proposals` | `integer`       | DEFAULT 0                         | Count of received proposals                                |
| `created_at`      | `timestamp`     | DEFAULT NOW()                     | —                                                          |
| `updated_at`      | `timestamp`     | DEFAULT NOW()                     | —                                                          |

**Indexes:**

- `idx_jobs_poster` on `poster_id`
- `idx_jobs_category` on `category_id`
- `idx_jobs_status` on `status`
- `idx_jobs_type` on `job_type`
- `idx_jobs_title_fts` full-text index on `title`, `description`
- `idx_jobs_skills` GIN index on `required_skills`

---

## 7. gh_proposals

> Proposals submitted by students for job postings.

| Column           | Type            | Constraints                     | Description                                          |
| ---------------- | --------------- | ------------------------------- | ---------------------------------------------------- |
| `id`             | `uuid`          | PK, auto-generated              | Proposal identifier                                  |
| `job_id`         | `uuid`          | FK → `gh_jobs.id`, NOT NULL     | Target job                                           |
| `applicant_id`   | `uuid`          | FK → `gh_profiles.id`, NOT NULL | Student submitting the proposal                      |
| `cover_letter`   | `text`          | NOT NULL                        | Proposal cover letter                                |
| `quoted_price`   | `decimal(10,2)` | NULL                            | Proposed price (BDT)                                 |
| `estimated_days` | `integer`       | NULL                            | Estimated delivery in days                           |
| `attachments`    | `json`          | DEFAULT '[]'                    | Array of R2 URL strings                              |
| `status`         | `varchar(20)`   | DEFAULT 'pending'               | Enum: `pending`, `accepted`, `rejected`, `withdrawn` |
| `created_at`     | `timestamp`     | DEFAULT NOW()                   | —                                                    |
| `updated_at`     | `timestamp`     | DEFAULT NOW()                   | —                                                    |

**Constraints:**

- UNIQUE(`job_id`, `applicant_id`) — one proposal per student per job
- CHECK: `applicant_id` ≠ job's `poster_id` (enforced at application level)

**Indexes:**

- `idx_proposals_job` on `job_id`
- `idx_proposals_applicant` on `applicant_id`
- `idx_proposals_status` on `status`

---

## 8. gh_orders

> Orders created from gig purchases or accepted job proposals.

| Column                | Type            | Constraints                     | Description                                         |
| --------------------- | --------------- | ------------------------------- | --------------------------------------------------- |
| `id`                  | `uuid`          | PK, auto-generated              | Order identifier                                    |
| `order_number`        | `varchar(20)`   | UNIQUE, NOT NULL                | Human-readable order number (e.g., GH-20260311-001) |
| `buyer_id`            | `uuid`          | FK → `gh_profiles.id`, NOT NULL | Student who is paying                               |
| `seller_id`           | `uuid`          | FK → `gh_profiles.id`, NOT NULL | Student who is delivering                           |
| `source_type`         | `varchar(10)`   | NOT NULL                        | Enum: `gig`, `job`                                  |
| `gig_id`              | `uuid`          | FK → `gh_gigs.id`, NULL         | Source gig (if source_type = 'gig')                 |
| `gig_package_id`      | `uuid`          | FK → `gh_gig_packages.id`, NULL | Selected package                                    |
| `job_id`              | `uuid`          | FK → `gh_jobs.id`, NULL         | Source job (if source_type = 'job')                 |
| `proposal_id`         | `uuid`          | FK → `gh_proposals.id`, NULL    | Accepted proposal                                   |
| `title`               | `varchar(200)`  | NOT NULL                        | Order title (copied from gig/job)                   |
| `description`         | `text`          | NULL                            | Order description / requirements                    |
| `amount`              | `decimal(10,2)` | NOT NULL                        | Total order amount (BDT)                            |
| `platform_fee`        | `decimal(10,2)` | DEFAULT 0.00                    | Platform fee amount                                 |
| `seller_earnings`     | `decimal(10,2)` | DEFAULT 0.00                    | Amount seller receives (amount - platform_fee)      |
| `delivery_days`       | `integer`       | NOT NULL                        | Expected delivery time                              |
| `revision_count`      | `integer`       | DEFAULT 0                       | Allowed revisions                                   |
| `revisions_used`      | `integer`       | DEFAULT 0                       | Revisions used so far                               |
| `status`              | `varchar(20)`   | DEFAULT 'pending'               | Enum: see below                                     |
| `delivery_deadline`   | `timestamp`     | NULL                            | Calculated delivery deadline                        |
| `completed_at`        | `timestamp`     | NULL                            | When order was completed                            |
| `cancelled_at`        | `timestamp`     | NULL                            | When order was cancelled                            |
| `cancellation_reason` | `text`          | NULL                            | Reason for cancellation                             |
| `created_at`          | `timestamp`     | DEFAULT NOW()                   | —                                                   |
| `updated_at`          | `timestamp`     | DEFAULT NOW()                   | —                                                   |

**Order Status Enum:** `pending`, `active`, `in_progress`, `delivered`, `revision_requested`, `completed`, `disputed`, `cancelled`, `refunded`

**Indexes:**

- `idx_orders_buyer` on `buyer_id`
- `idx_orders_seller` on `seller_id`
- `idx_orders_status` on `status`
- `idx_orders_gig` on `gig_id`
- `idx_orders_job` on `job_id`
- `idx_orders_number` on `order_number`

---

## 9. gh_order_milestones

> Milestone breakdown for larger orders (especially job-based).

| Column        | Type            | Constraints                                      | Description                                                                   |
| ------------- | --------------- | ------------------------------------------------ | ----------------------------------------------------------------------------- |
| `id`          | `uuid`          | PK, auto-generated                               | Milestone identifier                                                          |
| `order_id`    | `uuid`          | FK → `gh_orders.id`, NOT NULL, ON DELETE CASCADE | Parent order                                                                  |
| `title`       | `varchar(200)`  | NOT NULL                                         | Milestone title                                                               |
| `description` | `text`          | NULL                                             | What's included in this milestone                                             |
| `amount`      | `decimal(10,2)` | NOT NULL                                         | Milestone payment amount (BDT)                                                |
| `due_date`    | `timestamp`     | NULL                                             | Expected completion date                                                      |
| `status`      | `varchar(20)`   | DEFAULT 'pending'                                | Enum: `pending`, `in_progress`, `delivered`, `approved`, `revision_requested` |
| `sort_order`  | `integer`       | DEFAULT 0                                        | Milestone sequence                                                            |
| `created_at`  | `timestamp`     | DEFAULT NOW()                                    | —                                                                             |
| `updated_at`  | `timestamp`     | DEFAULT NOW()                                    | —                                                                             |

---

## 10. gh_order_deliveries

> Delivery submissions for orders/milestones.

| Column          | Type          | Constraints                         | Description                                       |
| --------------- | ------------- | ----------------------------------- | ------------------------------------------------- |
| `id`            | `uuid`        | PK, auto-generated                  | Delivery identifier                               |
| `order_id`      | `uuid`        | FK → `gh_orders.id`, NOT NULL       | Parent order                                      |
| `milestone_id`  | `uuid`        | FK → `gh_order_milestones.id`, NULL | Related milestone (if applicable)                 |
| `seller_id`     | `uuid`        | FK → `gh_profiles.id`, NOT NULL     | Delivering student                                |
| `message`       | `text`        | NOT NULL                            | Delivery message/notes                            |
| `files`         | `json`        | DEFAULT '[]'                        | Array of R2 URL strings for delivered files       |
| `delivery_type` | `varchar(20)` | DEFAULT 'delivery'                  | Enum: `delivery`, `revision`                      |
| `status`        | `varchar(20)` | DEFAULT 'pending'                   | Enum: `pending`, `accepted`, `revision_requested` |
| `created_at`    | `timestamp`   | DEFAULT NOW()                       | —                                                 |

**Indexes:**

- `idx_deliveries_order` on `order_id`

---

## 11. gh_escrow

> Escrow records for holding payments.

| Column            | Type            | Constraints                           | Description                                      |
| ----------------- | --------------- | ------------------------------------- | ------------------------------------------------ |
| `id`              | `uuid`          | PK, auto-generated                    | Escrow identifier                                |
| `order_id`        | `uuid`          | FK → `gh_orders.id`, UNIQUE, NOT NULL | Associated order                                 |
| `buyer_id`        | `uuid`          | FK → `gh_profiles.id`, NOT NULL       | Payer                                            |
| `seller_id`       | `uuid`          | FK → `gh_profiles.id`, NOT NULL       | Payee                                            |
| `amount`          | `decimal(10,2)` | NOT NULL                              | Total escrowed amount                            |
| `platform_fee`    | `decimal(10,2)` | DEFAULT 0.00                          | Fee to be deducted                               |
| `status`          | `varchar(20)`   | DEFAULT 'held'                        | Enum: `held`, `released`, `refunded`, `disputed` |
| `released_at`     | `timestamp`     | NULL                                  | When funds were released                         |
| `auto_release_at` | `timestamp`     | NULL                                  | Auto-release deadline                            |
| `created_at`      | `timestamp`     | DEFAULT NOW()                         | —                                                |
| `updated_at`      | `timestamp`     | DEFAULT NOW()                         | —                                                |

---

## 12. gh_transactions

> Immutable log of all financial transactions.

| Column              | Type            | Constraints                     | Description                                                        |
| ------------------- | --------------- | ------------------------------- | ------------------------------------------------------------------ |
| `id`                | `uuid`          | PK, auto-generated              | Transaction identifier                                             |
| `profile_id`        | `uuid`          | FK → `gh_profiles.id`, NOT NULL | Affected user                                                      |
| `order_id`          | `uuid`          | FK → `gh_orders.id`, NULL       | Related order                                                      |
| `type`              | `varchar(30)`   | NOT NULL                        | Enum: `payment`, `earning`, `platform_fee`, `withdrawal`, `refund` |
| `amount`            | `decimal(10,2)` | NOT NULL                        | Transaction amount                                                 |
| `direction`         | `varchar(10)`   | NOT NULL                        | Enum: `credit`, `debit`                                            |
| `balance_after`     | `decimal(12,2)` | NOT NULL                        | Balance after transaction                                          |
| `description`       | `text`          | NULL                            | Human-readable description                                         |
| `payment_method`    | `varchar(30)`   | NULL                            | e.g., `sslcommerz`, `bkash`, `wallet`                              |
| `payment_reference` | `varchar(255)`  | NULL                            | External payment gateway reference ID                              |
| `status`            | `varchar(20)`   | DEFAULT 'completed'             | Enum: `pending`, `completed`, `failed`                             |
| `created_at`        | `timestamp`     | DEFAULT NOW()                   | —                                                                  |

**Indexes:**

- `idx_transactions_profile` on `profile_id`
- `idx_transactions_order` on `order_id`
- `idx_transactions_type` on `type`
- `idx_transactions_created` on `created_at`

---

## 13. gh_withdrawals

> Withdrawal requests from students.

| Column            | Type            | Constraints                     | Description                                            |
| ----------------- | --------------- | ------------------------------- | ------------------------------------------------------ |
| `id`              | `uuid`          | PK, auto-generated              | Withdrawal identifier                                  |
| `profile_id`      | `uuid`          | FK → `gh_profiles.id`, NOT NULL | Requesting student                                     |
| `amount`          | `decimal(10,2)` | NOT NULL                        | Withdrawal amount (BDT)                                |
| `method`          | `varchar(30)`   | NOT NULL                        | Enum: `bkash`, `nagad`, `bank_transfer`                |
| `account_details` | `json`          | NOT NULL                        | { number, name, bank_name, branch, etc. }              |
| `status`          | `varchar(20)`   | DEFAULT 'pending'               | Enum: `pending`, `processing`, `completed`, `rejected` |
| `admin_note`      | `text`          | NULL                            | Admin notes on rejection/processing                    |
| `processed_at`    | `timestamp`     | NULL                            | When withdrawal was processed                          |
| `created_at`      | `timestamp`     | DEFAULT NOW()                   | —                                                      |

---

## 14. gh_conversations

> Chat conversations between two students.

| Column              | Type        | Constraints                     | Description                       |
| ------------------- | ----------- | ------------------------------- | --------------------------------- |
| `id`                | `uuid`      | PK, auto-generated              | Conversation identifier           |
| `participant_1`     | `uuid`      | FK → `gh_profiles.id`, NOT NULL | First participant                 |
| `participant_2`     | `uuid`      | FK → `gh_profiles.id`, NOT NULL | Second participant                |
| `order_id`          | `uuid`      | FK → `gh_orders.id`, NULL       | Linked order (if order chat)      |
| `gig_id`            | `uuid`      | FK → `gh_gigs.id`, NULL         | Linked gig (if pre-order inquiry) |
| `last_message_at`   | `timestamp` | NULL                            | Timestamp of last message         |
| `last_message_text` | `text`      | NULL                            | Preview of last message           |
| `created_at`        | `timestamp` | DEFAULT NOW()                   | —                                 |

**Constraints:**

- UNIQUE(`participant_1`, `participant_2`, `order_id`) — one conversation per pair per order context

**Indexes:**

- `idx_conversations_p1` on `participant_1`
- `idx_conversations_p2` on `participant_2`
- `idx_conversations_order` on `order_id`
- `idx_conversations_last_msg` on `last_message_at`

---

## 15. gh_messages

> Individual chat messages.

| Column            | Type           | Constraints                                             | Description                                      |
| ----------------- | -------------- | ------------------------------------------------------- | ------------------------------------------------ |
| `id`              | `uuid`         | PK, auto-generated                                      | Message identifier                               |
| `conversation_id` | `uuid`         | FK → `gh_conversations.id`, NOT NULL, ON DELETE CASCADE | Parent conversation                              |
| `sender_id`       | `uuid`         | FK → `gh_profiles.id`, NOT NULL                         | Message sender                                   |
| `content`         | `text`         | NULL                                                    | Message text content                             |
| `message_type`    | `varchar(20)`  | DEFAULT 'text'                                          | Enum: `text`, `image`, `file`, `voice`, `system` |
| `file_url`        | `text`         | NULL                                                    | R2 URL for file/image/voice messages             |
| `file_name`       | `varchar(255)` | NULL                                                    | Original file name                               |
| `file_size`       | `integer`      | NULL                                                    | File size in bytes                               |
| `is_read`         | `boolean`      | DEFAULT false                                           | Read receipt                                     |
| `read_at`         | `timestamp`    | NULL                                                    | When message was read                            |
| `created_at`      | `timestamp`    | DEFAULT NOW()                                           | —                                                |

**Indexes:**

- `idx_messages_conversation` on `conversation_id`
- `idx_messages_sender` on `sender_id`
- `idx_messages_created` on `created_at`
- `idx_messages_unread` on `conversation_id, is_read` WHERE `is_read = false`

---

## 16. gh_reviews

> Mutual reviews between order parties.

| Column                 | Type           | Constraints                     | Description                        |
| ---------------------- | -------------- | ------------------------------- | ---------------------------------- |
| `id`                   | `uuid`         | PK, auto-generated              | Review identifier                  |
| `order_id`             | `uuid`         | FK → `gh_orders.id`, NOT NULL   | Related order                      |
| `gig_id`               | `uuid`         | FK → `gh_gigs.id`, NULL         | Related gig (for gig-based orders) |
| `reviewer_id`          | `uuid`         | FK → `gh_profiles.id`, NOT NULL | Student writing the review         |
| `reviewee_id`          | `uuid`         | FK → `gh_profiles.id`, NOT NULL | Student being reviewed             |
| `rating_overall`       | `decimal(2,1)` | NOT NULL                        | Overall rating (1.0–5.0)           |
| `rating_quality`       | `decimal(2,1)` | NULL                            | Quality rating (1.0–5.0)           |
| `rating_communication` | `decimal(2,1)` | NULL                            | Communication rating (1.0–5.0)     |
| `rating_delivery`      | `decimal(2,1)` | NULL                            | Delivery timeliness (1.0–5.0)      |
| `comment`              | `text`         | NULL                            | Written review                     |
| `response`             | `text`         | NULL                            | Reviewee's response                |
| `response_at`          | `timestamp`    | NULL                            | When response was added            |
| `is_visible`           | `boolean`      | DEFAULT true                    | Can be hidden by admin             |
| `created_at`           | `timestamp`    | DEFAULT NOW()                   | —                                  |

**Constraints:**

- UNIQUE(`order_id`, `reviewer_id`) — one review per party per order

**Indexes:**

- `idx_reviews_order` on `order_id`
- `idx_reviews_reviewee` on `reviewee_id`
- `idx_reviews_gig` on `gig_id`
- `idx_reviews_rating` on `rating_overall`

---

## 17. gh_notifications

> User notifications (in-app + push).

| Column       | Type           | Constraints                     | Description                                      |
| ------------ | -------------- | ------------------------------- | ------------------------------------------------ |
| `id`         | `uuid`         | PK, auto-generated              | Notification identifier                          |
| `profile_id` | `uuid`         | FK → `gh_profiles.id`, NOT NULL | Recipient                                        |
| `type`       | `varchar(30)`  | NOT NULL                        | See notification types below                     |
| `title`      | `varchar(200)` | NOT NULL                        | Notification title                               |
| `body`       | `text`         | NOT NULL                        | Notification body text                           |
| `data`       | `json`         | DEFAULT '{}'                    | Metadata: { entity_type, entity_id, action_url } |
| `is_read`    | `boolean`      | DEFAULT false                   | Read status                                      |
| `read_at`    | `timestamp`    | NULL                            | When notification was read                       |
| `created_at` | `timestamp`    | DEFAULT NOW()                   | —                                                |

**Notification Types:** `new_order`, `order_update`, `order_delivered`, `order_completed`, `revision_requested`, `new_message`, `new_proposal`, `proposal_accepted`, `proposal_rejected`, `payment_received`, `payment_released`, `withdrawal_update`, `new_review`, `system`

**Indexes:**

- `idx_notifications_profile` on `profile_id`
- `idx_notifications_unread` on `profile_id, is_read` WHERE `is_read = false`
- `idx_notifications_created` on `created_at`

---

## 18. gh_bookmarks

> Saved/bookmarked gigs and jobs.

| Column        | Type          | Constraints                     | Description                     |
| ------------- | ------------- | ------------------------------- | ------------------------------- |
| `id`          | `uuid`        | PK, auto-generated              | Bookmark identifier             |
| `profile_id`  | `uuid`        | FK → `gh_profiles.id`, NOT NULL | Student who bookmarked          |
| `entity_type` | `varchar(10)` | NOT NULL                        | Enum: `gig`, `job`              |
| `entity_id`   | `uuid`        | NOT NULL                        | ID of the bookmarked gig or job |
| `created_at`  | `timestamp`   | DEFAULT NOW()                   | —                               |

**Constraints:**

- UNIQUE(`profile_id`, `entity_type`, `entity_id`)

---

## 19. gh_reports

> Content reports/flags submitted by students.

| Column        | Type          | Constraints                     | Description                                                   |
| ------------- | ------------- | ------------------------------- | ------------------------------------------------------------- |
| `id`          | `uuid`        | PK, auto-generated              | Report identifier                                             |
| `reporter_id` | `uuid`        | FK → `gh_profiles.id`, NOT NULL | Reporting student                                             |
| `entity_type` | `varchar(20)` | NOT NULL                        | Enum: `gig`, `job`, `profile`, `review`, `message`            |
| `entity_id`   | `uuid`        | NOT NULL                        | ID of the reported entity                                     |
| `reason`      | `varchar(50)` | NOT NULL                        | Enum: `spam`, `inappropriate`, `fraud`, `harassment`, `other` |
| `description` | `text`        | NULL                            | Additional details                                            |
| `status`      | `varchar(20)` | DEFAULT 'pending'               | Enum: `pending`, `reviewing`, `resolved`, `dismissed`         |
| `admin_note`  | `text`        | NULL                            | Resolution notes by admin                                     |
| `resolved_by` | `uuid`        | FK → `gh_profiles.id`, NULL     | Admin who resolved                                            |
| `resolved_at` | `timestamp`   | NULL                            | —                                                             |
| `created_at`  | `timestamp`   | DEFAULT NOW()                   | —                                                             |

---

## 20. gh_platform_config

> Platform-wide configuration settings.

| Column        | Type          | Constraints        | Description               |
| ------------- | ------------- | ------------------ | ------------------------- |
| `id`          | `uuid`        | PK, auto-generated | Config identifier         |
| `key`         | `varchar(50)` | UNIQUE, NOT NULL   | Config key                |
| `value`       | `text`        | NOT NULL           | Config value              |
| `description` | `text`        | NULL               | What this config controls |
| `updated_at`  | `timestamp`   | DEFAULT NOW()      | —                         |

**Default Config Values:**

| Key                        | Default Value | Description                             |
| -------------------------- | ------------- | --------------------------------------- |
| `platform_fee_percent`     | `10`          | Platform fee as a percentage            |
| `escrow_auto_release_days` | `7`           | Days after delivery before auto-release |
| `min_withdrawal_amount`    | `500`         | Minimum withdrawal amount (BDT)         |
| `max_gig_images`           | `5`           | Max gallery images per gig              |
| `max_file_upload_mb`       | `25`          | Max file upload size in MB              |
| `top_rated_min_rating`     | `4.5`         | Minimum avg rating for Top Rated badge  |
| `top_rated_min_reviews`    | `10`          | Minimum reviews for Top Rated badge     |

---

## 21. Entity Relationship Diagram

```
gh_profiles (1) ──────< (N) gh_gigs
gh_profiles (1) ──────< (N) gh_jobs
gh_profiles (1) ──────< (N) gh_proposals
gh_profiles (1) ──────< (N) gh_orders (as buyer)
gh_profiles (1) ──────< (N) gh_orders (as seller)
gh_profiles (1) ──────< (N) gh_reviews (as reviewer)
gh_profiles (1) ──────< (N) gh_reviews (as reviewee)
gh_profiles (1) ──────< (N) gh_notifications
gh_profiles (1) ──────< (N) gh_transactions
gh_profiles (1) ──────< (N) gh_withdrawals
gh_profiles (1) ──────< (N) gh_bookmarks
gh_profiles (1) ──────< (N) gh_reports

gh_categories (1) ────< (N) gh_gigs
gh_categories (1) ────< (N) gh_jobs

gh_gigs (1) ──────────< (N) gh_gig_packages
gh_gigs (1) ──────────< (N) gh_gig_images
gh_gigs (1) ──────────< (N) gh_orders (source_type='gig')
gh_gigs (1) ──────────< (N) gh_reviews

gh_jobs (1) ──────────< (N) gh_proposals
gh_jobs (1) ──────────< (N) gh_orders (source_type='job')

gh_orders (1) ────────< (N) gh_order_milestones
gh_orders (1) ────────< (N) gh_order_deliveries
gh_orders (1) ────────< (1) gh_escrow
gh_orders (1) ────────< (N) gh_reviews
gh_orders (1) ────────< (N) gh_transactions
gh_orders (1) ────────< (N) gh_conversations

gh_conversations (1) ─< (N) gh_messages
```
