# Jobs Module Blueprint (Pattern-Aligned)

## Purpose
Provide implementation-ready guidance for jobs endpoints while preserving existing controller/service conventions.

## Implementation Plan
1. Keep `JobController` thin: parse request, authorize, map service failure to HTTP exceptions.
2. Keep `JobService` handling all Directus calls and response shaping with `ok/fail`.
3. Use DTOs for create/update/filter contracts.
4. Use consolidated update action style (`type` switch) only where needed.

## Request/Response Structure
- Success and error envelopes must match global contract.
- List routes must include consistent pagination metadata.

## Error Handling
- Invalid query/body: 400.
- Unauthorized/forbidden operations: 401/403.
- Not found resources: 404.
- Upstream failures: 500 with normalized error envelope.

## Edge Cases
- Deadline already passed at request time.
- Budget range inversion.
- Job status changes colliding with proposal lifecycle.

## Testing Strategy
- Unit tests for filtering/sorting and ownership constraints.
- E2E tests for public listing + authenticated write operations.
