<script>
  import html2canvas from 'html2canvas';
  import { browser } from '$app/environment';
  import TextInput from '$lib/TextInput.svelte';
  import Icon from '$lib/Icon.svelte';
  import Accordion from '$lib/Accordion.svelte';
  import Health from '$lib/Health.svelte';
  import { addToast } from '$lib/stores/toast.js';

  export let data;

  let attempts = [];
  let guess = '';
  let correctAnimation = false;

  $: selectedWord = data?.body?.selectedWord;
  $: correctAnswers = attempts.filter(({ correct }) => correct);
  $: health = 5 - attempts.filter(({ correct }) => !correct).length;
  $: gameDone = correctAnswers.length === selectedWord.words.length || health === 0;
  $: gameSuccess = correctAnswers.length;
  $: if (browser) {
    const id = window.localStorage.getItem('id') || '';
    const localAttempts = window.localStorage.getItem('attempts') || '';

    if (selectedWord.id !== id) {
      window.localStorage.removeItem('attempts');
      window.localStorage.removeItem('id');

      attempts = [];
      window.localStorage.setItem('attempts', JSON.stringify(attempts));
      window.localStorage.setItem('id', selectedWord.id);
    }

    if (localAttempts) {
      attempts = JSON.parse(window.localStorage.getItem('attempts'));
    }
  }

  const formatString = (str) => str.replace(/\W/g, '').toLowerCase().trim();

  const submitGuess = () => {
    const formattedGuess = formatString(guess);

    if (!guess) {
      addToast('Please enter a guess.');
      return;
    }

    if (attempts.some(({ guess }) => guess === formattedGuess)) {
      addToast(`You already guessed "${guess}".`);
      guess = '';
      return;
    }
    
    const correct = selectedWord.words.find((w) => w === formattedGuess);
    const newGuess = {
      guess: formattedGuess,
      correct
    };

    if (correct) {
      correctAnimation = true;
      setTimeout(() => {
        correctAnimation = false;
      }, 700);
    }

    attempts = [...attempts, newGuess];
    addToStorage();
    guess = '';
  }

  const addToStorage = () => {
    window.localStorage.setItem('attempts', JSON.stringify(attempts));

    if (gameDone) {
      window.localStorage.setItem('id', selectedWord.id);
    }
  }
</script>

<svelte:head>
  <title>What's the word?</title>
</svelte:head>

