<script>
  import { onMount, onDestroy } from 'svelte';

  export let count = 200;

  let canvas;
  let ctx;
  let animationFrame;
  let w, h;
  
  const flakes = [];

  function resetFlake(flake) {
    flake.x = Math.random() * w;
    flake.y = Math.random() * -h;
    flake.velX = 0;
    flake.velY = Math.random() * 1 + 0.5; // speed 0.5 - 1.5
    flake.radius = Math.random() * 2 + 0.5; // radius 0.5 - 2.5
    flake.swing = Math.random() * Math.PI * 2;
    flake.swingSpeed = Math.random() * 0.05 + 0.01;
  }

  function init() {
    flakes.length = 0;
    for (let i = 0; i < count; i++) {
      const flake = {
        x: Math.random() * w,
        y: Math.random() * h, // Start scattered
        velX: 0,
        velY: Math.random() * 1 + 0.5,
        radius: Math.random() * 2 + 0.5,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.05 + 0.01,
      };
      flakes.push(flake);
    }
  }

  function loop() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    
    for (const flake of flakes) {
      // Update
      flake.swing += flake.swingSpeed;
      flake.velX = Math.sin(flake.swing) * 0.5;
      
      flake.x += flake.velX;
      flake.y += flake.velY;

      // Wrap around
      if (flake.y > h || flake.x > w || flake.x < 0) {
        resetFlake(flake);
      }

      // Draw
      ctx.moveTo(flake.x, flake.y);
      ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    }
    
    ctx.fill();
    animationFrame = requestAnimationFrame(loop);
  }

  function resize() {
    if (canvas) {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    resize();
    init();
    loop();
    window.addEventListener('resize', resize);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    }
  });
</script>

<canvas
  id="snow-canvas"
  bind:this={canvas}
  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 100;"
></canvas>