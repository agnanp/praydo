# Implementation Plan: Remove macOS Support and CI Integration

## Phase 1: Configuration and CI Cleanup
- [ ] Task: Update GitHub Release workflow
    - [ ] Remove `macos-latest` job from `.github/workflows/release.yml`
    - [ ] Remove macOS-specific steps (DMG signing, notarization) and environment variables
- [ ] Task: Update Tauri configuration
    - [ ] Remove `dmg` and `app` from `targets` in `src-tauri/tauri.conf.json`
    - [ ] Remove `icons/icon.icns` reference from `bundle.icon` in `src-tauri/tauri.conf.json`
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Configuration and CI Cleanup' (Protocol in workflow.md)

## Phase 2: Repository Cleanup and Final Verification
- [ ] Task: Remove macOS assets
    - [ ] Delete `src-tauri/icons/icon.icns`
- [ ] Task: Final Quality Verification
    - [ ] Run `pnpm check` to ensure zero frontend errors
    - [ ] Run `cd src-tauri && cargo clippy` to ensure Rust backend is lint-free
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Repository Cleanup and Final Verification' (Protocol in workflow.md)
