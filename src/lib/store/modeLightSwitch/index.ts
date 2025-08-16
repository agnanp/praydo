import { RuneStore } from "@tauri-store/svelte";

export const modeLightSwitch = new RuneStore('modeLightSwitch', { mode: 'light', }, {
  saveOnChange: true,
  saveStrategy: 'debounce',
  saveInterval: 1000,
  autoStart: true,
});