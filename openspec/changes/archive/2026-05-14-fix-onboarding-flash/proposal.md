## Why

When the app starts with a location already configured, the onboarding wizard briefly flashes before the main UI appears. This happens because RuneStores initialize with default values synchronously, then asynchronously hydrate from disk via Tauri IPC. The `isSetupRequired` check reads the empty defaults before hydration completes, briefly rendering the onboarding wizard.

This is a UX polish issue — it feels broken on every app launch.

## What Changes

- Add a `hydrated` tracking mechanism to RuneStore-backed stores so the app can distinguish "still loading" from "no data configured"
- Update `isSetupRequired` (or the layout logic) to wait for hydration before deciding which view to show
- Apply this pattern to any store that gates initial app rendering (at minimum: `selectedLocation`)

## Capabilities

### New Capabilities
- `hydration-state`: Tracks whether a RuneStore has completed its initial load from persistent storage, allowing the app to defer rendering decisions until data is available

### Modified Capabilities
- *(none — no existing specs to modify)*

## Impact

- **Affected stores**: `selectedLocation` (and potentially the pattern should be replicable for other RuneStores)
- **Affected files**: `src/lib/store/selectedLocation/index.ts`, `src/routes/+layout.svelte`, `src/lib/logic/PrayerManager.svelte.ts`
- **No API or dependency changes**
- **Backwards compatible**: existing persisted data is unchanged
