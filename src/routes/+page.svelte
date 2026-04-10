<script>
  import { onMount } from 'svelte';
  import stringSimilarity from 'string-similarity';
  import { addToast } from '$lib/stores/toast.js';



  let { data } = $props();
  let synonyms = $derived(data?.body?.synonyms);
  let guesses = $state([]);
  let maxGuesses = $derived.by(() => Math.min(5, synonyms?.scoredWords?.length ?? 0));
  let answerCount = $state(0);
  let userInput = $state('');

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

    if (guesses.some(({ guess }) => guess === str)) {
      addToast(`You already guessed "${str}".`);
      return false;
    }

    return true;
  };

  const submitGuess = (event) => {
    event.preventDefault();
    const formattedGuess = formatString(userInput);

    if (!validateGuess(formattedGuess)) {
      userInput = '';
      return;
    }

    const remainingWords = synonyms.scoredWords.filter(({ word }) => !guesses.some(({ guess }) => guess === word));
    const match = stringSimilarity.findBestMatch(formattedGuess, remainingWords.map(({ word }) => word));
    const guessObject = { guess: userInput, score: 0 };

    if (match.bestMatch.rating > 0.6 && match.bestMatch.rating < 1) {
      const text = `"${formattedGuess}" is close! Check your spelling or try a word spelled similarly.`;
      addToast(text, { delay: 5000 });
      return;
    }

    if (match.bestMatch.rating === 1) {
      guessObject.score = remainingWords.find(({ word }) => word === formattedGuess).score ?? 0;
    }

    guesses[answerCount] = guessObject;
    answerCount += 1;
    userInput = '';
    document.querySelector(`[data-input-id="${answerCount}"]`)?.focus();

    // persist guesses to local storage so they aren't lost on refresh
    window.localStorage.setItem('guesses', JSON.stringify(guesses));
  };

  /**
   * copies the results to the clipboard. Also sends a message to Sentry in order
   * to track how many users' browsers support this feature
  */
  const shareResults = () => {
    if (navigator.clipboard) {
      const possibleScores = { 0: '0️⃣', 1: '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣', 5: '5️⃣', 6: '6️⃣', 7: '7️⃣', 8: '8️⃣', 9: '9️⃣', 10: '🔟' };
      const scores = guesses.map(({ score }, index) => possibleScores[score]).join(' ');
      const text = `${scores} = ${guesses.reduce((acc, { score }) => acc + score, 0)}\nhttps://word.indoorkeith.com`
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

  onMount(() => {
    const storageId = window.localStorage.getItem('id') || '';
    const storageGuesses = window.localStorage.getItem('guesses') || '';

    // refresh the game state if the word has changed
    if (synonyms.id !== storageId) {
      window.localStorage.removeItem('guesses');
      window.localStorage.removeItem('id');

      guesses = Array(maxGuesses).fill({ guess: null, score: null });
      answerCount = 0;
      window.localStorage.setItem('guesses', JSON.stringify(guesses));
      window.localStorage.setItem('id', synonyms.id);
    }

    if (storageGuesses) {
      guesses = JSON.parse(window.localStorage.getItem('guesses'));
      answerCount = guesses.filter(({ score }) => score !== null).length;
    }
  });

  $effect(() => {
    const activeInput = document.querySelector(`[data-input-id="${answerCount}"]`);
    if (activeInput) {
      activeInput.focus();
    }
  })
</script>

<svelte:head>
  <title>The Synonym Game by indoorkeith</title>
</svelte:head>

<main class="flex flex-col w-full max-w-3xl mx-auto p-8">
  {#if answerCount >= maxGuesses}
    {@const totalScore = guesses.reduce((acc, { score }) => acc + score, 0)}
    <p class="text-center text-2xl">You scored <b>{totalScore}</b> points!</p>
    <button
      class="text-center mx-auto w-[300px] mt-4 px-4 py-2 bg-zinc-300 text-zinc-700 font-bold rounded-full hover:bg-zinc-100 transition-colors duration-300"
      onclick={shareResults}
    >
      Share your results
    </button>
  {/if}

  <!-- Definition -->
  <p class="p-2 mt-5 w-full mx-auto">
    <span>
      <em>{synonyms.wordType}</em>. {synonyms.definition}.
    </span>
    {#if synonyms.example}
      <span>
        <i>Example:</i> {synonyms.example}
      </span>
    {/if}
  </p>

  <div class="mt-8 w-full md:w-1/2 mx-auto">
    <!-- 5 empty pills that get filled with each guess -->
    {#each guesses as { guess, score }, index}
      {#if index === answerCount}
        <form onsubmit={submitGuess}>
          <label for="guess-input" class="hidden">
            Guess the word:
          </label>
          <div id="guess" class="w-full mx-auto relative">
            <input
              type="text"
              id="guess-input"
              placeholder="Enter a word"
              autocomplete="off"
              data-input-id={index}
              class="w-full h-12 mb-4 bg-zinc-100 text-zinc-700 rounded-full px-4 text-center focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
              bind:value={userInput}
            />
          </div>
        </form>
      {:else if guess === null}
        <div class="w-full h-12 mb-4 bg-zinc-700 rounded-full"></div>
      {:else}
        <div class="w-full h-12 mb-4 rounded-full flex items-center justify-center gap-2 px-4"
          class:bg-green-700={score > 0}
          class:bg-zinc-700={score === 0}
        >
          <span>{guess}</span>
          {#if score > 0}
            <span class="text-green-100">+{score}</span>
          {/if}
        </div>
      {/if}
    {/each}
  </div>

  <!-- possible words in 1 column going downward with grid -->
  {#if answerCount >= maxGuesses}
    <h2 class="text-center mt-8 text-2xl font-bold">Possible words:</h2>
    <div class="flex flex-col gap-4 mt-4 text-center w-full sm:w-1/2 mx-auto">
      {#each synonyms.scoredWords as { word, score }, index}
        <!-- give every other div a .5 transparent background color -->
        <div class="flex items-center p-2 justify-between" class:test={index % 2 !== 0}>
          <span>{word}</span>
          <span class="text-green-500">+{score}</span>
        </div>
      {/each}
    </div>
  {/if}
</main>

<style>
  .test {
    background-color: rgba(255, 255, 255, 0.05);
  }
</style>



