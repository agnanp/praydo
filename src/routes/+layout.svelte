<script lang="ts">
    import "../app.css";
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { selectedLocation } from '$lib/store/selectedLocation';
    import { onMount } from 'svelte';

    let { children } = $props();
    let isStoreLoaded = $state(false);

    onMount(async () => {
        try {
            // Wait for store to verify data persistence
            await selectedLocation.init();
        } catch (e) {
            console.error("Failed to load location store", e);
        } finally {
            isStoreLoaded = true;
        }
    });

    $effect(() => {
        if (isStoreLoaded) {
             const isLocationSet = selectedLocation.state.label && selectedLocation.state.label.trim() !== "";
             const isSettingsPage = $page.url.pathname.startsWith('/settings');

             if (!isLocationSet && !isSettingsPage) {
                 goto('/settings');
             }
        }
    });
</script>

{@render children()}
