import { describe, expect, it } from "vitest";
import { makeMap, moveActor, walkable, type MapData } from "../src/game/maps";
import { Store, SAVE_KEY } from "../src/application/store";

const open = (w = 12, h = 12): MapData => ({
  width: w,
  height: h,
  tiles: Array.from({ length: h }, () => Array(w).fill(0)),
  solid: Array.from({ length: h }, (_, y) =>
    Array.from(
      { length: w },
      (_, x) => x === 0 || y === 0 || x === w - 1 || y === h - 1,
    ),
  ),
  entities: [],
});

describe("moveActor", () => {
  it("anda livremente e divide passos longos sem atravessar paredes", () => {
    const map = open();
    const free = moveActor(map, 40, 40, 1, 0, 10);
    expect(free.x).toBeCloseTo(50);
    expect(free.y).toBe(40);
    map.solid[2][5] = true; // tile x 80–95, y 32–47
    const fast = moveActor(map, 40, 40, 1, 0, 100);
    expect(fast.x).toBeLessThan(80 - 4 + 1);
    expect(walkable(map, fast.x, fast.y)).toBe(true);
  });

  it("desliza na quina quando só um lado está livre", () => {
    const map = open();
    map.solid[3][5] = true; // bloco em y 48–63
    // Pé do herói (y+2 = 49) toca a fileira 3; a faixa livre fica 2 px acima.
    const start = { x: 70, y: 47 };
    expect(walkable(map, 76.5, start.y)).toBe(false);
    expect(walkable(map, 76.5, start.y - 2)).toBe(true);
    let p = start;
    for (let i = 0; i < 8; i++) p = moveActor(map, p.x, p.y, 1, 0, 2);
    expect(p.y).toBeLessThan(start.y);
    expect(p.x).toBeGreaterThan(start.x);
    expect(walkable(map, p.x, p.y)).toBe(true);
  });

  it("não desliza contra parede longa nem em empate", () => {
    const map = open();
    for (let y = 1; y < 11; y++) map.solid[y][5] = true;
    const p = moveActor(map, 70, 90, 1, 0, 20);
    expect(p.y).toBe(90);
    expect(p.x).toBeLessThan(76);
  });

  it("diagonal continua deslizando por eixo e o mapa real segue caminhável", () => {
    const forest = makeMap(true);
    const p = moveActor(forest, 40, 232, Math.SQRT1_2, Math.SQRT1_2, 12);
    expect(walkable(forest, p.x, p.y)).toBe(true);
    expect(p.x).toBeGreaterThan(40);
  });
});

describe("persistência leve", () => {
  const counting = () => {
    const data = new Map<string, string>();
    const writes: string[] = [];
    return {
      writes,
      data,
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => {
        writes.push(k);
        data.set(k, v);
      },
    };
  };

  it("não regrava nem troca a cópia anterior quando nada mudou", () => {
    const storage = counting();
    const store = new Store(storage);
    store.persist();
    store.state.x = 99;
    store.persist();
    const before = storage.data.get(SAVE_KEY + ".previous");
    const count = storage.writes.length;
    store.persist();
    store.persist();
    expect(storage.writes.length).toBe(count);
    expect(storage.data.get(SAVE_KEY + ".previous")).toBe(before);
    expect(JSON.parse(before!).x).not.toBe(99);
  });

  it("mantém a cópia anterior válida quando o save atual foi corrompido por fora", () => {
    const storage = counting();
    const store = new Store(storage);
    store.persist();
    const valid = storage.data.get(SAVE_KEY)!;
    store.state.x = 120;
    store.persist();
    expect(storage.data.get(SAVE_KEY + ".previous")).toBe(valid);
    storage.data.set(SAVE_KEY, "{corrompido");
    store.state.x = 121;
    store.persist();
    expect(storage.data.get(SAVE_KEY + ".previous")).toBe(valid);
    expect(JSON.parse(storage.data.get(SAVE_KEY)!).x).toBe(121);
  });
});
