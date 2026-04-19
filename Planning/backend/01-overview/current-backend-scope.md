# Current Backend Scope

## Purpose
Define what is already implemented in `/api` so planning docs stay realistic and executable.

## Implementation Plan
1. Keep all immediate implementation docs constrained to existing modules: `auth`, `profile`, `category`, `upload`.
2. For future modules, reuse the same layer contract: controller delegates, service owns business logic + Directus/R2/Firebase integration, controller maps service failures to HTTP exceptions.
3. Preserve global behavior from `AppModule` and `main.ts` as non-negotiable defaults.

## Implemented Modules (Code-Verified)
- `AuthModule`
- `ProfileModule`
- `CategoryModule`
- `UploadModule`

## Cross-Cutting Runtime Behavior
- Global prefix: `/v1`
- Global validation: whitelist + forbidNonWhitelisted + transform
- Global guards: JWT auth, roles guard, throttler guard
- Global filter: unified error JSON format
- Global interceptor: unified success JSON format

## Edge Cases to Respect in Future Work
- No repository class exists today; services call `directusApi` directly.
- Some controllers return raw `{ success, message }`; interceptor passes through unchanged.
- Service methods generally return `ServiceResponse<T>`; some auth flows throw NestJS exceptions directly.

## Testing Strategy
- Keep module-level unit testing at service/controller boundaries.
- Keep e2e testing for auth guards, request validation, and response contracts.
- Use current stack only: Jest + Supertest.
