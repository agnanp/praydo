import { RuneStore } from "@tauri-store/svelte";

export interface LocationData {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  [key: string]: any; // Add index signature for RuneStore compatibility
}

export const selectedLocation = new RuneStore('location', {
  id: "",
  label: "",
  latitude: -6.2088,
  longitude: 106.8456
} as LocationData, {
  saveOnChange: true,
  saveStrategy: 'debounce',
  saveInterval: 1000,
  autoStart: true,
});