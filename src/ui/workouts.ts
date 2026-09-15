import type { Store } from "../application/store";
import {
  parseWorkout,
  pending,
  mastery,
  scoreDay,
  attributes,
  volume,
  fingerprint,
  type Workout,
} from "../domain/workouts";
import fixture from "../fixture.json";
import { el, button, field, fmt, labels } from "./dom";
export function workoutsUI(
  store: Store,
  host: HTMLElement,
  notify: (s: string) => void,
) {
  const show = () => {
    host.replaceChildren(
      el(
        "p",
        "Seu treino vira experiência física. Sua aventura tem o próprio ritmo.",
        "muted",
      ),
    );
    host.append(button("Importar treino", () => paste(), "primary"));
    if (!store.state.workouts.length)
      host.append(
        el(
          "p",
          "Seu diário está em branco. Você já pode explorar — treinar é opcional.",
          "empty",
        ),
      );
    for (const r of [...store.state.workouts].sort((a, b) =>
      b.workout.date.localeCompare(a.workout.date),
    )) {
      const row = el("section", "", "entry");
      const daily = scoreDay(
        store.state.workouts
          .filter((x) => x.workout.date === r.workout.date)
          .map((x) => x.workout),
      );
      row.append(
        el("h3", r.workout.date.split("-").reverse().join("/")),
        el(
          "p",
          `${r.workout.exercises.reduce((n, e) => n + e.sets.filter((s) => s.setType === "work").length, 0)} séries de trabalho · ${fmt(r.workout.cardio.reduce((n, c) => n + c.durationMinutes, 0))} min aeróbico`,
        ),
        el(
          "small",
          `Total do dia: ${fmt(attributes.reduce((n, a) => n + daily[a], 0) / 100)} pontos`,
        ),
        button("Revisar / editar", () =>
          review(structuredClone(r.workout), r.id),
        ),
        button("Remover", () => remove(r.id), "quiet"),
      );
      host.append(row);
    }
  };
  const remove = (id: string) => {
    const before = mastery(store.state.workouts),
      after = mastery(store.state.workouts.filter((r) => r.id !== id));
    host.replaceChildren(
      el("h3", "Remover este treino?"),
      el(
        "p",
        "As maestrias serão recalculadas. Os atributos podem diminuir. XP de aventura e itens serão preservados.",
      ),
    );
    for (const a of attributes)
      host.append(
        el(
          "p",
          `${labels[a]}: ${fmt(before[a] / 100)} → ${fmt(after[a] / 100)}`,
        ),
      );
    host.append(
      button(
        "Confirmar remoção",
        () => {
          store.remove(id);
          notify("Treino removido. Maestrias recalculadas.");
          show();
        },
        "danger",
      ),
      button("Cancelar", show),
    );
  };
  const paste = () => {
    host.replaceChildren(el("p", "Cole o JSON do treino organizado no chat."));
    const input = el("textarea");
    input.rows = 12;
    input.placeholder = '{"schemaVersion": 1, …}';
    input.setAttribute("aria-label", "JSON do treino");
    const error = el("p", "", "error");
    host.append(
      input,
      error,
      button(
        "Revisar JSON",
        () => {
          try {
            review(parseWorkout(input.value));
          } catch (e) {
            error.textContent = (e as Error).message;
          }
        },
        "primary",
      ),
      button("Carregar exemplo do documento", () => {
        input.value = JSON.stringify(fixture, null, 2);
      }),
      button("Voltar ao histórico", show),
    );
  };
  const review = (w: Workout, id?: string) => {
    host.replaceChildren(
      el("h3", id ? "Editar registro" : "Revisar antes de registrar"),
    );
    let partialAck = !w.partial,
      similarAck = false;
    const date = el("input");
    date.type = "date";
    date.value = w.date;
    host.append(field("Data do treino", date));
    const dateAck = el("input");
    dateAck.type = "checkbox";
    dateAck.checked = !w.dateYearInferred;
    host.append(field("Confirmo que esta é a data correta", dateAck));
    const summary = el(
      "p",
      `${w.exercises.reduce((n, e) => n + e.sets.length, 0)} séries · duração informada: ${w.durationText ?? "não informada"} (não pontua como cardio)`,
      "muted",
    );
    host.append(summary);
    if (w.partial) {
      const check = el("input");
      check.type = "checkbox";
      check.onchange = () => {
        partialAck = check.checked;
        refresh();
      };
      host.append(
        field("Entendo que somente o trecho visível será contabilizado", check),
      );
    }
    const all = button("Todas são séries de trabalho", () => {
      w.exercises.forEach((e) => e.sets.forEach((s) => (s.setType = "work")));
      review(w, id);
    });
    host.append(all);
    const select = (
      options: [string, string][],
      value: string,
      fn: (v: string) => void,
    ) => {
      const input = el("select");
      options.forEach(([v, t]) => {
        const o = el("option", t);
        o.value = v;
        input.append(o);
      });
      input.value = value;
      input.onchange = () => {
        fn(input.value);
        refresh();
      };
      return input;
    };
    w.exercises.forEach((e) => {
      const section = el("section", "", "entry");
      const input = el("input");
      input.value = e.name;
      input.maxLength = 200;
      input.oninput = () => {
        e.name = input.value;
        refresh();
      };
      section.append(
        field("Exercício", input),
        field(
          "Categoria",
          select(
            [
              ["", "Selecionar categoria"],
              ["upper_strength", "Superiores"],
              ["lower_strength", "Pernas"],
              ["core", "Core"],
            ],
            e.category ?? "",
            (v) => (e.category = (v || null) as typeof e.category),
          ),
        ),
      );
      e.sets.forEach((s, i) => {
        const row = el("div", "", "set-row");
        const load = el("input");
        load.type = "number";
        load.min = "0";
        load.step = "any";
        load.value = s.loadKg === null ? "" : String(s.loadKg);
        load.placeholder = "?";
        load.oninput = () => {
          s.loadKg = load.value === "" ? null : Number(load.value);
          refresh();
        };
        const reps = el("input");
        reps.type = "number";
        reps.min = "1";
        reps.step = "1";
        reps.value = s.reps === null ? "" : String(s.reps);
        reps.placeholder = "?";
        reps.oninput = () => {
          s.reps = reps.value === "" ? null : Number(reps.value);
          refresh();
        };
        row.append(
          el("span", String(i + 1)),
          field("kg", load),
          field("reps", reps),
          field(
            "Tipo",
            select(
              [
                ["unknown", "Revisar"],
                ["work", "Trabalho"],
                ["warmup", "Aquecimento"],
              ],
              s.setType,
              (v) => (s.setType = v as typeof s.setType),
            ),
          ),
        );
        section.append(row);
      });
      host.append(section);
    });
    w.cardio.forEach((c) => {
      const row = el("section", "", "entry");
      const minutes = el("input");
      minutes.type = "number";
      minutes.step = "any";
      minutes.min = "0.01";
      minutes.value = String(c.durationMinutes);
      minutes.oninput = () => {
        c.durationMinutes = Number(minutes.value);
        refresh();
      };
      row.append(
        el("h3", c.name),
        field(
          "Categoria",
          select(
            [
              ["", "Selecionar categoria"],
              ["running", "Corrida / caminhada"],
              ["cycling", "Bicicleta"],
            ],
            c.category ?? "",
            (v) => (c.category = (v || null) as typeof c.category),
          ),
        ),
        field("Minutos de aeróbico", minutes),
      );
      host.append(row);
    });
    for (const note of w.reviewNotes) host.append(el("p", note, "muted"));
    const preview = el("div", "", "preview"),
      error = el("p", "", "error");
    const similarCheck = el("input");
    similarCheck.type = "checkbox";
    similarCheck.onchange = () => {
      similarAck = similarCheck.checked;
      refresh();
    };
    const similarLabel = field(
      "Reconheço a semelhança e confirmo que é outra sessão",
      similarCheck,
    );
    const confirm = button(
      id ? "Salvar correção" : "Confirmar treino",
      () => {
        try {
          store.record(w, id, partialAck);
          notify("Treino registrado! Maestrias recalculadas.");
          show();
        } catch (e) {
          error.textContent = (e as Error).message;
        }
      },
      "primary",
    );
    const duplicateButton = button("Abrir registro existente", () => {
      const existing = store.state.workouts.find(
        (r) =>
          r.id !== id &&
          (fingerprint(r.workout) === fingerprint(w) ||
            (w.sessionId && r.externalSessionId === w.sessionId)),
      );
      if (existing) review(structuredClone(existing.workout), existing.id);
    });
    host.append(
      preview,
      similarLabel,
      error,
      duplicateButton,
      confirm,
      button("Cancelar", show),
    );
    const refresh = () => {
      preview.replaceChildren(el("h3", "Prévia das maestrias"));
      let invalid = "";
      try {
        parseWorkout(JSON.stringify(w));
      } catch (e) {
        invalid = (e as Error).message;
      }
      const other = store.state.workouts.filter((r) => r.id !== id),
        before = mastery(store.state.workouts),
        after = mastery([...other, { id: id ?? "preview", workout: w }]);
      for (const a of attributes) {
        const diff = (after[a] - before[a]) / 100;
        preview.append(
          el(
            "p",
            `${labels[a]} ${diff >= 0 ? "+" : ""}${fmt(diff)} · total ${fmt(after[a] / 100)}`,
          ),
        );
      }
      const v = volume(w);
      preview.append(
        el(
          "p",
          v === null
            ? "Volume não conferível com os dados atuais"
            : `Volume conferido: ${fmt(v)} kg`,
        ),
      );
      if (
        v !== null &&
        w.reportedVolumeKg !== null &&
        Math.abs(v - w.reportedVolumeKg) >
          Math.max(1, w.reportedVolumeKg * 0.01)
      )
        preview.append(
          el(
            "p",
            `Atenção: volume informado ${fmt(w.reportedVolumeKg)} kg diverge do calculado.`,
            "error",
          ),
        );
      const daily = scoreDay([
        ...other.map((r) => r.workout).filter((x) => x.date === w.date),
        w,
      ]);
      if (attributes.reduce((n, a) => n + daily[a], 0) >= 16000)
        preview.append(
          el(
            "p",
            "O limite de pontos deste dia foi aplicado. Veja a distribuição acima.",
          ),
        );
      const dup = other.some(
        (r) =>
          fingerprint(r.workout) === fingerprint(w) ||
          (w.sessionId && r.externalSessionId === w.sessionId),
      );
      const similar = other.some(
        (r) =>
          r.workout.date === w.date &&
          r.workout.exercises.some((e) =>
            w.exercises.some(
              (x) => x.name.toLowerCase() === e.name.toLowerCase(),
            ),
          ),
      );
      similarLabel.hidden = !similar || dup;
      duplicateButton.hidden = !dup;
      error.textContent =
        invalid ||
        (dup
          ? "Esse treino já está no histórico. Quer abrir o registro?"
          : pending(w).join(" "));
      confirm.disabled = Boolean(
        invalid ||
          dup ||
          pending(w).length ||
          !partialAck ||
          (similar && !similarAck),
      );
    };
    date.onchange = () => {
      w.date = date.value;
      w.dateYearInferred = true;
      dateAck.checked = false;
      refresh();
    };
    dateAck.onchange = () => {
      w.dateYearInferred = !dateAck.checked;
      refresh();
    };
    refresh();
  };
  show();
}
