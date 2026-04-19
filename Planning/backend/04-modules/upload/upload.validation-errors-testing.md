# Upload Validation, Errors, and Testing

## Purpose
Define endpoint-level validation and failure coverage for upload workflows.

## Implementation Plan
1. Validate request presence (`file` or `key`) in controller.
2. Validate folder against static allowlist before service call.
3. Validate binary constraints in service (size + MIME).
4. Keep error format normalized through exception filter.

## Request/Response Structure
- Success: `{ success: true, data: { url, key } }` for uploads.
- Error: `{ success: false, error, details?, status }`.

## Error Handling
- 400: malformed request, unsupported folder/type, oversized payload.
- 500: R2 transport/service failures.

## Edge Cases
- Multipart with zero-byte files.
- Non-image payload passed to image endpoint.
- Body key pointing to non-existing object during delete.

## Testing Strategy
- Unit tests with mocked file objects (size/type permutations).
- E2E tests for multipart parsing and envelope shape.
