# Hero Stage Bible (Merged) — v3.0
**Target viewport:** MacBook Pro 13" desktop first (design-first; responsive polish later).  
**Core model:** Stage → Entities → Components (paper-tole / decoupage).  
**Scope:** HOME hero stage + navbar/scene-reactive UI + generalized stage-plane model for future scenes.

---

## 0) Big picture intent

The site behaves like a **theatrical puppet-show stage**:
- The **stage** can change per route/interaction (e.g., Store exterior → Paris 1920s).
- **Bella** is the narrator and a consistent on-stage fixture across many scenes (outfit swaps, micro-animation, future mouth sync).
- The visual world is built from **illustrated assets** (transparent PNGs, SVG textures) and later **animated layers** (transparent WebM, Lottie, CSS/Canvas effects).
- Transitions should feel **crafted**: entities exit, replacements enter, and the experience stays coherent.

To make this maintainable, every visible element must be understandable as either:
- a **primary entity** (story/UX-critical),
- an **accessory entity** (depth/atmosphere),
- or a **fill entity** (composition glue).

---

## 1) Abstract stage model (Background / Midground / Foreground)

Think of every scene as **three planes** (each plane can contain many entities and fill layers). This is the easiest mental model for humans and “extra dumb” AIs.

### 1.1 Background plane (far world)
**What it is:** Distant or mood-setting environment.  
**Examples:** `bg.sky`, haze bands, distant clouds, distant landmarks.  
**Rule:** Sets vibe; moves least; never competes with subject.

### 1.2 Midground plane (setting + subject base)
**What it is:** The “set” where the story happens.  
**Examples:** treeline, field, store, lake cutouts, ground textures that define place.  
**Rule:** Establishes location and supports the subject.

### 1.3 Foreground plane (framing + depth + interaction)
**What it is:** Closest framing elements and depth enhancers.  
**Examples:** path + flowers, near grass slab, paper/vignette edges, ground blends.  
**Rule:** Can overlap midground, but should not block the subject or Bella.

---

## 2) Terminology and hierarchy

### 2.1 Stage
The full presentation space for a route/section (HOME, ABOUT, etc.).

### 2.2 Entities
A moveable “thing” that should generally be controlled as a single unit:
- **Single-file entity:** one asset (e.g., a cloud PNG).
- **Component entity:** multiple assets glued together (e.g., store = base + door + windows + awning).

**Rule:** Entities enter/exit as one unit unless intentionally animating components.

### 2.3 Components
Sub-layers inside an entity, used to:
- apply effects (drop shadows, highlights)
- enable micro-animation (blink, sway, shimmer)
- enable modular swapping (seasonal variants, dark mode variants)

---

## 3) Entity classes (importance)

### 3.1 Primary entities (story/UX-critical)
- `ui.navbar` — navigation surface
- `char.bella` — narrator/host
- `env.store` — major setting object (HOME)
- `env.pathForeground` — foreground anchor (path + flowers)

### 3.2 Filler entities (composition glue)
- `fill.groundBlend` — bridge textures between major objects
- `fill.hazeBand`, `fill.paperGrain`, `fill.vignette` — subtle overlays that prevent dead space

### 3.3 Accessory entities (depth + character)
- `env.field` — midground plane behind store
- `env.treeline` — horizon band
- `env.watertower` — distant landmark (behind treeline)
- `env.cloud` — atmospheric cue

---

## 4) Coordinate system contract (non-negotiable for now)

### 4.1 Fixed artboard space
- The HOME hero is authored in a fixed artboard coordinate space (recommended **1920×1080**).

### 4.2 Single anchoring convention
- All hero layers use the same anchor rule (recommended **center anchor** so `x,y` are centers).

### 4.3 Design-first responsiveness
- Optimize for MacBook Pro 13" desktop first; other viewports can be “OK” until final polish.

---

## 5) Depth model: semantic Z tiers

Depth controls stacking, optional parallax, and optional atmospheric fades.

| Tier | Concept | Examples |
|---|---|---|
| Z0 | Background plane | sky |
| Z10–19 | Far atmosphere/landmarks | clouds, watertower |
| Z20–29 | Horizon occluders | treeline |
| Z30–39 | Midground ground plane | field strips / waves |
| Z40–49 | Primary setting object | store (and store components) |
| Z50–59 | Foreground framing | path/flowers, grass slab |
| Z60–69 | Character layer | Bella (usually above environment) |
| Z90+ | UI overlay | navbar, side UI |

