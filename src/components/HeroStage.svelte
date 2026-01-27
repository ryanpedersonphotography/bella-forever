<script>
  import { onMount } from 'svelte';
  import { gsap } from 'gsap';
  import Snow from './Snow.svelte';

  const THEMES = {
    summer: {
      showSnowfall: false,
      bg: "/sd.png",
      cloud: "/cloudl3.png",
      watertower: "/bobber3b.png",
      treeline: "/treeline6.png",
      ground: "",
      store: "/bella-store-transparent.png",
      storeBase: "/store-base.png",
      bella: "/bella-pose3.png",
      grass: "/grass-foreground.png"
    },
    winter: {
      showSnowfall: true,
      bg: "/sd.png", 
      cloud: "/cloudl3.png", 
      watertower: "/bobber3b.png", 
      treeline: "/treeline6-snow.png",
      ground: "/snow-ground.svg", 
      store: "/bella-store-transparent.png", 
      storeBase: "/store-base.png", 
      bella: "/bella-pose3.png", 
      grass: "/grass-foreground.png" 
    }
  };

  const MODE = 'summer';
  const theme = THEMES[MODE];

  let rootEl;
  let stageContainer;
  let stageInner;
  
  const DESIGN_W = 1920;
  const DESIGN_H = 1080;

  const waves = [
    // 2 new back-most layers to reach treeline
    { top: 580, height: 5, depth: 0.17 },
    { top: 590, height: 10, depth: 0.18 },
    // Original 7 layers
    { top: 600, height: 15, depth: 0.19 },
    { top: 610, height: 25, depth: 0.20 },
    { top: 625, height: 35, depth: 0.21 },
    { top: 640, height: 45, depth: 0.22 },
    { top: 660, height: 55, depth: 0.23 },
    { top: 685, height: 65, depth: 0.24 },
    // Front-most wave (rendered last, top layer)
    { top: 715, height: 75, depth: 0.25 },
  ];

  const navButtons = [
    { label: 'Home',    href: '#home',    image: '/button1.png' },
    { label: 'About',   href: '#about',   image: '/button2.png' },
    { label: 'Shop',    href: '#shop',    image: '/button3.png' },
    { label: 'Gallery', href: '#gallery', image: '/button4.png' },
    { label: 'Contact', href: '#contact', image: '/button5.png' },
  ];

  onMount(() => {
    // 1. Responsive Stage Scaling (Cover)
    const resizeStage = () => {
      if (!stageContainer || !stageInner) return;
      const vw = stageContainer.clientWidth;
      const vh = stageContainer.clientHeight;
      const scale = Math.max(vw / DESIGN_W, vh / DESIGN_H);
      const xOffset = (vw - DESIGN_W * scale) / 2;
      const yOffset = (vh - DESIGN_H * scale) / 2;

      gsap.set(stageInner, {
        scale,
        x: xOffset,
        y: yOffset,
        force3D: true,
        transformOrigin: "top left",
      });
    };
    window.addEventListener("resize", resizeStage);
    resizeStage();

    return () => {
      window.removeEventListener("resize", resizeStage);
    };
  });
</script>

