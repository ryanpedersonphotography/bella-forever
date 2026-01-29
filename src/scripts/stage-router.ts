import gsap from "gsap";

console.log("[stage-router] loaded", location.pathname, location.hash);
import { aboutSections } from "./stage-config";

const SCENE_ORDER = ["home", "about", "shop", "gallery", "contact", "blog"] as const;

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function getWorld(): HTMLElement {
  const el = document.querySelector<HTMLElement>("#world");
  if (!el) throw new Error("Missing #world");
  return el;
}

function getSceneRoot(scene: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`#${scene}`);
}

function ensureNavWipe(): HTMLElement {
  let wipe = document.querySelector<HTMLElement>("#navWipe");
  if (wipe) return wipe;

  wipe = document.createElement("div");
  wipe.id = "navWipe";
  Object.assign(wipe.style, {
    position: "fixed",
    inset: "0",
    zIndex: "9999",
    pointerEvents: "none",
    opacity: "0",
    // Adjust later; keep neutral for now
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  } as any);

  document.body.appendChild(wipe);
  return wipe;
}

function ensureBgLayer(): HTMLElement {
  let bg = document.querySelector<HTMLElement>("#bgLayer");
  if (bg) return bg;

  bg = document.createElement("div");
  bg.id = "bgLayer";
  Object.assign(bg.style, {
    position: "fixed",
    inset: "0",
    zIndex: "0",
    pointerEvents: "none",
  } as any);

  // Insert bgLayer before everything else in body so it sits behind.
  document.body.insertBefore(bg, document.body.firstChild);
  return bg;
}

function setBackgroundFor(scene: string): void {
  const bg = ensureBgLayer();
  bg.setAttribute("data-scene", scene);
}

function sceneToY(scene: string): number {
  const i = Math.max(0, SCENE_ORDER.indexOf(scene as any));
  return -i * window.innerHeight;
}

function defaultExitTL(scene: string): gsap.core.Timeline {
  const root = getSceneRoot(scene);
  const tl = gsap.timeline();
  if (!root) return tl;

  const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-stage-anim]"));
  const nodes = targets.length ? targets : [root];

  tl.to(nodes, {
    autoAlpha: 0,
    y: -14,
    duration: 0.25,
    stagger: targets.length ? 0.02 : 0,
    ease: "power2.in",
  });

  return tl;
}

function defaultEnterTL(scene: string): gsap.core.Timeline {
  const root = getSceneRoot(scene);
  const tl = gsap.timeline();
  if (!root) return tl;

  const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-stage-anim]"));
  const nodes = targets.length ? targets : [root];

  gsap.set(nodes, { autoAlpha: 0, y: 14 });

  tl.to(nodes, {
    autoAlpha: 1,
    y: 0,
    duration: 0.45,
    stagger: targets.length ? 0.03 : 0,
    ease: "power2.out",
  });

  return tl;
}

let __isNavAnimating = false;

function transitionToScene(fromScene: string, toScene: string): void {
  if (__isNavAnimating) return;
  __isNavAnimating = true;

  const world = getWorld();
  const wipe = ensureNavWipe();

  const toX = 0;
  const toY = sceneToY(toScene);

  gsap.killTweensOf(world);
  gsap.killTweensOf(wipe);

  if (prefersReducedMotion()) {
    setBackgroundFor(toScene);
    gsap.set(world, { x: toX, y: toY });
    __isNavAnimating = false;
    return;
  }

  wipe.style.pointerEvents = "auto";

  const tl = gsap.timeline({
    defaults: { ease: "power3.inOut" },
    onComplete: () => {
      wipe.style.pointerEvents = "none";
      __isNavAnimating = false;
    },
  });

  tl.add(defaultExitTL(fromScene), 0);

  tl.to(wipe, { opacity: 1, duration: 0.16, ease: "sine.in" }, 0.12);

  tl.add(() => {
    setBackgroundFor(toScene);
    gsap.set(world, { x: toX, y: toY });
  }, 0.20);

  tl.to(wipe, { opacity: 0, duration: 0.20, ease: "sine.out" }, 0.22);

  tl.add(defaultEnterTL(toScene), 0.24);
}

const routesToScene: Record<string, string> = {
  "/": "home",
  "/about": "about",
  "/shop": "shop",
  "/gallery": "gallery",
  "/contact": "contact",
  "/blog": "blog",
};

// const SCENE_ORDER = ["home", "about", "shop", "gallery", "contact", "blog"] as const; // Original line - REMOVED
const ABOUT_HASH_ORDER = aboutSections; // Use the shared config

const DESIGN_W = 1920;
const DESIGN_H = 1080;

function getCamera() {
  // Optional but recommended for “cool” feel
  return document.querySelector<HTMLElement>("#camera");
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

function bindNavHandlers() {
  // Main/top nav: vertical pans, clear hash, preserve X (handled in panVerticalToScene)
  document.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>(".navCluster a, a[aria-label='Home']");
    if (!a) return;

    const url = new URL(a.href, location.origin);
    if (url.origin !== location.origin) return;

    e.preventDefault();

    history.pushState({}, "", url.pathname); // clear hash
    const fromScene = currentSceneFromPath(location.pathname);
    const toScene = currentSceneFromPath(url.pathname);

    if (fromScene === "about" && toScene === "home") {
      transitionToScene("about", "home");
      return;
    }

    panVerticalToScene(toScene, false);
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

document.addEventListener("DOMContentLoaded", () => {
  bindNavHandlers();
  syncFromUrl(true);
});