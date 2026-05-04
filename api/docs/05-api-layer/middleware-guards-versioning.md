# Middleware, Guards, and Versioning

## Purpose
Document global request controls from `main.ts` and `AppModule`.

## Implementation Plan
1. Keep API version prefix as `/v1`.
2. Keep Helmet enabled globally.
3. Keep configured CORS origins from config (`originWeb`, `originMobile`).
4. Keep global guards order:
   - `JwtAuthGuard` (skippable via `@Public()`)
   - `RolesGuard`
   - `ThrottlerGuard`
5. Keep per-route auth throttling overrides where already used.

## Request/Response Structure
- Unauthorized request to protected route -> 401 error envelope.
- Insufficient role -> 403 error envelope.
- Rate limit exceeded -> 429 error envelope.

## Error Handling
- Guard-thrown exceptions flow into global exception filter.

## Edge Cases
- Public routes still pass through roles/throttler guards.
- Missing JWT on non-public route fails before controller execution.

## Testing Strategy
- E2E: public route access, protected route rejection, role restriction, throttle violation.
