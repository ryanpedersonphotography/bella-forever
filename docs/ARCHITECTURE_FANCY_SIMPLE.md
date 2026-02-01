# Fancy vs Simple Architecture

**Date:** January 31, 2026
**Status:** Active Refactor

## Overview
The project now runs two mutually exclusive rendering modes for the Hero Stage.

### 1. Simple Mode (`/simple`)
- **Technology:** DOM + CSS Transforms + GSAP.
- **Entry Point:** `src/pages/simple.astro` -> `StageLayout.astro` -> `Stage.astro`.
- **Logic:** `src/scripts/stage-router.ts` drives the `#world` and `#camera` divs.
- **Use Case:** Mobile devices, legacy fallback, or user preference.

### 2. Fancy Mode (`/` default)
- **Technology:** PixiJS (WebGL) + GSAP.
- **Entry Point:** `src/pages/index.astro` -> `StageLayout.astro` -> `Stage.astro`.
- **Logic:** `src/lib/pixi/stage-manager.ts` drives the WebGL Camera.
- **Components:**
    - `src/components/PixiStage.svelte`: Wrapper component.
    - `src/lib/pixi/home-hero.ts`: The "Home" scene entity.
- **Behavior:** The DOM `#world` is NOT rendered. Only the Pixi Canvas and the static UI Overlay (Nav, Sign) are present.

## Mutual Exclusion
- `StageLayout.astro` determines the mode based on the URL.
- It passes `mode='simple' | 'fancy'` to `Stage.astro`.
- `Stage.astro` conditionally renders either the DOM structure OR the Pixi component.
- `stage-router.ts` is only loaded in Simple mode.

## Development Rules
- **Do NOT** try to sync the Pixi camera with the DOM camera. They are separate engines.
- **Do NOT** import `stage-router.ts` in Fancy mode.
- **Do** duplicate data/assets config if necessary to keep the engines decoupled (e.g. `waves` config).
