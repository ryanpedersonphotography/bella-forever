# Site + Stage Super Bible (Single Source of Truth) — v4.0

**Project focus:** a watercolor storybook boutique site with GSAP-driven “stage navigation.”  
**Primary viewport:** MacBook Pro 13" desktop first (absolute artboard positioning).  
**Core experience:** vertical navigation between main routes/stages; horizontal navigation between subpages; cinematic stage transitions; Bella as on-stage narrator.

---

## 1) North Star

This is a **theatrical puppet-show website**:
- Each route/section is a **stage** (a set with layered illustrated assets).
- The site moves between stages using **camera motion** (GSAP pans).
- Inside each stage, **entities** can animate in/out like theatrical set changes.
- **Bella** is the narrator and a consistent fixture across many stages (future: mouth animation, speech bubbles, triggered audio).
- Assets are primarily **transparent PNGs + SVG texture overlays**, with future **animated layers** (transparent WebM, Lottie, CSS effects).

Design goal: **maximum creative control + minimum refactor pain** when adding, moving, swapping, or animating elements.

---

## 2) Scene model

### 2.1 Three planes (Background / Midground / Foreground)

**Background plane (far world)**  
Sets mood and sky. Can be swapped per scene. Moves the least.  
Examples: `bg.sky`, haze bands, distant clouds, subtle gradient overlays.

**Midground plane (setting)**  
Defines the place (store, Paris street, etc.).  
Examples: treeline, field, store, mid-scene “specials” like a lake cutout.

**Foreground plane (framing)**  
Sells depth and frames the scene.  
Examples: path + flowers, near grass slab, paper/vignette edges, ground blends.

### 2.2 Hierarchy: Stage → Entities → Components

- **Stage:** a full route/section set (HOME, ABOUT, etc.).
- **Entity:** a moveable “thing” that should act as a single unit (enter/exit, positioning).
- **Component:** a sub-layer inside an entity (door, windows, rose bushes) for micro-edits and effects.

**Rule:** Components can animate individually, but the entity must still be controllable as one unit.

---

## 3) Entity classes

### 3.1 Primary entities
- `ui.navbar`
- `char.bella`
- `env.store`
- `env.pathForeground`

### 3.2 Accessory entities
- `env.field`
- `env.treeline`
- `env.watertower`
- `env.cloud`

### 3.3 Fill entities
- `fill.groundBlend`
- `fill.hazeBand`
- `fill.paperGrain`, `fill.vignette`

---

## 4) Depth + stacking

### 4.1 Semantic Z tiers

| Tier | Meaning | Examples |
|---|---|---|
| Z0 | Background | `bg.sky` |
| Z10–19 | Far atmosphere/landmarks | `env.cloud`, `env.watertower` |
| Z20–29 | Horizon occluders | `env.treeline` |
| Z30–39 | Midground ground plane | `env.field` |
| Z40–49 | Primary setting object | `env.store` |
| Z50–59 | Foreground framing | `env.pathForeground`, `near.grass` |
| Z60–69 | Character layer | `char.bella` |
| Z90+ | UI overlay | `ui.navbar` |

**Key correction:** Bella is the primary narrative subject; the store is the primary setting object.

### 4.2 HOME canonical paint order (back → front)
1. `bg.sky`
2. `env.cloud`
3. `env.watertower` (behind trees)
4. `env.treeline` (occludes watertower)
5. `env.field`
6. `env.store`
7. `fill.groundBlend` (optional)
8. `env.pathForeground`
9. `char.bella`
10. `ui.navbar`

### 4.3 Spatial relationship rules (HOME)
- Path visually connects to the store door.
- Treeline repeats full width and hides the watertower.
- Cloud never covers store or Bella.
- Bella stays fully readable.

---

## 5) Navigation + routes

### 5.1 Navigation model
- **Vertical movement**: main pages / scenes.
- **Horizontal movement**: subpages within a main page (About).

### 5.2 URL as truth
URL + hash define which scene and subpage is active; world position must always sync from URL.

---

## 6) Current code reality (ground truth excerpts)

### 6.1 `Stage.astro` frontmatter (assets + constants)
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

