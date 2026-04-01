# Backend Phase 1 — Foundation: Auth, Profiles & Infrastructure

> **Duration Estimate:** 2–3 weeks
> **Dependencies:** None (starting point)
> **Outcomes:** Working auth flow, profile management, R2 uploads, project structure

---

## Phase Overview

Set up the NestJS project, integrate Firebase Auth, implement custom JWT issuance, create `gh_profiles` in Directus, and build the file upload pipeline to Cloudflare R2.

---

## Task Checklist

### 1.1 Project Setup & Configuration

- [ ] **1.1.1** Initialize NestJS project with TypeScript strict mode
  ```bash
  nest new gighub-api --strict
  ```
- [ ] **1.1.2** Set up project structure:
  ```
  src/
  ├── common/
  │   ├── decorators/         # Custom decorators (@CurrentUser, @Roles)
  │   ├── filters/            # Exception filters
  │   ├── guards/             # AuthGuard, RolesGuard
  │   ├── interceptors/       # Response transform, logging
  │   ├── pipes/              # Validation pipes
  │   ├── dto/                # Shared DTOs
  │   └── utils/              # Helpers (slug, pagination, etc.)
  ├── config/                 # Config module (env validation)
  ├── modules/
  │   ├── auth/               # Phase 1
  │   ├── profiles/           # Phase 1
  │   ├── upload/             # Phase 1
  │   ├── gigs/               # Phase 2
  │   ├── jobs/               # Phase 2
  │   ├── proposals/          # Phase 2
  │   ├── categories/         # Phase 2
  │   ├── orders/             # Phase 3
  │   ├── payments/           # Phase 3
  │   ├── escrow/             # Phase 3
  │   ├── withdrawals/        # Phase 3
  │   ├── chat/               # Phase 4
  │   ├── notifications/      # Phase 4
  │   ├── reviews/            # Phase 5
  │   ├── bookmarks/          # Phase 5
  │   ├── reports/            # Phase 5
  │   └── admin/              # Phase 5
  └── main.ts
  ```
- [ ] **1.1.3** Install core dependencies:
  ```
  @nestjs/config, @nestjs/jwt, @nestjs/passport
  passport, passport-jwt, class-validator, class-transformer
  firebase-admin, @directus/sdk
  @aws-sdk/client-s3 (for R2), helmet, @nestjs/throttler
  ```
- [ ] **1.1.4** Set up environment configuration module with validation:
  ```
  FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
  DIRECTUS_URL, DIRECTUS_ADMIN_TOKEN
  JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN
  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
  SSLCOMMERZ_STORE_ID, SSLCOMMERZ_STORE_PASSWORD, SSLCOMMERZ_IS_SANDBOX
  PORT, NODE_ENV
  ```
- [ ] **1.1.5** Set up global validation pipe, exception filter, response interceptor
- [ ] **1.1.6** Set up Helmet security middleware
- [ ] **1.1.7** Set up rate limiting with `@nestjs/throttler`
- [ ] **1.1.8** Set up CORS configuration for Next.js and Flutter origins

### 1.2 Directus Setup

- [ ] **1.2.1** Deploy Directus instance (Docker or cloud)
- [ ] **1.2.2** Create `gh_profiles` collection with all fields as per DB schema
- [ ] **1.2.3** Create `gh_categories` collection with all fields
- [ ] **1.2.4** Seed `gh_categories` with default data:
  - Design, Development, Writing, Video & Animation, Marketing, Data & Analytics, Music & Audio, Translation, Business, Tutoring
- [ ] **1.2.5** Create `gh_platform_config` collection with default values
- [ ] **1.2.6** Set up Directus roles & permissions:
  - **API Role** (used by NestJS): full CRUD on all `gh_*` collections
  - **Public Role**: read-only on `gh_categories`, `gh_platform_config`
- [ ] **1.2.7** Create Directus service module in NestJS (singleton SDK client)

### 1.3 Firebase Auth Integration

- [ ] **1.3.1** Create Firebase project and configure:
  - Enable email/password sign-up
  - Enable Google OAuth provider
  - Define future third-party SSO providers in Firebase Auth (e.g., GitHub, Microsoft, Apple)
  - Disable email confirmation (handle verification at platform level)
  - Set redirect URLs for web and mobile
