<script>
  import { fly } from 'svelte/transition';
  import NpIcon from '$lib/NpIcon.svelte';

  export let health;
  export let totalHealth

  $: healthArr = Array.from({ length: totalHealth }, (_, i) => i);
</script>

<div class="flex justify-start gap-2 text-xl">
  {#each healthArr as i}
      <span class="relative min-w-[24px]">
        {#if i < health}
          <span out:fly={{ y: -20, duration: 400 }} class="block relative z-10">
            <NpIcon name="heart" classNames="text-red-400" />
          </span>
        {:else}
          <span class="absolute top-0 left-0 w-full h-full">
            <NpIcon name="heart" classNames="text-zinc-400 empty-heart" />
          </span>
        {/if}
      </span>
  {/each}
</div>

<style>
  :global(.empty-heart) {
    stroke: currentColor;
    stroke-width: 0.2em;
    fill: transparent !important;
  }
</style>