<div bind:this={rootEl} class="stage-root">
  <!-- Paper wipe overlay -->
  <div class="paperWipe"></div>

  {#if theme.showSnowfall}
    <Snow />
  {/if}

  <!-- HERO (PINNED) -->
  <section class="hero" data-section bind:this={stageContainer}>
    <div class="scene hero-stage__inner" bind:this={stageInner}>
      
      <!-- Layer 1: Background -->
      <img class="sky hero-layer" data-parallax data-depth="0.05" src={theme.bg} alt="Watercolor Sky Background" />

      <!-- Layer 1.1: Cloud -->
      <img class="cloud hero-layer" data-parallax data-depth="0.1" src={theme.cloud} alt="Cloud" />

      <!-- Layer 1.2: Watertower -->
      <img class="waterTower hero-layer" data-parallax data-depth="0.15" src={theme.watertower} alt="Watertower" />

      <!-- Navigation Bar (New) -->
      <nav class="navBar">
        {#each navButtons as button}
          <a href={button.href}>
            <button class="navBtn" type="button"
                    style="background-image: url('{button.image}');">
              <span>{button.label}</span>
              <i class="grain"></i>
            </button>
          </a>
        {/each}
      </nav>

      <!-- Layer 1.1: Cloud -->
      <!-- Placeholder steam, reusing a cloud or similar asset for now if specific steam asset missing -->
      <!-- <img class="steam hero-layer" src="/cloudl3.png" style="width: 100px; left: 1650px; top: 380px; opacity: 0.5;" alt="" /> -->

      <!-- Layer 1.5: Treeline -->
      <div class="treesFar hero-layer" data-parallax data-depth="0.2" 
           style="left: 960px; top: 500px; width: 4000px; height: 150px; 
                  background-image: url('{theme.treeline}'); 
                  background-repeat: repeat-x; 
                  background-position: bottom center; 
                  background-size: auto 100%;">
      </div>

      <!-- Layer 1.8: Ground -->
      {#if theme.ground}
        <img class="hero-layer" data-parallax data-depth="0.25" src={theme.ground} alt="Ground" style="left: 0; top: 600px; width: 1920px; height: 600px; object-fit: cover;" />
      {/if}



      <!-- Layer 1.85: Store Base Waves -->
                  {#each waves as wave, i}
                    <div class="store-base-wave hero-layer" data-parallax data-depth={wave.depth}
             style="left: 960px; top: {wave.top}px; width: 4000px; height: {wave.height}px;
                    background-image: url('{theme.storeBase}');
                    background-repeat: repeat-x;
                    background-position: top center;
                    background-size: auto 100%;
                    opacity: {0.2 + (i * 0.1)};
                    filter: drop-shadow(0px 2px 5px rgba(0,0,0,0.2));">                    </div>
                  {/each}
      <img class="shop hero-layer" data-parallax data-depth="0.4" src={theme.store} alt="Bella's Storefront" style="left: 960px; top: 585px; width: 600px; filter: drop-shadow(0px 10px 15px rgba(0,0,0,0.5));" />
      
      <!-- Layer 1.9: Grass (Behind Store, In front of Trees) -->
      <div class="grass hero-layer" data-parallax data-depth="0.5"
           style="left: 960px; top: 810px; width: 4000px; height: 180px;
                  background-image: url('{theme.grass}');
                  background-repeat: no-repeat;
                  background-position: bottom center;
                  background-size: auto 100%;
                  filter: drop-shadow(0px 0px 5px rgba(0,0,0,0.2));">
      </div>
      
      <!-- Awning/Sign (Implicitly part of store for now, but targeting class if we separate later) -->
      
            <!-- Bella -->
      
            <img class="bella hero-layer" data-parallax data-depth="0.6" src={theme.bella} alt="Bella" style="left: 375px; top: 759px; width: 270px; filter: drop-shadow(0px 10px 15px rgba(0,0,0,0.5));" />
      
      
      
                </div>
      
      
      
              </section>

  <!-- CONTENT SECTIONS -->
  <section class="content" data-section style="margin-top: 100vh;">
    <div class="copy">
      <h2>The Atelier</h2>
      <p>Tucked away in a watercolor world, Bella’s Dresser is where sketches come to life.</p>
    </div>
  </section>

  <!-- WINDOW SECTION (CROSSFADE) -->
  <section class="window-section content" data-section>
    <div class="copy">
      <h2>New Arrivals</h2>
      <p>Scroll to see the collection.</p>
    </div>
    <!-- Placeholder for window crossfade logic - using transparent divs to demonstrate structure -->
    <div class="window-wrap" style="height: 400px; background: rgba(255,255,255,0.5); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin-top: 2rem;">
        <p style="opacity: 0.5;">(Window Display Area)</p>
    </div>
  </section>

  <footer class="content" data-section>
    <small>© Bella’s Dresser</small>
  </footer>
</div>

<style>
  .stage-root {
    position: relative;
    width: 100%;
    overflow-x: hidden;
  }

  /* Paper wipe overlay (subtle) */
  .paperWipe {
    background: radial-gradient(circle at 50% 40%, rgba(255,255,255,0.9), rgba(255,255,255,1));
    mix-blend-mode: multiply;
    z-index: 9999;
  }

  .hero {
    height: 100vh;
    width: 100%;
    position: relative; /* Changed from fixed/grid to relative for pinned logic */
    overflow: hidden;
    background-color: #f8f6f1;
  }

  .hero-stage__inner {
    position: absolute;
    top: 0;
    left: 0;
    width: 1920px;
    height: 1080px;
    transform-origin: top left;
  }

  .hero-layer {
    position: absolute;
    will-change: transform;
    user-select: none;
    pointer-events: none;
    transform: translate(-50%, -50%); /* Center anchor default */
  }

  /* Specific Positioning Overrides from previous setup */
  .sky { left: 0; top: 0; width: 1920px; height: 1080px; transform: none; z-index: 0; }
  .cloud { left: 1400px; top: 200px; width: 300px; z-index: 0; transform: translate(-50%, -50%); }
  .waterTower { left: 1600px; top: 400px; width: 260px; z-index: 0; transform: translate(-50%, -50%); }
  
  /* Bella & Foreground z-index */
  .bella { z-index: 50; }
  .foreground { z-index: 60; }

  .content {
    width: min(900px, 92vw);
    margin: 0 auto;
    padding: 6rem 0;
    position: relative;
    z-index: 10;
    text-align: center;
  }

  .copy h2 {
    font-family: "PT Serif", serif;
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: oklch(0.41 0.077 78.9);
  }

  .copy p {
    font-size: 1.2rem;
    color: oklch(0.51 0.077 78.9);
  }

  .window-section {
    min-height: 80vh;
  }

  /* --- Button Styles (New) --- */
  :root{
    --ink:#3c2e2a;
    --paper:#f6f1e6;
  }

  /* NAV LAYOUT */
  .navBar{
    position:absolute;
    top:42px;
    left:50%;
    transform:translateX(-50%);
    display:flex;
    gap:100px; /* Increased gap for better distribution */
    align-items:center;
  }

  .navBtn{
    height:92px;
    padding: 0 54px;
    min-width: 220px;
    border-radius: 14px; /* NOT a pill; this is key */
    border: 1px solid rgba(60,46,42,.22);
    position: relative;
    cursor: pointer;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    background-size: 100% 100%;
      background-repeat:no-repeat;
      transition: transform .1s ease;
      will-change: transform; /* Add hint for browser animation */
    
      /* New pixel-based shadow that respects PNG transparency */      filter:
        drop-shadow(0 10px 14px rgba(25,45,50,.18))
        drop-shadow(0 26px 40px rgba(25,45,50,.14));
    }
    
    .navBtn:focus {
      outline: none;
    }
    
    .navBtn span{    font-family: "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
    font-weight: 700;
    font-size: 44px;
    line-height: 1;
    letter-spacing: .4px;
    color: var(--text, #f2e7d6);
    -webkit-text-stroke: 1px rgba(70,45,25,.35);
    text-shadow:
      0 -1px 0 rgba(255,255,255,.60),
      0  1px 0 rgba(60,40,25,.25),
      0  9px 14px rgba(0,0,0,.24);
    filter: blur(.12px) contrast(1.06);
    position: relative;
    z-index: 1;
  }

  /* HOVER/ACTIVE */
  .navBtn:hover{
    transform: translateY(-1px);
  }
  .navBtn:active{
    transform: translateY(0);
  }

  /* --- General Styles --- */
</style>