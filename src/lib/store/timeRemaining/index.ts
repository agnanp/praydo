import { RuneStore } from "@tauri-store/svelte";

export const timeRemaining = new RuneStore('timeRemaining', {minutes: 5}, {
                                              saveOnChange: true,
                                              saveStrategy: 'debounce',
                                              saveInterval: 1000,
                                              autoStart: true,
                                            });