**Note:** This corrects the earlier “primary subject = storefront” framing. In this project the primary *narrative* subject is Bella, while the store is the primary *setting* object.

---

## 6) HOME hero: canonical relationships and stacking order

### 6.1 Canonical paint order (back → front)
1. `bg.sky` (sky is an entity; can transition)
2. `env.cloud`
3. `env.watertower` (behind treeline)
4. `env.treeline` (occludes watertower)
5. `env.field` (behind store; can be multi-strip internally)
6. `env.store` (setting object; may become component-based)
7. `fill.groundBlend` (optional bridge between store and path)
8. `env.pathForeground` (path + roses/flowers; aligns to store door)
9. `char.bella` (narrator; above environment)
10. `ui.navbar` (top-most; clickable)

### 6.2 Spatial alignment rules
- **Path ↔ Store:** top of the path should land near the bottom of the store and visually point to the **door**.
- **Field ↔ Store:** field supports the store from behind (store feels planted).
- **Treeline:** seamless repeat across full width.
- **Watertower:** right-side landmark, partially hidden by treeline.
- **Cloud:** drifts above horizon; never covers store or Bella.

---

## 7) Navbar / scene-reactive UI

### 7.1 Entity: `ui.navbar`
- **Role:** primary navigation control surface.
- **Depth:** Z90+ (above stage).
- **Behavior:** reacts to scene changes (active state, theme, micro-animations).

### 7.2 “Moves with the scene” — two modes
Pick one and keep it consistent:

**Mode A — Viewport-pinned UI (default)**
- Navbar is pinned to viewport (does not pan with world X/Y).
- It “moves with the scene” via highlights, theme swaps, subtle enter/exit.

**Mode B — Scene-bound UI (intentional cinematic choice)**
- Navbar is inside the moving world and pans with scenes.
- Use only if explicitly desired (can harm usability).

**AI rule:** If uncertain, assume Mode A.

### 7.3 Buttons as objects
Treat each as its own object:
- `ui.nav.home`, `ui.nav.about`, `ui.nav.shop`, `ui.nav.gallery`, `ui.nav.contact`, `ui.nav.blog` (if present)

### 7.4 Safe transition behaviors
- Subtle enter: opacity 0→1, y -8→0
- Subtle exit: opacity 1→0, y 0→-8
- Active emphasis: underline/scale 1.00→1.03/shadow tweak

Hard limits:
- Don’t animate more than ~10–16px in Y.
- Don’t make nav vanish during transitions.

---

## 8) Current implementation context (so edits don’t drift)

This section references the current structure in `src/components/Stage.astro` and `src/scripts/stage-router.ts`.

### 8.1 Background vs world vs overlay (Stage.astro)
- Background sky: `.background` / `.bg-image`
- World movement container: `#camera` → `#world`
- Overlay: `.overlay` containing `.navBar`, `.bella`, `.sideNav`

### 8.2 HOME artboard conventions
- `.hero-stage__inner` is the fixed artboard.
- `.hero-layer` uses center anchoring via `translate(-50%, -50%)`.

### 8.3 World navigation behavior (stage-router.ts)
- Vertical scene pan uses `-i * window.innerHeight`
- ABOUT subpages pan uses `-i * window.innerWidth`

**Do not confuse:**
- world pan (navigation) vs entity animation (stage theatrics)

---

## 9) How to move entities with GSAP (current setup)

### 9.1 Two motion layers
1) **Navigation motion:** animate the world container to change scenes/subpages.
2) **Entity motion:** animate entities within a scene for enter/exit and micro-motion.

Keep them separate to avoid double transforms.

### 9.2 Recommended HOME enter/exit concept
- Enter HOME: far → mid → foreground → Bella (if she animates)
- Exit HOME: reverse; keep sky flexible

Suggested micro-parameters:
- far settle: 0–4px
- mid settle: 6–10px
- foreground settle: 10–16px
- storefront micro-scale: 0.99→1.00
- Bella: subtle puppet ease, never jittery

