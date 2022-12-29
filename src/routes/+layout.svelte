<script>
  import '../app.css';
  import Icon from '$lib/Icon.svelte';
  import { inject } from '@vercel/analytics';

  inject();
</script>

<header class="w-100 p-5">
  <nav class="w-full">
    <div class="flex flex-wrap justify-between">
      <a href="/" class="font-semibold">What's the word?</a>
      <a href="/about" aria-label="about page"><Icon name="fa-solid fa-circle-question" /></a>
    </div>
  </nav>
</header>

<slot />