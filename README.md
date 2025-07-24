# Adzan

<p align="center">
  <img src="static/favicon.png" alt="Adzan app icon" width="128">
</p>

<p align="center">
  A simple, modern, and cross-platform desktop application for Muslim prayer times.
</p>

---

## ✨ Features

- **Daily Prayer Times**: View daily prayer schedules including Imsak, Subuh, Terbit, Dhuha, Dzuhur, Ashar, Maghrib, and Isya.
- **Location Based**: Search for your location to get accurate prayer times.
- **Next Prayer Countdown**: See how much time is left until the next prayer.
- **Desktop Notifications**: Get notified on your desktop when it's time for prayer.

## 🛠️ Built With

- [Tauri](https://tauri.app/)
- [SvelteKit](https://kit.svelte.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Rust](https://www.rust-lang.org/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) & [pnpm](https://pnpm.io/installation)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri development prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)

### Development

1.  Clone the repository.
2.  Install dependencies:
    ```sh
    pnpm install
    ```
3.  Create a `.env.development` file for environment variables.
4.  Run the app:
    ```sh
    pnpm tauri dev
    ```

### Building

To build the application, run:
```sh
pnpm tauri build
```

## 🙏 Credits

This application utilizes a third-party API to fetch prayer schedules. Many thanks to the providers of this data.

## 📄 License

See the [LICENSE](LICENSE) file for details.
