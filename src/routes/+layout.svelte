<script>
  import * as Sentry from "@sentry/svelte";
  import { BrowserTracing } from "@sentry/tracing";
  import { inject } from '@vercel/analytics';
  import '../app.css';
  import Toast from '$lib/Toast.svelte';
  import { toasts } from '$lib/stores/toast.js';
  import NpIcon from '$lib/NounProject/NpIcon.svelte';

  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();

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

<header class="w-full p-5 h-auto">
  <nav class="w-full md:w-2/3 mx-auto">
    <div class="flex flex-wrap justify-between">
      <div class="font-semibold">What's the word?</div>
      <button command="show-modal" commandfor="help" class="background-transparent text-zinc-200">
        <NpIcon name="question" />
      </button>
    </div>
  </nav>
  <dialog id="help" class="rounded-md p-10 bg-zinc-800 w-full md:w-2/3 text-sm text-zinc-200 backdrop-blur-md backdrop-opacity-40">
    <h2 class="text-lg font-semibold mb-2">How to Play</h2>
    <p class="mb-4">
      Guess words that fit the definition provided.
      Less common words will earn you more points!
    </p>
    <p class="mb-4">
      You have 5 guesses total. A misspelled word counts as a
      guess and will earn you 0 points. Words that are close to
      a possible word will let you try again without penalty.
    </p>
    <p class="mb-4">
      Verb tense is important and will be specified in the definition.
      For instance, if the definition says <i>verb third person present simple</i>,
      then you should guess a word like "runs" instead of "run".
    </p>
    <p>
      The word frequency score is based on the <a href="https://www.ugent.be/pp/experimentele-psychologie/en/research/documents/subtlexus" target="_blank" class="font-bold hover:underline">SUBTLEXus corpus</a>, which 
      is a collection of word frequencies derived from American English subtitles.
      A score of 1 means the word is very common, while a score of 10 means the word is very rare.
    </p>
    <div class="flex justify-end">
      <button class="mt-5 p-2 bg-zinc-200 rounded text-zinc-700 font-bold" commandfor="help" command="close">
        Close
      </button>
    </div>
  </dialog>
</header>

{@render children?.()}

<div class="flex flex-col items-start fixed top-2 right-2 w-10/12 gap-3">
  {#each $toasts as {slot, ...toast}}
    {#if slot}
      <Toast {...toast}>
        {@html slot}
      </Toast>
    {:else}
      <Toast {...toast} />
    {/if}
  {/each}
</div>

<style>
  dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.6);
  }
</style>