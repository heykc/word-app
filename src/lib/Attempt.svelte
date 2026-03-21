<script>
  import { run } from 'svelte/legacy';

  import NpIcon from '$lib/NounProject/NpIcon.svelte';
  let { attempt } = $props();

  const { status, guess } = attempt;

  let color = $state('text-red-400');
  let icon = $state('wrong');

  run(() => {
    if (status === 'correct') {
      color = 'text-emerald-400';
      icon = 'okay';
    } else if (status === 'near') {
      color = 'text-amber-400';
      icon = 'asterisk';
    }
  });
</script>

<li class="text-sm text-zinc-200 pt-2">
  <span>{guess}</span>
  <NpIcon name={icon} classNames={color} />
</li>