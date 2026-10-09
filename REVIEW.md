# Code review — praydo @ `635ce09` (v0.6.0)

Scope: whole repo (SvelteKit + Tauri). Verified locally: `pnpm test` → 27 passed, `pnpm check` → 0 errors / 0 warnings. Baseline is healthy; findings below are concentrated in the alert path, which is the app's core promise, plus test/doc gaps.

## 🔴 Bugs

`src-tauri/src/lib.rs:L73` + `src-tauri/tauri.conf.json:L13`: close-to-tray hides the window, and a hidden webview gets suspended — Tauri's default `backgroundThrottling` policy is `suspend`: *"will throttle timers and even unload the whole tab (view) ... after roughly 5 minutes when a view became minimized or hidden. This will pause all tasks until the document's visibility state changes back"*. The 1s `setInterval` in `PrayerManager` then stops, so adhan + notifications never fire while the app sits in the tray. That is the primary flow (autostart + tray), and it fails silently.
Fix: stop scheduling alerts from the webview — run the timer in Rust (`tauri::async_runtime` + `notification()` + `playSound` via an event) so alerts survive suspension. Cheaper stopgap: `"backgroundThrottling": "disabled"` on the window (macOS 14+/iOS 17+ only; no-op on Windows/Linux, per the same schema). Either way, reproduce on a hidden-window macOS build before the next release.

`src/lib/logic/PrayerManager.svelte.ts:L83-90`: `adjustments` always carries `maghrib`/`isha`, and `adjust()` → `set()` → `Object.assign` (`src/lib/praytime/index.ts:L173`) overwrites the method preset. Measured, Jakarta 2026-02-28: `Makkah` Isha `12:43` → `12:22` (90-min rule replaced by 18°), `Tehran` Maghrib `11:27` → `11:13` (4.5° replaced by `"1 min"`).
Fix: send `maghrib`/`isha` only when `method === 'custom'`, else let the method table win.

`src/lib/logic/PrayerManager.svelte.ts:L240`: the notify loop iterates `enabledPrayers`, which is built from the *display* store (`selectedTimes.state.daily`), not `selectedAlert`. Sunrise is in `daily` but absent from `alert` (`src/lib/store/selectedAlert/index.ts:L6`), so every sunrise fires "Sunrise Time" + `solemn.mp3` via the else-branch (`L324`) and cannot be muted; the only way to silence it is to hide Sunrise from the timeline.
Fix: iterate `Object.entries(selectedAlert.state.alert)` and exclude Sunrise from the alert set.

## 🟡 Risks

`src/lib/api/location/GeocodeApi.ts:L24`: `catch` returns a fake `{ok:false,status:500}` instead of throwing, so callers that only test `status === 200` report "No locations found" for a dropped connection and the `catch` at `OnboardingWizard.svelte:L42` is dead code. No timeout either → a hung request pins `isSearching` forever (`settings/+page.svelte:L96`).
Fix: rethrow (or return a typed error), add `AbortController` with ~8s.

`.github/workflows/` + `.husky/pre-commit:L1`: only `release.yml` exists — nothing runs `pnpm check` / `pnpm test` on PRs, and the hook only runs prettier. Broken types and failing tests can reach `main`.
Fix: add a `pull_request` workflow running `pnpm check && pnpm test`, plus a version-sync check across `package.json` / `tauri.conf.json` / `Cargo.toml` (currently hand-maintained, see `.github/workflows/README.md`).

`src/lib/components/OnboardingWizard.svelte:L59-70`: `ensureNotificationPermission()`'s result is discarded, so "Enable all prayer alerts" sets all five flags to `true` even when permission is denied → silent no-op.
Fix: enable only if `granted`, else show inline error and leave flags off.

`src/routes/settings/+page.svelte:L154-167`: numeric inputs are unvalidated (`Number('')` → `0`). `fajrAngle = 999` → `NaN` → every time renders `-----`; `dhuhrMinutes = 600` silently shifts Dhuhr +10h.
Fix: `min`/`max` on the inputs (angle 0–90, minutes 0–60) + clamp in the handlers.

`src/lib/logic/PrayerManager.test.ts:L31`: the `calculationSettings` mock omits `maghrib`/`isha`/`maghribMode`/`ishaMode`, so `createPrayTimeInstance` passes `undefined` into `adjust()` and clobbers the library defaults — Isha collapses onto Maghrib, and the asserted times come from a config that cannot occur in production.
Fix: spread `defaultCalculationSettings` into the mock.

`src/lib/logic/OnboardingManager.test.ts:L2` + `src/lib/i18n/index.ts:L8`: real `RuneStore`s are constructed with no Tauri runtime, so every run prints an unhandled `ReferenceError: window is not defined` from the store constructor; no vitest environment is configured. Tests pass while the store paths are unexercised, and the stderr noise will mask the next genuine failure.
Fix: `test: { environment: 'jsdom' }` (or mock RuneStore) in the vitest config.

