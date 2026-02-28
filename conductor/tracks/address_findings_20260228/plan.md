# Implementation Plan: Address Remaining Code Review Findings

## Phase 1: Frontend Refactoring and Type Safety
- [x] Task: Extract Qibla Logic
    - [x] Create `src/lib/utils/qibla.test.ts` with test cases for bearing calculation.
    - [x] Create `src/lib/utils/qibla.ts` and implement the bearing calculation logic.
    - [x] Update `src/lib/logic/PrayerManager.svelte.ts` to use the new utility.
- [x] Task: Refine Store Interfaces
    - [x] Update all files in `src/lib/store/` to remove `[key: string]: any` and use specific types.
    - [x] Verify `pnpm check` passes after type refinements.
- [x] Task: Standardize Settings Types
    - [x] Update `CalculationSettings` interface and store to use numeric types for durations and angles.
    - [x] Update UI components and logic to handle numeric settings directly without string parsing.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Frontend Refactoring and Type Safety' (Protocol in workflow.md)

## Phase 2: Logic and Backend Improvements
- [ ] Task: Hijri Month Localization and Time Parsing
    - [ ] Refactor `PrayerManager.svelte.ts` to move Hijri month names to a config or utility.
    - [ ] Implement robust time parsing in `PrayerManager.svelte.ts` to handle various formats.
- [ ] Task: Optimize Sun Caching
    - [ ] Modify `src/lib/praytime/index.ts` to implement persistent sun position caching.
    - [ ] Verify performance improvement for monthly schedule generation.
- [ ] Task: Backend Cleanup and CSP Review
    - [ ] Investigate and potentially remove redundant `navigate_to_main` event in `src-tauri/src/lib.rs`.
    - [ ] Review and verify the `media-src` CSP in `tauri.conf.json`.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Logic and Backend Improvements' (Protocol in workflow.md)

## Phase 3: Final Quality Assurance
- [ ] Task: Final Quality Verification
    - [ ] Run `pnpm check` and ensure zero errors.
    - [ ] Run all tests and verify >60% coverage for modified modules.
    - [ ] Run `cd src-tauri && cargo clippy` to ensure backend quality.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Final Quality Assurance' (Protocol in workflow.md)
