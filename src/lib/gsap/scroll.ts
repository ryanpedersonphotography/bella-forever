/* ========================================================================
   1) src/lib/gsap/scroll.ts
   ======================================================================== */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

export function ensureGsapRegistered() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}

export function killAllScrollTriggers() {
  // Kill triggers + tweens created by ScrollTrigger
  ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.globalTimeline.clear();
}

/**
 * Prefers reduced motion helper.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window !== "undefined") {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }
  return true;
}

/**
 * 1) PARALLAX LAYERS
 * Usage:
 *  - Add attributes: data-parallax data-depth="0.1..1.0"
 *  - Optional: data-parallax-x="true" for horizontal parallax
 */
export function setupParallaxLayers(root: HTMLElement) {
  ensureGsapRegistered();
  if (prefersReducedMotion()) return;

  const els = Array.from(root.querySelectorAll<HTMLElement>("[data-parallax]"));
  els.forEach((el) => {
    const depth = parseFloat(el.getAttribute("data-depth") || "0.3");
    const useX = el.getAttribute("data-parallax-x") === "true";

    gsap.to(el, {
      x: useX ? () => -depth * 60 : 0,
      y: () => -depth * 120,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: true
      }
    });
  });
}

/**
 * 2) PINNED HERO SEQUENCE
 * Suggestion:
 * - Pin the hero for ~120% scroll distance while doing subtle movements
 * - Uses selectors inside root:
 *   .hero, .shop, .awning, .sign, .bella, .foreground
 */
export function setupPinnedHero(root: HTMLElement) {
  ensureGsapRegistered();
  if (prefersReducedMotion()) return;

  const hero = root.querySelector<HTMLElement>(".hero");
  if (!hero) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "+=120%",
      pin: true,
      scrub: true
      // markers: true
    }
  });

  // Small “settle in”
  const shop = root.querySelector(".shop");
  if (shop) {
    tl.fromTo(
      shop,
      { y: 20, opacity: 0.9 },
      { y: 0, opacity: 1, duration: 1 }
    );
  }

  // Gentle awning bob (Assuming awning is part of shop or separate if split)
  const awning = root.querySelector(".awning");
  if (awning) {
    tl.fromTo(
      awning,
      { y: -6 },
      { y: 0, duration: 1 },
      0
    );
  }

  // Sign swing (tiny degrees)
  const sign = root.querySelector(".sign");
  if (sign) {
    tl.fromTo(
      sign,
      { rotation: -2, transformOrigin: "50% 0%" },
      { rotation: 2, duration: 1 },
      0
    );
  }

  // Bella slight weight shift
  const bella = root.querySelector(".bella");
  if (bella) {
    tl.fromTo(
      bella,
      { x: -6 },
      { x: 6, duration: 1 },
      0
    );
  }

  // Foreground drift for depth
  const foreground = root.querySelector(".foreground");
  if (foreground) {
    tl.fromTo(
      foreground,
      { y: 10 },
      { y: -10, duration: 1 },
      0
    );
  }

  return tl;
}

/**
 * 3) WINDOW DISPLAY CROSSFADE
 * Markup:
 * <div class="window window-left">
 *   <img class="window-item" data-window="left" data-index="0" ... />
 *   <img class="window-item" data-window="left" data-index="1" ... />
 *   <img class="window-item" data-window="left" data-index="2" ... />
 * </div>
 *
 * Behavior:
 * - Scroll through the window’s section; fades 0->1->2
 */
export function setupWindowCrossfade(root: HTMLElement, opts?: {
  triggerSelector?: string;
  windowName?: "left" | "right";
}) {
  ensureGsapRegistered();
  if (prefersReducedMotion()) return;

  const trigger = root.querySelector<HTMLElement>(opts?.triggerSelector || ".window-section");
  if (!trigger) return;

  const windowName = opts?.windowName || "left";
  const items = Array.from(
    root.querySelectorAll<HTMLElement>(`.window-item[data-window="${windowName}"]`)
  ).sort((a, b) => {
    const ai = parseInt(a.getAttribute("data-index") || "0", 10);
    const bi = parseInt(b.getAttribute("data-index") || "0", 10);
    return ai - bi;
  });

  if (items.length < 2) return;

  // initialize
  items.forEach((el, i) => gsap.set(el, { autoAlpha: i === 0 ? 1 : 0 }));

  // Timeline: each step fades to next
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: trigger,
      start: "top 75%",
      end: "bottom 25%",
      scrub: true
      // markers: true
    }
  });

  const step = 1 / (items.length - 1);

  for (let i = 0; i < items.length - 1; i++) {
    tl.to(items[i], { autoAlpha: 0, duration: step }, i * step);
    tl.to(items[i + 1], { autoAlpha: 1, duration: step }, i * step);
  }

  return tl;
}

