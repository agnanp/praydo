<script lang="ts">
  import { locationList } from "$lib/api/sholat/LocationApi";
  import { Toaster, createToaster, Combobox } from '@skeletonlabs/skeleton-svelte';
  import { onDestroy, onMount } from "svelte";
  import { formatDateToIndonesian, getCurrentDateFormatted } from "$lib/formatedDate";
  import { isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification';
  import { toTitleCase } from '$lib/utils/stringUtils';
  import { MapPin, Settings } from "@lucide/svelte";
  import { invoke } from "@tauri-apps/api/core";

  import type { ComboboxData, ScheduleResponse, Daily} from "$lib/types";
  import { selectedLocationId } from "$lib/store/selectedLocation";
  import { dailySchedule } from "$lib/api/sholat/ScheduleApi";
  import { timeRemaining } from "$lib/store/timeRemaining";
  import { selectedTimes } from "$lib/store/selectedTimes";
  import { playSound } from "$lib/sound";
  import { selectedAlert } from "$lib/store/selectedAlert";

  let location = $state<ComboboxData[]>([{label: "", value: ""}]);

  let schedule = $state<ScheduleResponse | undefined>();
  let nextPrayerName = $state('');
  let nextPrayerTime = $state('');
  let nextDayPrayerName = $state('');
  let nextDayPrayerTime = $state('');
  let countdown = $state('');
  
  let lastFetched = '';

  const toaster = createToaster({
    placement: 'top-end',
  });

  let notificationInterval: ReturnType<typeof setInterval>;
  let countdownInterval: ReturnType<typeof setInterval>;
  
  async function fetchLocation() {
    const response = await locationList();
    const responseBody = await response.json();
    console.log(responseBody);
    if (response.status === 200) {
      for (let i = 0; i < responseBody.data.length; i++) {
        const newItem = {label: responseBody.data[i].lokasi, value: responseBody.data[i].id};
        const isDuplicate = location.some(item => item.label === newItem.label);
        if (!isDuplicate) {
          location.push(newItem);
        }
      }
    } else {
      toaster.error({title: "Error fetching location"});
    }
  }

  async function fetchSchedule(id: string[]) {
    if (!id) {
      toaster.error({title: "Select location first"});
      return;
    }
    const now = getCurrentDateFormatted();
    const response = await dailySchedule(id, now);
    const responseBody = await response.json();
    console.log(responseBody);
    if (response.status === 200) {
      schedule = responseBody;
      startPrayerReminder();
      updateCountdown();
    }
    else {
      toaster.error({title: "Error fetching schedule"});
    }
    selectedLocationId.state.id = id;
  }

  async function sendNMinutesPrayerNotification(prayerName: string, prayerTime: string, location: string) {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === 'granted';
    }
    if (permissionGranted) {
        invoke('send_native_notification', {
            title: `${timeRemaining.state.minutes} Menit Lagi Waktu ${prayerName}`,
            body: `${prayerName} ${toTitleCase(location)} ${prayerTime}.`,
          });
          }
    playSound('solemn.mp3');
  }

  async function sendPrayerNotification(prayerName: string, prayerTime: string, location: string) {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === 'granted';
    }
    if (permissionGranted) {
        invoke('send_native_notification', {
            title: `Waktu ${prayerName} ${prayerTime}`,
            body: `Waktu ${prayerName} ${toTitleCase(location)}.`,
          });
    }
    const prayer = prayerName.toLowerCase();
    if (selectedAlert.state.alert[prayer as keyof typeof selectedAlert.state.alert]) {
      if (prayer === 'subuh') {
        playSound('adhan-fajr.mp3');
      } else {
        playSound('adhan-makkah.mp3');
      }
    } else {
      playSound('solemn.mp3');
    }
  }

  function parseTime(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const now = new Date();
    now.setHours(hours, minutes, 0, 0);
    return now;
  }

  function startPrayerReminder() {
    if (notificationInterval) {
      clearInterval(notificationInterval);
    }

    notificationInterval = setInterval(() => {
      if (!schedule || !schedule.data || !schedule.data.jadwal) {
        return;
      }

      const prayerTimes: Daily = schedule.data.jadwal;
      const location: string = schedule.data.lokasi;
      const now = new Date();

      const prayers = [
        { name: 'Imsak', time: prayerTimes.imsak },
        { name: 'Subuh', time: prayerTimes.subuh },
        { name: 'Terbit', time: prayerTimes.terbit },
        { name: 'Dhuha', time: prayerTimes.dhuha },
        { name: 'Dzuhur', time: prayerTimes.dzuhur },
        { name: 'Ashar', time: prayerTimes.ashar },
        { name: 'Maghrib', time: prayerTimes.maghrib },
        { name: 'Isya', time: prayerTimes.isya },
      ].filter(p => selectedTimes.state.daily[p.name.toLowerCase() as keyof typeof selectedTimes.state.daily]);

      for (const prayer of prayers) {
        const prayerDate = parseTime(prayer.time);
        const nMinutesBefore = new Date(prayerDate.getTime() - timeRemaining.state.minutes * 60 * 1000);

        if (now.getHours() === nMinutesBefore.getHours() && now.getMinutes() === nMinutesBefore.getMinutes() && now.getSeconds() === 0) {
          sendNMinutesPrayerNotification(prayer.name, prayer.time, location);
        } else if (now.getHours() === prayerDate.getHours() && now.getMinutes() === prayerDate.getMinutes() && now.getSeconds() === 0) {
          sendPrayerNotification(prayer.name, prayer.time, location); 
        }
      }
    }, 1000); // Check every minute
  }

  async function fetchNextDaySchedule() {
    const id = selectedLocationId.state.id;
    if (!id) {
      return;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextDate = `${tomorrow.getFullYear()}-${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}-${tomorrow.getDate().toString().padStart(2, '0')}`;
    const response = await dailySchedule(id, nextDate);
    const responseBody = await response.json();
    if (response.status === 200) {
      return responseBody;
    }
    return null;
  }

  function updateCountdown() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    countdownInterval = setInterval(async () => {
      if (!schedule || !schedule.data || !schedule.data.jadwal) {
        return;
      }

      const prayerTimes: Daily = schedule.data.jadwal;
      const now = new Date();

      const prayers = [
        { name: 'Imsak', time: prayerTimes.imsak },
        { name: 'Subuh', time: prayerTimes.subuh },
        { name: 'Terbit', time: prayerTimes.terbit },
        { name: 'Dhuha', time: prayerTimes.dhuha },
        { name: 'Dzuhur', time: prayerTimes.dzuhur },
        { name: 'Ashar', time: prayerTimes.ashar },
        { name: 'Maghrib', time: prayerTimes.maghrib },
        { name: 'Isya', time: prayerTimes.isya },
      ].filter(p => selectedTimes.state.daily[p.name.toLowerCase() as keyof typeof selectedTimes.state.daily]);

      let nextPrayerFound = false;

      for (const prayer of prayers) {
        const prayerDate = parseTime(prayer.time);

        if (prayerDate > now) {
          const diff = prayerDate.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          countdown = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          nextPrayerName = prayer.name;
          nextPrayerTime = prayer.time;
          nextPrayerFound = true;
          break;
        }
      }

      if (!nextPrayerFound) {
        const nextDaySchedule = await fetchNextDaySchedule();
        if (nextDaySchedule && nextDaySchedule.data && nextDaySchedule.data.jadwal) {
          const nextDayPrayers = [
            { name: 'Imsak', time: nextDaySchedule.data.jadwal.imsak },
            { name: 'Subuh', time: nextDaySchedule.data.jadwal.subuh },
            { name: 'Terbit', time: nextDaySchedule.data.jadwal.terbit },
            { name: 'Dhuha', time: nextDaySchedule.data.jadwal.dhuha },
            { name: 'Dzuhur', time: nextDaySchedule.data.jadwal.dzuhur },
            { name: 'Ashar', time: nextDaySchedule.data.jadwal.ashar },
            { name: 'Maghrib', time: nextDaySchedule.data.jadwal.maghrib },
            { name: 'Isya', time: nextDaySchedule.data.jadwal.isya },
          ].filter(p => selectedTimes.state.daily[p.name.toLowerCase() as keyof typeof selectedTimes.state.daily]);

          if (nextDayPrayers.length > 0) {
            const nextPrayer = nextDayPrayers[0];
            nextPrayerName = '';
            nextPrayerTime = '';
            nextDayPrayerTime = nextPrayer.time;
            const prayerDate = parseTime(nextDayPrayerTime);
            prayerDate.setDate(prayerDate.getDate() + 1);

            const diff = prayerDate.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            countdown = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            nextDayPrayerName = nextPrayer.name;
          }

          const currentDate = getCurrentDateFormatted();
          if (lastFetched !== currentDate) {
            lastFetched = currentDate;
            await fetchSchedule(selectedLocationId.state.id);
          }
        } else {
          countdown = '';
          nextDayPrayerName = '';
        }
      }
    }, 1000);
  }

  onMount( async () => {
    await fetchLocation();
    await fetchSchedule(selectedLocationId.state.id);
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

<main class="p-4 h-full">
  <Toaster {toaster}></Toaster>
  {#if schedule}
    <div class="flex items-baseline justify-center gap-2">
      <MapPin size=13/>
      <span>{toTitleCase(schedule.data.lokasi)}</span>
    </div>
    <p class="text-center">{formatDateToIndonesian(schedule.data.jadwal.tanggal)}</p>
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {#if selectedTimes.state.daily.imsak}
          <div class="card p-4 text-center" class:preset-tonal-primary={nextPrayerName === 'Imsak'} class:preset-filled-primary={nextPrayerName !== 'Imsak'}>
            <p class="h3">Imsak</p>
            <p class="text-xl">{schedule.data.jadwal.imsak}</p>
          </div>
        {/if}
        {#if selectedTimes.state.daily.subuh}
          <div class="card p-4 text-center" class:preset-tonal-primary={nextPrayerName === 'Subuh'} class:preset-filled-primary={nextPrayerName !== 'Subuh'}>
            <p class="h3">Subuh</p>
            <p class="text-xl">{schedule.data.jadwal.subuh}</p>
          </div>
        {/if}
        {#if selectedTimes.state.daily.terbit}
          <div class="card p-4 text-center" class:preset-tonal-primary={nextPrayerName === 'Terbit'} class:preset-filled-primary={nextPrayerName !== 'Terbit'}>
            <p class="h3">Terbit</p>
            <p class="text-xl">{schedule.data.jadwal.terbit}</p>
          </div>
        {/if}
        {#if selectedTimes.state.daily.dhuha}
          <div class="card p-4 text-center" class:preset-tonal-primary={nextPrayerName === 'Dhuha'} class:preset-filled-primary={nextPrayerName !== 'Dhuha'}>
            <p class="h3">Dhuha</p>
            <p class="text-xl">{schedule.data.jadwal.dhuha}</p>
          </div>
        {/if}
        {#if selectedTimes.state.daily.dzuhur}
          <div class="card p-4 text-center" class:preset-tonal-primary={nextPrayerName === 'Dzuhur'} class:preset-filled-primary={nextPrayerName !== 'Dzuhur'}>
            <p class="h3">Dzuhur</p>
            <p class="text-xl">{schedule.data.jadwal.dzuhur}</p>
          </div>
        {/if}
        {#if selectedTimes.state.daily.ashar}
          <div class="card p-4 text-center" class:preset-tonal-primary={nextPrayerName === 'Ashar'} class:preset-filled-primary={nextPrayerName !== 'Ashar'}>
            <p class="h3">Ashar</p>
            <p class="text-xl">{schedule.data.jadwal.ashar}</p>
          </div>
        {/if}
        {#if selectedTimes.state.daily.maghrib}
          <div class="card p-4 text-center" class:preset-tonal-primary={nextPrayerName === 'Maghrib'} class:preset-filled-primary={nextPrayerName !== 'Maghrib'}>
            <p class="h3">Maghrib</p>
            <p class="text-xl">{schedule.data.jadwal.maghrib}</p>
          </div>
        {/if}
        {#if selectedTimes.state.daily.isya}
          <div class="card p-4 text-center" class:preset-tonal-primary={nextPrayerName === 'Isya'} class:preset-filled-primary={nextPrayerName !== 'Isya'}>
            <p class="h3">Isya</p>
            <p class="text-xl">{schedule.data.jadwal.isya}</p>
          </div>
        {/if}
      </div>
    </div>
  {/if}
  <div class="flex justify-end">
    <a href="/settings" class="btn btn-sm">
      <Settings size=20  />
    </a>
  </div>
</main>
