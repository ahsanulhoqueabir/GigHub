# Testing Strategy (Current Stack)

## Purpose
Define a practical testing roadmap aligned with repository tooling and current module maturity.

## Implementation Plan
1. Use Jest for unit/integration (`npm test`) and e2e (`npm run test:e2e`).
2. Prioritize coverage for implemented modules first: auth/profile/category/upload.
3. Mock external dependencies (Directus, Firebase Admin, Axios REST, S3 client).
4. Add regression tests for response and error envelopes as shared contract tests.

## Test Structure Alignment
- Unit tests colocated in `src/**/*.spec.ts`.
- E2E tests in `test/` using `jest-e2e.json`.

## Failure Scenarios to Cover
- Validation rejects malformed payloads.
- Guard rejects unauthorized access.
- Service handles external dependency failures.
- Controller maps service fail states to correct HTTP status.

## Edge Case Coverage
- Throttled auth routes.
- Username cooldown and uniqueness race windows.
- Large/invalid uploads and base64 format errors.

## Execution Checklist
- `npm run lint`
- `npm run build`
- `npm test -- --passWithNoTests` (until tests are added)
- `npm run test:e2e` once e2e specs exist
