# Code Review Findings: Praydo

## Phase 1: Core Code Review

### 1. Frontend Logic and State Management (`src/lib/store/`, `src/lib/logic/`, `src/lib/utils/`)

#### Findings:
*   **Notification Reliability (`PrayerManager.svelte.ts`):**
    - The `checkNotifications` method uses exact second comparison (`isSameTime`). If the application loop skips a second (e.g., due to system load or hibernation), notifications for that second may be missed.
    - *Recommendation:* Implement a more robust check that tracks the "last checked" time or ensures notifications are triggered when the current time *crosses* a target prayer time.
*   **Hardcoded Values (`PrayerManager.svelte.ts`):**
    - `islamicDate` derivation uses hardcoded English month names.
    - *Recommendation:* Consider using a localization-aware approach or move these strings to a configuration file.
*   **Embedded Business Logic (`PrayerManager.svelte.ts`):**
    - `qiblaDirection` calculation is embedded within the manager class.
    - *Recommendation:* Extract this calculation to a separate utility (e.g., `src/lib/utils/qibla.ts`) for better testability and reuse.
*   **Type Safety in Stores:**
    - Several stores use `[key: string]: any` to satisfy `RuneStore` requirements.
    - *Recommendation:* Evaluate if more specific indexing or a better interface design can avoid `any`.
*   **Inconsistent Data Types (`CalculationSettings`):**
    - `dhuhrMinutes` is a string (e.g., `'1 min'`), while other similar settings might be numeric.
    - *Recommendation:* Standardize on numeric types for durations or angles where possible.
*   **Time Parsing Assumption (`PrayerManager.svelte.ts`):**
    - `parseTime` assumes a specific time string format (splitting by space and colon). It may break if the calculation library returns times in a different format (e.g., 24-hour without AM/PM).
    - *Recommendation:* Use a more robust date-time parsing library or ensure the format is strictly controlled.
*   **Testing:**
    - The core application logic in `PrayerManager` currently lacks unit tests.
    - *Recommendation:* Implement tests for the countdown timer, prayer time derivation, and notification trigger logic.

### 2. Prayer Time Calculation and Geocoding (`src/lib/praytime/`, `src/lib/api/location/`)

#### Findings:
*   **Geocoding Error Handling (`GeocodeApi.ts`):**
    - The `geocode` function returns the fetch promise directly without checking for `response.ok` or handling network errors.
    - *Recommendation:* Implement proper error handling to catch network failures or non-200 API responses.
*   **Hardcoded Geocoding Limit (`GeocodeApi.ts`):**
    - The search result limit is hardcoded to `"1"`.
    - *Recommendation:* Consider allowing the user to see multiple results to choose the most accurate location.
*   **Implicit UTC Offset Logic (`index.ts`):**
    - The `utcOffset` method in `PrayTime` has a "clever" check: `if (Math.abs(utcOffset) < 16) utcOffset *= 60;`. This assumes small numbers are hours and large ones are minutes.
    - *Recommendation:* Use more explicit parameters or separate methods for hours vs. minutes to avoid ambiguity.
*   **Sun Position Caching (`index.ts`):**
    - `sunPositionCache` is cleared at the beginning of every `computeTimes` call.
    - *Recommendation:* If calculating multiple days (e.g., for a monthly calendar), persistent caching across days could slightly improve performance.
*   **Invalid Time Representation (`index.ts`):**
    - `formatTime` returns `"----"` for `NaN` timestamps.
    - *Recommendation:* Ensure the UI and `PrayerManager` can gracefully handle this placeholder string without crashing.

### 3. Tauri Backend and Project Configuration (`src-tauri/`, `package.json`)

#### Findings:
*   **Unsafe Error Handling in Rust (`lib.rs`):**
    - The `send_native_notification` command and tray icon builder use `.unwrap()`. This can cause the backend to crash if an error occurs (e.g., if notifications are disabled or the icon fails to load).
    - *Recommendation:* Use proper error handling with `Result` and return errors to the frontend where appropriate.
*   **Necessary Notification Command (`lib.rs`):**
    - The custom `send_native_notification` command in Rust is used because the standard JavaScript notification plugin does not function correctly when the application is minimized to the system tray.
    - *Recommendation:* Keep the command but add a comment in `lib.rs` explaining this specific limitation to avoid future confusion.
*   **Boilerplate Code (`lib.rs`):**
    - The `greet` command remains in the codebase.
    - *Recommendation:* Remove unused boilerplate commands to keep the backend clean.
*   **Redundant State Reset on Close (`lib.rs`):**
    - `navigate_to_main` is emitted every time the window is hidden via the close button.
    - *Recommendation:* Ensure this is actually required by the frontend, otherwise it might cause unnecessary navigation when the app is restored from the tray.
*   **Bundle Identifier (`tauri.conf.json`):**
    - The identifier is set to `"praydo"`.
    - *Recommendation:* Use a more unique, reverse-domain style identifier (e.g., `id.my.apr.praydo`) to avoid potential conflicts and follow platform conventions.
*   **CSP Verification (`tauri.conf.json`):**
    - A CSP is defined for `media-src`.
    - *Recommendation:* Periodically review the CSP to ensure it remains restrictive while allowing all necessary local and remote resources.
