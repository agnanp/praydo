## 1. Create onboarding persistence store

- [x] 1.1 Create `src/lib/store/onboarding/index.ts` with a new RuneStore `onboarding` that has `{ completed: false, hydrated: false }`, with `saveOnChange: true`, `autoStart: true`, and `beforeFrontendSync` hook for hydration tracking

## 2. Update OnboardingManager to expose completion

- [x] 2.1 Add `isComplete = $state(false)` to `OnboardingManager.svelte.ts`
- [x] 2.2 Add a `complete()` method that sets `isComplete = true` AND sets `onboardingState.state.completed = true`

## 3. Wire wizard Finish button

- [x] 3.1 In `OnboardingWizard.svelte`, import the `onboarding` store
- [x] 3.2 Wire the Finish button's `onclick` to call `manager.complete()` instead of having an empty handler

## 4. Update layout gating

- [x] 4.1 In `+layout.svelte`, import the `onboarding` store
- [x] 4.2 Change the wizard gating condition from `prayerManager.isSetupRequired` to `!onboardingState.state.completed`
- [x] 4.3 Retain the `!prayerManager.isHydrated` loading state check
- [x] 4.4 Updated `PrayerManager.isHydrated` to check both `selectedLocation.hydrated` and `onboardingState.hydrated`

## 5. Testing

- [x] 5.1 Update tests to cover the new onboarding persistence flow
- [x] 5.2 Run the existing test suite to confirm nothing is broken — 27/27 tests pass

## 6. Verify

- [x] 6.1 Manually verify the full 3-step onboarding flow end-to-end
- [x] 6.2 Verify that subsequent launches skip directly to the main app
- [x] 6.3 Verify that the hydration fix (onboarding flash) still works correctly
