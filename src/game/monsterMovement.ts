import type { EnemyId } from "../domain/game";
import { walkable, type MapData } from "./maps";

export const commonMonsters = ["sprout", "beetle", "moth"] as const;
export type CommonMonster = (typeof commonMonsters)[number];
export type Point = { x: number; y: number };
export type Patrol = Point & {
  kind: CommonMonster;
  home: Point;
  target: Point;
  phase: "idle" | "walk";
  remainingMs: number;
  seed: number;
};

// Each rest advances to a distinct, reversible assignment of the three anchors.
const assignments = [
  [0, 1, 2],
  [1, 0, 2],
  [1, 2, 0],
  [2, 1, 0],
  [2, 0, 1],
  [0, 2, 1],
] as const;

export function assignedHome(
  kind: CommonMonster,
  restCycle: number,
  anchors: readonly Point[],
): Point {
  const index = commonMonsters.indexOf(kind);
  return anchors[assignments[restCycle % assignments.length][index]];
}

function next(actor: Patrol) {
  let value = actor.seed;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  actor.seed = value >>> 0 || 1;
  return actor.seed / 0x1_0000_0000;
}

function idleFor(actor: Patrol) {
  actor.phase = "idle";
  actor.remainingMs = 1000 + Math.floor(next(actor) * 2600);
}

export function makePatrol(
  kind: CommonMonster,
  home: Point,
  restCycle: number,
): Patrol {
  const index = commonMonsters.indexOf(kind);
  const actor: Patrol = {
    kind,
    x: home.x,
    y: home.y,
    home,
    target: home,
    phase: "idle",
    remainingMs: 0,
    seed: (0x9e3779b9 ^ ((index + 1) * 0x85ebca6b) ^ restCycle) >>> 0,
  };
  idleFor(actor);
  return actor;
}

function free(
  point: Point,
  map: MapData,
  player: Point,
  others: readonly Point[],
) {
  return (
    walkable(map, point.x, point.y) &&
    Math.hypot(point.x - player.x, point.y - player.y) >= 20 &&
    others.every(
      (other) => Math.hypot(point.x - other.x, point.y - other.y) >= 18,
    )
  );
}

export function advancePatrol(
  actor: Patrol,
  deltaMs: number,
  map: MapData,
  player: Point,
  others: readonly Point[],
) {
  const delta = Math.max(0, Math.min(deltaMs, 35));
  if (actor.phase === "idle") {
    actor.remainingMs -= delta;
    if (actor.remainingMs > 0) return;
    for (let attempt = 0; attempt < 12; attempt++) {
      const angle = next(actor) * Math.PI * 2;
      const radius = 6 + next(actor) * 16;
      const target = {
        x: actor.home.x + Math.cos(angle) * radius,
        y: actor.home.y + Math.sin(angle) * radius,
      };
      if (!free(target, map, player, others)) continue;
      actor.target = target;
      actor.phase = "walk";
      return;
    }
    idleFor(actor);
    return;
  }
  const dx = actor.target.x - actor.x;
  const dy = actor.target.y - actor.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 0.5) {
    idleFor(actor);
    return;
  }
  const step = Math.min(
    distance,
    ((actor.kind === "moth" ? 16 : 12) * delta) / 1000,
  );
  const candidate = {
    x: actor.x + (dx / distance) * step,
    y: actor.y + (dy / distance) * step,
  };
  if (
    Math.hypot(candidate.x - actor.home.x, candidate.y - actor.home.y) > 23 ||
    !free(candidate, map, player, others)
  ) {
    idleFor(actor);
    return;
  }
  actor.x = candidate.x;
  actor.y = candidate.y;
  if (step === distance) idleFor(actor);
}

export function isCommonMonster(kind: EnemyId): kind is CommonMonster {
  return (commonMonsters as readonly string[]).includes(kind);
}
