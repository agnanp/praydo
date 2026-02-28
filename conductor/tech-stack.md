# Tech Stack: Praydo

## 1. Core Frameworks

- **Tauri 2 (Backend):** A modern desktop application framework that uses a Rust backend to provide a secure and efficient shell for the web-based frontend.
- **SvelteKit 2 / Svelte 5 (Frontend):** A high-performance web framework for building responsive user interfaces, utilizing Svelte 5's modern reactivity features.

## 2. Programming Languages

- **Rust:** Used for the application's core backend logic, system tray integration, and native functionality.
- **TypeScript:** Used for all frontend logic, providing type safety and improving developer productivity.

## 3. UI & Styling

- **Skeleton UI:** A modern component library built specifically for Svelte, providing a clean and responsive interface.
- **Tailwind CSS 4:** A utility-first CSS framework used for rapid and consistent styling of the application's UI components.

## 4. State Management & Data

- **Tauri Store for Svelte:** Used for persistent storage of user settings, including location, calculation methods, and notification preferences.
- **OpenStreetMap (Nominatim):** Leveraged for geocoding and location search capabilities.

## 5. Build & Package Management

- **Vite 6:** The build tool and development server for the frontend.
- **pnpm 10:** The fast and efficient package manager used for managing dependencies.

## 6. Testing

- **Vitest:** A Vite-native unit testing framework for validating application logic.

## 7. Formatting

- **Prettier:** An opinionated code formatter used for maintaining a consistent style across the frontend codebase.
