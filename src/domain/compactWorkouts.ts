import { z } from "zod";
import { attributes, dateSchema, zero, type Vector } from "./workouts";
import {
  baseRewardOf,
  prBonusOf,
  recordDate,
  DAILY_TRAINING_CAPS,
  type AppliedWorkoutReward,
  type Confidence,
  type TrainingRewardRecord,
} from "./aiWorkouts";

const amount = z.number().finite().nonnegative().max(1000);
const vectorSchema = z
  .object({
    forca: amount.default(0),
    vigor: amount.default(0),
    agilidade: amount.default(0),
    folego: amount.default(0),
  })
  .strict()
  .default({ forca: 0, vigor: 0, agilidade: 0, folego: 0 });
const prSchema = z
  .object({
    forca: z.number().int().nonnegative().max(100).default(0),
    vigor: z.number().int().nonnegative().max(100).default(0),
    agilidade: z.number().int().nonnegative().max(100).default(0),
    folego: z.number().int().nonnegative().max(100).default(0),
  })
  .strict()
  .default({ forca: 0, vigor: 0, agilidade: 0, folego: 0 });
export const compactWorkoutSchema = z
  .object({
    v: z.literal(2),
    id: z.string().uuid(),
    c: z.enum(["baixa", "media", "alta"]),
    xp: z.number().int().nonnegative().max(1_000_000),
    atributos: vectorSchema,
    pr: prSchema,
  })
  .strict();
export type CompactWorkout = z.infer<typeof compactWorkoutSchema>;
export const trainingDraftSchema = z
  .object({
    id: z.string().uuid(),
    date: dateSchema,
    rules: z.literal(2),
  })
  .strict();
export type TrainingDraft = z.infer<typeof trainingDraftSchema>;
export type PrBonus = { xp: number; attributes: Vector; count: number };
export type CompactPreview = {
  baseReward: AppliedWorkoutReward;
  prBonus: PrBonus;
  reward: AppliedWorkoutReward;
};
export type CompactTrainingRewardRecord = {
  format: 2;
  id: string;
  externalSessionId: string;
  fingerprint: string;
  date: string;
  compact: CompactWorkout;
  baseReward: AppliedWorkoutReward;
  prBonus: PrBonus;
  reward: AppliedWorkoutReward;
};

const names = {
  strength: "forca",
  vigor: "vigor",
  agility: "agilidade",
  breath: "folego",
} as const;
const confidence = { baixa: "low", media: "medium", alta: "high" } as const;
const caps = {
  low: { xp: 60, gold: 18, attribute: 0.02, perAttribute: 0.02 },
  medium: { xp: 132, gold: 45, attribute: 0.23, perAttribute: 0.15 },
  high: { xp: 216, gold: 80, attribute: 0.5, perAttribute: 0.28 },
} as const;
const cents = (n: number) => Math.round((n + Number.EPSILON) * 100);
const sum = (v: Vector) => attributes.reduce((n, k) => n + v[k], 0);
const emptyReward = (c: Confidence): AppliedWorkoutReward => ({
  xp: 0,
  gold: 0,
  attributes: zero(),
  declaredConfidence: c,
  effectiveConfidence: c,
  adjustments: [],
});

export function parseCompactWorkout(text: string): CompactWorkout {
  if (new TextEncoder().encode(text).length > 16 * 1024)
    throw Error("Código do treino maior que 16 KB.");
  const trimmed = text.trim();
  const json =
    trimmed.startsWith("```json") && trimmed.endsWith("```")
      ? trimmed.slice(7, -3).trim()
      : trimmed;
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw Error("JSON inválido. Cole um único objeto, sem explicações.");
  }
  const result = compactWorkoutSchema.safeParse(raw);
  if (!result.success)
    throw Error(
      "Código v2 inválido: " +
        result.error.issues
          .slice(0, 3)
          .map(
            (issue) => `${issue.path.join(".") || "objeto"}: ${issue.message}`,
          )
          .join(" · "),
    );
  return result.data;
}

