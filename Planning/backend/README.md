# Backend Planning (Refactored)

This directory is now split into implementation-ready docs aligned with the current NestJS `/api` codebase.

## Current API Pattern Baseline

- Framework: NestJS
- Route prefix: `/v1`
- Layers in practice: **Controller → Service → Directus API client**
- Validation: `class-validator` DTOs + global `ValidationPipe`
- Success envelope: `success: true` with `data` (via service helpers + response interceptor)
- Error envelope: `success: false` with `error`, `details`, `status` (via global exception filter)
- Auth baseline: global `JwtAuthGuard`, route-level `@Public()`, optional `@Roles()` checks

## Directory Map

- `01-overview/` — backend scope and implementation status
- `02-architecture/` — request lifecycle and layering conventions
- `03-auth/` — auth module docs (controller/service/validation/errors/testing)
- `04-modules/` — module docs for profile/category/upload
- `05-api-layer/` — HTTP contract, guards, middleware, versioning
- `06-database/` — Directus-backed data access model
- `07-error-handling/` — global error standard (mandatory)
- `08-validation/` — DTO validation and request contract rules
- `09-testing/` — test structure and execution strategy
- `10-performance/` — performance guardrails for current stack
- `11-security/` — practical security controls aligned with implemented code
- `12-deployment/` — runtime configuration and release checklist
- `90-roadmap-phases/` — preserved phase planning docs
- `99-legacy/` — preserved large legacy docs (superseded)
