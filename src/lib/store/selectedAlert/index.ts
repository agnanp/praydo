import { RuneStore } from "@tauri-store/svelte";

export const selectedAlert = new RuneStore('alert', {alert: {
                                                            fajr: false,
                                                            dhuhr: false,
                                                            asr: false,
                                                            maghrib: false,
                                                            isha: false,
                                                            }}, {
                                            saveOnChange: true,
                                            saveStrategy: 'debounce',
                                            saveInterval: 1000,
                                            autoStart: true,
                                        });