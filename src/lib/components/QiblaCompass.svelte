<script lang="ts">
    import { Compass } from "@lucide/svelte";
    
    let { bearing = 0, size = 48 } = $props();
</script>

<div class="relative flex items-center justify-center" style="width: {size}px; height: {size}px;">
    <!-- Static North Indicator (Compass Rose) -->
    <div class="absolute inset-0 text-surface-300 dark:text-surface-700">
        <svg viewBox="0 0 100 100" class="w-full h-full">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" stroke-width="2" />
            <!-- North Mark -->
            <text x="50" y="18" text-anchor="middle" font-size="14" font-weight="bold" fill="currentColor">N</text>
            <!-- Ticks -->
            <line x1="50" y1="2" x2="50" y2="8" stroke="currentColor" stroke-width="2" />
            <line x1="50" y1="92" x2="50" y2="98" stroke="currentColor" stroke-width="2" />
            <line x1="2" y1="50" x2="8" y2="50" stroke="currentColor" stroke-width="2" />
            <line x1="92" y1="50" x2="98" y2="50" stroke="currentColor" stroke-width="2" />
        </svg>
    </div>

    <!-- Rotating Qibla Arrow -->
    <div 
        class="absolute inset-0 text-primary-500 transition-transform duration-700 ease-out"
        style="transform: rotate({bearing}deg);"
    >
        <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-md">
            <!-- Arrow pointing Up (which will be rotated) -->
            <path d="M50 20 L65 60 L50 50 L35 60 Z" fill="currentColor" />
        </svg>
    </div>
</div>
