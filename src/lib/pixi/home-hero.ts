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

export function createHomeHero(assets: HeroAssets) {
  const container = new PIXI.Container();
  let tl: gsap.core.Timeline | null = null;
  const tickHandlers: ((delta: number) => void)[] = [];

  // Layers
  const far = new PIXI.Container();
  const mid = new PIXI.Container();
  const near = new PIXI.Container();

  container.addChild(far);
  container.addChild(mid);
  container.addChild(near);

  // Load textures
  const loadPromise = Promise.all([
    PIXI.Assets.load(assets.cloud),
    PIXI.Assets.load(assets.watertower),
    PIXI.Assets.load(assets.treeline),
    PIXI.Assets.load(assets.store),
    PIXI.Assets.load(assets.storeBase),
    PIXI.Assets.load(assets.grass),
  ]).then(([cloudTex, towerTex, treeTex, storeTex, storeBaseTex, grassTex]) => {
    
    // === LAYER: Cloud ===
    const cloud = new PIXI.Sprite(cloudTex);
    setSpriteCenteredByWidth(cloud, 1400, 200, 300);
    far.addChild(cloud);

    // Drifting Cloud Animation
    tickHandlers.push((delta) => {
      cloud.x += 0.015 * delta; 
      if (cloud.x > 2100) cloud.x = -300;
    });

    // === LAYER: Watertower ===
    const tower = new PIXI.Sprite(towerTex);
    setSpriteCenteredByWidth(tower, 1600, 400, 260);
    far.addChild(tower);

    // === LAYER: Trees Far ===
    const treesFar = makeRepeatBand(treeTex, 960, 500, 4000, 150);
    far.addChild(treesFar);

    // === LAYER STACK: Waves ===
    for (let i = 0; i < WAVES.length; i++) {
      const w = WAVES[i]!;
      const wave = makeRepeatBand(storeBaseTex, 960, w.top, 4000, w.height);
      wave.alpha = w.opacity;
      mid.addChild(wave);
    }

    // === LAYER: Storefront ===
    const store = new PIXI.Sprite(storeTex);
    setSpriteCenteredByWidth(store, 960, 585, 600);
    mid.addChild(store);

    // === LAYER: Grass ===
    const grass = new PIXI.Sprite(grassTex);
    setSpriteCenteredByHeight(grass, 960, 870, 360);
    near.addChild(grass);

    // Initial State: Visible
    // (We removed the enter animation for now to simplify integration, 
    // or we can add it back if desired)
  });

  function destroy() {
    if (tl) tl.kill();
    container.destroy({ children: true });
  }

  return { container, loadPromise, tickHandlers, destroy };
}