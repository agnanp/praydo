# Implementation Plan: Address Remaining Code Review Findings

## Phase 1: Frontend Refactoring and Type Safety [checkpoint: 726ef35]
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
- [x] Task: Conductor - User Manual Verification 'Phase 1: Frontend Refactoring and Type Safety' (Protocol in workflow.md)

## Phase 2: Logic and Backend Improvements [checkpoint: 493c2c8]
- [x] Task: Hijri Month Localization and Time Parsing
    - [x] Refactor `PrayerManager.svelte.ts` to move Hijri month names to a config or utility.
    - [x] Implement robust time parsing in `PrayerManager.svelte.ts` to handle various formats.
- [x] Task: Optimize Sun Caching
    - [x] Modify `src/lib/praytime/index.ts` to implement persistent sun position caching.
    - [x] Verify performance improvement for monthly schedule generation.
- [x] Task: Backend Cleanup and CSP Review
    - [x] Investigate and potentially remove redundant `navigate_to_main` event in `src-tauri/src/lib.rs`.
    - [x] Review and verify the `media-src` CSP in `tauri.conf.json`.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Logic and Backend Improvements' (Protocol in workflow.md)

## Phase 3: Final Quality Assurance
- [x] Task: Final Quality Verification
    - [x] Run `pnpm check` and ensure zero errors.
    - [x] Run all tests and verify >60% coverage for modified modules.
    - [x] Run `cd src-tauri && cargo clippy` to ensure backend quality.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Final Quality Assurance' (Protocol in workflow.md)
