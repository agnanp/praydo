import { RuneStore } from "@tauri-store/svelte";

interface Times {
  fajr: boolean;
  sunrise: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}



export type TimeFormat =
  | "24h"
  | "12h"
  | "12H"
  | "x"
  | "X"
  | ((timestamp: number) => string);

interface SelectedTimes {
  daily: Times;
  format: TimeFormat;
  [key: string]: any; // Add index signature for RuneStore compatibility
}

const times: SelectedTimes = {
  daily: {
    fajr: true,
    sunrise: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
  format: "24h",
};

export const selectedTimes = new RuneStore('times', times, 
                                                    {
                                              saveOnChange: true,
                                              saveStrategy: 'debounce',
                                              saveInterval: 1000,
                                              autoStart: true,
                                            });