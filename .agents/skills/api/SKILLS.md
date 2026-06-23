# API Routing and Response Format Skill

This skill ensures that all backend API routes, controller methods, error handling strategies, and endpoint schemas remain completely consistent, clean, and robust across the NestJS codebase.

## 1. Consistent Response Formatting

All route handlers MUST return standard response payloads using the common response utility located in `src/common/utils/response.util.ts`.

### Success Responses

Always wrap success objects using the `createSuccessResponse` utility function:

```typescript
import { createSuccessResponse } from '../common/utils/response.util';

@Get('example')
async getExample() {
  const result = await this.exampleService.getData();
  return createSuccessResponse(result, 'Data retrieved successfully');
}
```

For paginated lists, supply the `meta` object inside the utility:

```typescript
return createSuccessResponse(data, 'Items loaded successfully', {
  page,
  limit,
  total,
  totalPages,
});
```

### Error Responses

Do not format error responses manually within your controllers or services. Throw standard NestJS HTTP exceptions (e.g., `BadRequestException`, `UnauthorizedException`, `NotFoundException`). The global `HttpExceptionFilter` will catch these and automatically format them into:

```json
{
  "success": false,
  "error": "Bad Request",
  "details": "Detailed error message or validation errors array",
  "status": 400
}
```

---

## 2. DTO and Body Validation

Every incoming request payload must have a validated DTO (Data Transfer Object) in the `dto/` directory under its respective domain module.
- Always use `class-validator` decorators (such as `@IsString()`, `@IsNotEmpty()`, `@IsOptional()`, `@IsEmail()`).
- The global `ValidationPipe` will automatically validate bodies and respond with standardized validation error details if inputs fail checks.

---

## 3. Protecting Routes (Authentication & Status Verification)

Always enforce authentication on private endpoints using the `JwtAuthGuard`:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('protected')
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  // ...
}
```

The guard verifies:
1. The request has a valid `Bearer <token>` header.
2. The user profile exists in the database.
3. The user's status is active (`active: true`). If inactive, it blocks the request automatically, returning a `401 Unauthorized` response.

---

## 4. Bruno Collection Syncing

For every new API route implemented:
1. Create a happy-path `.bru` file (e.g., `Get Details - Success.bru`).
2. Create edge-case / error-path `.bru` files (e.g., `Get Details - Unauthorized.bru`, `Get Details - Validation Failure.bru`).
3. Ensure any post-response scripts or test scripts query `res.body.data` for success payloads (e.g. `res.body.data.token` instead of `res.body.token`).
