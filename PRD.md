# GigHub — Product Requirements Document (PRD)

> **Version:** 1.0
> **Last Updated:** March 11, 2026
> **Platform:** Campus-Centric Freelance Marketplace — Jagannath University, Dhaka, Bangladesh

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [Roles & Permissions](#4-roles--permissions)
5. [System Architecture](#5-system-architecture)
6. [Core User Flows](#6-core-user-flows)
7. [Feature Requirements (MVP)](#7-feature-requirements-mvp)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Data Model Overview](#9-data-model-overview)
10. [Implementation Phases](#10-implementation-phases)
11. [Post-MVP Roadmap](#11-post-mvp-roadmap)
12. [Success Metrics](#12-success-metrics)

---

## 1. Product Vision

GigHub is a **closed, campus-exclusive freelance & task marketplace** where every Jagannath University student operates as both a service provider and a client — simultaneously, from a single account. No role selection, no artificial barriers. A student can post a gig, hire someone for a task, and do both at the same time.

**Vision Statement:** _Empower every JnU student to monetize their skills, find help for their projects, and build a professional portfolio — all within a trusted campus ecosystem._

---

## 2. Problem Statement

- Students at JnU have diverse skills (design, development, writing, video editing) but **no campus-native platform** to offer them.
- External freelance platforms (Fiverr, Upwork) are impersonal, globally competitive, and don't cater to local payment methods or campus trust dynamics.
- Students needing help with tasks (assignments help, event posters, app prototypes) have **no structured way** to find skilled peers.
- There's no system for verifiable campus-only transactions with **escrow safety** and **dispute resolution**.

---

## 3. Target Users

| Segment       | Description                                       |
| ------------- | ------------------------------------------------- |
| **Primary**   | Active students of Jagannath University, Dhaka    |
| **Secondary** | Faculty/staff needing student help (future scope) |
| **Admin**     | Platform moderators from the GigHub team          |

**User Persona — Student:**

- Age: 18–25
- Tech-savvy, uses smartphone as primary device
- Needs: earn income, get help with tasks, build portfolio
- Payment preferences: bKash, Nagad, bank transfer
- Primarily Bengali-speaking, comfortable with English UI

---

## 4. Roles & Permissions

### 4.1 Student (Default Role)

Every registered student automatically has **full dual-sided access**:

| Capability          | Description                                                     |
| ------------------- | --------------------------------------------------------------- |
| Create Gigs         | List services with packages & pricing                           |
| Browse & Order Gigs | Purchase services from other students                           |
| Post Jobs/Tasks     | Create task postings with budget & requirements                 |
| Submit Proposals    | Apply to other students' job postings                           |
| Chat                | 1:1 messaging with any student (pre-order inquiry + order chat) |
| Manage Orders       | Track orders as both seller and buyer                           |
| Leave Reviews       | Rate & review after order completion                            |
| Receive Payments    | Withdraw earnings via bKash/bank                                |
| Make Payments       | Pay via bKash/SSLCommerz/card                                   |

### 4.2 Admin

| Capability         | Description                                            |
| ------------------ | ------------------------------------------------------ |
| User Management    | View, verify, suspend, ban student accounts            |
| Content Moderation | Review flagged gigs, jobs, reviews                     |
| Dispute Resolution | Handle order disputes, issue refunds                   |
| Platform Config    | Set service fees, escrow timers, categories            |
| Analytics          | View platform-wide revenue, user activity, order stats |
| Accessed Via       | Directus Admin UI + custom admin endpoints             |

---

## 5. System Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│  Next.js     │     │  Flutter     │     │  Directus Admin │
│  (Web App)   │     │  (Mobile)    │     │  (Admin Panel)  │
└──────┬───────┘     └──────┬───────┘     └────────┬────────┘
       │                    │                      │
       └────────────┬───────┘                      │
                    │                              │
              ┌─────▼──────┐                       │
              │  NestJS     │◄──────────────────────┘
              │  Backend    │
              │  (REST +    │
              │  WebSocket) │
              └──┬───┬───┬──┘
                 │   │   │
      ┌──────────┘   │   └──────────┐
      │              │              │
┌─────▼─────┐ ┌─────▼─────┐ ┌──────▼──────┐
│ Firebase   │ │ Directus  │ │ Cloudflare  │
│ Auth       │ │ (DB/CMS)  │ │ R2 Storage  │
└────────────┘ └───────────┘ └─────────────┘
                    │
              ┌─────▼─────┐
              │ PostgreSQL │
              │ (via       │
              │ Directus)  │
              └────────────┘
```

### 5.1 Tech Stack

| Layer                  | Technology                     | Purpose                                                                     |
| ---------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| **Backend API**        | NestJS (TypeScript)            | REST endpoints + WebSocket gateway; follows collection-centric service pattern |
| **Authentication**     | Firebase Auth                  | Email/password + Google OAuth (future providers via Firebase SSO)           |
| **Custom Auth**        | NestJS JWT                     | Platform-issued tokens with `profile_id`, `username`, `is_verified`, `role` |
| **Database / CMS**     | Directus + PostgreSQL          | Data storage, collections, admin UI                                         |
| **Web Frontend**       | Next.js 14 (App Router)        | Server-side rendered web application                                        |
| **Mobile App**         | Flutter (Dart)                 | Cross-platform mobile app (Android primary, iOS secondary)                  |
| **Payments**           | SSLCommerz + bKash API         | Escrow-based payment processing                                             |
| **Real-time**          | Socket.IO (NestJS Gateway)     | Chat messaging, live notifications                                          |
| **File Storage**       | Cloudflare R2                  | Images, documents, chat attachments                                         |
| **Architecture**       | Static Collection Services     | Services are collection-centric with static methods for DB logic            |
| **Email**              | Resend / Nodemailer            | Transactional emails                                                        |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | Mobile push notifications                                                   |

### 5.2 Auth Flow (Detailed)

```
Student → Firebase Auth (email/Google) → Firebase returns ID token
    → NestJS /auth/login receives firebase_id_token
    → NestJS verifies with Firebase Admin SDK, checks/creates gh_profiles record
    → NestJS signs custom JWT { profile_id, username, is_verified, role }
    → Client stores NestJS JWT, uses it for ALL subsequent API calls
```

For future third-party SSO (GitHub/Microsoft/Apple/etc.), the flow remains identical: provider login through Firebase Auth, then backend verification of Firebase ID token.

**Critical Rule:** `gh_profiles.id` is the **sole identifier** used across ALL collections. `firebase_uid` is internal to `gh_profiles` only.

---

## 6. Core User Flows

### 6.1 Registration & Onboarding

1. Student opens app → Signup screen
2. Signs up via email/password or Google (Firebase Auth)
3. Backend auto-creates `gh_profiles` record
4. Student completes profile: display_name, username, bio, skills, avatar
5. Student lands on unified dashboard

### 6.2 Gig Creation & Ordering

1. Student navigates to "Create Gig"
2. Fills in: title, description, category, tags, packages (Basic/Standard/Premium with price, delivery time, revision count), gallery images
3. Gig is published and visible in marketplace
4. Another student browses/searches gigs → views gig detail
5. Selects package → "Order Now"
6. Payment via SSLCommerz/bKash → funds held in escrow
7. Seller receives notification → starts work
8. Seller delivers → buyer reviews → approves or requests revision
9. On approval → funds released to seller (minus platform fee)
10. Both parties leave mutual reviews

### 6.3 Job Posting & Proposal

1. Student navigates to "Post a Job"
2. Fills in: title, description, budget, deadline, required skills, job type (paid/free/internship/volunteer)
3. Job is published on job board
4. Other students browse jobs → submit proposals (cover letter, timeline, quoted price)
5. Job poster reviews proposals → selects one
6. Order is created → same lifecycle as gig order
7. Milestone tracking for larger projects

### 6.4 Chat & Communication

1. Pre-order: student can message a gig seller to inquire before ordering
2. Post-order: dedicated order chat channel is created
3. Real-time messaging via Socket.IO
4. File/image sharing (uploaded to R2)
5. System messages for order events (delivery, revision request, etc.)

### 6.5 Payment Flow

```
Buyer pays → Escrow holds funds → Seller delivers → Buyer approves
    → Platform deducts fee → Seller receives payment → Withdrawal to bKash/bank

Dispute: Buyer disputes → Admin reviews → Admin decides (refund/release/split)
```

---

## 7. Feature Requirements (MVP)

### FR-1: Authentication & Identity

| ID      | Requirement                                                             | Priority |
| ------- | ----------------------------------------------------------------------- | -------- |
| FR-1.1  | Email/password registration via Firebase Auth                           | P0       |
| FR-1.2  | Google OAuth login via Firebase Auth                                    | P0       |
| FR-1.2b | Future third-party SSO via Firebase Auth providers                      | P1       |
| FR-1.3  | NestJS custom JWT issuance with profile_id, username, is_verified, role | P0       |
| FR-1.4  | Auto-creation of gh_profiles record on first login                      | P0       |
| FR-1.5  | JWT refresh token mechanism                                             | P0       |
| FR-1.6  | Logout / token invalidation                                             | P0       |
| FR-1.7  | Password reset via Firebase Auth                                        | P1       |

### FR-2: Profile Management

| ID     | Requirement                                                       | Priority |
| ------ | ----------------------------------------------------------------- | -------- |
| FR-2.1 | View & edit profile (display_name, username, bio, skills, avatar) | P0       |
| FR-2.2 | Avatar upload to Cloudflare R2                                    | P0       |
| FR-2.3 | Skills array management (add/remove)                              | P0       |
| FR-2.4 | Availability status toggle (available/busy/offline)               | P1       |
| FR-2.5 | Public profile page (viewable by other students)                  | P0       |
| FR-2.6 | is_verified flag for identity verification                        | P0       |

### FR-3: Gig Marketplace

| ID     | Requirement                                                                         | Priority |
| ------ | ----------------------------------------------------------------------------------- | -------- |
| FR-3.1 | Create gig with title, description, category, tags                                  | P0       |
| FR-3.2 | 3-tier package system (Basic/Standard/Premium) with price, delivery time, revisions | P0       |
| FR-3.3 | Gig gallery image upload (up to 5 images, R2)                                       | P0       |
| FR-3.4 | Gig listing page with grid/list view                                                | P0       |
| FR-3.5 | Gig detail page with package selector                                               | P0       |
| FR-3.6 | Gig search with full-text query                                                     | P0       |
| FR-3.7 | Gig filters: category, price range, delivery time, rating                           | P0       |
| FR-3.8 | Gig status management (active/paused/deleted)                                       | P1       |
| FR-3.9 | Gig edit & update                                                                   | P0       |

### FR-4: Job Board

| ID     | Requirement                                                             | Priority |
| ------ | ----------------------------------------------------------------------- | -------- |
| FR-4.1 | Create job post with title, description, budget, deadline, skills, type | P0       |
| FR-4.2 | Job types: Free, Paid, Internship, Volunteer                            | P0       |
| FR-4.3 | Job listing page with filters                                           | P0       |
| FR-4.4 | Job detail page                                                         | P0       |
| FR-4.5 | Submit proposal with cover letter, timeline, quoted price               | P0       |
| FR-4.6 | View & manage received proposals (for job poster)                       | P0       |
| FR-4.7 | Accept/reject proposals                                                 | P0       |
| FR-4.8 | Job status management (open/in-progress/closed)                         | P1       |

### FR-5: Orders & Delivery

| ID     | Requirement                                                             | Priority |
| ------ | ----------------------------------------------------------------------- | -------- |
| FR-5.1 | Order creation from gig package or accepted proposal                    | P0       |
| FR-5.2 | Order lifecycle: Pending → In Progress → Delivered → Completed/Disputed | P0       |
| FR-5.3 | Delivery submission with file upload (R2) and message                   | P0       |
| FR-5.4 | Revision request with notes                                             | P0       |
| FR-5.5 | Order completion / approval by buyer                                    | P0       |
| FR-5.6 | Order cancellation with policy enforcement                              | P1       |
| FR-5.7 | Milestone tracking for job-based orders                                 | P1       |

### FR-6: Payments & Escrow

| ID     | Requirement                                     | Priority |
| ------ | ----------------------------------------------- | -------- |
| FR-6.1 | Escrow: hold payment on order creation          | P0       |
| FR-6.2 | Release payment to seller on buyer approval     | P0       |
| FR-6.3 | Platform service fee deduction (configurable %) | P0       |
| FR-6.4 | Payment via SSLCommerz (card/mobile banking)    | P0       |
| FR-6.5 | bKash direct payment integration                | P1       |
| FR-6.6 | Withdrawal to bKash / bank account              | P0       |
| FR-6.7 | Auto-release after configurable timeout         | P1       |
| FR-6.8 | Transaction history                             | P0       |

### FR-7: Chat & Messaging

| ID     | Requirement                            | Priority |
| ------ | -------------------------------------- | -------- |
| FR-7.1 | Real-time 1:1 messaging via Socket.IO  | P0       |
| FR-7.2 | Pre-order inquiry messaging            | P0       |
| FR-7.3 | Order-linked chat channel              | P0       |
| FR-7.4 | File/image sharing in chat (R2 upload) | P0       |
| FR-7.5 | System messages for order events       | P1       |
| FR-7.6 | Read receipts                          | P1       |
| FR-7.7 | Typing indicators                      | P2       |
| FR-7.8 | Chat list with unread count            | P0       |

### FR-8: Reviews & Ratings

| ID     | Requirement                                                     | Priority |
| ------ | --------------------------------------------------------------- | -------- |
| FR-8.1 | Mutual review system (both parties rate after completion)       | P0       |
| FR-8.2 | 5-star rating with breakdown (quality, communication, delivery) | P0       |
| FR-8.3 | Written review text                                             | P0       |
| FR-8.4 | Review response by reviewed party                               | P1       |
| FR-8.5 | Average rating display on profile & gig pages                   | P0       |
| FR-8.6 | Top Rated badge (min 4.5 avg, 10+ reviews)                      | P2       |

### FR-9: Dashboard

| ID     | Requirement                                            | Priority |
| ------ | ------------------------------------------------------ | -------- |
| FR-9.1 | Unified student dashboard (seller + buyer in one view) | P0       |
| FR-9.2 | Active orders list (as seller & buyer)                 | P0       |
| FR-9.3 | My gigs management                                     | P0       |
| FR-9.4 | My job posts management                                | P0       |
| FR-9.5 | Pending proposals (sent & received)                    | P0       |
| FR-9.6 | Earnings overview                                      | P0       |
| FR-9.7 | Payment/transaction history                            | P0       |

### FR-10: Notifications

| ID      | Requirement                                                              | Priority |
| ------- | ------------------------------------------------------------------------ | -------- |
| FR-10.1 | In-app notification center                                               | P0       |
| FR-10.2 | Push notifications via FCM (Flutter)                                     | P0       |
| FR-10.3 | Email notifications for critical events                                  | P1       |
| FR-10.4 | Notification types: order update, new message, payment, review, proposal | P0       |
| FR-10.5 | Notification preferences (enable/disable per type)                       | P1       |
| FR-10.6 | Mark as read / mark all as read                                          | P0       |

### FR-11: Admin Functions

| ID      | Requirement                                  | Priority |
| ------- | -------------------------------------------- | -------- |
| FR-11.1 | User management (view, verify, suspend, ban) | P0       |
| FR-11.2 | Dispute queue and resolution                 | P0       |
| FR-11.3 | Content moderation (flagged items)           | P1       |
| FR-11.4 | Platform configuration (fees, timers)        | P1       |
| FR-11.5 | Revenue analytics dashboard                  | P1       |

---

## 8. Non-Functional Requirements

| Category          | Requirement                                                |
| ----------------- | ---------------------------------------------------------- |
| **Performance**   | API response time < 200ms (p95) for standard endpoints     |
| **Scalability**   | Support 5,000+ concurrent users                            |
| **Availability**  | 99.5% uptime target                                        |
| **Security**      | OWASP Top 10 compliance, input validation, rate limiting   |
| **Mobile**        | Mobile-first responsive design, offline-capable chat cache |
| **Localization**  | English UI (Bengali localization as post-MVP)              |
| **Accessibility** | WCAG 2.1 AA compliance for web                             |
| **Data Privacy**  | User data encrypted at rest and in transit (TLS 1.3)       |
| **File Size**     | Max upload: 25MB per file, 5 images per gig gallery        |
| **Rate Limiting** | Auth endpoints: 5 req/min, API: 100 req/min per user       |

---

## 9. Data Model Overview

All Directus collections use the `gh_` prefix. See [backend/db-schema.md](backend/db-schema.md) for the complete schema.

### Collections Summary

| Collection            | Purpose                            | Key Relations                                              |
| --------------------- | ---------------------------------- | ---------------------------------------------------------- |
| `gh_profiles`         | User profiles (canonical identity) | —                                                          |
| `gh_gigs`             | Service listings                   | `seller`, `category` → `gh_profiles.id`, `gh_categories.id` |
| `gh_gig_packages`     | Gig pricing tiers                  | `gig` → `gh_gigs.id`                                       |
| `gh_categories`       | Gig/job categories                 | —                                                          |
| `gh_jobs`             | Job/task postings                  | `poster`, `category` → `gh_profiles.id`, `gh_categories.id`|
| `gh_proposals`        | Job proposals                      | `job` → `gh_jobs.id`, `applicant` → `gh_profiles.id`       |
| `gh_orders`           | Orders (gig or job)                | `buyer`, `seller` → `gh_profiles.id`                       |
| `gh_order_milestones` | Milestone tracking                 | `order` → `gh_orders.id`                                   |
| `gh_order_deliveries` | Delivery submissions               | `order` → `gh_orders.id`                                   |
| `gh_escrow`           | Payment escrow records             | `order` → `gh_orders.id`                                   |
| `gh_transactions`     | Payment transactions               | `profile` → `gh_profiles.id`                               |
| `gh_withdrawals`      | Withdrawal requests                | `profile` → `gh_profiles.id`                               |
| `gh_conversations`    | Chat conversations                 | `participant_1`, `participant_2` → `gh_profiles.id`        |
| `gh_messages`         | Chat messages                      | `conversation` → `gh_conversations.id`                     |
| `gh_reviews`          | Ratings & reviews                  | `reviewer`, `reviewee` → `gh_profiles.id`                  |
| `gh_notifications`    | User notifications                 | `profile` → `gh_profiles.id`                               |
| `gh_bookmarks`        | Saved gigs/jobs                    | `profile` → `gh_profiles.id`                               |
| `gh_reports`          | Content reports/flags              | `reporter` → `gh_profiles.id`                              |
| `gh_platform_config`  | Platform settings                  | —                                                          |

---

## 10. Implementation Phases

### Phase 1 — Foundation (Auth, Profiles, Infrastructure)

- Firebase Auth setup (email + Google)
- NestJS project scaffolding with JWT module
- Directus setup with gh_profiles collection
- Cloudflare R2 integration
- Profile CRUD
- Basic API structure & guards

### Phase 2 — Core Marketplace (Gigs + Jobs)

- gh_gigs, gh_gig_packages, gh_gig_images, gh_categories collections
- Gig CRUD with package management
- gh_jobs, gh_proposals collections
- Job CRUD with proposal submission
- Search & filter endpoints

### Phase 3 — Transactions (Orders + Payments)

- gh_orders, gh_order_milestones, gh_order_deliveries collections
- Order lifecycle management
- Escrow system (gh_escrow, gh_transactions)
- SSLCommerz integration
- Withdrawal system (gh_withdrawals)

### Phase 4 — Communication (Chat + Notifications)

- gh_conversations, gh_messages collections
- Socket.IO gateway for real-time messaging
- File sharing in chat
- gh_notifications collection
- In-app notification center
- FCM push notification integration

### Phase 5 — Quality & Discovery (Reviews + Search + Polish)

- gh_reviews collection
- Mutual review system
- Rating aggregation
- Full-text search optimization
- Bookmarks (gh_bookmarks)
- Content reporting (gh_reports)
- Admin dispute management
- Platform config (gh_platform_config)

---

## 11. Post-MVP Roadmap

| Priority | Feature                   | Phase |
| -------- | ------------------------- | ----- |
| High     | Campus Leaderboard        | v1.1  |
| High     | Portfolio Showcase        | v1.1  |
| Medium   | Skill Badges              | v1.2  |
| Medium   | Contest Posts             | v1.2  |
| Medium   | GigHub Credits & Referral | v1.2  |
| Low      | Team/Group Bids           | v1.3  |
| Low      | AI Job Matching           | v1.3  |
| Low      | Analytics for Freelancers | v1.3  |
| Low      | Availability Calendar     | v1.4  |
| Low      | Recurring Orders          | v1.4  |
| Low      | Organization Accounts     | v1.4  |

---

## 12. Success Metrics

| Metric                     | Target (6 months post-launch) |
| -------------------------- | ----------------------------- |
| Registered Students        | 500+                          |
| Monthly Active Users       | 200+                          |
| Gigs Listed                | 300+                          |
| Jobs Posted                | 150+                          |
| Monthly Orders Completed   | 100+                          |
| Average Rating             | 4.0+                          |
| Dispute Rate               | < 5% of orders                |
| Platform Revenue (monthly) | BDT 50,000+                   |

---

## Related Documents

- **Backend Implementation:** See [backend/](backend/) directory
- **Web Frontend Implementation:** See [nextjs/](nextjs/) directory
- **Mobile App Implementation:** See [flutter/](flutter/) directory
- **Database Schema:** See [backend/db-schema.md](backend/db-schema.md)
- **API Documentation:** See [backend/api-endpoints.md](backend/api-endpoints.md)
