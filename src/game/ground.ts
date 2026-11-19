import type Phaser from "phaser";
import type { MapData } from "./maps";
import { hash2, noise2 } from "./noise";

type Palette = {
  grass: [string, string, string, string];
  blade: string;
  bladeDark: string;
  path: [dark: string, base: string, light: string];
  pathEdge: string;
  trodden: string;
  bank: string;
};

const VILLAGE: Palette = {
  grass: ["#6a8a4e", "#739456", "#7c9c5c", "#86a463"],
  blade: "#97b06a",
  bladeDark: "#5e7d47",
  path: ["#c4ad7d", "#d6c395", "#e3d3a8"],
  pathEdge: "#ad966a",
  trodden: "#7f8f56",
  bank: "#3b5f45",
};
const FOREST: Palette = {
  grass: ["#3d6447", "#456d4b", "#4e7650", "#598055"],
  blade: "#6f9460",
  bladeDark: "#335841",
  path: ["#b39e72", "#c7b384", "#d6c395"],
  pathEdge: "#9a865e",
  trodden: "#5d7450",
  bank: "#2b4f40",
};

const rgb = (hex: string) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

/** Pixel-level box sum over a tile mask, used to round path corners. */
function integral(map: MapData, value: number, W: number, H: number) {
  const sum = new Int32Array((W + 1) * (H + 1));
  for (let y = 0; y < H; y++) {
    let row = 0;
    const tileRow = map.tiles[y >> 4];
    for (let x = 0; x < W; x++) {
      row += tileRow[x >> 4] === value ? 1 : 0;
      sum[(y + 1) * (W + 1) + x + 1] = sum[y * (W + 1) + x + 1] + row;
    }
  }
  return (x: number, y: number, r: number) => {
    const x0 = Math.max(0, x - r),
      y0 = Math.max(0, y - r),
      x1 = Math.min(W, x + r + 1),
      y1 = Math.min(H, y + r + 1);
    const s =
      sum[y1 * (W + 1) + x1] - sum[y0 * (W + 1) + x1] - sum[y1 * (W + 1) + x0] + sum[y0 * (W + 1) + x0];
    return s / ((x1 - x0) * (y1 - y0));
  };
}

/**
 * Bakes the whole floor of a map into one canvas texture (one draw call instead
 * of a sprite per tile). Paths get rounded corners and a soft grass→dirt edge;
 * collision is untouched because it still reads `map.solid` per tile.
 */
export function bakeGround(
  scene: Phaser.Scene,
  key: string,
  map: MapData,
  forest: boolean,
  keepClear: Array<{ x: number; y: number }>,
) {
  if (scene.textures.exists(key)) return key;
  const W = map.width * 16,
    H = map.height * 16,
    P = forest ? FOREST : VILLAGE,
    seed = forest ? 41 : 17;
  const texture = scene.textures.createCanvas(key, W, H)!;
  const c = texture.context;
  const image = c.createImageData(W, H),
    data = image.data;
  const grass = P.grass.map(rgb),
    blade = rgb(P.blade),
    bladeDark = rgb(P.bladeDark),
    path = P.path.map(rgb),
    edge = rgb(P.pathEdge),
    trodden = rgb(P.trodden),
    bank = rgb(P.bank);
  const pathAt = integral(map, 1, W, H),
    waterAt = integral(map, 2, W, H);
  const put = (x: number, y: number, color: number[]) => {
    const i = (y * W + x) * 4;
    data[i] = color[0];
    data[i + 1] = color[1];
    data[i + 2] = color[2];
    data[i + 3] = 255;
  };
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const jitter = (noise2(x / 5, y / 5, seed + 1) - 0.5) * 0.28;
      const p = pathAt(x, y, 5) + jitter;
      if (p > 0.5) {
        const n = noise2(x / 7, y / 7, seed + 2) * 0.75 + hash2(x, y, seed) * 0.25;
        let color = n > 0.68 ? path[2] : n < 0.3 ? path[0] : path[1];
        if (hash2(x, y, seed + 3) > 0.985) color = path[0];
        if (p < 0.6) color = edge;
        put(x, y, color);
        continue;
      }
      // Grass: clustered tones, darker under the canopy in the forest.
      const n = noise2(x / 9, y / 9, seed + 4) * 0.7 + hash2(x, y, seed + 5) * 0.3;
      let tone = n < 0.34 ? 0 : n < 0.52 ? 1 : n < 0.72 ? 2 : 3;
      if (forest && noise2(x / 38, y / 38, seed + 6) < 0.4) tone = Math.max(0, tone - 1);
      let color = grass[tone];
      if (p > 0.38) color = hash2(x, y, seed + 7) < 0.55 ? trodden : grass[Math.max(0, tone - 1)];
      const water = waterAt(x, y, 2);
      if (water > 0 && map.tiles[y >> 4][x >> 4] !== 2) color = water > 0.25 ? bank : grass[0];
      put(x, y, color);
      // Short two-pixel blades.
      const b = hash2(x, y, seed + 8);
      if (b > 0.988 && y > 0 && p < 0.3 && !water) {
        put(x, y, bladeDark);
        put(x, y - 1, blade);
      }
    }
  c.putImageData(image, 0, 0);

  // Scattered decor: never on paths, solid tiles or right next to encounters.
  const decor = forest
    ? [
        ["decor-fern", 0.07],
        ["decor-shadeflower", 0.035],
        ["decor-mushrooms", 0.022],
        ["decor-moss", 0.04],
        ["decor-pebbles", 0.015],
      ]
    : [
        ["decor-flower", 0.06],
        ["decor-pebbles", 0.02],
      ];
  const source = (k: string) => scene.textures.get(k).getSourceImage() as HTMLCanvasElement;
  for (let ty = 1; ty < map.height - 1; ty++)
    for (let tx = 1; tx < map.width - 1; tx++) {
      const cx = tx * 16 + 8,
        cy = ty * 16 + 8;
      if (keepClear.some((p) => Math.hypot(p.x - cx, p.y - cy) < 40)) continue;
      const onPath = map.tiles[ty][tx] === 1;
      if (onPath) {
        if (hash2(tx, ty, seed + 9) < (forest ? 0.12 : 0.05))
          c.drawImage(source(forest ? "decor-leaves" : "decor-pebbles"), tx * 16, ty * 16);
        continue;
      }
      if (map.tiles[ty][tx] !== 0) continue;
      let roll = hash2(tx, ty, seed + 10);
      for (const [k, chance] of decor) {
        if (roll < (chance as number)) {
          const ox = Math.floor(hash2(tx, ty, seed + 11) * 7) - 3,
            oy = Math.floor(hash2(tx, ty, seed + 12) * 5) - 2;
          c.drawImage(source(k as string), tx * 16 + ox, ty * 16 + oy);
          break;
        }
        roll -= chance as number;
      }
    }
  texture.refresh();
  return key;
}
