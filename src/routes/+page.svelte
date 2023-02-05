<script>
  import { onMount } from 'svelte';
  import { captureException, captureMessage } from '@sentry/browser';
  import stringSimilarity from 'string-similarity';
  import TextInput from '$lib/TextInput.svelte';
  import NpIcon from '$lib/NpIcon.svelte';
  import Accordion from '$lib/Accordion.svelte';
  import Health from '$lib/Health.svelte';
  import Attempt from '$lib/Attempt.svelte';
  import { addToast } from '$lib/stores/toast.js';
  import { match } from '$lib/utils.js';

  export let data;

  const totalHealth = 5;

  let attempts = [];
  let guess = '';
  let correctAnimation = false;

  $: selectedWord = data?.body?.selectedWord;
  $: correctAnswers = attempts.filter(({ status }) => status === 'correct').map(({ guess }) => guess);
  $: health = totalHealth - attempts.filter(({ status }) => status === 'incorrect').length;
  $: gameDone = correctAnswers.length === selectedWord.words.length || health === 0;
  $: gameSuccess = correctAnswers.length;

  onMount(() => {
    const storageId = window.localStorage.getItem('id') || '';
    const storageAttempts = window.localStorage.getItem('attempts') || '';

    // refresh the game state if the word has changed
    if (selectedWord.id !== storageId) {
      window.localStorage.removeItem('attempts');
      window.localStorage.removeItem('id');

      attempts = [];
      window.localStorage.setItem('attempts', JSON.stringify(attempts));
      window.localStorage.setItem('id', selectedWord.id);
    }

    if (storageAttempts) {
      attempts = JSON.parse(window.localStorage.getItem('attempts'));
    }
  })

  /**
   * removes all non-alphanumeric characters and whitespace and converts to lowercase
  */
  const formatString = (str) => str.replace(/\W/g, '').toLowerCase().trim();

  /**
   * confirms the guess is valid. ignores empty strings and duplicates and provides
   * feedback to the user
  */
  const validateGuess = (str) => {
    if (!str) {
      addToast('Please enter a guess.', { type: 'warning' });
      return false;
    }

    if (attempts.some(({ guess }) => guess === str)) {
      addToast(`You already guessed "${guess}".`);
      return false;
    }

    return true;
  };

  const submitGuess = () => {
    const formattedGuess = formatString(guess);

    if (!validateGuess(formattedGuess)) {
      guess = '';
      return;
    }

    const remainingWords = selectedWord.words.filter((word) => !correctAnswers.includes(word));
    const match = stringSimilarity.findBestMatch(formattedGuess, remainingWords);

    let status = 'incorrect';
    if (match.bestMatch.rating > 0.6) {
      if (match.bestMatch.rating === 1) status = 'correct';
      else {
        status = 'near';

        const text = `"${formattedGuess}" is close! Check your spelling or try a word spelled similarly.`;
        addToast(text, { delay: 5000 });
      }
    }

    const newGuess = {
      status,
      guess: formattedGuess,
    };

    attempts = [...attempts, newGuess];
    window.localStorage.setItem('attempts', JSON.stringify(attempts));
    guess = '';

    if (status === 'correct') {
      correctAnimation = true;
      setTimeout(() => {
        correctAnimation = false;
      }, 700);
    }
  }

  /**
   * copies the results to the clipboard. Also sends a message to Sentry in order
   * to track how many users' browsers support this feature
  */
  const shareResults = () => {
    if (navigator.clipboard) {
      const results = attempts.map(({ status }) => match(status, [
        ['correct', '✅'],
        ['near', '✴️'],
        ['incorrect', '❌'],
      ])).join('');
      const text = `${results} word.heykc.co`
      navigator.clipboard.writeText(text)
        .then(() => {
          addToast('Your results were copied to your clipboard!', { type: 'success' });
        })
        .catch((error) => {
          if (error.name === 'NotAllowedError') {
            addToast(
              '',
              {
                delay: -1,
                slot: `
                  <p>Something went wrong. Try again in a different browser, or select and copy your results below:</p>
                  <pre class="mt-2 bg-slate-800 p-4 rounded-sm" style="user-select: all;">${text}</pre>
                `
              },
            );
            captureMessage('Clipboard access not allowed.');
            return;
          }
          addToast(
              '',
              {
                delay: -1,
                slot: `
                  <p>Something went wrong. Try again in a different browser, or select and copy your results below:</p>
                  <pre class="mt-2 bg-slate-800 p-4 rounded-sm" style="user-select: all;">${text}</pre>
                `
              },
            );
          captureException(error);
        });
    } else {
      addToast(
        '',
        {
          delay: -1,
          slot: `
            <p>Something went wrong. Try again in a different browser, or select and copy your results below:</p>
            <pre class="mt-2 bg-slate-800 p-4 rounded-sm" style="user-select: all;">${text}</pre>
          `
        },
      );
      captureMessage('Copying to clipboard is not supported in this browser.');
    }
  };
