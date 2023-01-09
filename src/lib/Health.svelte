<script>
  import { fly } from 'svelte/transition';
  import Icon from '$lib/Icon.svelte';

  export let health;
  export let totalHealth

  $: healthArr = Array.from({ length: totalHealth }, (_, i) => i);
</script>

<div class="flex justify-start gap-2 text-xl">
  {#each healthArr as i}
    {@const name = i < health ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}
    {@const classNames = i < health ? 'text-red-400' : 'text-zinc-400'}
      <span class="relative min-w-[20px]">
        {#if i < health}
          <span out:fly={{ y: -20, duration: 400 }} class="block relative z-10">
            <Icon name="fa-solid fa-heart" classNames="text-red-400" />
          </span>
        {/if}
        <span class="absolute top-0 left-0 w-full h-full">
          <Icon name="fa-regular fa-heart" classNames="text-zinc-400" />
        </span>
      </span>
  {/each}
</div>