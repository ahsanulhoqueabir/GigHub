# Proposals Module Blueprint (Pattern-Aligned)

## Purpose
Define proposal module implementation with the same response, validation, and error conventions as current API modules.

## Implementation Plan
1. Implement `ProposalController` with route orchestration and exception mapping.
2. Implement `ProposalService` for proposal rules and Directus mutations.
3. Use DTOs for create and action payloads.
4. Use action-based patch (`type` field) if consolidating accept/reject/withdraw flows.

## Request/Response Structure
- `POST` returns created proposal in service envelope.
- `PATCH` action endpoints return updated proposal/status result in same envelope.
- Error envelope always produced by global exception filter.

## Error Handling
- Duplicate proposal submission: 409.
- Self-application rule violation: 400/403.
- Missing/closed parent job: 404/400.
- Unknown action type: 400.

## Edge Cases
- Two concurrent submissions from same applicant.
- Accept action races between multiple proposals.
- Proposal updates after job closure.

## Testing Strategy
- Unit tests for each action transition and permission matrix.
- E2E tests for end-to-end job->proposal interactions including failures.
