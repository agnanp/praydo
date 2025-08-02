import { RuneStore } from "@tauri-store/svelte";

export const selectedTimes = new RuneStore('times', { daily: {
                                                        imsak: false,
                                                        subuh: true,
                                                        terbit: true,
                                                        dhuha: true,
                                                        dzuhur: true,
                                                        ashar: true,
                                                        maghrib: true,
                                                        isya: true,
                                                      } }, {
                                              saveOnChange: true,
                                              saveStrategy: 'debounce',
                                              saveInterval: 1000,
                                              autoStart: true,
                                            });