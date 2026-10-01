import { describe, expect, it } from "vitest";
import { movementSpeed } from "../src/domain/movement";
import { freshSave, stats, trailImpulse } from "../src/domain/game";
import { releaseNotes } from "../src/content/releaseNotes";
import { GAME_VERSION } from "../src/version";
import { readFileSync } from "node:fs";

describe("Passo Ágil", () => {
  it("preserva ganho inicial, eleva teto base e aplica impulso depois do limite", () => {
    expect(movementSpeed(5)).toBe(62);
    expect(movementSpeed(20)).toBe(80);
    expect(movementSpeed(50)).toBe(100);
    expect(movementSpeed(50, 0.2)).toBe(120);
    expect(movementSpeed(50, 0.4)).toBe(140);
    expect(movementSpeed(-10)).toBe(56);
  });
  it("pilota níveis 1/10/20 com Botas, pontos e Impulso", () => {
    for (const [xp, level] of [
      [0, 1],
      [1350, 10],
      [5225, 20],
    ]) {
      const s = freshSave();
      s.adventureXpTotal = xp;
      s.allocated.agility = level - 1;
      const before = movementSpeed(stats(s).speed);
      if (level >= 5) {
        s.owned.push("wind_boots");
        s.boots = "wind_boots";
      }
      const after = movementSpeed(stats(s).speed);
      expect(stats(s).level).toBe(level);
      expect(after).toBeGreaterThanOrEqual(before);
      expect(after).toBeLessThanOrEqual(100);
      const impulse = trailImpulse(level);
      expect(movementSpeed(stats(s).speed, impulse?.bonus)).toBeCloseTo(
        after * (1 + (impulse?.bonus ?? 0)),
      );
      if (level === 20)
        expect(movementSpeed(stats(s).speed, impulse!.bonus)).toBeGreaterThan(
          100,
        );
    }
  });
});
it("diário tem a entrega instalada, IDs únicos e todas as versões documentadas", () => {
  const history = readFileSync("context/HISTORICO_VERSOES.md", "utf8");
  const documented = [...history.matchAll(/^## (v23\.09\.2003\.\d+)/gm)].map(
    (m) => m[1],
  );
  expect(releaseNotes[0].version).toBe(GAME_VERSION);
  expect(new Set(releaseNotes.map((n) => n.version)).size).toBe(
    releaseNotes.length,
  );
  expect(releaseNotes.map((n) => n.version)).toEqual(documented);
});
