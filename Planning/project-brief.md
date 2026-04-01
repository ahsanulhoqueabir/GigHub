# GigHub — Campus-Centric Freelance Marketplace

## Overview

GigHub is a freelance & task marketplace platform exclusively for **Jagannath University, Dhaka, Bangladesh**. Every student on the platform is inherently dual-sided: they can offer skills as gigs, post tasks/jobs for others, and do both simultaneously. There are no separate Freelancer or Client role selections — a student is always both.

---

## Roles

| Role        | Description                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------------- |
| **Student** | The primary user. Can create gigs, apply to jobs, post tasks, and hire — all within one account |
| **Admin**   | Platform moderator: manages users, handles disputes, oversees content and platform revenue      |

---

## Tech Stack

| Layer          | Technology                                               |
| -------------- | -------------------------------------------------------- |
| Backend API    | NestJS (REST + WebSocket)                                |
| Auth           | Firebase Auth (email/social login) + NestJS JWT (custom) |
| CMS / DB Layer | Directus (collections, permissions, admin UI)            |
| Web Frontend   | Next.js                                                  |
| Mobile App     | Flutter                                                  |
| Payments       | SSLCommerz / bKash / Stripe (escrow-based)               |
| Real-time      | Socket.IO (via NestJS)                                   |
| Storage        | Cloudflare R2 (all files & images)                       |

---

## Feature Set

### 1. Authentication & User Identity

**Auth Flow**

- Email/password registration and login via Firebase Auth
- Social login (Google) via Firebase Auth
- Future third-party SSO (GitHub/Microsoft/Apple/etc.) via Firebase Auth providers
- After Firebase authenticates the user, the NestJS backend issues its own signed JWT
- All subsequent API requests carry the **NestJS-issued JWT** (not the Firebase token)
- Backend accepts only Firebase-issued ID tokens for all sign-in paths
- NestJS JWT payload includes: `profile_id`, `username`, `role`, `is_verified`, `institution`
- All authorization and identity resolution across the platform uses `gh_profiles.id` from the JWT payload

**Profile — Directus (`gh_profiles` collection)**

- On first login, NestJS creates a `gh_profiles` record in Directus; the record's auto-generated `id` becomes the canonical user identifier
- `firebase_uid` is stored internally in `gh_profiles` only for auth linkage — it is **never used as a foreign key** anywhere else
- All platform data (gigs, jobs, orders, reviews, chat, etc.) references `gh_profiles.id` as the user identifier
- Profile fields: `id`, `firebase_uid` (internal only), `display_name`, `username`, `avatar` (R2 URL string), `bio`, `skills[]`, `availability_status`, `is_verified`, `role`, `created_at`
- Institution is fixed: **Jagannath University, Dhaka, Bangladesh** — not a user-selectable field
- Role field: `student` (default) or `admin`
- Students do NOT choose a Freelancer or Client role — all students are dual-sided by default

### 2. Gig / Service Marketplace (Fiverr-style)

- Any student can create service listings (Gigs) with packages (Basic / Standard / Premium)
- Gig categories: Design, Dev, Writing, Video, Marketing, Data, etc.
- Gig tags, delivery time, revision count, pricing per package
- Gig gallery (images stored as R2 URL strings in DB)
- Gig gallery (images stored as R2 URL strings in DB)
- Gig search & filter by category, price range, delivery time, rating
- Directus collection: `gh_gigs` — references `gh_profiles.id` as `seller_id`

### 3. Job / Task Board (Upwork-style)

- Any student can post jobs/tasks with budget, deadline, required skills, type (one-time / recurring)
- Job types: Free, Paid, Internship, Volunteer, Contest
- Any student (other than the poster) can submit proposals with cover letter, timeline, and quoted price
- Poster reviews proposals and selects a student
- Milestone-based project breakdown for larger tasks
- Directus collection: `gh_jobs` — references `gh_profiles.id` as `poster_id`; proposals stored in `gh_proposals` referencing `gh_profiles.id` as `applicant_id`

### 4. Orders & Project Management

- Order lifecycle: Pending → In Progress → Delivered → Revision → Completed / Disputed
- Milestone tracking with delivery uploads (files uploaded to R2; URL string stored in DB)
- Revision requests with notes
- Order cancellation with defined policy
- Delivery file/link submission
- All order parties referenced by `gh_profiles.id`

### 5. Payment & Escrow

