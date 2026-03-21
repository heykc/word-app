<script>
  import { fade, fly } from 'svelte/transition';
  import { toasts, removeToast } from '$lib/stores/toast.js';
  import { onMount } from 'svelte';
  import NpIcon from '$lib/NounProject/NpIcon.svelte';
  import { match } from '$lib/utils.js';

  /**
   * @typedef {Object} Props
   * @property {string} [message]
   * @property {string} [type]
   * @property {number} [delay]
   * @property {any} id
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let {
    message = '',
    type = 'info',
    delay = 2000,
    id,
    children
  } = $props();

  let bgColor = $derived(match(type, [
    ['success', 'bg-emerald-700'],
    ['warning', 'bg-amber-700'],
    ['error', 'bg-red-700'],
    ['_', 'bg-cyan-700'],
  ]));

  onMount(() => {
    let thisId = id;

    if (delay < 0) return;
    
    setTimeout(() => {
      removeToast(thisId);
    }, delay);
  });
</script>

<div
  in:fly|global={{ y: -100, duration: 400 }}
  out:fade|global={{ duration: 200 }}
  class="toast rounded-md p-3 text-zinc-50 {bgColor} border-zinc-50 border-2 w-full relative"
>
  <button
    class="absolute top-0 right-0 w-6 h-6 rounded-full "
    onclick={() => removeToast(id)}
  >
    <NpIcon name="wrong" />
  </button>
  {#if children}{@render children()}{:else}
    <p>{ message }</p>
  {/if}
</div>