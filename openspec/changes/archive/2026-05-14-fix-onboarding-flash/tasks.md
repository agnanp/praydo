## 1. Store: Add hydration tracking to selectedLocation

- [x] 1.1 Add `hydrated: false` to the initial state in `src/lib/store/selectedLocation/index.ts`
- [x] 1.2 Wire the `beforeFrontendSync` hook to set `hydrated: true` after backend load completes
- [x] 1.3 Investigate and handle the first-time-user edge case: verify whether `beforeFrontendSync` fires when no persisted data exists on disk; if not, add a fallback (confirmed: Rust `load` always returns store state via `store.state().clone()`, so `beforeFrontendSync` fires on every load including first launch)

## 2. PrayerManager: Update setup check logic

- [x] 2.1 Add `isHydrated` derived to `PrayerManager` and use it in layout to defer rendering during hydration — `isSetupRequired` stays as-is (just checks location)

## 3. Layout: Handle loading state gracefully

- [x] 3.1 Update `src/routes/+layout.svelte` with three-state logic: loading → onboarding → main content

## 4. Testing

- [x] 4.1 Update PrayerManager tests to cover the hydration flow: test `isHydrated` derived and that `isSetupRequired` waits for `hydrated` before showing onboarding
- [x] 4.2 Manually verify on the running app that the flash no longer occurs on startup with a configured location

## 5. Verify

- [x] 5.1 Run the existing test suite to confirm nothing is broken — 25/25 tests pass
- [x] 5.2 Build the app and verify no layout shifts or regressions on first launch (no location configured)
