<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import {
        MapPin,
        Sunrise,
        Sunset,
        Sun,
        Moon,
        Circle,
        Settings,
        CalendarDays,
    } from "@lucide/svelte";
    import { goto } from "$app/navigation";
    import { modeLightSwitch } from "$lib/store/modeLightSwitch";
    import { PrayerManager } from "$lib/logic/PrayerManager.svelte";
    import QiblaCompass from "$lib/components/QiblaCompass.svelte";

    const manager = new PrayerManager();

    // Helper function to get icon for each prayer
    function getPrayerIcon(prayerName: string) {
        switch (prayerName?.toLowerCase()) {
            case "fajr":
                return Moon;
            case "sunrise":
                return Sunrise;
            case "dhuhr":
                return Sun;
            case "asr":
                return Sun;
            case "maghrib":
                return Sunset;
            case "isha":
                return Moon;
            default:
                return Sun;
        }
    }

    onMount(() => {
        document.documentElement.setAttribute(
            "data-mode",
            modeLightSwitch.state.mode,
        );
    });

    onDestroy(() => {
        manager.destroy();
    });
</script>

<div class="w-full h-screen p-6">
    <div class="w-full h-full flex flex-col gap-6">
        <!-- Top Section: Hero + Widgets -->
        <div class="flex-1 grid grid-cols-12 gap-6 min-h-0">
            <!-- Large Hero Card (Next Prayer) -->
            <div class="card col-span-8 preset-filled-primary-500 p-8">
                <div class="h-full flex flex-col justify-between">
                    <div class="flex justify-between items-start">
                        <span class="badge preset-filled-tertiary-50-950">
                            Next Prayer
                        </span>
                    </div>

                    <div class="text-center space-y-2">
                        {#if manager.countdownString}
                            <h1
                                class="text-7xl font-bold text-tertiary-50 tracking-tighter drop-shadow-sm tabular-nums"
                            >
                                {manager.countdownString.split(":")[0]}:{manager.countdownString.split(
                                    ":",
                                )[1]}<span
                                    class="text-tertiary-500 text-4xl font-light ml-0.5"
                                    >:{manager.countdownString.split(":")[2]}</span
                                >
                            </h1>
                            <p
                                class="text-secondary-300 text-sm font-medium tracking-widest uppercase"
                            >
                                Remaining until {manager.nextPrayer?.name}
                            </p>
                        {/if}
                    </div>

                    <div class="flex justify-between items-end">
                        {#if manager.nextPrayer}
                            {@const PrayerIcon = getPrayerIcon(manager.nextPrayer.name)}
                            <div>
                                <h2 class="text-3xl font-bold text-tertiary-50">
                                    {manager.nextPrayer.name}
                                </h2>
                                <p class="text-secondary-300 font-mono">
                                    {manager.nextPrayer.time}
                                </p>
                            </div>
                            <div class="card p-4">
                                <PrayerIcon class="text-tertiary-50 w-8 h-8" />
                            </div>
                        {/if}
                    </div>
                </div>
            </div>

            <!-- Right Column: Stacked Widgets -->
            <div class="col-span-4 flex flex-col gap-6">
                <!-- Widget 1: Time & Date -->
                <div
                    class="card flex-1 preset-filled-secondary-500 p-6 flex flex-col justify-between group"
                >
                    <div class="flex items-start justify-end">
                        <span class="text-4xl font-light text-tertiary-50">
                            {manager.currentTime
                                .getHours()
                                .toString()
                                .padStart(2, "0")}<span
                                class="animate-pulse text-tertiary-50">:</span
                            >{manager.currentTime
                                .getMinutes()
                                .toString()
                                .padStart(2, "0")}
                        </span>
                    </div>
                    <div>
                        <p
                            class="text-primary-500 text-xs font-bold uppercase tracking-wider mb-1"
                        >
                            Today
                        </p>
                        <p
                            class="text-tertiary-50 text-lg font-bold leading-tight"
                        >
                            {manager.formattedDate}
                        </p>
                        <p class="text-primary-500 text-sm mt-1 font-medium">
                            {manager.islamicDate}
                        </p>
                    </div>
                </div>

                <!-- Widget 2: Location & Qibla -->
                <div
                    class="card flex-1 preset-filled-secondary-500 p-5 flex items-center justify-between gap-4"
                >
                    <div class="overflow-hidden flex-1">
                        <div class="flex items-center gap-2 mb-1">
                             <MapPin size={14} class="text-primary-500" />
                             <p class="text-primary-500 text-[10px] font-bold uppercase tracking-wider">
                                Location
                            </p>
                        </div>
                       
                        <p
                            class="text-tertiary-50 font-bold line-clamp-2 text-balance"
                        >
                            {manager.currentLocationLabel}
                        </p>
                    </div>
                    
                    <div class="shrink-0 bg-surface-50/10 rounded-full p-1" title="Qibla Direction: {Math.round(manager.qiblaDirection)}°">
                         <QiblaCompass bearing={manager.qiblaDirection} size={72} />
                    </div>
                </div>
            </div>
        </div>

        <!-- Bottom Section: Timeline + Actions -->
        <div class="flex gap-4 items-end h-28">
            <!-- Horizontal Timeline -->
            <div
                class="card h-full flex-1 preset-outlined-primary-500 p-2 flex items-center gap-2 overflow-x-auto"
            >
                {#each manager.enabledPrayers as prayer}
                    {@const isNext = prayer.name === manager.nextPrayer?.name}
                    {@const PrayerIcon = getPrayerIcon(prayer.name)}

                    <div
                        class="badge relative flex-1 min-w-[120px] h-full flex-col items-center justify-center gap-2 transition-all duration-300 {isNext
                            ? 'preset-filled-primary-500'
                            : 'preset-tonal-surface text-primary-500'}"
                    >
                        {#if isNext}
                            <div class="absolute top-2 right-2">
                                <Circle
                                    size={10}
                                    class="text-tertiary-500 fill-tertiary-500 animate-pulse"
                                />
                            </div>
                        {/if}

                        <PrayerIcon
                            size={18}
                            class={isNext ? "text-tertiary-50" : ""}
                        />

                        <div class="text-center">
                            <span
                                class="text-xs font-bold uppercase tracking-wider block {isNext
                                    ? 'opacity-100 text-tertiary-50'
                                    : 'opacity-70'}"
                            >
                                {prayer.name}
                            </span>
                            <span
                                class="text-lg font-mono {isNext
                                    ? 'font-bold text-secondary-300'
                                    : 'font-medium'}"
                            >
                                {prayer.time}
                            </span>
                        </div>
                    </div>
                {/each}
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col gap-2 justify-end pb-1">
                <button
                    type="button"
                    class="btn-icon preset-tonal-tertiary"
                    title="Calendar"
                    aria-label="Calendar"
                    onclick={() => goto("calendar")}
                >
                    <CalendarDays size={20} />
                </button>
                <button
                    type="button"
                    class="btn-icon preset-tonal-tertiary"
                    title="Settings"
                    aria-label="Settings"
                    onclick={() => goto("settings")}
                >
                    <Settings size={20} />
                </button>
            </div>
        </div>
    </div>
</div>