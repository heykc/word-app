<script>
  import TextInput from '$lib/TextInput.svelte';
  export let data;

  const resultEnum = {
    GUESSING: 'guessing',
    FAILED: 'failed',
    SIMILAR: 'similar',
    CORRECT: 'correct',
  };

  let attempts = 0;
  let result = resultEnum.GUESSING;
  let guess = '';
  let incorrectGuess = false;

  $: selectedWord = data?.body?.selectedWord;

  const submitGuess = () => {
    attempts++;
    if (guess === selectedWord.word) {
      result = resultEnum.CORRECT
    } else if (selectedWord.synonyms.includes(guess)) {
      result = resultEnum.SIMILAR;
    } else if (attempts === 3) {
      result = resultEnum.FAILED;
    } else {
      incorrectGuess = true;
      guess = '';
    }
  }
</script>

<h1 class="text-3xl font-bold underline">
  Guess the word:
</h1>
{#if result === resultEnum.GUESSING}
  <p>Attempts: {attempts}</p>
  {#if selectedWord}
    <p>{selectedWord.wordType}, {selectedWord.definition}</p>
    <TextInput bind:text={guess} incorrect={incorrectGuess} {submitGuess} />
    <!-- <button on:click={submitGuess}>Submit</button> -->
  {/if}
{:else if result === resultEnum.FAILED}
  <p>Great attempt, but the word was {selectedWord.word}</p>
  <p>You could also have used any of these synonyms: {selectedWord.synonyms.join(', ')}</p>
{:else if result === resultEnum.SIMILAR}
  <p>Congratulations! You took <em>{attempts}</em> attempts to guess <strong>{guess}</strong>, which is a synonym for today's secret word <strong>{selectedWord.word}</strong>!</p>
  <p>You could have also used any of these synonyms: {selectedWord.synonyms.filter((w) => w !== guess).join(', ')}</p>
{:else if result === resultEnum.CORRECT}
  <p>Congratulations! You took <em>{attempts}</em> attempts to guess <strong>{guess}</strong>, which is today's secret word!</p>
  <p>You could have also used any of these synonyms: {selectedWord.synonyms.join(', ')}</p>
{/if}