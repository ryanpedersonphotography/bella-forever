# Hero Stage Bible (with Current Code + Entity Upgrade Path) — v3.1
**Builds on:** v3.0 merged guide  
**Primary goal:** make stage edits frictionless by formalizing **Stage → Entities → Components** while staying compatible with the current GSAP world-pan setup.

---

## 0) What this doc gives you

1) A **clear map** of your current implementation (Astro + Svelte + GSAP).  
2) Exact **code excerpts** (Astro/HTML, CSS, JS) so changes remain grounded.  
3) A practical “**how to work with it today**” workflow.  
4) A step-by-step **entity method upgrade plan** you can implement incrementally.

---

## 1) Current system overview (how it works right now)

### 1.1 File map (current build)
- **Stage markup + most CSS:** `src/components/Stage.astro`
- **World pan router (GSAP):** `src/scripts/stage-router.ts`
- **Nav buttons component:** `src/components/NavButton.svelte`
- **Nav buttons styling:** `src/components/NavButton.module.css`

---

## 2) Current `Stage.astro` structure (the “truth” as coded)

### 2.1 Theme assets + stage constants
**Where:** `src/components/Stage.astro` (frontmatter)

```astro
import NavButton from "./NavButton.svelte";
const THEMES = {
  summer: {
    bg: "/sd.png",
    cloud: "/cloudl3.png",
    watertower: "/bobber3b.png",
    treeline: "/treeline6.png",
    store: "/bella-store-transparent.png",
    storeBase: "/store-base.png",
    bella: "/bella-pose3.png",
    grass: "/fg5.png"
  }
};
const theme = THEMES.summer;

// Data for Navigation Buttons
const navButtons = [
  { label: 'Home',    href: '/',         scene: 'home',    image: '/button1.png', variant: 'dark' },
  { label: 'About',   href: '/about',    scene: 'about',   image: '/button2.png', variant: 'dark' },
  { label: 'Shop',    href: '/shop',     scene: 'shop',    image: '/button3.png', variant: 'light' },
  { label: 'Gallery', href: '/gallery',  scene: 'gallery', image: '/button4.png', variant: 'dark' },
  { label: 'Contact', href: '/contact',  scene: 'contact', image: '/button5.png', variant: 'dark' },
  { label: 'Blog',    href: '/blog',     scene: 'blog',    image: '/blog3.png', variant: 'light' },
];

// Data for store-base waves
const waves = [
  { top: 580, height: 5, depth: 0.17 }, { top: 590, height: 10, depth: 0.18 },
  { top: 600, height: 15, depth: 0.19 }, { top: 610, height: 25, depth: 0.20 },
  { top: 625, height: 35, depth: 0.21 }, { top: 640, height: 45, depth: 0.22 },
  { top: 660, height: 55, depth: 0.23 }, { top: 685, height: 65, depth: 0.24 },
  { top: 715, height: 75, depth: 0.25 },
];

const SCENE_COUNT = 6;
import { aboutSections } from "../scripts/stage-config";
```

### 2.2 Navbar button data (current)
**Where:** `src/components/Stage.astro`

