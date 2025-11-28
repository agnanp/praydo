<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import {
        getFormattedDate,
    } from "$lib/formatedDate";
    import {
        isPermissionGranted,
        requestPermission,
    } from "@tauri-apps/plugin-notification";
    import { formattedLocation } from "$lib/utils/stringUtils";
    import { MapPin, Settings, Sunrise, Sunset, Sun, Moon, Compass } from "@lucide/svelte";
    import { invoke } from "@tauri-apps/api/core";

    import { timeRemaining } from "$lib/store/timeRemaining";
    import { selectedTimes } from "$lib/store/selectedTimes";
    import { playSound } from "$lib/sound";
    import { selectedAlert } from "$lib/store/selectedAlert";
    import { PrayTime } from "$lib/praytime";
    import { selectedLocation } from "$lib/store/selectedLocation";
    import { calculationSettings } from "$lib/store/calculationSettings";
    import { goto } from "$app/navigation";
    import { sleep } from "$lib/utils/sleep";
  import { modeLightSwitch } from "$lib/store/modeLightSwitch";
    import { gregorianToHijri } from '@tabby_ai/hijri-converter';

    // State variables
    let prayTime = $state<PrayTime | null>(null);
    let prayerTimes = $state<Record<string, string>>({});
    let nextPrayerName = $state("");
    let nextPrayerTime = $state("");
    let nextDayPrayerName = $state("");
    let nextDayPrayerTime = $state("");
    let countdown = $state("");
    let currentDay = $state(new Date().getDate());

    let notificationInterval: ReturnType<typeof setInterval> | null = null;
    let countdownInterval: ReturnType<typeof setInterval> | null = null;
    let currentTime = $state(new Date());

    // Update current time every second
    let currentTimeInterval: ReturnType<typeof setInterval> | null = null;

    // Helper function to get icon for each prayer
    function getPrayerIcon(prayerName: string) {
        switch (prayerName.toLowerCase()) {
            case 'fajr':
                return Moon;
            case 'sunrise':
                return Sunrise;
            case 'dhuhr':
                return Sun;
            case 'asr':
                return Sun;
            case 'maghrib':
                return Sunset;
            case 'isha':
                return Moon;
            default:
                return Sun;
        }
    }

    // Helper function to get Islamic date using Hijri calendar
    function getIslamicDate() {
        const now = new Date();
        const hijriDate = gregorianToHijri({
            year: now.getFullYear(),
            month: now.getMonth() + 1, // JavaScript months are 0-indexed
            day: now.getDate()
        });

        // Hijri month names (in order 1-12)
        const hijriMonths = [
            'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
            'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
            'Ramadan', 'Shawwal', 'Dhul-Qadah', 'Dhul-Hijjah'
        ];

        const monthName = hijriMonths[hijriDate.month - 1];
        return `${hijriDate.day} ${monthName} ${hijriDate.year} AH`;
    }

    // Helper function to determine prayer status
    function getPrayerStatus(prayerName: string) {
        if (prayerName === nextPrayerName) return 'next';
        const timeString = prayerTimes[prayerName.toLowerCase()];
        if (!timeString) return 'upcoming'; // Default to upcoming if time not yet loaded
        const now = new Date();
        const prayerDate = parseTime(timeString);
        return prayerDate < now ? 'passed' : 'upcoming';
    }

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
        if (!timeString) return now; // Return current time if undefined

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
                body: `${prayerName} Time: ${prayerTime}.`,
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

    onMount(() => {
        (async () => {
            await sleep(50);
            document.documentElement.setAttribute('data-mode', modeLightSwitch.state.mode);
            initializePrayTime();
            getPrayerTimes();
            startPrayerReminder();
            updateCountdown();

            // Update current time every second
            currentTimeInterval = setInterval(() => {
                currentTime = new Date();
            }, 1000);
        })();
    });

    onDestroy(() => {
        if (notificationInterval) {
            clearInterval(notificationInterval);
        }

        if (countdownInterval) {
            clearInterval(countdownInterval);
        }

        if (currentTimeInterval) {
            clearInterval(currentTimeInterval);
        }
    });
</script>