### 9.3 Grouping now (before a formal entity wrapper exists)
Until you wrap entities in dedicated “entity roots,” treat these selectors as entity groups:
- field entity ≈ all field strips (animate as one group)
- store entity ≈ storefront element (later becomes components)
- treeline, watertower, cloud each as their own

Use `autoAlpha` for clean show/hide, and prefer timeline-based enter/exit per scene.

### 9.4 HOME button from ABOUT subpage (avoid lateral snap)
Best visual:
- about-subpage elements exit
- HOME entities enter “fresh”
- mask the world pan with the enter/exit so you never see a sideways jump

---

## 10) Future improvements addendum

### 10.1 Component-based entities (mini scene graph)
**Path entity components (future):**
- `path.rosesLeft`, `path.main`, `path.rosesRight`
- optional `path.shadow`, `path.highlight`

**Store entity components (future):**
- `store.base`, `store.door`, `store.windows`, `store.awning`
- optional `store.sign`, `store.glow`, `store.shadow`

Benefits:
- local drop shadows / lighting per component
- micro-animation without moving entire entity
- easy seasonal/dark-mode swaps

### 10.2 Bella puppet system (future)
`char.bella` components:
- `bella.body` (static)
- `bella.mouthAnim` (transparent WebM or Lottie)
- `bella.blink` (optional)
- `bella.speechBubble` (optional)
- audio-triggered mouth sync + interaction events

Rule: Bella stays above environment entities.

### 10.3 Fill layers as a system
Add fill overlays to reduce dead space and smooth seams:
- haze band between sky and trees
- ground blend between store and path
- paper grain/vignette edges

### 10.4 “Lake cutout” pattern (animated water without redrawing art)
- `mid.lake.mask` (PNG with hole)
- `mid.lake.surface` (CSS animated water layer)
- `mid.lake.shoreDetails` (foam/highlights)

Rule: animated surface only shows through cutout; shoreline keeps painterly edge.

### 10.5 Theme swapping (future dark mode)
- light entities exit → dark counterparts enter
- Bella may stay and outfit-swap
- swapping must not require layout rewrites

---

## 11) Extra-dumb-AI guardrails (hard constraints)

1) Do not change the coordinate system (keep artboard model + absolute positions).  
2) Do not break stacking order: navbar top, Bella next, then foreground path, store, field, treeline, watertower, cloud, sky.  
3) Treat multi-strip field as one entity (move once).  
4) Keep path aligned to store door (store move implies path adjustment).  
5) Never occlude Bella (narrator/host).  
6) Never occlude navbar (always clickable and legible).  
7) When adding anything, classify it (primary/filler/accessory) and assign a plane + tier.

---

## 12) Flexibility clause (nothing is sacred)

None of these rules are written in stone. They’re defaults to keep the system coherent, but edge cases are expected:
- An entity can temporarily break planes for a specific shot/composition.
- A foreground element can move behind the subject if the scene demands it.
- Bella can step behind or in front of certain props for storytelling.
- A scene can intentionally flatten depth (graphic moment) or exaggerate it (dramatic transition).

**Guiding principle:** break rules deliberately (for a clear visual/narrative reason), not accidentally.



---

## Appendix A — Existing Relationship Guide (verbatim)

# Hero Stage Relationship & Interaction Guide (Renderer-Agnostic)

**Purpose:** This document is the “source of truth” for how the **HOME hero stage** is structured, layered, and related.  
It is **not tied to any renderer** (DOM, canvas, WebGL, etc.). It describes *what* the scene is and *how it must behave*.

Use this guide to:
- refactor the stage without breaking composition
- add new elements without re-layering everything
- give “extra dumb” AIs exact context so they stop moving the wrong stuff

---

## 0) Big picture: what the user should perceive

A watercolor sky sits infinitely behind everything. Far-away atmosphere elements (clouds and a watertower) live in front of the sky but behind a continuous treeline horizon band. In front of the treeline, the ground plane is built from repeated strips (field/waves) that lead to the storefront. The storefront is the primary focal object. A large foreground grass slab frames the bottom and is the front-most stage layer. UI (nav/buttons) sits above all stage layers and is not part of the stage physics.

---

## 1) Scene architecture: what moves vs what never moves