- [ ] **1.3.2** Create `AuthModule` in NestJS with:
  - `AuthService` — business logic
  - `AuthController` — REST endpoints
  - `FirebaseService` — Firebase Admin SDK wrapper
- [ ] **1.3.2b** Define shared DTO contract for `POST /auth/login`:
  - `provider=password` requires: `email`, `password`
  - social provider (`google`, `github`, `microsoft`, `apple`) requires: `firebase_id_token`
  - validate provider allowlist and conditional required fields
  - enforce validation matrix:
    - `password` => allow only `email`, `password`
    - social providers => allow only `firebase_id_token`
    - unknown provider => `400 INVALID_PROVIDER`
- [ ] **1.3.3** Implement `POST /auth/register`:
  1. Validate input (email, password, display_name, username)
  2. Check username uniqueness against `gh_profiles`
  3. Create Firebase user via `firebase-admin` Auth API
  4. Create `gh_profiles` record in Directus with `firebase_uid`
  5. Sign and return NestJS JWT + refresh token
- [ ] **1.3.4** Implement `POST /auth/login`:
  1. Accept a single payload contract: `provider` + provider-specific credentials/token
  2. If `provider=password`, authenticate via Firebase Auth REST API (email/password)
  3. If social provider (`google` now; others later), verify Firebase ID token via Firebase Admin SDK (`verifyIdToken`)
  4. Enforce allowlist of supported providers
  5. Check/create `gh_profiles` by `firebase_uid`
  6. Sign and return NestJS JWT + refresh token
- [ ] **1.3.6** Implement `POST /auth/refresh`:
  1. Verify refresh token
  2. Issue new access + refresh token pair
- [ ] **1.3.7** Implement `POST /auth/logout`:
  1. Invalidate refresh token (store in blacklist or rotation)
- [ ] **1.3.8** Implement `POST /auth/forgot-password` and `POST /auth/reset-password`

### 1.4 JWT Strategy & Guards

- [ ] **1.4.1** Create JWT strategy (`JwtStrategy` extending `PassportStrategy`):
  - Extract token from Authorization header
  - Validate and decode payload: `{ profile_id, username, role, is_verified }`
- [ ] **1.4.2** Create `JwtAuthGuard` (used globally or per-route)
- [ ] **1.4.3** Create `RolesGuard` for admin-only routes
- [ ] **1.4.4** Create `@CurrentUser()` decorator to extract user from request
- [ ] **1.4.5** Create `@Roles('admin')` decorator
- [ ] **1.4.6** Create `@Public()` decorator to skip auth on specific routes
- [ ] **1.4.7** Set up global guard with `APP_GUARD` — all routes protected by default

### 1.5 Profile Module

- [ ] **1.5.1** Create `ProfilesModule` with:
  - `ProfilesService` — CRUD via Directus SDK
  - `ProfilesController` — REST endpoints
  - DTOs: `UpdateProfileDto`, `ProfileResponseDto`
- [ ] **1.5.2** Implement `GET /profiles/me` — return current user's full profile
- [ ] **1.5.3** Implement `PATCH /profiles/me` — update profile fields:
  - Allowed fields: `display_name`, `bio`, `skills`, `availability_status`
  - Username change: check uniqueness, limit frequency (once per 30 days)
- [ ] **1.5.4** Implement `GET /profiles/:username` — public profile view:
  - Return: display_name, username, avatar, bio, skills, availability_status, avg_rating, total_reviews, created_at
  - Exclude: email, firebase_uid, fcm_token, notification_prefs
- [ ] **1.5.5** Implement `GET /profiles/:username/gigs` — list user's active gigs (placeholder, completed in Phase 2)
- [ ] **1.5.6** Implement `GET /profiles/:username/reviews` — list reviews for user (placeholder, completed in Phase 5)
- [ ] **1.5.7** Implement `PATCH /profiles/me/fcm-token` — update FCM token
- [ ] **1.5.8** Implement `PATCH /profiles/me/notification-prefs` — update notification preferences

### 1.6 Cloudflare R2 Upload Module

- [ ] **1.6.1** Create `UploadModule` with:
  - `UploadService` — R2 operations via AWS S3 SDK
  - `UploadController` — REST endpoints
