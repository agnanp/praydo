# Implementation Plan: Improve Codebase based on Code Review Findings

## Phase 1: API and Calculation Refinements
- [x] Task: Refactor Geocoding API error handling
    - [x] Write tests for `src/lib/api/location/GeocodeApi.test.ts` (mocking fetch failures)
    - [x] Implement robust error handling and `response.ok` checks in `geocode` function
- [x] Task: Refactor PrayTime UTC offset logic
    - [x] Write tests for `src/lib/praytime/index.test.ts` (specifically `utcOffset` with various inputs)
    - [x] Implement explicit and unambiguous UTC offset detection logic
- [ ] Task: Conductor - User Manual Verification 'Phase 1: API and Calculation Refinements' (Protocol in workflow.md)

## Phase 2: Backend and Configuration Enhancements
- [ ] Task: Safe Error Handling in Rust
    - [ ] Identify all `.unwrap()` calls in `src-tauri/src/lib.rs`
    - [ ] Replace `unwrap()` with `Result` and appropriate error propagation in commands and tray setup
- [ ] Task: Backend Cleanup and Configuration
    - [ ] Remove unused `greet` command and associated logic in `src-tauri/src/lib.rs`
    - [ ] Update bundle identifier in `src-tauri/tauri.conf.json` to `id.my.apr.praydo`
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Backend and Configuration Enhancements' (Protocol in workflow.md)

## Phase 3: Baseline Quality and Testing
- [ ] Task: Establish PrayerManager unit tests
    - [ ] Create `tests/lib/logic/PrayerManager.test.ts` (or equivalent location)
    - [ ] Implement tests for prayer time derivation logic
    - [ ] Implement tests for countdown timer accuracy
    - [ ] Implement tests for notification triggering (mocking time and permissions)
- [ ] Task: Final Quality Verification
    - [ ] Run `pnpm check` and ensure zero errors
    - [ ] Run all tests and verify >60% coverage for modified modules
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Baseline Quality and Testing' (Protocol in workflow.md)
