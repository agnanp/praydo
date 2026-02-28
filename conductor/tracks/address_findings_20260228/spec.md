# Specification: Address Remaining Code Review Findings

## 1. Overview
This track aims to finalize the improvements suggested in the initial code review (`code_review_20260228`). It focuses on refactoring frontend logic for better modularity, enhancing type safety in state management, and optimizing backend configurations and calculation performance.

## 2. Functional Requirements

### 2.1 Frontend Refactoring & Modularity
*   **Extract Qibla Logic:** Move the bearing calculation from `PrayerManager.svelte.ts` to a new utility file `src/lib/utils/qibla.ts`.
*   **Hijri Month Localization:** Replace the hardcoded English Hijri month names in `PrayerManager.svelte.ts` with a more robust localization approach or a dedicated configuration.
*   **Robust Time Parsing:** Update `PrayerManager.svelte.ts` to handle various time string formats more reliably, avoiding brittle split-based logic.

### 2.2 State Management & Type Safety
*   **Refine Store Interfaces:** Update Svelte stores (`src/lib/store/`) to use specific type definitions, removing the loose `[key: string]: any` index signatures.
*   **Standardize Settings Types:** Ensure durations (like `dhuhrMinutes`) and angles are consistently stored as numeric types in `CalculationSettings` to avoid unnecessary string parsing.

### 2.3 Backend & Calculation Optimizations
*   **Optimize Sun Caching:** Modify the `PrayTime` library to allow persistent sun position caching across multiple days, improving performance for monthly calendar generation.
*   **Investigate Close Event Redundancy:** Analyze the `navigate_to_main` event in `src-tauri/src/lib.rs` to determine if it's truly necessary when the window is hidden, and remove it if redundant.
*   **Review CSP Configuration:** Verify the current `media-src` CSP in `tauri.conf.json` and ensure it follows the principle of least privilege while allowing all required resources.

## 3. Acceptance Criteria
- [ ] Qibla logic is moved to its own utility and verified with unit tests.
- [ ] Hijri months are no longer hardcoded in English.
- [ ] All Svelte stores have strictly defined interfaces.
- [ ] `CalculationSettings` uses consistent numeric types for durations and angles.
- [ ] `PrayTime` sun caching is optimized for multi-day calculations.
- [ ] Unnecessary backend events are identified and cleaned up.
- [ ] Application remains stable and passes all quality checks (`pnpm check`, `pnpm test`).

## 4. Out of Scope
*   Adding new features not mentioned in the findings report.
*   Major UI redesigns.