```astro
// Data for Navigation Buttons
const navButtons = [
  { label: 'Home',    href: '/',         scene: 'home',    image: '/button1.png', variant: 'dark' },
  { label: 'About',   href: '/about',    scene: 'about',   image: '/button2.png', variant: 'dark' },
  { label: 'Shop',    href: '/shop',     scene: 'shop',    image: '/button3.png', variant: 'light' },
  { label: 'Gallery', href: '/gallery',  scene: 'gallery', image: '/button4.png', variant: 'dark' },
  { label: 'Contact', href: '/contact',  scene: 'contact', image: '/button5.png', variant: 'dark' },
  { label: 'Blog',    href: '/blog',     scene: 'blog',    image: '/blog3.png', variant: 'light' },
];

// Data for store-base waves
const waves = [
  { top: 580, height: 5, depth: 0.17 }, { top: 590, height: 10, depth: 0.18 },
  { top: 600, height: 15, depth: 0.19 }, { top: 610, height: 25, depth: 0.20 },
  { top: 625, height: 35, depth: 0.21 }, { top: 640, height: 45, depth: 0.22 },
  { top: 660, height: 55, depth: 0.23 }, { top: 685, height: 65, depth: 0.24 },
  { top: 715, height: 75, depth: 0.25 },
];

const SCENE_COUNT = 6;
import { aboutSections } from "../scripts/stage-config";
---

<div class="viewport">
  <!-- STATIONARY BACKGROUND -->
  <div class="background">
    <img class="bg-image" src={theme.bg} alt="Watercolor Sky Background" />
  </div>

  <div id="camera">
    <!-- MOVING WORLD (scenes only) -->
    <div id="world" class="world" style={`height:${SCENE_COUNT * 100}vh`}>
      <!-- ============================================= -->
      <!-- SCENE 1: HOME                                 -->
      <!-- ============================================= -->
      <section id="home" class="scene">
        <div class="hero-stage__inner">
          <!-- Background image removed from here -->
          
          <img class="cloud hero-layer" src={theme.cloud} alt="Cloud" style="left: 1400px; top: 200px; width: 300px; z-index: 0;" />
          <img class="waterTower hero-layer" src={theme.watertower} alt="Watert
```

### 2.3 HOME hero scene markup (current)
**Where:** `src/components/Stage.astro` → `<section id="home">`

```astro
<section id="home" class="scene">
        <div class="hero-stage__inner">
          <!-- Background image removed from here -->
          
          <img class="cloud hero-layer" src={theme.cloud} alt="Cloud" style="left: 1400px; top: 200px; width: 300px; z-index: 0;" />
          <img class="waterTower hero-layer" src={theme.watertower} alt="Watertower" style="left: 1600px; top: 400px; width: 260px; z-index: 0;" />
          <div class="treesFar hero-layer" style={`left: 960px; top: 500px; width: 4000px; height: 150px; background-image: url('${theme.treeline}'); background-repeat: repeat-x; background-position: bottom center; background-size: auto 100%;`}></div>
          {waves.map((wave, i) => (
            <div class="store-base-wave hero-layer" style={`left: 960px; top: ${wave.top}px; width: 4000px; height: ${wave.height}px; background-image: url('${theme.storeBase}'); background-repeat: repeat-x; background-position: top center; background-size: auto 100%; opacity: ${0.2 + (i * 0.1)}; filter: drop-shadow(0px 2px 5px rgba(0,0,0,0.2));`}></div>
          ))}
          <img class="shop hero-layer" src={theme.store} alt="Bella's Storefront" style="left: 960px; top: 585px; width: 600px; filter: drop-shadow(0px 10px 15px rgba(0,0,0,0.5));" />
          <div class="grass hero-layer" style={`left: 960px; top: 870px; width: 8000px; height: 360px; background-image: url('${theme.grass}'); background-repeat: no-repeat; background-position: bottom center; background-size: auto 100%;`}></div>
        </div>
      </section>
```

### 2.4 Overlay UI (navbar + Bella + side nav)
**Where:** `src/components/Stage.astro` → `.overlay`

```astro

```

---

## 3) Current CSS (what to tweak without breaking the stage)

### 3.1 Viewport + background baseline
```css
.viewport { 
  width: 100vw; 
  height: 100vh; 
  overflow: hidden; 
  position: fixed; 
  top: 0;
  left: 0;
}
.background {
  position: absolute;
  inset: 0;
  z-index: 0; /* Behind the world */
}

.bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

#camera {
  position: absolute;
  inset: 0;
  transform-origin: center center;
  will-change: transform;
}

.world { 
  position: absolute;
  inset: 0;
  width: 100vw; 
  will-change: transform;
  z-index: 1;
}
.scene { 
  width: 100vw; 
  height: 100vh
```

