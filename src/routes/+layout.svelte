<script>
  import { inject } from '@vercel/analytics';
  import '../app.css';
  import Icon from '$lib/Icon.svelte';

  if (!import.meta.env.DEV) {
    inject();
  }
</script>

<header class="w-100 p-5">
  <nav class="w-full">
    <div class="flex flex-wrap justify-between">
      <div class="font-semibold">What's the word?</div>
      <!-- <a href="/about" aria-label="about page"><Icon name="fa-solid fa-circle-question" /></a> -->
    </div>
  </nav>
</header>

<slot />