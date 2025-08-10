<script lang="ts">
  import { timeRemaining } from '$lib/store/timeRemaining';
  import { createToaster, Tabs } from '@skeletonlabs/skeleton-svelte';
  import { MapPin, CalendarCheck, BellRing, ChevronLeft, Calculator, Search } from '@lucide/svelte';
  import { selectedLocation } from '$lib/store/selectedLocation';
  import { geocode } from '$lib/api/location/GeocodeApi';
  import { onMount } from 'svelte';
  import { listen } from '@tauri-apps/api/event';
  import { selectedTimes } from '$lib/store/selectedTimes';
  import { selectedAlert } from '$lib/store/selectedAlert';
  import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart';
  import { Settings } from '@lucide/svelte';
  import { calculationSettings, calculationMethods, asrMethods, midnightMethods, highLatitudeMethods } from '$lib/store/calculationSettings';
  import { goto } from '$app/navigation';

  const options = [
    { value: 5, label: '5 Minutes' },
    { value: 10, label: '10 Minutes' },
    { value: 15, label: '15 Minutes' },
    { value: 20, label: '20 Minutes' },
    { value: 25, label: '25 Minutes' },
    { value: 30, label: '30 Minutes' },
  ];

  let autostartEnabled = $state(false);
  let searchQuery = $state('');

  let group = $state('location');

  const toaster = createToaster({
    placement: 'top-end',
  });

  // Debounce function to limit API calls
  let debounceTimer: ReturnType<typeof setTimeout>;
  let lastRequestTime = $state(0);

  let maghribPlaceholder = $derived(`Enter the ${calculationSettings.state.maghribMode === 'degrees' ? 'degrees value' : 'value of minutes after sunset'}`);
  let ishaPlaceholder = $derived(`Enter the ${calculationSettings.state.ishaMode === 'degrees' ? 'degrees value' : 'value of minutes after maghrib'}`);

  let unlistenFn: (() => void) | null = null;
  
  function debounceSearch(query: string) {
    // Clear any existing debounce timer
    clearTimeout(debounceTimer);
    
    // Set a new timer with 500ms delay for user input
    debounceTimer = setTimeout(() => {
      // Check if we can make a request (1 per second limit)
      const now = Date.now();
      if (now - lastRequestTime >= 1000) {
        // We can make the request now
        searchLocation(query);
        lastRequestTime = now;
      } else {
        // If we're too fast, schedule the request for when we can make it
        const timeToWait = 1000 - (now - lastRequestTime);
        setTimeout(() => {
          searchLocation(query);
          lastRequestTime = Date.now();
        }, timeToWait);
      }
    }, 500);
  }

  async function searchLocation(query: string) {
    if (!query) {
      return;
    }
    
    try {
      const response = await geocode(query);
      const data = await response.json();
      
      if (response.status === 200 && data.length > 0) {
        // Automatically select the first (and only) result
        const item = data[0];
        selectedLocation.state.id = item.place_id;
        selectedLocation.state.label = item.display_name;
        selectedLocation.state.latitude = parseFloat(item.lat);
        selectedLocation.state.longitude = parseFloat(item.lon);
        searchQuery = item.display_name;
      } else {
        // Only show error if query is substantial
        if (query.length > 2) {
          toaster.error({title: "No locations found"});
        }
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      toaster.error({title: "Error fetching location"});
    }
  }

  function handleLocationSearch() {
    debounceSearch(searchQuery);
  }

  async function toggleAutostart() {
    try {
      if (autostartEnabled) {
        await enable();
        toaster.success({title: "Autostart Enabled"});
      } else {
        await disable();
        toaster.warning({title: "Autostart Disabled"});
      }
    } catch (error) {
      autostartEnabled = !autostartEnabled;
      toaster.error({title: "Failed to update autostart setting"});
    }
  }

  function handleInputMaghribChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (calculationSettings.state.maghribMode === 'minutes') {
      calculationSettings.state.maghrib = `${target.value} min`;
    } else {
      calculationSettings.state.maghrib = String(target.value).replace(/\D/g, '');
    }
  }

  function handleInputIshaChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (calculationSettings.state.ishaMode === 'minutes') {
      calculationSettings.state.isha = `${target.value} min`;
    } else {
      calculationSettings.state.isha = String(target.value).replace(/\D/g, '');
    }
  }

  function handleInputDhuhrChange(e: Event) {
    const target = e.target as HTMLInputElement;
    calculationSettings.state.dhuhrMinutes = `${target.value} min`;
  }


  onMount(() => {
    const setup = async () => {
      autostartEnabled = await isEnabled();
      if (selectedLocation.state.label) {
        searchQuery = selectedLocation.state.label;
      }
      lastRequestTime = Date.now() - 1000;

      unlistenFn = await listen('navigate_to_main', () => {
        goto('/');
      });
    };

    setup();

    return () => {
      if (unlistenFn) {
        unlistenFn();
      }
    };
  });
