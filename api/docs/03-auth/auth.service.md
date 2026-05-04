# Auth Service

## Purpose
Implement auth business logic across Firebase, JWT issuance, and Directus profile synchronization.

## Implementation Plan
1. Keep registration sequence: username check → Firebase create → Directus profile create → issue tokens.
2. Keep rollback on Directus create failure by deleting Firebase user.
3. Keep dual login mode:
   - `provider=password` via Firebase REST API.
   - `provider=google` via Firebase Admin token verification.
4. Keep profile lookup/auto-create by `firebase_uid`.
5. Keep refresh flow based on refresh-token verification and profile existence.

## Request/Response Structure
- Service returns `AuthTokens` for register/login/refresh.
- Token payload: `{ profile_id, username, is_verified, role }`.
- Access/refresh signing uses configured secrets and expiries.

## Error Handling
- Throw `ConflictException` for username/email collisions.
- Throw `UnauthorizedException` for invalid credentials/tokens.
- Throw `BadRequestException` for unsupported providers and invalid reset code.
- Throw `InternalServerErrorException` for infrastructure failures.

## Edge Cases
- Firebase succeeds but Directus fails (requires rollback).
- Social first-login without existing profile.
- Refresh token valid cryptographically but profile deleted.

## Testing Strategy
- Mock Firebase service, JWT service, and `directusApi` requests.
- Assert rollback behavior on partial failures.
- Assert payload correctness and token issuance for each auth path.
