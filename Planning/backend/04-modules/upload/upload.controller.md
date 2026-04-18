# Upload Controller

## Purpose
Handle HTTP file upload/delete endpoints and map upload-service statuses to API errors.

## Implementation Plan
1. Keep routes under `/v1/upload`.
2. Keep memory-based multipart handling via `FileInterceptor`.
3. Keep folder allowlist enforcement in controller.
4. Keep service call delegation:
   - `POST /upload/image` -> `uploadService.image`
   - `POST /upload/file` -> `uploadService.file`
   - `DELETE /upload` -> `uploadService.remove`

## Request/Response Structure
- Multipart requests require `file` field.
- Optional query `folder` with defaults (`misc` for image, `documents` for file).
- Success returns `ServiceResponse<UploadResult>` for uploads.

## Error Handling
- Missing file/key -> 400.
- Invalid folder -> 400.
- Service `status=400` -> `BadRequestException`.
- Other service failures -> `InternalServerErrorException`.

## Edge Cases
- Folder value must stay in explicit allowlist.
- Delete endpoint must reject empty key body.

## Testing Strategy
- Controller tests for allowlist and missing-file rejection.
- E2E multipart tests for image/file endpoints and invalid folder path.
