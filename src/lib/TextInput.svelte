<script>
  export let text = '';
  export let incorrect = false;
  export let submitGuess = () => {};
</script>

<form
  class="w-100 grid place-items-center"
  on:submit|preventDefault={submitGuess}
>
  <label for="guess" class="hidden">
    Guess the word:
  </label>
  <input
    type="text"
    id="guess"
    placeholder="type guess here..."
    class="
      w-80 bg-transparent border-0 border-b-2 focus:border-b-4
      outline-none text-center p-2 text-2xl transition-all duration-200
    "
    bind:value={text}
  />
  <div>
    {#if incorrect && !text}
      <p
        class="text-sm text-center text-red-400 font-bold pt-2"
      >
        Sorry, try again!
      </p>
    {/if}
  </div>
</form>