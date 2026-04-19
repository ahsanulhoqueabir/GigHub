# Auth Testing Strategy

## Purpose
Define realistic test coverage for current auth implementation.

## Implementation Plan
1. Add service unit tests with mocks for Firebase, JWT, Directus HTTP.
2. Add controller/e2e tests for route-level behavior and DTO validation.
3. Validate response envelope consistency for success and errors.

## Request/Response Structure Checks
- Register/login/refresh return token fields: `access_token`, `refresh_token`, `expires_in`.
- Forgot/reset return `{ success: true, message }`.

## Failure Scenario Coverage
- Username already taken.
- Email already exists in Firebase.
- Invalid password login.
- Invalid Google ID token.
- Refresh token invalid/expired.
- Reset code invalid/expired.

## Edge Case Coverage
- First-time social login auto-creates profile.
- Registration rollback on Directus failure.

## Tooling
- Unit: Jest with dependency mocks.
- E2E: Supertest + Nest testing module.
