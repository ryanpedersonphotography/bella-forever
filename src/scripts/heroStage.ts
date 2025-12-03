import { gsap } from "gsap";

const DESIGN_W = 1920;
const DESIGN_H = 1080;

// Only run on client
if (typeof window !== "undefined") {
  const stageContainer = document.querySelector(".hero-stage") as HTMLElement | null;
  const stageInner = document.querySelector(".hero-stage__inner") as HTMLElement | null;
  const store = document.querySelector("#hero-store") as HTMLElement | null;
  const storeBase = document.querySelector("#hero-store-base") as HTMLElement | null;
  const grass = document.querySelector("#hero-grass") as HTMLElement | null;
  const bg = document.querySelector("#hero-bg") as HTMLElement | null;
  const bella = document.querySelector("#hero-bella") as HTMLElement | null;
  const treeline = document.querySelector("#hero-treeline") as HTMLElement | null;
  const watertower = document.querySelector("#hero-watertower") as HTMLElement | null;
  const cloud = document.querySelector("#hero-cloud") as HTMLElement | null;

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
    gsap.set("#hero-store, #hero-store-base, #hero-grass, #hero-bella, #hero-treeline, #hero-watertower, #hero-cloud", { xPercent: -50, yPercent: -50 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  if (store && storeBase && grass && bella && treeline && watertower && cloud) {
    tl.to(cloud, {
      opacity: 1,
      duration: 2.5, // Slow fade
    })
    .to(watertower, {
      opacity: 1,
      y: "-=10", // Farthest object
      duration: 1.5,
    }, "<0.5")
    .to(treeline, {
      opacity: 1,
      y: "-=20",
      duration: 1.5,
    }, "<")
    .to(store, {
      opacity: 1,
      y: "-=50",
      duration: 1.5,
    }, "<0.2") // Start slightly after treeline
    .to(storeBase, {
      opacity: 1,
      y: "-=50",
      duration: 1.5,
    }, "<") // Sync with store
    .to(bella, {
      opacity: 1,
      y: "-=40", // Move up 40px
      duration: 1.5,
    }, "-=1.3")
    .to(grass, {
      opacity: 1,
      y: "-=30",
      duration: 1.5,
    }, "-=1.2");

    // Cloud Drift Animation (Loop)
    gsap.to(cloud, {
      x: "+=300",          // move 300px to the right
      y: "-=15",           // float up a bit
      duration: 60,        // very slow
      ease: "none",
      repeat: -1,
      yoyo: true
    });
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

      if (storeBase) {
        gsap.to(storeBase, {
          x: -xNorm * 40,
          y: -yNorm * 40 - 50,
          duration: 1,
          ease: "power2.out",
          overwrite: "auto",
        });
      }

      if (bella) {
        gsap.to(bella, {
          x: -xNorm * 60, // Mid-foreground movement
          y: -yNorm * 35 - 40, // Include entrance offset
          duration: 1,
          ease: "power2.out",
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

      if (treeline) {
        gsap.to(treeline, {
          x: -xNorm * 15, // Distance movement
          y: -yNorm * 15,
          duration: 1,
          ease: "power2.out",
        });
      }

      if (watertower) {
        gsap.to(watertower, {
          x: -xNorm * 10, // Farthest movement
          y: -yNorm * 10,
          duration: 1,
          ease: "power2.out",
        });
      }

      // Cloud removed from parallax to allow drift

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
