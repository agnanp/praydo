# Specification: Remove macOS Support and CI Integration

## 1. Overview
This track aims to streamline the project by removing all configurations, assets, and CI/CD steps related to the macOS platform. The project will henceforth focus exclusively on Windows and Linux distributions.

## 2. Functional Requirements

### 2.1 GitHub Workflow Cleanup
*   **Remove macOS Job:** Delete the `macos-latest` runner job from `.github/workflows/release.yml`.
*   **Remove macOS Logic:** Remove any steps related to DMG signing, Apple ID notarization, or macOS-specific environment variables.

### 2.2 Tauri Configuration Adjustments
*   **Remove Bundle Targets:** Remove `dmg` and `app` from the `targets` array in `src-tauri/tauri.conf.json`.
*   **Remove Asset References:** Remove the reference to `icons/icon.icns` from the `bundle.icon` array in `src-tauri/tauri.conf.json`.

### 2.3 Repository Cleanup
*   **Delete macOS Assets:** Physically delete macOS-specific files, primarily `src-tauri/icons/icon.icns`, from the repository.

## 3. Acceptance Criteria
- [ ] `.github/workflows/release.yml` no longer contains macOS-related jobs or steps.
- [ ] `src-tauri/tauri.conf.json` does not reference macOS bundle formats or `.icns` files.
- [ ] `src-tauri/icons/icon.icns` is removed from the file system.
- [ ] The GitHub workflow still triggers correctly for Windows and Linux targets.

## 4. Out of Scope
*   Removal of Windows or Linux support.
*   Changes to the application's core functionality or UI.
