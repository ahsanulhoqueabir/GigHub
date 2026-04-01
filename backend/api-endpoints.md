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
14. [Bookmarks](#14-bookmarks)
15. [Reports](#15-reports)
16. [Upload (R2)](#16-upload-r2)
17. [Admin](#17-admin)
18. [WebSocket Events](#18-websocket-events)
19. [Common Patterns](#19-common-patterns)

---

## Common Response Format

```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": [ ... ]
  }
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

| Method  | Endpoint                          | Auth      | Description                     |
| ------- | --------------------------------- | --------- | ------------------------------- |
| `GET`   | `/profiles/me`                    | Protected | Get current user's profile      |
| `PATCH` | `/profiles/me`                    | Protected | Update current user's profile   |
| `GET`   | `/profiles/:username`             | Public    | Get public profile by username  |
| `GET`   | `/profiles/:username/gigs`        | Public    | List gigs by user               |
| `GET`   | `/profiles/:username/reviews`     | Public    | List reviews received by user   |
| `PATCH` | `/profiles/me/avatar`             | Protected | Upload/update avatar            |
| `PATCH` | `/profiles/me/fcm-token`          | Protected | Update FCM token                |
| `PATCH` | `/profiles/me/notification-prefs` | Protected | Update notification preferences |

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

```json
// Request
{
  "display_name": "Rafiq Ahmed Updated",
  "bio": "Updated bio text",
  "skills": ["React", "Node.js", "Figma", "Flutter"],
  "availability_status": "busy"
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

| Method   | Endpoint           | Auth              | Description                       |
| -------- | ------------------ | ----------------- | --------------------------------- |
| `GET`    | `/gigs`            | Public            | List/search gigs with filters     |
| `GET`    | `/gigs/:slug`      | Public            | Get gig detail by slug            |
| `POST`   | `/gigs`            | Protected         | Create new gig                    |
| `PATCH`  | `/gigs/:id`        | Protected (owner) | Update gig                        |
| `DELETE` | `/gigs/:id`        | Protected (owner) | Soft-delete gig                   |
| `GET`    | `/gigs/me`         | Protected         | List current user's gigs          |
| `PATCH`  | `/gigs/:id/status` | Protected (owner) | Change gig status (active/paused) |

### GET `/gigs` — Query Parameters

| Param          | Type    | Description                |
| -------------- | ------- | -------------------------- |
| `category`     | string  | Filter by category slug    |
| `min_price`    | number  | Minimum price (BDT)        |
| `max_price`    | number  | Maximum price (BDT)        |
| `max_delivery` | integer | Maximum delivery days      |
| `min_rating`   | number  | Minimum average rating     |
| `tags`         | string  | Comma-separated tag filter |
| `seller_id`    | uuid    | Filter by seller           |

### POST `/gigs`

```json
// Request
{
  "title": "I will design a modern logo for your brand",
  "description": "Full description of the gig...",
  "category_id": "uuid",
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
  "images": ["https://r2.gighub.app/gigs/uuid/img1.jpg"]
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
    "images": [ { "id": "uuid", "image_url": "...", "sort_order": 0 } ],
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
| `job_type`   | string | Filter: paid, free, internship, volunteer, contest |
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
  "category_id": "uuid",
  "job_type": "paid",
  "budget_type": "fixed",
  "budget_min": 5000,
  "budget_max": 10000,
  "deadline": "2026-04-15T00:00:00Z",
  "required_skills": ["Flutter", "Dart", "Firebase"],
  "attachments": []
}
```

---

## 6. Proposals

| Method  | Endpoint                  | Auth                  | Description                 |
| ------- | ------------------------- | --------------------- | --------------------------- |
| `POST`  | `/jobs/:jobId/proposals`  | Protected             | Submit proposal for a job   |
| `GET`   | `/jobs/:jobId/proposals`  | Protected (job owner) | List proposals for a job    |
| `GET`   | `/proposals/me`           | Protected             | List my submitted proposals |
| `GET`   | `/proposals/:id`          | Protected             | Get proposal detail         |
| `PATCH` | `/proposals/:id/withdraw` | Protected (applicant) | Withdraw proposal           |
| `PATCH` | `/proposals/:id/accept`   | Protected (job owner) | Accept proposal             |
| `PATCH` | `/proposals/:id/reject`   | Protected (job owner) | Reject proposal             |

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

---

## 7. Orders

| Method  | Endpoint               | Auth                     | Description                         |
| ------- | ---------------------- | ------------------------ | ----------------------------------- |
| `POST`  | `/orders/gig`          | Protected                | Create order from gig package       |
| `POST`  | `/orders/job`          | Protected                | Create order from accepted proposal |
| `GET`   | `/orders`              | Protected                | List my orders (as buyer & seller)  |
| `GET`   | `/orders/:id`          | Protected (buyer/seller) | Get order detail                    |
| `PATCH` | `/orders/:id/start`    | Protected (seller)       | Mark order as in_progress           |
| `PATCH` | `/orders/:id/deliver`  | Protected (seller)       | Submit delivery                     |
| `PATCH` | `/orders/:id/approve`  | Protected (buyer)        | Approve delivery → complete order   |
| `PATCH` | `/orders/:id/revision` | Protected (buyer)        | Request revision                    |
| `PATCH` | `/orders/:id/cancel`   | Protected (buyer/seller) | Request cancellation                |
| `PATCH` | `/orders/:id/dispute`  | Protected (buyer/seller) | Open dispute                        |

### POST `/orders/gig`

```json
// Request
{
  "gig_id": "uuid",
  "package_id": "uuid",
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
  "job_id": "uuid",
  "proposal_id": "uuid",
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
  "order_id": "uuid",
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
| `PATCH` | `/conversations/:id/read`     | Protected (participant) | Mark all messages as read                    |

### POST `/conversations`

```json
// Request — Pre-order inquiry
{
  "participant_id": "uuid",
  "gig_id": "uuid",
  "initial_message": "Hi, can you do X for me?"
}

// Request — Order-linked
{
  "participant_id": "uuid",
  "order_id": "uuid"
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

| Method | Endpoint                   | Auth                 | Description                       |
| ------ | -------------------------- | -------------------- | --------------------------------- |
| `POST` | `/orders/:orderId/reviews` | Protected            | Submit review for completed order |
| `GET`  | `/reviews/gig/:gigId`      | Public               | List reviews for a gig            |
| `GET`  | `/reviews/user/:username`  | Public               | List reviews for a user           |
| `POST` | `/reviews/:id/response`    | Protected (reviewee) | Respond to a review               |

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

| Method  | Endpoint                      | Auth      | Description                      |
| ------- | ----------------------------- | --------- | -------------------------------- |
| `GET`   | `/notifications`              | Protected | List my notifications            |
| `GET`   | `/notifications/unread-count` | Protected | Get unread notification count    |
| `PATCH` | `/notifications/:id/read`     | Protected | Mark single notification as read |
| `PATCH` | `/notifications/read-all`     | Protected | Mark all notifications as read   |

### GET `/notifications` — Query Parameters

| Param     | Type    | Description                 |
| --------- | ------- | --------------------------- |
| `type`    | string  | Filter by notification type |
| `is_read` | boolean | Filter: read/unread         |

---

## 14. Bookmarks

| Method   | Endpoint           | Auth      | Description                   |
| -------- | ------------------ | --------- | ----------------------------- |
| `GET`    | `/bookmarks`       | Protected | List my bookmarks             |
| `POST`   | `/bookmarks`       | Protected | Add bookmark                  |
| `DELETE` | `/bookmarks/:id`   | Protected | Remove bookmark               |
| `GET`    | `/bookmarks/check` | Protected | Check if entity is bookmarked |

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

## 15. Reports

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

## 16. Upload (R2)

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

## 17. Admin

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

## 18. WebSocket Events

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

## 19. Common Patterns

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
