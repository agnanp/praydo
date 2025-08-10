# Praydo - Muslim Prayer Times Desktop Application

## Project Overview

Praydo is a cross-platform desktop application for displaying Muslim prayer times. It's built using modern web technologies wrapped in a Tauri desktop application shell, allowing it to run natively on Windows, macOS, and Linux.

### Key Features
- Daily prayer times calculation using the PrayTimes.org library
- Location-based prayer times using OpenStreetMap geocoding
- Countdown timer to the next prayer
- Desktop notifications for prayer times
- Customizable calculation methods for different regions
- System tray integration with minimize/close handling
- Autostart functionality

### Technology Stack
- **Frontend**: SvelteKit with TypeScript
- **Backend**: Rust (Tauri)
- **UI Framework**: Skeleton (Svelte component library)
- **State Management**: Tauri Store for Svelte
- **Build System**: Vite
- **Package Manager**: pnpm

## Project Structure

```
praydo/
├── src/                 # SvelteKit frontend source code
│   ├── lib/             # Shared libraries and utilities
│   │   ├── api/         # API clients (geocoding)
│   │   ├── praytime/    # Prayer time calculation library
│   │   ├── store/       # Application state management
│   │   ├── sound/       # Audio playback utilities
│   │   └── utils/       # Helper functions
│   ├── routes/          # SvelteKit pages
│   │   └── settings/    # Settings page
│   └── app.html         # Main HTML template
├── src-tauri/           # Tauri backend (Rust)
│   ├── src/             # Rust source code
│   ├── Cargo.toml       # Rust dependencies
│   └── tauri.conf.json  # Tauri configuration
├── static/              # Static assets
├── assets/              # Audio files (adhan sounds)
├── package.json         # Frontend dependencies and scripts
└── .env.example         # Environment variable template
```

## Core Functionality

### Prayer Time Calculation
The application uses a customized version of the PrayTimes.org library (in `src/lib/praytime/index.ts`) to calculate prayer times. This library supports multiple calculation methods including:
- Muslim World League (MWL)
- Islamic Society of North America (ISNA)
- Egyptian General Authority of Survey
- Umm Al-Qura University, Makkah
- University of Islamic Sciences, Karachi
- Institute of Geophysics, University of Tehran
- Shia Ithna-Ashari (Jafari)
- France (Conseil français du culte musulman)
- Russia
- Singapore
- Lembaga Falakiyah NU, Indonesia (default)

### Location Services
Location data is retrieved using OpenStreetMap's Nominatim service. Users can search for locations which are then geocoded to latitude/longitude coordinates for accurate prayer time calculations.

### State Management
The application uses Tauri Store for Svelte to persist user settings:
- Selected location (latitude, longitude, display name)
- Calculation settings (method, angles, etc.)
- Display preferences (which prayer times to show)
- Notification settings (which prayers to alert for)
- Alert timing (minutes before prayer)

### Desktop Integration
- System tray icon with menu for opening/hiding/quitting
- Native desktop notifications using Tauri's notification plugin
- Autostart capability (configurable in settings)
- Window minimize/close handling that moves the app to system tray

## Development Workflow

### Prerequisites
1. Node.js (v18 or later)
2. Rust and Cargo (latest stable)
3. pnpm package manager
4. Tauri development dependencies (see Tauri documentation)

### Setup
1. Clone the repository
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `.env.development` for local development
4. Run the development server: `pnpm tauri dev`

### Building
1. Create a `.env.production` file (copy from `.env.example`)
2. Build the application: `pnpm tauri build`
3. Distributable files will be in the `src-tauri/target/release/bundle/` directory

### Available Scripts
- `pnpm dev` - Start the Vite development server
- `pnpm build` - Build the frontend for production
- `pnpm tauri dev` - Start the Tauri development environment
- `pnpm tauri build` - Build the Tauri application
- `pnpm check` - Run Svelte type checking

## Configuration

### Environment Variables
The application requires the following environment variable:
- `GEOCODE_BASE_URL`: URL for the geocoding service (default: https://nominatim.openstreetmap.org/search)

### Tauri Configuration
The `tauri.conf.json` file configures:
- Application metadata (name, version, identifier)
- Build settings (dev and build commands, frontend distribution)
- Window properties (title, dimensions)
- Security settings (CSP)
- Bundling options (targets, icons, resources)

## Customization

### Adding New Calculation Methods
New calculation methods can be added by:
1. Adding the method to the `methods` object in `src/lib/praytime/index.ts`
2. Adding the method to the `calculationMethods` array in `src/lib/store/calculationSettings/index.ts`

### Modifying UI
The UI is built with Svelte components:
- Main page: `src/routes/+page.svelte`
- Settings page: `src/routes/settings/+page.svelte`
- Layout: `src/routes/+layout.svelte`

### Adding Sound Files
Audio files are stored in the `assets/` directory and accessed through the Tauri filesystem plugin. New sounds can be added by placing them in this directory and referencing them in the code.

## Testing

Currently, the application relies on manual testing. Future improvements could include:
- Unit tests for the prayer time calculation logic
- Integration tests for the location search functionality
- UI tests for the Svelte components

## Deployment

The application is bundled for distribution using Tauri's built-in bundler, which creates platform-specific installers:
- Windows: MSI installer
- macOS: DMG or App bundle
- Linux: AppImage, Debian package, or RPM package

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Credits

This application uses:
- [PrayTimes.org](http://praytimes.org/) library for prayer time calculations
- [OpenStreetMap](https://www.openstreetmap.org/) for location data
- [Tauri](https://tauri.app/) for desktop application framework
- [SvelteKit](https://kit.svelte.dev/) for frontend framework