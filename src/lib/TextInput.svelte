<script>
  export let text = '';
  export let incorrect = false;
  export let submitGuess = () => {};
</script>

<form
  class="w-100 grid place-items-center relative"
  on:submit|preventDefault={submitGuess}
>
  <label for="guess" class="hidden">
    Guess the word:
  </label>
  <input
    type="text"
    id="guess"
    placeholder="Guess the word"
    class="
      w-full bg-transparent border-0 border-b-2 focus:border-b-4
      outline-none text-center p-2 text-2xl focus:placeholder:opacity-0
      transition-all duration-300
    "
    bind:value={text}
  />
  <div
    class="
      transform-all duration-200 absolute 
      {(incorrect && !text) ? 'opacity-100 top-14' : 'opacity-0 top-10'}
  ">
    <p class="text-sm text-center text-red-400 font-bold pt-2">
      Sorry, try again!
    </p>
  </div>
</form>