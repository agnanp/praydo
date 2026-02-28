# Specification: Remove .env Usage and Hardcode Public API URL

## 1. Overview
The goal of this track is to simplify the project configuration by removing the dependency on environment variables for the public geocoding API URL. Since the URL is public and static, hardcoding it as a constant within the source code will reduce setup complexity.

## 2. Functional Requirements
*   **Hardcode API URL:** Define `GEOCODE_BASE_URL` as a constant in `src/lib/api/location/GeocodeApi.ts`.
    - URL: `https://nominatim.openstreetmap.org/search`
*   **Remove .env dependency:** Ensure the application logic no longer attempts to read from process environment variables for this URL.
*   **Cleanup Files:** Permanently delete `.env.example` from the repository.

## 3. Non-Functional Requirements
*   **Maintainability:** Using a named constant ensures the URL is still easy to find and update if needed.
*   **Simplicity:** Reduces the number of configuration files required for local development and production builds.

## 4. Acceptance Criteria
- [ ] `GEOCODE_BASE_URL` is hardcoded in `src/lib/api/location/GeocodeApi.ts`.
- [ ] `.env.example` is deleted from the project root.
- [ ] The application correctly uses the hardcoded URL for geocoding requests.
- [ ] No regressions in geocoding functionality.

## 5. Out of Scope
*   Adding new environment variables.
*   Modifying the geocoding logic itself (beyond the URL source).
