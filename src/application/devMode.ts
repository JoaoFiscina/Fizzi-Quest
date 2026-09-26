import { clampResources, level, stats, type Save } from "../domain/game";
import { attributes, zero, type Vector } from "../domain/workouts";
import { validateSave } from "./store";

export const DEV_CODE = "DEV23";
export const DEV_SESSION_KEY = "fizzi-quest.dev.active";
export const DEV_LIMIT = 1_000_000;
export type DevMultiplier = 1 | 2 | 5 | 10;

export type DevEdit = {
  xpTotal: number;
  addXp: number;
  goldTotal: number;
  addGold: number;
  attributeBonus: Vector;
  xpMultiplier: DevMultiplier;
  resetAllocated: boolean;
};

export function createDevCopy(source: Save): Save {
  const next = structuredClone(source);
  delete next.dev;
  next.dev = { attributeBonus: zero(), xpMultiplier: 1 };
  return validateSave(next, "dev");
}

export function xpForLevel(target: number) {
  if (!Number.isInteger(target) || target < 1 || target > 100)
    throw Error("Nível de teste inválido.");
  let xp = 0;
  for (let current = 1; current < target; current++)
    xp += 50 + 25 * (current - 1);
  if (level(xp).level !== target) throw Error("Falha ao calcular o nível.");
  return xp;
}

function boundedInteger(value: number, name: string, maximum: number) {
  if (!Number.isInteger(value) || value < 0 || value > maximum)
    throw Error(`${name}: informe um inteiro entre 0 e ${maximum}.`);
  return value;
}

export function previewDevEdit(source: Save, edit: DevEdit): Save {
  if (!source.dev) throw Error("Modo DEV inativo.");
  if (source.battle)
    throw Error("Finalize o encontro antes de editar valores.");
  const next = structuredClone(source);
  const xpTotal = boundedInteger(edit.xpTotal, "XP total", DEV_LIMIT);
  const addXp = boundedInteger(edit.addXp, "Adicionar XP", DEV_LIMIT);
  const goldTotal = boundedInteger(edit.goldTotal, "Ouro total", DEV_LIMIT);
  const addGold = boundedInteger(edit.addGold, "Adicionar ouro", DEV_LIMIT);
  next.adventureXpTotal = boundedInteger(
    xpTotal + addXp,
    "XP resultante",
    DEV_LIMIT,
  );
  next.gold = boundedInteger(goldTotal + addGold, "Ouro resultante", DEV_LIMIT);
  if (![1, 2, 5, 10].includes(edit.xpMultiplier))
    throw Error("Multiplicador de XP inválido.");
  next.dev!.xpMultiplier = edit.xpMultiplier;
  for (const attribute of attributes)
    next.dev!.attributeBonus[attribute] = boundedInteger(
      edit.attributeBonus[attribute],
      `Bônus de ${attribute}`,
      30,
    );
  if (edit.resetAllocated) next.allocated = zero();
  if (stats(next).free < 0)
    throw Error(
      "Este XP deixaria mais pontos distribuídos do que o nível permite. Marque ‘Zerar pontos distribuídos na cópia de teste’.",
    );
  clampResources(next);
  return validateSave(next, "dev");
}
