<script>
  import { browser } from '$app/environment';
  import TextInput from '$lib/TextInput.svelte';
  import Icon from '$lib/Icon.svelte';

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

<main class="p-10">
  <div class="flex flex-col content-center flex-wrap mt-14 mb-14">
    <div class="flex flex-row-reverse justify-center gap-2 text-2xl">
      {#each attempts as {guess, matchId}}
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

  {#if gameState === stateEnum.GUESSING}
    <TextInput bind:text={guess} {submitGuess} />

    <p class="p-2 mt-5">
      <em>{selectedWord.wordType}</em>. {selectedWord.definition}
    </p>
  {:else if gameState === stateEnum.FAIL}
    <p>Nice try, but you're all out of hearts.</p>
    <p>These are the words, and their associated scores, we would have accepted for today's definition:</p>
    <ul class="list-disc list-inside">
      {#each Object.values(selectedWord.words) as { word, score }}
        <li>{word} <span>{score}</span></li>
      {/each}
    </ul>
  {:else if gameState === stateEnum.SUCCESS}
    {@const match = selectedWord.words[attempts[currentAttempt - 1].matchId]}
    <p>Nice one! You earned {match.score} points for your word!</p>
    <p>These were all the accepted words, along with their associated scores:</p>
    <ul class="grid grid-flow-row grid-cols-2 gap-2 mt-4 content-start justify-items-end">
      {#each Object.values(selectedWord.words) as { word, score }}
        <li>{word} <span class="font-semibold">{score}</span></li>
      {/each}
    </ul>
  {/if}

  <div class="m-10">
    {#each attempts.filter(({ guess }) => guess) as {guess, matchId}}
      <p class="text-sm text-center text-zinc-200 font-bold pt-2">
        {guess}
        {#if matchId}
          <span class="text-green-400">✓</span>
        {:else}
          <span class="text-red-400">✗</span>
        {/if}
      </p>
    {/each}
  </div>

  {#if gameState !== stateEnum.GUESSING}
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
  {/if}
</main>

<style>
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
</style>