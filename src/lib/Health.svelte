<script>
  import Icon from '$lib/Icon.svelte';

  export let attempts;
</script>

<div class="flex flex-row-reverse justify-center gap-2 mb-6 text-2xl">
  {#each attempts as { guess, matchId }}
    {@const incorrect = guess && !matchId}
    {@const name = incorrect ? 'fa-regular fa-heart' : 'fa-solid fa-heart'}
    {@const classNames = incorrect ? 'text-zinc-400' : 'text-red-400'}

    <Icon {name} {classNames} />
  {/each}
</div>