<script>
  export let name;
  export let classNames = '';
</script>

{#await import(`./icons/${name}.svg?raw`) then Icon}
  <span class="np-icon-w {classNames}">
    {@html Icon.default}
  </span>
{/await}

<style>
  .np-icon-w {
    display: inline-block;
    width: 1.2em;
    height: 1.2em;
    vertical-align: middle;
    transform: translateY(-0.1em);
    fill: currentColor;
  }
</style>