import type { EnemyId } from "../domain/game";
import { hash2, noise2 } from "./noise";
export type Entity = {
  encounterId?: string;
  patrolSlot?: import("../domain/encounters").CommonSlot;
  kind:
    | "tree"
    | "house"
    | "stall"
    | "rock"
    | "fire"
    | "master"
    | "merchant"
    | "chest"
    | "bush"
    | "stump"
    | EnemyId;
  x: number;
  y: number;
  label?: string;
  /** Visual species for trees (0 oak, 1 pine, 2 dark oak); never affects collision. */
  variant?: number;
};
export type MapData = {
  width: number;
  height: number;
  tiles: number[][];
  solid: boolean[][];
  entities: Entity[];
};
export function makeMap(forest: boolean): MapData {
  const width = forest ? 40 : 24,
    height = forest ? 28 : 20,
    tiles = Array.from({ length: height }, () => Array(width).fill(0)),
    solid = Array.from({ length: height }, () => Array(width).fill(false)),
    entities: Entity[] = [];
  const path = (x: number, y: number, w: number, h: number) => {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++) tiles[j][i] = 1;
  };
  const block = (x: number, y: number, w: number, h: number) => {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++) solid[j][i] = true;
  };
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1)
        solid[y][x] = true;
  if (!forest) {
    path(11, 6, 3, 11);
    path(5, 11, 9, 3);
    path(12, 9, 12, 3);
    path(13, 13, 6, 2);
    entities.push(
      { kind: "house", x: 200, y: 112 },
      { kind: "stall", x: 88, y: 176 },
      { kind: "master", x: 200, y: 140, label: "Mestre da guilda" },
      { kind: "merchant", x: 104, y: 200, label: "Loja da vila" },
      { kind: "fire", x: 272, y: 224, label: "Descansar" },
      { kind: "rock", x: 296, y: 88 },
      { kind: "rock", x: 56, y: 280 },
    );
    block(9, 3, 7, 4);
    block(3, 8, 4, 3);
    block(16, 13, 2, 1);
    block(18, 5, 1, 1);
    block(3, 17, 1, 1);
    for (let y = 3; y < 7; y++)
      for (let x = 2; x < 6; x++) {
        tiles[y][x] = 2;
        solid[y][x] = true;
      }
    for (let y = 9; y < 12; y++) solid[y][23] = false;
  } else {
    path(0, 13, 21, 3);
    path(18, 7, 3, 15);
    path(19, 7, 15, 3);
    path(19, 20, 16, 3);
    path(32, 8, 3, 15);
    path(32, 11, 6, 4);
    entities.push(
      { kind: "sprout", x: 168, y: 232, label: "Broto Errante" },
      { kind: "beetle", x: 392, y: 136, label: "Besouro de Pedra" },
      { kind: "moth", x: 392, y: 344, label: "Mariposa da Névoa" },
      { kind: "guardian", x: 568, y: 200, label: "Guardião de Musgo" },
      { kind: "chest", x: 456, y: 152, label: "Baú antigo" },
      { kind: "rock", x: 264, y: 104 },
      { kind: "rock", x: 440, y: 296 },
    );
    block(16, 6, 1, 1);
    block(27, 18, 1, 1);
    for (let y = 13; y < 16; y++) solid[y][0] = false;
    for (let y = 2; y < 8; y++)
      for (let x = 3; x < 8; x++) {
        tiles[y][x] = 2;
        solid[y][x] = true;
      }
  }
  placeVegetation(forest, width, height, tiles, solid, entities, block);
  return { width, height, tiles, solid, entities };
}
/**
 * Organic, deterministic vegetation. Collision stays per tile (one solid tile per
 * plant); only the sprite position gets a small visual jitter. Trees thin out
 * near paths and are denser deep in the woods; every labelled point keeps a
 * clear radius so it remains reachable and patrol areas stay free.
 */
