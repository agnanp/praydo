# Implementation Plan: Forced Initial Location Setup

## Phase 1: Logic & State Management
- [x] Task: Implement first-run detection logic
    - [x] Write tests in `src/lib/logic/PrayerManager.test.ts` to verify `isSetupRequired` logic.
    - [x] Implement `isSetupRequired` derived state in `PrayerManager.svelte.ts` based on empty `selectedLocation`.
- [~] Task: Create Onboarding Wizard store (if needed) or reactive state
    - [ ] Write tests for wizard step progression logic.
    - [ ] Implement reactive state for tracking wizard steps.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Logic & State Management' (Protocol in workflow.md)

## Phase 2: Onboarding Wizard UI
- [ ] Task: Create Onboarding Wizard component
    - [ ] Write tests for component visibility based on `isSetupRequired`.
    - [ ] Implement the `OnboardingWizard.svelte` component with a multi-step layout.
- [ ] Task: Implement Step 1: Location Setup
    - [ ] Write tests for location search and selection within the component.
    - [ ] Implement the location search UI using existing `GeocodeApi`.
- [ ] Task: Implement Step 2: Calculation Method
    - [ ] Write tests for calculation method selection.
    - [ ] Implement the selection UI using `calculationMethods` from the store.
- [ ] Task: Implement Step 3: Notifications
    - [ ] Write tests for notification toggle and permission handling.
    - [ ] Implement the notification setup UI.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Onboarding Wizard UI' (Protocol in workflow.md)

## Phase 3: Integration & Quality Assurance
- [ ] Task: Dashboard Blocking Logic
    - [ ] Write tests to ensure the dashboard content is replaced by the wizard when setup is required.
    - [ ] Integrate the wizard into `src/routes/+page.svelte` or `src/routes/+layout.svelte` to block access.
- [ ] Task: Final Saving & Exit Logic
    - [ ] Write tests for the final "Finish" action and store persistence.
    - [ ] Implement the final save logic and transition out of "Setup Mode".
- [ ] Task: Final Quality Verification
    - [ ] Run `pnpm check` and ensure zero errors.
    - [ ] Run all tests and verify >60% coverage for new modules.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Integration & Quality Assurance' (Protocol in workflow.md)