- Escrow holds client payment upon order start
- Funds released to freelancer upon client approval
- Split milestone payments
- Auto-release after defined period of no response
- Withdrawal to bKash / bank / campus wallet
- Platform service fee (configurable %)
- Refund & dispute flow

### 6. In-App Chat & Communication

- Real-time 1:1 messaging between two students (identified by `gh_profiles.id`)
- File, image, and voice note sharing in chat (uploaded to R2; URL string stored in DB)
- Pre-order inquiry chat before placing order
- Chat linked to specific order context
- System notifications within chat (order updates, milestones)
- Read receipts and typing indicators

### 7. Ratings & Reviews

- Mutual rating system (both parties rate each other after order completion)
- 5-star rating with category breakdown (quality, communication, delivery)
- Written review with response ability
- Rating visible on profile and gig pages
- Minimum threshold for Top Rated badge

### 8. Dashboard

- **Student Dashboard**: Unified view — active orders (as seller & buyer), posted gigs, posted jobs, pending proposals, earnings, payment history, review queue
- **Admin Dashboard**: User management, dispute queue, platform revenue, content moderation (accessible via Directus admin UI + custom panel)

### 9. Notifications

- In-app notification center
- Push notifications (Flutter app)
- Email notifications for key events (order placed, payment released, new message)
- Configurable notification preferences

### 10. Search & Discovery

- Full-text search for gigs and jobs
- Filter by: category, skill, budget, delivery time, rating (institution is fixed — JnU)
- Trending gigs section
- Recommended freelancers based on job post skills
- Recently viewed and saved/bookmarked listings

---

## MVP Scope

The following features constitute the Minimum Viable Product:

- [ ] Firebase Auth: email/password + Google login (+ future SSO providers)
- [ ] NestJS issues custom signed JWT with `profile_id`, `role`, `username`, `is_verified` in payload
- [ ] `gh_profiles` record auto-created in Directus on first login; `gh_profiles.id` used as canonical identifier everywhere
- [ ] JnU student verification (`is_verified` flag)
- [ ] Student profile setup: skills, bio, avatar (uploaded to R2)
- [ ] Gig creation and browsing (any student can create)
- [ ] Job/task post and proposal submission (any student can post or apply)
- [ ] Order placement, delivery, and completion flow
- [ ] Basic escrow payment (hold & release)
- [ ] 1:1 in-app chat per order
- [ ] Rating & review after order completion
- [ ] Unified student dashboard (seller + buyer views in one)
- [ ] Push & in-app notifications
- [ ] Admin panel (via Directus)

---

## Post-MVP / Interesting Features

| Feature                       | Description                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------- |
| **Campus Leaderboard**        | Top rated freelancers per institution per category                              |
| **Skill Badges**              | Earned via completed orders, tests, or endorsements                             |
| **Contest Posts**             | Clients post a brief; multiple freelancers submit; client picks winner and pays |
| **Team / Group Bids**         | Multiple freelancers collaborate and bid as a team                              |
| **GigHub Credits**            | Internal credit system for free-tier tasks or referral rewards                  |
| **Referral Program**          | Earn credits for referring new users                                            |
| **Portfolio Showcase**        | Public-facing portfolio page generated from completed work                      |
| **Skill Assessment Tests**    | Short MCQ or practical tests to earn a verified skill tag                       |
| **Campus Feed / Newsfeed**    | Activity feed showing new gigs, jobs, and completions within a campus           |
| **Saved / Wishlist**          | Save gigs or jobs for later                                                     |
| **Availability Calendar**     | Freelancers set their availability window                                       |
| **Recurring Orders**          | Clients can subscribe to a freelancer for ongoing work                          |
| **AI Job Matching**           | Auto-suggest matching freelancers when a job is posted                          |
| **Analytics for Freelancers** | Gig views, click-through, conversion, earnings chart                            |
| **Organization Accounts**     | Campus clubs/depts. can register as a student account with an org-type flag     |
| **Campus Ambassador Program** | Student reps promote GigHub and earn rewards                                    |

---

## Key Differentiators from Generic Platforms

- Exclusively for Jagannath University — a trusted, closed campus ecosystem
- Every student is dual-sided: no forced role choice, post gigs and jobs from day one
- Firebase Auth + NestJS custom JWT + Directus `gh_profiles.id` as single source of truth for identity
- Cloudflare R2 for all file/image storage; DB stores only URL strings — no Directus file management
- Free and volunteer task types beyond just paid gigs
- Student-first UX: mobile-first via Flutter, lightweight onboarding
- Local payment methods (bKash, Nagad, etc.) for Bangladesh market
