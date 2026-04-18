# Layering Pattern: Controller → Service → Data Access

## Purpose
Standardize implementation to the exact layering currently used in `/api`.

## Implementation Plan
1. Controller handles route concerns only: params/body/query extraction, access control prechecks, HTTP exception mapping.
2. Service owns business logic and remote calls (Directus, Firebase, R2).
3. Data access is performed inside services via `directusApi`; do not introduce a new repository layer unless codebase adopts it first.
4. Keep helper patterns when repeated: `fields()`, `patch()`, `query()`.
5. Keep return contract consistent using `ok()` / `fail()` helpers where module already follows it.

## Request/Response Structure
- Controller returns either:
  - `ServiceResponse<T>` from service, or
  - small direct success objects (`{ success: true, message: ... }`) for simple actions.
- Response interceptor wraps non-envelope payloads to `{ success: true, data }`.

## Error Handling
- Service-level recoverable failures should return `fail(message, error, status?)`.
- Controller translates known service failure states into Nest exceptions (`BadRequestException`, `NotFoundException`, `ConflictException`, `InternalServerErrorException`).
- Global exception filter emits final error envelope.

## Edge Cases
- If service already returns `{ success: false }`, controller must not leak internal details; map to user-safe exception message when needed.
- Cross-service actions (e.g., profile avatar update using upload service) require rollback-aware sequencing.

## Testing Strategy
- Unit-test controllers for exception mapping behavior.
- Unit-test services for remote API success/failure branching.
- E2E-test final HTTP envelope shape and status codes.
