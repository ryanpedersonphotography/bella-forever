import { gsap } from "gsap";

const DESIGN_W = 1920;
const DESIGN_H = 1080;

// Only run on client
if (typeof window !== "undefined") {
  const stageContainer = document.querySelector(".hero-stage") as HTMLElement | null;
  const stageInner = document.querySelector(".hero-stage__inner") as HTMLElement | null;
  const store = document.querySelector("#hero-store") as HTMLElement | null;
  const grass = document.querySelector("#hero-grass") as HTMLElement | null;
  const bg = document.querySelector("#hero-bg") as HTMLElement | null;

  const resizeStage = () => {
    if (!stageContainer || !stageInner) return;

    const vw = stageContainer.clientWidth;
    const vh = stageContainer.clientHeight;

    // "Cover" behavior: Fill the viewport
    const scale = Math.max(vw / DESIGN_W, vh / DESIGN_H);

    // Center the stage within the viewport
    const xOffset = (vw - DESIGN_W * scale) / 2;
    const yOffset = (vh - DESIGN_H * scale) / 2;

    gsap.set(stageInner, {
      scale,
      x: xOffset,
      y: yOffset,
      force3D: true,
      transformOrigin: "top left",
    });
  };

    // Initialize sizing
    window.addEventListener("resize", resizeStage);
    // Call immediately to set initial state
    resizeStage();

    // Set initial centering anchor for actors
    gsap.set("#hero-store, #hero-grass", { xPercent: -50, yPercent: -50 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  if (store && grass) {
    tl.to(store, {
      opacity: 1,
      y: "-=50",
      duration: 1.5,
    }).to(
      grass,
      {
        opacity: 1,
        y: "-=30",
        duration: 1.5,
      },
      "-=1.2",
    );
  }

  if (stageContainer) {
    stageContainer.addEventListener("mousemove", (e: MouseEvent) => {
      const xNorm = e.clientX / window.innerWidth - 0.5;
      const yNorm = e.clientY / window.innerHeight - 0.5;

      if (store) {
        gsap.to(store, {
          x: -xNorm * 40,
          y: -yNorm * 40 - 50,
          duration: 1,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      if (grass) {
        gsap.to(grass, {
          x: -xNorm * 100,
          y: -yNorm * 30 - 30,
          duration: 1,
          ease: "power2.out",
        });
      }

      if (bg) {
        gsap.to(bg, {
          x: xNorm * 30,
          y: yNorm * 30,
          duration: 1,
          ease: "power2.out",
        });
      }
    });
  }
}
