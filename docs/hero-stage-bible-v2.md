# Hero Stage Bible (Current Build) — v2.0
**Target:** MacBook Pro 13" desktop viewport first.  
**Design model:** absolute positioning on a fixed artboard (no “perfect responsiveness” right now).  
**Scene model:** Stage → Entities → Components (paper-tole / decoupage).

---

## 1) Big picture intent

The site is a **puppet-show stage**:
- **Bella** is the narrator and persistent “host” across stages.
- The **stage background** can swap (e.g., store exterior → Paris 1920s) while **Bella remains** on stage (possibly outfit change).
- The stage is built from **layered illustrated assets** (transparent PNGs, SVG textures) plus **future animated assets** (transparent WebM, Lottie, etc.).
- Transitions should feel **crafted and theatrical**: elements exit, replacements enter, Bella remains.

---

## 2) Terminology and hierarchy

### 2.1 Stage
The full “presentation space” for a route/section (HOME, ABOUT, etc.).

### 2.2 Entities
An **entity** is a moveable “thing” that should generally be controlled as a single unit:
- Can be **single-file**: one PNG (e.g., cloud).
- Can be **component-based**: multiple parts glued together (e.g., store made of door + windows + awning).

**Rule:** Even if an entity has many components (layers), it should **enter/exit as one entity** unless intentionally animating components.

### 2.3 Components
A **component** is a sub-layer belonging to an entity (e.g., store door, store windows). Components exist to:
- enable targeted effects (drop shadows, highlights)
- enable micro-animation (blink, sway, shimmer)
- enable future modularity (swap door texture, swap awning color)

---

## 3) Entity classes (how to think about importance)

### 3.1 Primary entities (story/UX-critical)
These define the identity of the scene and must remain stable and readable.
- `ui.navbar` — primary navigation surface
- `char.bella` — narrator/host; appears across most scenes
- `env.store` — main setting object on HOME (may change for other scenes)
- `env.pathForeground` — foreground set piece (path + flowers) that anchors the stage

### 3.2 Filler entities (composition balance / continuity)
These exist to prevent blank dead space and help transitions feel cohesive.
- `fill.groundBlend` — subtle texture overlays between major entities (e.g., between path and store)
- other “bridge” textures: translucent watercolor wash, paper texture, light vignette

### 3.3 Accessory entities (depth + character)
These sell depth and atmosphere but should not steal focus.
- `env.field` — ground plane behind store
- `env.treeline` — horizon band
- `env.watertower` — distant landmark
- `env.cloud` — atmospheric cue
- future: thin sky overlay / gradient band between sky and trees

---

## 4) Current HOME hero: canonical relationship + stacking order

### 4.1 Canonical paint order (back → front)
1. `bg.sky` (watercolor sky canvas)
2. `env.cloud` (far atmosphere)
3. `env.watertower` (far landmark, right side)
4. `env.treeline` (horizon band; **occludes watertower**)
5. `env.field` (midground ground plane behind store; built from strips/layers)
6. `env.store` (primary setting object)
7. `fill.groundBlend` (optional bridge texture between store and path; can be behind path)
8. `env.pathForeground` (foreground path + roses/flowers; aligns to store door)
9. `char.bella` (narrator, typically off to side, full body visible)
10. `ui.navbar` (always top-most; clickable)

**Hard rules:**
- Treeline must occlude watertower.
- Field must sit behind store.
- Path must visually connect to store door (alignment rule).
- Bella sits above the environment (never hidden behind grass/path/store).
- Navbar sits above everything.

### 4.2 Spatial alignment rules
- **Path ↔ Store:** The *top of the path* should land close to the *bottom of the store* and visually point to the **door**.
- **Field ↔ Store:** Field begins behind the store and supports it (store appears planted).
- **Treeline:** repeats horizontally across the full viewport width (no seams).
- **Watertower:** sits behind treeline, off to the right; only partially visible.
- **Cloud:** floats above horizon; can drift; never covers the store.

---

## 5) Current implementation context (so edits stay grounded)

This section ties the bible to your **current code** so an AI has total context.

### 5.1 Global structure: background vs world vs overlay
**File:** `src/components/Stage.astro`

**Background sky (behind everything):**
```astro
<div class="background">
  <img class="bg-image" src={theme.bg} alt="Watercolor Sky Background" />
</div>
```

**World (moves between scenes):**
```astro
<div id="camera">
  <div id="world" class="world" style={`height:${SCENE_COUNT * 100}vh`}>
    ...
  </div>
</div>
```

**Overlay UI (on top, does not pan with world by default):**
```astro
<div class="overlay">
  <nav class="navBar">...</nav>
  <img class="bella" ... />
  <aside class="sideNav">...</aside>
</div>
```

### 5.2 HOME hero artboard
**File:** `src/components/Stage.astro`

The hero is authored inside:
```astro
<section id="home" class="scene">
  <div class="hero-stage__inner">
    <!-- hero layers here -->
  </div>
</section>
```

Key CSS concept already present:
- `.hero-stage__inner` is a fixed-size artboard (1920×1080).
- `.hero-layer` uses `transform: translate(-50%, -50%)` so left/top are center anchors.

### 5.3 HOME hero layers (current)
Inside `.hero-stage__inner` the current order is:
1) cloud (far)
2) watertower (far)
3) treeline band (horizon)
4) field strips/waves (midground)
5) store (subject)
6) grass slab (foreground)

This order is **already consistent** with the relationship rules above, except:
- The **path/roses foreground entity** is planned/partially present elsewhere; once added, it must go in front of store and field, behind Bella, below navbar.
- Bella is currently rendered in the overlay; functionally she is “front-most character layer.”

---

## 6) How to move things with GSAP in the current setup

