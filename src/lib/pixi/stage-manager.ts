import * as PIXI from "pixi.js";
import gsap from "gsap";
import { createHomeHero, type HeroAssets, type HomeHero } from "./home-hero";

export type StageManager = {
  mount: (container: HTMLElement) => Promise<void>;
  goToScene: (sceneId: string) => void;
  destroy: () => void;
};

// Internal state
let app: PIXI.Application | null = null;
let world: PIXI.Container | null = null;
let currentSceneId = "home";
let tickerFn: ((t: PIXI.Ticker) => void) | null = null;
let homeHero: HomeHero | null = null;

// HARDCODED ASSETS (Ideally passed in)
const assets: HeroAssets = {
  cloud: "/cloudl3.png",
  watertower: "/bobber3b.png",
  treeline: "/treeline6.png",
  store: "/bella-store-transparent.png",
  storeBase: "/store-base.png",
  grass: "/fg5.png",
};

// IMPORTANT: include home in the scene order so indices align with Y positions
const SCENES = ["home", "about", "shop", "gallery", "contact", "blog"] as const;

export function createStageManager(): StageManager {
  async function mount(containerEl: HTMLElement) {
    app = new PIXI.Application();
    await app.init({
      resizeTo: containerEl,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    });

    app.canvas.style.width = "100%";
    app.canvas.style.height = "100%";
    app.canvas.style.display = "block";
    containerEl.appendChild(app.canvas);

    world = new PIXI.Container();
    app.stage.addChild(world);

    const resize = () => {
      if (!app || !world) return;
      const scale = Math.max(app.screen.width / 1920, app.screen.height / 1080);
      world.scale.set(scale);
      world.position.set(app.screen.width / 2, app.screen.height / 2);
      world.pivot.set(1920 / 2, 1080 / 2);
    };
    app.renderer.on("resize", resize);
    resize();

    // --- SETUP SCENES ---

    // 1) HOME (Pixi entity)
    homeHero = createHomeHero(assets);
    world.addChild(homeHero.container);

    // 2) OTHER SCENES (Placeholders)
    const colors = [0xCCFFCC, 0xCCCCFF, 0xFFFFCC, 0xCCFFFF, 0xFFCCFF];
    const sceneNames = ["about", "shop", "gallery", "contact", "blog"];
    sceneNames.forEach((name, i) => {
      const rect = new PIXI.Graphics();
      rect.rect(0, 0, 1920, 1080);
      rect.fill(colors[i]);
      rect.y = (i + 1) * 1080;

      const text = new PIXI.Text({ text: name.toUpperCase(), style: { fontSize: 100, fill: 0x000000 } });
      text.anchor.set(0.5);
      text.x = 1920 / 2;
      text.y = ((i + 1) * 1080) + 540;

      world!.addChild(rect);
      world!.addChild(text);
    });

    // Global Ticker (one)
    tickerFn = (ticker) => {
      homeHero?.tick(ticker.deltaMS);
    };
    app.ticker.add(tickerFn);
  }

  function goToScene(sceneId: string) {
    if (!world) return;
    currentSceneId = sceneId;

    const index = SCENES.indexOf(sceneId as any);
    if (index >= 0) {
      const targetPivotY = 540 + index * 1080;
      gsap.to(world.pivot, {
        y: targetPivotY,
        duration: 1.0,
        ease: "power2.inOut",
      });
    }
  }

  function destroy() {
    if (app && tickerFn) {
      app.ticker.remove(tickerFn);
      tickerFn = null;
    }
    if (homeHero) {
      homeHero.destroy();
      homeHero = null;
    }
    if (app) {
      app.destroy(true);
      app = null;
    }
    world = null;
  }

  return { mount, goToScene, destroy };
}
