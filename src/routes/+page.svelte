<script>
  import { browser } from '$app/environment';
  import TextInput from '$lib/TextInput.svelte';
  import Icon from '$lib/Icon.svelte';
  import Accordion from '$lib/Accordion.svelte';

  const stateEnum = {
    GUESSING: 'guessing',
    FAIL: 'fail',
    SUCCESS: 'success',
  };

  export let data;

  let attempts = Array.from(Array(3), (_, id) => ({ id, guess: '', matchId: '' }));
  let guess = '';
  let shareSuccess = false;

  $: selectedWord = data?.body?.selectedWord;
  $: currentAttempt = attempts.filter(({guess}) => !!guess).length;
  $: gameState = attempts.some(({matchId}) => matchId)
    ? stateEnum.SUCCESS
    : attempts.every(({guess}) => guess)
      ? stateEnum.FAIL
      : stateEnum.GUESSING;
  $: if (browser) {
    const localLastWord = window.localStorage.getItem('lastWord') || '';
    const localAttempts = window.localStorage.getItem('attempts') || '';

    if (localLastWord && selectedWord.id !== localLastWord) {
      window.localStorage.removeItem('attempts');
      window.localStorage.removeItem('lastWord');
    }

    if (localAttempts) {
      attempts = JSON.parse(window.localStorage.getItem('attempts'));
    }
  }
  $: if (browser) {
    window.localStorage.setItem('attempts', JSON.stringify(attempts));

    if (gameState !== stateEnum.GUESSING) {
      window.localStorage.setItem('lastWord', selectedWord.id);
    }
  }

  const formatString = (str) => str.replace(/\W/g, '').toLowerCase().trim();

  const submitGuess = () => {
    if (!guess) return;

    const formattedGuess = formatString(guess);
    const matchId = selectedWord.words[formattedGuess] ? formattedGuess : '';
    const newGuess = attempts[currentAttempt];

    newGuess.matchId = matchId;
    newGuess.guess = guess;
    attempts[currentAttempt] = newGuess;
    guess = '';
  }
</script>

<svelte:head>
  <title>What's the word?</title>
</svelte:head>

<main class="grid grid-cols-3 mt-10">
  <!-- Result Message -->
  <p class="col-start-2 columns-1 text-center text-3xl">
    {#if gameState === stateEnum.FAIL}
      Better luck next time.
    {:else if gameState === stateEnum.SUCCESS}
      Congratulations!
    {/if}
  </p>

  <!-- Health/Score -->
  <div class="col-start-2 columns-1 flex flex-col content-center flex-wrap mt-5 mb-10">
    <div class="flex flex-row-reverse justify-center gap-2 text-2xl">
      {#each attempts as { guess, matchId }}
        {@const incorrect = guess && !matchId}
        {@const name = incorrect ? 'fa-regular fa-heart' : 'fa-solid fa-heart'}
        {@const classNames = incorrect ? 'text-zinc-400' : 'text-red-400'}

        <Icon {name} {classNames} />
      {/each}
    </div>

    {#if gameState !== stateEnum.GUESSING}
      {@const match = selectedWord.words[attempts.find(({matchId}) => matchId)?.matchId]}
      {@const score = match?.score ?? 0}

      <div class="self-center text-8xl text-zinc-200 font-bold text-center relative mt-6 w-fit">
        {score} <span class="text-sm text-bold absolute bottom-2 -right-8">PTS</span>
      </div>
    {/if}
  </div>

  <!-- Guess Input -->
  {#if gameState === stateEnum.GUESSING}
    <TextInput bind:text={guess} {submitGuess} />
  {/if}

  <!-- Definition -->
  <p class="col-start-2 columns-1 p-2 mt-5">
    <em>{selectedWord.wordType}</em>. {selectedWord.definition}
  </p>

  <!-- Info Accordion -->
  <div class="mt-10 col-span-full">
    <Accordion summary="Rules">
      <div>
        <p class="text-sm text-zinc-300">
          Every day, a new definition is posted. You have three attempts to guess a word that matches the definition.
          You are awarded points based on the frequency of the word in the English language. The less common the word,
          the more points you earn.
        </p>

        <p class="text-sm text-zinc-300 mt-3">
          Disclaimer: I did not create the data set that this app uses, so I cannot guarantee the accuracy of the data.
        </p>
      </div>
    </Accordion>
    <Accordion disabled={attempts.every(({guess}) => !guess)}>
      <div slot="summary" class="flex items-center">
        <span>Attempts</span>
        <span class="
          w-4 h-4 rounded-full flex items-center justify-center
          {attempts.every(({guess}) => !guess) ? 'bg-zinc-400' : 'bg-zinc-100'}
          text-slate-900 text-sm font-semibold ml-3
        ">
          {currentAttempt}
        </span>
      </div>
      {#each attempts.filter(({ guess }) => guess) as {guess, matchId}}
        <p class="text-sm text-zinc-200 pt-2">
          {guess}
          {#if matchId}
            <span class="text-green-400">✓</span>
          {:else}
            <span class="text-red-400">✗</span>
          {/if}
        </p>
      {/each}
    </Accordion>
    <Accordion disabled={gameState === stateEnum.GUESSING}>
      <div slot="summary">
        Possible Answers
        {#if gameState === stateEnum.GUESSING}
          <Icon name="fa-solid fa-lock" classNames="text-sm" />
        {/if}
      </div>
      {#if gameState !== stateEnum.GUESSING}
        {@const matchId = attempts.find(({matchId}) => matchId)?.matchId}
        <ul class="grid grid-flow-row grid-cols-2 gap-3 mt-4 content-start text-sm text-zinc-300">
          {#each Object.entries(selectedWord.words) as [id, { word, score }]}
            <li class="flex justify-between { matchId === id ? 'font-bold text-green-300' : '' }">
              {word} <span class="font-semibold">{score}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </Accordion>
  </div>

  <!-- {#if gameState !== stateEnum.GUESSING}
  <button
    id="share"
    class="
      fixed bottom-0 right-0 w-14 h-14 text-lg m-5 p-2
      rounded-full text-slate-900
      {shareSuccess ? 'bg-green-400' : 'bg-zinc-200'}
    "
    class:success={shareSuccess}
    on:click={async () => {
      if (navigator.clipboard) {
        const red = `❤️`;
        const black = `🖤`;
        let text = `${Array.from(attempts, ({matchId}) => !matchId ? black : red ).join('')} "What's the word?"`
        await navigator.clipboard.writeText(text);
        shareSuccess = true;
      }
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
    color: #fff;
    opacity: 0;
    transition: opacity 0.4s ease-out, transform 0.4s ease-out;
  }

  summary::marker {
    font-size: 0;
  }
</style>