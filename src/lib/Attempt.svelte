<script>
  import Icon from '$lib/Icon.svelte';
  export let attempt;

  const { status, guess } = attempt;

  let color = 'text-red-400';
  let icon = 'fa-solid fa-xmark';

  $: {
    if (status === 'correct') {
      color = 'text-emerald-400';
      icon = 'fa-solid fa-check';
    } else if (status === 'near') {
      color = 'text-yellow-400';
      icon = 'fa-solid fa-asterisk';
    }
  }
</script>

<li class="text-sm text-zinc-200 pt-2">
  <span>{guess}</span>
  <Icon name={icon} classNames={color} />
</li>