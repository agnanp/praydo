<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { ChevronLeft, ChevronRight, Home } from "@lucide/svelte";
    import { PrayerManager } from "$lib/logic/PrayerManager.svelte";
    import { selectedTimes } from "$lib/store/selectedTimes";
    import type { PrayerTimes } from "$lib/logic/types";

    const manager = new PrayerManager();
    const now = new Date();

    let currentYear = $state(now.getFullYear());
    let currentMonth = $state(now.getMonth());
    let schedule = $state<{ day: number; prayers: PrayerTimes }[]>([]);

    // Month names
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    let currentMonthName = $derived(monthNames[currentMonth]);
    
    // Fetch schedule when month/year changes
    $effect(() => {
        schedule = manager.getMonthSchedule(currentYear, currentMonth);
    });

    function nextMonth() {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
    }

    function prevMonth() {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
    }

    function isToday(day: number) {
        return (
            day === now.getDate() &&
            currentMonth === now.getMonth() &&
            currentYear === now.getFullYear()
        );
    }

    // Columns to display (based on user settings + Date)
    const columns = [
        { key: 'date', label: 'Date' },
        { key: 'fajr', label: 'Fajr', enabled: selectedTimes.state.daily.fajr },
        { key: 'sunrise', label: 'Sunrise', enabled: selectedTimes.state.daily.sunrise },
        { key: 'dhuhr', label: 'Dhuhr', enabled: selectedTimes.state.daily.dhuhr },
        { key: 'asr', label: 'Asr', enabled: selectedTimes.state.daily.asr },
        { key: 'maghrib', label: 'Maghrib', enabled: selectedTimes.state.daily.maghrib },
        { key: 'isha', label: 'Isha', enabled: selectedTimes.state.daily.isha },
    ].filter(c => c.key === 'date' || c.enabled);

    onMount(() => {
        // Cleanup manager on unmount
        return () => manager.destroy();
    });
</script>

<div class="w-full h-screen flex flex-col p-6 gap-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
             <button
                type="button"
                class="btn-icon preset-tonal-tertiary"
                title="Home"
                aria-label="Home"
                onclick={() => goto("/")}
            >
                <Home size={20} />
            </button>
            <h2 class="h2 font-bold text-surface-900 dark:text-surface-50">Prayer Calendar</h2>
        </div>
        
        <div class="flex items-center gap-4 bg-surface-200-800 p-1 rounded-full">
             <button
                type="button"
                class="btn-icon btn-icon-sm hover:preset-filled-primary-500"
                onclick={prevMonth}
            >
                <ChevronLeft size={18} />
            </button>
            <span class="font-mono font-bold min-w-[140px] text-center text-surface-900 dark:text-surface-50">
                {currentMonthName} {currentYear}
            </span>
            <button
                type="button"
                class="btn-icon btn-icon-sm hover:preset-filled-primary-500"
                onclick={nextMonth}
            >
                <ChevronRight size={18} />
            </button>
        </div>
    </div>

    <!-- Table Container -->
    <div class="table-container flex-1 border border-surface-500/20 bg-surface-50-950 rounded-lg overflow-hidden shadow-sm overflow-y-auto">
        <table class="table table-hover w-full">
            <thead class="bg-surface-200-800 text-surface-900 dark:text-surface-50 sticky top-0 z-10">
                <tr>
                    {#each columns as col}
                        <th class="text-center p-4 font-bold uppercase text-xs tracking-wider bg-surface-200 dark:bg-surface-800">{col.label}</th>
                    {/each}
                </tr>
            </thead>
            <tbody>
                {#each schedule as row}
                    <tr class="border-b border-surface-500/10 {isToday(row.day) ? 'bg-primary-500/10' : ''}">
                        {#each columns as col}
                            <td class="text-center p-3 font-mono text-sm {isToday(row.day) ? 'font-bold text-primary-700 dark:text-primary-400' : 'text-surface-900 dark:text-surface-200'}">
                                {#if col.key === 'date'}
                                    <span class="inline-block w-8 h-8 leading-8 rounded-full {isToday(row.day) ? 'bg-primary-500 text-white' : ''}">
                                        {row.day}
                                    </span>
                                {:else}
                                    {row.prayers[col.key]}
                                {/if}
                            </td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
