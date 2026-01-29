<script>
  import { onMount } from 'svelte';
  import Vara from 'vara';

  export let text = "Hello";
  export let fontSize = 24;
  export let strokeWidth = 1.5;
  export let color = "#3c2e2a"; // Match your ink color
  export let duration = 3000;
  export let textAlign = "center";
  export let autoAnimation = true;
  export let delay = 0;

  let container;
  let instance;

  onMount(() => {
    if (!container) return;

    // Clear any previous content just in case
    container.innerHTML = "";

    instance = new Vara(
      container,
      "/fonts/Parisienne.json",
      [
        {
          text: text,
          fontSize: fontSize,
          strokeWidth: strokeWidth,
          color: color,
          duration: duration,
          textAlign: textAlign,
          autoAnimation: autoAnimation,
          delay: delay
        }
      ],
      {
        fontSize: fontSize,
        strokeWidth: strokeWidth,
        color: color,
        textAlign: textAlign
      }
    );
  });
</script>

<div class="vara-container" bind:this={container}></div>

<style>
  .vara-container {
    width: 100%;
    /* Ensure the SVG scales or sits correctly */
    display: flex;
    justify-content: center;
  }
</style>