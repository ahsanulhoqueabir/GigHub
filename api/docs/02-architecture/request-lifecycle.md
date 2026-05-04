# Request Lifecycle (Current API)

## Purpose
Document exact runtime flow for any endpoint.

## Implementation Plan
1. Request enters Nest app with Helmet + CORS + global prefix `/v1`.
2. Global guards execute: JWT auth (unless `@Public()`), then roles guard, then throttler.
3. Global `ValidationPipe` validates DTOs and strips unknown fields.
4. Controller action runs and calls service methods.
5. Controller either returns success envelope or throws Nest exception.
6. Response interceptor finalizes success payload format.
7. Global exception filter finalizes error payload format.

## Request/Response Structure
- Success: `{ success: true, data?, message?, pagination? }`
- Error: `{ success: false, error, details?, status }`

## Error Handling
- Validation failures become HTTP 400 and are normalized by exception filter.
- Auth failures become HTTP 401 from guard/strategy.
- Permission failures become HTTP 403 from roles guard.
- Unexpected errors become HTTP 500 with safe message.

## Edge Cases
- Public endpoint with throttling still rate-limits.
- Controller returning plain objects is tolerated because interceptor wraps or passes through.

## Testing Strategy
- E2E test one endpoint per category: public, authenticated, role-protected, validation-failing.