</script>


<div class="p-4 max-w-3xl mx-auto pt-10">
  <div class="flex items-center mb-6 space-x-4">
    <button type="button" class="btn-icon hover:preset-tonal-primary" title="Back" aria-label="Back" onclick={() => goto('/')}><ChevronLeft size={24} /></button>
    <h2 class="h2 font-bold">Settings</h2>
  </div>
  <div class="card p-4">
    <Tabs value={group} onValueChange={(e) => (group = e.value)}>
      {#snippet list()}
        <Tabs.Control value="location">
          {#snippet lead()}<MapPin size={20} />{/snippet}
          Location
        </Tabs.Control>
        <Tabs.Control value="calculation">
          {#snippet lead()}<Calculator size={20} />{/snippet}
          Calculation
        </Tabs.Control>
        <Tabs.Control value="prayer">
          {#snippet lead()}<CalendarCheck size={20} />{/snippet}
          Prayer Times
        </Tabs.Control>
        <Tabs.Control value="alert">
          {#snippet lead()}<BellRing size={20} />{/snippet}
          Notifications
        </Tabs.Control>
        <Tabs.Control value="general">
          {#snippet lead()}<Settings size={20} />{/snippet}
          General
        </Tabs.Control>
      {/snippet}
      {#snippet content()} 
        <Tabs.Panel value="location">
          <div class="px-4">
            <label class="label">
              <div class="input-group grid-cols-[auto_1fr_auto]">
                <div class="ig-cell preset-tonal">
                  <Search size={16} />
                </div>
                <input class="ig-input" type="search" placeholder="Enter a city or address..." bind:value={searchQuery} />
                <button class="ig-btn preset-filled" onclick={handleLocationSearch}>Submit</button>
              </div>
            
            </label> 
            {#if selectedLocation.state.label}
              <div class="mt-4 p-3 bg-surface-500 rounded">
                <p class="font-medium">Selected Location:</p>
                <p>{selectedLocation.state.label}</p>
                <p class="text-sm text-surface-700">
                  Coordinates: {selectedLocation.state.latitude}, {selectedLocation.state.longitude}
                </p>
              </div>
            {/if}
            <!-- OpenStreetMap Attribution -->
            <div class="p-1 rounded text-sm text-surface-800 text-right">
              <span>Location data provided by</span>
              <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
                OpenStreetMap (© OpenStreetMap contributors)
              </a>
            </div>
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="calculation">
            <form class="w-full space-y-4 px-4">
              <label class="label">
                <span class="label-text">Calculation Method</span>
                <select bind:value={calculationSettings.state.method} class="select">
                  {#each calculationMethods as method}
                    <option value={method.value}>{method.label}</option>
                  {/each}
                </select>
              </label>
            {#if calculationSettings.state.method === 'custom'}
                <label class="label">
                  <span class="label-text">Fajr</span>
                  <div class="input-group grid-cols-[1fr_auto]">
                  <input 
                    type="number" 
                    bind:value={calculationSettings.state.fajrAngle} 
                    class="ig-input"
                    placeholder="Enter the value of degrees"
                  />
                  <div class="ig-cell preset-tonal">degrees</div>
                  </div>
                </label>
                <label class="label">
                <span class="label-text">Maghrib</span>
                <div class="input-group grid-cols-[1fr_auto]">
                  <input class="ig-input" type="number" value={String(calculationSettings.state.maghrib).replace(/\D/g, '')} onchange={handleInputMaghribChange} placeholder={maghribPlaceholder} />
                  <select class="ig-select preset-tonal-tertiary" bind:value={calculationSettings.state.maghribMode}>
                    <option value="degrees">degrees</option>
                    <option value="minutes">minutes</option>
                  </select>
                </div>
                </label>
                <label class="label">
                <span class="label-text">Isha</span>
                <div class="input-group grid-cols-[1fr_auto]">
                  <input class="ig-input" type="number" value={String(calculationSettings.state.isha).replace(/\D/g, '')} onchange={handleInputIshaChange} placeholder={ishaPlaceholder} />
                  <select class="ig-select preset-tonal-tertiary" bind:value={calculationSettings.state.ishaMode}>
                    <option value="degrees">degrees</option>
                    <option value="minutes">minutes</option>
                  </select>
                </div>
                </label>
                <label class="label">
                  <span class="label-text">Midnight Method</span>
                  <select bind:value={calculationSettings.state.midnight} class="select">
                    {#each midnightMethods as method}
                      <option value={method.value}>{method.label}</option>
                    {/each}
                  </select>
                </label>
            {/if}
              <label class="label">
                <span class="label-text">Dhuhr</span>
                <div class="input-group grid-cols-[1fr_auto]">
                <input 
                  class="ig-input"
                  type="number" 
                  value={String(calculationSettings.state.dhuhrMinutes).replace(/\D/g, '')}
                  onchange={handleInputDhuhrChange} 
                  placeholder="Enter the value of minutes after mid-day"
                />
                <div class="ig-cell preset-tonal">minutes</div>
                </div>
              </label>
            <label class="label">
              <span class="label-text">Asr</span>
              <select bind:value={calculationSettings.state.asrMethod} class="select">
                {#each asrMethods as method}
                  <option value={method.value}>{method.label}</option>
                {/each}
              </select>
            </label>
            <label class="label">
              <span class="label-text">Higher Latitudes Adjustment</span>
              <select bind:value={calculationSettings.state.highLatitudes} class="select">
                {#each highLatitudeMethods as method}
                  <option value={method.value}>{method.label}</option>
                {/each}
              </select>
            </label>
        </form>    
        </Tabs.Panel>
        <Tabs.Panel value="prayer">
          <div class="px-4">
            <h6 class="h6 mb-4">Show Prayer Times</h6>
            <div class="grid grid-cols-2 gap-4 mb-8">
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedTimes.state.daily.fajr} />
                <p>Fajr</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedTimes.state.daily.sunrise} />
                <p>Sunrise</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedTimes.state.daily.dhuhr} />
                <p>Dhuhr</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedTimes.state.daily.asr} />
                <p>Asr</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedTimes.state.daily.maghrib} />
                <p>Maghrib</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedTimes.state.daily.isha} />
                <p>Isha</p> 
              </label>
            </div>
            <h6 class="h6 mb-4">Play Adzan At</h6>
            <div class="grid grid-cols-2 gap-4 mb-8">
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedAlert.state.alert.fajr} />
                <p>Fajr</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedAlert.state.alert.dhuhr} />
                <p>Dhuhr</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedAlert.state.alert.asr} />
                <p>Asr</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedAlert.state.alert.maghrib} />
                <p>Maghrib</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="checkbox" type="checkbox" bind:checked={selectedAlert.state.alert.isha} />
                <p>Isha</p> 
              </label>
            </div>
            <h6 class="h6 mb-4">Time Format</h6>
            <form class="space-y-2">
              <label class="flex items-center space-x-2">
                <input class="radio" type="radio" checked name="radio-direct" bind:group={selectedTimes.state.format} value="12h" />
                <p>12 Hour</p>
              </label>
              <label class="flex items-center space-x-2">
                <input class="radio" type="radio" name="radio-direct" bind:group={selectedTimes.state.format} value="24h" />
                <p>24 Hour</p>
              </label>
            </form>
          </div>
        </Tabs.Panel>
        <Tabs.Panel value="alert">
            <label class="label px-4">
            <span class="label-text">Notification before prayer time</span>
            <select bind:value={timeRemaining.state.minutes} class="select">
              {#each options as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
            </label>
        </Tabs.Panel>
        <Tabs.Panel value="general">
          <label class="flex items-center space-x-2 px-4">
            <input class="checkbox" type="checkbox" bind:checked={autostartEnabled} onchange={toggleAutostart} />
            <p>Enable Autostart</p>
          </label>
        </Tabs.Panel>
      {/snippet}
    </Tabs>
  </div>
</div>
