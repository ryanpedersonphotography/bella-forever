import gsap from "gsap";

const routesToScene: Record<string, string> = {
  "/": "home",
  "/about": "about",
  "/shop": "shop",
  "/gallery": "gallery",
  "/contact": "contact",
};

const sceneOrder = ["home", "about", "shop", "gallery", "contact"];

// about sub-sections (left->right)
const aboutSections = ["story", "location", "team", "faq"];

const DESIGN_W = 1920;
const DESIGN_H = 1080;

function sceneToY(scene: string) {
  const i = Math.max(0, sceneOrder.indexOf(scene));
  return -i * window.innerHeight;
}

function aboutHashToX(hash: string) {
  const key = (hash || "#story").replace("#", "");
  const i = Math.max(0, aboutSections.indexOf(key));
  return -i * window.innerWidth;
}

function currentSceneFromPath(pathname: string) {
  return routesToScene[pathname] ?? "home";
}

function getWorld() {
  const world = document.querySelector<HTMLElement>("#world");
  if (!world) throw new Error("Missing #world");
  return world;
}

function getX(world: HTMLElement) {
  return Number(gsap.getProperty(world, "x")) || 0;
}
function getY(world: HTMLElement) {
  return Number(gsap.getProperty(world, "y")) || 0;
}

// Optional: show side nav only on /about
function setSideNavActive(scene: string) {
  const sideNav = document.querySelector<HTMLElement>(".sideNav");
  if (!sideNav) return;
  sideNav.classList.toggle("is-active", scene === "about");
}

// Vertical nav: move Y only, keep current X, then snap X to 0
function panVerticalToScene(scene: string, immediate = false) {
  const world = getWorld();
  const x = getX(world); // Keep current X
  const y = sceneToY(scene);

  setSideNavActive(scene);

  if (immediate) {
    gsap.set(world, { x: 0, y }); // Immediate = reset X
  } else {
    // Animate Y, holding X constant
    gsap.to(world, {
      x, 
      y,
      duration: 1.1,
      ease: "power3.inOut",
      onComplete: () => {
        // After arriving, slide X back to 0 (center)
        gsap.to(world, { x: 0, duration: 0.7, ease: "power2.out" });
      }
    });
  }
}

// About side nav: move X only, keep current Y
function panHorizontalAboutToHash(hash: string, immediate = false) {
  const world = getWorld();
  const scene = currentSceneFromPath(location.pathname);
  if (scene !== "about") return;

  const y = getY(world);
  const x = aboutHashToX(hash);

  setSideNavActive("about");

  if (immediate) gsap.set(world, { x, y });
  else gsap.to(world, { x, y, duration: 0.9, ease: "power3.inOut" });
}

// Sync both axes from URL (for initial load + resize + popstate)
function syncFromUrl(immediate = true) {
  const scene = currentSceneFromPath(location.pathname);
  const world = getWorld();

  const y = sceneToY(scene);
  const x = scene === "about" ? aboutHashToX(location.hash) : 0;

  setSideNavActive(scene);

  if (immediate) gsap.set(world, { x, y });
  else gsap.to(world, { x, y, duration: 0.9, ease: "power3.inOut" });
}

// Scale stage logic
function resizeStage() {
  const viewport = document.querySelector(".viewport");
  const stageInners = document.querySelectorAll<HTMLElement>(".hero-stage__inner");
  
  if (!viewport || stageInners.length === 0) return;

  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;

  // "Cover" behavior: Fill the viewport
  const scale = Math.max(vw / DESIGN_W, vh / DESIGN_H);

  // Center the stage within the viewport
  const xOffset = (vw - DESIGN_W * scale) / 2;
  const yOffset = (vh - DESIGN_H * scale) / 2;

  stageInners.forEach(stageInner => {
    gsap.set(stageInner, {
      scale,
      x: xOffset,
      y: yOffset,
      force3D: true,
      transformOrigin: "top left",
    });
  });
}

// --- Wiring ---

document.addEventListener("DOMContentLoaded", () => {
  resizeStage();
  syncFromUrl(true);
});

// Top nav clicks (vertical)
document.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>(".navBar a");
  if (!a) return;

  const url = new URL(a.href, location.origin);
  if (url.origin !== location.origin) return;

  e.preventDefault();

  history.pushState({}, "", url.pathname); // clear hash
  panVerticalToScene(currentSceneFromPath(url.pathname), false);
});

// Side nav clicks (horizontal on about)
document.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>(".sideNav a");
  if (!a) return;

  const url = new URL(a.href, location.origin);
  e.preventDefault();

  // Changed to pushState for history steps
  history.pushState({}, "", `${url.pathname}${url.hash}`);
  panHorizontalAboutToHash(url.hash, false);
});

// Back/forward
window.addEventListener("popstate", () => {
  syncFromUrl(false);
});

// Hash change (if user manually changes hash on /about)
window.addEventListener("hashchange", () => {
  if (currentSceneFromPath(location.pathname) === "about") {
    panHorizontalAboutToHash(location.hash || "#story", false);
  }
});

// Resize correction
window.addEventListener("resize", () => {
  resizeStage();
  syncFromUrl(true);
});