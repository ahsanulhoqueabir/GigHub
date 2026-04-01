# GigHub : Campus-Centric Freelance & Task Marketplace

[![Project Status: Under Development](https://img.shields.io/badge/Status-Under--Development-orange.svg)](https://github.com/ahsanulhoqueabir/GigHub-Planning)
[![Target Platform: JnU](https://img.shields.io/badge/Platform-Jagannath%20University-blue.svg)](https://jnu.ac.bd)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**GigHub** is a closed, campus-exclusive freelance and task marketplace designed specifically for the students of **Jagannath University (JnU), Dhaka**. It empowers students to monetize their skills, find help for their projects, and build professional portfolios — all within a trusted campus ecosystem with escrow-protected transactions.

---

## 🚀 The Vision

In a world of global competition, GigHub brings the freelance economy home. Every student is a participant in a dual-sided marketplace:

- **No separate roles:** A student is both a service provider (Seller) and a client (Buyer) simultaneously.
- **Campus trust:** Verified identities and local payment methods (bKash, Nagad) ensure safe and reliable transactions.
- **Portfolio building:** Every task completed contributes to a verifiable professional profile within the campus community.

---

## ✨ Key Features

### 🏪 Gig Marketplace (Fiverr-style)

Browse and offer specialized services through a tiered package system.

- 3-tier pricing: **Basic, Standard, and Premium**.
- High-quality galleries with image uploads powered by Cloudflare R2.
- Full-text search and advanced filtering by category, price, and delivery time.

### 📝 Job Board (Upwork-style)

Post specific tasks or projects and receive custom proposals from skilled peers.

- Support for **Paid, Free, Internship, and Volunteer** task types.
- Milestone-based project tracking for complex deliverables.
- Real-time proposal management and selection.

### 🔐 Secure Escrow & Payments

Trust is built-in with an automated escrow system.

- **Escrow protection:** Funds are held securely until the buyer approves the delivery.
- **Local Integrations:** Integrated with **SSLCommerz** and **bKash** for seamless local payments.
- **Automated Withdrawals:** Withdraw earnings directly to your mobile banking account.

### 💬 Real-time Communication

- Integrated 1:1 chat for pre-order inquiries and order-specific collaboration.
- File and image sharing within chat.
- Live notifications for messages, order updates, and payments.

---

## 🛠️ Tech Stack

GigHub is built using a modern, scalable architecture designed for high performance and reliability.

| Layer              | Technology                                                                         |
| :----------------- | :--------------------------------------------------------------------------------- |
| **Backend API**    | [NestJS](https://nestjs.com/) (TypeScript, REST + WebSockets)                      |
| **Web Frontend**   | [Next.js 14](https://nextjs.org/) (App Router, Server Components)                  |
| **Mobile App**     | [Flutter](https://flutter.dev/) (Android & iOS)                                    |
| **Database / CMS** | [Directus](https://directus.io/) + [PostgreSQL](https://www.postgresql.org/)       |
| **Authentication** | [Firebase Auth](https://firebase.google.com/products/auth) + NestJS JWT (Custom)   |
| **File Storage**   | [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) (S3-compatible) |
| **Real-time**      | [Socket.IO](https://socket.io/)                                                    |
| **Payments**       | SSLCommerz, bKash                                                                  |

---

## 📂 Project Architecture

The project is organized into several key modules, with all planning documents centralized in the `/Planning` directory:

```text
├── Planning/
│   ├── PRD.md                     # Product Requirements Document
│   ├── project-brief.md           # High-level feature overview
│   └── backend/
│       ├── api-endpoints.md       # Comprehensive API contract
│       ├── db-schema.md           # Detailed PostgreSQL schema (gh_ prefix)
│       └── phase-X-planning.md    # Multi-phase implementation roadmap
├── backend/                       # NestJS API (Workspace)
├── nextjs/                        # Next.js Web Application
└── flutter/                       # Flutter Mobile Application
```

### 🔑 Identity & Auth Flow

We use a hybrid authentication model:

1. Student authenticates via **Firebase Auth** (Email/Google).
2. Backend verifies the Firebase token and resolves the user to a unique `gh_profiles.id`.
3. Backend issues a **Custom NestJS JWT** used for all platform-wide authorization.

---

## 🗺️ Implementation Roadmap

### Phase 1: Foundation 🏗️

- [ ] Firebase Auth integration.
- [ ] Profile CRUD and Cloudflare R2 storage setup.
- [ ] Custom JWT issuance and Security Guards.

### Phase 2: Marketplace & Jobs 🛒

- [ ] Gig creation with tiered packages.
- [ ] Job board and proposal submission system.
- [ ] Multi-category search and discovery.

### Phase 3: Transactions & Escrow 💸

- [ ] Order lifecycle (Pending -> Active -> Delivered -> Completed).
- [ ] SSLCommerz & bKash payment gateway integration.
- [ ] Automated escrow holding and release logic.

### Phase 4: Communication 📢

- [ ] Real-time 1:1 Chat via Socket.IO.
- [ ] Push notifications (FCM) and in-app alerts.

### Phase 5: Quality & Admin 💎

- [ ] Mutual review and rating system.
- [ ] Admin dispute resolution and reporting tools.
- [ ] Platform configuration and analytics dashboard.

---

## 🤝 Contributing

This is an internal project for the Jagannath University community. If you are a JnU student and wish to contribute, please refer to our internal onboarding guide or contact the core team.

---

## 📄 License

This documentation and the project codebase are licensed under the [MIT License](LICENSE).

---

Developed with ❤️ for **Jagannath University** students.