```css
.background {
  position: absolute;
  inset: 0;
  z-index: 0; /* Behind the world */
}

.bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

#camera {
  position: absolute;
  inset: 0;
  transform-origin: center center;
  will-change: transform;
}

.world { 
  position: absolute;
  inset: 0;
  width: 100vw; 
  will-change: transform;
  z-index: 1;
}
.scene { 
  width: 100vw; 
  height: 100vh; 
  position: relative;
  overflow: hidden;
  background-color: transparent; /* Changed to transparent */
}
.he
```

### 3.2 Camera + world pan target
```css
#camera {
  position: absolute;
  inset: 0;
  transform-origin: center center;
  will-change: transform;
}

.world { 
  position: absolute;
  inset: 0;
  width: 100vw; 
  will-change: transform;
  z-index: 1;
}
.scene { 
  width: 100vw; 
  height: 100vh; 
  position: relative;
  overflow: hidden;
  background-color: transparent; /* Changed to transparent */
}
.hero-stage__inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 1920px;
  heigh

.world { 
  position: absolute;
  inset: 0;
  width: 100vw; 
  will-change: transform;
  z-index: 1;
}
.scene { 
  width: 100vw; 
  height: 100vh; 
  position: relative;
  overflow: hidden;
  background-color: transparent; /* Changed to transparent */
}
.hero-stage__inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 1920px;
  height: 1080px;
  transform-origin: top left;
  /* GSAP will handle scaling in the router now if needed, but for
```

### 3.3 HOME artboard + hero layers
```css
.hero-stage__inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 1920px;
  height: 1080px;
  transform-origin: top left;
  /* GSAP will handle scaling in the router now if needed, but for now we assume fixed size */
}
.hero-layer {
  position: absolute;
  will-change: transform;
  user-select: none;
  pointer-events: none;
  transform: translate(-50%, -50%); /* Center anchor default */
}

/* stays put while world pans */
.overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none; /*
```

**Key contract already in place:** fixed artboard (`1920×1080`) and center-anchored layers.

### 3.4 Overlay + navbar + Bella positioning
```css
.overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none; /* allow world clicks unless you need them */
}

#about.scene{
  display:flex;        /* horizontal sections */
  width: 400vw;        /* 4 sections */
  height:100vh;
}

#about .aboutSection{
  width:100vw;
  height:100vh;
  flex: 0 0 100vw;
}

.foreground {
  position: absolute;
  inset: auto 0 0 0;
  height: 34vh;        /* tune */
  z-index: 20;
  pointer-events: none;
}

.foreground img {
  width: 100%;
  height: 100%;
  object

.navBar{
    position:absolute;
    /* top:20px;  -- Removed, now set inline on <nav> */
    left:0;
    width:100%;
    display:flex;
    justify-content: center;
    align-items:center;
    flex-wrap: wrap;
    gap: 1rem;
    padding-left: var(--nav-horizontal-margin); /* Apply horizontal margin */
    padding-right: var(--nav-horizontal-margin); /* Apply horizontal margin */
    z-index: 100; /* Keep nav on top */
    pointer-events: auto; /* re-enable clicks for nav */
  }

.bella {
  position: absolute;
  left

.bella {
  position: absolute;
  left: 19.53vw;
  top: 70.27vh;
  width: 14.06vw;
  height: auto;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 11;
  filter: drop-shadow(0px 10px 15px rgba(0,0,0,0.5));
}
```

### 3.5 Side nav
```css
.sideNav{ position:absolute; left:28px; top:170px; z-index:120; display:flex; flex-direction:column; gap:14px;
          opacity:0; transform:translateY(-4px); transition:opacity .2s ease, transform .2s ease; pointer-events: none; }
.sideNav.is-active{ opacity:1; transform:translateY(0); pointer-events: auto; }
.sideNav a{ text-decoration:none; font-family:"Nunito",system-ui,sans-serif; font-weight:800; color:#3c2e2a;
           background:rgba(255,255,255,.55); border:1px solid rgba(60,46,42,.18); border-radius:12
```

