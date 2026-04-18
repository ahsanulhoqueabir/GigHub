# Profile Service

## Purpose
Manage `gh_profiles` data operations via Directus with reusable helper methods.

## Implementation Plan
1. Keep `private readonly collection = 'gh_profiles'`.
2. Keep reusable helpers:
   - `fields()` for repeated public field selection.
   - `patch()` for shared PATCH behavior.
3. Keep `ServiceResponse<T>` returns via `ok()`/`fail()`.
4. Keep rename policy helpers: `canRename()` and `isTaken()`.

## Request/Response Structure
- Service methods return `{ success, data?, error?, details?, status? }`.
- Controller maps `success: false` to HTTP exceptions where needed.

## Error Handling
- Read/update failures return `fail('Failed ...', error)`.
- Not found in `find(username)` returns `fail(..., status=404)`.
- `canRename()` and `isTaken()` fail open to avoid blocking profile updates on transient data-access failures.

## Edge Cases
- Username updates set `username_updated_at` timestamp.
- Public profile projection intentionally excludes sensitive fields.

## Testing Strategy
- Mock Directus GET/PATCH responses and failure branches.
- Verify rename-window computation and uniqueness checks.
