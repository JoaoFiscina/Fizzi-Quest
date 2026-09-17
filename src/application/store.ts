import { z } from "zod";
import {
  freshSave,
  stats,
  clampResources,
  items,
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
  DAILY_TRAINING_CAPS,
  type AiWorkout,
  type AppliedWorkoutReward,
} from "../domain/aiWorkouts";
const int = z.number().int().nonnegative().max(100000000);
const vector = z.object({
  strength: int,
  vigor: int,
  agility: int,
  breath: int,
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
  trainingRewards: z.array(trainingRewardRecordSchema).max(5000).default([]),
  adventureXpTotal: int,
  allocated: vector,
  gold: int,
  materials: int,
  potions: int,
  owned: z.array(item).min(1).max(10),
  weapon: item,
  shield: item.nullable().default(null),
  armor: item.nullable().default(null),
  accessory: item.nullable(),
  hp: int,
  stamina: int,
  map: z.enum(["village", "forest"]),
  x: z.number().finite().min(8).max(632),
  y: z.number().finite().min(8).max(440),
  defeated: z.array(enemy).max(4),
  quest: z.enum(["not_started", "active", "emblem_recovered", "completed"]),
  guild: z.boolean(),
  chest: z.boolean(),
  battle: z
    .object({
      enemy,
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
});
export function validateSave(raw: unknown): Save {
  const r = schema.safeParse(raw);
  if (!r.success)
    throw Error(
      "Backup inválido ou versão incompatível. O progresso atual foi preservado.",
    );
  const s = r.data as Save;
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
  for (const date of new Set(s.trainingRewards.map((r) => r.workout.date))) {
    const records = s.trainingRewards.filter((r) => r.workout.date === date);
    const xp = records.reduce((n, r) => n + r.reward.xp, 0);
    const gold = records.reduce((n, r) => n + r.reward.gold, 0);
    const attribute = records.reduce(
      (n, r) =>
        n + attributes.reduce((sum, key) => sum + r.reward.attributes[key], 0),
      0,
    );
    if (
      xp > DAILY_TRAINING_CAPS.xp ||
      gold > DAILY_TRAINING_CAPS.gold ||
      attribute > DAILY_TRAINING_CAPS.attribute + 0.001
    )
      throw Error("Backup excede os limites diários de treino.");
  }
  if (
    s.battle &&
    ((s.battle.status === "awaiting_player" &&
      (s.battle.hp === 0 || s.hp === 0)) ||
      (s.battle.status === "victory" &&
        (s.battle.hp !== 0 || !s.defeated.includes(s.battle.enemy))))
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
        s.defeated.includes(s.battle.enemy)))
  )
    throw Error("Estado de encontro inconsistente.");
  return s;
}
export const SAVE_KEY = "fizzi-quest.save.v1";
export interface StoragePort {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}
export class Store {
  state: Save = freshSave();
  hasSave = false;
  error = "";
  listeners = new Set<() => void>();
  constructor(private storage: StoragePort) {
    try {
      const raw = storage.getItem(SAVE_KEY);
      if (raw) {
        this.state = validateSave(JSON.parse(raw));
        this.hasSave = true;
      }
    } catch {
      try {
        const previous = storage.getItem(SAVE_KEY + ".previous");
        if (previous) {
          this.state = validateSave(JSON.parse(previous));
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
      const previous = this.storage.getItem(SAVE_KEY);
      if (previous) {
        try {
          validateSave(JSON.parse(previous));
          this.storage.setItem(SAVE_KEY + ".previous", previous);
        } catch {
          /* Keep last valid recovery snapshot. */
        }
      }
      this.storage.setItem(SAVE_KEY, JSON.stringify(this.state));
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
  restore(text: string) {
    if (new TextEncoder().encode(text).length > 8 * 1024 * 1024)
      throw Error("Backup maior que 8 MB.");
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      throw Error("Backup não é um JSON válido.");
    }
    const next = validateSave(raw);
    this.state = next;
    this.persist();
    this.emit();
  }
  reset() {
    this.state = freshSave();
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
    return balanceAiWorkout(
      normalized,
      this.state.trainingRewards,
      stats(this.state).attributes,
    );
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