export function balanceCompactWorkout(
  input: CompactWorkout,
  draft: TrainingDraft,
  records: TrainingRewardRecord[],
): CompactPreview {
  if (input.id !== draft.id)
    throw Error(
      "ID diferente do rascunho. Copie o modelo deste aparelho ou restaure o backup correspondente.",
    );
  if (records.some((r) => r.externalSessionId === input.id))
    throw Error("Esse treino já está no histórico.");
  const c = confidence[input.c];
  const cap = caps[c];
  const sameDay = records.filter((r) => recordDate(r) === draft.date);
  const usedBaseXp = sameDay.reduce((n, r) => n + baseRewardOf(r).xp, 0);
  const usedGold = sameDay.reduce((n, r) => n + r.reward.gold, 0);
  const usedBaseAttr = sameDay.reduce(
    (n, r) => n + sum(baseRewardOf(r).attributes),
    0,
  );
  const usedPr = sameDay.reduce((n, r) => n + prBonusOf(r).count, 0);
  const baseReward = emptyReward(c);
  baseReward.xp = Math.max(
    0,
    Math.min(input.xp, cap.xp, DAILY_TRAINING_CAPS.xp - usedBaseXp),
  );
  const allowedCents = Math.max(
    0,
    Math.min(
      cents(cap.attribute),
      cents(DAILY_TRAINING_CAPS.attribute - usedBaseAttr),
    ),
  );
  const proposed = attributes.map((k) =>
    Math.min(cents(input.atributos[names[k]]), cents(cap.perAttribute)),
  );
  const proposedTotal = proposed.reduce((n, value) => n + value, 0);
  const applied = [...proposed];
  if (proposedTotal > allowedCents) {
    const scaled = proposed.map(
      (value) => (value * allowedCents) / proposedTotal,
    );
    const floors = scaled.map(Math.floor);
    let remainder = allowedCents - floors.reduce((n, value) => n + value, 0);
    const order = attributes
      .map((_, i) => i)
      .sort((a, b) => scaled[b] - floors[b] - (scaled[a] - floors[a]) || a - b);
    for (const i of order) {
      if (remainder <= 0) break;
      floors[i]++;
      remainder--;
    }
    applied.splice(0, applied.length, ...floors);
  }
  attributes.forEach((k, i) => {
    baseReward.attributes[k] = applied[i] / 100;
  });
  baseReward.gold = Math.max(
    0,
    Math.min(
      Math.floor(baseReward.xp / 3),
      cap.gold,
      DAILY_TRAINING_CAPS.gold - usedGold,
    ),
  );
  if (
    baseReward.xp !== input.xp ||
    attributes.some(
      (k) => baseReward.attributes[k] !== input.atributos[names[k]],
    )
  )
    baseReward.adjustments.push(
      "Ganhos base ajustados aos limites da sessão ou do dia.",
    );
  const prBonus: PrBonus = { xp: 0, attributes: zero(), count: 0 };
  const requestedPr = attributes.reduce((n, k) => n + input.pr[names[k]], 0);
  if (c !== "low") {
    let slots = Math.max(0, Math.min(3, 3 - usedPr));
    for (const k of attributes) {
      const count = Math.min(input.pr[names[k]], slots);
      prBonus.attributes[k] = count * 0.02;
      prBonus.count += count;
      slots -= count;
    }
    prBonus.xp = prBonus.count * 5;
  }
  if (requestedPr !== prBonus.count)
    baseReward.adjustments.push(
      c === "low"
        ? "Confiança baixa: PR sugerido não gera bônus."
        : `PRs limitados de ${requestedPr} para ${prBonus.count} nesta sessão/dia.`,
    );
  const reward = emptyReward(c);
  reward.xp = baseReward.xp + prBonus.xp;
  reward.gold = baseReward.gold;
  for (const k of attributes)
    reward.attributes[k] =
      Math.round((baseReward.attributes[k] + prBonus.attributes[k]) * 100) /
      100;
  reward.adjustments = [...baseReward.adjustments];
  return { baseReward, prBonus, reward };
}

const rewardSchema = z.object({
  xp: z.number().int().nonnegative().max(465),
  gold: z.number().int().nonnegative().max(100),
  attributes: z.object({
    strength: amount.max(1),
    vigor: amount.max(1),
    agility: amount.max(1),
    breath: amount.max(1),
  }),
  declaredConfidence: z.enum(["low", "medium", "high"]),
  effectiveConfidence: z.enum(["low", "medium", "high"]),
  adjustments: z.array(z.string().max(300)).max(10),
});
export const compactTrainingRewardRecordSchema = z.object({
  format: z.literal(2),
  id: z.string().uuid(),
  externalSessionId: z.string().uuid(),
  fingerprint: z.string().max(100).min(1),
  date: dateSchema,
  compact: compactWorkoutSchema,
  baseReward: rewardSchema,
  prBonus: z.object({
    xp: z.number().int().min(0).max(15),
    count: z.number().int().min(0).max(3),
    attributes: z.object({
      strength: amount.max(0.06),
      vigor: amount.max(0.06),
      agility: amount.max(0.06),
      breath: amount.max(0.06),
    }),
  }),
  reward: rewardSchema,
});
