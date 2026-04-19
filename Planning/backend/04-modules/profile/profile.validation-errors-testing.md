# Profile Validation, Errors, and Testing

## Purpose
Combine request validation rules, error mapping, and test plan for profile endpoints.

## Implementation Plan
1. Keep `UpdateProfileDto` as the single contract for `PATCH /profiles/me`.
2. Keep `ValidateIf` rules keyed on `type`.
3. Keep username regex and lowercase transform.
4. Keep validation + controller-level checks layered (DTO handles shape, controller handles business conflicts).

## Request/Response Structure
- DTO fields by type:
  - `basic_info`: `display_name?`, `username?`, `bio?`, `skills?`, `availability_status?`
  - `avatar`: `avatar_base64`
  - `fcm_token`: `fcm_token`
  - `notification_prefs`: `notification_prefs`

## Error Handling
- DTO violation: HTTP 400 with validation details array.
- Business-rule violations: 400/409 from controller exceptions.
- Data layer failure: 500 mapped from service `success: false`.

## Edge Cases
- Reject unknown `type` values.
- Reject non-whitelisted payload keys globally.
- Avoid avatar update when base64 is absent or invalid.

## Testing Strategy
- DTO validation matrix tests by `type`.
- Controller branch tests for each update path.
- E2E tests for username conflict + 30-day rename constraint.
