<script lang="ts">
  import { OnboardingManager } from '$lib/logic/OnboardingManager.svelte';
  import { fade } from 'svelte/transition';
  import { Search, MapPin, Calculator, BellRing } from '@lucide/svelte';
  import { geocode } from '$lib/api/location/GeocodeApi';
  import { selectedLocation } from '$lib/store/selectedLocation';
  import {
    calculationSettings,
    calculationMethods,
  } from '$lib/store/calculationSettings';
  import { selectedAlert } from '$lib/store/selectedAlert';
  import {
    isPermissionGranted,
    requestPermission,
  } from '@tauri-apps/plugin-notification';
  import { t } from '$lib/i18n';

  let { manager }: { manager: OnboardingManager } = $props();

  let searchQuery = $state('');
  let isSearching = $state(false);
  let searchError = $state('');

  async function handleLocationSearch() {
    if (!searchQuery) return;
    isSearching = true;
    searchError = '';

    try {
      const response = await geocode(searchQuery);
      const data = await response.json();

      if (response.status === 200 && data.length > 0) {
        const item = data[0];
        selectedLocation.state.id = item.place_id;
        selectedLocation.state.label = item.display_name;
        selectedLocation.state.latitude = parseFloat(item.lat);
        selectedLocation.state.longitude = parseFloat(item.lon);
      } else {
        searchError = 'No locations found. Please try another search.';
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      searchError = 'Error fetching location. Please check your connection.';
    } finally {
      isSearching = false;
    }
  }

  async function ensureNotificationPermission() {
    let granted = await isPermissionGranted();
    if (!granted) {
      const result = await requestPermission();
      granted = result === 'granted';
    }
    return granted;
  }

  async function toggleAllAlerts(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      await ensureNotificationPermission();
    }

    selectedAlert.state.alert.fajr = checked;
    selectedAlert.state.alert.dhuhr = checked;
    selectedAlert.state.alert.asr = checked;
    selectedAlert.state.alert.maghrib = checked;
    selectedAlert.state.alert.isha = checked;
  }
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/90 backdrop-blur-sm"
  transition:fade
>
  <div
    class="card w-full max-w-xl p-8 shadow-xl bg-surface-100 dark:bg-surface-800"
  >
    <header class="mb-6">
      <h2 class="h2 font-bold text-primary-500">{t('onboarding.welcome')}</h2>
      <p class="text-surface-600 dark:text-surface-400">
        {t('onboarding.subtitle')}
      </p>
    </header>

    <div class="relative min-h-[320px] overflow-hidden">
      {#if manager.currentStep === 0}
        <div class="absolute inset-0" transition:fade>
          <h3 class="h3 mb-2 flex items-center gap-2">
            <MapPin size={24} />
            {t('onboarding.step1')}
          </h3>
          <p class="mb-6 opacity-70">
            {t('onboarding.step1_desc')}
          </p>

          <div class="space-y-4">
            <div class="input-group grid-cols-[auto_1fr_auto]">
              <div class="ig-cell preset-tonal">
                <Search size={16} />
              </div>
              <input
                class="ig-input"
                type="search"
                placeholder={t('settings.location.placeholder')}
                bind:value={searchQuery}
                onkeydown={(e) => e.key === 'Enter' && handleLocationSearch()}
              />
              <button
                class="ig-btn preset-filled-primary"
                disabled={isSearching}
                onclick={handleLocationSearch}
              >
                {isSearching ? t('common.loading') : t('common.search')}
              </button>
            </div>

            {#if searchError}
              <p class="text-error-500 text-sm">{searchError}</p>
            {/if}

            {#if selectedLocation.state.label}
              <div
                class="card p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg animate-in fade-in duration-300"
              >
                <p
                  class="text-xs uppercase font-bold tracking-wider opacity-60"
                >
                  {t('settings.location.selected')}
                </p>
                <p class="font-bold text-lg">{selectedLocation.state.label}</p>
                <p class="text-sm opacity-70">
                  Coordinates: {selectedLocation.state.latitude.toFixed(4)}, {selectedLocation.state.longitude.toFixed(
                    4
                  )}
                </p>
              </div>
            {/if}
          </div>
        </div>
      {:else if manager.currentStep === 1}
        <div class="absolute inset-0" transition:fade>
          <h3 class="h3 mb-2 flex items-center gap-2">
            <Calculator size={24} />
            {t('onboarding.step2')}
          </h3>
          <p class="mb-6 opacity-70">{t('onboarding.step2_desc')}</p>

          <label class="label">
            <span class="label-text">{t('settings.calculation.method')}</span>
            <select
              bind:value={calculationSettings.state.method}
              class="select"
            >
              {#each calculationMethods as method}
                <option value={method.value}>{method.label}</option>
              {/each}
            </select>
          </label>

          <div class="mt-6 p-4 bg-surface-200 dark:bg-surface-700 rounded-lg">
            <p class="text-sm opacity-80 italic">
              {t('onboarding.step2_tip')}
            </p>
          </div>
        </div>
      {:else if manager.currentStep === 2}
        <div class="absolute inset-0" transition:fade>
          <h3 class="h3 mb-2 flex items-center gap-2">
            <BellRing size={24} />
            {t('onboarding.step3')}
          </h3>
          <p class="mb-6 opacity-70">
            {t('onboarding.step3_desc')}
          </p>

          <div class="space-y-6">
            <label class="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                class="checkbox"
                checked={Object.values(selectedAlert.state.alert).every(
                  (v) => v
                )}
                onchange={toggleAllAlerts}
              />
              <span class="font-bold">{t('onboarding.enable_all')}</span>
            </label>

            <div class="grid grid-cols-2 gap-4 pl-8">
              {#each ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as name}
                {@const key =
                  name.toLowerCase() as keyof typeof selectedAlert.state.alert}
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    class="checkbox"
                    bind:checked={selectedAlert.state.alert[key]}
                    onchange={async (e) => {
                      if ((e.target as HTMLInputElement).checked) {
                        await ensureNotificationPermission();
                      }
                    }}
                  />
                  <p>{t('prayers.' + name.toLowerCase())}</p>
                </label>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>

    <footer class="mt-8 flex justify-between items-center">
      <div class="flex gap-2">
        {#each Array(manager.totalSteps) as _, i}
          <div
            class="h-2 w-8 rounded-full transition-all {i ===
            manager.currentStep
              ? 'bg-primary-500'
              : 'bg-surface-300 dark:bg-surface-600'}"
          ></div>
        {/each}
      </div>

      <div class="flex gap-2">
        {#if !manager.isFirstStep}
          <button class="btn preset-outline" onclick={() => manager.prevStep()}>
            {t('common.back')}
          </button>
        {/if}

        {#if !manager.isLastStep}
          <button
            class="btn preset-filled"
            disabled={manager.currentStep === 0 &&
              !selectedLocation.state.label}
            onclick={() => manager.nextStep()}
          >
            {t('common.next')}
          </button>
        {:else}
          <button
            class="btn preset-filled-primary"
            disabled={!selectedLocation.state.label}
            onclick={() => manager.complete()}
          >
            {t('common.finish')}
          </button>
        {/if}
      </div>
    </footer>
  </div>
</div>
