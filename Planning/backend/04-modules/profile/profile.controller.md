# Profile Controller

## Purpose
Expose current-user and public-profile endpoints with typed update modes.

## Implementation Plan
1. Keep routes under `/v1/profiles`.
2. Keep `GET /me` and `PATCH /me` protected by global JWT guard.
3. Keep `GET /:username` as `@Public()` endpoint.
4. Keep `PATCH /me` switch by `dto.type`: `basic_info | avatar | fcm_token | notification_prefs`.
5. Keep controller responsibility for ownership/flow checks and service error-to-exception mapping.

## Request/Response Structure
- `GET /profiles/me`: `CurrentUser.profile_id` -> `ProfileService.get`.
- `PATCH /profiles/me`: `UpdateProfileDto` with type-specific fields.
- `GET /profiles/:username?type=profile|gigs|reviews|full`: currently returns profile or stubbed variants.

## Error Handling
- Profile missing: 404.
- Username taken: 409.
- Username change cooldown violation: 400.
- Upload failure in avatar flow: 400/500 based on service status.

## Edge Cases
- Avatar replacement includes best-effort deletion of old avatar key.
- Stub response branches for `gigs/reviews/full` until phase modules are implemented.

## Testing Strategy
- Unit-test each `type` branch in `PATCH /me`.
- E2E test public profile lookup and auth-required routes.
