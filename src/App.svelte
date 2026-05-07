<script lang="ts">
  import { onMount } from 'svelte';
  import { init } from '$lib/content';

  onMount(() => {
    init();
  });
</script>