/**
 * 4) MICRO-ANIMATIONS ONLY WHEN VISIBLE
 * Examples:
 * - steam drifting
 * - sparkle pulsing
 *
 * Markup examples:
 * .steam, .sparkle
 */
export function setupMicroAnimations(root: HTMLElement) {
  ensureGsapRegistered();
  if (prefersReducedMotion()) return;

  // Steam loop - only when water tower in view
  const waterTower = root.querySelector<HTMLElement>(".waterTower");
  const steam = root.querySelector<HTMLElement>(".steam");

  let steamTween = null;

  if (waterTower && steam) {
    ScrollTrigger.create({
      trigger: waterTower,
      start: "top 80%",
      end: "bottom 20%",
      onEnter: () => {
        steamTween = gsap.to(steam, {
          y: -20,
          opacity: 0,
          duration: 2,
          repeat: -1,
          yoyo: false,
          ease: "sine.inOut"
        });
      },
      onLeave: () => {
        steamTween?.kill();
        steamTween = null;
        gsap.set(steam, { clearProps: "all" });
      },
      onEnterBack: () => {
        steamTween = gsap.to(steam, {
          y: -20,
          opacity: 0,
          duration: 2,
          repeat: -1,
          yoyo: false,
          ease: "sine.inOut"
        });
      },
      onLeaveBack: () => {
        steamTween?.kill();
        steamTween = null;
        gsap.set(steam, { clearProps: "all" });
      }
    });
  }

  // Sparkle pulse - only when sparkle area in view
  const sparkles = Array.from(root.querySelectorAll<HTMLElement>(".sparkle"));
  if (sparkles.length) {
    sparkles.forEach((s, idx) => {
      ScrollTrigger.create({
        trigger: s,
        start: "top 90%",
        end: "bottom 10%",
        onEnter: () => {
          gsap.to(s, {
            opacity: 0.2,
            duration: 0.9 + idx * 0.05,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        },
        onLeave: () => gsap.killTweensOf(s),
        onEnterBack: () => {
          gsap.to(s, {
            opacity: 0.2,
            duration: 0.9 + idx * 0.05,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        },
        onLeaveBack: () => gsap.killTweensOf(s)
      });
    });
  }
}

/**
 * 5) “PAGE TURN” SECTION TRANSITION
 * Add a paper overlay div that wipes down between sections.
 * Markup:
 * <div class="paperWipe" />
 */
export function setupPaperWipe(root: HTMLElement) {
  ensureGsapRegistered();
  if (prefersReducedMotion()) return;

  const wipe = root.querySelector<HTMLElement>(".paperWipe");
  const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-section]"));

  if (!wipe || sections.length < 2) return;

  gsap.set(wipe, {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    opacity: 0,
    transformOrigin: "50% 0%"
  });

  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 65%",
      end: "top 35%",
      onEnter: () => {
        gsap.fromTo(
          wipe,
          { opacity: 0, scaleY: 0.98 },
          { opacity: 0.12, scaleY: 1, duration: 0.35, ease: "sine.out" }
        );
      },
      onLeave: () => {
        gsap.to(wipe, { opacity: 0, duration: 0.35, ease: "sine.in" });
      }
    });
  });
}

/**
 * Convenience initializer to run everything.
 */
export function initScrollEffects(root: HTMLElement) {
  ensureGsapRegistered();

  setupParallaxLayers(root);
  setupPinnedHero(root);
  setupWindowCrossfade(root, { windowName: "left", triggerSelector: ".window-section" });
  setupWindowCrossfade(root, { windowName: "right", triggerSelector: ".window-section" });
  setupMicroAnimations(root);
  setupPaperWipe(root);

  // Important for layout changes (images loading, font swaps, etc.)
  ScrollTrigger.refresh();
}