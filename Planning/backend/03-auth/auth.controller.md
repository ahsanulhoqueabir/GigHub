# Auth Controller

## Purpose
Own HTTP contract for registration, login, refresh, logout, forgot-password, and reset-password.

## Implementation Plan
1. Keep `@Controller('auth')` routes under `/v1/auth/*`.
2. Keep `@Public()` on register/login/refresh/forgot/reset.
3. Keep auth throttling (`@Throttle({ auth: { limit: 5, ttl: 60000 } })`) on login/register.
4. Delegate business logic to `AuthService`; keep controller thin.
5. Keep logout stateless unless token blacklist is introduced in codebase.

## Request/Response Structure
- `POST /auth/register` body: `RegisterDto`
- `POST /auth/login` body: `LoginDto`
- `POST /auth/refresh` body: `RefreshTokenDto`
- `POST /auth/forgot-password` body: `ForgotPasswordDto`
- `POST /auth/reset-password` body: `ResetPasswordDto`
- Success returns token envelope or `{ success: true, message }` depending route.

## Error Handling
- Invalid provider/auth credentials: 400/401.
- Duplicate username/email: 409.
- Firebase/Directus failure during register: 500 with rollback attempt for Firebase user.
- Invalid/expired refresh token: 401.

## Edge Cases
- Password vs social login payload mismatch.
- Google token missing email claim.
- Partial registration failure after Firebase user created.

## Testing Strategy
- Controller unit: verify DTO validation and service delegation.
- E2E: register/login/refresh happy path + throttling + invalid payload matrices.
