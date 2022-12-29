<script>
  import { browser } from '$app/environment';
  import TextInput from '$lib/TextInput.svelte';
  import Icon from '$lib/Icon.svelte';

  const stateEnum = {
    GUESSING: 'guessing',
    FAIL: 'fail',
    SIMILAR: 'similar',
    SUCCESS: 'success',
  };

  export let data;

  let attempts = Array.from(Array(3), (_, id) => ({ id, guess: '', answer: '' }));
  let gameState = stateEnum.GUESSING;
  let guess = '';
  let shareSuccess = false;

  $: selectedWord = data?.body?.selectedWord;
  $: formattedSynonyms = selectedWord?.synonyms.map((s) => formatString(s));
  $: currentAttempt = attempts.filter(({answer}) => !!answer).length;
  $: {
    if (attempts[attempts.length - 1].answer === 'incorrect') {
      gameState = stateEnum.FAIL;
    }

    const previousAttempt = attempts[currentAttempt - 1] ?? null;

    if (previousAttempt?.answer === 'correct') {
      gameState = stateEnum.SUCCESS;
    }

    if (previousAttempt?.answer === 'similar') {
      gameState = stateEnum.SIMILAR;
    }
  }
  $: if (browser) {
    const localLastWord = window.localStorage.getItem('lastWord') || '';
    const localAttempts = window.localStorage.getItem('attempts') || '';

    if (localLastWord && selectedWord.word !== localLastWord) {
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
      window.localStorage.setItem('lastWord', selectedWord.word);
    }
  }

  const formatString = (str) => str.replace(/\W/g, '').toLowerCase().trim();

  const submitGuess = () => {
    const newGuess = attempts.find(({id}) => id === currentAttempt);
    const setAttempt = (state) => {
      newGuess.answer = state;
      newGuess.guess = guess;
      attempts[currentAttempt] = newGuess;
    };

    if (formatString(guess) === formatString(selectedWord.word)) {
      setAttempt('correct', stateEnum.SUCCESS);
    } else if (formattedSynonyms.includes(formatString(guess))) {
      setAttempt('similar', stateEnum.SIMILAR);
    } else {
      setAttempt('incorrect');
      guess = '';
    }
  }
</script>

<svelte:head>
  <title>What's the word?</title>
</svelte:head>

<main class="p-10">
  {#if gameState === stateEnum.GUESSING}
    {#if selectedWord}
      <div class="flex flex-row-reverse justify-center gap-2 text-2xl mt-14 mb-14">
        {#each attempts as {id, answer} (id)}
          {@const name = answer === 'incorrect' ? 'fa-regular fa-heart' : 'fa-solid fa-heart'}
          {@const classNames = answer === 'incorrect' ? 'text-zinc-400' : 'text-red-400'}
          <Icon {name} {classNames} />
        {/each}
      </div>

      <TextInput bind:text={guess} {submitGuess} />

      <p class="p-2 mt-5">
        <em>{selectedWord.wordType}</em>. {selectedWord.definition}
      </p>
    {/if}
  {:else if gameState === stateEnum.FAIL}
    <p>Great attempt, but the word was <strong>{selectedWord.word}</strong>.</p>
    <p>You could also have used any of these synonyms: {selectedWord.synonyms.join(', ')}</p>
  {:else if gameState === stateEnum.SIMILAR}
    <p>Congratulations! You took <em>{currentAttempt}</em> attempt{currentAttempt === 1 ? '' : 's'} to guess <strong>{attempts[currentAttempt - 1].guess}</strong>, which is a synonym for today's secret word <strong>{selectedWord.word}</strong>!</p>
    <p>You could have also used any of these synonyms: {formattedSynonyms.filter((w) => w !== formatString(attempts[currentAttempt - 1].guess)).join(', ')}</p>
  {:else if gameState === stateEnum.SUCCESS}
    <p>Congratulations! You took <em>{currentAttempt}</em> attempt{currentAttempt === 1 ? '' : 's'} to guess <strong>{attempts[currentAttempt - 1].guess}</strong>, which is today's secret word!</p>
    <p>You could have also used any of these synonyms: {selectedWord.synonyms.join(', ')}</p>
  {/if}

  <div class="m-10">
    {#each attempts.filter((a) => a.answer) as {guess, answer}}
      <p class="text-sm text-center text-zinc-200 font-bold pt-2">
        {guess}
        {#if answer === 'correct'}
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
        let text = `${Array.from(attempts, ({answer}) => answer === 'incorrect' ? black : red ).join('')} "What's the word?"`
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