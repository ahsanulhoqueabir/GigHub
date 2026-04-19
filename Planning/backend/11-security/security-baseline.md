# Security Baseline

## Purpose
Define minimum security controls already present and required for future module additions.

## Implementation Plan
1. Keep Helmet middleware enabled globally.
2. Keep JWT auth guard global with explicit `@Public()` opt-out.
3. Keep route-level rate limiting for auth-sensitive endpoints.
4. Keep strict DTO validation with unknown-key rejection.
5. Keep upload MIME/size restrictions and folder allowlist checks.

## Error Handling
- Do not leak internal stack traces or provider internals in client error payloads.
- Keep generic forgot-password success message to prevent email enumeration.

## Edge Cases
- Reject malformed bearer tokens and expired refresh tokens consistently.
- Ensure role checks default-deny when `request.user` is absent.

## Testing Strategy
- Security-focused e2e tests for auth bypass attempts, payload pollution, and oversized uploads.
