<script lang="ts">
  import { timeRemaining } from '$lib/store/timeRemaining';
  import { Combobox, createToaster, Tabs } from '@skeletonlabs/skeleton-svelte';
  import { MapPin, CalendarCheck, AudioLines, BellRing, ChevronLeft } from '@lucide/svelte';
  import type { ComboboxData } from '$lib/types';
  import { selectedLocationId, selectedLocationLabel } from '$lib/store/selectedLocation';
  import { locationList } from '$lib/api/sholat/LocationApi';
  import { onMount } from 'svelte';
  import { selectedTimes } from '$lib/store/selectedTimes';
  import { selectedAlert } from '$lib/store/selectedAlert';
  import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart';
  import { Settings } from '@lucide/svelte';

  const options = [
    { value: 5, label: '5 Minutes' },
    { value: 10, label: '10 Minutes' },
    { value: 15, label: '15 Minutes' },
    { value: 20, label: '20 Minutes' },
    { value: 25, label: '25 Minutes' },
    { value: 30, label: '30 Minutes' },
  ];

  let location = $state<ComboboxData[]>([{label: "", value: ""}]); 
  let autostartEnabled = $state(false);

  let group = $state('general');

  const toaster = createToaster({
    placement: 'top-end',
  });

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

  function onLocationChange(id: string[]) {
    selectedLocationId.state.id = id;
    const selectedId = id[0];
    const selected = location.find((loc) => loc.value === selectedId);
    if (selected) {
      selectedLocationLabel.state.label = selected.label;
    }
  }

  async function toggleAutostart() {
    if (autostartEnabled) {
      await enable();
      toaster.success({title: "Autostart Enabled"});
    } else {
      await disable();
      toaster.warning({title: "Autostart Disabled"});
    }
  }

  onMount( async () => {
    await fetchLocation();
    autostartEnabled = await isEnabled();
  });
</script>


<div class="p-4 max-w-2xl mx-auto pt-10">
  <div class="flex items-center mb-6">
    <a href="/" class="btn btn-sm variant-ghost-surface mr-4">
      <ChevronLeft size={24}/>
    </a>
    <h2 class="h2 font-bold">Settings</h2>
  </div>
  <div class="card p-4">
    <Tabs value={group} onValueChange={(e) => (group = e.value)}>
      {#snippet list()}
        <Tabs.Control value="general">
          {#snippet lead()}<Settings size={20} />{/snippet}
          General
        </Tabs.Control>
        <Tabs.Control value="location">
          {#snippet lead()}<MapPin size={20} />{/snippet}
          Location
        </Tabs.Control>
        <Tabs.Control value="display">
          {#snippet lead()}<CalendarCheck size={20} />{/snippet}
          Display
        </Tabs.Control>
        <Tabs.Control value="sound">
          {#snippet lead()}<AudioLines size={20} />{/snippet}
          Sound
        </Tabs.Control>
        <Tabs.Control value="alert">
          {#snippet lead()}<BellRing size={20} />{/snippet}
          Alert
        </Tabs.Control>
      {/snippet}
      {#snippet content()}
        <Tabs.Panel value="general">
          <div class="p-4">
            <h6 class="h6 mb-4">Autostart</h6>
            <label class="flex items-center space-x-2">
              <input class="checkbox" type="checkbox" bind:checked={autostartEnabled} onchange={toggleAutostart} />
              <p>Enable Autostart</p>
            </label>
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="location">
          <div class="p-4">
            <Combobox
              data={location}
              value={selectedLocationId.state.id}
              defaultInputValue={selectedLocationLabel.state.label}
              onValueChange={(e) => (onLocationChange(e.value))}
              label="Select Location"
              placeholder="Search for a city..."
              inputBehavior="autohighlight"
            />
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="display">
          <div class="p-4">
            <h6 class="h6 mb-4">Show Prayer Times</h6>
            <div class="grid grid-cols-2 gap-4">
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedTimes.state.daily.imsak} />
                <p>Imsak</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedTimes.state.daily.subuh} />
                <p>Subuh</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedTimes.state.daily.terbit} />
                <p>Terbit</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedTimes.state.daily.dhuha} />
                <p>Dhuha</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedTimes.state.daily.dzuhur} />
                <p>Dzuhur</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedTimes.state.daily.ashar} />
                <p>Ashar</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedTimes.state.daily.maghrib} />
                <p>Maghrib</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedTimes.state.daily.isya} />
                <p>Isya</p> 
              </label>
            </div>
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="sound">
          <div class="p-4">
            <h6 class="h6 mb-4">Play Adzan At</h6>
            <div class="grid grid-cols-2 gap-4">
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedAlert.state.alert.subuh} />
                <p>Subuh</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedAlert.state.alert.dzuhur} />
                <p>Dzuhur</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedAlert.state.alert.ashar} />
                <p>Ashar</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedAlert.state.alert.maghrib} />
                <p>Maghrib</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedAlert.state.alert.isya} />
                <p>Isya</p> 
              </label>
            </div>
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="alert">
          <div class="p-4">
            <label for="time-remaining" class="block text-sm font-medium mb-2">Notification before prayer time</label>
            <select id="time-remaining" bind:value={timeRemaining.state.minutes} class="select w-full max-w-xs">
              {#each options as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>
        </Tabs.Panel>
      {/snippet}
    </Tabs>
  </div>
</div>
