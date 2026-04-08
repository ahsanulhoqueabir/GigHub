# GigHub Requirements Analysis Document (RAD)

Version: 1.0  
Date: April 8, 2026  
Source Baseline: Planning/PRD.md

---

## 1. Document Purpose

The purpose of this document is to analyze and structure GigHub product requirements using software engineering best practices so that Product, Design, Backend, Web, Mobile, QA, and DevOps teams can work with a shared interpretation.

This document includes:

- Product scope and boundaries
- Stakeholders and user classes
- Functional requirements (prioritized)
- Non-functional requirements (measurable)
- Data, integration, security, and compliance requirements
- Assumptions, constraints, risks, dependencies
- Acceptance criteria and phase-wise traceability

---

## 2. Product Overview

GigHub is a closed, campus-centric freelance marketplace where a Jagannath University student can operate from a single account as both buyer and seller.

Core value proposition:

- Trusted campus-only network
- Gig marketplace + job board in one platform
- Escrow-backed transaction safety
- Real-time communication and review-based trust

Out of scope (MVP):

- Non-JnU public onboarding
- Advanced AI matching
- Team bidding
- Organization accounts

---

## 3. Stakeholder Analysis

Primary stakeholders:

- Students (buyers + sellers)
- Admin/moderator team

Secondary stakeholders:

- Payment partners (SSLCommerz, bKash)
- University trust/community ecosystem

Engineering stakeholders:

- Backend (NestJS)
- Frontend Web (Next.js)
- Mobile (Flutter)
- Data/Admin (Directus/PostgreSQL)
- QA/SRE/Security

---

## 4. Scope Definition

### 4.1 In-Scope (MVP)

- Authentication with Firebase + platform JWT
- Profile management
- Gig CRUD + package system
- Job posting + proposal flow
- Order lifecycle with delivery and revision
- Escrow and transaction tracking
- Real-time chat and notifications
- Review and rating system
- Unified dashboard for each student
- Admin moderation and dispute handling

### 4.2 Out-of-Scope (MVP)

- Campus leaderboard
- Portfolio showcase
- Skill badges and contests
- AI-based job matching
- Recurring orders

---

## 5. User Classes and Permissions

### 5.1 Student User

- Can create/manage gigs
- Can browse/order gigs
- Can post jobs and review proposals
- Can submit proposals to jobs
- Can chat pre-order and post-order
- Can manage orders as buyer and seller
- Can submit and receive reviews
- Can withdraw earnings

### 5.2 Admin User

- User management (verify, suspend, ban)
- Dispute resolution
- Content moderation
- Platform configuration (fees, timers)
- Platform analytics visibility

---

## 6. Functional Requirements Analysis

Notation:

- P0 = Must have (MVP blocking)
- P1 = Should have (near-MVP)
- P2 = Could have (post-MVP)

### FR-A: Authentication and Identity

Objective: Enable secure onboarding and canonical identity management.

Requirements:

- FR-A1 (P0): Email/password registration via Firebase Auth
- FR-A2 (P0): Google OAuth login via Firebase Auth
- FR-A3 (P0): Firebase ID token verification in backend
- FR-A4 (P0): Auto-create profile in `gh_profiles` on first login
- FR-A5 (P0): Platform JWT with claims: `profile_id`, `username`, `is_verified`, `role`
- FR-A6 (P0): Refresh token flow and session renewal
- FR-A7 (P0): Logout/token invalidation flow
- FR-A8 (P1): Password reset support via Firebase

Acceptance criteria:

- On successful login, the client receives a usable platform JWT
- If no profile exists, a profile is auto-created
- Invalid Firebase tokens are rejected

### FR-B: Profile Management

Objective: Keep student identity discoverable and editable.

Requirements:

- FR-B1 (P0): View/edit profile fields (display_name, username, bio, skills, avatar)
- FR-B2 (P0): Avatar upload to R2
- FR-B3 (P0): Skills add/remove
- FR-B4 (P0): Public profile view endpoint/page
- FR-B5 (P0): `is_verified` state visibility
- FR-B6 (P1): Availability toggle

Acceptance criteria:

- Username uniqueness enforcement
- Avatar URL securely persisted
- Public profile restricted to allowed fields only

### FR-C: Gig Marketplace

Objective: Enable conversion from service listing to completed order.

Requirements:

