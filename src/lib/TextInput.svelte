<script>
  export let text = '';
</script>

<label for="guess">
  Guess the word:
  <input type="text" id="guess" bind:value={text} />
</label>