### 1.1 Background layer (never moves with stage navigation)
- **Conceptual name:** `bg.sky`
- **Rule:** The background/sky is always behind everything, and it does **not** move when the “world” pans between sections.
- **Why:** This preserves a calm watercolor backdrop and prevents nausea/visual chaos.

### 1.2 Stage world (moves between sections)
- **Conceptual name:** `world`
- **Rule:** The stage content for each page/section lives in a world that can move in **X** (for subpages) and **Y** (for main pages).  
- **Important:** This movement is for navigation between scenes. It is not the same thing as per-entity animation.

### 1.3 UI overlay (never moves with the world)
- **Conceptual name:** `ui.overlay`
- **Rule:** Navigation, persistent UI, and interactive controls sit above the stage. They do not participate in parallax or stage physics.
- **Why:** UI must remain readable/clickable and not drift.

---

## 2) Coordinate system contract (non-negotiable)

This is the main “don’t break it” rule.

### 2.1 Fixed artboard space
- **Conceptual name:** `home.artboard`
- **Rule:** The HOME hero stage is authored in a single fixed coordinate space (an artboard).
- **Recommended default:** **1920×1080** artboard units.

### 2.2 One anchor rule for all hero layers
- **Rule:** Every stage layer uses the **same anchor convention**.
- **Recommended:** **center anchor** (so `x,y` describe the layer’s center).
- **Why:** Center anchoring makes it far easier to move things around without recalculating offsets.

