## Context

The onboarding wizard (`OnboardingWizard.svelte`) has 3 steps — Location, Calculation Method, Notifications — and an `OnboardingManager` with `nextStep()`/`prevStep()` to navigate them. However, the wizard's visibility is gated by `isSetupRequired` in `+layout.svelte`, which checks `!selectedLocation.state.label || !selectedLocation.state.id`. As soon as the user selects a location on step 0, this flips to `false` and the wizard unmounts. Steps 1 and 2 are never rendered.

The wizard's "Finish" button on step 2 has an empty `onclick` handler, relying on the reactive collapse to close it — which happens prematurely.

## Goals / Non-Goals

**Goals:**
- Show all 3 onboarding steps (Location, Method, Notifications) on first launch
- The wizard only closes when the user clicks "Finish" on the last step
- Persist the onboarding completion state so it doesn't show again on subsequent launches
- Keep the fix minimal — no new dependencies, no refactoring of the wizard's internal step logic

**Non-Goals:**
- Not redesigning the entire onboarding UX (keeping the current 3-step layout and content)
- Not modifying the Settings page or store behavior for location/method/notifications
- Not adding animations or splash screens

## Decisions

### Decision 1: Persist onboarding completion with a new RuneStore

A small RuneStore `onboarding` with `{ completed: false }` tracks whether the user has finished onboarding. Using RuneStore means it auto-persists to disk via Tauri's filesystem plugin, surviving app restarts.

**Alternatives considered:**

| Approach | Pros | Cons |
|---|---|---|
| New RuneStore ✅ | Clean separation, auto-persisted, no schema pollution | Extra store file (minor) |
| Add `onboardingCompleted` to `selectedLocation` store | One less file | Semantically wrong — location store shouldn't hold onboarding state |
| Derive from existing state (e.g., "completed if location set") | No persistence needed | Doesn't solve the problem — wizard would still close on location select |

### Decision 2: Layout gates on `!onboardingCompleted` instead of `isSetupRequired`

Instead of:
```svelte
{#if prayerManager.isSetupRequired}
  <OnboardingWizard />
{/if}
```

Use:
```svelte
{#if !onboardingState.state.completed}
  <OnboardingWizard />
{/if}
```

This decouples the wizard from the location store. The wizard stays open through all 3 steps regardless of when the location is populated.

### Decision 3: Finish button calls `complete()` on the onboarding store

The Finish button in step 2 sets `onboardingState.state.completed = true`. The reactive layout picks this up and switches to the main app. No need for event callbacks or props.

### Decision 4: Layout retains `isHydrated` check for loading state

The three-state layout stays:
1. `!hydrated` → show nothing (loading)
2. `!completed` → show onboarding wizard for all 3 steps
3. Otherwise → render main app

## Risks / Trade-offs

- **[Low] User closes app mid-onboarding**: If the user closes the app after step 0 (location set) but before clicking Finish, `onboardingCompleted` is still `false`. On next launch, the wizard appears again starting from step 0 (fresh `OnboardingManager`), but the location is already populated. User clicks Next → Method → Next → Notifications → Finish. Acceptable.
- **[Low] User clears location in Settings after onboarding**: If a returning user clears their location in Settings, the main app renders with default coordinates. They can search for a new location in the Settings tab directly. No regression — this is the same behavior as today.
- **[None] Persistence race**: The `completed` flag is set synchronously in the store and persisted asynchronously via RuneStore's debounced save. If the app crashes immediately after clicking Finish, the flag might not be saved. On next launch, the wizard appears again. Mitigation: low-probability event, and the UX is acceptable (wizard shows once more, but location is already populated).