`src/routes/+layout.svelte:L22`: the hydration gate has no failure path — `checkAutoStart()` is fire-and-forget and `hooks.error` is unset, so if `load()` rejects, `hydrated` never flips and the app renders an empty window forever with nothing logged.
Fix: set `hooks.error` and add a timeout fallback that renders the app (or an error state).

`src-tauri/tauri.conf.json:L22-26`: the CSP is an object with only `media-src`, and the object form emits exactly the directives listed — no `default-src`, so the policy constrains nothing. This is the only containment layer if anything ever parses attacker-controlled remote data (the geocode response currently flows straight into state).
Fix: add `default-src 'self'` and `connect-src ipc: http://ipc.localhost` (keep the `media-src` entry), then confirm IPC and audio still work in dev.

`.github/workflows/release.yml:L35,L46`: `dtolnay/rust-toolchain@stable` and `tauri-apps/tauri-action@v0` are floating refs in the job that builds the binaries you ship to users — a moved tag ships malware.
Fix: pin both to commit SHAs (dependabot can bump).


## 🔵 Nits

`src/routes/calendar/+page.svelte:L186`: `row.hijriDate.split(',')[0]` — `formatHijriDate` (`src/lib/utils/islamic.ts:L27`) emits no comma, so this is the whole `"11 Ramadan 1447 AH"` dumped into an 11px cell. Fix: `split(' ').slice(0, 2)`, or return `{day, month}` separately.

`src/routes/settings/+page.svelte:L36-43` (same at `src/routes/calendar/+page.svelte:L57-89`): `t()` is evaluated once at module scope, so the reminder dropdown keeps its original language — and the language `<select>` is on that same page. Fix: make `options` / `columns` `$derived`.

`src/routes/+page.svelte:L41` + `src/app.html:L2`: dark mode is applied only in the home route's `onMount`, so reloading `/settings` or `/calendar` snaps back to `data-mode="light"` even when the store says dark. Fix: apply it from `+layout.svelte` (or an inline script in `app.html`).

`src/lib/sound/index.ts:L46` (same pattern `PrayerManager.svelte.ts:L282,L298`): `playSound` is fire-and-forget and `audio.play()` / `readFile` rejections are unhandled (autoplay policy, missing resource) → failure is invisible exactly when it matters; `invoke('send_native_notification', …)` is likewise not awaited inside `async` fns. Fix: preload the three blobs after mount and `.catch` + log both promises.

`src-tauri/src/lib.rs:L38,L42,L48`: `dbg!` left in the tray handlers — stderr noise in release builds. Fix: `log`/`tracing` or delete. Same file `L47`: the "Open" item calls `show()` without `set_focus()`, so the restored window can come up behind others.

`src/lib/logic/PrayerManager.svelte.ts:L269`: `isSameTime` has 0 callers — delete it and the stale comment at `L274-277`.

`src/routes/+page.svelte:L166`: `isNext` matches on name only, so after Isha the timeline highlights today's Fajr while the hero counts down to tomorrow's. Fix: compare the date too (`manager.nextPrayer?.isToday`).

`src-tauri/capabilities/default.json:L13`: `https://api.myquran.com/v2/*` is granted but never used. Fix: drop it — every unused entry widens the blast radius.

`src/lib/logic/PrayerManager.svelte.ts:L105-126,L156-164`: every 1s tick re-runs `getTimes` ×2 plus `toLocaleDateString` and `gregorianToHijri`. Measured 0.35ms per `getTimes`, so ~0.7ms/s (~0.08% CPU) continuously, 24/7 — harmless today, wasteful by construction. Fix: gate those derives on the day changing instead of on `currentTime`.

`GEMINI.md:L102,L107,L125,L158`: stale — documents `.env.example` / `GEOCODE_BASE_URL` (gone; the URL is hardcoded at `GeocodeApi.ts:L3`), the audio dir as root `assets/` (actually `src-tauri/assets`), and "relies on manual testing" (27 tests exist). Also `.github/workflows/README.md` advertises macOS dmg / AppImage and v0.4.3, while the matrix builds deb+rpm+nsis on Ubuntu/Windows only. Fix: refresh — agents treat GEMINI.md as the contract.

## Evidence for the non-obvious claims

1. Makkah/Tehran preset clobbering and the no-comma Hijri format were both executed against the real modules (`new PrayTime('Makkah')…getTimes(2026-02-28)` → `isha 12:43` vs `12:22` after `adjust({isha:18})`; `formatHijriDate(...)` → `"11 Ramadan 1447 AH"`).
2. The suspension behaviour is quoted from the bundled `@tauri-apps/cli/config.schema.json` (`BackgroundThrottlingPolicy`: `suspend` = "usually the default behavior in case no policy is set"; `disabled` / `throttle` are opt-in).
3. The `ReferenceError` in the test logs is reproducible with `pnpm test` and originates in `@tauri-store/shared` calling `invoke` during `RuneStore` construction under Node.
