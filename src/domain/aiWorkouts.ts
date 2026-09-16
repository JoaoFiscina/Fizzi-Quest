import { z } from "zod";
import { attributes, dateSchema, zero, type Vector } from "./workouts";

export const confidenceLevels = ["low", "medium", "high"] as const;
export type Confidence = (typeof confidenceLevels)[number];

const finite = z.number().finite().nonnegative();
const optionalMetric = (max: number) => finite.max(max).optional();
const setSchema = z.object({
  weight: finite.max(2000).nullable().optional(),
  reps: z.number().int().positive().max(1000).nullable().optional(),
  duration_sec: finite.positive().max(86400).optional(),
});
const exerciseSchema = z.object({
  name: z.string().trim().min(1).max(200),
  sets: z.array(setSchema).max(100).default([]),
});

export const aiWorkoutSchema = z.object({
  type: z.literal("fizzi_workout"),
  version: z.literal(1),
  id: z.string().trim().min(1).max(200),
  date: dateSchema,
  summary: z.string().trim().min(1).max(240),
  confidence: z.enum(confidenceLevels),
  workout: z.object({
    modality: z.enum([
      "strength",
      "running",
      "walking",
      "cycling",
      "hybrid",
      "other",
    ]),
    duration_min: optionalMetric(600),
    sets: z.number().int().nonnegative().max(200).optional(),
    volume_kg: optionalMetric(10_000_000),
    prs: z.number().int().nonnegative().max(100).optional(),
    distance_km: optionalMetric(1000),
    pace: z.string().trim().max(60).optional(),
    intensity_rpe: finite.min(1).max(10).optional(),
    exercises: z.array(exerciseSchema).max(100).default([]),
    notes: z.string().trim().max(1000).optional(),
  }),
  rewards: z.object({
    xp: z.number().int().nonnegative().max(1_000_000),
    gold: z.number().int().nonnegative().max(1_000_000),
    attributes: z
      .object({
        strength: finite.max(1000).default(0),
        vigor: finite.max(1000).default(0),
        agility: finite.max(1000).default(0),
        breath: finite.max(1000).default(0),
      })
      .default(zero),
  }),
  progression: z
    .object({
      prs: z.number().int().nonnegative().max(100).optional(),
      notes: z.string().trim().max(1000).optional(),
    })
    .default({}),
});

export type AiWorkout = z.infer<typeof aiWorkoutSchema>;
export type AppliedWorkoutReward = {
  xp: number;
  gold: number;
  attributes: Vector;
  declaredConfidence: Confidence;
  effectiveConfidence: Confidence;
  adjustments: string[];
};
export type TrainingRewardRecord = {
  id: string;
  externalSessionId: string;
  fingerprint: string;
  workout: AiWorkout;
  reward: AppliedWorkoutReward;
};

const rank: Record<Confidence, number> = { low: 0, medium: 1, high: 2 };
const capByConfidence = {
  low: { xp: 100, gold: 18, attribute: 0.02, perAttribute: 0.02 },
  medium: { xp: 220, gold: 45, attribute: 0.18, perAttribute: 0.12 },
  high: { xp: 360, gold: 80, attribute: 0.4, perAttribute: 0.22 },
} as const;
export const DAILY_TRAINING_CAPS = { xp: 450, gold: 100, attribute: 0.5 };

export function parseAiWorkout(text: string): AiWorkout {
  if (new TextEncoder().encode(text).length > 256 * 1024)
    throw Error("JSON maior que 256 KB.");
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw Error("JSON inválido. Confira vírgulas, aspas e chaves.");
  }
  const result = aiWorkoutSchema.safeParse(value);
  if (!result.success)
    throw Error(
      "Revise o formato da IA: " +
        result.error.issues
          .slice(0, 4)
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(" · "),
    );
  return result.data;
}

function evidenceConfidence(input: AiWorkout): Confidence {
  const w = input.workout;
  let score = 0;
  if (w.duration_min) score++;
  if (w.sets) score++;
  if (w.volume_kg) score++;
  if (w.distance_km || w.pace) score++;
  if (w.prs || input.progression.prs) score++;
  if (w.intensity_rpe) score++;
  if (w.exercises.some((exercise) => exercise.sets.length)) score += 2;
  if (input.progression.notes) score++;
  return score >= 5 ? "high" : score >= 2 ? "medium" : "low";
}

const rounded = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;
const sumAttributes = (value: Vector) =>
  attributes.reduce((total, attribute) => total + value[attribute], 0);

