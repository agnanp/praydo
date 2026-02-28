# Specification: Improve Codebase based on Code Review Findings

## 1. Overview
This track focuses on addressing critical and high-priority issues identified during the comprehensive code review (`code_review_20260228`). The primary goals are to improve backend reliability, refine API error handling, and establish a baseline test suite for core application logic.

## 2. Functional Requirements

### 2.1 Backend & Configuration Enhancements
*   **Safe Error Handling in Rust:** Replace all unsafe `.unwrap()` calls in `src-tauri/src/lib.rs` (especially in `send_native_notification` and tray builders) with proper `Result` types and error handling logic.
*   **Boilerplate Cleanup:** Remove unused boilerplate code (e.g., the `greet` command) from the Tauri backend.
*   **Config Refinement:** Update the bundle identifier in `tauri.conf.json` to a unique, reverse-domain style (e.g., `id.my.apr.praydo`).

### 2.2 API & Calculation Refinements
*   **Geocoding Error Handling:** Update `src/lib/api/location/GeocodeApi.ts` to properly handle network errors and check `response.ok` before returning data.
*   **PrayTime Logic Clarity:** Refactor the `utcOffset` method in `src/lib/praytime/index.ts` to use more explicit parameters or logic, avoiding ambiguous hour-vs-minute detection based on value magnitude.

## 3. Testing & Quality Requirements

### 3.1 Baseline Test Suite
*   Establish a core unit test suite for the `PrayerManager` class (`src/lib/logic/PrayerManager.svelte.ts`), focusing on:
    - Prayer time derivation logic.
    - Countdown timer accuracy.
    - Notification triggering logic (ensuring robustness against missed seconds).

### 3.2 Quality Gates
*   All new and existing code must pass the project's `pnpm check` and build scripts.
*   Maintain a minimum test coverage of >60% for the modified modules, as per the project workflow.

## 4. Acceptance Criteria
- [ ] All Rust `.unwrap()` calls are replaced with safe error handling.
- [ ] Unused boilerplate is removed from the backend.
- [ ] Geocoding API handles failures gracefully.
- [ ] `PrayTime` UTC offset logic is explicit and unambiguous.
- [ ] A unit test suite exists for `PrayerManager` and passes successfully.

## 5. Out of Scope
*   Broad refactoring of frontend stores or extraction of Qibla logic (prioritized for a separate track).
*   Changes to the visual design or Svelte components.
