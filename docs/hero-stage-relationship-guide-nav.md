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