export function trainingTotals(records: TrainingRewardRecord[]): Vector {
  const result = zero();
  for (const record of records)
    for (const attribute of attributes)
      result[attribute] = rounded(
        result[attribute] + record.reward.attributes[attribute],
      );
  return result;
}

export function fingerprintAiWorkout(input: AiWorkout): string {
  return JSON.stringify({
    date: input.date,
    summary: input.summary.trim().toLocaleLowerCase(),
    workout: input.workout,
  });
}

export function balanceAiWorkout(
  input: AiWorkout,
  records: TrainingRewardRecord[],
  currentAttributes: Vector,
): AppliedWorkoutReward {
  const evidence = evidenceConfidence(input);
  const effectiveConfidence =
    rank[input.confidence] <= rank[evidence] ? input.confidence : evidence;
  const caps = capByConfidence[effectiveConfidence];
  const sameDay = records.filter(
    (record) => record.workout.date === input.date,
  );
  const usedXp = sameDay.reduce((total, record) => total + record.reward.xp, 0);
  const usedGold = sameDay.reduce(
    (total, record) => total + record.reward.gold,
    0,
  );
  const usedAttributes = sameDay.reduce(
    (total, record) => total + sumAttributes(record.reward.attributes),
    0,
  );
  const xp = Math.max(
    0,
    Math.min(input.rewards.xp, caps.xp, DAILY_TRAINING_CAPS.xp - usedXp),
  );
  const gold = Math.max(
    0,
    Math.min(
      input.rewards.gold,
      caps.gold,
      DAILY_TRAINING_CAPS.gold - usedGold,
    ),
  );
  const result = zero();
  for (const attribute of attributes) {
    const diminishing = Math.max(
      0.55,
      1 - Math.max(0, currentAttributes[attribute] - 10) * 0.04,
    );
    result[attribute] = rounded(
      Math.min(
        input.rewards.attributes[attribute],
        caps.perAttribute * diminishing,
      ),
    );
  }
  const sessionTotal = sumAttributes(result);
  const remainingDaily = Math.max(
    0,
    DAILY_TRAINING_CAPS.attribute - usedAttributes,
  );
  const allowedTotal = Math.min(caps.attribute, remainingDaily);
  if (sessionTotal > allowedTotal && sessionTotal > 0) {
    const ratio = allowedTotal / sessionTotal;
    const rawCents = attributes.map(
      (attribute) => result[attribute] * ratio * 100,
    );
    const cents = rawCents.map(Math.floor);
    let remainder =
      Math.round(allowedTotal * 100) - cents.reduce((a, b) => a + b, 0);
    const order = attributes
      .map((_, index) => index)
      .sort(
        (left, right) =>
          rawCents[right] - cents[right] - (rawCents[left] - cents[left]),
      );
    for (let index = 0; index < remainder; index++)
      cents[order[index % order.length]]++;
    attributes.forEach(
      (attribute, index) => (result[attribute] = cents[index] / 100),
    );
  }
  const adjustments: string[] = [];
  if (effectiveConfidence !== input.confidence)
    adjustments.push(
      `Confiança ajustada de ${input.confidence.toUpperCase()} para ${effectiveConfidence.toUpperCase()} por falta de detalhes.`,
    );
  if (xp !== input.rewards.xp)
    adjustments.push(`XP limitado de ${input.rewards.xp} para ${xp}.`);
  if (gold !== input.rewards.gold)
    adjustments.push(`Ouro limitado de ${input.rewards.gold} para ${gold}.`);
  if (
    attributes.some(
      (attribute) =>
        result[attribute] !== rounded(input.rewards.attributes[attribute]),
    )
  )
    adjustments.push("Atributos ajustados pelos limites da sessão e do dia.");
  return {
    xp,
    gold,
    attributes: result,
    declaredConfidence: input.confidence,
    effectiveConfidence,
    adjustments,
  };
}

export const trainingRewardRecordSchema = z.object({
  id: z.string().uuid(),
  externalSessionId: z.string().min(1).max(200),
  fingerprint: z.string().min(1).max(300_000),
  workout: aiWorkoutSchema,
  reward: z.object({
    xp: z.number().int().nonnegative().max(DAILY_TRAINING_CAPS.xp),
    gold: z.number().int().nonnegative().max(DAILY_TRAINING_CAPS.gold),
    attributes: z.object({
      strength: finite.max(1),
      vigor: finite.max(1),
      agility: finite.max(1),
      breath: finite.max(1),
    }),
    declaredConfidence: z.enum(confidenceLevels),
    effectiveConfidence: z.enum(confidenceLevels),
    adjustments: z.array(z.string().max(300)).max(10),
  }),
});
