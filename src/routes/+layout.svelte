<script>
  import { inject } from '@vercel/analytics';
  import '../app.css';
  import Icon from '$lib/Icon.svelte';
  import Toast from '$lib/Toast.svelte';
  import { toasts } from '$lib/stores/toast.js';

  if (!import.meta.env.DEV) {
    inject();
  }
</script>

<header class="w-full p-5">
  <nav class="w-full">
    <div class="flex flex-wrap justify-between">
      <div class="font-semibold">What's the word?</div>
    </div>
  </nav>
</header>

<slot />

<div class="flex flex-col items-start fixed top-2 right-2 w-10/12 gap-3">
  {#each $toasts as {id, message}}
    <Toast {id} {message} />
  {/each}
</div>