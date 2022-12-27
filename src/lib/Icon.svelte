<script>
  export let name;
  export let label = '';
  export let classNames = '';
</script>

<i class={`${name} ${classNames}`} aria-label={label} />