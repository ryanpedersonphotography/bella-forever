<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { mountPixiHomeHero } from '../lib/pixi/home-hero';
  
  // Expose a prop to control activation (e.g., only active on 'home' scene)
  export let active = true;

  let container: HTMLDivElement;
  let heroInstance: ReturnType<typeof mountPixiHomeHero> | null = null;

  const assets = {
    bg: "/sd.png",
    cloud: "/cloudl3.png",
    watertower: "/bobber3b.png",
    treeline: "/treeline6.png",
    store: "/bella-store-transparent.png",
    storeBase: "/store-base.png",
    bella: "/bella-pose3.png",
    grass: "/fg5.png"
  };

  onMount(() => {
    if (container) {
        heroInstance = mountPixiHomeHero(container, assets);
        // Wait for ready then sync active state
        heroInstance.ready.then(() => {
            if (heroInstance) heroInstance.setActive(active);
        });
    }
  });

  // Reactively update active state
  $: if (heroInstance) {
      heroInstance.setActive(active);
  }

  onDestroy(() => {
    if (heroInstance) {
        heroInstance.destroy();
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
    z-index: 1; /* Sit above background but below overlays */
    pointer-events: none; /* Let clicks pass through */
  }
</style>