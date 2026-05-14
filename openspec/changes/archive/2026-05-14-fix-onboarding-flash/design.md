## Context

Praydo uses `@tauri-store/svelte` (`RuneStore`) to persist user settings to disk via Tauri's filesystem plugin. When the app starts:

1. `RuneStore` constructor sets `this.state` to the provided defaults **synchronously**
2. `checkAutoStart()` is fire-and-forget — it invokes a **Tauri IPC call** (`invoke("plugin:svelte|load", ...)`) to load persisted data from disk
3. When the IPC resolves, `patchSelf()` calls `Object.assign(this.state, loadedState)` — updating the reactive state

Between steps 1 and 3, the store holds default values. For `selectedLocation`, that means `{ id: '', label: '' }`. The `isSetupRequired` derived value in `PrayerManager` checks `!label || !id`, which evaluates to `true` during that window — causing the onboarding wizard to render briefly before the main app appears.

This is not a RuneStore bug — it's a design pattern issue. The app doesn't track whether stores have hydrated, so it can't distinguish "still loading" from "no data configured."

## Goals / Non-Goals

**Goals:**
- Eliminate the flash of the onboarding wizard on subsequent app launches
- Distinguish "not yet hydrated" from "no location configured" in the rendering logic
- Keep the fix minimal and self-contained (no new dependencies)
- The solution should be reusable for other RuneStores that gate initial rendering

**Non-Goals:**
- Not modifying the RuneStore library itself
- Not adding a global loading/splash screen (the fix should be surgical)
- Not changing the RuneStore persistence mechanism
- Not refactoring the entire layout/store architecture

## Decisions

### Decision 1: Use a `hydrated` flag on the store state via `beforeFrontendSync` hook

The `RuneStore` constructor accepts a `hooks` option with a `beforeFrontendSync` callback. This fires every time the backend pushes state to the frontend — including the initial `load()`. By adding a `hydrated: boolean` field to the store's initial state, and having `beforeFrontendSync` set it to `true`, we get:

```ts
// Initial state: { id: '', label: '', hydrated: false }
// After load():    { id: 'jakarta-1', label: 'Jakarta, Indonesia', hydrated: true }
```

**Alternatives considered:**

| Approach | Pros | Cons |
|---|---|---|
| `hydrated` flag via hook ✅ | Simple, uses existing RuneStore API, no new abstractions | `hydrated` gets persisted to disk (minor) |
| `$effect` + timeout in layout | No store changes needed | Race condition, fragile timing, magic numbers |
| Wait for IPC in `onMount` | No store changes | Doesn't guarantee IPC has completed |
| Custom wrapper around RuneStore | Clean API | Overengineering for a simple problem |

### Decision 2: Update `isSetupRequired` to check `hydrated` first

Instead of:
```ts
isSetupRequired = $derived(!label || !id)
```

It becomes:
```ts
needSetup = $derived(hydrated && !label && !id)
// Or: loading = $derived(!hydrated); show setup if ready && no location
```

This ensures that during the hydration window (when `hydrated` is `false`), the app doesn't render either the onboarding or the main view — it shows nothing (or an inert placeholder).

### Decision 3: Pattern for other stores

The same `hydrated` flag + `beforeFrontendSync` hook pattern can be applied to any RuneStore where the app needs to wait for hydration before making rendering decisions. Currently only `selectedLocation` is needed, but the pattern is documented for future use.

## Risks / Trade-offs

- **[Low] `hydrated` field is persisted**: The `hydrated: true` value will be saved to the JSON file on disk. This is harmless — it's a single boolean and has no behavioral effect beyond the first load.
- **[Low] First-time users**: On first launch, no persisted data exists. The IPC `load()` returns an empty/none value, so `patchSelf` never fires, meaning `hydrated` stays `false` forever for first-time users.  
  **Mitigation**: The store needs an additional mechanism — either `beforeFrontendSync` fires with the default state even on first load, or we add a timeout fallback that flips `hydrated` after a short delay. We need to verify RuneStore's behavior on first load.
- **[Low] Race on rapid re-renders**: Svelte's `$derived` is lazy, so the first render sees `hydrated: false` regardless. The component tree briefly has no content, which is invisible to the user (no flash).
