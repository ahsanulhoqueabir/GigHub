# Validation Standard (DTO + ValidationPipe)

## Purpose
Lock request validation behavior to current global and module-specific rules.

## Implementation Plan
1. Keep global `ValidationPipe` options unchanged unless platform-wide migration is planned.
2. Keep DTO classes using `class-validator` decorators.
3. Use `ValidateIf` for mode-dependent payloads.
4. Use `Transform` only where canonicalization is required (e.g., lowercase username).

## Request/Response Structure
- Validation failure returns 400 with:
  - `success: false`
  - `error` from exception filter
  - `details` containing validation messages
  - `status: 400`

## Error Handling
- `whitelist: true` strips unknown fields.
- `forbidNonWhitelisted: true` rejects unknown keys with 400.
- `transform: true` applies type conversion where possible.

## Edge Cases
- Conditional DTO fields must not pass when controlling `type/provider` is missing.
- Ensure regex and enum validators stay aligned with frontend contracts.

## Testing Strategy
- DTO-focused unit tests for each conditional branch.
- E2E tests for unknown keys and invalid enum values.
