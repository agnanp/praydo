# Specification: Forced Initial Location Setup

## 1. Overview
This feature introduces a mandatory initial setup flow for first-time users. The application will detect if a location has been configured and, if not, present an onboarding wizard that requires the user to set their location, calculation method, and notification preferences before accessing the main dashboard.

## 2. Functional Requirements

### 2.1 First-Run Detection
*   **Trigger:** The application will check the `selectedLocation` store on startup.
*   **Logic:** If `selectedLocation.state.label` or `selectedLocation.state.id` is empty, the application will enter "Setup Mode".

### 2.2 Onboarding Wizard (UI)
*   **Visibility:** A dedicated onboarding wizard will be displayed if the application is in "Setup Mode".
*   **Strict Blocking:** The wizard will be a full-screen overlay or a forced view that prevents the user from accessing any other part of the application (including the dashboard and standard settings) until the setup is complete.
*   **Steps:**
    1.  **Location Search:** A searchable input field to find and select a location (using the existing Geocode API).
    2.  **Calculation Method:** A selection step for the preferred prayer time calculation method.
    3.  **Notification Preferences:** A step to enable/disable notifications and request necessary permissions.

### 2.3 Completion & Persistence
*   **Save Logic:** Upon completing all steps, the user's choices will be saved to the respective stores (`selectedLocation`, `calculationSettings`, `selectedAlert`).
*   **Exit Setup:** Once valid data is saved, the "Setup Mode" will be deactivated, and the user will be granted access to the main dashboard.

## 3. Technical Requirements
*   **State Management:** Utilize existing Svelte stores for persistence.
*   **UI Components:** Use Skeleton UI components for the wizard interface to maintain consistency.
*   **Router Integration:** Ensure the SvelteKit router correctly handles the forced setup view.

## 4. Acceptance Criteria
- [ ] Application correctly detects an empty location on startup.
- [ ] Onboarding wizard is displayed and blocks access to the dashboard when no location is set.
- [ ] User can successfully search for and select a location within the wizard.
- [ ] User can configure calculation methods and notifications within the wizard.
- [ ] Saving the setup correctly updates the application stores and redirects to the dashboard.
- [ ] Subsequent launches with a valid location bypass the onboarding wizard.

## 5. Out of Scope
*   Automatic geolocation detection (IP-based).
*   Changes to the existing Settings page logic (though the wizard will leverage the same stores).
