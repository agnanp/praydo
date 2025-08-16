<script lang="ts">
  import { Switch } from '@skeletonlabs/skeleton-svelte';
  import { modeLightSwitch } from '$lib/store/modeLightSwitch';

  let checked = $state(false);

  $effect(() => {
    const mode = modeLightSwitch.state.mode || 'light';
    checked = mode === 'dark';
  });

  const onCheckedChange = (event: { checked: boolean }) => {
    const mode = event.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-mode', mode);
    modeLightSwitch.state.mode = mode;
    checked = event.checked;
  };
</script>

<Switch controlActive='preset-tonal-primary' controlInactive='bg-secondary-50' {checked} {onCheckedChange} />