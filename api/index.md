# Gighub Backend Implementation Flow

এই ফাইলটি backend planning(docs/) আর বর্তমান `/api` codebase মিলিয়ে modular implementation order ধরে কাজ করার জন্য।

Primary planning source: `/api/docs/` (এই repo-র backend planning documents সব এখানে maintained)।

এটাকে execution checklist হিসেবে ধরো: একবারে একটাই module, আর নিচের order না ভেঙে আগানো।

## Current Baseline

- Framework: NestJS
- API prefix: `/v1`
- Layer flow: `Controller → Service → Directus API client`
- Shared response pattern: `ServiceResponse<T>` + response interceptor
- Validation: DTO + `ValidationPipe`
- Auth: global JWT guard, route-level `@Public()`, optional `@Roles()`
- Global error handling: unified exception filter

## Status Board

| Item                          | Status      |
| ----------------------------- | ----------- |
| Foundation / Runtime Contract | ✅ Complete |
| Auth                          | ✅ Complete |
| Profile                       | ✅ Complete |
| Upload                        | ✅ Complete |
| Category                      | ✅ Complete |
| Gigs                          | ✅ Complete |
| Jobs                          | ✅ Complete |
| Proposals                     | ✅ Complete |
| Orders                        | ✅ Complete |
| Payments                      | ✅ Complete |
| Escrow                        | ✅ Complete |
| Withdrawals                   | ✅ Complete |
| Search / Performance          | not started |
| Testing Sweep                 | not started |

## Implementation Order

### Current Working Queue

এই মুহূর্তে safe execution order:

1. Auth
2. Profile
3. Upload
4. Category
5. Gigs
6. Jobs
7. Proposals
8. Orders/payments
9. Search/performance tuning
10. Testing sweep

### 1. Foundation / Runtime Contract

এই অংশ ঠিক থাকলে বাকি সব module একই flow-এ চলবে।

1. Global config, env validation, and app bootstrap rules finalize করা
2. Common decorators/guards/filter/interceptor baseline stable রাখা
3. Directus API client এবং `ServiceResponse` contract একবারে standardize করা
4. DTO validation rules সব module-এ same pattern-এ রাখা

Done হলে check:

- Route response সব জায়গায় একই envelope follow করে
- Error shape একই থাকে
- Auth guard bypass only via `@Public()`

### 2. Auth Module

এটাই first business-critical flow, কারণ profile, upload, and future marketplace সবকিছু এখান থেকে বর্তমান user ধরবে।

Checklist:

1. [ ] `POST /auth/register`
2. [ ] `POST /auth/login`
3. [ ] `POST /auth/refresh`
4. [ ] `POST /auth/logout`
5. [ ] `POST /auth/forgot-password`
6. [ ] `POST /auth/reset-password`

Module rules:

- Registration flow: username check → Firebase create → Directus profile create → JWT issue
- Login flow: password/google provider validation → Firebase auth/verify → profile lookup/create → JWT issue
- Refresh flow: verify refresh token → issue new pair
- Controller should stay thin; service owns all business logic

Done হলে check:

- New user can register and receive tokens
- Login works for password and Google provider
- Invalid credentials return proper 401/400
- Partial failure rolls back Firebase user when Directus create fails

### 3. Profile Module

Auth-এর পরেই profile because every protected request needs `profile_id` mapping.

Checklist:

1. [ ] `GET /profiles/me`
2. [ ] `PATCH /profiles/me`
3. [ ] `GET /profiles/:username`

Module rules:

- `PATCH /me` should branch by `type`
- `basic_info`, `avatar`, `fcm_token`, `notification_prefs` আলাদা update path হিসেবে handle হবে
- Public profile view future modules-এর সাথে compatible থাকতে হবে

Done হলে check:

- Current user নিজের profile read/update করতে পারে
- Username collision and cooldown respected হয়
- Public profile endpoint auth ছাড়াই কাজ করে

### 4. Upload Module

Profile avatar flow আর future gig/media flow-এর জন্য upload layer আগে stable হওয়া দরকার।

Checklist:

1. [ ] `POST /upload/image`
2. [ ] `POST /upload/file`
3. [ ] `DELETE /upload`

Module rules:

- Multipart handling `FileInterceptor` দিয়ে হবে
- Folder allowlist strict থাকবে
- Service should return upload result only; controller maps status to HTTP exception

