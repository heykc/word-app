<script>
  import Icon from '$lib/Icon.svelte';

  export let health;

  $: healthArr = Array.from({ length: 3 }, (_, i) => i);
</script>

<div class="flex justify-center gap-2 mb-6 text-2xl">
  {#each healthArr as i}
    {@const name = i < health ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}
    {@const classNames = i < health ? 'text-red-400' : 'text-zinc-400'}

    <Icon {name} {classNames} />
  {/each}
</div>