- [ ] **1.6.2** Configure S3 client for R2:
  ```typescript
  new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
  ```
- [ ] **1.6.3** Implement `POST /upload/image`:
  - Accept `multipart/form-data` with `file` and `folder` fields
  - Validate file type (JPG, PNG, WebP) and size (max 10MB)
  - Generate unique key: `{folder}/{uuid}.{ext}`
  - Upload to R2 bucket
  - Return public URL
- [ ] **1.6.4** Implement `POST /upload/file`:
  - Accept any file type, max 25MB
  - Same flow as image upload
- [ ] **1.6.5** Implement `DELETE /upload`:
  - Accept R2 key, delete from bucket
  - Verify the requesting user owns the resource (or is admin)
- [ ] **1.6.6** Implement `PATCH /profiles/me/avatar`:
  - Upload image to R2 under `avatars/` folder
  - Delete old avatar if exists
  - Update `gh_profiles.avatar` field in Directus

### 1.7 Common Utilities

- [ ] **1.7.1** Create pagination utility:
  ```typescript
  // Input: page, limit from query
  // Output: { offset, limit, buildMeta(total) }
  ```
- [ ] **1.7.2** Create slug generator utility:
  ```typescript
  // "I will design a logo" → "i-will-design-a-logo-abc123"
  ```
- [ ] **1.7.3** Create standard response wrapper interceptor:
  ```typescript
  { success: true, data: ..., meta: ... }
  ```
- [ ] **1.7.4** Create global exception filter with structured error responses
- [ ] **1.7.5** Create Directus query helper (filter builder, sort, pagination)

### 1.8 Testing & Validation

- [ ] **1.8.1** Write unit tests for AuthService (register, login, JWT signing)
- [ ] **1.8.2** Write unit tests for ProfilesService (CRUD operations)
- [ ] **1.8.3** Write unit tests for UploadService (R2 operations)
- [ ] **1.8.4** Write e2e tests for auth flow (register → login → access protected route)
- [ ] **1.8.5** Write e2e tests for profile endpoints
- [ ] **1.8.6** Test Google OAuth flow end-to-end
- [ ] **1.8.7** Verify rate limiting on auth endpoints (5 req/min)

---

## Endpoints Delivered in This Phase

| Method   | Endpoint                          | Status |
| -------- | --------------------------------- | ------ |
| `POST`   | `/auth/register`                  | 🔲     |
| `POST`   | `/auth/login`                     | 🔲     |
| `POST`   | `/auth/refresh`                   | 🔲     |
| `POST`   | `/auth/logout`                    | 🔲     |
| `POST`   | `/auth/forgot-password`           | 🔲     |
| `POST`   | `/auth/reset-password`            | 🔲     |
| `GET`    | `/profiles/me`                    | 🔲     |
| `PATCH`  | `/profiles/me`                    | 🔲     |
| `GET`    | `/profiles/:username`             | 🔲     |
| `PATCH`  | `/profiles/me/avatar`             | 🔲     |
| `PATCH`  | `/profiles/me/fcm-token`          | 🔲     |
| `PATCH`  | `/profiles/me/notification-prefs` | 🔲     |
| `POST`   | `/upload/image`                   | 🔲     |
| `POST`   | `/upload/file`                    | 🔲     |
| `DELETE` | `/upload`                         | 🔲     |
| `GET`    | `/categories`                     | 🔲     |

---

## Directus Collections Created

| Collection           | Status |
| -------------------- | ------ |
| `gh_profiles`        | 🔲     |
| `gh_categories`      | 🔲     |
| `gh_platform_config` | 🔲     |

---

## Definition of Done

- [ ] All auth endpoints working (register, login, Google, refresh, logout)
- [ ] JWT tokens correctly issued with profile_id, username, role, is_verified
- [ ] Profile CRUD fully functional
- [ ] Avatar upload to R2 working
- [ ] Generic file/image upload to R2 working
- [ ] Categories seeded and listable
- [ ] Rate limiting active on auth endpoints
- [ ] Global auth guard protecting all non-public routes
- [ ] Unit tests passing
- [ ] E2E tests passing
- [ ] API documentation matches implementation
