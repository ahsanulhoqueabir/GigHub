# Database Access Model (Directus)

## Purpose
Align persistence docs with actual current approach: HTTP access to Directus, not ORM repositories.

## Implementation Plan
1. Keep centralized `directusApi` axios instance with auth header and timeout.
2. Keep service-owned collection names (`gh_profiles`, `gh_categories`, etc.).
3. Keep service-level query/patch helpers for repeated patterns.
4. Keep all persistence operations wrapped in service response envelopes.

## Request/Response Structure
- Directus response expected shape: `{ data: ... }`.
- Service adapts Directus response to project envelope via `ok()`/`fail()`.

## Error Handling
- Directus interceptor logs status/url/method/data for diagnostics.
- No-response conditions map to `Directus server not responding`.
- Services should avoid throwing raw axios errors in non-auth modules.

## Edge Cases
- Directus partial outages: fail gracefully with deterministic error envelope.
- Limit/sort/filter params must be explicit to avoid large accidental scans.

## Testing Strategy
- Service tests mock axios response and interceptor failure modes.
