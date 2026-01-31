# Merge Guide: PixiJS Refactor (Experiment -> Master)

**Date:** January 31, 2026
**Branch:** `experiment/pixijs-refactor`
**Status:** Experimental / Validated

## ⚠️ Critical Warning
This branch replaces the core HTML/CSS rendering of the Hero Section (Scene 1) with a WebGL Canvas (PixiJS). **Do not merge this blindly.**

## Integration Checklist

### 1. Verification Before Merge
- [ ] **Visual Parity:** Confirm the PixiJS canvas aligns perfectly with the old HTML layout. (The "letterbox" scaling behavior might differ slightly from the old `background-size: cover` behavior on mobile).
- [ ] **Performance:** Check CPU/GPU usage. PixiJS is efficient, but ensuring `app.ticker` stops when the tab is inactive (already implemented) is crucial.
- [ ] **Z-Indexing:** Verify that the "Sign" and "Navigation" (which remain in HTML) sit *above* the Pixi Canvas (`z-index: 1`) but *below* any modals.

### 2. Code Cleanup (Post-Merge)
The current implementation in `Stage.astro` **comments out** the old HTML layers. When merging to master, you should:
- [ ] **Delete** the commented-out HTML code in `src/components/Stage.astro` (lines 66-77).
- [ ] **Remove** unused CSS classes associated with those elements (`.cloud`, `.waterTower`, `.treesFar`, `.store-base-wave`, `.shop`, `.grass`) from `src/styles` or `Stage.astro` <style> blocks to reduce bundle size.

### 3. Asset Management
- The `src/lib/pixi/home-hero.ts` file hardcodes asset paths. Ensure these paths match your `public/` folder structure.
- If you move or rename assets (like the new `public/house/` split assets), you must update the `assets` object in `PixiStage.svelte` or pass them as props.

### 4. Accessibility & SEO
- **Important:** The PixiJS canvas is invisible to screen readers.
- Ensure the `Handwriting` component (which contains the "Welcome" text) remains in the HTML layer (it currently does).
- Do not move text-heavy content into PixiJS unless you implement a screen-reader proxy.

## Future Expansion (The "Entity" System)
This refactor prepares the ground for the "Entity Component System" described in `hero-stage-bible-v3`.
- **To add the split house:** Update `src/lib/pixi/home-hero.ts` to load the separate `00_base.png`, `structure.png`, etc., instead of the single `store` sprite.
- **To animate Bella:** Remove the `<img class="bella">` from `Stage.astro` and add her as a Sprite in `home-hero.ts` (remember to convert her VW/VH coordinates to pixels!).

## Rollback Strategy
If this feature causes issues in production:
1. Revert the changes to `src/components/Stage.astro`.
2. The `src/lib/pixi` and `PixiStage.svelte` files can remain in the codebase as unused dead code without breaking the site.
