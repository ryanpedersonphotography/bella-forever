import * as PIXI from "pixi.js";
import gsap from "gsap";
import { createHomeHero, type HeroAssets } from "./home-hero";

export type StageManager = {
  mount: (container: HTMLElement) => Promise<void>;
  goToScene: (sceneId: string) => void;
  destroy: () => void;
};

// Internal state
let app: PIXI.Application | null = null;
let world: PIXI.Container | null = null;
let currentSceneId = 'home';
let tickHandlers: ((delta: number) => void)[] = [];

// HARDCODED ASSETS (Ideally passed in)
const assets: HeroAssets = {
  cloud: "/cloudl3.png",
  watertower: "/bobber3b.png",
  treeline: "/treeline6.png",
  store: "/bella-store-transparent.png",
  storeBase: "/store-base.png",
  grass: "/fg5.png"
};

export function createStageManager(): StageManager {
  
  async function mount(host: HTMLElement) {
    app = new PIXI.Application();
    await app.init({
      resizeTo: host,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    });

    // Ensure canvas fills host
    app.canvas.style.width = "100%";
    app.canvas.style.height = "100%";
    app.canvas.style.display = "block";
    host.appendChild(app.canvas);

    // Create World Container (1920x1080 Artboard)
    world = new PIXI.Container();
    app.stage.addChild(world);

    // Global Resize Logic
    const resize = () => {
      if (!app || !world) return;
      const scale = Math.max(app.screen.width / 1920, app.screen.height / 1080);
      world.scale.set(scale);
      world.position.set(app.screen.width / 2, app.screen.height / 2);
      world.pivot.set(1920 / 2, 1080 / 2);
    };
    app.renderer.on('resize', resize);
    resize();

    // --- SETUP SCENES ---
    
    // 1. HOME SCENE (Real Assets)
    const homeHero = createHomeHero(assets);
    world.addChild(homeHero.container);
    // Home is at Scene Index 0 (Y=0), so no positioning needed.
    
    // Wire up animation ticks
    homeHero.loadPromise.then(() => {
        tickHandlers.push(...homeHero.tickHandlers);
    });

    // 2. OTHER SCENES (Placeholders)
    const colors = [0xCCFFCC, 0xCCCCFF, 0xFFFFCC, 0xCCFFFF, 0xFFCCFF]; // Skipped Home color
    const sceneNames = ['about', 'shop', 'gallery', 'contact', 'blog'];
    
    sceneNames.forEach((name, i) => {
      const rect = new PIXI.Graphics();
      rect.rect(0, 0, 1920, 1080);
      rect.fill(colors[i]);
      rect.y = (i + 1) * 1080; // Start at index 1
      
      const text = new PIXI.Text({ text: name.toUpperCase(), style: { fontSize: 100, fill: 0x000000 } });
      text.anchor.set(0.5);
      text.x = 1920 / 2;
      text.y = ((i + 1) * 1080) + 540;
      
      world!.addChild(rect);
      world!.addChild(text);
    });
    
    // Global Ticker
    app.ticker.add((ticker) => {
        tickHandlers.forEach(fn => fn(ticker.deltaMS));
    });
  }

  function goToScene(sceneId: string) {
    if (!world) return;
    
    console.log(`[PixiStage] Navigating to ${sceneId}`);
    currentSceneId = sceneId;

    const sceneNames = ['home', 'about', 'shop', 'gallery', 'contact', 'blog'];
    const index = sceneNames.indexOf(sceneId);
    
    if (index >= 0) {
      // Pivot Y Target: 540 + (index * 1080)
      const targetPivotY = 540 + (index * 1080);
      
      gsap.to(world.pivot, {
        y: targetPivotY,
        duration: 1.2,
        ease: "power2.inOut"
      });
    }
  }

  function destroy() {
    tickHandlers = []; // clear handlers
    if (app) {
      app.destroy(true);
      app = null;
    }
    world = null;
  }

  return { mount, goToScene, destroy };
}