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

| Layer              | Technology                                                                       |
| ------------------ | -------------------------------------------------------------------------------- |
| **API & Backend**  | Next.js API Routes (TypeScript, REST)                                            |
| **Web Frontend**   | Next.js (App Router, Server Components)                                          |
| **Mobile App**     | React Native (Android & iOS)                                                     |
| **Database**       | Supabase (PostgreSQL + Realtime Broadcast)                                       |
| **Authentication** | Supabase Auth (Email + Google OAuth)                                             |
| **File Storage**   | Cloudflare R2 — all files (docs, uploads, assets); served via Cloudflare CDN     |
| **Image CDN**      | Cloudinary — only banners, gig images, avatars (image optimization & transforms) |
| **Shared Package** | [`@gig-hub/types`](https://www.npmjs.com/) (Zod schemas + TypeScript types)      |
| **Real-time**      | Supabase Realtime Broadcast                                                      |
| **Payments**       | SSLCommerz (escrow-based)                                                        |

---

## Repository Structure

| Branch         | Contents                                                   |
| -------------- | ---------------------------------------------------------- |
| `main`         | Planning docs only — PRD, brief, readme, PDF reports       |
| `web`          | Next.js app (API routes + web frontend) + `@gig-hub/types` |
| `app`          | React Native mobile app                                    |
| `shared-types` | Standalone NPM package `@gig-hub/types` (Zod + TS types)   |

---

## Feature Set

### 1. Authentication & User Identity

**Auth Flow**

- Email/password registration and login via Supabase Auth
- Social login (Google) via Supabase Auth
- Supabase session token is verified on every protected API call
- All platform data references `profiles.id` as the canonical user identifier
- Institution is fixed: **Jagannath University, Dhaka, Bangladesh**

### 2. Gig / Service Marketplace (Fiverr-style)

- Any student can create service listings (Gigs) with packages (Basic / Standard / Premium)
- Gig categories: Design, Dev, Writing, Video, Marketing, Data, etc.
- Gig tags, delivery time, revision count, pricing per package
- Gig gallery images uploaded to R2 (original), served via Cloudinary CDN (optimized)
- Gig search & filter by category, price range, delivery time, rating

### 3. Job / Task Board (Upwork-style)

- Any student can post jobs/tasks with budget, deadline, required skills, type
- Job types: Free, Paid, Internship, Volunteer, Tuition
- Any student (other than the poster) can submit proposals with cover letter, timeline, and quoted price
- Poster reviews proposals and selects a student
- Milestone-based project breakdown for larger tasks

### 4. Orders & Project Management

- Order lifecycle: Pending → In Progress → Delivered → Revision → Completed / Disputed
- Milestone tracking with delivery uploads (files uploaded to R2)
- Revision requests with notes
- Order cancellation with defined policy
- Delivery file/link submission

### 5. Payment & Escrow

- Escrow holds client payment upon order start
- Funds released to freelancer upon client approval via SSLCommerz
- Split milestone payments
- Auto-release after defined period of no response
- Withdrawal to bKash / bank
- Platform service fee (5% up to BDT 500)
- Refund & dispute flow

### 6. In-App Chat & Communication

- Real-time 1:1 messaging via Supabase Realtime Broadcast
- File and image sharing in chat (uploaded to R2)
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
- **Admin Dashboard**: User management, dispute queue, platform revenue, content moderation

### 9. Notifications

- In-app notification center
- Push notifications (React Native)
- Email notifications for key events (order placed, payment released, new message)
- Configurable notification preferences

### 10. Search & Discovery

- Full-text search for gigs and jobs (via PostgreSQL + Supabase)
- Filter by: category, skill, budget, delivery time, rating
- Trending gigs section
- Recommended freelancers based on job post skills
- Recently viewed and saved/bookmarked listings

---

## Current Implementation Scope (MVP)

- [ ] Supabase Auth: email/password + Google login
- [ ] Profile creation with `profiles.id` as canonical identifier
- [ ] JnU student verification (`is_verified` flag)
- [ ] Student profile setup: skills, bio, avatar (R2 storage → Cloudinary CDN)
- [ ] Gig creation and browsing (any student can create)
- [ ] Job/task post and proposal submission
- [ ] Order placement, delivery, and completion flow
- [ ] Basic escrow payment (hold & release via SSLCommerz)
- [ ] 1:1 in-app chat per order (Supabase Realtime Broadcast)
- [ ] Rating & review after order completion
- [ ] Unified student dashboard (seller + buyer views)
- [ ] Push & in-app notifications
- [ ] Admin panel

## Key Differentiators from Generic Platforms

- Exclusively for Jagannath University — a trusted, closed campus ecosystem
- Every student is dual-sided: no forced role choice
- Supabase (PostgreSQL + Auth + Realtime) as a unified backend — no separate services for DB, auth, and WebSocket
- Cloudflare R2 (all files) + Cloudinary (image-only CDN): independent, specialized storage layers
- Shared Zod schemas (`@gig-hub/types`) ensure type safety across web and mobile
- Free and volunteer task types beyond just paid gigs
- Student-first UX: mobile-first via React Native, lightweight onboarding
- Local payment method (SSLCommerz) for Bangladesh market
