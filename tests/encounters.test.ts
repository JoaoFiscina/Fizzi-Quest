import { describe, expect, it } from "vitest";
import { act, freshSave, rest, startBattle, stats } from "../src/domain/game";
import { encounterDefeated, rareId } from "../src/domain/encounters";
import { validateSave } from "../src/application/store";

function eligible() {
  const s = freshSave();
  s.defeated = ["guardian"];
  s.quest = "completed";
  s.rareEncounter.seed = 1972;
  rest(s);
  return s;
}
describe("encontros raros", () => {
  it("sorteia somente após vitória original e conserva distribuição no backup", () => {
    const locked = freshSave();
    locked.rareEncounter.seed = 1972;
    rest(locked);
    expect(locked.rareEncounter.slot).toBeNull();
    const s = eligible();
    expect(s.rareEncounter.slot).not.toBeNull();
    expect(validateSave(JSON.parse(JSON.stringify(s)))).toEqual(s);
    expect(encounterDefeated(s, s.rareEncounter.slot!)).toBe(true);
    expect(encounterDefeated(s, "guardian", rareId(s))).toBe(false);
    rest(s);
    expect(s.rareEncounter.slot).toBeNull();
    expect(s.defeated).toEqual(["guardian"]);
  });
  it("migra save e batalha v21 sem alterar o progresso ou gerar raro", () => {
    const s = freshSave();
    startBattle(s, "guardian");
    const old = JSON.parse(JSON.stringify(s));
    delete old.rareEncounter;
    const loaded = validateSave(old);
    expect(loaded.battle).toEqual(s.battle);
    expect(loaded.rareEncounter.slot).toBeNull();
  });
  it("vitória rara paga uma vez e preserva missão e derrota do original", () => {
    const s = eligible();
    s.quest = "active";
    startBattle(s, "guardian", rareId(s));
    s.battle!.hp = 1;
    act(s, "attack");
    expect(s.rareEncounter.defeated).toBe(true);
    expect(s.quest).toBe("active");
    expect([s.adventureXpTotal, s.gold, s.materials]).toEqual([60, 25, 3]);
    act(s, "attack");
    expect([s.adventureXpTotal, s.gold, s.materials]).toEqual([60, 25, 3]);
    expect(validateSave(s).battle?.status).toBe("victory");
    s.battle = null;
    startBattle(s, "guardian", rareId(s));
    expect(s.battle).toBeNull();
  });
  it("fuga mantém aparição; derrota avança descanso sem premiar", () => {
    const s = eligible();
    startBattle(s, "guardian", rareId(s));
    act(s, "flee");
    expect(s.rareEncounter.defeated).toBe(false);
    s.battle = null;
    startBattle(s, "guardian", rareId(s));
    s.hp = 1;
    act(s, "attack");
    expect(s.battle?.status).toBe("defeat");
    expect(s.rareEncounter.cycle).toBe(2);
    expect(s.gold).toBe(0);
    expect(validateSave(s).map).toBe("village");
  });
  it("rejeita identidade incoerente e conserva recompensas originais e DEV", () => {
    const invalid = eligible();
    startBattle(invalid, "guardian", "rare:999");
    expect(invalid.battle).toBeNull();
    startBattle(invalid, "guardian", rareId(invalid));
    invalid.battle!.encounterId = "rare:999";
    expect(() => validateSave(invalid)).toThrow();
    const s = freshSave();
    startBattle(s, "guardian");
    s.battle!.hp = 1;
    act(s, "attack");
    expect(s.quest).toBe("emblem_recovered");
    expect(s.defeated).toContain("guardian");
    const dev = eligible();
    dev.dev = {
      attributeBonus: { strength: 0, vigor: 0, agility: 0, breath: 0 },
      xpMultiplier: 5,
    };
    startBattle(dev, "guardian", rareId(dev));
    dev.battle!.hp = 1;
    act(dev, "attack");
    expect(dev.adventureXpTotal).toBe(300);
    expect(validateSave(dev, "dev").gold).toBe(25);
  });
  it("piloto de 1000 descansos em níveis 5/10/20, com e sem DEV", () => {
    for (const xp of [350, 1350, 5225])
      for (const multiplier of [1, 5] as const) {
        const s = freshSave();
        s.adventureXpTotal = xp;
        s.defeated = ["guardian"];
        let count = 0;
        for (let i = 0; i < 1000; i++) {
          rest(s);
          if (s.rareEncounter.slot) count++;
        }
        expect(count).toBeGreaterThan(70);
        expect(count).toBeLessThan(130);
        expect(s.gold).toBe(0); // resting alone never grants loot
        expect(stats(s).level).toBe([5, 10, 20][[350, 1350, 5225].indexOf(xp)]);
        expect((count * 60 * multiplier) / 1000).toBeLessThan(40);
      }
  });
});
