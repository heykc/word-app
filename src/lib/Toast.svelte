<script>
  import { fade, fly } from 'svelte/transition';
  import { toasts, removeToast } from '$lib/stores/toast.js';
  import { onMount } from 'svelte';
  import Icon from '$lib/Icon.svelte';

  export let message = '';
  export let id;

  onMount(() => {
    let thisId = id;
    setTimeout(() => {
      removeToast(thisId);
    }, 5000);
  });
</script>

<div
  in:fly={{ y: 100, duration: 400 }}
  out:fade={{ duration: 200 }}
  class="toast rounded-md p-3 bg-yellow-400/30 border-yellow-800/40 border-2 w-full relative"
>
  <button
    class="absolute top-0 right-0 w-6 h-6 rounded-full"
    on:click={() => removeToast(id)}
  >
    <Icon name="fa-solid fa-xmark" />
  </button>
  <p>{ message }</p>
</div>