---

## 4) Current GSAP router (how navigation movement works today)

### 4.1 Core router logic
**Where:** `src/scripts/stage-router.ts`

```ts
const routesToScene: Record<string, string> = {
  "/": "home",
  "/about": "about",
  "/shop": "shop",
  "/gallery": "gallery",
  "/contact": "contact",
  "/blog": "blog",
};

const SCENE_ORDER = ["home", "about", "shop", "gallery", "contact", "blog"] as const;
const ABOUT_HASH_ORDER = aboutSections; // Use the shared config

const DESIGN_W = 1920;
const DESIGN_H = 1080;

function getWorld() {
  const world = document.querySelector<HTMLElement>("#world");
  if (!world) throw new Error("Missing #world");
  return world;
}

function getCamera() {
  // Optional but recommended for “cool” feel
  return document.querySelector<HTMLElement>("#camera");
}

function sceneToY(scene: string) {
  const i = Math.max(0, SCENE_ORDER.indexOf(scene as any));
  return -i * window.innerHeight;
}

function aboutHashToX(hash: string) {
  const key = (hash || "#story").replace("#", "");
  const i = Math.max(0, ABOUT_HASH_ORDER.indexOf(key as any));
  return -i * window.innerWidth;
}

function currentSceneFromPath(pathname: string) {
  return routesToScene[pathname] ?? "home";
}

function getX(world: HTMLElement) {
  return Number(gsap.getProperty(world, "x")) || 0;
}
function getY(world: HTMLElement) {
  return Number(gsap.getProperty(world, "y")) || 0;
}

function setSideNavActive(scene: string) {
  const sideNav = document.querySelector<HTMLElement>(".sideNav");
  if (!sideNav) return;
  sideNav.classList.toggle("is-active", scene === "about");
}

function animateWorldTo(x: number, y: number, immediate = false) {
  const world = getWorld();
  const camera = getCamera();

  if (immediate) {
    gsap.set(world, { x, y });
    if (camera) gsap.set(camera, { scale: 1 });
    return;
  }

  // Kill any previous in-flight tweens so it never “sticks”
  gsap.killTweensOf(world);
  if (camera) gsap.killTweensOf(camera);

  const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });

  // subtle “lift” during travel (this is the “cool” part)
  if (camera) {
    tl.to(camera, { scale: 1.03, duration: 0.18 }, 0);
  }

  tl.to(world, { x, y, duration: 1.05 }, 0);

  if (camera) {
    tl.to(camera, { scale: 1, duration: 0.35, ease: "power3.out" }, 0.65);
  }
}

function panVerticalToScene(scene: string, immediate = false) {
  const world = getWorld();
  // If navigating to a scene other than 'about', reset x to 0.
  // Otherwise, preserve the current x (e.g., if navigating from one 'about' sub-section to another within the about scene via main nav)
  const x = (scene === "about") ? getX(world) : 0;
  const y = sceneToY(scene);
  setSideNavActive(scene);
  animateWorldTo(x, y, immediate);
}

function panHorizontalAboutToHash(hash: string, immediate = false) {
  const world = getWorld();
  const x = aboutHashToX(hash);     // CHANGE X
  const y = getY(world);            // PRESERVE Y
  setSideNavActive("about");
  animateWorldTo(x, y, immediate);
}

function syncFromUrl(immediate = false) {
  const scene = currentSceneFromPath(location.pathname);
  setSideNavActive(scene);

  // Always sync Y to the route
  const y = sceneToY(scene);

  // Sync X only when on /about (hash-driven). Otherwise keep x at 0.
  const x =
    scene === "about" ? aboutHashToX(location.hash || "#story") : 0;

  animateWorldTo(x, y, immediate);
}
```