<main class="grid grid-cols-3 mt-10 w-full max-w-[700px] relative">
  <!-- Result Message -->
  {#if gameDone}
    <p class="col-start-2 columns-1 text-center text-3xl">
      {#if gameSuccess}
        Congratulations!
      {:else}
        Better luck next time.
      {/if}
    </p>

    <div class="col-start-2 columns-1 flex justify-center mt-5 mb-10">
      <p class="relative text-center text-6xl min-w-[3.5rem]">
        <span>{correctAnswers.length}</span>
        <span class="text-sm text-bold absolute bottom-2 -right-full"> / {selectedWord.words.length} words</span>
      </p>
    </div>
  {:else}
    <div class="col-start-2 columns-1 flex justify-between items-center w-full mb-14">
      <Health {health} />
      <p class="flex justify-end text-lg">
        <span class="correct-answers" class:correct={correctAnimation}>
          {correctAnswers.length}&nbsp;/ {selectedWord.words.length} words
        </span>
      </p>
    </div>

    <TextInput bind:text={guess} {submitGuess} />
  {/if}

  <!-- Definition -->
  <p class="col-start-2 columns-1 p-2 mt-5">
    <span><em>{selectedWord.wordType}</em>. {selectedWord.definition}.</span>
    {#if selectedWord.example}
      <span><i>Example:</i> {selectedWord.example}</span>
    {/if}
  </p>

  <!-- Health/Score -->

  <!-- Info Accordion -->
  <div class="mt-10 mb-20 col-span-full">
    <Accordion summary="Rules">
      <div>
        <p class="text-sm text-zinc-300">
          Every day, a new definition is posted. You must try and guess as many words that fit the definition until you
          make 3 incorrect guesses. The more words you guess correctly, the more points you earn!
        </p>

        <p class="text-sm text-zinc-300 mt-3">
          Disclaimer: I did not create the data set that this app uses, so I cannot guarantee the accuracy of the data.
        </p>
      </div>
    </Accordion>
    <Accordion disabled={!attempts.length}>
      <div slot="summary" class="flex items-center">
        <span>Attempts</span>
        <span class="
          w-4 h-4 rounded-full flex items-center justify-center
          {!attempts.length ? 'bg-zinc-400' : 'bg-zinc-100'}
          text-slate-900 text-sm font-semibold ml-3
        ">
          {attempts.length}
        </span>
      </div>
      <ul class="grid grid-flow-row grid-cols-2 gap-3 mt-4 content-start text-sm text-zinc-300">
        {#each attempts as {guess, correct}}
          <li class="text-sm text-zinc-200 pt-2">
            {guess}
            {#if correct}
              <span class="text-green-400">✓</span>
            {:else}
              <span class="text-red-400">✗</span>
            {/if}
          </li>
        {/each}
      </ul>
    </Accordion>
    <Accordion disabled={!gameDone}>
      <div slot="summary" class="flex items-center">
        Possible Answers
        <span class="
           w-fit h-4 px-1 rounded-full flex items-center justify-center
          {!gameDone ? 'bg-zinc-400' : 'bg-zinc-100'}
          text-slate-900 text-sm font-semibold ml-3
        ">
          {selectedWord.words.length}
        </span>
      </div>
      {#if gameDone}
        {@const attemptedWords = attempts.map(({ guess }) => guess)}
        <ul class="grid grid-flow-row grid-cols-2 gap-3 mt-4 content-start text-sm text-zinc-300">
          {#each selectedWord.words as word}
            <li class="flex justify-between { attemptedWords.includes(word) ? 'font-bold text-green-300' : '' }">
              {word}
            </li>
          {/each}
        </ul>
      {/if}
    </Accordion>
  </div>

  <!-- {#if gameState !== stateEnum.GUESSING && !error}
  <button
    id="share"
    class="
      fixed bottom-0 right-0 w-14 h-14 text-lg m-5 p-2
      rounded-full text-slate-900
      {shareSuccess ? 'bg-green-400' : 'bg-zinc-200'}
    "
    class:success={shareSuccess}
    on:click={async () => {
      if (!navigator.clipboard) {
        error = 'This browser does not support sharing to the clipboard. Try opening this page in Chrome or Edge.';
      };
      const img = await html2canvas(results, { scrollY: -window.scrollY, onclone: (doc) => {
        const r = doc.getElementById('results');
        r.style.backgroundColor = 'black';
        r.style.padding = '1rem';
      } });
      await img.toBlob(async (blob) => {
        if (navigator.clipboard) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          shareSuccess = true;
        }
      });      
    }}
  >
    <Icon name="fa-solid fa-{shareSuccess ? 'check' : 'share'}" />
  </button>
  {/if} -->
</main>

<style>
  main {
    display: grid;
    grid-template-columns: 20px auto 20px;
    grid-flow-row: row;
  }

  :global(.accordion-details) {
    @apply col-span-full;
  }

  :global(.text-input) {
    @apply col-start-2;
    @apply columns-1;
  }

  #share {
    transition: background-color 0.2s ease-in-out;
  }

  #share.success::before {
    opacity: 1;
    transform: translateY(50%) translateX(-130%);
    @apply text-green-400;
  }

  #share::before {
    content: 'copied!';
    position: absolute;
    bottom: 50%;
    left: 0px;
    transform: translateY(50%) translateX(-20%);
    @apply text-gray-50;
    @apply text-lg;
    text-align: center;
    opacity: 0;
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
  }

  #share::after {
    content: 'copy your results to your clipboard';
    position: absolute;
    bottom: 50%;
    right: 40px;
    width: 150px;
    transform: translateY(50%) translateX(-20%);
    @apply text-gray-50;
    @apply text-base;
    text-align: center;
    opacity: 1;
    transition: opacity 0.2s ease-out, transform 0.2s ease-out;
  }

  #share.success::after {
    opacity: 0;
    transform: translateY(50%) translateX(-60%);
  }

  summary::marker {
    font-size: 0;
  }

  .correct-answers {
    transition: transform 0.3s ease-in-out, color 0.2s ease-in-out;
  }

  .correct {
    @apply text-green-400;
    transform: scale(1.2);
  }
</style>