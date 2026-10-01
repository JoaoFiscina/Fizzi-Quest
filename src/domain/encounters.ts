import type { EnemyId, Save } from "./game";

export const commonSlots = ["sprout", "beetle", "moth"] as const;
export type CommonSlot = (typeof commonSlots)[number];
export const RARE_CHANCE = 0.1;
export type RareEncounter = {
  seed: number;
  cycle: number;
  slot: CommonSlot | null;
  defeated: boolean;
};
export function freshEncounters(): RareEncounter {
  return { seed: 0x9e3779b9, cycle: 0, slot: null, defeated: false };
}
export function rareId(s: Save) {
  return `rare:${s.rareEncounter.cycle}`;
}
export function nextDistribution(s: Save) {
  const r = s.rareEncounter;
  r.cycle = (r.cycle + 1) % 100000001;
  r.seed = (Math.imul(r.seed, 1664525) + 1013904223) >>> 0;
  r.defeated = false;
  r.slot =
    s.defeated.includes("guardian") && r.seed / 0x100000000 < RARE_CHANCE
      ? commonSlots[(r.seed >>> 8) % commonSlots.length]
      : null;
}
export function encounterDefeated(s: Save, type: EnemyId, id?: string) {
  return id?.startsWith("rare:")
    ? id !== rareId(s) || !s.rareEncounter.slot || s.rareEncounter.defeated
    : s.defeated.includes(type) || s.rareEncounter.slot === type;
}
export function encounterName(type: EnemyId, name: string, id?: string) {
  return type === "guardian" && id?.startsWith("rare:")
    ? "Guardião errante"
    : name;
}