### 4.2 Click/URL handlers
```ts
function bindNavHandlers() {
  // Main/top nav: vertical pans, clear hash, preserve X (handled in panVerticalToScene)
  document.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>(".navBar a");
    if (!a) return;

    const url = new URL(a.href, location.origin);
    if (url.origin !== location.origin) return;

    e.preventDefault();

    history.pushState({}, "", url.pathname); // clear hash
    panVerticalToScene(currentSceneFromPath(url.pathname), false);
  });

  // Side nav: horizontal pans on /about, update /about#section
  document.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>(".sideNav a");
    if (!a) return;

    const url = new URL(a.href, location.origin);
    if (url.origin !== location.origin) return;

    e.preventDefault();

    history.pushState({}, "", `${url.pathname}${url.hash}`);
    if (currentSceneFromPath(url.pathname) === "about") {
      panHorizontalAboutToHash(url.hash || "#story", false);
    }
  });

  window.addEventListener("popstate", () => syncFromUrl(false));

  window.addEventListener("hashchange", () => {
    if (currentSceneFromPath(location.pathname) === "about") {
      panHorizontalAboutToHash(location.hash || "#story", false);
    }
  });

  window.addEventListener("resize", () => {
    syncFromUrl(true);
  });
}
```

**Plain-English behavior:**
- Top nav changes route and pans vertically.
- About side nav changes hash and pans horizontally.
- `syncFromUrl()` is the “position world based on URL” authority.

---

## 5) How to work with the current setup (today)

### 5.1 Moving a HOME hero layer (fast)
Edit `src/components/Stage.astro` inside `.hero-stage__inner`.
Each layer currently uses inline `left/top/width` and is center-anchored by `.hero-layer`.

### 5.2 Treating the field strips as one object (today)
Right now the field is many `.store-base-wave` layers.
If you need to move the field, do it **as a group** (selector), not per-strip.

### 5.3 Updating navbar buttons

**Nav button component:**
```svelte
<script lang="ts">
  import styles from "./NavButton.module.css";

  export let label: string;
  export let href: string;
  export let variant: "light" | "dark" = "dark";
  export let backgroundImage: string = "";

  const style: string = backgroundImage
    ? `background-image: url(${backgroundImage})`
    : "";
</script>

<a
  {href}
  class="{styles.btn} {variant === 'light' ? styles.light : styles.dark}"
  {style}
  aria-label={label}
>
  <span class={styles.label}>{label}</span>
</a>
```

