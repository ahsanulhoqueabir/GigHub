# Category Module (Controller + Service)

## Purpose
Serve public category list and single-category lookup from `gh_categories`.

## Implementation Plan
1. Keep `@Public()` controller scope for categories endpoints.
2. Keep `GET /categories` and `GET /categories/:slug` routes only (current implementation).
3. Keep service methods `list()` and `find(slug)` using Directus filters for `is_active`.
4. Keep controller mapping for `404` vs `500` using `ServiceResponse.status`.

## Request/Response Structure
- `GET /categories` -> `ServiceResponse<Category[]>`
- `GET /categories/:slug` -> `ServiceResponse<Category>` or 404

## Error Handling
- Directus query failure -> service `fail('Failed to fetch ...')`.
- Missing slug match -> service `fail('Category not found', status=404)`.
- Controller throws `NotFoundException` when status=404, else `InternalServerErrorException`.

## Edge Cases
- Ensure only `is_active=true` categories are exposed.
- Keep field projection stable (`id,name,slug,icon,description,sort_order`).

## Testing Strategy
- Service unit tests: active filter enforcement, 404 behavior.
- Controller tests: status mapping and error conversion.
- E2E: public access without token.
