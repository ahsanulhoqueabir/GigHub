# GigHub Backend — API Endpoints Documentation

> **Base URL:** `https://api.gighub.app/v1` (production) / `http://localhost:3000/v1` (development)
> **Auth:** All endpoints (except public & auth) require `Authorization: Bearer <nestjs_jwt>`
> **Content-Type:** `application/json` (except file uploads: `multipart/form-data`)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Profiles](#2-profiles)
3. [Categories](#3-categories)
4. [Gigs](#4-gigs)
5. [Jobs](#5-jobs)
6. [Proposals](#6-proposals)
7. [Orders](#7-orders)
8. [Deliveries](#8-deliveries)
9. [Payments & Escrow](#9-payments--escrow)
10. [Withdrawals](#10-withdrawals)
11. [Chat & Messaging](#11-chat--messaging)
12. [Reviews](#12-reviews)
13. [Notifications](#13-notifications)
14. [Tuition Listings](#14-tuition-listings)
15. [Bookmarks](#15-bookmarks)
16. [Reports](#16-reports)
17. [Upload (R2)](#17-upload-r2)
18. [Admin](#18-admin)
19. [WebSocket Events](#19-websocket-events)
20. [Common Patterns](#20-common-patterns)

---

## Common Response Format

```json
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful (optional)",
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 } // For paginated lists
}

// Error Response
{
  "success": false,
  "error": "Error title or code",
  "details": "Detailed error message or object",
  "status": 400
}
```

## Common Query Parameters (for list endpoints)

| Param    | Type    | Default       | Description                            |
| -------- | ------- | ------------- | -------------------------------------- |
| `page`   | integer | 1             | Page number                            |
| `limit`  | integer | 20            | Items per page (max 50)                |
| `sort`   | string  | `-created_at` | Sort field (prefix `-` for descending) |
| `search` | string  | —             | Full-text search query                 |

---

## 1. Authentication

| Method | Endpoint                | Auth      | Description                                                               |
| ------ | ----------------------- | --------- | ------------------------------------------------------------------------- |
| `POST` | `/auth/register`        | Public    | Register with email/password via Firebase Auth                            |
| `POST` | `/auth/login`           | Public    | Single login endpoint for password and social providers via Firebase Auth |
| `POST` | `/auth/refresh`         | Public    | Refresh NestJS JWT using refresh token                                    |
| `POST` | `/auth/logout`          | Protected | Invalidate current session                                                |
| `POST` | `/auth/forgot-password` | Public    | Trigger password reset email via Firebase Auth                            |
| `POST` | `/auth/reset-password`  | Public    | Complete password reset                                                   |

> **Auth Contract:** NestJS accepts only Firebase credentials/tokens through a single sign-in endpoint (`/auth/login`).

**Canonical Login Payload Contract (`POST /auth/login`)**

```json
// Password provider
{
  "provider": "password",
  "email": "user@jnu.ac.bd",
  "password": "securePassword123"
}

// Social provider (Google now, others later)
{
  "provider": "google",
  "firebase_id_token": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Provider Allowlist & Validation Matrix**

| `provider` value | Required fields     | Forbidden/ignored fields |
| ---------------- | ------------------- | ------------------------ |
| `password`       | `email`, `password` | `firebase_id_token`      |
| `google`         | `firebase_id_token` | `email`, `password`      |
| `github`         | `firebase_id_token` | `email`, `password`      |
| `microsoft`      | `firebase_id_token` | `email`, `password`      |
| `apple`          | `firebase_id_token` | `email`, `password`      |

If `provider` is not in the allowlist, return `400 INVALID_PROVIDER`.

### POST `/auth/register`

```json
// Request
{
  "email": "user@jnu.ac.bd",
  "password": "securePassword123",
  "display_name": "Rafiq Ahmed",
  "username": "rafiq"
}

// Response 201
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 86400,
    "profile": {
      "id": "uuid",
      "display_name": "Rafiq Ahmed",
      "username": "rafiq",
      "role": "student",
      "is_verified": false
    }
  }
}
```

### POST `/auth/login`

```json
// Request (email/password)
{
  "provider": "password",
  "email": "user@jnu.ac.bd",
  "password": "securePassword123"
}

// Response 200
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 86400,
    "profile": { ... }
  }
}
```

```json
// Request (Google)
{
  "provider": "google",
  "firebase_id_token": "eyJhbGciOiJSUzI1NiIs..."
}

// Response 200 (same as above)
```

```json
// Request (future third-party SSO example)
{
  "provider": "github",
  "firebase_id_token": "eyJhbGciOiJSUzI1NiIs..."
}

// Response 200 (same as above)
```

### POST `/auth/refresh`

```json
// Request
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}

// Response 200
{
  "success": true,
  "data": {
    "access_token": "new_jwt...",
    "refresh_token": "new_refresh...",
    "expires_in": 86400
  }
}
```

---

## 2. Profiles

| Method  | Endpoint              | Auth      | Description                        |
| ------- | --------------------- | --------- | ---------------------------------- |
| `GET`   | `/profiles/me`        | Protected | Get current user's profile         |
| `PATCH` | `/profiles/me`        | Protected | Consolidated: Update profile/prefs |
| `GET`   | `/profiles/:username` | Public    | Consolidated: Get profile + extras |

> **Note:** `/profiles/me` PATCH now expects a `type` payload to handle specific updates (basic info, fcm-token, notification-prefs, etc.). Same logic for GET with `?type=...` query param.

### GET `/profiles/me`

```json
// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "display_name": "Rafiq Ahmed",
    "username": "rafiq",
    "email": "user@jnu.ac.bd",
    "avatar": "https://r2.gighub.app/avatars/uuid.jpg",
    "bio": "Full-stack developer & UI designer",
    "skills": ["React", "Node.js", "Figma"],
    "availability_status": "available",
    "is_verified": true,
    "role": "student",
    "total_earnings": 15000.0,
    "avg_rating": 4.8,
    "total_reviews": 12,
    "created_at": "2026-01-15T10:00:00Z"
  }
}
```

### PATCH `/profiles/me`

**Payload Contract:**

```json
// Type: basic_info (Update bio, display_name, etc.)
{
  "type": "basic_info",
  "data": {
    "display_name": "Rafiq Ahmed Updated",
    "bio": "Updated bio text",
    "skills": ["React", "Node.js", "Figma", "Flutter"],
    "availability_status": "busy"
  }
}

// Type: avatar (Upload avatar via Base64)
{
  "type": "avatar",
  "data": {
    "file": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
  }
}

// Type: fcm_token (Update push token)
{
  "type": "fcm_token",
  "data": {
    "token": "fcm-device-token-string"
  }
}

// Type: notification_prefs (Update settings)
{
  "type": "notification_prefs",
  "data": {
    "email_notifications": true,
    "push_notifications": false,
    "order_updates": true
  }
}
```

### GET `/profiles/:username`

**Query Parameters:**
| Param | Type | Description |
| ------ | ------ | ------------------------------------------------------------------------- |
| `type` | string | `profile` (default), `gigs` (owner's gigs), `reviews` (received reviews), `full` |

```json
// Response 200 (type=gigs)
{
  "success": true,
  "data": [ { "id": "uuid", "title": "Gig title", ... } ]
}
```

---

## 3. Categories

| Method   | Endpoint          | Auth   | Description                |
| -------- | ----------------- | ------ | -------------------------- |
| `GET`    | `/categories`     | Public | List all active categories |
| `POST`   | `/categories`     | Admin  | Create category            |
| `PATCH`  | `/categories/:id` | Admin  | Update category            |
| `DELETE` | `/categories/:id` | Admin  | Soft-delete category       |

### GET `/categories`

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Design",
      "slug": "design",
      "icon": "🎨",
      "sort_order": 1
    },
    {
      "id": "uuid",
      "name": "Development",
      "slug": "development",
      "icon": "💻",
      "sort_order": 2
    }
  ]
}
```

---

## 4. Gigs

| Method   | Endpoint      | Auth              | Description                     |
| -------- | ------------- | ----------------- | ------------------------------- |
| `GET`    | `/gigs`       | Public            | List/search gigs with filters   |
| `GET`    | `/gigs/:slug` | Public            | Get gig detail by slug          |
| `POST`   | `/gigs`       | Protected         | Create new gig                  |
| `PATCH`  | `/gigs/:id`   | Protected (owner) | Consolidated: Update gig/status |
| `DELETE` | `/gigs/:id`   | Protected (owner) | Soft-delete gig                 |
| `GET`    | `/gigs/me`    | Protected         | List current user's gigs        |

### PATCH `/gigs/:id`

**Payload Contract:**

```json
// Type: edit (Standard update)
{
  "type": "edit",
  "data": { "title": "Updated Title", "description": "..." }
}

// Type: status (Change visibility)
{
  "type": "status",
  "data": { "status": "paused" } // "active", "paused"
}
```

### GET `/gigs` — Query Parameters

| Param          | Type    | Description                |
| -------------- | ------- | -------------------------- |
| `category`     | string  | Filter by category slug    |
| `min_price`    | number  | Minimum price (BDT)        |
| `max_price`    | number  | Maximum price (BDT)        |
| `max_delivery` | integer | Maximum delivery days      |
| `min_rating`   | number  | Minimum average rating     |
| `tags`         | string  | Comma-separated tag filter |
| `seller`       | uuid    | Filter by seller           |

### POST `/gigs`

```json
// Request
{
  "title": "I will design a modern logo for your brand",
  "description": "Full description of the gig...",
  "category": "uuid",
  "tags": ["logo", "branding", "minimalist"],
  "packages": [
    {
      "tier": "basic",
      "title": "Basic Logo",
      "description": "1 logo concept, PNG format",
      "price": 500,
      "delivery_days": 3,
      "revision_count": 1,
      "features": ["1 concept", "PNG file", "1 revision"]
    },
    {
      "tier": "standard",
      "title": "Standard Logo",
      "description": "3 logo concepts, PNG + SVG",
      "price": 1000,
      "delivery_days": 5,
      "revision_count": 3,
      "features": ["3 concepts", "PNG + SVG", "3 revisions", "Source file"]
    },
    {
      "tier": "premium",
      "title": "Premium Logo",
      "description": "5 concepts + brand guide",
      "price": 2000,
      "delivery_days": 7,
      "revision_count": -1,
      "features": ["5 concepts", "All formats", "Unlimited revisions", "Brand guideline"]
    }
  ],
  "images": [ { "url": "...", "sort_order": 0 } ]
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "i-will-design-a-modern-logo-for-your-brand-abc123",
    "title": "I will design a modern logo for your brand",
    "status": "active",
    ...
  }
}
```

### GET `/gigs/:slug`

```json
// Response 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "...",
    "slug": "...",
    "description": "...",
    "category": { "id": "uuid", "name": "Design", "slug": "design" },
    "seller": {
      "id": "uuid",
      "display_name": "Rafiq Ahmed",
      "username": "rafiq",
      "avatar": "...",
      "avg_rating": 4.80,
      "total_reviews": 12
    },
    "packages": [ ... ],
    "images": [ { "url": "...", "sort_order": 0 } ],
    "tags": ["logo", "branding"],
    "avg_rating": 4.90,
    "total_reviews": 8,
    "total_orders": 15,
    "status": "active",
    "created_at": "..."
  }
}
```

---

## 5. Jobs

| Method   | Endpoint      | Auth              | Description                   |
| -------- | ------------- | ----------------- | ----------------------------- |
| `GET`    | `/jobs`       | Public            | List/search jobs with filters |
| `GET`    | `/jobs/:slug` | Public            | Get job detail by slug        |
| `POST`   | `/jobs`       | Protected         | Create new job post           |
| `PATCH`  | `/jobs/:id`   | Protected (owner) | Update job                    |
| `DELETE` | `/jobs/:id`   | Protected (owner) | Soft-delete (close) job       |
| `GET`    | `/jobs/me`    | Protected         | List current user's job posts |

### GET `/jobs` — Query Parameters

| Param        | Type   | Description                                        |
| ------------ | ------ | -------------------------------------------------- |
| `category`   | string | Filter by category slug                            |
| `job_type`   | string | Filter: paid, free, internship, volunteer, tuition |
| `budget_min` | number | Minimum budget                                     |
| `budget_max` | number | Maximum budget                                     |
| `skills`     | string | Comma-separated required skills                    |
| `status`     | string | Filter by status                                   |

### POST `/jobs`

```json
// Request
{
  "title": "Build a Flutter mobile app for event management",
  "description": "Detailed job description...",
  "category": "uuid",
  "job_type": "paid",
  "budget_type": "fixed",
  "budget_min": 5000,
  "budget_max": 10000,
  "deadline": "2026-04-15T00:00:00Z",
  "required_skills": ["Flutter", "Dart", "Firebase"],
  "attachments": []
}
```

> Tuition Contract: create tuition listings using `job_type = tuition`. A tuition listing requires only `title` and `description`; budget/deadline are optional, and no payment/escrow flow is triggered.

---

## 6. Proposals

| Method  | Endpoint                 | Auth                  | Description                      |
| ------- | ------------------------ | --------------------- | -------------------------------- |
| `POST`  | `/jobs/:jobId/proposals` | Protected             | Submit proposal for a job        |
| `GET`   | `/jobs/:jobId/proposals` | Protected (job owner) | List proposals for a job         |
| `GET`   | `/proposals/me`          | Protected             | List my submitted proposals      |
| `GET`   | `/proposals/:id`         | Protected             | Get proposal detail              |
| `PATCH` | `/proposals/:id`         | Protected (multiple)  | Consolidated: Action on proposal |

### PATCH `/proposals/:id`

**Payload Contract:**

```json
// Type: withdraw (Applicant)
{ "type": "withdraw" }

// Type: accept (Job Owner)
{ "type": "accept" }

// Type: reject (Job Owner)
{ "type": "reject" }
```

### POST `/jobs/:jobId/proposals`

```json
// Request
{
  "cover_letter": "I am experienced in Flutter development...",
  "quoted_price": 7500,
  "estimated_days": 14,
  "attachments": []
}
```

> Tuition Request Contract: for tuition listings, this endpoint acts as a session/contact request. Use `quoted_price = 0` or `null`.

---

## 7. Orders

| Method  | Endpoint      | Auth                     | Description                         |
| ------- | ------------- | ------------------------ | ----------------------------------- |
| `POST`  | `/orders/gig` | Protected                | Create order from gig package       |
| `POST`  | `/orders/job` | Protected                | Create order from accepted proposal |
| `GET`   | `/orders`     | Protected                | List my orders (as buyer & seller)  |
| `GET`   | `/orders/:id` | Protected (buyer/seller) | Get order detail                    |
| `PATCH` | `/orders/:id` | Protected (multiple)     | Consolidated: Action on order       |

### PATCH `/orders/:id`

**Payload Contract:**

```json
// Type: start (Seller)
{ "type": "start" }

// Type: deliver (Seller)
{
  "type": "deliver",
  "data": {
    "message": "...",
    "files": ["..."]
  }
}

// Type: approve (Buyer)
{ "type": "approve" }

// Type: revision (Buyer)
{
  "type": "revision",
  "data": { "notes": "..." }
}

// Type: cancel (Both)
{
  "type": "cancel",
  "data": { "reason": "..." }
}

// Type: dispute (Both)
{
  "type": "dispute",
  "data": { "reason": "..." }
}
```

### POST `/orders/gig`

```json
// Request
{
  "gig": "uuid",
  "package": "uuid",
  "requirements": "Please use blue and green colors..."
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_number": "GH-20260311-001",
    "status": "pending",
    "amount": 1000,
    "payment_url": "https://sslcommerz.com/pay/...",
    ...
  }
}
```

### POST `/orders/job`

```json
// Request
{
  "job": "uuid",
  "proposal": "uuid",
  "milestones": [
    { "title": "UI Design", "amount": 3000, "due_date": "2026-03-25" },
    { "title": "Development", "amount": 4500, "due_date": "2026-04-10" }
  ]
}
```

### GET `/orders` — Query Parameters

| Param         | Type   | Description                                  |
| ------------- | ------ | -------------------------------------------- |
| `role`        | string | Filter: `buyer`, `seller`, or both (default) |
| `status`      | string | Filter by order status                       |
| `source_type` | string | Filter: `gig`, `job`                         |

### PATCH `/orders/:id/deliver`

```json
// Request
{
  "message": "Here is the completed work...",
  "files": ["https://r2.gighub.app/deliveries/uuid/file1.zip"]
}
```

### PATCH `/orders/:id/revision`

```json
// Request
{
  "notes": "Please change the color to darker blue and increase font size"
}
```

---

## 8. Deliveries

| Method | Endpoint                      | Auth                     | Description                      |
| ------ | ----------------------------- | ------------------------ | -------------------------------- |
| `GET`  | `/orders/:orderId/deliveries` | Protected (buyer/seller) | List all deliveries for an order |
| `GET`  | `/deliveries/:id`             | Protected                | Get delivery detail              |

---

## 9. Payments & Escrow

> Applies to paid transactions only. Tuition listings and tuition requests never enter payment or escrow flows.

| Method | Endpoint                       | Auth             | Description                     |
| ------ | ------------------------------ | ---------------- | ------------------------------- |
| `POST` | `/payments/initiate`           | Protected        | Initiate payment via SSLCommerz |
| `POST` | `/payments/sslcommerz/success` | Public (webhook) | SSLCommerz success callback     |
| `POST` | `/payments/sslcommerz/fail`    | Public (webhook) | SSLCommerz failure callback     |
| `POST` | `/payments/sslcommerz/cancel`  | Public (webhook) | SSLCommerz cancel callback      |
| `POST` | `/payments/sslcommerz/ipn`     | Public (webhook) | SSLCommerz IPN notification     |
| `GET`  | `/payments/transactions`       | Protected        | List user's transaction history |
| `GET`  | `/payments/balance`            | Protected        | Get current wallet balance      |
| `GET`  | `/payments/escrow/:orderId`    | Protected        | Get escrow status for an order  |

### POST `/payments/initiate`

```json
// Request
{
  "order": "uuid",
  "payment_method": "sslcommerz"
}

// Response 200
{
  "success": true,
  "data": {
    "payment_url": "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?...",
    "session_key": "..."
  }
}
```

> MVP fee policy: platform fee is fixed at 5% per paid transaction, capped at BDT 500.

### GET `/payments/transactions` — Query Parameters

| Param       | Type   | Description                                                |
| ----------- | ------ | ---------------------------------------------------------- |
| `type`      | string | Filter: payment, earning, platform_fee, withdrawal, refund |
| `direction` | string | Filter: credit, debit                                      |
| `from_date` | date   | Start date                                                 |
| `to_date`   | date   | End date                                                   |

---

## 10. Withdrawals

| Method | Endpoint           | Auth      | Description                 |
| ------ | ------------------ | --------- | --------------------------- |
| `POST` | `/withdrawals`     | Protected | Request a withdrawal        |
| `GET`  | `/withdrawals`     | Protected | List my withdrawal requests |
| `GET`  | `/withdrawals/:id` | Protected | Get withdrawal detail       |

### POST `/withdrawals`

```json
// Request
{
  "amount": 5000,
  "method": "bkash",
  "account_details": {
    "number": "01XXXXXXXXX",
    "name": "Rafiq Ahmed"
  }
}
```

---

## 11. Chat & Messaging

| Method  | Endpoint                      | Auth                    | Description                                  |
| ------- | ----------------------------- | ----------------------- | -------------------------------------------- |
| `GET`   | `/conversations`              | Protected               | List my conversations                        |
| `POST`  | `/conversations`              | Protected               | Start a new conversation (pre-order inquiry) |
| `GET`   | `/conversations/:id`          | Protected (participant) | Get conversation with messages               |
| `GET`   | `/conversations/:id/messages` | Protected (participant) | Paginated messages                           |
| `POST`  | `/conversations/:id/messages` | Protected (participant) | Send a message (REST fallback)               |
| `PATCH` | `/conversations/:id`          | Protected (participant) | Consolidated: Update convo                   |

### PATCH `/conversations/:id`

**Payload Contract:**

```json
// Type: mark_read
{ "type": "mark_read" }
```

### POST `/conversations`

```json
// Request — Pre-order inquiry
{
  "participant": "uuid",
  "gig": "uuid",
  "initial_message": "Hi, can you do X for me?"
}

// Request — Order-linked
{
  "participant": "uuid",
  "order": "uuid"
}
```

### GET `/conversations`

```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "participant": {
        "id": "uuid",
        "display_name": "Karim",
        "username": "karim",
        "avatar": "..."
      },
      "order_id": "uuid",
      "gig_id": null,
      "last_message_text": "Thanks, I'll start working on it!",
      "last_message_at": "2026-03-11T10:30:00Z",
      "unread_count": 2
    }
  ]
}
```

### GET `/conversations/:id/messages` — Query Parameters

| Param    | Type      | Description                            |
| -------- | --------- | -------------------------------------- |
| `before` | timestamp | Cursor: messages before this timestamp |
| `limit`  | integer   | Messages per page (default 50)         |

---

## 12. Reviews

| Method | Endpoint                   | Auth                 | Description                                    |
| ------ | -------------------------- | -------------------- | ---------------------------------------------- |
| `POST` | `/orders/:orderId/reviews` | Protected            | Submit review for completed order              |
| `POST` | `/tuition/:jobId/reviews`  | Protected            | Submit review for completed tuition engagement |
| `GET`  | `/reviews/gig/:gigId`      | Public               | List reviews for a gig                         |
| `GET`  | `/reviews/user/:username`  | Public               | List reviews for a user                        |
| `POST` | `/reviews/:id/response`    | Protected (reviewee) | Respond to a review                            |

### POST `/orders/:orderId/reviews`

```json
// Request
{
  "rating_overall": 4.5,
  "rating_quality": 5.0,
  "rating_communication": 4.0,
  "rating_delivery": 4.5,
  "comment": "Great work! Delivered on time with excellent quality."
}
```

---

## 13. Notifications

| Method  | Endpoint                      | Auth      | Description                   |
| ------- | ----------------------------- | --------- | ----------------------------- |
| `GET`   | `/notifications`              | Protected | List my notifications         |
| `GET`   | `/notifications/unread-count` | Protected | Get unread notification count |
| `PATCH` | `/notifications`              | Protected | Consolidated: Read actions    |

### PATCH `/notifications`

**Payload Contract:**

```json
// Type: read_single
{ "type": "read_single", "id": "uuid" }

// Type: read_all
{ "type": "read_all" }
```

### GET `/notifications` — Query Parameters

| Param     | Type    | Description                 |
| --------- | ------- | --------------------------- |
| `type`    | string  | Filter by notification type |
| `is_read` | boolean | Filter: read/unread         |

---

## 14. Tuition Listings

| Method  | Endpoint                   | Auth              | Description                             |
| ------- | -------------------------- | ----------------- | --------------------------------------- |
| `GET`   | `/tuition`                 | Public            | Browse/search tuition listings only     |
| `GET`   | `/tuition/:slug`           | Public            | Get tuition listing detail              |
| `POST`  | `/tuition/:jobId/requests` | Protected         | Send tuition contact/session request    |
| `GET`   | `/tuition/:jobId/requests` | Protected (owner) | List tuition requests for listing owner |
| `PATCH` | `/tuition/requests/:id`    | Protected (owner) | Accept/reject tuition request           |

> These endpoints are aliases over the shared `jobs` + `proposals` model and are intentionally separated for product-level clarity.

---

## 15. Bookmarks

| Method | Endpoint     | Auth      | Description                        |
| ------ | ------------ | --------- | ---------------------------------- |
| `GET`  | `/bookmarks` | Protected | Consolidated: List/Check bookmarks |
| `POST` | `/bookmarks` | Protected | Add/Remove bookmark                |

### GET `/bookmarks`

**Query Parameters:**
| Param | Type | Description |
| ------ | ------ | --------------------------------------------------------------- |
| `type` | string | `list` (default), `check` (requires `entity_id` & `entity_type`) |

### POST `/bookmarks`

**Payload Contract:**

```json
// Type: add
{
  "type": "add",
  "entity_type": "gig",
  "entity_id": "uuid"
}

// Type: remove
{
  "type": "remove",
  "id": "uuid"
}
```

### POST `/bookmarks`

```json
// Request
{
  "entity_type": "gig",
  "entity_id": "uuid"
}
```

### GET `/bookmarks/check` — Query Parameters

| Param         | Type   | Description    |
| ------------- | ------ | -------------- |
| `entity_type` | string | `gig` or `job` |
| `entity_id`   | uuid   | Entity ID      |

---

## 16. Reports

| Method | Endpoint      | Auth      | Description               |
| ------ | ------------- | --------- | ------------------------- |
| `POST` | `/reports`    | Protected | Submit a report           |
| `GET`  | `/reports/me` | Protected | List my submitted reports |

### POST `/reports`

```json
// Request
{
  "entity_type": "gig",
  "entity_id": "uuid",
  "reason": "spam",
  "description": "This gig appears to be spam..."
}
```

---

## 17. Upload (R2)

| Method   | Endpoint        | Auth      | Description         |
| -------- | --------------- | --------- | ------------------- |
| `POST`   | `/upload/image` | Protected | Upload image to R2  |
| `POST`   | `/upload/file`  | Protected | Upload file to R2   |
| `DELETE` | `/upload`       | Protected | Delete file from R2 |

### POST `/upload/image`

```
Content-Type: multipart/form-data

file: <binary>
folder: "avatars" | "gigs" | "chat" | "deliveries"
```

```json
// Response 201
{
  "success": true,
  "data": {
    "url": "https://r2.gighub.app/avatars/uuid.jpg",
    "key": "avatars/uuid.jpg",
    "size": 245000,
    "mime_type": "image/jpeg"
  }
}
```

---

## 18. Admin

> All admin endpoints require `role: admin` in JWT payload.

| Method  | Endpoint                           | Auth  | Description                            |
| ------- | ---------------------------------- | ----- | -------------------------------------- |
| `GET`   | `/admin/users`                     | Admin | List all users with filters            |
| `PATCH` | `/admin/users/:id/verify`          | Admin | Verify/unverify a student              |
| `PATCH` | `/admin/users/:id/suspend`         | Admin | Suspend a student                      |
| `PATCH` | `/admin/users/:id/ban`             | Admin | Ban a student                          |
| `GET`   | `/admin/disputes`                  | Admin | List all disputed orders               |
| `PATCH` | `/admin/disputes/:orderId/resolve` | Admin | Resolve dispute (refund/release/split) |
| `GET`   | `/admin/reports`                   | Admin | List all content reports               |
| `PATCH` | `/admin/reports/:id/resolve`       | Admin | Resolve a report                       |
| `GET`   | `/admin/withdrawals`               | Admin | List all withdrawal requests           |
| `PATCH` | `/admin/withdrawals/:id/process`   | Admin | Process withdrawal (approve/reject)    |
| `GET`   | `/admin/stats`                     | Admin | Platform statistics                    |
| `GET`   | `/admin/revenue`                   | Admin | Revenue analytics                      |
| `GET`   | `/admin/config`                    | Admin | Get platform config                    |
| `PATCH` | `/admin/config/:key`               | Admin | Update platform config                 |

### PATCH `/admin/disputes/:orderId/resolve`

```json
// Request
{
  "resolution": "refund", // "refund" | "release" | "split"
  "split_percent_buyer": 50, // only for "split"
  "admin_note": "Seller did not deliver quality work"
}
```

### GET `/admin/stats`

```json
// Response 200
{
  "success": true,
  "data": {
    "total_users": 450,
    "verified_users": 320,
    "total_gigs": 280,
    "total_jobs": 150,
    "active_orders": 45,
    "completed_orders": 890,
    "disputed_orders": 12,
    "total_revenue": 125000,
    "monthly_revenue": 18000,
    "pending_withdrawals": 8
  }
}
```

---

## 19. WebSocket Events

> **Namespace:** `/` (default)
> **Auth:** Socket handshake includes `auth.token` (NestJS JWT)

### Client → Server Events

| Event                | Payload                                                 | Description            |
| -------------------- | ------------------------------------------------------- | ---------------------- |
| `join_conversation`  | `{ conversation_id: string }`                           | Join a chat room       |
| `leave_conversation` | `{ conversation_id: string }`                           | Leave a chat room      |
| `send_message`       | `{ conversation_id, content, message_type, file_url? }` | Send chat message      |
| `typing_start`       | `{ conversation_id: string }`                           | Start typing indicator |
| `typing_stop`        | `{ conversation_id: string }`                           | Stop typing indicator  |
| `mark_read`          | `{ conversation_id: string, message_id: string }`       | Mark messages as read  |

### Server → Client Events

| Event           | Payload                                   | Description               |
| --------------- | ----------------------------------------- | ------------------------- |
| `new_message`   | `{ message object }`                      | New chat message received |
| `message_read`  | `{ conversation_id, reader_id, read_at }` | Read receipt              |
| `user_typing`   | `{ conversation_id, user_id, is_typing }` | Typing indicator          |
| `notification`  | `{ notification object }`                 | Real-time notification    |
| `order_update`  | `{ order_id, status, ... }`               | Order status change       |
| `online_status` | `{ user_id, status }`                     | User online/offline       |

---

## 20. Common Patterns

### Error Codes

| Code               | HTTP Status | Description                               |
| ------------------ | ----------- | ----------------------------------------- |
| `UNAUTHORIZED`     | 401         | Missing or invalid JWT                    |
| `FORBIDDEN`        | 403         | Insufficient permissions                  |
| `NOT_FOUND`        | 404         | Resource not found                        |
| `VALIDATION_ERROR` | 400         | Request validation failed                 |
| `CONFLICT`         | 409         | Duplicate resource (e.g., username taken) |
| `RATE_LIMITED`     | 429         | Too many requests                         |
| `INTERNAL_ERROR`   | 500         | Server error                              |

### Rate Limits

| Endpoint Group     | Limit                 |
| ------------------ | --------------------- |
| Auth endpoints     | 5 requests / minute   |
| Upload endpoints   | 10 requests / minute  |
| General API        | 100 requests / minute |
| WebSocket messages | 30 messages / minute  |

### Pagination Response

```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### File Upload Constraints

| Type          | Max Size | Allowed Formats     |
| ------------- | -------- | ------------------- |
| Avatar        | 5 MB     | JPG, PNG, WebP      |
| Gig Image     | 10 MB    | JPG, PNG, WebP      |
| Chat Image    | 10 MB    | JPG, PNG, WebP, GIF |
| Chat File     | 25 MB    | Any                 |
| Delivery File | 25 MB    | Any                 |
| Chat Voice    | 10 MB    | MP3, M4A, OGG, WebM |
