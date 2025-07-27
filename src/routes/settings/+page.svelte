<script lang="ts">
  import { timeRemaining } from '$lib/store/timeRemaining';
  import { Combobox, createToaster, Tabs } from '@skeletonlabs/skeleton-svelte';
  import { MapPin, CalendarCheck, AudioLines, BellRing, X } from '@lucide/svelte';
  import type { ComboboxData } from '$lib/types';
  import { selectedLocationId, selectedLocationLabel } from '$lib/store/selectedLocation';
  import { locationList } from '$lib/api/sholat/LocationApi';
  import { onMount } from 'svelte';
  import { selectedTimes } from '$lib/store/selectedTimes';
  import { selectedAlert } from '$lib/store/selectedAlert';

  const options = [
    { value: 5, label: '5 Minutes' },
    { value: 10, label: '10 Minutes' },
    { value: 15, label: '15 Minutes' },
    { value: 20, label: '20 Minutes' },
    { value: 25, label: '25 Minutes' },
    { value: 30, label: '30 Minutes' },
  ];

  let location = $state<ComboboxData[]>([{label: "", value: ""}]); 

  let group = $state('location');

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

  onMount( async () => {
    await fetchLocation();
    await selectedLocationId.start();
    await selectedTimes.start();
    await timeRemaining.start();
    await selectedLocationLabel.start();
    await selectedAlert.start();
  });
</script>


<div class="p-4 max-w-md mx-auto">
  <div class="flex justify-between items-center mb-4">
    <h3 class="h3 font-bold">Settings</h3>
    <a href="/" class="btn p-2">
      <X size={20} color="#b0b0b0" />
    </a>
  </div>
  <div class="mb-4">
    <Tabs value={group} onValueChange={(e) => (group = e.value)}>
      {#snippet list()}
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
        <Tabs.Panel value="location">
          <Combobox
            data={location}
            value={selectedLocationId.state.id}
            defaultInputValue={selectedLocationLabel.state.label}
            onValueChange={(e) => (onLocationChange(e.value))}
            label="Select Location"
            placeholder="Select..."
            inputBehavior="autohighlight"
          >
          </Combobox>
        </Tabs.Panel>
        <Tabs.Panel value="display">
          <h6 class="h6">Prayer Times</h6>
          <form class="space-y-2">
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
          </form>
        </Tabs.Panel>
        <Tabs.Panel value="sound">
          <h6 class="h6">Play Adzan At:</h6>
          <form class="space-y-2">
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
          </form>
        </Tabs.Panel>
        <Tabs.Panel value="alert">
          <label for="time-remaining" class="block text-sm font-medium text-gray-700 mb-1">Display Notification Before Prayer Times:</label>
            <select id="time-remaining" bind:value={timeRemaining.state.minutes} class="mt-1 block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              {#each options as option}
                <option value={option.value}>{option.label}</option>
              {/each}
          </select>
        </Tabs.Panel>
      {/snippet}
    </Tabs>
    
  </div>
</div>