**Nav button CSS module:**
```css
/* Base button container — assumes the watercolor button is a background image */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  user-select: none;
  height: 92px;
  min-width: 220px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
  transition: all 0.3s ease-in-out;
  will-change: transform;
  filter: drop-shadow(0 10px 14px rgba(25, 45, 50, 0.18))
    drop-shadow(0 26px 40px rgba(25, 45, 50, 0.14));
}

.btn:hover {
  transform: translateY(-2px);
}

.label {
  font-family: "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
  font-weight: 700;
  font-size: 44px;
  line-height: 1;
  letter-spacing: .4px;

  /* Keep the “storybook” soft light text */
  color: rgba(255, 255, 255, 0.92);

  /* IMPORTANT: readability improvements */
  /* 1) modern outline */
  -webkit-text-stroke: var(--nav-stroke-size) rgba(0, 0, 0, var(--nav-stroke-alpha));

  /* 2) fallback outline via stacked shadows (works everywhere) */
  text-shadow:
    /* Outline ring */
    1px 0   rgba(0, 0, 0, var(--nav-outline-alpha)),
   -1px 0   rgba(0, 0, 0, var(--nav-outline-alpha)),
    0   1px rgba(0, 0, 0, var(--nav-outline-alpha)),
    0  -1px rgba(0, 0, 0, var(--nav-outline-alpha)),
    1px 1px rgba(0, 0, 0, var(--nav-outline-alpha)),
   -1px 1px rgba(0, 0, 0, var(--nav-outline-alpha)),
    1px -1px rgba(0, 0, 0, var(--nav-outline-alpha)),
   -1px -1px rgba(0, 0, 0, var(--nav-outline-alpha)),
    /* Soft drop shadow */
    0   var(--nav-shadow-y) var(--nav-shadow-blur) rgba(0, 0, 0, var(--nav-shadow-alpha));
}

@media (max-width: 1200px) {
  .btn {
    min-width: auto;
    padding: 0 24px;
    height: 72px;
  }
  .label {
    font-size: 32px;
  }
}

/* Variant tuning: LIGHT buttons need stronger contrast */
.light {
  --nav-stroke-size: 2px;
  --nav-stroke-alpha: 0.35;

  --nav-outline-alpha: 0.30;

  --nav-shadow-y: 2px;
  --nav-shadow-blur: 4px;
  --nav-shadow-alpha: 0.28;
}

/* Dark buttons: keep it subtle to preserve watercolor softness */
.dark {
  --nav-stroke-size: 1px;
  --nav-stroke-alpha: 0.22;

  --nav-outline-alpha: 0.18;

  --nav-shadow-y: 1px;
  --nav-shadow-blur: 3px;
  --nav-shadow-alpha: 0.16;
}

/* Optional: hover/focus remains gentle */
.btn:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.35);
  outline-offset: 4px;
  border-radius: 14px;
}
```

---

## 6) The upgrade: formal Entity Method (incremental, minimal rewrite)

### 6.1 Target structure
Inside the hero artboard:
- **Entity roots** handle `x/y/z` and enter/exit as a unit.
- **Components** live inside entities for micro-edits and future modular swaps.

---

## 7) Step-by-step: convert HOME hero to entities (preserve visuals)

### Step 1 — Add entity wrappers (no visual change)
Replace the HOME hero children with entity roots and components.

```astro
<section id="home" class="scene">
  <div class="hero-stage__inner">

    <div class="entity" data-entity="env.cloud" style="left:1400px; top:200px; --z: 12;">
      <img class="component" data-component="cloud.image" src={theme.cloud} alt="Cloud" style="width:300px;" />
    </div>

    <div class="entity" data-entity="env.watertower" style="left:1600px; top:400px; --z: 12;">
      <img class="component" data-component="watertower.image" src={theme.watertower} alt="Watertower" style="width:260px;" />
    </div>

    <div class="entity" data-entity="env.treeline" style="left:960px; top:500px; --z: 24;">
      <div class="component" data-component="treeline.band"
        style={`width:4000px; height:150px; background-image:url('${theme.treeline}'); background-repeat:repeat-x; background-position:bottom center; background-size:auto 100%;`}>
      </div>
    </div>

    <div class="entity" data-entity="env.field" style="left:960px; top:0px; --z: 34;">
      {waves.map((wave, i) => (
        <div class="component" data-component={`field.strip.${i}`}
          style={`left: 0px; top: ${wave.top}px; width:4000px; height:${wave.height}px;
          background-image:url('${theme.storeBase}'); background-repeat:repeat-x; background-position:top center;
          background-size:auto 100%; opacity:${0.2 + (i * 0.1)}; filter: drop-shadow(0px 2px 5px rgba(0,0,0,0.2));`}>
        </div>
      ))}
    </div>

    <div class="entity" data-entity="env.store" style="left:960px; top:585px; --z: 44;">
      <img class="component" data-component="store.base" src={theme.store} alt="Bella's Storefront"
        style="width:600px; filter: drop-shadow(0px 10px 15px rgba(0,0,0,0.5));" />
    </div>

    <div class="entity" data-entity="near.grass" style="left:960px; top:870px; --z: 54;">
      <div class="component" data-component="grass.slab"
        style={`width:8000px; height:360px; background-image:url('${theme.grass}'); background-repeat:no-repeat;
        background-position:bottom center; background-size:auto 100%;`}>
      </div>
    </div>

  </div>
</section>
```

