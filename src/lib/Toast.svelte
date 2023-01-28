<script>
  import { fade, fly } from 'svelte/transition';
  import { toasts, removeToast } from '$lib/stores/toast.js';
  import { onMount } from 'svelte';
  import Icon from '$lib/Icon.svelte';
  import { match } from '$lib/utils.js';

  export let message = '';
  export let type = 'info';
  export let delay = 2000;
  export let id;

  $: bgColor = match(type, [
    ['success', 'bg-green-700'],
    ['warning', 'bg-amber-700'],
    ['error', 'bg-red-700'],
    ['_', 'bg-cyan-700'],
  ]);

  onMount(() => {
    let thisId = id;

    if (delay < 0) return;
    
    setTimeout(() => {
      removeToast(thisId);
    }, delay);
  });
</script>

<div
  in:fly={{ y: -100, duration: 400 }}
  out:fade={{ duration: 200 }}
  class="toast rounded-md p-3 text-zinc-50 {bgColor} border-zinc-50 border-2 w-full relative"
>
  <button
    class="absolute top-0 right-0 w-6 h-6 rounded-full "
    on:click={() => removeToast(id)}
  >
    <Icon name="fa-solid fa-xmark" />
  </button>
  <slot>
    <p>{ message }</p>
  </slot>
</div>