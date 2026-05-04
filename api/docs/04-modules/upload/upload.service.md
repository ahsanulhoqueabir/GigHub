# Upload Service

## Purpose
Provide R2-backed binary upload and deletion with strict size/type validation.

## Implementation Plan
1. Keep Cloudflare R2 S3 client initialization via config keys.
2. Keep image constraints:
   - MIME allowlist: jpeg/png/webp
   - Max 10MB
3. Keep generic file constraint: max 25MB.
4. Keep base64 image parser for profile avatar flow.
5. Keep key format: `{folder}/{uuid}.{ext}`.

## Request/Response Structure
- Upload methods return `ServiceResponse<UploadResult>`.
- Delete returns `ServiceResponse<void>` with success message.

## Error Handling
- Validation failures return `fail(..., status=400)`.
- R2 SDK failures return `fail('Failed to upload/delete file', error)`.

## Edge Cases
- Invalid base64 data URI format.
- Missing extension in original filename (fallback to `.bin`).
- Oversized base64 payload after decode.

## Testing Strategy
- Mock `S3Client.send` success/failure.
- Validate MIME/size/base64 branching.
- Assert key generation and URL composition.
