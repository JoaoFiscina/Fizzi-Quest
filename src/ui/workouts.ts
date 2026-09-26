import type { Store } from "../application/store";
import {
  attributes,
  scoreDay,
  volume,
  type RecordEntry,
} from "../domain/workouts";
import {
  fingerprintAiWorkout,
  parseAiWorkout,
  recordDate,
  recordSummary,
  type AiWorkout,
  type AppliedWorkoutReward,
  type TrainingRewardRecord,
} from "../domain/aiWorkouts";
import {
  parseCompactWorkout,
  type CompactWorkout,
  type CompactPreview,
} from "../domain/compactWorkouts";
import { trainingPrompt } from "../content/trainingPrompt";
import { el, button, fmt, labels } from "./dom";

const confidenceLabel = { low: "Baixa", medium: "Média", high: "Alta" };
const modalityLabel = {
  strength: "Musculação",
  running: "Corrida",
  walking: "Caminhada",
  cycling: "Bicicleta",
  hybrid: "Treino misto",
  other: "Outro exercício",
};

export function workoutsUI(
  store: Store,
  host: HTMLElement,
  notify: (message: string) => void,
) {
  const metric = (label: string, value: string) => {
    const item = el("span", "", "training-metric");
    item.append(el("small", label), el("strong", value));
    return item;
  };

  const rewardSummary = (reward: AppliedWorkoutReward) => {
    const wrap = el("section", "", "training-rewards");
    wrap.append(
      el("h3", "Recompensa validada pelo jogo"),
      metric("XP", `+${reward.xp}`),
      metric("Ouro", `+${reward.gold}`),
    );
    const gains = el("div", "", "attribute-gain-grid");
    for (const attribute of attributes) {
      const value = reward.attributes[attribute];
      if (!value) continue;
      const card = el("div", "", "attribute-gain");
      card.append(
        el("small", labels[attribute]),
        el("strong", `+${fmt(value)}`),
      );
      gains.append(card);
    }
    if (!gains.children.length)
      gains.append(
        el(
          "p",
          "Sem atributo específico nesta sessão. XP e ouro continuam válidos.",
          "muted",
        ),
      );
    wrap.append(gains);
    return wrap;
  };

  const detailCurrent = (record: TrainingRewardRecord) => {
    if ("format" in record) {
      host.replaceChildren(
        el("p", record.date.split("-").reverse().join("/"), "eyebrow-inline"),
        el("h3", "Treino importado · código curto"),
        el(
          "p",
          "O relato detalhado ficou na conversa com a IA. O jogo guardou apenas o código e os ganhos aplicados.",
          "muted",
        ),
        metric(
          "Confiança declarada",
          confidenceLabel[record.reward.effectiveConfidence],
        ),
        compactSummary({
          baseReward: record.baseReward,
          prBonus: record.prBonus,
          reward: record.reward,
        }),
        button("Voltar ao histórico", show),
      );
      return;
    }
    const workout = record.workout;
    host.replaceChildren(
      el("p", workout.date.split("-").reverse().join("/"), "eyebrow-inline"),
      el("h3", workout.summary),
      metrics(workout),
      rewardSummary(record.reward),
    );
    if (workout.workout.exercises.length) {
      host.append(el("h3", "Exercícios"));
      for (const exercise of workout.workout.exercises) {
        const section = el("section", "", "entry compact-entry");
        section.append(el("strong", exercise.name));
        if (exercise.sets.length)
          section.append(
            el(
              "small",
              exercise.sets
                .map((set) =>
                  set.weight !== undefined && set.reps !== undefined
                    ? `${fmt(set.weight ?? 0)} kg × ${set.reps ?? "?"}`
                    : set.reps
                      ? `${set.reps} rep.`
                      : "Série registrada",
                )
                .join(" · "),
            ),
          );
        host.append(section);
      }
    }
    if (workout.progression.notes)
      host.append(
        el("p", `Progressão: ${workout.progression.notes}`, "training-note"),
      );
    host.append(button("Voltar ao histórico", show));
  };

  const detailLegacy = (record: RecordEntry) => {
    const workout = record.workout;
    host.replaceChildren(
      el("p", workout.date.split("-").reverse().join("/"), "eyebrow-inline"),
      el("h3", "Treino anterior preservado"),
      el(
        "p",
        "Este registro foi criado antes do fluxo principal com IA e continua contando normalmente para a progressão.",
        "muted",
      ),
      metric(
        "Séries",
        String(
          workout.exercises.reduce(
            (total, exercise) =>
              total +
              exercise.sets.filter((set) => set.setType === "work").length,
            0,
          ),
        ),
      ),
      metric(
        "Volume",
        volume(workout) === null ? "—" : `${fmt(volume(workout)!)} kg`,
      ),
      button("Voltar ao histórico", show),
    );
  };

  function metrics(workout: AiWorkout) {
    const wrap = el("div", "", "training-metrics");
    wrap.append(
      metric("Modalidade", modalityLabel[workout.workout.modality]),
      metric("Confiança", confidenceLabel[workout.confidence]),
    );
    if (workout.workout.duration_min)
      wrap.append(
        metric("Duração", `${fmt(workout.workout.duration_min)} min`),
      );
    if (workout.workout.sets !== undefined)
      wrap.append(metric("Séries", String(workout.workout.sets)));
    if (workout.workout.volume_kg !== undefined)
      wrap.append(metric("Volume", `${fmt(workout.workout.volume_kg)} kg`));
    if (workout.workout.distance_km !== undefined)
      wrap.append(
        metric("Distância", `${fmt(workout.workout.distance_km)} km`),
      );
    const prs = workout.workout.prs ?? workout.progression.prs;
    if (prs !== undefined) wrap.append(metric("PRs", String(prs)));
    return wrap;
  }

  const compactSummary = (preview: CompactPreview) => {
    const wrap = el("section", "", "training-rewards");
    const line = (
      name: string,
      xp: number,
      gold: number,
      values: typeof preview.reward.attributes,
    ) => {
      const p = el(
        "p",
        `${name}: +${xp} XP · +${gold} ouro${attributes
          .filter((k) => values[k])
          .map((k) => ` · +${fmt(values[k])} ${labels[k]}`)
          .join("")}`,
        "training-note",
      );
      return p;
    };
    wrap.append(
      el("h3", "Prévia da recompensa"),
      line(
        "Treino",
        preview.baseReward.xp,
        preview.baseReward.gold,
        preview.baseReward.attributes,
      ),
      line(
        `Bônus de PR (${preview.prBonus.count})`,
        preview.prBonus.xp,
        0,
        preview.prBonus.attributes,
      ),
    );
    for (const adjustment of preview.baseReward.adjustments)
      wrap.append(
        el("p", `Ajuste de limite: ${adjustment}`, "balance-adjustment"),
      );
    if (!preview.baseReward.adjustments.length)
      wrap.append(el("p", "Ajuste de limite: nenhum.", "muted"));
    wrap.append(
      line(
        "Total",
        preview.reward.xp,
        preview.reward.gold,
        preview.reward.attributes,
      ),
    );
    return wrap;
  };

  const show = () => {
    host.replaceChildren();
    const hero = el("section", "", "training-hero");
    hero.append(
      el("small", "TREINO REAL → PROGRESSÃO", "eyebrow-inline"),
      el("h3", "Transforme seu treino em aventura"),
      el(
        "p",
        "Use o prompt do jogo no ChatGPT, envie seus prints ou sua descrição e importe o JSON recebido. O Fizzi Quest confere os limites antes de aplicar qualquer recompensa.",
      ),
      button("Copiar modelo para a IA", guide, "primary"),
      button("Importar resultado da IA", paste),
    );
    host.append(hero);

    const history = [
      ...store.state.trainingRewards.map((record) => ({
        date: recordDate(record),
        kind: "current" as const,
        record,
      })),
      ...store.state.workouts.map((record) => ({
        date: record.workout.date,
        kind: "legacy" as const,
        record,
      })),
    ].sort((a, b) => b.date.localeCompare(a.date));
    host.append(el("h3", "Histórico de treinos"));
    if (!history.length)
      host.append(
        el(
          "p",
          "Seu diário está em branco. O jogo continua completo mesmo nos dias sem treino.",
          "empty",
        ),
      );
    for (const entry of history) {
      const row = el("section", "", "entry training-history-entry");
      if (entry.kind === "current") {
        const record = entry.record;
        row.append(
          el("small", recordDate(record).split("-").reverse().join("/")),
          el("h3", recordSummary(record)),
          el(
            "p",
            `+${record.reward.xp} XP · +${record.reward.gold} ouro · confiança ${confidenceLabel[record.reward.effectiveConfidence].toLowerCase()}`,
          ),
          button("Ver detalhes", () => detailCurrent(record)),
        );
      } else {
        const record = entry.record;
        const daily = scoreDay([record.workout]);
        row.append(
          el("small", record.workout.date.split("-").reverse().join("/")),
          el("h3", "Treino preservado"),
          el(
            "p",
            `${fmt(attributes.reduce((total, key) => total + daily[key], 0) / 100)} pontos de maestria`,
          ),
          button("Ver detalhes", () => detailLegacy(record)),
        );
      }
      host.append(row);
    }
  };

  const prepare = () => {
    host.replaceChildren(
      el("small", "NOVO TREINO", "eyebrow-inline"),
      el("h3", "Escolha a data do treino"),
      el(
        "p",
        "O jogo vai criar um ID para este treino. Guarde o mesmo modelo até confirmar a recompensa.",
        "muted",
      ),
    );
    const date = el("input") as HTMLInputElement;
    date.type = "date";
    const today = new Date();
    date.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    date.setAttribute("aria-label", "Data do treino");
    const error = el("p", "", "error");
    host.append(
      date,
      error,
      button(
        "Criar modelo",
        () => {
          try {
            store.createTrainingDraft(date.value);
            guide();
          } catch (cause) {
            error.textContent = (cause as Error).message;
          }
        },
        "primary",
      ),
      button("Voltar", show, "quiet"),
    );
  };

  const guide = () => {
    const draft = store.state.pendingTraining;
    if (!draft) {
      prepare();
      return;
    }
    const promptText = trainingPrompt(draft);
    host.replaceChildren(
      el("small", "ETAPA 1 DE 2", "eyebrow-inline"),
      el("h3", "Copie o prompt para sua IA"),
      el(
        "p",
        `Treino de ${draft.date.split("-").reverse().join("/")}. Cole este texto na IA e envie junto seus prints ou a descrição do treino. Copiar novamente conserva o ID.`,
        "muted",
      ),
    );
    const prompt = el("textarea", promptText, "ai-prompt");
    prompt.readOnly = true;
    prompt.rows = 12;
    prompt.setAttribute("aria-label", "Prompt para analisar treino com IA");
    host.append(
      prompt,
      button(
        "Copiar prompt",
        async () => {
          try {
            await navigator.clipboard.writeText(promptText);
            notify("Prompt copiado. Envie-o à IA junto com seu treino.");
          } catch {
            prompt.select();
            document.execCommand("copy");
            notify("Prompt copiado.");
          }
        },
        "primary",
      ),
      button("Já tenho o resultado — importar", paste),
      button("Preparar outro treino", prepare),
      button("Voltar ao histórico", show, "quiet"),
    );
  };

  const paste = () => {
    host.replaceChildren(
      el("small", "ETAPA 2 DE 2", "eyebrow-inline"),
      el("h3", "Importar resultado da IA"),
      el(
        "p",
        "Cole somente o JSON devolvido. O jogo vai validar, limitar e mostrar a recompensa antes da confirmação.",
        "muted",
      ),
    );
    const input = el("textarea");
    input.rows = 14;
    input.placeholder =
      '{"v":2,"id":"ID_COPIADO_DO_JOGO","c":"alta","xp":140,"atributos":{...},"pr":{}}';
    input.setAttribute("aria-label", "JSON do treino analisado");
    const error = el("p", "", "error");
    host.append(
      input,
      error,
      button(
        "Validar e visualizar",
        () => {
          try {
            const raw = input.value.trim();
            const json =
              raw.startsWith("```json") && raw.endsWith("```")
                ? raw.slice(7, -3).trim()
                : raw;
            let value: unknown;
            try {
              value = JSON.parse(json);
            } catch {
              throw Error(
                "JSON inválido. Cole um único objeto, sem explicações.",
              );
            }
            if (value && typeof value === "object" && "v" in value)
              reviewCompact(parseCompactWorkout(raw));
            else review(parseAiWorkout(json));
          } catch (cause) {
            error.textContent = (cause as Error).message;
          }
        },
        "primary",
      ),
      button("Voltar", show, "quiet"),
    );
  };

  const reviewCompact = (workout: CompactWorkout) => {
    const preview = store.previewCompactWorkout(workout);
    host.replaceChildren(
      el("small", "PRÉVIA — NADA APLICADO AINDA", "eyebrow-inline"),
      el("h3", "Treino analisado pela IA"),
      el(
        "p",
        `Confiança declarada: ${confidenceLabel[preview.reward.effectiveConfidence]}. O jogo confere estrutura e limites; não tem acesso ao relato original para comprovar o PR.`,
        "muted",
      ),
      compactSummary(preview),
    );
    const error = el("p", "", "error");
    host.append(
      error,
      button(
        "Confirmar recompensa",
        () => {
          try {
            const applied = store.recordCompactWorkout(workout);
            host.replaceChildren(
              el("small", "REGISTRO CONFIRMADO", "eyebrow-inline"),
              el("h3", "Treino concluído"),
              compactSummary(applied),
              button(
                "Ver personagem",
                () =>
                  document
                    .querySelector<HTMLButtonElement>(
                      '.nav button[data-section="character"]',
                    )
                    ?.click(),
                "primary",
              ),
              button("Voltar ao histórico", show, "primary"),
            );
          } catch (cause) {
            error.textContent = (cause as Error).message;
          }
        },
        "primary",
      ),
      button("Corrigir JSON", paste),
    );
  };

  const review = (workout: AiWorkout) => {
    const reward = store.previewAiWorkout(workout);
    const fingerprint = fingerprintAiWorkout(workout);
    const duplicate = store.state.trainingRewards.some(
      (record) =>
        record.externalSessionId === workout.id ||
        record.fingerprint === fingerprint,
    );
    host.replaceChildren(
      el("small", "PRÉVIA — NADA APLICADO AINDA", "eyebrow-inline"),
      el("h3", workout.summary.toLocaleUpperCase("pt-BR")),
      metrics(workout),
      rewardSummary(reward),
    );
    if (reward.effectiveConfidence !== reward.declaredConfidence)
      host.append(
        el(
          "p",
          `Confiança efetiva: ${confidenceLabel[reward.effectiveConfidence]}.`,
          "training-note",
        ),
      );
    for (const adjustment of reward.adjustments)
      host.append(el("p", adjustment, "balance-adjustment"));
    const error = el(
      "p",
      duplicate ? "Esse treino já está no histórico." : "",
      "error",
    );
    const confirm = button(
      "Confirmar treino",
      () => {
        try {
          const applied = store.recordAiWorkout(workout);
          feedback(workout, applied);
        } catch (cause) {
          error.textContent = (cause as Error).message;
        }
      },
      "primary",
    );
    confirm.disabled = duplicate;
    host.append(error, confirm, button("Corrigir JSON", paste));
  };

  const feedback = (workout: AiWorkout, reward: AppliedWorkoutReward) => {
    host.replaceChildren(
      el("small", "REGISTRO CONFIRMADO", "eyebrow-inline"),
      el("h3", "Treino concluído"),
      el("p", workout.summary, "training-complete-summary"),
      rewardSummary(reward),
      button(
        "Ver personagem",
        () => {
          document
            .querySelector<HTMLButtonElement>(
              '.nav button[data-section="character"]',
            )
            ?.click();
        },
        "primary",
      ),
      button("Voltar ao histórico", show),
    );
    requestAnimationFrame(() =>
      host
        .querySelectorAll(".attribute-gain")
        .forEach((node) => node.classList.add("gain-revealed")),
    );
  };

  show();
}