function placeVegetation(
  forest: boolean,
  width: number,
  height: number,
  tiles: number[][],
  solid: boolean[][],
  entities: Entity[],
  block: (x: number, y: number, w: number, h: number) => void,
) {
  const seed = forest ? 2603 : 1907;
  const pathTiles: Array<[number, number]> = [];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) if (tiles[y][x] === 1) pathTiles.push([x, y]);
  const pathDistance = (x: number, y: number) => {
    let best = Infinity;
    for (const [px, py] of pathTiles)
      best = Math.min(best, Math.max(Math.abs(px - x), Math.abs(py - y)));
    return best;
  };
  const anchors = entities.map((e) => ({ x: e.x, y: e.y }));
  const planted: Array<[number, number]> = [];
  const crowded = (x: number, y: number, spacing: number) =>
    planted.some(([px, py]) => Math.hypot(px - x, py - y) < spacing);
  const variant = (x: number, y: number) => {
    if (!forest) return hash2(x, y, seed + 5) < 0.18 ? 1 : 0;
    if (hash2(x, y, seed + 6) < 0.16) return 0;
    return noise2(x / 5, y / 5, seed + 9) > 0.48 ? 1 : 2;
  };
  const jitter = (x: number, y: number, salt: number, range: number) =>
    Math.floor(hash2(x, y, seed + salt) * (range * 2 + 1)) - range;
  const plantTree = (x: number, y: number, edge = false) => {
    entities.push({
      kind: "tree",
      variant: variant(x, y),
      x: x * 16 + 8 + jitter(x, y, 1, edge ? 2 : 3),
      y: y * 16 + 20 + jitter(x, y, 2, edge ? 1 : 2),
    });
    planted.push([x, y]);
  };
  for (let y = 1; y < height - 1; y++)
    for (let x = 1; x < width - 1; x++) {
      if (tiles[y][x] || solid[y][x]) continue;
      const cx = x * 16 + 8,
        cy = y * 16 + 8;
      if (anchors.some((a) => Math.hypot(a.x - cx, a.y - cy) < 50)) continue;
      const distance = pathDistance(x, y);
      const density = forest
        ? [0, 0.18, 0.4, 0.58][Math.min(distance, 3)]
        : [0, 0.08, 0.2, 0.34][Math.min(distance, 3)];
      const chance = density * (0.45 + noise2(x / 3.5, y / 3.5, seed));
      const roll = hash2(x, y, seed);
      if (roll < chance && !crowded(x, y, forest ? 2.1 : 1.9)) {
        plantTree(x, y);
        block(x, y, 1, 1);
      } else if (
        distance >= 1 &&
        hash2(x, y, seed + 3) < (forest ? 0.06 : 0.025) &&
        !crowded(x, y, 1.4)
      ) {
        entities.push({
          kind: forest && hash2(x, y, seed + 4) < 0.45 ? "stump" : "bush",
          x: cx + jitter(x, y, 7, 2),
          y: y * 16 + 14,
        });
        planted.push([x, y]);
        block(x, y, 1, 1);
      }
    }
  // Border rows frame the map; side edges skip the map exits.
  for (let x = 0; x < width; x += 2) {
    plantTree(x, -1, true);
    entities[entities.length - 1].y = 20 + jitter(x, 0, 11, 1);
    plantTree(x, height - 1, true);
    entities[entities.length - 1].y = height * 16 + 12 + jitter(x, 1, 12, 1);
  }
  for (let y = 2; y < height - 2; y += 2) {
    const exit = forest ? y >= 11 && y <= 16 : false;
    if (!exit) {
      plantTree(0, y, true);
      entities[entities.length - 1].x = 6 + jitter(0, y, 13, 2);
    }
    const villageExit = !forest && y >= 8 && y <= 12;
    if (!villageExit) {
      plantTree(width - 1, y, true);
      entities[entities.length - 1].x = width * 16 - 6 + jitter(1, y, 14, 2);
    }
  }
}

/**
 * Moves an actor by `distance` px along the (already normalised) direction.
 * Long steps are split into ≤4 px slices so fast movement never tunnels.
 * With single-axis input, a blocked actor slides around a corner when a free
 * lane is within `slideReach` px on exactly one side (ties do not slide).
 */
export function moveActor(
  map: MapData,
  x: number,
  y: number,
  dx: number,
  dy: number,
  distance: number,
  slideReach = 6,
) {
  if (distance <= 0 || (!dx && !dy)) return { x, y };
  const slices = Math.max(1, Math.ceil(distance / 4)),
    part = distance / slices;
  for (let i = 0; i < slices; i++) {
    const nx = x + dx * part,
      ny = y + dy * part;
    const movedX = Boolean(dx) && walkable(map, nx, y);
    if (movedX) x = nx;
    const movedY = Boolean(dy) && walkable(map, x, ny);
    if (movedY) y = ny;
    if (movedX || movedY) continue;
    if (dx && !dy) {
      const offset = laneOffset(slideReach, (k) =>
        walkable(map, x, y + k) && walkable(map, nx, y + k),
      );
      if (!offset) break;
      y += Math.sign(offset) * Math.min(part, Math.abs(offset));
    } else if (dy && !dx) {
      const offset = laneOffset(slideReach, (k) =>
        walkable(map, x + k, y) && walkable(map, x + k, ny),
      );
      if (!offset) break;
      x += Math.sign(offset) * Math.min(part, Math.abs(offset));
    } else break;
  }
  return { x, y };
}
function laneOffset(reach: number, free: (offset: number) => boolean) {
  for (let k = 1; k <= reach; k++) {
    const minus = free(-k),
      plus = free(k);
    if (minus !== plus) return minus ? -k : k;
    if (minus && plus) return 0;
  }
  return 0;
}
export function walkable(map: MapData, x: number, y: number) {
  return [
    [x - 4, y - 2],
    [x + 4, y - 2],
    [x - 4, y + 2],
    [x + 4, y + 2],
  ].every(
    ([px, py]) =>
      map.solid[Math.floor(py / 16)]?.[Math.floor(px / 16)] === false,
  );
}
