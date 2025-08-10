<script lang="ts">
    import {
        Toaster,
        createToaster,
    } from "@skeletonlabs/skeleton-svelte";
    import { onDestroy, onMount } from "svelte";
    import {
        getFormattedDate,
    } from "$lib/formatedDate";
    import {
        isPermissionGranted,
        requestPermission,
    } from "@tauri-apps/plugin-notification";
    import { formattedLocation } from "$lib/utils/stringUtils";
    import { MapPin, Settings, Sunrise } from "@lucide/svelte";
    import { invoke } from "@tauri-apps/api/core";

    import { timeRemaining } from "$lib/store/timeRemaining";
    import { selectedTimes } from "$lib/store/selectedTimes";
    import { playSound } from "$lib/sound";
    import { selectedAlert } from "$lib/store/selectedAlert";
    import { PrayTime } from "$lib/praytime";
    import { selectedLocation } from "$lib/store/selectedLocation";
    import { calculationSettings } from "$lib/store/calculationSettings";
  import { goto } from "$app/navigation";

    // State variables
    let prayTime = $state<PrayTime | null>(null);
    let prayerTimes = $state<Record<string, string>>({});
    let nextPrayerName = $state("");
    let nextPrayerTime = $state("");
    let nextDayPrayerName = $state("");
    let nextDayPrayerTime = $state("");
    let countdown = $state("");
    let currentDay = $state(new Date().getDate());

    const toaster = createToaster({
        placement: "top-end",
    });

    let notificationInterval: ReturnType<typeof setInterval> | null = null;
    let countdownInterval: ReturnType<typeof setInterval> | null = null;

    function initializePrayTime() {
        if (calculationSettings.state.method === 'custom') {
            prayTime = new PrayTime();
            prayTime.location([selectedLocation.state.latitude, selectedLocation.state.longitude]);
            prayTime.format(selectedTimes.state.format);
            prayTime.adjust({
                fajr: calculationSettings.state.fajrAngle,
                dhuhr: calculationSettings.state.dhuhrMinutes,
                asr: calculationSettings.state.asrMethod,
                maghrib: calculationSettings.state.maghrib,
                isha: calculationSettings.state.isha,
                midnight: calculationSettings.state.midnight,
                highLats: calculationSettings.state.highLatitudes,
            });
        } else {
            prayTime = new PrayTime(calculationSettings.state.method);
            prayTime.location([selectedLocation.state.latitude, selectedLocation.state.longitude]);
            prayTime.format(selectedTimes.state.format);
            prayTime.adjust({
                dhuhr: calculationSettings.state.dhuhrMinutes,
                asr: calculationSettings.state.asrMethod,
                highLats: calculationSettings.state.highLatitudes,
            });
        }
    }

    function getPrayerTimes() {
        if (!prayTime) return;
        const now = new Date();
        const times = prayTime.getTimes(now);
        prayerTimes = {
            fajr: times.fajr,
            sunrise: times.sunrise,
            dhuhr: times.dhuhr,
            asr: times.asr,
            maghrib: times.maghrib,
            isha: times.isha,
        };
    }

    function parseTime(timeString: string): Date {
        const now = new Date();
        const [time, modifier] = timeString.split(" ");
        let [hours, minutes] = time.split(":").map(Number);

        if (modifier === "PM" && hours < 12) {
            hours += 12;
        }
        if (modifier === "AM" && hours === 12) {
            hours = 0;
        }

        now.setHours(hours, minutes, 0, 0);
        return now;
    }

    function updateCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        countdownInterval = setInterval(() => {
            if (!prayerTimes) {
                return;
            }

            const now = new Date();
            if (now.getDate() !== currentDay) {
                currentDay = now.getDate();
                getPrayerTimes();
            }

            const prayers = [
                { name: "Fajr", time: prayerTimes.fajr },
                { name: "Sunrise", time: prayerTimes.sunrise },
                { name: "Dhuhr", time: prayerTimes.dhuhr },
                { name: "Asr", time: prayerTimes.asr },
                { name: "Maghrib", time: prayerTimes.maghrib },
                { name: "Isha", time: prayerTimes.isha },
            ].filter(
                (p) =>
                    selectedTimes.state.daily[
                        p.name.toLowerCase() as keyof typeof selectedTimes.state.daily
                    ],
            );

            let nextPrayerFound = false;

            for (const prayer of prayers) {
                const prayerDate = parseTime(prayer.time);

                if (prayerDate > now) {
                    const diff = prayerDate.getTime() - now.getTime();
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor(
                        (diff % (1000 * 60 * 60)) / (1000 * 60),
                    );
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                    countdown = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
                    nextPrayerName = prayer.name;
                    nextPrayerTime = prayer.time;
                    nextPrayerFound = true;
                    break;
                }
            }

            if (!nextPrayerFound) {
                // Handle next day's prayer
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const nextDayPrayerTimes = prayTime?.getTimes(tomorrow) || {};
                const nextDayPrayers = [
                    { name: "Fajr", time: nextDayPrayerTimes.fajr },
                    { name: "Sunrise", time: nextDayPrayerTimes.sunrise },
                    { name: "Dhuhr", time: nextDayPrayerTimes.dhuhr },
                    { name: "Asr", time: nextDayPrayerTimes.asr },
                    { name: "Maghrib", time: nextDayPrayerTimes.maghrib },
                    { name: "Isha", time: nextDayPrayerTimes.isha },
                ].filter(
                    (p) =>
                        selectedTimes.state.daily[
                            p.name.toLowerCase() as keyof typeof selectedTimes.state.daily
                        ],
                );

                if (nextDayPrayers.length > 0) {
                    const nextPrayer = nextDayPrayers[0];
                    nextPrayerName = "";
                    nextPrayerTime = "";
                    nextDayPrayerTime = nextPrayer.time;
                    const prayerDate = parseTime(nextDayPrayerTime);
                    prayerDate.setDate(prayerDate.getDate() + 1);

                    const diff = prayerDate.getTime() - now.getTime();
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor(
                        (diff % (1000 * 60 * 60)) / (1000 * 60),
                    );
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                    countdown = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
                    nextDayPrayerName = nextPrayer.name;
                }
            }
        }, 1000);
    }

    async function sendNMinutesPrayerNotification(
        prayerName: string,
        prayerTime: string,
    ) {
        let permissionGranted = await isPermissionGranted();
        if (!permissionGranted) {
            const permission = await requestPermission();
            permissionGranted = permission === "granted";
        }
        if (permissionGranted) {
            invoke("send_native_notification", {
                title: `${timeRemaining.state.minutes} Minutes Until ${prayerName} Time`,
                body: `${prayerName} ${formattedLocation(selectedLocation.state.label)} ${prayerTime}.`,
            });
        }
        playSound("solemn.mp3");
    }

    async function sendPrayerNotification(
        prayerName: string,
        prayerTime: string,
    ) {
        let permissionGranted = await isPermissionGranted();
        if (!permissionGranted) {
            const permission = await requestPermission();
            permissionGranted = permission === "granted";
        }
        if (permissionGranted) {
            invoke("send_native_notification", {
                title: `${prayerName} Time ${prayerTime}`,
                body: `${prayerName} time in ${formattedLocation(selectedLocation.state.label)}.`,
            });
        }
        const prayer = prayerName.toLowerCase();
        if (
            selectedAlert.state.alert[
                prayer as keyof typeof selectedAlert.state.alert
            ]
        ) {
            if (prayer === "fajr") {
                playSound("adhan-fajr.mp3");
            } else {
                playSound("adhan-makkah.mp3");
            }
        } else {
            playSound("solemn.mp3");
        }
    }

    function startPrayerReminder() {
        if (notificationInterval) {
            clearInterval(notificationInterval);
        }

        notificationInterval = setInterval(() => {
            if (!prayerTimes) {
                return;
            }

            const now = new Date();

            const prayers = [
                { name: "Fajr", time: prayerTimes.fajr },
                { name: "Sunrise", time: prayerTimes.sunrise },
                { name: "Dhuhr", time: prayerTimes.dhuhr },
                { name: "Asr", time: prayerTimes.asr },
                { name: "Maghrib", time: prayerTimes.maghrib },
                { name: "Isha", time: prayerTimes.isha },
            ].filter(
                (p) =>
                    selectedTimes.state.daily[
                        p.name.toLowerCase() as keyof typeof selectedTimes.state.daily
                    ],
            );

            for (const prayer of prayers) {
                const prayerDate = parseTime(prayer.time);
                const nMinutesBefore = new Date(
                    prayerDate.getTime() -
                        timeRemaining.state.minutes * 60 * 1000,
                );

                if (
                    now.getHours() === nMinutesBefore.getHours() &&
                    now.getMinutes() === nMinutesBefore.getMinutes() &&
                    now.getSeconds() === 0
                ) {
                    sendNMinutesPrayerNotification(
                        prayer.name,
                        prayer.time,
                    );
                } else if (
                    now.getHours() === prayerDate.getHours() &&
                    now.getMinutes() === prayerDate.getMinutes() &&
                    now.getSeconds() === 0
                ) {
                    sendPrayerNotification(prayer.name, prayer.time);
                }
            }
        }, 1000); 
    }

    onMount(async () => {
        initializePrayTime();
        getPrayerTimes();
        startPrayerReminder();
        updateCountdown();
    });

    onDestroy(() => {
        if (notificationInterval) {
            clearInterval(notificationInterval);
        }

        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
    });
