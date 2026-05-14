## Purpose

Tracks whether a RuneStore-backed store has completed its initial data load from persistent storage, allowing the app to defer rendering decisions until data is available and avoid flash-of-wrong-state on startup.

## Requirements

### Requirement: Store indicates hydration completion

A RuneStore-backed store SHALL indicate whether it has completed its initial data load from persistent storage via a `hydrated` boolean field.

When the store is first constructed, `hydrated` SHALL be `false`. After the store's async load from disk completes (or returns no data for first-time users), `hydrated` SHALL be `true`.

#### Scenario: Store hydrates from persisted data

- **WHEN** the app starts and a RuneStore has `autoStart: true`
- **AND** the store has previously persisted data on disk
- **THEN** the store's `hydrated` field SHALL be `false` during construction
- **AND** `hydrated` SHALL become `true` after the async load completes and the persisted state is applied

#### Scenario: Store loads with no persisted data (first launch)

- **WHEN** the app starts for the first time
- **AND** no persisted data exists on disk for the store
- **THEN** the store's `hydrated` field SHALL become `true` after the load attempt completes (empty or default state)

### Requirement: App waits for hydration before deciding initial view

The app SHALL defer rendering decisions that depend on store data until all relevant stores have completed hydration. Specifically, the decision to show the onboarding wizard vs. the main app SHALL only be made after the `selectedLocation` store has `hydrated === true`.

#### Scenario: App starts with a configured location

- **WHEN** the app launches
- **AND** `selectedLocation` has `hydrated === false` (still loading)
- **THEN** the app SHALL NOT render either the onboarding wizard or the main content
- **WHEN** `selectedLocation` has `hydrated === true` and `label` and `id` are non-empty
- **THEN** the app SHALL render the main prayer times view

#### Scenario: App starts with no configured location

- **WHEN** the app launches
- **AND** `selectedLocation` has `hydrated === true` and `label` is empty
- **THEN** the app SHALL render the onboarding wizard

### Requirement: Hydration tracking is reusable

The `hydrated` flag pattern SHALL be implementable on any RuneStore without modifying the RuneStore library itself. It SHALL use the existing `hooks.beforeFrontendSync` option available on the RuneStore constructor.

#### Scenario: Apply pattern to a new store

- **WHEN** a new RuneStore needs hydration-aware rendering
- **THEN** adding `hydrated: false` to the initial state and a `beforeFrontendSync` hook that sets `hydrated: true` SHALL be sufficient to track hydration status
