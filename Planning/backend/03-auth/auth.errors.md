# Auth Error Handling

## Purpose
Provide implementation-ready status/error mapping for auth endpoints.

## Implementation Plan
1. Use Nest exceptions in service/controller for known auth failures.
2. Keep global exception filter as single formatter for error responses.
3. Do not return ad-hoc error shapes from controller.

## Request/Response Structure
- Standard error JSON:
  - `success: false`
  - `error: string`
  - `details: unknown` (optional)
  - `status: number`

## HTTP Mapping
- 400: invalid provider, invalid reset code, validation failure.
- 401: invalid credentials, invalid/expired tokens.
- 409: duplicate username or email.
- 500: Firebase/Directus unexpected failures.

## Edge Cases
- Preserve generic forgot-password success message to prevent email enumeration.
- Avoid leaking Directus/Firebase internal error payloads in user-facing messages.

## Testing Strategy
- E2E assertions for status code and envelope shape for each failure type.
- Unit assertions that sensitive failure detail is not returned directly.
