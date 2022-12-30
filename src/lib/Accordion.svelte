<script context="module">
  let opened;
</script>

<script>
  import Icon from '$lib/Icon.svelte';

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
      <Icon name="fa-solid fa-chevron-down" classNames="arrow"/>
    {/if}
  </summary>
  <div class="p-3">
    <slot />
  </div>
</details>

<style>
  summary::marker {
    font-size: 0;
  }

  :global(details .arrow) {
    transition: transform 0.2s ease-in-out;
  }

  :global(details[open] .arrow) {
    transform: rotate(180deg);
  }

  /* :global(.accordion-details > summary) {
    position: relative;
  }

  :global(.accordion-details > summary::after) {
    content: '▶';
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.5rem;
    margin-left: 0.5rem;
  } */
</style>