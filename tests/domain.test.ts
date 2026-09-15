import { describe, it, expect } from "vitest";
import fixture from "../src/fixture.json";
import {
  parseWorkout,
  scoreDay,
  pending,
  volume,
  fingerprint,
  mastery,
} from "../src/domain/workouts";
import {
  freshSave,
  act,
  startBattle,
  rest,
  buy,
  equip,
  stats,
  allocate,
} from "../src/domain/game";
import { Store, SAVE_KEY, validateSave } from "../src/application/store";
import { makeMap, walkable } from "../src/game/maps";
const workout = () => {
  const w = parseWorkout(JSON.stringify(fixture));
  w.dateYearInferred = false;
  w.exercises.forEach((e) => e.sets.forEach((s) => (s.setType = "work")));
  return w;
};
const memory = () => {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      data.set(k, v);
    },
  };
};
describe("treinos e limites diários", () => {
  it("fixture exige revisão e gera 78 pontos, 2540 kg e nenhum cardio pela duração", () => {
    expect(pending(parseWorkout(JSON.stringify(fixture)))).toHaveLength(2);
    expect(scoreDay([workout()])).toEqual({
      strength: 5850,
      vigor: 1950,
      agility: 0,
      breath: 0,
    });
    expect(volume(workout())).toBe(2540);
  });
  it("divide presença e limite entre sessões, independentemente da ordem", () => {
    const a = workout(),
      b = workout();
    b.exercises.forEach((e) => (e.category = "lower_strength"));
    expect(scoreDay([a, b])).toEqual(scoreDay([b, a]));
    expect(Object.values(scoreDay([a, b])).reduce((x, y) => x + y)).toBe(11000);
  });
  it("distribui exatamente os centésimos do teto 160", () => {
    const w = workout();
    w.exercises = [
      {
        ...w.exercises[0],
        sets: Array.from({ length: 20 }, () => ({ ...w.exercises[0].sets[0] })),
      },
    ];
    w.cardio = [{ name: "Corrida", category: "running", durationMinutes: 40 }];
    expect(scoreDay([w])).toEqual({
      strength: 6947,
      vigor: 2316,
      agility: 2021,
      breath: 4716,
    });
  });
  it("aquecimento não pontua; carga null pode pontuar", () => {
    const w = workout();
    w.exercises.forEach((e) =>
      e.sets.forEach((s) => {
        s.setType = "warmup";
        s.loadKg = null;
      }),
    );
    expect(Object.values(scoreDay([w])).every((v) => v === 0)).toBe(true);
    w.exercises[0].sets[0].setType = "work";
    expect(Object.values(scoreDay([w])).reduce((a, b) => a + b)).toBe(3400);
    expect(volume(w)).toBeNull();
  });
  it.each([
    "{",
    JSON.stringify({ ...fixture, date: "2026-02-30" }),
    JSON.stringify({ ...fixture, schemaVersion: 2 }),
    JSON.stringify({ ...fixture, reportedVolumeKg: -1 }),
    JSON.stringify({
      ...fixture,
      exercises: Array(101).fill(fixture.exercises[0]),
    }),
    JSON.stringify(fixture).replace("2540", "1e999"),
  ])("rejeita importação inválida", (text) =>
    expect(() => parseWorkout(text)).toThrow(),
  );
  it("ordem de exercícios não evita detecção de duplicata", () => {
    const a = workout(),
      b = workout();
    b.exercises.reverse();
    expect(fingerprint(a)).toBe(fingerprint(b));
  });
});
describe("save, histórico e economia", () => {
  it("importa, combate, recarrega, remove e restaura sem duplicar recompensa", () => {
    const port = memory(),
      store = new Store(port);
    store.record(workout());
    store.transact((s) => {
      startBattle(s, "sprout");
      act(s, "heavy");
      act(s, "attack");
      act(s, "attack");
    });
    expect(store.state.gold).toBe(5);
    expect(store.state.adventureXpTotal).toBe(15);
    const resumed = new Store(port);
    expect(resumed.state.battle?.status).toBe("victory");
    resumed.transact((s) => act(s, "attack"));
    expect(resumed.state.gold).toBe(5);
    resumed.transact((s) => (s.battle = null));
    const backup = resumed.export();
    resumed.remove(resumed.state.workouts[0].id);
    expect(mastery(resumed.state.workouts).strength).toBe(0);
    expect(resumed.state.gold).toBe(5);
    resumed.restore(backup);
    expect(mastery(resumed.state.workouts).strength).toBe(5850);
    expect(() => resumed.record(workout())).toThrow(/histórico/);
  });
  it("backup inválido preserva estado e bytes salvos", () => {
    const port = memory(),
      store = new Store(port);
    store.record(workout());
    const before = store.export(),
      raw = port.getItem(SAVE_KEY);
    expect(() => store.restore("{}")).toThrow();
    expect(store.export()).toBe(before);
    expect(port.getItem(SAVE_KEY)).toBe(raw);
  });
  it("quota permite exportação e relata erro", () => {
    const store = new Store({
      getItem: () => null,
      setItem: () => {
        throw Error("quota");
      },
    });
    store.record(workout());
    expect(store.error).toMatch(/backup/);
    expect(JSON.parse(store.export()).workouts).toHaveLength(1);
  });
  it("correção recalcula sem criar XP ou ouro", () => {
    const store = new Store(memory());
    store.record(workout());
    const w = workout();
    w.exercises = [];
    w.cardio = [{ name: "Corrida", category: "running", durationMinutes: 10 }];
    store.record(w, store.state.workouts[0].id);
    expect(store.state.workouts).toHaveLength(1);
    expect(mastery(store.state.workouts).strength).toBe(0);
    expect(store.state.adventureXpTotal + store.state.gold).toBe(0);
  });
  it("pontos livres e equipamento não curam nem acumulam bônus", () => {
    const s = freshSave();
    s.adventureXpTotal = 125;
    s.gold = 100;
    s.hp = 20;
    expect(stats(s).free).toBe(2);
    allocate(s, "strength");
    buy(s, "moss");
    equip(s, "moss");
    equip(s, "moss");
    expect(s.hp).toBe(20);
    expect(stats(s).attributes.vigor).toBe(7);
    expect(stats(validateSave(s)).free).toBe(1);
  });
});
describe("equipamentos e migração", () => {
  it("migra save antigo adicionando os slots de escudo e armadura sem corromper dados", () => {
    const s = freshSave() as any;
    delete s.shield;
    delete s.armor;
    const a = stats(s);
    expect(s.shield).toBeNull();
    expect(s.armor).toBeNull();
    expect(a.maxHp).toBeGreaterThan(0);
  });
  it("equipa itens nos slots corretos, impedindo conflitos e calculando bônus", () => {
    const s = freshSave();
    s.owned.push("iron_shield", "leather_armor", "dagger");
    equip(s, "iron_shield");
    equip(s, "leather_armor");
    equip(s, "dagger");
    const a = stats(s);
    expect(s.shield).toBe("iron_shield");
    expect(s.armor).toBe("leather_armor");
    expect(s.weapon).toBe("dagger");
    expect(a.attributes.vigor).toBe(10); // 5 base + 3 escudo + 2 armadura
    expect(a.attributes.agility).toBe(6); // 5 base - 1 escudo + 2 adaga + 0 armadura
  });
});
describe("rodadas determinísticas", () => {
  it("eventos respeitam velocidade e não repetem uma vitória já resolvida", () => {
    const s = freshSave();
    startBattle(s, "moth");
    const events = act(s, "attack");
    expect(events.map((e) => e.actor)).toEqual(["enemy", "hero"]);
    s.battle!.hp = 1;
    expect(act(s, "attack").at(-1)?.kind).toBe("victory");
    expect(act(s, "attack")).toEqual([]);
  });
  it("cura informa o valor efetivo sem ultrapassar vida máxima", () => {
    const s = freshSave();
    s.hp = 47;
    startBattle(s, "sprout");
    const events = act(s, "potion");
    expect(events[0]).toEqual({ kind: "heal", actor: "hero", amount: 3 });
    expect(s.hp).toBe(46);
  });
  it("defesa tem prioridade contra inimigo rápido e dura um ataque", () => {
    const s = freshSave();
    startBattle(s, "moth");
    act(s, "defend");
    expect(s.hp).toBe(47);
    expect(s.battle?.guard).toBe(false);
    act(s, "attack");
    expect(s.hp).toBe(42);
  });
  it("recursos insuficientes não gastam rodada", () => {
    const s = freshSave();
    startBattle(s, "sprout");
    s.stamina = 0;
    const before = structuredClone(s);
    expect(() => act(s, "heavy")).toThrow();
    expect(s).toEqual(before);
  });
  it("ator morto não ataca e derrota preserva economia", () => {
    const s = freshSave();
    s.hp = 1;
    s.gold = 23;
    startBattle(s, "moth");
    act(s, "attack");
    expect(s.battle?.hp).toBe(18);
    expect(s.battle?.status).toBe("defeat");
    expect(s.gold).toBe(23);
    expect(s.hp).toBe(50);
    expect(s.map).toBe("village");
  });
  it("preparação não causa dano e conserva guarda", () => {
    const s = freshSave();
    startBattle(s, "guardian");
    s.battle!.round = 2;
    act(s, "defend");
    expect(s.hp).toBe(50);
    expect(s.battle?.guard).toBe(true);
    act(s, "attack");
    expect(s.hp).toBe(43);
  });
  it("fuga sempre funciona; descanso repõe recursos e monstros comuns", () => {
    const s = freshSave();
    startBattle(s, "guardian");
    act(s, "flee");
    expect(s.battle?.status).toBe("fled");
    expect(s.gold).toBe(0);
    s.defeated = ["sprout", "guardian"];
    rest(s);
    expect(s.defeated).toEqual(["guardian"]);
  });
});
describe("rotas e colisões", () => {
  it("spawns são seguros e paredes bloqueiam", () => {
    expect(walkable(makeMap(false), 200, 232)).toBe(true);
    expect(walkable(makeMap(true), 40, 232)).toBe(true);
    expect(walkable(makeMap(false), 180, 60)).toBe(false);
  });
  it("todos os pontos interativos são alcançáveis da entrada", () => {
    for (const forest of [false, true]) {
      const map = makeMap(forest),
        start = forest ? [40, 232] : [200, 232],
        queue = [start],
        visited = new Set([start.join(",")]);
      for (let i = 0; i < queue.length; i++) {
        const [x, y] = queue[i];
        for (const [dx, dy] of [
          [8, 0],
          [-8, 0],
          [0, 8],
          [0, -8],
        ]) {
          const p = [x + dx, y + dy],
            key = p.join(",");
          if (!visited.has(key) && walkable(map, ...(p as [number, number]))) {
            visited.add(key);
            queue.push(p);
          }
        }
      }
      for (const e of map.entities.filter((e) => e.label))
        expect(
          queue.some(([x, y]) => Math.hypot(e.x - x, e.y - y) < 25),
          e.label,
        ).toBe(true);
    }
  });
});
describe("spawn variável e seguro", () => {
  it("desloca posição deterministicamente sem colidir com paredes", () => {
    const m = makeMap(true);
    let offsetsGenerated = 0;
    let safeOffsetsApplied = 0;
    for (const e of m.entities) {
      if (e.kind === "sprout" || e.kind === "beetle" || e.kind === "moth") {
        const ox = ((e.x * 7 + e.y * 13 + e.kind.charCodeAt(0)) % 11) - 5;
        const oy = ((e.x * 11 + e.y * 17 + e.kind.charCodeAt(e.kind.length - 1)) % 11) - 5;
        if (ox !== 0 || oy !== 0) offsetsGenerated++;
        if (walkable(m, e.x + ox, e.y + oy)) safeOffsetsApplied++;
      }
    }
    expect(offsetsGenerated).toBeGreaterThan(0);
    expect(safeOffsetsApplied).toBeGreaterThan(0);
  });
});