- FR-C1 (P0): Gig create (title, description, category, tags)
- FR-C2 (P0): Package tiers (Basic/Standard/Premium) with price, revisions, delivery time
- FR-C3 (P0): Gig gallery upload (max 5 images)
- FR-C4 (P0): Gig listing and detail views
- FR-C5 (P0): Search and filter (category, price, delivery, rating)
- FR-C6 (P0): Gig update/edit
- FR-C7 (P1): Status management (active/paused/deleted)

Acceptance criteria:

- A gig cannot be published without at least one package
- Combined filters and queries return deterministic results

### FR-D: Job Board and Proposals

Objective: Enable end-to-end posting-to-hiring flow for task-based work.

Requirements:

- FR-D1 (P0): Job post create (title, description, budget, deadline, skills, type)
- FR-D2 (P0): Job types support (Free/Paid/Internship/Volunteer)
- FR-D3 (P0): Job listing and detail
- FR-D4 (P0): Proposal submit (cover letter, timeline, quoted price)
- FR-D5 (P0): Proposal review and accept/reject
- FR-D6 (P1): Job status transitions

Acceptance criteria:

- New proposals are rejected for closed jobs
- Accepted proposals generate an order

### FR-E: Orders and Delivery

Objective: Enforce a valid transaction lifecycle.

Requirements:

- FR-E1 (P0): Order creation from gig package/accepted proposal
- FR-E2 (P0): State machine: Pending -> In Progress -> Delivered -> Completed/Disputed
- FR-E3 (P0): Delivery submission with attachments + notes
- FR-E4 (P0): Revision request flow
- FR-E5 (P0): Buyer approval and completion
- FR-E6 (P1): Cancellation policy enforcement
- FR-E7 (P1): Milestone support for larger jobs

Acceptance criteria:

- Invalid state transitions are blocked
- Deliveries are timestamped and auditable

### FR-F: Payments and Escrow

Objective: Ensure safe payment settlement with platform fee support.

Requirements:

- FR-F1 (P0): Escrow hold on order payment
- FR-F2 (P0): Release on buyer approval
- FR-F3 (P0): Platform fee deduction via configurable rate
- FR-F4 (P0): SSLCommerz payment flow
- FR-F5 (P0): Withdrawal request + processing
- FR-F6 (P0): Transaction history visibility
- FR-F7 (P1): bKash direct integration
- FR-F8 (P1): Auto-release after timeout

Acceptance criteria:

- Financial records are traceable in a ledger-like structure
- Settlement mismatch alerting is in place

### FR-G: Messaging and Notifications

Objective: Ensure low-friction communication and timely event awareness.

Requirements:

- FR-G1 (P0): Real-time 1:1 messaging via Socket.IO
- FR-G2 (P0): Pre-order inquiry chat
- FR-G3 (P0): Order-linked chat
- FR-G4 (P0): Message attachments via R2
- FR-G5 (P0): Notification center with unread count
- FR-G6 (P0): Mark read / mark all read
- FR-G7 (P0): FCM push notifications (mobile)
- FR-G8 (P1): System event messages
- FR-G9 (P1): Read receipts
- FR-G10 (P2): Typing indicator

Acceptance criteria:

- Message delivery acknowledgment is available
- Notification type classification is consistent

### FR-H: Reviews and Trust

Objective: Build a marketplace trust layer.

Requirements:

- FR-H1 (P0): Mutual review after completion
- FR-H2 (P0): 5-star + category breakdown
- FR-H3 (P0): Written feedback
- FR-H4 (P0): Aggregate rating display
- FR-H5 (P1): Review response
- FR-H6 (P2): Top-rated badge logic

Acceptance criteria:

- Reviews can only be submitted for eligible completed orders
- Duplicate reviews per party are blocked

### FR-I: Dashboard and Admin Operations

Objective: Provide operational visibility for students and platform admins.

Requirements:

- FR-I1 (P0): Unified student dashboard
- FR-I2 (P0): Active orders (buyer + seller views)
- FR-I3 (P0): Gigs/jobs/proposals management panels
- FR-I4 (P0): Earnings + transaction overview
- FR-I5 (P0): Admin user moderation tools
- FR-I6 (P0): Admin dispute management queue
- FR-I7 (P1): Platform config controls
- FR-I8 (P1): Revenue analytics views

Acceptance criteria:

- Role-based access is enforced (student vs admin)
- Admin actions are fully auditable

---

## 7. Non-Functional Requirements (NFR)

### 7.1 Performance