**Result:** same visuals, but every major thing is now targetable by `data-entity`.

### Step 2 — Add entity CSS (cleaner than .hero-layer)
Add this alongside your existing hero CSS:

```css
.entity {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: var(--z, 1);
  will-change: transform, opacity;
  pointer-events: none;
}
.entity .component {
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
```

### Step 3 — Promote sky into an entity
Treat the sky as `data-entity="bg.sky"` so it can crossfade/swap between scenes.

### Step 4 — Add entity timelines (new file)
Create `src/scripts/stage-entities.ts`:

```ts
import gsap from "gsap";

export function qEntity(name: string) {
  return document.querySelector<HTMLElement>(`[data-entity="${name}"]`);
}

export function tlEnterHome() {
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
  tl.fromTo(qEntity("env.cloud"),      { autoAlpha: 0, y: -8 },  { autoAlpha: 1, y: 0, duration: 0.35 }, 0);
  tl.fromTo(qEntity("env.watertower"), { autoAlpha: 0, y: -6 },  { autoAlpha: 1, y: 0, duration: 0.35 }, 0.05);
  tl.fromTo(qEntity("env.treeline"),   { autoAlpha: 0, y:  6 },  { autoAlpha: 1, y: 0, duration: 0.40 }, 0.10);
  tl.fromTo(qEntity("env.field"),      { autoAlpha: 0, y: 10 },  { autoAlpha: 1, y: 0, duration: 0.45 }, 0.15);
  tl.fromTo(qEntity("env.store"),      { autoAlpha: 0, y: 12, scale: 0.99 },
                               { autoAlpha: 1, y: 0, scale: 1, duration: 0.55 }, 0.20);
  tl.fromTo(qEntity("near.grass"),     { autoAlpha: 0, y: 16 },  { autoAlpha: 1, y: 0, duration: 0.55 }, 0.25);
  return tl;
}

export function tlExitHome() {
  const tl = gsap.timeline({ defaults: { ease: "power2.in" } });
  tl.to([
    qEntity("near.grass"),
    qEntity("env.store"),
    qEntity("env.field"),
    qEntity("env.treeline"),
    qEntity("env.watertower"),
    qEntity("env.cloud"),
  ], { autoAlpha: 0, y: -10, duration: 0.35, stagger: 0.03 }, 0);
  return tl;
}
```

### Step 5 — Hook enter/exit into the router
In `stage-router.ts`, import these and run exit/enter around scene changes.
This is what masks the “lateral snap” and makes HOME feel like a stage.

---

## 8) What this unlocks next (without pain)

### 8.1 Store components (door/windows/awning)
Break `env.store` into `store.*` components and apply per-component shadows.

### 8.2 Path as a true foreground entity
Create `env.pathForeground` root + components (roses left/path/roses right). Keep alignment to store door.

### 8.3 Fill layers + lake cutout
Add `fill.*` overlays and `mid.lake.mask` + `mid.lake.surface` (CSS animated water behind a cutout PNG).

---

## 9) Guardrails (so automation stops breaking stuff)

- Don’t change the artboard coordinate system.
- Don’t mix anchoring conventions.
- Move entity roots, not internal strips/components (unless micro-animation).
- Preserve occlusion (treeline hides watertower).
- Navbar always top-most; Bella always above environment.

---

## 10) Recommended implementation order

1) Wrap HOME hero into entities (Step 1–2).  
2) Promote sky to `bg.sky` entity (Step 3).  
3) Add entity timelines and hook into router (Step 4–5).  
4) Add `env.pathForeground` when the asset is ready.  
5) Break store into components when you want dimensional lighting.
