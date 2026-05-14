## Why

The onboarding wizard has 3 steps (Location, Calculation Method, Notifications) but closes immediately after step 0. The layout gates the wizard on `isSetupRequired`, which flips to `false` as soon as a location is selected. The user never sees the calculation method or notification steps, leaving them with defaults they may not want.

## What Changes

- Decouple the onboarding wizard's lifecycle from `isSetupRequired` by introducing a persisted `onboardingCompleted` flag
- The wizard now controls when it closes — only when the user clicks "Finish" on step 2
- All 3 steps are shown on first launch: Location → Calculation Method → Notifications → Finish
- A new small RuneStore persists the completion state across app restarts
- The layout gates the wizard on `!onboardingCompleted` instead of `isSetupRequired`

## Capabilities

### New Capabilities
- `onboarding-flow`: Manages the multi-step onboarding wizard lifecycle, ensuring all setup steps (location, calculation method, notifications) are completed before the main app is shown

### Modified Capabilities
- *(none — existing specs unchanged)*

## Impact

- **New file**: `src/lib/store/onboarding/index.ts` — RuneStore to persist `{ completed: boolean }`
- **Modified files**: `OnboardingManager.svelte.ts` (add `complete()` + `isComplete`), `OnboardingWizard.svelte` (wire Finish button), `+layout.svelte` (change gating condition)
- **No API or dependency changes**
- **Backwards compatible**: existing persisted data unaffected; new field only created on first launch
