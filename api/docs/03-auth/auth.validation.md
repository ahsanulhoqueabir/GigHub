# Auth Validation Contract

## Purpose
Define DTO-level validation exactly as implemented in `auth.dto.ts`.

## Implementation Plan
1. Keep provider allowlist: `password | google`.
2. Keep conditional requirements:
   - `password` provider requires `email` + `password`.
   - non-password provider requires `firebase_id_token`.
3. Keep username normalization (lowercase transform) on registration.
4. Keep password minimum lengths as currently defined.

## Request/Response Structure
- Validation failures produce HTTP 400 from global `ValidationPipe`.
- Error payload normalized by global exception filter.

## Error Handling
- Unknown provider -> 400 with provider validation message.
- Missing provider-specific fields -> 400 with field-level detail array.

## Edge Cases
- Extra unapproved fields are rejected (`forbidNonWhitelisted`).
- Type coercion may occur due to `transform: true`; DTO types must remain explicit.

## Testing Strategy
- Matrix tests per provider with valid/invalid combinations.
- Negative tests for extra fields and malformed email/password lengths.
