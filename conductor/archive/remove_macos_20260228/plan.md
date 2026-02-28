# Implementation Plan: Remove macOS Support and CI Integration

## Phase 1: Configuration and CI Cleanup [checkpoint: 97875b0]
- [x] Task: Update GitHub Release workflow
    - [x] Remove `macos-latest` job from `.github/workflows/release.yml`
    - [x] Remove macOS-specific steps (DMG signing, notarization) and environment variables
- [x] Task: Update Tauri configuration
    - [x] Remove `dmg` and `app` from `targets` in `src-tauri/tauri.conf.json`
    - [x] Remove `icons/icon.icns` reference from `bundle.icon` in `src-tauri/tauri.conf.json`
- [x] Task: Conductor - User Manual Verification 'Phase 1: Configuration and CI Cleanup' (Protocol in workflow.md)

## Phase 2: Repository Cleanup and Final Verification [checkpoint: ac4229b]
- [x] Task: Remove macOS assets
    - [x] Delete `src-tauri/icons/icon.icns`
- [x] Task: Final Quality Verification
    - [x] Run `pnpm check` to ensure zero frontend errors
    - [x] Run `cd src-tauri && cargo clippy` to ensure Rust backend is lint-free
- [x] Task: Conductor - User Manual Verification 'Phase 2: Repository Cleanup and Final Verification' (Protocol in workflow.md)