### 2.3 Design-first responsiveness (later)
- **Rule:** Optimize composition for your primary viewport (MacBook Pro 13" desktop).  
- Other viewports are allowed to be “just okay” until the final polish pass.

---

## 3) Depth model: semantic Z tiers

Depth is used for:
- stacking (which draws in front)
- optional parallax strength
- optional atmospheric fades

### 3.1 Z tier table
Use these as a stable convention:

| Tier | Concept | Example Entities |
|---|---|---|
| Z0 | Infinite background | sky |
| Z10–19 | Far atmosphere/landmarks | clouds, watertower |
| Z20–29 | Horizon occluders | treeline band |
| Z30–39 | Midground ground plane | field strips / waves |
| Z40–49 | Primary subject | storefront |
| Z50–59 | Foreground framing | grass slab |
| Z90+ | UI overlay | nav/buttons |

**Rule:** Only one thing should be the “front-most stage layer” (usually the grass).  
**Rule:** UI is always above the stage.

---

## 4) Entity map (what exists on the HOME hero stage)

Each entity is a **moveable chunk**. Entities can contain multiple layers.

### 4.1 Entity: `bg.sky` (background)
- **Role:** Sets tone, lighting, and softness.
- **Depth:** Z0
- **Must be behind:** everything.

**Do:**
- fill the viewport or stage window
- keep soft gradients / watercolor texture
- treat as environment, not an object

**Do not:**
- move it with the world
- let it occlude stage objects

---

### 4.2 Entity: `far.clouds` (atmospheric)
- **Role:** depth cue, mood.
- **Depth:** Z10–12
- **Must be in front of:** sky
- **Must be behind:** treeline and all mid/near layers

**Do:**
- allow subtle drift or micro-movement
- keep low contrast

**Do not:**
- cover the storefront
- move aggressively

---

### 4.3 Entity: `far.watertower` (distant landmark)
- **Role:** adds world realism and a distant focal point.
- **Depth:** Z11–13
- **Critical relationship:** must appear **behind the treeline** (partially occluded).

**Do:**
- keep motion minimal
- treat as “far distance” (small parallax if used)

**Do not:**
- ever draw it in front of the treeline

---

### 4.4 Entity: `horizon.treeline` (occluder band)
- **Role:** horizon boundary; establishes depth by occluding far objects.
- **Depth:** Z20–25
- **Must be in front of:** clouds + watertower
- **Must be behind:** field, storefront, grass

**Geometry behavior:**
- should span across and beyond the artboard width
- should tile/repeat seamlessly

**Critical relationship rule:**
- Treeline is the “occlusion layer” that hides parts of the watertower.

---

### 4.5 Entity: `mid.field` (ground plane made of strips)
- **Role:** creates the midground ground plane leading into the subject.
- **Depth:** Z30–38
- **Must be in front of:** treeline
- **Must be behind:** storefront and grass

**Construction rule (very important):**
- It may be built from many strips (repeat-x bands), but it must be treated as **one entity** for positioning and reasoning.
- “Field” is one thing: **move it once, not 9 times**.

**Animation guidance:**
- okay to animate internal strips subtly (shimmer), but the entity’s overall placement should remain stable.

---

### 4.6 Entity: `mid.storefront` (primary subject)
- **Role:** the main focal object.
- **Depth:** Z40–45
- **Must be in front of:** mid.field
- **Must be behind or just above:** grass (depending on overlap)

**Stability rule:**
- Storefront should not drift dramatically. It is the anchor.

---

### 4.7 Entity: `near.grass` (foreground framing slab)
- **Role:** closest depth layer; frames the bottom; sells depth.
- **Depth:** Z50–55
- **Must be in front of:** all stage elements (except UI)

**Overlap rule:**
- Allowed to overlap bottom of field/storefront lightly to enhance depth.

---

### 4.8 Entity: `ui.overlay` (nav + persistent UI)
- **Role:** controls; should remain legible and clickable.
- **Depth:** Z90+
- **Must be in front of:** everything.

**Rule:** UI does not participate in stage parallax.  
**Rule:** UI should not be positioned using the hero artboard coordinate system unless intentionally designed that way.

---

## 5) Strict stacking order (back → front)

This is the canonical paint order:

1. `bg.sky`  
2. `far.clouds`  
3. `far.watertower`  
4. `horizon.treeline`  **(occludes watertower)**  
5. `mid.field`  
6. `mid.storefront`  
7. `near.grass`  
8. `ui.overlay`  

If a refactor breaks this, the scene will look wrong.

---

## 6) Interaction rules (enter/exit, scroll, and navigation)

These rules describe desired behavior, not implementation.

### 6.1 Entering the HOME hero
The hero should feel like it “settles in”:
- far elements appear first (clouds/treeline) very softly
- mid elements appear next (field, storefront)
- foreground grass appears last (most presence)

**Good defaults:**
- opacity fades
- tiny y-settle (far: 0–4px, mid: 6–10px, near: 10–16px)
- micro scale on storefront (0.99 → 1.00)

### 6.2 Exiting the HOME hero
Exit should not feel like everything collapses:
- storefront + foreground can fade/settle out slightly earlier
- sky/background can remain stable or crossfade

### 6.3 Scroll-driven motion (optional)
If you use parallax:
- far moves least
- mid moves more
- near moves most

**Hard rule:** do not parallax the storefront so much it detaches from the ground plane.

---

## 7) “Extra dumb AI” handholding rules

These are explicit constraints for automated edits.

### 7.1 Don’t change coordinate system
- Do not replace artboard pixel coordinates with vw/vh for stage objects.
- Do not mix anchoring rules within the same stage.

### 7.2 Treat the field strips as a single object
If an AI needs to move the field:
- it must move the **field entity root** (one place)
- it must not individually shift each strip unless it is intentionally changing the internal texture.

### 7.3 Preserve occlusion logic
- watertower must remain behind treeline
- treeline must remain behind field/store/grass

### 7.4 Preserve subject clarity
- storefront must remain clearly visible (not covered by grass too much)
- avoid placing new objects that overlap the storefront face/door/sign area unless intended

### 7.5 Adding new elements: choose an entity + tier
When adding a new thing, the AI must answer:
1) Which entity group does it belong to? (far/horizon/mid/near/ui)
2) What Z tier should it use?
3) What does it occlude / what occludes it?

If it can’t answer those, it shouldn’t add the element.

---

## 8) Naming convention for future refactors (recommended)

Even if the current code doesn’t have these names yet, use them in comments/IDs:

- `bg.sky`
- `far.cloud.0`
- `far.watertower.0`
- `horizon.treeline`
- `mid.field` and children `mid.field.strip.0..n`
- `mid.storefront`
- `near.grass`
- `ui.overlay`

This makes it trivial to say: “move `mid.field` down 20px” without touching the internal strips.

---

## 9) Current HOME hero elements (implementation reference)

This section describes the current objects and what they mean (no renderer-specific instructions).

### 9.1 Sky/background
- Full-screen watercolor backdrop behind everything.

### 9.2 Far objects
- A cloud object: far atmosphere.
- A watertower object: far landmark.
- Both must be behind treeline.

