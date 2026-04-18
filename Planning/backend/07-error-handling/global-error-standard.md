# Global Error Handling Standard (Mandatory)

## Purpose
Define the required unified error strategy for all existing and upcoming modules.

## Implementation Plan
1. Keep global catch-all exception filter active (`AllExceptionsFilter`).
2. Keep module controllers/services using Nest exceptions or `fail()` in line with existing module style.
3. Standardize status mapping before response leaves API.
4. Keep logs for unexpected exceptions via Nest logger/directus interceptor logs.

## Unified Error Object
```json
{
  "success": false,
  "error": "Human-readable message",
  "details": "Optional detail payload",
  "status": 400
}
```

## HTTP Status Mapping
- 400: validation and bad input
- 401: unauthenticated / invalid token
- 403: role/permission denial
- 404: entity missing
- 409: uniqueness conflict
- 429: rate limit exceeded
- 500: unknown/internal failure

## Logging Strategy
- Log unexpected errors with stack (`Logger.error`) in exception filter/service.
- Log Directus transport/HTTP failures via `directusApi` interceptor.
- Do not log secrets/tokens/raw credentials.

## Edge Cases
- `HttpException.getResponse()` may be string or object; filter must normalize both.
- Preserve `details` array for validation errors to keep client-side field mapping.

## Testing Strategy
- E2E tests for every major status class to verify envelope consistency.
