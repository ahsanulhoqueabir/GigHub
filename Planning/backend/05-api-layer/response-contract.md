# API Response Contract

## Purpose
Enforce one global response contract compatible with current interceptor/filter behavior.

## Implementation Plan
1. Keep service success helpers (`ok`, `paginated`) returning `{ success: true, ... }`.
2. Keep controller direct-success objects in same envelope shape.
3. Keep response interceptor pass-through for already-enveloped payloads.
4. Keep exception filter as single source for error-envelope formatting.

## Success Structure
- Required: `success: true`
- Optional: `data`, `message`, `pagination`

## Error Structure (Mandatory)
- `success: false`
- `error: string`
- `details?: unknown`
- `status: number`

## Edge Cases
- Never return bare arrays/objects from controller unless interceptor wrapping is expected.
- Ensure paginated responses keep `pagination` schema from `ServicePagination`.

## Testing Strategy
- Contract tests that assert keys/types for success and error payloads.
