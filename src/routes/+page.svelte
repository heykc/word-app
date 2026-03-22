<script>
  import { onMount } from 'svelte';
  import stringSimilarity from 'string-similarity';
  import { addToast } from '$lib/stores/toast.js';



  let { data } = $props();
  let synonyms = $derived(data?.body?.synonyms);
  let guesses = $state([]);
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

    guesses = [...guesses, guessObject];
    userInput = '';

    // persist guesses to local storage so they aren't lost on refresh
    window.localStorage.setItem('guessesV2', JSON.stringify(guesses));
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
    const storageGuesses = window.localStorage.getItem('guessesV2') || '';

    // refresh the game state if the word has changed
    if (synonyms.id !== storageId) {
      window.localStorage.removeItem('guessesV2');
      window.localStorage.removeItem('id');

      guesses = [];
      window.localStorage.setItem('guessesV2', JSON.stringify(guesses));
      window.localStorage.setItem('id', synonyms.id);
    }

    if (storageGuesses) {
      guesses = JSON.parse(window.localStorage.getItem('guessesV2'));
    }
  });
</script>

<svelte:head>
  <title>The Synonym Game by indoorkeith</title>
</svelte:head>

<main class="flex flex-col w-full xl:w-1/2 mx-auto p-20">
  {#if guesses.length < 5}
    <form
      class="flex flex-col items-center gap-4 w-full mx-auto mt-8 lg:w-1/3"
      onsubmit={submitGuess}
    >
      <label for="guess-input" class="hidden">
        Guess the word:
      </label>
      <div id="guess" class="w-full mx-auto relative">
        <input
          type="text"
          id="guess-input"
          placeholder="Enter a word"
          class="w-full bg-transparent border-0
          outline-none text-center p-2 text-2xl focus:placeholder:opacity-0
          transition-all duration-300"
          bind:value={userInput}
        />
      </div>
    </form>
  {:else}
    {@const totalScore = guesses.reduce((acc, { score }) => acc + score, 0)}
    <p class="text-center text-2xl mt-8">Your total score is {totalScore}!</p>
    <button
      class="text-center mx-auto w-1/3 mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300"
      onclick={shareResults}
    >
      Share your results
    </button>
  {/if}

  <!-- Definition -->
  <p class="p-2 mt-5 w-full xl:w-1/3 mx-auto">
    <span>
      <em>{synonyms.wordType}</em>. {synonyms.definition}.
    </span>
    {#if synonyms.example}
      <span>
        <i>Example:</i> {synonyms.example}
      </span>
    {/if}
  </p>

  <div class="mt-8 w-auto">
    {#each guesses as { guess, score }, index}
      <div class="flex items-center gap-2">
        <span>{index + 1}. {guess}</span>
        {#if score > 0}
          <span class="text-green-500">+{score}</span>
        {:else}
          <span class="text-red-500">{score}</span>
        {/if}
      </div>
    {/each}
  </div>

  <!-- possible words in 1 column going downward with grid -->
  {#if guesses.length >= 5}
    <h2 class="text-center mt-8">Possible words:</h2>
    <div class="flex flex-col gap-4 mt-4">
      {#each synonyms.scoredWords as { word, score }}
        <div class="flex items-center gap-2">
          <span>{word}</span>
          {#if score > 0}
            <span class="text-green-500">+{score}</span>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</main>

<style>
  #guess::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: calc(50%);
    transform: translateX(-50%);
    width: 100%;
    height: 2px;
    @apply bg-slate-400;
  }

  #guess::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: calc(50%);
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    @apply bg-white;
    transition: width 0.3s ease;
  }

  #guess:focus-within::after {
    width: 100%;
    height: 3px;
  }
</style>



