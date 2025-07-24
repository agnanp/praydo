# Praydo

<p align="center">
  <img src="static/favicon.png" alt="Praydo app icon" width="128">
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

- [Tauri development prerequisites](https://tauri.app/start/prerequisites/)

### Development

1.  Clone the repository.
2.  Install dependencies:
    ```sh
    pnpm install
    ```
3.  Copy `.env.example` to `.env.development`. The default environment variables should be sufficient for development.
4.  Run the app:
    ```sh
    pnpm tauri dev
    ```

### Building

To build the application, you'll first need to create a `.env.production` file. You can copy `.env.example` for this.

Then, run:
```sh
pnpm tauri build
```

## 🙏 Credits

This application utilizes a third-party API from [myquran.com](https://myquran.com) to fetch prayer schedules. Many thanks to the providers of this data.

## 📄 License

See the [LICENSE](LICENSE) file for details.