</script>

<main class="max-w-3xl mx-auto py-20 px-4">
    <Toaster {toaster}></Toaster>
    <div class="flex items-baseline justify-center gap-2">
        <MapPin size="13" />
        <span>{formattedLocation(selectedLocation.state.label)}</span>
    </div>
    <p class="text-center">
        {getFormattedDate()}
    </p>
    <div class="card p-4 preset-filled-primary-500 my-4">
        {#if nextPrayerName}
            <div class="text-center space-y-2">
                <p class="h2">{nextPrayerName} {nextPrayerTime}</p>
                <p class="h5">- {countdown}</p>
            </div>
        {:else}
            <div class="text-center space-y-2">
                <p class="h2">{nextDayPrayerName} {nextDayPrayerTime}</p>
                <p class="h5">- {countdown}</p>
            </div>
        {/if}
    </div>
    <div class="card p-4 preset-filled-surface-100-900 my-4">
        <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
        >
            {#if selectedTimes.state.daily.fajr}
                <div
                    class="card p-4 text-center"
                    class:preset-tonal-primary={nextPrayerName === "Fajr"}
                    class:preset-filled-primary={nextPrayerName !== "Fajr"}
                >
                    <p class="h3">Fajr</p>
                    <p class="text-xl">{prayerTimes.fajr}</p>
                </div>
            {/if}
            {#if selectedTimes.state.daily.sunrise}
                <div
                    class="card p-4 text-center"
                    class:preset-tonal-primary={nextPrayerName === "Sunrise"}
                    class:preset-filled-primary={nextPrayerName !== "Sunrise"}
                >
                    <p class="h3">Sunrise</p>
                    <p class="text-xl">{prayerTimes.sunrise}</p>
                </div>
            {/if}
            {#if selectedTimes.state.daily.dhuhr}
                <div
                    class="card p-4 text-center"
                    class:preset-tonal-primary={nextPrayerName === "Dhuhr"}
                    class:preset-filled-primary={nextPrayerName !== "Dhuhr"}
                >
                    <p class="h3">Dhuhr</p>
                    <p class="text-xl">{prayerTimes.dhuhr}</p>
                </div>
            {/if}
            {#if selectedTimes.state.daily.asr}
                <div
                    class="card p-4 text-center"
                    class:preset-tonal-primary={nextPrayerName === "Asr"}
                    class:preset-filled-primary={nextPrayerName !== "Asr"}
                >
                    <p class="h3">Asr</p>
                    <p class="text-xl">{prayerTimes.asr}</p>
                </div>
            {/if}
            {#if selectedTimes.state.daily.maghrib}
                <div
                    class="card p-4 text-center"
                    class:preset-tonal-primary={nextPrayerName === "Maghrib"}
                    class:preset-filled-primary={nextPrayerName !== "Maghrib"}
                >
                    <p class="h3">Maghrib</p>
                    <p class="text-xl">{prayerTimes.maghrib}</p>
                </div>
            {/if}
            {#if selectedTimes.state.daily.isha}
                <div
                    class="card p-4 text-center"
                    class:preset-tonal-primary={nextPrayerName === "Isha"}
                    class:preset-filled-primary={nextPrayerName !== "Isha"}
                >
                    <p class="h3">Isha</p>
                    <p class="text-xl">{prayerTimes.isha}</p>
                </div>
            {/if}
        </div>
    </div>
    <div class="flex justify-end">
        <button type="button" class="btn-icon hover:preset-tonal-primary" title="Settings" aria-label="Settings" onclick={() => goto('settings')}><Settings size={20} /></button>
    </div>
</main>
