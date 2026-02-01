<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createStageManager } from '../lib/pixi/stage-manager';
  
  // Expose a prop to control activation/scene
  export let scene = 'home';

  let container: HTMLDivElement;
  let manager: ReturnType<typeof createStageManager> | null = null;

  onMount(async () => {
    if (container) {
        manager = createStageManager();
        await manager.mount(container);
        manager.goToScene(scene);
    }
  });

  // Reactively update scene
  $: if (manager && scene) {
      manager.goToScene(scene);
  }

  onDestroy(() => {
    if (manager) {
        manager.destroy();
    }
  });
</script>

<div class="pixi-stage-wrapper" bind:this={container}></div>

<style>
  .pixi-stage-wrapper {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    pointer-events: none;
  }
</style>