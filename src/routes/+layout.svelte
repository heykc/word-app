<script>
  import * as Sentry from "@sentry/svelte";
  import { BrowserTracing } from "@sentry/tracing";
  import { inject } from '@vercel/analytics';
  import '../app.css';
  import Icon from '$lib/Icon.svelte';
  import Toast from '$lib/Toast.svelte';
  import { toasts } from '$lib/stores/toast.js';

  if (!import.meta.env.DEV) {
    inject();
  }

  // Initialize the Sentry SDK here
  Sentry.init({
    dsn: "https://3270071879a84dc997719701d0c4ae5b@o4504475346796544.ingest.sentry.io/4504475348303872",
    integrations: [new BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
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