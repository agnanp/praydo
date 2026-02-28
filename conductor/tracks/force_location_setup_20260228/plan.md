# Implementation Plan: Forced Initial Location Setup

## Phase 1: Logic & State Management [checkpoint: 10913c8]
- [x] Task: Implement first-run detection logic
    - [x] Write tests in `src/lib/logic/PrayerManager.test.ts` to verify `isSetupRequired` logic.
    - [x] Implement `isSetupRequired` derived state in `PrayerManager.svelte.ts` based on empty `selectedLocation`.
- [x] Task: Create Onboarding Wizard store (if needed) or reactive state
    - [x] Write tests for wizard step progression logic.
    - [x] Implement reactive state for tracking wizard steps.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Logic & State Management' (Protocol in workflow.md)

## Phase 2: Onboarding Wizard UI [checkpoint: ]
- [x] Task: Create Onboarding Wizard component
    - [x] Write tests for component visibility based on `isSetupRequired`.
    - [x] Implement the `OnboardingWizard.svelte` component with a multi-step layout.
- [x] Task: Implement Step 1: Location Setup
    - [x] Write tests for location search and selection within the component.
    - [x] Implement the location search UI using existing `GeocodeApi`.
- [x] Task: Implement Step 2: Calculation Method
    - [x] Write tests for calculation method selection.
    - [x] Implement the selection UI using `calculationMethods` from the store.
- [x] Task: Implement Step 3: Notifications
    - [x] Write tests for notification toggle and permission handling.
    - [x] Implement the notification setup UI.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Onboarding Wizard UI' (Protocol in workflow.md)

## Phase 3: Integration & Quality Assurance [checkpoint: ]
- [x] Task: Dashboard Blocking Logic
    - [x] Write tests to ensure the dashboard content is replaced by the wizard when setup is required.
    - [x] Integrate the wizard into `src/routes/+page.svelte` or `src/routes/+layout.svelte` to block access.
- [x] Task: Final Saving & Exit Logic
    - [x] Write tests for the final "Finish" action and store persistence.
    - [x] Implement the final save logic and transition out of "Setup Mode".
- [x] Task: Final Quality Verification
    - [x] Run `pnpm check` and ensure zero errors.
    - [x] Run all tests and verify >60% coverage for new modules.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Integration & Quality Assurance' (Protocol in workflow.md)
