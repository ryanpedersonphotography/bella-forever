import gsap from "gsap";

console.log("[stage-router] loaded", location.pathname, location.hash);
import { aboutSections } from "./stage-config";

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
  const x = getX(world);            // PRESERVE X
  const y = sceneToY(scene);        // CHANGE Y
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

document.addEventListener("DOMContentLoaded", () => {
  bindNavHandlers();
  syncFromUrl(true);
});