### 6.2 Navbar button data (current)
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
          <img class="waterTower hero-layer" src={theme.watertower} alt="Watertower" style="left: 1600px; top: 400px; width: 260px; z-index: 0;" />
          <div class="treesFar hero-layer" style={`left: 960px; top: 500px; width: 4000px; height: 150px; background-image: url('${
```

### 6.3 HOME scene markup (current hero)
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

### 6.4 ABOUT scene markup (current)
```astro
<section id="about" class="scene">
          <!-- Horizontal sections -->
          <div id="story" class="aboutSection">
            <div class="about-content" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #3c2e2a; z-index: 10;">
                <h1 style="font-family: 'Palatino Linotype', Palatino, serif; font-size: 64px;">Our Story</h1>
                <p style="font-family: 'Nunito', sans-serif; font-size: 24px; max-width: 600px; margin-top: 1rem;">A tiny fairytale boutique where little-daydream dresses come to life. Step into our watercolor world.</p>
            </div>
          </div>
          <div id="location" class="aboutSection" style="background-color: #fdf6e3;">
            <div class="about-content" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #3c2e2a; z-index: 10;">
                <h1 style="font-family: 'Palatino Linotype', Palatino, serif; font-size: 64px;">Location</h1>
            </div>
          </div>
          <div id="team" class="aboutSection" style="background-color: #e3fdf6;">
            <div class="about-content" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #3c2e2a; z-index: 10;">
                <h1 style="font-family: 'Palatino Linotype', Palatino, serif; font-size: 64px;">Team</h1>
            </div>
          </div>
          <div id="faq" class="aboutSection" style="background-color: #f6e3fd;">
            <div class="about-content" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #3c2e2a; z-index: 10;">
                <h1 style="font-family: 'Palatino Linotype', Palatino, serif; font-size: 64px;">FAQ</h1>
            </div>
          </div>
      </section>
```

### 6.5 Overlay UI (navbar + Bella + side nav)
```astro

```

### 6.6 Key CSS excerpt
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
  height: 1080px;
  transform-origin: top left;
  /* GSAP will handle scaling

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
  /* GSAP will handle scaling in the router now if needed, but for now we assume fixed size */
}
.hero-layer {
  position: absolute;
  wi

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
  fle

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

.sideNav{ position:absolute; left:28px; top:170px; z-index:120; display:flex; flex-direction:column; gap:14px;
          opacity:0; transform:translateY(-4px); transition:opacity .2s ease, transform .2s ease; pointer-events: none; }
.sideNav.is-active{ opacity:1; transform:translateY(0); pointer-events: auto; }
.sideNav a{ text-decoration:none; font-family:"Nunito",system-ui,sans-serif; font-weight:800; color:#3c2e2a;
           background:rgba(255,255,255,.55); border:1px solid rgba(60,46,42,.18); border-radius:12
```

### 6.7 Router logic (GSAP world pan)
**Scene mapping + target positioning:**
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

**Click/URL handlers:**
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

---

## 7) Working with the current build (today)

### 7.1 Editing the HOME hero composition
Edit `Stage.astro` inside `.hero-stage__inner`. Layers are absolute-positioned with a center-anchor convention.

### 7.2 Field strips pitfall
Treat all field strips as one object (group animation or shared config). Don’t tweak each strip as a layout change.

### 7.3 Navbar editing
**Component:** `src/components/NavButton.svelte`
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

**CSS:** `src/components/NavButton.module.css`
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

## 8) Entity Method (upgrade path)

### 8.1 The rule
Every stage element gets an **entity root** (position + z + enter/exit) and optional **components** (detail + micro-motion).

### 8.2 Entity wrapper pattern
```astro
<div class="entity" data-entity="env.store" style="left:960px; top:585px; --z: 44;">
  <img class="component" data-component="store.base" src={theme.store} style="width:600px;" />
</div>
```

### 8.3 Drop-in CSS
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

### 8.4 Sky is an entity
Treat sky as `data-entity="bg.sky"` so it can crossfade/swap per scene.

---

## 9) Stage-like transitions (GSAP choreography)

### 9.1 Keep two motion systems separate
1) **World motion** (navigation): GSAP pans `#world` in X/Y.
2) **Entity motion** (theatrical): enter/exit timelines per scene.

### 9.2 Mask the “lateral snap” when clicking HOME from About subpages
Exit the current scene entities and enter HOME entities “fresh,” so you never see the sideways jump.

---

## 10) Future improvements supported by entities

- Store components (`store.door`, `store.windows`, `store.awning`) for shadows + dimensionality.
- Path components (`path.rosesLeft`, `path.main`, `path.rosesRight`) aligned to the door.
- Bella puppet overlays (transparent WebM/Lottie) + audio-triggered mouth sync.
- Fill system: haze bands, ground blends, paper grain.
- Lake cutout: `mid.lake.mask` PNG with hole + `mid.lake.surface` CSS animated water.

---

## 11) Absolute-positioning policy (MacBook-first)

MacBook Pro 13" is the design target. Responsiveness is deferred to a final polish pass.

---

## 12) Guardrails (hard constraints)

1) Don’t change the artboard coordinate system without a plan.
2) Don’t mix anchoring conventions in the hero.
3) Move entity roots for layout; animate components for detail.
4) Treeline must occlude watertower.
5) Path must point to the door.
6) Bella is never occluded.
7) Navbar remains top-most and clickable.
8) Classify any new element (primary/accessory/fill) + assign plane + tier.

---

## 13) Flexibility clause

Rules can be broken for deliberate visual/narrative reasons (cinematic shots, stylized moments). Break them intentionally, not accidentally.

---

## 14) Recommended implementation order

1) Wrap HOME hero layers into entity roots (no visual change).
2) Promote sky to `bg.sky` entity.
3) Add `tlEnterHome/tlExitHome` and hook into route changes to eliminate lateral snap artifacts.
4) Add `env.pathForeground` as a composite entity when assets are ready.
5) Break store into components when you want lighting/dimensionality.
6) Add fill layers systematically.
7) Implement Bella puppet overlays when ready.
