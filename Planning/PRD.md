# GigHub Requirements Analysis Document (RAD)

**Version:** 2.0
**Date:** April 15, 2026
**Source Baseline:** Planning/PRD.md v1.0
**Methodology:** Agile — Scrum Framework

---

## Table of Contents

1. [Document Purpose](#1-document-purpose)
2. [Product Overview](#2-product-overview)
3. [Stakeholder Analysis](#3-stakeholder-analysis)
4. [Scope Definition](#4-scope-definition)
5. [User Classes and Permissions](#5-user-classes-and-permissions)
6. [Functional Requirements](#6-functional-requirements-analysis)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [External Integration Requirements](#8-external-integration-requirements)
9. [Constraints, Assumptions, and Risks](#9-constraints-assumptions-and-risks)
10. [Feasibility Analysis](#10-feasibility-analysis)
11. [Economic Analysis and Break-Even](#11-economic-analysis-and-break-even)
12. [Agile Scrum Sprint Plan](#12-agile-scrum-sprint-plan)
13. [Testability and Acceptance Strategy](#13-testability-and-acceptance-strategy)
14. [Approval Note](#14-approval-note)

---

## 1. Document Purpose

This document analyzes and structures GigHub product requirements using Agile software engineering practices so that Product, Design, Backend, Web, Mobile, QA, and DevOps teams share a common understanding.

This document includes:

- Product scope and boundaries
- Stakeholder and user class definitions
- Functional requirements (prioritized by MoSCoW)
- Non-functional requirements (measurable and testable)
- External integration requirements (product-level, no implementation detail)
- Feasibility analysis across technical, operational, and economic dimensions
- 5-year economic forecast and break-even calculation
- Phase-wise Agile Scrum sprint plan with epics and user stories

---

## 2. Product Overview

GigHub is a campus-exclusive freelance marketplace for Jagannath University (JnU) students. Every student operates from a single account simultaneously as both buyer and seller — no role selection required.

**Core Value Proposition:**

- Trusted campus-only network with verified student identity
- Gig marketplace + job board + peer tutoring in a single platform
- Escrow-backed transaction safety for paid services
- Real-time communication and review-based trust ratings
- Free peer tutoring/tuition exchange with no platform fee

**Out of Scope (MVP):**

- Non-JnU public onboarding
- Advanced AI job matching
- Team/group bidding
- Organization accounts
- Campus leaderboard and skill badges

---

## 3. Stakeholder Analysis

**Primary Stakeholders:**

| Stakeholder                | Role                  | Interaction                           |
| -------------------------- | --------------------- | ------------------------------------- |
| Students (Buyers)          | Service consumers     | Browse, order, pay, review            |
| Students (Sellers)         | Service providers     | Post gigs/jobs, deliver, earn         |
| Students (Tutors/Learners) | Tutoring participants | Post/accept tutoring sessions (free)  |
| Admin/Moderator Team       | Platform operators    | Manage users, disputes, configuration |

**Secondary Stakeholders:**

| Stakeholder                          | Role                                     |
| ------------------------------------ | ---------------------------------------- |
| Payment Partners (SSLCommerz, bKash) | Payment gateway providers                |
| JnU Community                        | Trust ecosystem and word-of-mouth growth |

**Engineering Stakeholders:**

- Backend Team
- Frontend Web Team
- Mobile Team
- QA/Security Team
- DevOps/SRE

---

## 4. Scope Definition

### 4.1 In-Scope (MVP)

- Secure authentication and student identity management
- Profile creation and management
- Gig marketplace with tiered packages
- Job posting and proposal flow
- Peer tutoring/tuition exchange (free, no platform fee)
- Order lifecycle with delivery, revision, and completion
- Escrow-backed payment and withdrawal
- Real-time messaging and push notifications
- Mutual review and rating system
- Unified student dashboard (buyer + seller views)
- Admin moderation panel and dispute handling

### 4.2 Out-of-Scope (MVP)

- Campus leaderboard and public ranking
- Portfolio showcase pages
- Skill badges and assessment contests
- AI-based job or tutor matching
- Recurring subscription orders
- Non-JnU user onboarding

---

## 5. User Classes and Permissions

### 5.1 Student User

Every registered JnU student has full dual-sided and tutoring access from a single account:

| Capability             | Description                                      |
| ---------------------- | ------------------------------------------------ |
| Create Gigs            | List paid services with package tiers            |
| Browse and Order Gigs  | Purchase services from peers                     |
| Post Jobs              | Post task requests with budget and deadline      |
| Submit Proposals       | Apply to peer job postings                       |
| Post Tutoring Sessions | Offer tutoring/lessons free of charge            |
| Request Tutoring       | Browse and request available tutors              |
| Chat                   | 1-to-1 messaging for inquiries and active orders |
| Manage Orders          | Track orders as buyer and seller                 |
| Leave Reviews          | Rate and review completed transactions           |
| Receive Payments       | Withdraw earnings to bKash or bank               |
| Make Payments          | Pay via local payment gateway                    |

### 5.2 Admin User

| Capability             | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| User Management        | View, verify, suspend, and ban student accounts      |
| Content Moderation     | Review flags on gigs, jobs, tutoring posts, reviews  |
| Dispute Resolution     | Handle order disputes and process refunds            |
| Platform Configuration | Set service fees, escrow timers, job categories      |
| Analytics Visibility   | View platform revenue, user growth, order statistics |

---

## 6. Functional Requirements Analysis

**Notation:**

- **P0** — Must Have (MVP blocking)
- **P1** — Should Have (near-MVP, high value)
- **P2** — Could Have (post-MVP)

---

### FR-A: Authentication and Identity

**Objective:** Enable secure student onboarding and verified identity management.

| ID    | Priority | Requirement                                                                      |
| ----- | -------- | -------------------------------------------------------------------------------- |
| FR-A1 | P0       | Email/password registration and login                                            |
| FR-A2 | P0       | Google OAuth single sign-on                                                      |
| FR-A3 | P0       | Server-side identity token verification                                          |
| FR-A4 | P0       | Automatic student profile creation on first login                                |
| FR-A5 | P0       | Platform session token with identity claims (user ID, role, verification status) |
| FR-A6 | P0       | Session refresh and renewal flow                                                 |
| FR-A7 | P0       | Secure logout and session invalidation                                           |
| FR-A8 | P1       | Password reset via email link                                                    |

**Acceptance Criteria:**

- Client receives a valid session token on successful login
- Auto-profile creation executes reliably on first authenticated access
- Expired or tampered tokens are rejected with appropriate error responses

---

### FR-B: Profile Management

**Objective:** Keep each student's identity discoverable, credible, and self-managed.

| ID    | Priority | Requirement                                                         |
| ----- | -------- | ------------------------------------------------------------------- |
| FR-B1 | P0       | View and edit profile (display name, username, bio, skills, avatar) |
| FR-B2 | P0       | Avatar upload with cloud storage persistence                        |
| FR-B3 | P0       | Skills list add, edit, and remove                                   |
| FR-B4 | P0       | Public profile view accessible to other students                    |
| FR-B5 | P0       | Verification status badge display                                   |
| FR-B6 | P1       | Availability toggle (available / busy)                              |

**Acceptance Criteria:**

- Usernames must be unique and enforced at creation
- Public profile exposes only permitted fields (no private data leakage)
- Avatar changes are immediately reflected across the platform

---

### FR-C: Gig Marketplace

**Objective:** Allow students to monetize skills and convert service listings into paid orders.

| ID    | Priority | Requirement                                                                         |
| ----- | -------- | ----------------------------------------------------------------------------------- |
| FR-C1 | P0       | Create gig (title, description, category, tags)                                     |
| FR-C2 | P0       | Package tiers: Basic, Standard, Premium — each with price, revisions, delivery time |
| FR-C3 | P0       | Gig gallery with up to 5 images                                                     |
| FR-C4 | P0       | Gig listing and detail views                                                        |
| FR-C5 | P0       | Search and filter by category, price, delivery time, and rating                     |
| FR-C6 | P0       | Edit and update existing gigs                                                       |
| FR-C7 | P1       | Gig status transitions: active, paused, deleted                                     |

**Acceptance Criteria:**

- A gig cannot be published without at least one complete package
- Search results are deterministic for identical queries
- Paused gigs are hidden from public listing but preserved

---

### FR-D: Job Board and Proposals

**Objective:** Enable an end-to-end task posting and hiring flow between students.

| ID    | Priority | Requirement                                                                   |
| ----- | -------- | ----------------------------------------------------------------------------- |
| FR-D1 | P0       | Create a job post (title, description, budget, deadline, required skills)     |
| FR-D2 | P0       | Support job types: Free, Paid, Internship, Volunteer                          |
| FR-D3 | P0       | Job listing and detail page                                                   |
| FR-D4 | P0       | Students can submit proposals (cover letter, proposed timeline, quoted price) |
| FR-D5 | P0       | Job poster can review, accept, or reject proposals                            |
| FR-D6 | P1       | Job status management (open, in progress, closed)                             |

**Acceptance Criteria:**

- Proposals cannot be submitted to closed or completed jobs
- An accepted proposal automatically creates an order
- Job poster cannot submit a proposal on their own posting

---

### FR-E: Orders and Delivery

**Objective:** Enforce a traceable and auditable transaction lifecycle.

| ID    | Priority | Requirement                                                                   |
| ----- | -------- | ----------------------------------------------------------------------------- |
| FR-E1 | P0       | Order creation from a gig package selection or accepted proposal              |
| FR-E2 | P0       | Order state machine: Pending → In Progress → Delivered → Completed / Disputed |
| FR-E3 | P0       | Seller submits delivery with file attachments and notes                       |
| FR-E4 | P0       | Buyer can request revision with written reason                                |
| FR-E5 | P0       | Buyer approves delivery to complete the order                                 |
| FR-E6 | P1       | Cancellation flow with defined policy                                         |
| FR-E7 | P1       | Milestone support for larger, multi-stage orders                              |

**Acceptance Criteria:**

- Invalid state transitions are rejected by the system
- All deliveries are timestamped and auditably retained
- Revision count is enforced per-package limit

---

### FR-F: Payments and Escrow

**Objective:** Ensure safe, traceable, and fee-inclusive payment settlement.

| ID    | Priority | Requirement                                                                               |
| ----- | -------- | ----------------------------------------------------------------------------------------- |
| FR-F1 | P0       | Escrow hold of buyer payment at order creation                                            |
| FR-F2 | P0       | Release of funds to seller on buyer approval                                              |
| FR-F3 | P0       | Platform service fee policy: 5% charge for paid transactions up to BDT 500 (MVP baseline) |
| FR-F4 | P0       | SSLCommerz payment gateway integration                                                    |
| FR-F5 | P0       | Seller withdrawal request and processing                                                  |
| FR-F6 | P0       | Transaction history visible to each user                                                  |
| FR-F7 | P1       | bKash direct payment integration                                                          |
| FR-F8 | P1       | Auto-release of escrow after a defined inactivity timeout                                 |

**Acceptance Criteria:**

- Financial records are traceable like a ledger (no silent modifications)
- Payment callback inconsistencies trigger an alerting event
- Withdrawals cannot exceed available settled balance

---

### FR-G: Messaging and Notifications

**Objective:** Enable low-friction real-time communication and timely event awareness.

| ID     | Priority | Requirement                                        |
| ------ | -------- | -------------------------------------------------- |
| FR-G1  | P0       | Real-time 1-to-1 messaging between students        |
| FR-G2  | P0       | Pre-order inquiry chat (before an order is placed) |
| FR-G3  | P0       | Order-linked dedicated chat channel                |
| FR-G4  | P0       | File and image attachments in chat                 |
| FR-G5  | P0       | In-app notification center with unread count badge |
| FR-G6  | P0       | Mark individual or all notifications as read       |
| FR-G7  | P0       | Mobile push notifications for key events           |
| FR-G8  | P1       | Automated system messages for order state changes  |
| FR-G9  | P1       | Read receipts in chat                              |
| FR-G10 | P2       | Typing indicator                                   |

**Acceptance Criteria:**

- Messages are delivered and acknowledged reliably
- Notification types are consistently categorized (order, payment, message, system)
- Push notifications respect user device permission states

---

### FR-H: Reviews and Trust

**Objective:** Build a transparent, reliable marketplace trust layer.

| ID    | Priority | Requirement                                                               |
| ----- | -------- | ------------------------------------------------------------------------- |
| FR-H1 | P0       | Mutual review window opened after order completion                        |
| FR-H2 | P0       | 5-star rating with category breakdowns (quality, communication, delivery) |
| FR-H3 | P0       | Written text feedback                                                     |
| FR-H4 | P0       | Aggregate rating displayed on profile and gig pages                       |
| FR-H5 | P1       | Seller/buyer can respond to received reviews                              |
| FR-H6 | P2       | Top-rated badge eligibility logic                                         |

**Acceptance Criteria:**

- Reviews can only be submitted for confirmed, completed orders
- Each party (buyer/seller) is limited to one review per order
- Submitted reviews cannot be silently edited or deleted by the reviewer

---

### FR-I: Dashboard and Admin Operations

**Objective:** Provide full operational visibility for students and platform administrators.

| ID    | Priority | Requirement                                                    |
| ----- | -------- | -------------------------------------------------------------- |
| FR-I1 | P0       | Unified student dashboard (combined buyer and seller view)     |
| FR-I2 | P0       | Active orders panel (as buyer and as seller)                   |
| FR-I3 | P0       | Gigs, jobs, proposals, and tutoring management panels          |
| FR-I4 | P0       | Earnings summary and transaction history view                  |
| FR-I5 | P0       | Admin: user moderation tools (verify, suspend, ban)            |
| FR-I6 | P0       | Admin: dispute management queue                                |
| FR-I7 | P1       | Admin: platform configuration panel (fees, timers, categories) |
| FR-I8 | P1       | Admin: revenue and activity analytics view                     |

**Acceptance Criteria:**

- Role-based access is strictly enforced (student cannot access admin routes)
- All admin actions (bans, resolution verdicts) are audit-logged with timestamps
- Dashboard data is scoped to the authenticated user only

---

### FR-J: Tuition Listing _(Free Feature — No Platform Fee)_

**Objective:** Allow any platform user — including alumni who want to hire a tutor for their child — to post or browse tutoring/tuition offers with minimal friction. The listing is free-form: the poster writes a single description paragraph covering whatever details are relevant (subject, level, schedule, location, mode, student age, etc.). No rigid field structure is enforced beyond a title and a category tag. The feature reuses the same underlying listing and request data model as gigs/jobs — no separate data model is introduced.

| ID     | Priority | Requirement                                                                                                                                   |
| ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-J1  | P0       | Any user (student or alumni) can post a tuition listing with a title and a free-form description paragraph                                    |
| FR-J2  | P0       | Listing supports an optional broad category tag (e.g., School, University, Language, Competitive Exam, Other)                                 |
| FR-J3  | P0       | Users can browse and search tuition listings by keyword or category tag                                                                       |
| FR-J4  | P0       | A requester can send a contact/session request to the listing poster                                                                          |
| FR-J5  | P0       | The listing poster can accept or decline incoming requests                                                                                    |
| FR-J6  | P0       | Accepted requests open a linked chat channel between poster and requester                                                                     |
| FR-J7  | P0       | All tuition listings and sessions carry zero platform fee — permanently free                                                                  |
| FR-J8  | P0       | Tuition listings reuse the same listing and request data model as gigs/jobs; no dedicated schema is added                                     |
| FR-J9  | P1       | Mutual rating after a completed tutoring engagement                                                                                           |
| FR-J10 | P1       | User's profile shows their active tuition listings and average tuition rating (separate from gig/order rating)                                |
| FR-J11 | P2       | Recurring session scheduling note (poster describes recurrence in the free-form paragraph; structured scheduling is a post-MVP consideration) |

**Acceptance Criteria:**

- No payment or escrow is triggered at any point for a tuition listing or session
- Tuition listings are visually separated from paid gig and job listings in browse/search
- A listing requires only a title and a description paragraph to be published; all other detail is free-form within the description
- Requests cannot be sent to inactive or deleted listings
- Tuition ratings are stored and displayed independently from gig/order ratings

---

## 7. Non-Functional Requirements (NFR)

### 7.1 Performance

- Standard read API response: p95 latency under 200ms
- Real-time chat perceived delivery: under 1 second
- Search query response: under 500ms for typical queries

### 7.2 Scalability

- Support 5,000+ concurrent users at launch phase
- Architecture must support horizontal scaling for API and real-time layers

### 7.3 Availability and Reliability

- Target platform uptime: 99.5%
- Graceful degradation if external payment or messaging providers fail
- Payment callbacks must be idempotent and retryable

### 7.4 Security

- OWASP Top 10 controls enforced
- All protected routes require valid, verified session tokens
- Input validation and output sanitization on all user-supplied content
- Rate limiting: authentication endpoints 5 req/min, general API 100 req/min per user
- All data in transit encrypted via TLS; sensitive data encrypted at rest

### 7.5 Usability and Accessibility

- Mobile-first responsive interface (smartphone is primary device)
- English-first UI with bilingual-friendly wording
- WCAG 2.1 AA compliance target for web frontend

### 7.6 Maintainability

- Clear module boundaries: auth, profile, gig, job, order, payment, chat, tutoring
- API versioning strategy from day one
- Service design should allow module-level replacement without cascading changes

### 7.7 Observability

- Structured logs with correlation IDs on all requests
- Key funnel metrics: auth success rate, order completion rate, payment success/failure
- Alerting thresholds configured for error spikes and latency degradation

---

## 8. External Integration Requirements

### 8.1 Identity Provider

- Support email/password and Google OAuth through a managed identity provider
- Server-side token verification on every protected API call
- Designed for future extension to additional OAuth providers without redesign

### 8.2 Content and Data Management

- Admin and content operations managed through a CMS-backed admin panel
- Permission model aligned with platform role definitions

### 8.3 File and Media Storage

- All user-uploaded content (avatars, gig images, delivery files, chat attachments) stored in a dedicated cloud object store
- File size limit: 25 MB per upload
- Signed or access-controlled URLs for sensitive delivery files

### 8.4 Payment Gateways

- Phase 1: SSLCommerz as primary payment gateway with secure callback handling
- Phase 2: bKash direct payment integration
- All payment callbacks must be validated before triggering financial state changes

### 8.5 Real-Time Communication

- Real-time bidirectional messaging for chat and live event notifications
- Mobile push notifications for key platform events (new message, order update, payment)

---

## 9. Constraints, Assumptions, and Risks

### 9.1 Constraints

- Platform is campus-exclusive: only JnU students can register in MVP; architecture supports future multi-campus expansion
- Payments are subject to Bangladesh payment gateway regulations
- Platform fee policy in MVP: 5% charge for paid transactions up to BDT 500 (no per-gig override)

### 9.2 Assumptions

- Students primarily access the platform via Android smartphones
- An available admin moderation team from project launch
- Payment gateway uptime remains at acceptable commercial levels
- JnU student enrollment base provides sufficient initial addressable market

### 9.3 Risks and Mitigation

| Risk                           | Impact                    | Mitigation                                                              |
| ------------------------------ | ------------------------- | ----------------------------------------------------------------------- |
| Payment callback inconsistency | High — fund mismatches    | Idempotent handlers, reconciliation job, audit alerts                   |
| Chat or job spam and abuse     | Medium — trust erosion    | Report flow, moderation queue, rate limits                              |
| Dispute volume overload        | Medium — admin bottleneck | Explicit dispute policy, SLA tiers, admin queue tooling                 |
| Student identity misuse        | High — safety and trust   | Verification flag, campus email check (future sprint)                   |
| Low early adoption             | Medium — revenue impact   | Campus ambassador program, social media push, zero-fee tutoring as hook |
| Payment gateway downtime       | Medium — order disruption | Graceful degradation message, retry queue                               |

---

## 10. Feasibility Analysis

### 10.1 Technical Feasibility

**Assessment: Feasible with manageable complexity**

| Dimension           | Assessment                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| Backend API         | Mature, well-documented stack with established patterns for marketplace applications                  |
| Authentication      | Managed identity provider reduces custom auth complexity significantly                                |
| Real-time Chat      | Socket.IO is proven at the target scale; no custom protocol required                                  |
| Payment Integration | SSLCommerz provides a documented Bangladesh-specific API; bKash integration is an established pattern |
| Mobile              | Flutter enables a single codebase for Android and iOS, reducing team size requirements                |
| File Storage        | Object storage is commodity infrastructure; no custom CDN build required                              |
| Escrow Logic        | Custom escrow logic is well-understood; the primary complexity lies in edge-case dispute handling     |

**Key Technical Risks:**

- Escrow integrity under concurrent payment callbacks requires careful idempotency design
- WebSocket connection management at scale (1,000+ concurrent users) needs load-testing validation

---

### 10.2 Operational Feasibility

**Assessment: Feasible with defined admin team**

- Platform requires at least 2 part-time admins for moderation and dispute resolution at launch
- Dispute volume is expected to remain low in Year 1 (limited user base)
- Admin tooling via built-in CMS panel significantly reduces custom admin development cost
- Campus-limited scope constrains moderation complexity compared to a public platform
- Tutoring feature is self-moderated through peer ratings and has no financial dispute risk

---

### 10.3 Market Feasibility

**Assessment: Strong — underserved high-need segment**

| Factor                  | Detail                                                                           |
| ----------------------- | -------------------------------------------------------------------------------- |
| Target market size      | ~20,000 enrolled students at Jagannath University                                |
| Existing competition    | None on-campus; Fiverr/Upwork do not serve local campus micro-transactions       |
| Local payment readiness | bKash penetration in Bangladesh student population exceeds 85%                   |
| Platform differentiator | Campus-only trust, zero-fee tutoring, dual-sided account, local language comfort |
| Adoption lever          | Free tutoring exchange as a viral entry point with no financial barrier          |
| Student income demand   | Rising cost of living in Dhaka increases student motivation to earn on platform  |

---

### 10.4 Financial Feasibility

**Assessment: Break-even achievable within Year 3**

- Initial investment is modest relative to potential Year 2 revenue
- Revenue model is simple: 5% platform fee on paid transactions up to BDT 500 in MVP
- Tutoring is free and zero-revenue — it serves as a growth and retention driver
- Monthly operational costs are expected to be covered in Year 2 (monthly break-even at ~1,400 active transacting users under current assumptions)
- Full investment recovery (cumulative break-even) is projected during Year 3

_Detailed calculations in Section 11._

### 10.5 Cost-Benefit Analysis (Feasibility View)

Discount rate used for PV calculation: 10%.

| Cost-Benefit Item                       | 2026       | 2027      | 2028      | 2029      | 2030       | Total      |
| --------------------------------------- | ---------- | --------- | --------- | --------- | ---------- | ---------- |
| Platform fee revenue (5% up to BDT 500) | 480,000    | 1,707,850 | 3,828,000 | 7,408,800 | 12,420,000 |            |
| Total Benefits                          | 480,000    | 1,707,850 | 3,828,000 | 7,408,800 | 12,420,000 |            |
| PV of Benefits                          | 436,364    | 1,411,446 | 2,876,033 | 5,060,310 | 7,711,843  | 17,495,996 |
| PV of All Benefits                      | 436,364    | 1,847,810 | 4,723,843 | 9,784,153 | 17,495,996 |            |
| Development team (build phase)          | 840,000    | 0         | 0         | 0         | 0          |            |
| UI/UX and QA setup                      | 125,000    | 0         | 0         | 0         | 0          |            |
| Launch marketing                        | 60,000     | 0         | 0         | 0         | 0          |            |
| Initial infra/domain setup              | 20,000     | 0         | 0         | 0         | 0          |            |
| Legal/registration setup                | 30,000     | 0         | 0         | 0         | 0          |            |
| Total Development Costs                 | 1,075,000  | 0         | 0         | 0         | 0          |            |
| Operational costs                       | 840,000    | 1,080,000 | 1,440,000 | 1,800,000 | 2,040,000  |            |
| Total Operational Costs                 | 840,000    | 1,080,000 | 1,440,000 | 1,800,000 | 2,040,000  |            |
| Total Costs                             | 1,915,000  | 1,080,000 | 1,440,000 | 1,800,000 | 2,040,000  |            |
| PV of Costs                             | 1,740,909  | 892,562   | 1,081,893 | 1,229,424 | 1,266,679  | 6,211,467  |
| PV of All Costs                         | 1,740,909  | 2,633,471 | 3,715,364 | 4,944,788 | 6,211,467  |            |
| Total Project Benefits-Costs            | -1,435,000 | 627,850   | 2,388,000 | 5,608,800 | 10,380,000 |            |
| Yearly NPV                              | -1,304,545 | 518,884   | 1,794,140 | 3,830,886 | 6,445,164  | 11,284,529 |
| Cumulative NPV                          | -1,304,545 | -785,661  | 1,008,479 | 4,839,365 | 11,284,529 |            |
| Return on Investment (discounted)       | 181.67%    |           |           |           |            | 1.82x      |
| Break-even Point                        | 2.44 years |           |           |           |            | Y3+0.44    |
| Intangible Benefits                     | See notes  |           |           |           |            |            |

Notes:

- ROI formula: 11,284,529 / 6,211,467 = 1.8167 (181.67%)
- Break-even detail: occurs in Year 3; fraction = 785,661 / 1,794,140 = 0.44
- Intangible benefits: faster campus trust cycle and better student retention; free tuition listings improve adoption funnel for paid services

---

## 11. Economic Analysis and Break-Even

### 11.1 Key Assumptions

| Parameter                                         | Value                                              |
| ------------------------------------------------- | -------------------------------------------------- |
| JnU total student enrollment                      | ~20,000 students                                   |
| Platform service fee (paid gigs/jobs)             | 5% of transaction value up to BDT 500 (MVP policy) |
| Tutoring platform fee                             | 0% (permanently free)                              |
| Average paid transaction value                    | BDT 500 (Year 1), growing to BDT 700 (Year 5)      |
| Average monthly paid transactions per active user | 2.0 (Year 1) → 3.0 (Year 5)                        |
| Exchange rate reference                           | 1 USD ≈ BDT 110                                    |

---

### 11.2 Initial Investment (Year 0 — Pre-Launch)

| Item                                      | Estimated Cost (BDT)              |
| ----------------------------------------- | --------------------------------- |
| Development team (5 members × 6–8 months) | 8,40,000                          |
| UI/UX design and QA                       | 1,25,000                          |
| Launch marketing and campus promotion     | 60,000                            |
| Infrastructure setup and domain           | 20,000                            |
| Legal, registration, and administration   | 30,000                            |
| **Total Initial Investment**              | **≈ BDT 10,75,000 (≈ USD 9,773)** |

---

### 11.3 Monthly Operating Cost Model

| Cost Category                                | Year 1       | Year 2        | Year 3        | Year 4        | Year 5        |
| -------------------------------------------- | ------------ | ------------- | ------------- | ------------- | ------------- |
| Infrastructure (hosting, CDN, storage, APIs) | 15,000       | 20,000        | 30,000        | 40,000        | 50,000        |
| Team (maintenance, support, part-time dev)   | 38,000       | 52,000        | 72,000        | 92,000        | 1,00,000      |
| Marketing and campus outreach                | 12,000       | 13,000        | 12,000        | 12,000        | 10,000        |
| Miscellaneous (tools, legal, ops)            | 5,000        | 5,000         | 6,000         | 6,000         | 10,000        |
| **Monthly Total (BDT)**                      | **70,000**   | **90,000**    | **1,20,000**  | **1,50,000**  | **1,70,000**  |
| **Annual Total (BDT)**                       | **8,40,000** | **10,80,000** | **14,40,000** | **18,00,000** | **20,40,000** |

---

### 11.4 User Adoption Projections

| Year   | Active Users                          | % of JnU Students |
| ------ | ------------------------------------- | ----------------- |
| Year 1 | ~800 (avg, ramping from 100)          | 4%                |
| Year 2 | ~2,400 (avg, ramping to 2,800 by end) | 12–14%            |
| Year 3 | ~4,400                                | 22%               |
| Year 4 | ~7,000                                | 35%               |
| Year 5 | ~10,000                               | 50%               |

---

### 11.5 Revenue Projections (Paid Transactions Only)

| Year   | Avg Active Users | Avg Tx/User/Month | Avg Tx Value (BDT) | Annual GMV (BDT) | Platform Revenue @ 5% (BDT) |
| ------ | ---------------- | ----------------- | ------------------ | ---------------- | --------------------------- |
| Year 1 | 800              | 2.0               | 500                | 96,00,000        | 4,80,000                    |
| Year 2 | 2,400            | 2.2               | 540                | 3,41,57,000      | 17,07,850                   |
| Year 3 | 4,400            | 2.5               | 580                | 7,65,60,000      | 38,28,000                   |
| Year 4 | 7,000            | 2.8               | 630                | 14,81,76,000     | 74,08,800                   |
| Year 5 | 10,000           | 3.0               | 690                | 24,84,00,000     | 1,24,20,000                 |

---

### 11.6 Annual Profit / Loss Summary

| Year           | Revenue (BDT) | Operating Cost (BDT) | Net Annual (BDT) | Cumulative P/L (BDT)        |
| -------------- | ------------- | -------------------- | ---------------- | --------------------------- |
| Year 0 (Setup) | 0             | 10,75,000 (initial)  | −10,75,000       | −10,75,000                  |
| Year 1         | 4,80,000      | 8,40,000             | −3,60,000        | −14,35,000                  |
| Year 2         | 17,07,850     | 10,80,000            | +6,27,850        | −8,07,150                   |
| Year 3         | 38,28,000     | 14,40,000            | +23,88,000       | **+15,80,850** ← Break-Even |
| Year 4         | 74,08,800     | 18,00,000            | +56,08,800       | +71,89,650                  |
| Year 5         | 1,24,20,000   | 20,40,000            | +1,03,80,000     | +1,75,69,650                |

> All values in BDT (Bangladeshi Taka). 1 USD ≈ BDT 110.

---

### 11.7 Break-Even Analysis

**Monthly Operational Break-Even:**

$$
\text{Transactions needed/month} = \frac{\text{Monthly operating cost}}{\text{Revenue per transaction}} = \frac{70{,}000}{500 \times 5\%} = \frac{70{,}000}{25} = 2{,}800 \text{ transactions}
$$

$$
\text{Active users needed} = \frac{2{,}800 \text{ tx/month}}{2 \text{ tx/user/month}} = 1{,}400 \text{ users}
$$

- **Monthly operational break-even:** Approximately **Month 13–14 after launch** (when active transacting users reach ~1,400).
- **Full investment recovery (cumulative break-even):** Approximately **Month 30–32** after project start (roughly **mid Year 3 after launch**).

**5-Year ROI:**

$$
\text{Total Revenue (Y1–Y5)} = \text{BDT } 2{,}58{,}44{,}650
$$

$$
\text{Total Cost (Y0–Y5)} = \text{BDT } 83{,}75{,}000
$$

$$
\text{Net 5-Year Profit} = \text{BDT } 1{,}74{,}69{,}650 \approx \text{USD } 1{,}58{,}815
$$

$$
\text{ROI (5-year)} = \frac{1{,}74{,}69{,}650}{83{,}75{,}000} \times 100 \approx \textbf{209\%}
$$

---

### 11.8 Key Economic Notes

- **Tutoring is a strategic loss-leader:** Zero-fee tutoring generates no direct revenue but reduces onboarding friction, increases daily active users, and accelerates paid transaction adoption.
- **Revenue is conservative:** Projections use only the 5% service fee (up to BDT 500 per paid transaction in MVP). Future premium features (featured listings, promoted gigs, analytics for sellers) are not modeled and would improve ROI further.
- **Adoption risk is the primary variable:** If Year 1 adoption stays below 700 active users, monthly break-even shifts to Year 2 late-stage, and full break-even can move beyond Year 3.
- **Cost model includes no full-time salaries in operations:** Post-launch maintenance assumes a lean part-time team. Scaling beyond Year 3 will require full-time hires, which are partially reflected in the rising Year 3–5 team costs.

---

## 12. Agile Scrum Sprint Plan

### 12.1 Scrum Framework Configuration

| Parameter               | Value                                                                             |
| ----------------------- | --------------------------------------------------------------------------------- |
| Sprint duration         | 2 weeks                                                                           |
| Team size               | 5 members (1 backend, 1 web frontend, 1 mobile, 1 lead/full-stack, 1 QA + design) |
| Estimated team velocity | 35–40 story points per sprint                                                     |
| Sprint ceremonies       | Planning (day 1), Daily standup (15 min), Review + Retrospective (last day)       |
| Definition of Done      | Feature code merged, unit tested, reviewed, deployed to staging, QA-signed off    |
| Backlog tool            | Linear / Jira (to be confirmed)                                                   |

---

### 12.2 Epic and Phase Map

| Phase                       | Sprints | Duration    | Core Epics                                         | FR Coverage      |
| --------------------------- | ------- | ----------- | -------------------------------------------------- | ---------------- |
| Phase 1 — Foundation        | 1–2     | Weeks 1–4   | Auth, Profiles, Security baseline                  | FR-A, FR-B       |
| Phase 2 — Marketplace Core  | 3–5     | Weeks 5–10  | Gig CRUD, Job Board, Proposals                     | FR-C, FR-D       |
| Phase 3 — Transactions      | 6–8     | Weeks 11–16 | Orders, Delivery, Payments, Escrow                 | FR-E, FR-F       |
| Phase 4 — Communication     | 9–10    | Weeks 17–20 | Real-time Chat, Notifications, Push                | FR-G             |
| Phase 5 — Trust and Quality | 11–13   | Weeks 21–26 | Reviews, Tutoring, Search Polish, Admin, Dashboard | FR-H, FR-I, FR-J |

---

### 12.3 Phase 1 — Foundation (Sprints 1–2, Weeks 1–4)

**Sprint Goal:** Secure authentication and student profile are fully functional end-to-end.

#### Sprint 1 — Authentication (38 SP)

| User Story                                                   | SP  |
| ------------------------------------------------------------ | --- |
| As a student, I can register with email and password         | 5   |
| As a student, I can sign in with Google OAuth                | 5   |
| As a backend service, I verify identity tokens server-side   | 8   |
| As a student, I receive a platform session token on login    | 5   |
| As a student, my profile is auto-created on first login      | 5   |
| As a student, I can refresh my session without re-logging in | 5   |
| As a student, I can log out and invalidate my session        | 3   |
| As a student, I can reset my password via email              | 2   |

#### Sprint 2 — Profiles (36 SP)

| User Story                                                    | SP  |
| ------------------------------------------------------------- | --- |
| As a student, I can set my display name, username, and bio    | 5   |
| As a student, I can upload and change my avatar               | 5   |
| As a student, I can add and remove skills from my profile     | 5   |
| As a student, I can view any other student's public profile   | 5   |
| As a student, I can see another student's verification status | 3   |
| As a student, I can toggle my availability status             | 3   |
| As a platform, usernames are unique and validated on save     | 5   |
| As a student, private profile data is never exposed publicly  | 5   |

---

### 12.4 Phase 2 — Marketplace Core (Sprints 3–5, Weeks 5–10)

**Sprint Goal:** Students can list paid gigs, browse, and post jobs with proposals.

#### Sprint 3 — Gig Creation and Management (40 SP)

| User Story                                                             | SP  |
| ---------------------------------------------------------------------- | --- |
| As a student, I can create a gig with title, description, and category | 5   |
| As a student, I can add tags to my gig                                 | 3   |
| As a student, I can create up to 3 packages (Basic/Standard/Premium)   | 8   |
| As a student, I can upload up to 5 images to a gig gallery             | 8   |
| As a student, I can edit an existing gig                               | 5   |
| As a student, I can pause or delete a gig                              | 5   |
| As a platform, gigs cannot be published without at least one package   | 3   |
| As a student, I can see a preview before publishing my gig             | 3   |

#### Sprint 4 — Gig Discovery and Search (35 SP)

| User Story                                                         | SP  |
| ------------------------------------------------------------------ | --- |
| As a student, I can browse all active gigs in a listing view       | 5   |
| As a student, I can view a gig detail page                         | 5   |
| As a student, I can search gigs by keyword                         | 8   |
| As a student, I can filter gigs by category, price, delivery time  | 8   |
| As a student, I can filter gigs by seller rating                   | 5   |
| As a student, search results are paginated and sorted consistently | 4   |

#### Sprint 5 — Job Board and Proposals (38 SP)

| User Story                                                                      | SP  |
| ------------------------------------------------------------------------------- | --- |
| As a student, I can create a job post with title, description, budget, deadline | 5   |
| As a student, I can specify job type (Free/Paid/Internship/Volunteer)           | 3   |
| As a student, I can add required skills to a job post                           | 3   |
| As a student, I can browse and view job listings                                | 5   |
| As a student, I can submit a proposal with cover letter and quoted price        | 8   |
| As a student, I can accept or reject received proposals                         | 5   |
| As a platform, accepted proposals automatically create an order                 | 5   |
| As a student, I cannot submit a proposal to my own job post                     | 4   |

---

### 12.5 Phase 3 — Transactions (Sprints 6–8, Weeks 11–16)

**Sprint Goal:** Orders are created, managed, and financially settled with escrow.

#### Sprint 6 — Order Lifecycle (40 SP)

| User Story                                                                        | SP  |
| --------------------------------------------------------------------------------- | --- |
| As a buyer, I can place an order from a gig package                               | 8   |
| As a platform, order state follows: Pending → In Progress → Delivered → Completed | 8   |
| As a seller, I receive a notification when a new order is placed                  | 3   |
| As a buyer, I can track my active orders                                          | 5   |
| As a seller, I can track my active orders                                         | 5   |
| As a platform, invalid order state transitions are rejected                       | 5   |
| As a seller, I can view full order details including buyer information            | 3   |
| As a buyer, I can view full order details including seller information            | 3   |

#### Sprint 7 — Delivery and Revision Flow (38 SP)

| User Story                                                            | SP  |
| --------------------------------------------------------------------- | --- |
| As a seller, I can submit a delivery with files and notes             | 8   |
| As a buyer, I can approve a delivery to complete the order            | 5   |
| As a buyer, I can request a revision with a written reason            | 8   |
| As a platform, revision count is tracked and enforced per package     | 5   |
| As a buyer, I can cancel an order per the defined cancellation policy | 5   |
| As a platform, deliveries are timestamped and immutably stored        | 4   |
| As a seller, I can support milestone-based delivery for larger orders | 3   |

#### Sprint 8 — Payments and Escrow (42 SP)

| User Story                                                                | SP  |
| ------------------------------------------------------------------------- | --- |
| As a buyer, I can pay via SSLCommerz at order creation                    | 8   |
| As a platform, buyer payment is held in escrow until approval             | 8   |
| As a platform, platform fee is deducted on fund release                   | 5   |
| As a seller, funds are released to my balance on buyer approval           | 5   |
| As a seller, I can submit a withdrawal request                            | 5   |
| As a student, I can view my full transaction history                      | 5   |
| As a platform, payment callbacks are validated and idempotent             | 3   |
| As a platform, escrow auto-releases after a configured inactivity timeout | 3   |

---

### 12.6 Phase 4 — Communication (Sprints 9–10, Weeks 17–20)

**Sprint Goal:** Students can chat in real time, and push notifications keep them engaged.

#### Sprint 9 — Real-Time Chat (40 SP)

| User Story                                                              | SP  |
| ----------------------------------------------------------------------- | --- |
| As a student, I can send and receive real-time messages                 | 8   |
| As a student, I can message a gig seller before placing an order        | 5   |
| As an order participant, I have a dedicated chat channel per order      | 8   |
| As a student, I can send file and image attachments in chat             | 8   |
| As a platform, automated system messages appear for order state changes | 5   |
| As a student, I can see read receipts on sent messages                  | 3   |
| As a student, I see a typing indicator when the other party is typing   | 3   |

#### Sprint 10 — Notifications and Push (36 SP)

| User Story                                                         | SP  |
| ------------------------------------------------------------------ | --- |
| As a student, I have an in-app notification center                 | 5   |
| As a student, I see an unread count badge on the notification icon | 3   |
| As a student, I can mark individual notifications as read          | 3   |
| As a student, I can mark all notifications as read at once         | 3   |
| As a mobile user, I receive push notifications for new messages    | 8   |
| As a mobile user, I receive push notifications for order updates   | 5   |
| As a mobile user, I receive push notifications for payment events  | 5   |
| As a student, notifications respect my device permission state     | 4   |

---

### 12.7 Phase 5 — Trust, Quality, and Tutoring (Sprints 11–13, Weeks 21–26)

**Sprint Goal:** Reviews establish trust, tutoring goes live as a free feature, and admin tools are production-ready.

#### Sprint 11 — Reviews and Trust System (32 SP)

| User Story                                                        | SP  |
| ----------------------------------------------------------------- | --- |
| As a buyer, I can leave a review after order completion           | 5   |
| As a seller, I can leave a review after order completion          | 5   |
| As a student, I can rate on 5 stars with category breakdown       | 5   |
| As a student, I can write a text review                           | 3   |
| As a student, my aggregate rating is shown on my profile and gigs | 5   |
| As a student, I can respond to a review left on my profile        | 5   |
| As a platform, duplicate reviews per order-party are blocked      | 4   |

#### Sprint 12 — Tuition Feature and Search Polish (35 SP)

| User Story                                                                                           | SP  |
| ---------------------------------------------------------------------------------------------------- | --- |
| As a user (student or alumni), I can post a tuition listing with a title and a description paragraph | 8   |
| As a user, I can tag my tuition listing with a broad category (School/University/Language/Other)     | 3   |
| As a user, I can browse and search tuition listings by keyword or category                           | 5   |
| As a requester, I can send a session request to a listing poster                                     | 5   |
| As a poster, I can accept or decline incoming session requests                                       | 3   |
| As a poster, accepting a request opens a linked chat channel                                         | 3   |
| As a platform, tuition listings reuse the existing listing/request data model — no new schema        | 3   |
| As a platform, all tuition sessions carry zero platform fee                                          | 2   |
| As a user, I can rate a completed tuition engagement                                                 | 3   |

#### Sprint 13 — Admin Tools, Dashboard, and UAT (38 SP)

| User Story                                                                           | SP  |
| ------------------------------------------------------------------------------------ | --- |
| As a student, I see a unified dashboard with orders, gigs, jobs, and tutoring        | 8   |
| As a student, my earnings and transaction history are clearly displayed              | 5   |
| As an admin, I can verify, suspend, or ban student accounts                          | 5   |
| As an admin, I can view and manage the dispute resolution queue                      | 5   |
| As an admin, I can configure platform fees, timers, and categories                   | 5   |
| As an admin, I can view platform revenue and activity analytics                      | 5   |
| As a platform, all admin actions are fully audit-logged                              | 3   |
| UAT: full onboarding, order lifecycle, payment, tutoring session, review — pass/fail | 2   |

---

### 12.8 Sprint Summary Table

| Sprint    | Phase   | Focus                    | Story Points | Duration     |
| --------- | ------- | ------------------------ | ------------ | ------------ |
| Sprint 1  | Phase 1 | Authentication           | 38           | Weeks 1–2    |
| Sprint 2  | Phase 1 | Profiles                 | 36           | Weeks 3–4    |
| Sprint 3  | Phase 2 | Gig CRUD + Packages      | 40           | Weeks 5–6    |
| Sprint 4  | Phase 2 | Gig Search + Discovery   | 35           | Weeks 7–8    |
| Sprint 5  | Phase 2 | Job Board + Proposals    | 38           | Weeks 9–10   |
| Sprint 6  | Phase 3 | Order Lifecycle          | 40           | Weeks 11–12  |
| Sprint 7  | Phase 3 | Delivery + Revision      | 38           | Weeks 13–14  |
| Sprint 8  | Phase 3 | Payments + Escrow        | 42           | Weeks 15–16  |
| Sprint 9  | Phase 4 | Real-Time Chat           | 40           | Weeks 17–18  |
| Sprint 10 | Phase 4 | Notifications + Push     | 36           | Weeks 19–20  |
| Sprint 11 | Phase 5 | Reviews + Trust          | 32           | Weeks 21–22  |
| Sprint 12 | Phase 5 | Tutoring + Search Polish | 35           | Weeks 23–24  |
| Sprint 13 | Phase 5 | Admin + Dashboard + UAT  | 38           | Weeks 25–26  |
| **Total** |         |                          | **478 SP**   | **26 weeks** |

---

## 13. Testability and Acceptance Strategy

### 13.1 Test Layers

| Layer              | Scope                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| Unit tests         | Business rules, input validation, state machine transitions                                        |
| Integration tests  | External service mock flows (payment, identity, storage)                                           |
| API contract tests | Endpoint request/response compatibility and schema validation                                      |
| End-to-end tests   | Full user journeys: onboarding, order lifecycle, payment settlement, tutoring session, review flow |

### 13.2 MVP Release Gates

All of the following must pass before MVP shipment:

- All P0 functional requirements have passing acceptance tests
- Authentication, authorization, and rate-limiting security checks pass
- Order state machine transitions are fully covered and auditable
- Payment capture and escrow release are reproducible under test conditions
- Tutoring sessions complete without triggering any payment flow
- Admin role-based access enforcement is validated
- Zero critical or high-severity open defects

### 13.3 Regression Strategy

- Automated regression suite runs on every merge to main branch
- Manual regression on all P0 flows before each sprint release to staging
- Payment flow is manually verified in every release cycle due to financial sensitivity

---

## 14. Approval Note

This Requirements Analysis Document (v2.0) supersedes RAD v1.0 (April 8, 2026).

Updates in v2.0:

- Implementation and database design details removed (moved to technical specification documents)
- Phase structure converted to Agile Scrum sprint format
- Peer Tutoring / Tuition Exchange (FR-J) added as a permanently free feature
- Feasibility analysis added across technical, operational, market, and financial dimensions
- 5-year economic analysis and break-even calculation added

Before implementation begins, section-wise review and sign-off is required from:

- **Product Owner** — Sections 4, 6, 12
- **Tech Lead** — Sections 7, 8, 12
- **QA Lead** — Sections 6 (acceptance criteria), 13
- **Finance/Admin** — Section 11
