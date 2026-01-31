import gsap from "gsap";
import * as PIXI from "pixi.js";

export type HeroAssets = {
  cloud: string;
  watertower: string;
  treeline: string;
  store: string;
  storeBase: string;
  grass: string;
};

type MountedHero = {
  ready: Promise<void>;
  setActive: (active: boolean) => void;
  destroy: () => void;
};

type WaveDef = { top: number; height: number; opacity: number };

const WAVES: WaveDef[] = [
  { top: 580, height: 5, opacity: 0.2 + 0 * 0.1 },
  { top: 590, height: 10, opacity: 0.2 + 1 * 0.1 },
  { top: 600, height: 15, opacity: 0.2 + 2 * 0.1 },
  { top: 610, height: 25, opacity: 0.2 + 3 * 0.1 },
  { top: 625, height: 35, opacity: 0.2 + 4 * 0.1 },
  { top: 640, height: 45, opacity: 0.2 + 5 * 0.1 },
  { top: 660, height: 55, opacity: 0.2 + 6 * 0.1 },
  { top: 685, height: 65, opacity: 0.2 + 7 * 0.1 },
  { top: 715, height: 75, opacity: 0.2 + 8 * 0.1 },
];

function topLeftFromCenter(cx: number, cy: number, w: number, h: number) {
  return { x: cx - w / 2, y: cy - h / 2 };
}

function setSpriteCenteredByWidth(
  sprite: PIXI.Sprite,
  cx: number,
  cy: number,
  desiredW: number
) {
  sprite.anchor.set(0.5);
  sprite.position.set(cx, cy);
  // Pixi will preserve aspect ratio when setting one dimension.
  sprite.width = desiredW;
  sprite.scale.y = sprite.scale.x; // Ensure uniform scaling
}

function setSpriteCenteredByHeight(
  sprite: PIXI.Sprite,
  cx: number,
  cy: number,
  desiredH: number
) {
  sprite.anchor.set(0.5);
  sprite.position.set(cx, cy);
  sprite.height = desiredH;
  sprite.scale.x = sprite.scale.y; // Ensure uniform scaling
}

function makeRepeatBand(
  tex: PIXI.Texture,
  centerX: number,
  centerY: number,
  width: number,
  height: number
) {
  const band = new PIXI.TilingSprite({ texture: tex, width, height });
  // TilingSprite origin is top-left by default and anchor support varies by version/type
  // simpler to calculate top-left position manually
  const tl = topLeftFromCenter(centerX, centerY, width, height);
  band.position.set(tl.x, tl.y);
  return band;
}