- API p95 latency < 200ms for standard read endpoints
- Chat perceived latency near real-time (target < 1s delivery)
- Search response target < 500ms for common queries

### 7.2 Scalability

- 5,000+ concurrent users support
- Horizontal scaling strategy for API and WebSocket layer

### 7.3 Availability and Reliability

- 99.5% service uptime target
- Graceful degradation if payment/chat provider unavailable
- Retry and idempotency support for payment callbacks

### 7.4 Security

- OWASP Top 10 aligned controls
- JWT validation on protected endpoints
- Input validation + output sanitization
- Rate limiting: auth 5 req/min, general 100 req/min/user
- TLS in transit, encryption at rest

### 7.5 Usability and Accessibility

- Mobile-first responsive UI
- Clear bilingual-friendly wording (English-first MVP)
- WCAG 2.1 AA target for web

### 7.6 Maintainability

- Collection-centric service design compliance
- Clear module boundaries (auth/profile/gig/order/payment/chat)
- API contract versioning strategy

### 7.7 Observability

- Structured logs with correlation IDs
- Metrics for auth success, order funnel, payment success/failure
- Error monitoring and alerting thresholds

---

## 8. Data Requirements

Key principle:

- `gh_profiles.id` is the canonical foreign key across platform collections
- `firebase_uid` internal mapping only

Data quality requirements:

- Referential integrity between order, escrow, transactions
- Soft delete policy where business history must be retained
- Audit metadata (`created_by`, `updated_by`, timestamps)

Core entities (summary):

- Profiles, gigs, gig packages, jobs, proposals
- Orders, deliveries, milestones
- Escrow, transactions, withdrawals
- Conversations, messages, notifications
- Reviews, reports, bookmarks, platform config

---

## 9. External Interface and Integration Requirements

### 9.1 Firebase Auth

- Verify ID tokens server-side
- Handle provider extensibility without backend redesign

### 9.2 Directus/PostgreSQL

- Collection-driven content and admin operations
- Permission model alignment with custom backend rules

### 9.3 Cloudflare R2

- Secure upload path and signed URL strategy (where needed)
- File size cap enforcement (max 25MB)

### 9.4 Payments

- SSLCommerz webhook/callback validation
- bKash integration planned as extensible provider

### 9.5 Realtime and Push

- Socket.IO for chat/event stream
- FCM for mobile push delivery

---

## 10. Constraints and Assumptions

Constraints:

- Campus-only trust model (JnU student focus)
- Hybrid architecture dependency on Firebase + Directus + NestJS
- Payment/legal constraints for local gateways

Assumptions:

- Students will use smartphone as primary access channel
- An admin moderation team will be available
- Payment gateway uptime is expected to remain acceptable

---

## 11. Risks and Mitigation

- Risk: Payment callback inconsistency  
  Mitigation: idempotent webhook handlers + reconciliation job

- Risk: Abuse/spam in chat/jobs  
  Mitigation: report flow, moderation queue, rate limits

- Risk: Dispute overload in early growth  
  Mitigation: explicit policy, SLA tiers, admin dashboard tooling

- Risk: Identity misuse  
  Mitigation: verification flags, campus email checks (future enhancement)

---

## 12. Requirement Traceability by Phase

Phase 1 (Foundation): FR-A, FR-B core, security baseline  
Phase 2 (Marketplace): FR-C, FR-D  
Phase 3 (Transactions): FR-E, FR-F  
Phase 4 (Communication): FR-G  
Phase 5 (Trust/Quality): FR-H, FR-I extensions, search polish

---

## 13. Testability and Acceptance Strategy

Test layers:

- Unit tests: business rules and validation
- Integration tests: DB + external services mock flow
- API contract tests: endpoint request/response compatibility
- E2E tests: onboarding, order lifecycle, payment-to-settlement, review flow

Release gate (MVP):

- All P0 requirements must pass acceptance tests
- Security checks pass (authz, validation, rate-limit)
- Payment and order state transitions audited and reproducible

---

## 14. Recommended Next Artifacts

- SRS appendix with detailed use cases per FR
- Domain glossary and state diagrams (order, escrow, dispute)
- RTM (Requirements Traceability Matrix) linking FR -> API -> DB -> Test cases
- UAT checklist for student and admin personas

---

## 15. Approval Note

This Requirements Analysis Document is aligned with PRD v1.0. Before implementation starts, section-wise review and approval should be completed by the Product Owner, Tech Lead, and QA Lead.
