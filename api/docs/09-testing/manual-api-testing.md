# Manual API Testing Guide (GigHub API v1)

This document provides a comprehensive guide for testing the GigHub API endpoints. It reflects the actual controllers and DTO validation logic implemented in the `src/**` directory.

## 1. Global Environment & Setup

- **Base URL:** `http://localhost:4000/v1`
- **Global Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>` (for protected routes)
- **Standard Response Format:**
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Optional message"
  }
  ```

---

## 2. Authentication (`/auth`)

### A. Register
- **Endpoint:** `POST /auth/register`
- **Body (`RegisterDto`):**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "display_name": "Full Name",
    "username": "unique_username"
  }
  ```
- **Validation Edge Cases:**
  - **Email:** Must be a valid email format.
  - **Password:** Minimum **8 characters**.
  - **Username:** 3–50 chars, lowercase letters, numbers, and underscores only (`/^[a-z0-9_]+$/`).
  - **Display Name:** 2–100 characters.

### B. Login
- **Endpoint:** `POST /auth/login`
- **Body (`LoginDto`):**
  ```json
  {
    "provider": "password", // or "google"
    "email": "user@example.com", // Required if provider=password
    "password": "Password123!", // Required if provider=password
    "firebase_id_token": "..." // Required if provider=google
  }
  ```

### C. Password Management
- **Forgot Password:** `POST /auth/forgot-password` (Body: `{ "email": "..." }`)
- **Reset Password:** `POST /auth/reset-password` (Body: `{ "oob_code": "...", "new_password": "..." }`)

---

## 3. Profile Management (`/profiles`)

### A. Update Profile (Polymorphic)
- **Endpoint:** `PATCH /profiles/me`
- **Body (`UpdateProfileDto`):** Behavior changes based on the `type` field.
  - **Type `basic_info`:**
    - Fields: `display_name`, `username`, `bio`, `skills` (array), `availability_status`.
    - **Edge Case:** Username can only be changed **once every 30 days**.
  - **Type `avatar`:**
    - Fields: `avatar_base64` (Required).
  - **Type `fcm_token`:**
    - Fields: `fcm_token` (Required).
  - **Type `notification_prefs`:**
    - Fields: `notification_prefs` (Object, Required).

### B. Public Profiles
- **Endpoint:** `GET /profiles/:username?type=profile|gigs|reviews|full`
- **Public:** No token required.

---

## 4. Gigs & Marketplace (`/gigs`)

### A. Create/Update Gig
- **Create:** `POST /gigs`
  - **Body Rules:** Title (10–100), Description (50–2000), Price ($5–$10k), Max 10 tags.
- **Update:** `PATCH /gigs/:id`
  - **Type `edit`:** Same fields as create.
  - **Type `status`:** `status` field must be `active` or `paused`.

### B. Discovery
- **List All:** `GET /gigs?page=1&limit=10&search=keyword&category=id`
- **Get Detail:** `GET /gigs/:slug` (Public)
- **My Gigs:** `GET /gigs/me` (Protected)

---

## 5. Jobs & Proposals (`/jobs`, `/proposals`)

### A. Job Board (Clients)
- **Post Job:** `POST /jobs`
- **List Jobs:** `GET /jobs` (Public)
- **My Posted Jobs:** `GET /jobs/me`

### B. Proposals (Freelancers)
- **Submit Proposal:** `POST /proposals` (Requires `job_id` or `gig_id`)
- **Update/Withdraw:** `PATCH /proposals/:id` or `DELETE /proposals/:id`
- **List for Gig:** `GET /proposals/gig/:gigId`

---

## 6. Payments & Orders (`/payments`, `/orders`)

### A. Order Lifecycle
- **Create Order:** `POST /orders` (Links a buyer to a gig/job)
- **Initiate Payment:** `POST /payments/initiate`
  - Body: `{ "order_id": "...", "payment_method": "sslcommerz" }`
  - Returns: `Gateway URL` for redirection.

### B. Gateway Callbacks (Public)
- **SSLCommerz:** `/payments/sslcommerz/success`, `/fail`, `/cancel`, `/ipn`.

---

## 7. File Uploads (`/upload`)

- **Endpoints:** `POST /upload/image` or `POST /upload/file`.
- **Query Param:** `?folder=avatars|gigs|deliveries|documents|chat`.
- **Constraint:** Max file size handled by server config (usually 5MB-10MB).

---

## 8. Edge Case Testing Matrix

| Category | Test Scenario | Expected Status |
| :--- | :--- | :---: |
| **Auth** | Register with invalid username (e.g. `user-name`) | `400` |
| **Auth** | Login with `provider: "password"` but missing email | `400` |
| **Profile** | Change username twice within 30 days | `400` |
| **Profile** | Update with extra fields not in DTO | `400` |
| **Gigs** | Create Gig with price `$1` | `400` (Min $5) |
| **Gigs** | Edit a Gig belonging to another user | `403` |
| **Gigs** | Delete a Gig with active orders | `400` |
| **Payments** | Initiate payment for an already paid order | `400` |
| **Global** | Missing `Authorization` header on protected route | `401` |
| **Global** | Malformed UUID in URL params | `400` |

---

## 9. Manual Testing Checklist

1. [ ] **Flow 1:** Register -> Login -> Get `/profiles/me`.
2. [ ] **Flow 2:** Create Gig -> Update status to `paused` -> Verify not in public `/gigs` list.
3. [ ] **Flow 3:** Initiate Payment -> Simulate Success Callback -> Verify Order status is `paid`.
4. [ ] **Flow 4:** Upload Avatar -> Patch Profile `type: avatar` -> Verify URL in profile.
