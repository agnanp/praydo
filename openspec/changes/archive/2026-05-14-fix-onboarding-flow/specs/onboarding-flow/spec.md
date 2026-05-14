## ADDED Requirements

### Requirement: Onboarding state is persisted

The system SHALL persist whether the user has completed the onboarding flow, so the wizard is only shown on first launch and subsequent launches bypass it directly to the main app.

#### Scenario: First launch shows onboarding

- **WHEN** the user launches the app for the first time
- **AND** no persisted onboarding state exists
- **THEN** the `onboarding.completed` flag SHALL be `false`
- **AND** the onboarding wizard SHALL be shown

#### Scenario: Subsequent launch skips onboarding

- **WHEN** the user launches the app after completing onboarding
- **AND** `onboarding.completed` is `true`
- **THEN** the onboarding wizard SHALL NOT be shown
- **AND** the main app SHALL render directly

### Requirement: Wizard shows all 3 steps before closing

The onboarding wizard SHALL display 3 steps (Location, Calculation Method, Notifications) and SHALL only close when the user explicitly clicks "Finish" on the final step. Setting a location on step 0 SHALL NOT close the wizard.

#### Scenario: User completes full onboarding

- **WHEN** the user launches the app for the first time
- **THEN** step 0 (Location) SHALL be shown
- **WHEN** the user searches and selects a location
- **THEN** the wizard SHALL remain open
- **AND** the user may click "Next" to proceed to step 1 (Calculation Method)
- **AND** click "Next" to proceed to step 2 (Notifications)
- **WHEN** the user clicks "Finish" on step 2
- **THEN** the wizard SHALL close
- **AND** the main app SHALL be shown
- **AND** `onboarding.completed` SHALL be `true`

#### Scenario: User navigates back through steps

- **WHEN** the user is on step 1 (Calculation Method)
- **AND** clicks "Back"
- **THEN** the wizard SHALL return to step 0 (Location) with the previously selected location intact

### Requirement: Main app renders normally after onboarding

After onboarding completes, the main app SHALL render with the location, calculation method, and notification preferences configured during onboarding. The user may change any of these later in Settings.

#### Scenario: Configured values carry over

- **WHEN** the user completes onboarding with a specific location, calculation method, and notification settings
- **THEN** the main app SHALL use those values immediately
- **AND** they SHALL be persisted across app restarts
