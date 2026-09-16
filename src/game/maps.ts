import type { EnemyId } from "../domain/game";
export type Entity = {
  kind:
    | "tree"
    | "house"
    | "stall"
    | "rock"
    | "fire"
    | "master"
    | "merchant"
    | "chest"
    | EnemyId;
  x: number;
  y: number;
  label?: string;
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
  for (let y = 1; y < height - 1; y += 2)
    for (let x = 1; x < width - 1; x += 2) {
      if (
        tiles[y][x] ||
        solid[y][x] ||
        entities.some((e) => Math.hypot(e.x - x * 16, e.y - y * 16) < 48)
      )
        continue;
      if ((x * 17 + y * 13) % 11 < (forest ? 9 : 5)) {
        entities.push({ kind: "tree", x: x * 16 + 8, y: y * 16 + 20 });
        block(x, y, 1, 1);
      }
    }
  for (let x = 0; x < width; x += 2) {
    entities.push(
      { kind: "tree", x: x * 16 + 8, y: 20 },
      { kind: "tree", x: x * 16 + 8, y: height * 16 + 12 },
    );
  }
  return { width, height, tiles, solid, entities };
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