</script>

<svelte:head>
  <title>What's the word?</title>
</svelte:head>

<main class="grid grid-cols-3 mt-10 w-full max-w-[700px] relative">
  {#if !gameDone}
    <!-- Game -->
    <div class="col-start-2 columns-1 flex justify-between items-center w-full mb-14">
      <Health {health} {totalHealth} />
      <p class="flex justify-end text-lg">
        <span class="correct-answers" class:correct={correctAnimation}>
          {correctAnswers.length}&nbsp;/ {selectedWord.words.length} words
        </span>
      </p>
    </div>

    <TextInput bind:text={guess} {submitGuess} />
  {:else}
    {@const score = `You guessed <span class="font-bold text-2xl">${correctAnswers.length}</span> out of ${selectedWord.words.length} words.`}

    <!-- Results -->
    <div class="col-start-2 columns-1 flex flex-col w-full items-center">
      <p class="text-center text-xl">
        {#if gameSuccess}
          Congratulations! {@html score}
        {:else}
          {@html score} Better luck next time.
        {/if}
      </p>

      <!-- Share Button -->
      <button
        class="p-3 text-base bg-zinc-200 text-slate-900 rounded-md mt-5"
        on:click={shareResults}
      >
        <span>Share results</span>
        <NpIcon name="forward" classNames="ml-2 text-lg" />
      </button>
    </div>
  {/if}

  <!-- Definition -->
  <p class="col-start-2 columns-1 p-2 mt-5">
    <span>
      <em>{selectedWord.wordType}</em>. {selectedWord.definition}.
    </span>
    {#if selectedWord.example}
      <span>
        <i>Example:</i> {selectedWord.example}
      </span>
    {/if}
  </p>

  <div class="mt-10 mb-20 col-span-full">
    <!-- Game Rules -->
    <Accordion summary="Rules">
      <div>
        <p class="text-sm text-zinc-300">
          Every day, a new definition is posted. You must try and guess as many words that fit the definition until you
          make 5 incorrect guesses. The more words you guess correctly, the more points you earn!
        </p>

        <p class="text-sm text-zinc-300 mt-3">
          Open the Attempts drawer to see your previous guesses for the day.
        </p>
          <ul class="text-sm text-zinc-300 mt-3">
            <li><NpIcon name="okay" classNames="text-emerald-400" /> means you guessed correctly.</li>
            <li><NpIcon name="wrong" classNames="text-red-400" /> means you guessed incorrectly.</li>
            <li>
              <NpIcon name="asterisk" classNames="text-amber-400" /> means you guessed a word that is
              similar to a correct answer, but you may have misspelled it or used the wrong tense or plural form.
            </li>
          </ul>

        <p class="text-sm text-zinc-300 mt-3">
          Examples may not always match the required tense or plural form listed before the definition.
        </p>

        <p class="text-sm text-zinc-300 mt-3">
          Disclaimer: I did not create the data set that this app uses, so I cannot guarantee the accuracy of the data.
        </p>
      </div>
    </Accordion>

    <!-- Attempts Made -->
    <Accordion disabled={!attempts.length}>
      <div slot="summary" class="flex items-center">
        <span>Attempts</span>
        <span class="
          w-fit h-4 px-1 rounded-full flex items-center justify-center
          {!attempts.length ? 'bg-zinc-400' : 'bg-zinc-100'}
          text-slate-900 text-sm font-semibold ml-3
        ">
          {attempts.length}
        </span>
      </div>

      <ul class="grid grid-flow-row grid-cols-2 gap-3 mt-4 content-start text-sm text-zinc-300">
        {#each attempts as attempt}
          <Attempt {attempt} />
        {/each}
      </ul>
    </Accordion>

    <!-- Possible Answers -->
    <Accordion disabled={!gameDone}>
      <div slot="summary" class="flex items-center">
        <span>Possible Answers</span>
        <span class="
           w-fit h-4 px-1 rounded-full flex items-center justify-center
          {!gameDone ? 'bg-zinc-400' : 'bg-zinc-100'}
          text-slate-900 text-sm font-semibold ml-3
        ">
          {selectedWord.words.length}
        </span>
      </div>

      <ul class="grid grid-flow-row grid-cols-2 gap-3 mt-4 content-start text-sm text-zinc-300">
        {#each selectedWord.words as word}
          {@const correctWordStyles = correctAnswers.includes(word) ? 'font-bold text-emerald-300' : ''}

          <li class="flex justify-between {correctWordStyles}">
            {word}
          </li>
        {/each}
      </ul>
    </Accordion>
  </div>
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

  .correct-answers {
    transition: transform 0.3s ease-in-out, color 0.2s ease-in-out;
  }

  .correct {
    @apply text-emerald-400;
    transform: scale(1.2);
  }
</style>