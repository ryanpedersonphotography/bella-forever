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

    // Intercept Nav Clicks (SPA behavior for Fancy Mode)
    const handleNavClick = (e: MouseEvent) => {
        const a = (e.target as HTMLElement).closest<HTMLAnchorElement>(".navCluster a, a[aria-label='Home']");
        if (!a) return;

        const url = new URL(a.href, location.origin);
        if (url.origin !== location.origin) return;

        e.preventDefault();
        history.pushState({}, "", url.href);
        
        // Simple mapping: /about -> 'about'
        const path = url.pathname === '/' ? '/home' : url.pathname;
        const newScene = path.replace('/', '') || 'home';
        
        // Update local state (triggers reactive statement)
        scene = newScene;
    };

    document.addEventListener('click', handleNavClick);

    // Handle Back/Forward buttons
    const handlePopState = () => {
        const path = location.pathname === '/' ? '/home' : location.pathname;
        scene = path.replace('/', '') || 'home';
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
        document.removeEventListener('click', handleNavClick);
        window.removeEventListener('popstate', handlePopState);
    };
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