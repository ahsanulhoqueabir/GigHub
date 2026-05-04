# Gigs Module Blueprint (Pattern-Aligned)

## Purpose
Define how future gig endpoints must be implemented using the same API pattern already used by current modules.

## Implementation Plan
1. Create `GigController` with route-only logic and HTTP exception mapping.
2. Create `GigService` as business/data layer using `directusApi` and `ServiceResponse` helpers.
3. Add DTOs for create/update/query flows using `class-validator`.
4. Keep controller action switching by `type` where action multiplexing is required (same pattern as profile updates).

## Request/Response Structure
- Controller returns `{ success: true, data, message?, pagination? }`.
- Service returns `ServiceResponse<T>` via `ok()/fail()`.
- List endpoints use paginated service response shape.

## Error Handling
- Validation errors: 400 (global `ValidationPipe`).
- Ownership/business conflicts: 403/409 from controller exception mapping.
- Directus failures: service `fail(...)` mapped to 500 by controller unless status override exists.

## Edge Cases
- Duplicate slug generation collisions.
- Concurrent gig status updates.
- Missing package tier combinations in partial updates.

## Testing Strategy
- Unit: service CRUD and status transitions with Directus mocks.
- Integration/e2e: create/list/detail/update/delete including unauthorized and conflict paths.