export function mountPixiHomeHero(host: HTMLElement, assets: HeroAssets): MountedHero {
  let app: PIXI.Application | null = null;
  let tl: gsap.core.Timeline | null = null;

  let root: PIXI.Container | null = null;
  let far: PIXI.Container | null = null;
  let mid: PIXI.Container | null = null;
  let near: PIXI.Container | null = null;

  let isBuilt = false;
  let isActive = false;

  // Hidden by default until activated.
  host.style.display = "none";

  const ready = (async () => {
    app = new PIXI.Application();
    await app.init({
      resizeTo: host,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
    });

    // Ensure canvas fills host.
    app.canvas.style.width = "100%";
    app.canvas.style.height = "100%";
    app.canvas.style.display = "block";
    host.appendChild(app.canvas);

    // Root containers (entities)
    root = new PIXI.Container();
    far = new PIXI.Container();
    mid = new PIXI.Container();
    near = new PIXI.Container();

    root.addChild(far);
    root.addChild(mid);
    root.addChild(near);
    
    // Scale root to fit 1920x1080 design into current view
    // We want 'cover' behavior or 'contain' depending on preference.
    // Given the stage nature, let's use a scale strategy that keeps center focus.
    const resizeRoot = () => {
        if (!app) return;
        const scale = Math.max(app.screen.width / 1920, app.screen.height / 1080);
        root!.scale.set(scale);
        root!.position.set(app.screen.width / 2, app.screen.height / 2);
        root!.pivot.set(1920 / 2, 1080 / 2);
    };
    app.renderer.on('resize', resizeRoot);
    resizeRoot(); // Initial scale

    app.stage.addChild(root);

    // Load textures
    const [cloudTex, towerTex, treeTex, storeTex, storeBaseTex, grassTex] = await Promise.all([
      PIXI.Assets.load(assets.cloud),
      PIXI.Assets.load(assets.watertower),
      PIXI.Assets.load(assets.treeline),
      PIXI.Assets.load(assets.store),
      PIXI.Assets.load(assets.storeBase),
      PIXI.Assets.load(assets.grass),
    ]);

    // === LAYER: Cloud ===
    // DOM: left=1400 top=200 width=300
    const cloud = new PIXI.Sprite(cloudTex);
    setSpriteCenteredByWidth(cloud, 1400, 200, 300);
    far.addChild(cloud);

    // [New] Ambient Animation: Drifting Cloud
    app.ticker.add((ticker) => {
      // Move slightly to the right each frame
      // deltaMS scales the speed by frame time so it's consistent across refresh rates
      cloud.x += 0.015 * ticker.deltaMS; 

      // Reset if it goes too far right (assuming 1920 width + buffer)
      if (cloud.x > 2100) {
        cloud.x = -300;
      }
    });

    // === LAYER: Watertower ===
    // DOM: left=1600 top=400 width=260
    const tower = new PIXI.Sprite(towerTex);
    setSpriteCenteredByWidth(tower, 1600, 400, 260);
    far.addChild(tower);

    // === LAYER: Trees Far (repeat-x band) ===
    // DOM: center (960,500), size 4000x150
    const treesFar = makeRepeatBand(treeTex, 960, 500, 4000, 150);
    far.addChild(treesFar);

    // === LAYER STACK: Store-base waves (repeat-x bands) ===
    for (let i = 0; i < WAVES.length; i++) {
      const w = WAVES[i]!;
      const wave = makeRepeatBand(storeBaseTex, 960, w.top, 4000, w.height);
      wave.alpha = w.opacity;
      mid.addChild(wave);
    }

    // === LAYER: Storefront ===
    // DOM: left=960 top=585 width=600
    const store = new PIXI.Sprite(storeTex);
    setSpriteCenteredByWidth(store, 960, 585, 600);
    mid.addChild(store);

    // === LAYER: Grass foreground ===
    // DOM: center (960,870), height=360
    const grass = new PIXI.Sprite(grassTex);
    setSpriteCenteredByHeight(grass, 960, 870, 360);
    near.addChild(grass);

    // Default state: invisible until activated
    far.alpha = 0;
    mid.alpha = 0;
    near.alpha = 0;

    // Don’t burn GPU until activated.
    app.ticker.stop();

    isBuilt = true;
    
    // If it was set active while loading, trigger animation now
    if (isActive) setActive(true);
  })();

  function killTL() {
    if (tl) {
      tl.kill();
      tl = null;
    }
  }

  function setActive(nextActive: boolean) {
    isActive = nextActive;

    if (!isBuilt || !app || !far || !mid || !near) return;

    killTL();

    if (nextActive) {
      host.style.display = "block";
      app.ticker.start();

      // Reset + enter animation
      far.alpha = 0;
      mid.alpha = 0;
      near.alpha = 0;

      const baseFarY = 0;
      const baseMidY = 0;
      const baseNearY = 0;

      far.y = baseFarY;
      mid.y = baseMidY + 10;
      near.y = baseNearY + 16;

      tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.to(far, { alpha: 1, duration: 0.35 }, 0);
      tl.to(mid, { alpha: 1, y: baseMidY, duration: 0.55 }, 0.05);
      tl.to(near, { alpha: 1, y: baseNearY, duration: 0.65 }, 0.08);
      return;
    }

    // Exit animation then hide host
    tl = gsap.timeline({
      defaults: { ease: "power2.in" },
      onComplete: () => {
        if (!app) return;
        app.ticker.stop();
        if (!isActive) host.style.display = "none";
      },
    });
    tl.to([far, mid, near], { alpha: 0, duration: 0.25, stagger: 0.02 }, 0);
  }

  function destroy() {
    killTL();

    // Best-effort unload for this feature (keeps the rest of the app safe).
    try {
      // Pixi v8 exposes unload; if it’s not available in your installed version, this no-ops.
      (PIXI.Assets as any).unload?.([
        assets.cloud,
        assets.watertower,
        assets.treeline,
        assets.store,
        assets.storeBase,
        assets.grass,
      ]);
    } catch {
      // ignore
    }

    if (app) {
      app.destroy(true);
      app = null;
    }

    host.innerHTML = "";
    isBuilt = false;
    isActive = false;
  }

  return { ready, setActive, destroy };
}
