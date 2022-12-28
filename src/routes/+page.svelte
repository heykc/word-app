<script>
  import TextInput from '$lib/TextInput.svelte';
  import Icon from '$lib/Icon.svelte';
  export let data;

  const resultEnum = {
    GUESSING: 'guessing',
    FAILED: 'failed',
    SIMILAR: 'similar',
    CORRECT: 'correct',
  };

  let attempts = Array.from(Array(3), (_, id) => ({ id, guess: '', answer: '' }));
  let attempt = 0;
  let result = resultEnum.GUESSING;
  let guess = '';
  let incorrectGuess = false;

  $: selectedWord = data?.body?.selectedWord;

  const submitGuess = () => {
    const newGuess = attempts.find(({id}) => id === attempt);
    newGuess.guess = guess;

    if (guess === selectedWord.word) {
      result = resultEnum.CORRECT
      newGuess.answer = 'correct';
      attempts[attempt] = newGuess;
      attempt++;
    } else if (selectedWord.synonyms.includes(guess)) {
      result = resultEnum.SIMILAR;
      newGuess.answer = 'similar';
      attempts[attempt] = newGuess;
      attempt++;
    } else if (attempt === 2) {
      result = resultEnum.FAILED;
      newGuess.answer = 'incorrect';
      attempts[attempt] = newGuess;
      attempt++;
    } else {
      incorrectGuess = true;
      newGuess.answer = 'incorrect';
      attempts[attempt] = newGuess;
      attempt++;
      guess = '';
    }
  }
</script>

<svelte:head>
  <title>What's the word?</title>
</svelte:head>

<main class="p-10">
  {#if result === resultEnum.GUESSING}
    {#if selectedWord}
      <div class="flex flex-row-reverse justify-center gap-2">
        {#each attempts as {id, answer} (id)}
          {@const name = answer === 'incorrect' ? 'fa-regular fa-heart' : 'fa-solid fa-heart'}
          {@const classNames = answer === 'incorrect' ? 'text-zinc-400' : 'text-red-400'}
          <Icon {name} {classNames} />
        {/each}
      </div>
      <div class="bg-slate-100/90 rounded-sm text-zinc-900 p-2 mt-5 mb-5">
        <p class="italic font-bold text-slate-700 text-xl">
          {selectedWord.wordType}
        </p>
        <p>{selectedWord.definition}</p>
      </div>
      <TextInput bind:text={guess} incorrect={incorrectGuess} {submitGuess} />
      <div class="m-20">
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
    {/if}
  {:else if result === resultEnum.FAILED}
    <p>Great attempt, but the word was {selectedWord.word}</p>
    <p>You could also have used any of these synonyms: {selectedWord.synonyms.join(', ')}</p>
  {:else if result === resultEnum.SIMILAR}
    <p>Congratulations! You took <em>{attempts.length}</em> attempts to guess <strong>{guess}</strong>, which is a synonym for today's secret word <strong>{selectedWord.word}</strong>!</p>
    <p>You could have also used any of these synonyms: {selectedWord.synonyms.filter((w) => w !== guess).join(', ')}</p>
  {:else if result === resultEnum.CORRECT}
    <p>Congratulations! You took <em>{attempts.length}</em> attempts to guess <strong>{guess}</strong>, which is today's secret word!</p>
    <p>You could have also used any of these synonyms: {selectedWord.synonyms.join(', ')}</p>
  {/if}
</main>