### 9.3 Horizon
- Treeline band repeats across the width; it occludes the watertower.

### 9.4 Midground
- Field plane built from multiple repeated strips stacked vertically; treated as one entity.

### 9.5 Main subject
- Storefront centered in the composition, anchored to the field.

### 9.6 Foreground
- Grass slab spans wide, frames bottom edge.

### 9.7 UI overlay
- Always above stage; does not move with stage.

---

## 10) “Definition of done” for any edit/refactor

An edit is correct if:
- the canonical stacking order still holds
- watertower is still partially occluded by treeline
- field still reads as a unified ground plane
- storefront remains the primary readable focal point
- grass still frames the bottom and feels closest
- UI remains clickable and stable

If any of those are violated, the edit is not acceptable.


---

## 11) Navbar / Home hero buttons (UI that is *scene-reactive*)

This section adds the **navbar button elements** to the stage model so automation understands they are part of the HOME experience and must stay consistent as scenes change.

### 11.1 Conceptual entity: `ui.navbar`
- **Role:** primary navigation control surface (Home/About/etc).
- **Depth:** **Z90+** (always above stage art).
- **Interaction:** **scene-reactive** (can animate/transition when scenes change).

### 11.2 Important clarification: “moves with the scene”
There are two valid interpretations. Pick one and stick to it:

**Mode A — Viewport-pinned UI (recommended default)**
- The navbar’s *physical position* is pinned to the viewport (does **not** pan with world X/Y).
- The navbar can still “move with the scene” in the sense that it:
  - highlights the active section
  - changes theme (colors/shadows)
  - animates in/out slightly during scene transitions (fade/slide/scale)
- This is the standard approach because it preserves usability.

**Mode B — Scene-bound UI (only if explicitly desired)**
- The navbar is treated like a stage entity and is inside the moving world, so it pans with the scene.
- This is visually cinematic but can harm usability if it drifts too much.

**Rule for “extra dumb AIs”:**
- Do **not** change which mode is used without an explicit instruction.
- If uncertain, assume **Mode A**.

### 11.3 Buttons as first-class objects
Treat each navbar button as its own object for consistency and automation.

**Conceptual objects:**
- `ui.nav.home`
- `ui.nav.about`
- `ui.nav.shop`
- `ui.nav.gallery`
- `ui.nav.contact`
- `ui.nav.blog` (if present)

**Shared button rules:**
- Buttons must remain clickable and readable at all times.
- Button spacing and hit area should not shrink below comfortable tap/click targets.
- Active state must be unambiguous.

### 11.4 Navbar relationships to stage entities
Navbar sits above everything and does not get occluded by stage elements.

**Navbar must be in front of:**
- `near.grass`, `mid.storefront`, `mid.field`, `horizon.treeline`, `far.*`, `bg.sky`

**Navbar must not be affected by:**
- stage parallax (unless Mode B)
- stage occlusion
- artboard coordinate changes

### 11.5 Scene-change behavior (what “moves with the scene” means operationally)

When navigating between scenes, the navbar should respond in these ways:

**Required:**
1) Active button changes to match current scene.
2) If there is an “in-scene” theme (background or palette), navbar can adjust contrast.

**Optional (safe animations):**
- Fade/slide the navbar by a small amount during transitions:
  - enter: opacity 0 → 1, y: -8 → 0
  - exit: opacity 1 → 0, y: 0 → -8
- Micro-emphasis on active button:
  - underline appears
  - slight scale (1.00 → 1.03)
  - glow/shadow change

**Hard limits (don’t break UX):**
- Do not animate navbar more than ~10–16px in Y for transitions.
- Do not animate for so long that it feels laggy compared to the stage motion.

### 11.6 “Extra dumb AI” constraints for navbar edits
- Do not rewrite all nav markup when only colors/labels change.
- Do not change button order unless explicitly instructed.
- Do not convert buttons into images unless explicitly instructed.
- Do not attach navbar to stage artboard coordinates unless explicitly instructed (that switches to Mode B).

### 11.7 Definition of done for navbar-related changes
A navbar change is correct if:
- buttons remain readable over the sky/store/grass
- active state is clear on every route
- click targets remain consistent
- scene transitions do not cause navbar to jitter, drift unpredictably, or disappear

---

## Appendix B — Existing Bible v2 (verbatim)

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
