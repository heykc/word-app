<script>
  import TextInput from '$lib/TextInput.svelte';
  export let data;

  const resultEnum = {
    GUESSING: 'guessing',
    FAILED: 'failed',
    SIMILAR: 'similar',
    CORRECT: 'correct',
  };

  let attempts = [];
  let result = resultEnum.GUESSING;
  let guess = '';
  let incorrectGuess = false;

  $: selectedWord = data?.body?.selectedWord;

  const submitGuess = () => {
    if (guess === selectedWord.word) {
      result = resultEnum.CORRECT
      attempts = [...attempts, { guess, correct: true }]
    } else if (selectedWord.synonyms.includes(guess)) {
      result = resultEnum.SIMILAR;
      attempts = [...attempts, { guess, correct: true }]
    } else if (attempts.length === 2) {
      result = resultEnum.FAILED;
      attempts = [...attempts, { guess, correct: false }]
    } else {
      incorrectGuess = true;
      attempts = [...attempts, { guess, correct: false }]
      guess = '';
    }
  }
</script>

<main class="p-3">
  {#if result === resultEnum.GUESSING}
    {#if selectedWord}
      <div class="bg-slate-100/90 rounded-sm text-zinc-900 p-2 mt-5 mb-5">
        <p class="italic font-bold text-slate-700 text-xl">{selectedWord.wordType}</p>
        <p>{selectedWord.definition}</p>
      </div>
      <TextInput bind:text={guess} incorrect={incorrectGuess} {submitGuess} />
      {#each attempts as {guess, correct}}
        <p class="text-sm text-center text-zinc-200 font-bold pt-2">
          {guess}
          {#if correct}
            <span class="text-green-400">✓</span>
          {:else}
            <span class="text-red-400">✗</span>
          {/if}
        </p>
      {/each}
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