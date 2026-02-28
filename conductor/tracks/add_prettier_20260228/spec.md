# Specification: Add Prettier for Frontend Formatting

## 1. Overview
The goal of this track is to integrate Prettier into the project's frontend codebase to ensure consistent code style and formatting. This will only cover frontend files (Svelte, TypeScript, CSS, etc.) and ignore the Rust backend.

## 2. Functional Requirements

### 2.1 Configuration
*   **Prettier Rules:**
    - `singleQuote: true`
    - `semi: true`
    - `tabWidth: 2`
    - `useTabs: false`
    - `trailingComma: 'es5'`
*   **Plugins:** Install `prettier-plugin-svelte` to correctly handle Svelte component formatting.
*   **Ignore Patterns:** Ensure `src-tauri` and other backend/build directories are ignored by Prettier.

### 2.2 Automation
*   **Scripts:** Add a `"format": "prettier --write ."` script to `package.json`.
*   **Hooks:** Set up a pre-commit hook (e.g., using `husky` and `lint-staged`) to automatically format changed files before they are committed.

### 2.3 Initial Cleanup
*   **Bulk Format:** Run the format script on the entire frontend codebase to establish a consistent baseline.

## 3. Acceptance Criteria
- [ ] Prettier and its Svelte plugin are installed as dev dependencies.
- [ ] `.prettierrc` and `.prettierignore` files are present in the project root.
- [ ] `pnpm format` successfully formats all frontend files.
- [ ] Pre-commit hook is active and formats staged files automatically.
- [ ] Rust code in `src-tauri` remains untouched by Prettier.

## 4. Out of Scope
*   Formatting or linting the Rust backend code.
*   Major refactoring of existing logic (only formatting changes).
