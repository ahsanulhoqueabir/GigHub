# Deployment & Runtime Configuration

## Purpose
Ensure deployment docs match actual configuration and boot behavior in `/api`.

## Implementation Plan
1. Keep config validation via Joi schema at startup.
2. Require all configured secrets/keys from `configuration.ts` before release.
3. Keep `NODE_ENV`, CORS origins, JWT secrets, Firebase, Directus, and R2 settings environment-driven.
4. Keep app boot failure hard-stop behavior (`process.exit(1)` on bootstrap failure).

## Request/Response Structure
- Deployment changes must not alter API success/error envelope contracts.

## Error Handling
- Startup misconfiguration should fail fast with clear logs.
- Runtime external dependency failures should surface as standardized API errors.

## Edge Cases
- Multiline Firebase private key must preserve newline replacement behavior.
- CORS origins must include active web/mobile frontends for each environment.

## Testing Strategy
- Pre-release checks: lint/build/start smoke test in staging.
- Verify at least one protected and one public endpoint after deploy.
