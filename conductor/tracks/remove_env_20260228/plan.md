# Implementation Plan: Remove .env Usage and Hardcode Public API URL

## Phase 1: Hardcoding and Cleanup
- [ ] Task: Hardcode GEOCODE_BASE_URL
    - [ ] Update `src/lib/api/location/GeocodeApi.ts` to use a hardcoded constant for the URL.
    - [ ] Ensure existing tests in `src/lib/api/location/GeocodeApi.test.ts` still pass.
- [ ] Task: Remove .env.example
    - [ ] Delete the `.env.example` file from the project root.
- [ ] Task: Final Verification
    - [ ] Run `pnpm test` to ensure no regressions in geocoding logic.
    - [ ] Run `pnpm check` to ensure no linting or type errors.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Hardcoding and Cleanup' (Protocol in workflow.md)
