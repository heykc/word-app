<script>
  import '../app.css';
  import Icon from '$lib/Icon.svelte';
</script>

<header class="w-100 bg-zinc-900 p-5">
  <nav class="w-full">
    <div class="flex flex-wrap justify-between">
      <a href="/" class="font-semibold">What's the word?</a>
      <a href="/about"><Icon name="fa-solid fa-circle-question" label="about" /></a>
    </div>
  </nav>
</header>

<slot />