<div class="w-full h-screen bg-surface-50-950 relative overflow-hidden">

    <!-- Decorative background blobs -->
    <div class="absolute inset-0 z-0 pointer-events-none">
        <div class="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary-400/20 dark:bg-primary-600/10 blur-[100px] animate-pulse-slow"></div>
        <div class="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-success-400/20 dark:bg-success-600/10 blur-[100px] animate-pulse-slow" style="animation-delay: 1000ms;"></div>
    </div>

    <!-- Main Container - Bento Grid Layout -->
    <div class="relative z-10 w-full h-full preset-glass-surface shadow-2xl p-6 flex flex-col gap-6">

        <!-- Top Section: Hero + Widgets -->
        <div class="flex-1 grid grid-cols-12 gap-6 min-h-0">

            <!-- Large Hero Card (Next Prayer) -->
            <div class="card col-span-8 preset-gradient-primary shadow-xl shadow-primary-500/20 dark:shadow-primary-600/10 transition-all duration-500 hover:shadow-primary-500/30">


                <div class="relative z-10 h-full p-8 flex flex-col justify-between">
                    <div class="flex justify-between items-start">
                        <span class="px-3 py-1 rounded-full bg-black/10 border border-white/10 text-white text-xs font-bold tracking-wider uppercase backdrop-blur-md">
                            Next Prayer
                        </span>
                    </div>

                    <div class="text-center space-y-2">
                        {#if countdown}
                            <h1 class="text-7xl font-bold text-white tracking-tighter drop-shadow-sm">
                                {countdown.split(':')[0]}:{countdown.split(':')[1]}<span class="text-white/40 text-4xl font-light">:{countdown.split(':')[2]}</span>
                            </h1>
                            <p class="text-emerald-50 text-sm font-medium tracking-widest uppercase">
                                Remaining until {nextPrayerName || nextDayPrayerName}
                            </p>
                        {/if}
                    </div>

                    <div class="flex justify-between items-end">
                        {#if nextPrayerName}
                            {@const PrayerIcon = getPrayerIcon(nextPrayerName)}
                            <div>
                                <h2 class="text-3xl font-bold text-white">{nextPrayerName}</h2>
                                <p class="text-emerald-100 font-mono">{nextPrayerTime}</p>
                            </div>
                            <div class="bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/20 shadow-inner">
                                <PrayerIcon class="text-white w-8 h-8" />
                            </div>
                        {:else}
                            {@const PrayerIcon = getPrayerIcon(nextDayPrayerName)}
                            <div>
                                <h2 class="text-3xl font-bold text-white">{nextDayPrayerName}</h2>
                                <p class="text-emerald-100 font-mono">{nextDayPrayerTime}</p>
                            </div>
                            <div class="bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/20 shadow-inner">
                                <PrayerIcon class="text-white w-8 h-8" />
                            </div>
                        {/if}
                    </div>
                </div>
            </div>

            <!-- Right Column: Stacked Widgets -->
            <div class="col-span-4 flex flex-col gap-6">

                <!-- Widget 1: Time & Date -->
                <div class="card flex-1 preset-tonal-surface hover:preset-filled-surface-100-900 transition-colors p-6 flex flex-col justify-between group">
                    <div class="flex items-start justify-between">
                        <div class="p-2 bg-primary-500/10 dark:bg-primary-600/20 rounded-lg text-primary-500 dark:text-primary-400 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">
                            <Compass size={20} />
                        </div>
                        <span class="text-4xl font-light text-surface-900-100">
                            {currentTime.getHours().toString().padStart(2, '0')}<span class="animate-pulse text-surface-400-600">:</span>{currentTime.getMinutes().toString().padStart(2, '0')}
                        </span>
                    </div>
                    <div>
                        <p class="text-surface-500-500 text-xs font-bold uppercase tracking-wider mb-1">Today</p>
                        <p class="text-surface-900-100 text-lg font-bold leading-tight">
                            {getFormattedDate()}
                        </p>
                        <p class="text-surface-600-400 text-sm mt-1 font-medium">{getIslamicDate()}</p>
                    </div>
                </div>

                <!-- Widget 2: Location -->
                <div class="card h-1/3 preset-tonal-surface hover:preset-filled-surface-100-900 transition-colors p-5 flex items-center gap-4">
                    <div class="bg-warning-500/10 dark:bg-warning-600/20 p-3 rounded-full text-warning-500 dark:text-warning-400">
                        <MapPin size={18} />
                    </div>
                    <div class="overflow-hidden">
                        <p class="text-surface-500-500 text-[10px] font-bold uppercase tracking-wider">Current Location</p>
                        <p class="text-surface-900-100 font-bold truncate">{formattedLocation(selectedLocation.state.label)}</p>
                    </div>
                </div>

            </div>
        </div>

        <!-- Bottom Section: Horizontal Timeline -->
        <div class="card h-28 preset-filled-surface-100-900 p-2 flex items-center gap-2 overflow-x-auto no-scrollbar mb-4">
            {#each [
                { name: 'Fajr', time: prayerTimes.fajr, enabled: selectedTimes.state.daily.fajr },
                { name: 'Sunrise', time: prayerTimes.sunrise, enabled: selectedTimes.state.daily.sunrise },
                { name: 'Dhuhr', time: prayerTimes.dhuhr, enabled: selectedTimes.state.daily.dhuhr },
                { name: 'Asr', time: prayerTimes.asr, enabled: selectedTimes.state.daily.asr },
                { name: 'Maghrib', time: prayerTimes.maghrib, enabled: selectedTimes.state.daily.maghrib },
                { name: 'Isha', time: prayerTimes.isha, enabled: selectedTimes.state.daily.isha }
            ].filter(p => p.enabled && p.time) as prayer}
                {@const isNext = prayer.name === nextPrayerName}
                {@const isPassed = getPrayerStatus(prayer.name) === 'passed'}
                {@const PrayerIcon = getPrayerIcon(prayer.name)}

                <div
                    class="badge relative flex-1 min-w-[120px] h-full flex-col items-center justify-center gap-2 transition-all duration-300 {isNext
                        ? 'preset-filled-success-500 shadow-lg shadow-success-500/30 scale-[1.02]'
                        : isPassed
                            ? 'preset-ghost text-surface-400-600'
                            : 'preset-tonal-surface border-surface-200-800'
                    }"
                >
                    {#if isNext}
                        <div class="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                    {/if}

                    <PrayerIcon size={18} class={isNext ? 'text-white' : 'opacity-70'} />

                    <div class="text-center">
                        <span class="text-xs font-bold uppercase tracking-wider block {isNext ? 'opacity-100' : 'opacity-70'}">
                            {prayer.name}
                        </span>
                        <span class="text-lg font-mono {isNext ? 'font-bold' : 'font-medium'}">
                            {prayer.time}
                        </span>
                    </div>
                </div>
            {/each}
        </div>

<!-- Settings Button (bottom right corner) -->
 <div>
        <button
            type="button"
            class="btn-icon preset-tonal-surface absolute bottom-4 right-6"
            title="Settings"
            aria-label="Settings"
            onclick={() => goto('settings')}
        >
            <Settings size={20} />
        </button>
</div>
    </div>
        
</div>
