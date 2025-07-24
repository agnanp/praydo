import { RuneStore } from "@tauri-store/svelte";

export const selectedLocationId = new RuneStore('locationId', { id: ["1301"] }, {
                                              saveOnChange: true,
                                              saveStrategy: 'debounce',
                                              saveInterval: 1000,
                                            });

export const selectedLocationLabel = new RuneStore('locationLabel', { label: "" }, {
                                              saveOnChange: true,
                                              saveStrategy: 'debounce',
                                              saveInterval: 1000,
                                            });