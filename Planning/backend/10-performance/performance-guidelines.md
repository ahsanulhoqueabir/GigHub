# Performance Guidelines

## Purpose
Capture practical backend performance rules for current architecture.

## Implementation Plan
1. Keep Directus queries selective (`fields`, `limit`, filtered lookups).
2. Reuse helper methods to avoid duplicate network calls.
3. Keep uploads in memory only for allowed size windows; reject oversized early.
4. Keep auth endpoints throttled to protect Firebase and app resources.

## Error Handling
- Timeout or upstream failures must return deterministic 5xx envelope, not hanging requests.

## Edge Cases
- Repeated profile lookups in one request path (avoid duplicate fetches).
- Concurrent username updates (must preserve uniqueness check + conflict handling).

## Testing Strategy
- Add lightweight performance checks for high-frequency endpoints (`/auth/login`, `/profiles/me`, `/categories`).
