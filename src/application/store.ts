import { z } from "zod";
import {
  freshEncounters,
  encounterDefeated,
  rareId,
} from "../domain/encounters";
import {
  freshSave,
  stats,
  clampResources,
  items,
  isSlotUnlocked,
  enemies,
  type Save,
} from "../domain/game";
import {
  workoutSchema,
  pending,
  fingerprint,
  attributes,
  type Workout,
} from "../domain/workouts";
import {
  aiWorkoutSchema,
  balanceAiWorkout,
  fingerprintAiWorkout,
  trainingRewardRecordSchema,
  recordDate,
  baseRewardOf,
  prBonusOf,
  SAVED_TRAINING_CAPS,
  type AiWorkout,
  type AppliedWorkoutReward,
} from "../domain/aiWorkouts";
import {
  compactWorkoutSchema,
  trainingDraftSchema,
  compactTrainingRewardRecordSchema,
  balanceCompactWorkout,
  type CompactWorkout,
  type CompactPreview,
} from "../domain/compactWorkouts";
const int = z.number().int().nonnegative().max(100000000);
const vector = z.object({
  strength: int,
  vigor: int,
  agility: int,
  breath: int,
});
const devConfig = z.object({
  attributeBonus: z.object({
    strength: z.number().int().min(0).max(30),
    vigor: z.number().int().min(0).max(30),
    agility: z.number().int().min(0).max(30),
    breath: z.number().int().min(0).max(30),
  }),
  xpMultiplier: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(5),
    z.literal(10),
  ]),
});
const item = z.enum([
  "blade",
  "iron",
  "dagger",
  "hammer",
  "moss",
  "wind",
  "wood_shield",
  "iron_shield",
  "leather_armor",
  "chainmail",
  "copper_ring",
  "breeze_ring",
  "walking_boots",
  "wind_boots",
]);
const enemy = z.enum(["sprout", "beetle", "moth", "guardian"]);
const schema = z.object({
  saveVersion: z.literal(1),
  rulesVersion: z.literal(1),
  workouts: z
    .array(
      z.object({
        id: z.string().uuid(),
        externalSessionId: z.string().max(200).optional(),
        workout: workoutSchema,
      }),
    )
    .max(5000),
  trainingRewards: z
    .array(
      z.union([trainingRewardRecordSchema, compactTrainingRewardRecordSchema]),
    )
    .max(5000)
    .default([]),
  pendingTraining: trainingDraftSchema.nullable().default(null),
  adventureXpTotal: int,
  allocated: vector,
  gold: int,
  materials: int,
  potions: int,
  owned: z.array(item).min(1).max(14),
  weapon: item,
  shield: item.nullable().default(null),
  armor: item.nullable().default(null),
  accessory: item.nullable(),
  ring: item.nullable().default(null),
  boots: item.nullable().default(null),
  hp: int,
  stamina: int,
  map: z.enum(["village", "forest"]),
  x: z.number().finite().min(8).max(632),
  y: z.number().finite().min(8).max(440),
  defeated: z.array(enemy).max(4),
  monsterRestCycle: z.number().int().min(0).max(5).default(0),
  rareEncounter: z
    .object({
      seed: z.number().int().min(0).max(0xffffffff),
      cycle: int,
      slot: z.enum(["sprout", "beetle", "moth"]).nullable(),
      defeated: z.boolean(),
    })
    .default(freshEncounters),
  quest: z.enum(["not_started", "active", "emblem_recovered", "completed"]),
  guild: z.boolean(),
  chest: z.boolean(),
  battle: z
    .object({
      enemy,
      encounterId: z
        .string()
        .regex(/^rare:\d{1,9}$/)
        .optional(),
      hp: int,
      round: int.min(1),
      guard: z.boolean(),
      status: z.enum(["awaiting_player", "victory", "defeat", "fled"]),
      log: z.array(z.string().max(500)).max(20),
    })
    .nullable(),
  muted: z.boolean(),
  kills: int.default(0),
  appearance: z.enum(["masculine", "feminine"]).default("masculine"),
  cameraZoom: z.enum(["far", "auto", "near"]).default("auto"),
  motion: z.enum(["system", "full", "reduced"]).default("system"),
  dev: devConfig.optional(),
});
export function validateSave(
  raw: unknown,
  mode: "normal" | "dev" = "normal",
): Save {
  if (raw && typeof raw === "object" && "mode" in raw && raw.mode === "dev")
    throw Error("Backup de teste DEV não pode substituir a aventura normal.");
  const r = schema.safeParse(raw);
  if (!r.success)
    throw Error(
      "Backup inválido ou versão incompatível. O progresso atual foi preservado.",
    );
  const s = r.data as Save;
  if (
    (s.rareEncounter.slot && !s.defeated.includes("guardian")) ||
    (s.rareEncounter.defeated && !s.rareEncounter.slot) ||
    (s.battle?.encounterId &&
      (s.battle.enemy !== "guardian" ||
        ((s.battle.status === "awaiting_player" ||
          s.battle.status === "victory") &&
          (s.battle.encounterId !== rareId(s) || !s.rareEncounter.slot))))
  )
    throw Error("Estado de encontro raro inconsistente.");
  if (mode === "normal" && s.dev)
    throw Error("Backup de teste DEV não pode substituir a aventura normal.");
  if (mode === "dev" && !s.dev)
    throw Error(
      "Save de teste DEV inválido. A aventura normal foi preservada.",
    );
  if (
    stats(s).free < 0 ||
    !s.owned.includes(s.weapon) ||
    items[s.weapon].slot !== "weapon" ||
    (s.accessory &&
      (!s.owned.includes(s.accessory) ||
        items[s.accessory].slot !== "accessory")) ||
    (s.shield &&
      (!s.owned.includes(s.shield) || items[s.shield].slot !== "shield")) ||
    (s.armor &&
      (!s.owned.includes(s.armor) || items[s.armor].slot !== "armor")) ||
    (s.ring &&
      (!s.owned.includes(s.ring) ||
        items[s.ring].slot !== "ring" ||
        !isSlotUnlocked(s, "ring"))) ||
    (s.boots &&
      (!s.owned.includes(s.boots) ||
        items[s.boots].slot !== "boots" ||
        !isSlotUnlocked(s, "boots"))) ||
    new Set(s.owned).size !== s.owned.length ||
    s.hp > stats(s).maxHp ||
    s.stamina > stats(s).maxStamina ||
    s.workouts.some((r) => pending(r.workout).length) ||
    new Set(s.workouts.map((r) => r.id)).size !== s.workouts.length ||
    new Set(s.workouts.map((r) => fingerprint(r.workout))).size !==
      s.workouts.length
  )
    throw Error("Backup contém dados inconsistentes.");
  if (
    new Set(s.trainingRewards.map((r) => r.externalSessionId)).size !==
      s.trainingRewards.length ||
    new Set(s.trainingRewards.map((r) => r.fingerprint)).size !==
      s.trainingRewards.length
  )
    throw Error("Backup contém treinos de IA duplicados.");
  for (const record of s.trainingRewards) {
    if (!("format" in record)) continue;
    const base = record.baseReward,
      bonus = record.prBonus;
    if (
      record.externalSessionId !== record.compact.id ||
      record.fingerprint !== `compact:${record.compact.id}` ||
      record.reward.xp !== base.xp + bonus.xp ||
      record.reward.gold !== base.gold ||
      bonus.xp !== bonus.count * 5 ||
      Math.abs(
        attributes.reduce((n, k) => n + bonus.attributes[k], 0) -
          bonus.count * 0.02,
      ) > 0.001 ||
      attributes.some(
        (k) =>
          Math.abs(
            bonus.attributes[k] * 50 - Math.round(bonus.attributes[k] * 50),
          ) > 0.001,
      ) ||
      bonus.attributes.strength > record.compact.pr.forca * 0.02 + 0.001 ||
      bonus.attributes.vigor > record.compact.pr.vigor * 0.02 + 0.001 ||
      bonus.attributes.agility > record.compact.pr.agilidade * 0.02 + 0.001 ||
      bonus.attributes.breath > record.compact.pr.folego * 0.02 + 0.001 ||
      attributes.some(
        (k) =>
          Math.abs(
            record.reward.attributes[k] -
              base.attributes[k] -
              bonus.attributes[k],
          ) > 0.001,
      ) ||
      attributes.reduce((n, k) => n + bonus.attributes[k], 0) > 0.061 ||
      (record.compact.c === "baixa" && bonus.count > 0)
    )
      throw Error("Backup contém recompensa compacta inconsistente.");
  }
  if (
    s.pendingTraining &&
    s.trainingRewards.some((r) => r.externalSessionId === s.pendingTraining?.id)
  )
    throw Error("Backup contém rascunho já aplicado.");
  for (const date of new Set(s.trainingRewards.map(recordDate))) {
    const records = s.trainingRewards.filter((r) => recordDate(r) === date);
    const xp = records.reduce((n, r) => n + baseRewardOf(r).xp, 0);
    const gold = records.reduce((n, r) => n + r.reward.gold, 0);
    const attribute = records.reduce(
      (n, r) =>
        n +
        attributes.reduce(
          (sum, key) => sum + baseRewardOf(r).attributes[key],
          0,
        ),
      0,
    );
    if (
      xp > SAVED_TRAINING_CAPS.xp ||
      gold > SAVED_TRAINING_CAPS.gold ||
      attribute > SAVED_TRAINING_CAPS.attribute + 0.001 ||
      records.reduce((n, r) => n + prBonusOf(r).count, 0) > 3 ||
      records.reduce((n, r) => n + prBonusOf(r).xp, 0) > 15
    )
      throw Error("Backup excede os limites diários de treino.");
  }
  if (
    s.battle &&
    ((s.battle.status === "awaiting_player" &&
      (s.battle.hp === 0 || s.hp === 0)) ||
      (s.battle.status === "victory" &&
        (s.battle.hp !== 0 ||
          !encounterDefeated(s, s.battle.enemy, s.battle.encounterId))))
  )
    throw Error("Estado de combate inválido.");
  if (s.map === "village" && (s.x > 380 || s.y > 318))
    throw Error("Posição fora do mapa.");
  if (new Set(s.defeated).size !== s.defeated.length)
    throw Error("Recompensas duplicadas no backup.");
  if (
    s.battle &&
    (s.battle.hp > enemies[s.battle.enemy].hp ||
      (s.battle.status === "awaiting_player" &&
        encounterDefeated(s, s.battle.enemy, s.battle.encounterId)))
  )
    throw Error("Estado de encontro inconsistente.");
  return s;
}
export const SAVE_KEY = "fizzi-quest.save.v1";
export const DEV_SAVE_KEY = "fizzi-quest.dev.save.v1";
export interface StoragePort {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}
export class Store {
  state: Save;
  hasSave = false;
  error = "";
  listeners = new Set<() => void>();
  constructor(
    private storage: StoragePort,
    private key = SAVE_KEY,
    readonly devMode = false,
  ) {
    this.state = this.initialSave();
    try {
      const raw = storage.getItem(this.key);
      if (raw) {
        this.state = validateSave(JSON.parse(raw), this.mode);
        this.hasSave = true;
      }
    } catch {
      try {
        const previous = storage.getItem(this.key + ".previous");
        if (previous) {
          this.state = validateSave(JSON.parse(previous), this.mode);
          this.hasSave = true;
          this.error = "Recuperamos a cópia anterior do progresso.";
        } else
          this.error =
            "Não foi possível ler o save. Exporte os dados existentes antes de substituir.";
      } catch {
        this.error = "Save ilegível. Importe um backup válido para recuperar.";
      }
    }
  }
  private get mode(): "normal" | "dev" {
    return this.devMode ? "dev" : "normal";
  }
  private initialSave(): Save {
    const save = freshSave();
    if (this.devMode)
      save.dev = {
        attributeBonus: { strength: 0, vigor: 0, agility: 0, breath: 0 },
        xpMultiplier: 1,
      };
    return save;
  }
  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  emit() {
    this.listeners.forEach((fn) => fn());
  }
  persist() {
    const oldError = this.error;
    try {
      const previous = this.storage.getItem(this.key);
      if (previous) {
        try {
          validateSave(JSON.parse(previous), this.mode);
          this.storage.setItem(this.key + ".previous", previous);
        } catch {
          /* Keep last valid recovery snapshot. */
        }
      }
      this.storage.setItem(this.key, JSON.stringify(this.state));
      this.hasSave = true;
      this.error = "";
    } catch {
      this.error =
        "Não foi possível salvar no aparelho. Exporte um backup antes de sair.";
    }
    if (this.error !== oldError) this.emit();
  }
  transact(fn: (s: Save) => void) {
    const next = structuredClone(this.state);
    fn(next);
    clampResources(next);
    this.state = next;
    this.persist();
    this.emit();
  }
  transactDev(fn: (s: Save) => void) {
    if (!this.devMode) throw Error("Modo DEV inativo.");
    const previous = this.state;
    const next = structuredClone(previous);
    fn(next);
    clampResources(next);
    this.state = validateSave(next, "dev");
    this.persist();
    if (this.error) {
      this.state = previous;
      this.emit();
      throw Error(this.error);
    }
    this.emit();
    return previous;
  }
  restore(text: string) {
    if (new TextEncoder().encode(text).length > 8 * 1024 * 1024)
      throw Error("Backup maior que 8 MB.");
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      throw Error("Backup não é um JSON válido.");
    }
    const next = validateSave(raw, this.mode);
    this.state = next;
    this.persist();
    this.emit();
  }
  reset() {
    this.state = this.initialSave();
    this.persist();
    this.emit();
  }
  export() {
    return JSON.stringify(this.state, null, 2);
  }
  record(w: Workout, id?: string, partialAcknowledged = false) {
    if (this.state.battle) throw Error("Termine o encontro antes de importar.");
    const normalized = workoutSchema.parse(w);
    if (pending(normalized).length) throw Error(pending(normalized).join(" "));
    if (normalized.partial && !partialAcknowledged)
      throw Error("Confirme que somente o trecho visível será contabilizado.");
    const duplicate = this.state.workouts.find(
      (r) =>
        r.id !== id &&
        (fingerprint(r.workout) === fingerprint(normalized) ||
          (normalized.sessionId &&
            r.externalSessionId === normalized.sessionId)),
    );
    if (duplicate)
      throw Error(
        "Esse treino já está no histórico. Abra o registro existente.",
      );
    this.transact((s) => {
      if (id) {
        const found = s.workouts.find((r) => r.id === id);
        if (!found) throw Error("Registro não encontrado.");
        found.workout = normalized;
        found.externalSessionId = normalized.sessionId;
      } else
        s.workouts.push({
          id: crypto.randomUUID(),
          externalSessionId: normalized.sessionId,
          workout: normalized,
        });
    });
  }
  previewAiWorkout(input: AiWorkout): AppliedWorkoutReward {
    const normalized = aiWorkoutSchema.parse(input);
    return balanceAiWorkout(normalized, this.state.trainingRewards);
  }
  createTrainingDraft(date: string) {
    const validDate = trainingDraftSchema.shape.date.parse(date);
    if (this.state.battle)
      throw Error("Termine o encontro antes de preparar o treino.");
    const previous = this.state;
    this.transact((s) => {
      s.pendingTraining = {
        id: crypto.randomUUID(),
        date: validDate,
        rules: 2,
      };
    });
    if (this.error) {
      this.state = previous;
      this.emit();
      throw Error(this.error);
    }
    return this.state.pendingTraining!;
  }
  previewCompactWorkout(input: CompactWorkout): CompactPreview {
    const normalized = compactWorkoutSchema.parse(input);
    if (!this.state.pendingTraining)
      throw Error(
        "Rascunho não encontrado. Prepare e copie o modelo antes de importar.",
      );
    return balanceCompactWorkout(
      normalized,
      this.state.pendingTraining,
      this.state.trainingRewards,
    );
  }
  recordCompactWorkout(input: CompactWorkout): CompactPreview {
    if (this.state.battle) throw Error("Termine o encontro antes de importar.");
    const normalized = compactWorkoutSchema.parse(input);
    const preview = this.previewCompactWorkout(normalized);
    const previous = this.state;
    this.transact((s) => {
      const draft = s.pendingTraining!;
      s.adventureXpTotal += preview.reward.xp;
      s.gold += preview.reward.gold;
      s.trainingRewards.push({
        format: 2,
        id: crypto.randomUUID(),
        externalSessionId: normalized.id,
        fingerprint: `compact:${normalized.id}`,
        date: draft.date,
        compact: normalized,
        baseReward: preview.baseReward,
        prBonus: preview.prBonus,
        reward: preview.reward,
      });
      s.pendingTraining = null;
    });
    if (this.error) {
      this.state = previous;
      this.emit();
      throw Error(this.error);
    }
    return preview;
  }
  recordAiWorkout(input: AiWorkout): AppliedWorkoutReward {
    if (this.state.battle) throw Error("Termine o encontro antes de importar.");
    const normalized = aiWorkoutSchema.parse(input);
    const fingerprint = fingerprintAiWorkout(normalized);
    if (
      this.state.trainingRewards.some(
        (record) =>
          record.externalSessionId === normalized.id ||
          record.fingerprint === fingerprint,
      )
    )
      throw Error("Esse treino já está no histórico.");
    const reward = this.previewAiWorkout(normalized);
    this.transact((s) => {
      s.adventureXpTotal += reward.xp;
      s.gold += reward.gold;
      s.trainingRewards.push({
        id: crypto.randomUUID(),
        externalSessionId: normalized.id,
        fingerprint,
        workout: normalized,
        reward,
      });
    });
    return reward;
  }
  remove(id: string) {
    if (this.state.battle) throw Error("Termine o encontro.");
    this.transact((s) => {
      s.workouts = s.workouts.filter((r) => r.id !== id);
    });
  }
}
