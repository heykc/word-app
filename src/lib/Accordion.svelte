<script context="module">
  let opened;
</script>

<script>
  import NpIcon from '$lib/NounProject/NpIcon.svelte';

  export let summary = '';
  export let disabled = false;
  
  let details;

  const closeOthers = (event) => {
    event.stopPropagation();
    event.preventDefault();
    
    if (disabled) return;

    details.open = !details.open;
    if (opened && opened !== details) opened.open = false;
    opened = details;
  }
</script>

<details
  bind:this={details}
  class="border-t-2 border-zinc-300 p-3 accordion-details {disabled ? 'text-zinc-500' : ''}"
  on:click={closeOthers}
>
  <summary class="flex items-center justify-between">
    <slot name="summary">
      {summary}
    </slot>
    {#if !disabled}
      <NpIcon name="chevron" />
    {/if}
  </summary>
  <div class="p-3">
    <slot />
  </div>
</details>

<style>
  summary::marker,
  details summary::-webkit-details-marker {
    display:none;
    font-size: 0;
  }

  :global(details .np-icon) {
    transition: transform 0.2s ease-in-out;
  }

  :global(details[open] .np-icon) {
    transform: rotate(180deg);
  }
</style>