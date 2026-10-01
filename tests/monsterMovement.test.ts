import { describe, expect, it } from "vitest";
import { makeMap, walkable } from "../src/game/maps";
import {
  advancePatrol,
  assignedHome,
  commonMonsters,
  makePatrol,
} from "../src/game/monsterMovement";

describe("patrulha dos monstros comuns", () => {
  const map = makeMap(true);
  const anchors = commonMonsters.map((kind) => {
    const entity = map.entities.find((candidate) => candidate.kind === kind)!;
    return { x: entity.x, y: entity.y };
  });

  it("redistribui âncoras sem duplicar criaturas e repete após seis descansos", () => {
    for (let cycle = 0; cycle < 6; cycle++) {
      const homes = commonMonsters.map((kind) =>
        assignedHome(kind, cycle, anchors),
      );
      expect(new Set(homes.map((home) => `${home.x},${home.y}`)).size).toBe(3);
      expect(homes.every((home) => walkable(map, home.x, home.y))).toBe(true);
    }
    expect(assignedHome("sprout", 6, anchors)).toEqual(anchors[0]);
  });

  it("caminha, pausa e permanece em terreno livre na área de cada âncora", () => {
    const actors = commonMonsters.map((kind) =>
      makePatrol(kind, assignedHome(kind, 0, anchors), 0),
    );
    const positions = actors.map(() => new Set<string>());
    const phases = actors.map(() => new Set<string>());
    for (let frame = 0; frame < 60_000 / 35; frame++) {
      actors.forEach((actor, index) => {
        advancePatrol(
          actor,
          35,
          map,
          { x: 40, y: 232 },
          actors.filter((other) => other !== actor),
        );
        positions[index].add(`${actor.x.toFixed(1)},${actor.y.toFixed(1)}`);
        phases[index].add(actor.phase);
        expect(walkable(map, actor.x, actor.y)).toBe(true);
        expect(
          Math.hypot(actor.x - actor.home.x, actor.y - actor.home.y),
        ).toBeLessThanOrEqual(23);
      });
    }
    expect(positions.every((seen) => seen.size > 20)).toBe(true);
    expect(phases.every((seen) => seen.has("walk") && seen.has("idle"))).toBe(
      true,
    );
  });
});