### 6.1 Two kinds of motion you must not confuse
1) **Navigation motion**: moving the entire world between scenes/subpages  
   - This is done by animating the `#world` transform (x/y).
2) **Stage/entity motion**: animating objects inside a scene  
   - This is done by animating elements inside `#home` (hero layers or future entity roots).

Keep these separate to avoid weird “double movement.”

### 6.2 Navigation motion (current router behavior)
**File:** `src/scripts/stage-router.ts`

- Vertical scene changes are computed as:
```ts
return -i * window.innerHeight;
```

- About subpages move horizontally:
```ts
return -i * window.innerWidth;
```

**Meaning:** When you navigate HOME → ABOUT, the camera/world pans; when you go to ABOUT subpages, it pans sideways.

### 6.3 Stage/entity motion on HOME (recommended pattern)
For HOME hero “theatrical” transitions, treat each entity as a unit and animate in/out:

**Entity units to animate:**
- `env.cloud`
- `env.watertower`
- `env.treeline`
- `env.field` (as one)
- `env.store`
- `env.pathForeground` (as one, even if made of roses + path + roses)
- `char.bella` (as one, with possible component animations later)

**Recommended enter/exit behavior (generic):**
- Enter: `opacity 0 → 1`, tiny settle (`y +10 → 0`)
- Exit: `opacity 1 → 0`, tiny lift (`y 0 → -10`)

**Important:** Don’t animate the navbar with large motion; keep it “scene-reactive” (highlight/theme changes) but stable.

### 6.4 Practical GSAP targeting (today)
Right now many hero pieces are individual elements with classes:
- `.cloud`, `.waterTower`, `.treesFar`, `.store-base-wave`, `.shop`, `.grass`

So you can animate them as “entities” even before you build formal entity wrappers:
- Field entity = all `.store-base-wave` together (treat as one)
- Use a shared selector and animate as a group
- Prefer `autoAlpha` (opacity+visibility) for clean in/out

### 6.5 When clicking HOME from a subpage (best behavior)
Instead of laterally snapping, the goal is:
- current subpage stage elements exit
- HOME stage elements enter “fresh,” as if arriving

In the current router model, you can accomplish this by:
1) Triggering a HOME “enter timeline” when the route becomes HOME
2) Triggering an “exit timeline” for the previous scene’s entities
3) Then doing the world pan (or doing pan first, then enter)

**Rule:** Avoid showing a sideways “jump” across stages. If you must move, mask it with entity enter/exit.

---

## 7) Future improvements addendum (based on your direction)

### 7.1 Convert every major entity into a component-based “mini scene graph”
Goal: `entityRoot(x,y,z)` with children components.

**Examples:**
- `env.pathForeground` components:
  - `path.rosesLeft`
  - `path.main`
  - `path.rosesRight`
  - (optional) `path.shadow`, `path.highlight`

- `env.store` components:
  - `store.base`
  - `store.door`
  - `store.windows`
  - `store.awning`
  - (optional) `store.sign`, `store.glow`, `store.shadow`

**Benefits:**
- apply drop shadows or lighting per component
- animate components (door open, window shimmer) without moving the whole store
- swap components for seasonal variants (dark mode, winter)

### 7.2 Bella as a “puppet” narrator entity
**Planned capabilities:**
- Bella stays on stage for most scenes; outfits can change.
- Transparent WebM or Lottie overlay for mouth/face animation.
- Triggered audio + synchronized mouth movement.
- Speech bubble or caption overlays as interactive responses.

**Implementation guidance (conceptual):**
- `char.bella` becomes an entity root with subcomponents:
  - `bella.body` (static illustrated base)
  - `bella.mouthAnim` (WebM/Lottie)
  - `bella.blink` (optional)
  - `bella.speechBubble` (optional)

**Rule:** Bella is always above environment entities and never occluded by foreground scenery.

### 7.3 Theme switching (future “dark mode” theatrical swap)
When toggling theme:
- current entity set exits (light)
- replacement entity set enters (dark)
- Bella can stay and change outfit, or crossfade outfit layer

**Key requirement:** entities must be swappable without rewriting layout code. That’s why the entity/component system matters.

### 7.4 Add “fill/bridge” overlays to prevent dead space
Between major entities (store ↔ path), add semi-transparent texture:
- SVG watercolor wash
- paper grain overlay
- subtle vignette band

These are not “objects,” they’re **composition glue**:
- should not steal focus
- should be easy to tweak without moving everything else

### 7.5 Formalize an entity API (regardless of renderer)
Long-term, aim for:
- `stage.entity("env.store").set({ x, y, z })`
- `stage.entity("env.store").component("door").set(...)`
- consistent naming across all stages

This makes automation edits reliable and prevents “AI moved 9 layers and broke everything.”

---

## 8) “Extra dumb AI” constraints (the hard guardrails)

1) **Do not change the coordinate system.** Keep the artboard model and absolute positions.  
2) **Do not break stacking order.** Navbar top, Bella next, then foreground path, store, field, treeline, watertower, cloud, sky.  
3) **Treat multi-strip field as one entity.** Move it once.  
4) **Keep path aligned to store door.** If store moves, path must be adjusted to maintain alignment.  
5) **Never occlude Bella.** She is narrator/host.  
6) **Never occlude navbar.** Always clickable and legible.  
7) **When adding a new element, assign it a class:** primary / filler / accessory, and pick its Z tier.

---

## 9) Definition of done for any edit/refactor

A change is correct if:
- The canonical stacking and occlusion rules still hold.
- The path still visually connects to the store door.
- The field still reads as a unified plane behind the store.
- Bella remains the clear narrator figure and stays readable.
- Navbar stays readable and clickable during transitions.
- Composition is tuned for MacBook Pro 13" first; other viewports can be “OK” for now.
