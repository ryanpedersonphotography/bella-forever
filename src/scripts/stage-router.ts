import gsap from "gsap";

const routesToScene: Record<string, string> = {
  "/": "home",
  "/about": "about",
  "/shop": "shop",
  "/lookbook": "lookbook",
  "/contact": "contact",
};

function sceneToY(scene: string) {
  // vertical scenes stacked full-height
  const order = ["home", "about", "shop", "lookbook", "contact"];
  const i = Math.max(0, order.indexOf(scene));
  return -i * window.innerHeight;
}

function panToScene(scene: string, immediate = false) {
  const world = document.querySelector<HTMLElement>("#world");
  if (!world) return;

  const y = sceneToY(scene);

  if (immediate) {
    gsap.set(world, { y });
  } else {
    gsap.to(world, { y, duration: 1.1, ease: "power3.inOut" });
  }
}

function currentSceneFromPath(pathname: string) {
  return routesToScene[pathname] ?? "home";
}

// Handle initial load
document.addEventListener('DOMContentLoaded', () => {
  panToScene(currentSceneFromPath(location.pathname), true);
});


// Intercept in-site nav clicks
document.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement).closest("a");
  if (!a) return;

  const href = a.getAttribute("href");
  if (!href) return;

  // only intercept internal links (no http, no target blank, etc.)
  const url = new URL(href, location.origin);
  if (url.origin !== location.origin) return;
  if (a.getAttribute("target") === "_blank") return;

  const scene = currentSceneFromPath(url.pathname);

  // If route isn't one of our stage pages, let it navigate normally
  if (!routesToScene[url.pathname]) return;

  e.preventDefault();

  // Update URL without reload
  history.pushState({}, "", url.pathname);

  // Pan stage
  panToScene(scene);
});

// Back/forward buttons
window.addEventListener("popstate", () => {
  panToScene(currentSceneFromPath(location.pathname));
});

// Resize correction
window.addEventListener("resize", () => {
  panToScene(currentSceneFromPath(location.pathname), true);
});