Done হলে check:

- Image/file upload works end-to-end
- Invalid folder/file missing case correctly fails
- Delete endpoint rejects empty key

### 5. Category Module

এটা public lookup data; gigs/jobs ready হওয়ার আগে stable category catalog দরকার।

Checklist:

1. [ ] `GET /categories`
2. [ ] `GET /categories/:slug`
3. [ ] `POST /categories`
4. [ ] `PATCH /categories/:id`
5. [ ] `DELETE /categories/:id`

Module rules:

- Public read endpoints আগে complete করা
- Admin mutation পরে add করা
- `is_active=true` only expose হবে

Done হলে check:

- Public category browsing works
- Missing slug returns 404
- Inactive categories are hidden

### 6. Marketplace Core Phase 1: Gigs

Category + upload ready হলে gig module start করা সবচেয়ে natural next step।

Checklist:

1. [ ] `POST /gigs`
2. [ ] `PATCH /gigs/:id`
3. [ ] `DELETE /gigs/:id`
4. [ ] `GET /gigs`
5. [ ] `GET /gigs/:slug`
6. [ ] `GET /gigs/me`

Module rules:

- Gig create/update must own packages and images together
- Ownership check seller ভিত্তিতে হবে
- Soft delete only, hard delete না

Done হলে check:

- Seller নিজের gig create/update/delete করতে পারে
- Public list/detail filters কাজ করে
- Package/image shape stable থাকে

### 7. Marketplace Core Phase 2: Jobs

Gig-এর পরে job board implement করলে shared patterns reuse করা সহজ হয়।

Checklist:

1. [ ] `POST /jobs`
2. [ ] `PATCH /jobs/:id`
3. [ ] `DELETE /jobs/:id`
4. [ ] `GET /jobs`
5. [ ] `GET /jobs/:slug`
6. [ ] `GET /jobs/me`
7. [ ] `GET /tuition`
8. [ ] `GET /tuition/:slug`

Module rules:

- Tuition হলো same jobs model-এর specialization
- `job_type` অনুযায়ী validation branch হবে
- Public listing default `open` jobs দেখাবে

Done হলে check:

- Job create/update/close flow works
- Tuition browse alias separately available
- Search/filter and ownership guards work

### 8. Marketplace Core Phase 3: Proposals

Job module stable হলে proposal flow add করা যাবে।

Checklist:

1. [ ] `POST /jobs/:jobId/proposals`
2. [ ] `GET /jobs/:jobId/proposals`
3. [ ] `GET /proposals/me`
4. [ ] `GET /proposals/:id`
5. [ ] `PATCH /proposals/:id`

Module rules:

- Prevent duplicate proposal
- Prevent self-proposal
- Poster can accept/reject, applicant can withdraw
- Tuition proposal হলে session-request behavior follow করবে

Done হলে check:

- Proposal lifecycle complete হয়
- Status transitions correct থাকে
- Permission boundary respected হয়

### 9. Search, Discovery, and Performance Hardening

Core CRUD stable হওয়ার পরে search/indexing tune করা ভালো।

Work items:

1. [ ] Full-text search helpers
2. [ ] Tag/skill filtering
3. [ ] Sort options cleanup
4. [ ] Pagination consistency
5. [ ] Query performance review

Done হলে check:

- Search rank stable থাকে
- Filters predictable থাকে
- Heavy list endpoints degrade না করে

### 10. Testing Pass Per Module

প্রতিটা module finish হলে একই sequence-এ test করা উচিত।

Recommended order:

1. [ ] Service unit tests
2. [ ] Controller unit tests
3. [ ] E2E tests for public routes
4. [ ] E2E tests for protected routes
5. [ ] E2E tests for error and validation cases

## Suggested Working Rule

একবারে একটাই module ধরো।

1. Planning doc পড়ো
2. Current API file inspect করো
3. Service first implement করো
4. Controller map করো
5. DTO/validation align করো
6. Test run করো
7. Then next module-এ যাও

## Practical Next Step Order

যদি একদম এখন থেকে sequentially কাজ শুরু করতে হয়, best order হবে:

1. Auth
2. Profile
3. Upload
4. Category
5. Gigs
6. Jobs
7. Proposals
8. Search/performance tuning
9. Testing sweep
