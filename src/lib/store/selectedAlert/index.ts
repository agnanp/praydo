import { RuneStore } from "@tauri-store/svelte";

export const selectedAlert = new RuneStore('alert', {alert: {
                                                            subuh: false,
                                                            dzuhur: false,
                                                            ashar: false,
                                                            maghrib: false,
                                                            isya: false,
                                                            }}, {
                                            saveOnChange: true,
                                            saveStrategy: 'debounce',
                                            saveInterval: 1000,
                                            autoStart: true,
                                        });