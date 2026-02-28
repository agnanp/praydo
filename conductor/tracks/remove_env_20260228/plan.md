# Implementation Plan: Remove .env Usage and Hardcode Public API URL

## Phase 1: Hardcoding and Cleanup
- [x] Task: Hardcode GEOCODE_BASE_URL
    - [x] Update `src/lib/api/location/GeocodeApi.ts` to use a hardcoded constant for the URL.
    - [x] Ensure existing tests in `src/lib/api/location/GeocodeApi.test.ts` still pass.
- [x] Task: Remove .env.example
    - [x] Delete the `.env.example` file from the project root.
- [x] Task: Final Verification
    - [x] Run `pnpm test` to ensure no regressions in geocoding logic.
    - [x] Run `pnpm check` to ensure no linting or type errors.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Hardcoding and Cleanup' (Protocol in workflow.md)
