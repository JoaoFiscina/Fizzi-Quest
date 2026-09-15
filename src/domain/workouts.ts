import { z } from "zod";
export const attributes = ["strength", "vigor", "agility", "breath"] as const;
export type Attribute = (typeof attributes)[number];
export type Vector = Record<Attribute, number>;
export const zero = (): Vector => ({
  strength: 0,
  vigor: 0,
  agility: 0,
  breath: 0,
});
const finite = z.number().finite().nonnegative();
const name = z.string().trim().min(1).max(200);
const category = z
  .enum(["upper_strength", "lower_strength", "core"])
  .nullable();
const setType = z.enum(["work", "warmup", "unknown"]);
const setSchema = z.object({
  loadKg: finite.nullable(),
  reps: z.number().int().positive().nullable(),
  durationSeconds: z.number().finite().positive().optional(),
  setType,
});
const exerciseSchema = z
  .object({
    name,
    equipment: z.string().max(200),
    category,
    sets: z.array(setSchema).max(100).optional(),
    reps: z.array(z.number().int().positive().nullable()).max(100).optional(),
    loadKg: finite.nullable().optional(),
    setType: setType.optional(),
  })
  .superRefine((e, ctx) => {
    if ((e.sets === undefined) === (e.reps === undefined))
      ctx.addIssue({
        code: "custom",
        message: "Use sets ou reps, nunca ambos.",
      });
    if (e.reps && (e.loadKg === undefined || e.setType === undefined))
      ctx.addIssue({
        code: "custom",
        message: "Informe loadKg e setType no formato compacto.",
      });
  })
  .transform((e) => ({
    name: e.name,
    equipment: e.equipment,
    category: e.category,
    sets:
      e.sets ??
      e.reps!.map((reps) => ({ loadKg: e.loadKg!, reps, setType: e.setType! })),
  }));
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((d) => {
    const t = new Date(d + "T12:00:00Z");
    return Number.isFinite(t.getTime()) && t.toISOString().slice(0, 10) === d;
  }, "Data inexistente.");
export const workoutSchema = z
  .object({
    schemaVersion: z.literal(1),
    sessionId: z.string().max(200).optional(),
    source: z.enum(["screenshot", "manual", "export"]),
    sourceApp: z.string().max(200).nullable(),
    date: dateSchema,
    dateYearInferred: z.boolean(),
    displayedTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
      .nullable(),
    durationText: z.string().max(200).nullable(),
    reportedVolumeKg: finite.nullable(),
    reportedPRs: finite.int().nullable(),
    reportedSets: finite.int().nullable(),
    partial: z.boolean().default(false),
    exercises: z.array(exerciseSchema).max(100),
    cardio: z
      .array(
        z.object({
          name,
          category: z.enum(["running", "cycling"]).nullable(),
          durationMinutes: z.number().finite().positive().max(100000),
          distanceKm: finite.nullable().optional(),
        }),
      )
      .max(20)
      .default([]),
    reviewNotes: z.array(z.string().max(1000)).max(100).default([]),
  })
  .refine(
    (w) => w.exercises.length + w.cardio.length > 0,
    "Inclua exercícios ou aeróbico.",
  );
export type Workout = z.infer<typeof workoutSchema>;
export type RecordEntry = {
  id: string;
  externalSessionId?: string;
  workout: Workout;
};
export function parseWorkout(text: string): Workout {
  if (new TextEncoder().encode(text).length > 256 * 1024)
    throw Error("JSON maior que 256 KB.");
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw Error("JSON inválido. Confira vírgulas, aspas e chaves.");
  }
  const result = workoutSchema.safeParse(value);
  if (!result.success)
    throw Error(
      "Revise o formato: " +
        result.error.issues
          .slice(0, 3)
          .map((e) => e.path.join(".") + ": " + e.message)
          .join(" · "),
    );
  return result.data;
}
export function pending(w: Workout): string[] {
  return [
    w.dateYearInferred ? "Confirme a data antes de registrar." : "",
    w.exercises.some((e) => e.category === null) ||
    w.cardio.some((c) => c.category === null)
      ? "Há atividades sem categoria."
      : "",
    w.exercises.some((e) => e.sets.some((s) => s.setType === "unknown"))
      ? "Há séries sem classificação."
      : "",
  ].filter(Boolean);
}
const weights: Record<string, number[]> = {
  upper_strength: [0.75, 0.25, 0, 0],
  lower_strength: [0.4, 0.6, 0, 0],
  core: [0.2, 0.8, 0, 0],
  running: [0, 0, 0.3, 0.7],
  cycling: [0, 0.2, 0, 0.8],
};
export function scoreDay(workouts: Workout[]): Vector {
  const counts: Record<string, number> = {
    upper_strength: 0,
    lower_strength: 0,
    core: 0,
    running: 0,
    cycling: 0,
  };
  for (const w of [...workouts].sort((a, b) =>
    fingerprint(a).localeCompare(fingerprint(b)),
  )) {
    for (const e of w.exercises)
      if (e.category)
        counts[e.category] += e.sets.filter((s) => s.setType === "work").length;
    for (const c of w.cardio)
      if (c.category) counts[c.category] += c.durationMinutes;
  }
  const S = counts.upper_strength + counts.lower_strength + counts.core,
    M = counts.running + counts.cycling;
  const result = [0, 0, 0, 0];
  for (const [key, count] of Object.entries(counts)) {
    const strength = ["upper_strength", "lower_strength", "core"].includes(key),
      total = strength ? S : M;
    const points = strength
      ? S
        ? 30 + 4 * Math.min(S, 20)
        : 0
      : 2 * Math.min(M, 40);
    if (total)
      weights[key].forEach(
        (weight, i) => (result[i] += ((points * count) / total) * weight),
      );
  }
  const raw = result.reduce((a, b) => a + b, 0),
    ratio = raw > 160 ? 160 / raw : 1;
  const cents = result.map((v) => v * ratio * 100),
    ints = cents.map((v) => Math.floor(v + 1e-9));
  const rest =
    Math.round(Math.min(raw, 160) * 100) - ints.reduce((a, b) => a + b, 0);
  const order = [0, 1, 2, 3].sort((a, b) =>
    Math.abs(cents[b] - ints[b] - (cents[a] - ints[a])) < 1e-9
      ? a - b
      : cents[b] - ints[b] - (cents[a] - ints[a]),
  );
  for (let i = 0; i < rest; i++) ints[order[i]]++;
  return Object.fromEntries(attributes.map((a, i) => [a, ints[i]])) as Vector;
}
export function mastery(records: RecordEntry[]): Vector {
  const days = new Map<string, Workout[]>();
  for (const r of records) {
    const day = days.get(r.workout.date) ?? [];
    day.push(r.workout);
    days.set(r.workout.date, day);
  }
  const total = zero();
  for (const day of days.values()) {
    const v = scoreDay(day);
    attributes.forEach((a) => (total[a] += v[a]));
  }
  return total;
}
export function fingerprint(w: Workout): string {
  return JSON.stringify({
    date: w.date,
    time: w.displayedTime,
    exercises: w.exercises
      .map((e) => ({
        name: e.name.trim().toLocaleLowerCase(),
        category: e.category,
        sets: e.sets,
      }))
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
    cardio: w.cardio
      .map((c) => ({ ...c, name: c.name.trim().toLocaleLowerCase() }))
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
  });
}
export function volume(w: Workout): number | null {
  let v = 0;
  for (const e of w.exercises)
    for (const s of e.sets) {
      if (s.loadKg === null || s.reps === null) return null;
      v += s.loadKg * s.reps;
    }
  return v;
}
