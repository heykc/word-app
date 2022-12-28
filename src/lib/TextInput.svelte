<script>
  export let text = '';
  export let submitGuess = () => {};
</script>

<form
  class="w-100 grid place-items-center relative"
  on:submit|preventDefault={submitGuess}
>
  <label for="guess-input" class="hidden">
    Guess the word:
  </label>
  <div id="guess" class="w-full">
    <input
      type="text"
      id="guess-input"
      placeholder="Guess the word"
      class="
        w-full bg-transparent border-0
        outline-none text-center p-2 text-2xl focus:placeholder:opacity-0
        transition-all duration-300
      "
      bind:value={text}
    />
  </div>
</form>

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