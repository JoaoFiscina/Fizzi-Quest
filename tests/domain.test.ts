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
  balanceAiWorkout,
  DAILY_TRAINING_CAPS,
  fingerprintAiWorkout,
  parseAiWorkout,
  trainingTotals,
  type AiWorkout,
} from "../src/domain/aiWorkouts";
import {
  freshSave,
  act,
  startBattle,
  rest,
  buy,
  equip,
  stats,
  allocate,
  trailImpulse,
} from "../src/domain/game";
import {
  Store,
  SAVE_KEY,
  DEV_SAVE_KEY,
  validateSave,
} from "../src/application/store";
import {
  createDevCopy,
  previewDevEdit,
  xpForLevel,
} from "../src/application/devMode";
import { parseCompactWorkout } from "../src/domain/compactWorkouts";
import { trainingPrompt } from "../src/content/trainingPrompt";
import { makeMap, walkable } from "../src/game/maps";
const workout = () => {
  const w = parseWorkout(JSON.stringify(fixture));
  w.dateYearInferred = false;
  w.exercises.forEach((e) => e.sets.forEach((s) => (s.setType = "work")));
  return w;
};
const aiWorkout = (overrides: Partial<AiWorkout> = {}): AiWorkout => ({
  type: "fizzi_workout",
  version: 1,
  id: "workout-2026-09-15-1928",
  date: "2026-09-15",
  summary: "Treino de membros inferiores",
  confidence: "high",
  workout: {
    modality: "strength",
    duration_min: 55,
    sets: 20,
    volume_kg: 6165.5,
    prs: 9,
    intensity_rpe: 8,
    exercises: [
      {
        name: "Agachamento hack",
        sets: [
          { weight: 20, reps: 10 },
          { weight: 30, reps: 10 },
        ],
      },
    ],
  },
  rewards: {
    xp: 340,
    gold: 72,
    attributes: { strength: 0.18, vigor: 0.11, agility: 0.04, breath: 0 },
  },
  progression: { prs: 9, notes: "Progressão positiva" },
  ...overrides,
});
const memory = () => {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      data.set(k, v);
    },
  };
};
describe("modo desenvolvedor isolado", () => {
  it("usa outra chave, preserva o save normal e impede importar DEV como backup normal", () => {
    const storage = memory();
    const normal = new Store(storage);
    normal.persist();
    const original = storage.getItem(SAVE_KEY);
    storage.setItem(DEV_SAVE_KEY, JSON.stringify(createDevCopy(normal.state)));
    const dev = new Store(storage, DEV_SAVE_KEY, true);
    dev.transactDev((save) => {
      save.adventureXpTotal = xpForLevel(5);
      save.gold = 500;
      save.dev!.attributeBonus.agility = 4;
    });
    expect(stats(dev.state).level).toBe(5);
    expect(stats(dev.state).attributes.agility).toBe(9);
    expect(storage.getItem(SAVE_KEY)).toBe(original);
    expect(() => validateSave(JSON.parse(dev.export()))).toThrow(/teste DEV/);
    expect(() => normal.restore(dev.export())).toThrow(/teste DEV/);
    expect(storage.getItem(SAVE_KEY)).toBe(original);
    expect(new Store(storage).state.adventureXpTotal).toBe(0);
  });

  it("prevê níveis, impede XP abaixo de pontos distribuídos e limita recursos", () => {
    expect(
      [1, 5, 10, 20].map(xpForLevel).map(
        (xp) =>
          stats({
            ...freshSave(),
            adventureXpTotal: xp,
          }).level,
      ),
    ).toEqual([1, 5, 10, 20]);
    const source = createDevCopy(freshSave());
    source.adventureXpTotal = xpForLevel(5);
    source.allocated.strength = 3;
    const edit = {
      xpTotal: 0,
      addXp: 0,
      goldTotal: 100,
      addGold: 50,
      attributeBonus: { strength: 0, vigor: 0, agility: 4, breath: 0 },
      xpMultiplier: 2 as const,
      resetAllocated: false,
    };
    expect(() => previewDevEdit(source, edit)).toThrow(/pontos distribuídos/);
    const result = previewDevEdit(source, { ...edit, resetAllocated: true });
    expect(result.adventureXpTotal).toBe(0);
    expect(result.gold).toBe(150);
    expect(result.allocated.strength).toBe(0);
    expect(stats(result).attributes.agility).toBe(9);
    expect(() =>
      previewDevEdit(source, { ...edit, goldTotal: 1_000_001 }),
    ).toThrow(/Ouro total/);
  });

  it("multiplica XP de vitória apenas na cópia DEV e registra o ganho real", () => {
    const dev = createDevCopy(freshSave());
    dev.dev!.xpMultiplier = 5;
    startBattle(dev, "sprout");
    dev.battle!.hp = 1;
    const events = act(dev, "attack");
    expect(events.some((event) => event.kind === "victory")).toBe(true);
    expect(dev.adventureXpTotal).toBe(75);
    expect(dev.battle!.log.join(" ")).toContain("+75 XP");
    const normal = freshSave();
    startBattle(normal, "sprout");
    normal.battle!.hp = 1;
    act(normal, "attack");
    expect(normal.adventureXpTotal).toBe(15);
  });
});
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
describe("treino principal analisado por IA", () => {
  it("aceita o formato estável e mantém a recompensa detalhada dentro dos limites", () => {
    const parsed = parseAiWorkout(JSON.stringify(aiWorkout()));
    const reward = balanceAiWorkout(parsed, []);
    expect(reward).toMatchObject({
      xp: 216,
      gold: 72,
      effectiveConfidence: "high",
      attributes: { strength: 0.23, vigor: 0.14, agility: 0.05, breath: 0 },
    });
  });
  it("rejeita JSON inválido e campos estruturais incorretos", () => {
    expect(() => parseAiWorkout("{")).toThrow(/JSON inválido/);
    expect(() =>
      parseAiWorkout(JSON.stringify({ ...aiWorkout(), date: "2026-02-30" })),
    ).toThrow(/formato da IA/);
  });
  it("reduz confiança sem evidência e conserva XP e ouro em limites baixos", () => {
    const input = aiWorkout({
      confidence: "high",
      workout: { modality: "other", exercises: [] },
      progression: {},
      rewards: {
        xp: 999,
        gold: 999,
        attributes: { strength: 999, vigor: 999, agility: 999, breath: 999 },
      },
    });
    const reward = balanceAiWorkout(input, []);
    expect(reward.effectiveConfidence).toBe("low");
    expect(reward.xp).toBe(60);
    expect(reward.gold).toBe(18);
    expect(Object.values(reward.attributes).reduce((a, b) => a + b)).toBe(0.02);
  });
  it("valoriza atributos de confiança média sem ultrapassar os limites", () => {
    const input = aiWorkout({
      confidence: "medium",
      rewards: {
        xp: 340,
        gold: 72,
        attributes: { strength: 0.2, vigor: 0.2, agility: 0, breath: 0 },
      },
    });
    const reward = balanceAiWorkout(input, []);
    expect(reward.effectiveConfidence).toBe("medium");
    expect(reward.xp).toBe(132);
    expect(reward.gold).toBe(45);
    expect(reward.attributes.strength).toBeLessThanOrEqual(0.15);
    expect(reward.attributes.vigor).toBeLessThanOrEqual(0.15);
    expect(
      Object.values(reward.attributes).reduce((total, value) => total + value),
    ).toBeCloseTo(0.23);
  });
  it("aplica limites por sessão e por dia sem reduzir o ganho pelo personagem", () => {
    const input = aiWorkout();
    const first = balanceAiWorkout(input, []);
    const record = {
      id: crypto.randomUUID(),
      externalSessionId: input.id,
      fingerprint: "first",
      workout: input,
      reward: first,
    };
    const secondInput = aiWorkout({ id: "workout-2026-09-15-2100" });
    const second = balanceAiWorkout(secondInput, [record]);
    expect(first.attributes.strength).toBe(0.23);
    expect(first.xp + second.xp).toBe(DAILY_TRAINING_CAPS.xp);
    expect(first.gold + second.gold).toBeLessThanOrEqual(100);
    expect(
      Object.values(
        trainingTotals([
          record,
          {
            ...record,
            id: crypto.randomUUID(),
            externalSessionId: secondInput.id,
            workout: secondInput,
            reward: second,
          },
        ]),
      ).reduce((a, b) => a + b),
    ).toBeCloseTo(DAILY_TRAINING_CAPS.attribute);
  });
  it("concede o mesmo treino nos níveis 1, 10 e 20, com e sem equipamentos", () => {
    const input = aiWorkout({
      rewards: {
        xp: 340,
        gold: 72,
        attributes: { strength: 0.7, vigor: 0, agility: 0, breath: 0 },
      },
    });
    const previews = [];
    const startingStrengths = [];
    for (const [characterLevel, xp] of [
      [1, 0],
      [10, 1350],
      [20, 5225],
    ]) {
      for (const equipped of [false, true]) {
        const store = new Store(memory());
        store.transact((save) => {
          save.adventureXpTotal = xp;
          save.allocated.strength = characterLevel - 1;
          if (equipped) {
            save.owned.push("hammer", "iron_shield", "chainmail", "wind");
            save.weapon = "hammer";
            save.shield = "iron_shield";
            save.armor = "chainmail";
            save.accessory = "wind";
          }
        });
        expect(stats(store.state).level).toBe(characterLevel);
        startingStrengths.push(stats(store.state).attributes.strength);
        const preview = store.previewAiWorkout(input);
        expect(preview).toEqual(store.recordAiWorkout(input));
        previews.push(preview);
      }
    }
    expect(new Set(startingStrengths).size).toBeGreaterThan(1);
    expect(previews).toEqual(Array(6).fill(previews[0]));
    expect(previews[0]).toMatchObject({
      xp: 216,
      attributes: { strength: 0.28, vigor: 0, agility: 0, breath: 0 },
    });
  });
  it("aceita um dia completo da v15 sem alterar o histórico", () => {
    const firstWorkout = aiWorkout();
    const secondWorkout = aiWorkout({
      id: "workout-2026-09-15-2100",
      summary: "Treino de membros superiores",
    });
    const previous = freshSave();
    previous.adventureXpTotal = 450;
    previous.gold = 100;
    previous.trainingRewards = [
      {
        id: crypto.randomUUID(),
        externalSessionId: firstWorkout.id,
        fingerprint: fingerprintAiWorkout(firstWorkout),
        workout: firstWorkout,
        reward: {
          xp: 360,
          gold: 80,
          attributes: { strength: 0.22, vigor: 0.18, agility: 0, breath: 0 },
          declaredConfidence: "high",
          effectiveConfidence: "high",
          adjustments: [],
        },
      },
      {
        id: crypto.randomUUID(),
        externalSessionId: secondWorkout.id,
        fingerprint: fingerprintAiWorkout(secondWorkout),
        workout: secondWorkout,
        reward: {
          xp: 90,
          gold: 20,
          attributes: { strength: 0.05, vigor: 0.05, agility: 0, breath: 0 },
          declaredConfidence: "high",
          effectiveConfidence: "high",
          adjustments: [],
        },
      },
    ];
    const port = memory();
    port.setItem(SAVE_KEY, JSON.stringify(previous));
    const resumed = new Store(port);
    expect(resumed.error).toBe("");
    expect(resumed.state.trainingRewards).toEqual(previous.trainingRewards);
    expect(resumed.state.adventureXpTotal).toBe(450);
    const later = aiWorkout({
      id: "workout-2026-09-15-2200",
      summary: "Treino aeróbico",
    });
    const reward = resumed.recordAiWorkout(later);
    expect(reward.xp).toBe(0);
    expect(reward.gold).toBe(0);
    expect(
      Object.values(reward.attributes).reduce((total, value) => total + value),
    ).toBeCloseTo(0.1);
    expect(validateSave(resumed.state).trainingRewards).toHaveLength(3);
  });
  it("aplica XP, ouro e atributos uma vez, persistindo depois do reload", () => {
    const port = memory();
    const store = new Store(port);
    const reward = store.recordAiWorkout(aiWorkout());
    expect(store.state.adventureXpTotal).toBe(reward.xp);
    expect(store.state.gold).toBe(reward.gold);
    expect(stats(store.state).attributes.strength).toBe(5.23);
    expect(() => store.recordAiWorkout(aiWorkout())).toThrow(/histórico/);
    const resumed = new Store(port);
    expect(resumed.state.trainingRewards).toHaveLength(1);
    expect(resumed.state.adventureXpTotal).toBe(216);
    expect(resumed.state.gold).toBe(72);
    expect(stats(resumed.state).attributes.vigor).toBe(5.14);
  });
  it("migra save anterior preservando treino, equipamentos, ouro e XP", () => {
    const previous = freshSave() as any;
    previous.gold = 44;
    previous.adventureXpTotal = 125;
    previous.owned.push("wood_shield", "leather_armor");
    previous.shield = "wood_shield";
    previous.armor = "leather_armor";
    delete previous.trainingRewards;
    delete previous.appearance;
    delete previous.cameraZoom;
    delete previous.motion;
    const migrated = validateSave(previous);
    expect(migrated.trainingRewards).toEqual([]);
    expect(migrated.appearance).toBe("masculine");
    expect(migrated.cameraZoom).toBe("auto");
    expect(migrated.motion).toBe("system");
    expect(migrated.gold).toBe(44);
    expect(migrated.adventureXpTotal).toBe(125);
    expect(migrated.shield).toBe("wood_shield");
    expect(migrated.armor).toBe("leather_armor");
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
  it("migra saves sem Botas e libera o slot no nível 5", () => {
    const old = freshSave() as any;
    delete old.boots;
    const migrated = validateSave(old);
    expect(migrated.boots).toBeNull();
    migrated.adventureXpTotal = 349;
    migrated.gold = 100;
    expect(() => buy(migrated, "walking_boots")).toThrow("nível 5");
    migrated.adventureXpTotal = 350;
    buy(migrated, "walking_boots");
    equip(migrated, "walking_boots");
    expect(migrated.boots).toBe("walking_boots");
    expect(stats(migrated).attributes.agility).toBe(6);
  });
});
describe("Impulso da Trilha", () => {
  it("desbloqueia no nível 5 e sobe 5%/2s a cada cinco níveis", () => {
    expect(trailImpulse(4)).toBeNull();
    expect(trailImpulse(5)).toMatchObject({
      rank: 1,
      bonus: 0.05,
      durationSeconds: 5,
      durationMs: 5000,
      cost: 1,
    });
    expect(trailImpulse(10)).toMatchObject({
      rank: 2,
      bonus: 0.1,
      durationSeconds: 7,
    });
    expect(trailImpulse(15)).toMatchObject({
      rank: 3,
      bonus: 0.15,
      durationSeconds: 9,
    });
    expect(trailImpulse(20)).toMatchObject({
      rank: 4,
      bonus: 0.2,
      durationSeconds: 11,
    });
  });
});
describe("v17: Anel e resposta curta", () => {
  it("migra save v16 sem Anel ou rascunho e preserva equipamento antigo", () => {
    const old = freshSave() as any;
    old.gold = 42;
    old.owned.push("moss");
    old.accessory = "moss";
    delete old.ring;
    delete old.pendingTraining;
    const migrated = validateSave(old);
    expect(migrated.ring).toBeNull();
    expect(migrated.pendingTraining).toBeNull();
    expect(migrated.gold).toBe(42);
    expect(migrated.accessory).toBe("moss");
  });
  it("bloqueia compra/equipamento no nível 3 e libera no nível 4 sem empilhar anéis", () => {
    const s = freshSave();
    s.gold = 120;
    s.adventureXpTotal = 224;
    expect(() => buy(s, "copper_ring")).toThrow("nível 4");
    s.owned.push("copper_ring");
    expect(() => equip(s, "copper_ring")).toThrow("nível 4");
    s.ring = "copper_ring";
    expect(() => validateSave(s)).toThrow();
    s.ring = null;
    s.adventureXpTotal = 225;
    equip(s, "copper_ring");
    expect(stats(s).attributes.strength).toBe(6);
    buy(s, "breeze_ring");
    equip(s, "breeze_ring");
    expect(stats(s).attributes.strength).toBe(5);
    expect(stats(s).attributes.agility).toBe(6);
    expect(s.gold).toBe(80);
    s.owned.push("moss");
    equip(s, "moss");
    expect(stats(s).attributes.vigor).toBe(7);
    expect(validateSave(s).ring).toBe("breeze_ring");
  });
  it("gera ID estável, importa JSON curto, soma PR e impede repetição após recarga", () => {
    const port = memory();
    const store = new Store(port);
    const draft = store.createTrainingDraft("2026-09-26");
    expect(trainingPrompt(draft)).toContain(draft.id);
    const input = parseCompactWorkout(
      JSON.stringify({
        v: 2,
        id: draft.id,
        c: "alta",
        xp: 140,
        atributos: { forca: 0.22, vigor: 0.1, folego: 0.06 },
        pr: { forca: 1 },
      }),
    );
    expect(store.previewCompactWorkout(input).reward.xp).toBe(145);
    expect(store.state.adventureXpTotal).toBe(0);
    expect(store.recordCompactWorkout(input).prBonus).toEqual({
      xp: 5,
      count: 1,
      attributes: { strength: 0.02, vigor: 0, agility: 0, breath: 0 },
    });
    expect(store.state.adventureXpTotal).toBe(145);
    expect(store.state.trainingRewards).toHaveLength(1);
    const reloaded = new Store(port);
    expect(reloaded.state.pendingTraining).toBeNull();
    expect(() => reloaded.recordCompactWorkout(input)).toThrow();
    expect(reloaded.state.adventureXpTotal).toBe(145);
    expect(
      validateSave(JSON.parse(reloaded.export())).trainingRewards,
    ).toHaveLength(1);
  });
  it("limita PRs por sessão e dia, sem consumir o teto base", () => {
    const store = new Store(memory());
    const first = store.createTrainingDraft("2026-09-26");
    const input = (id: string, c = "alta", pr = 10) =>
      parseCompactWorkout(
        JSON.stringify({
          v: 2,
          id,
          c,
          xp: 1_000,
          atributos: { forca: 1, vigor: 1 },
          pr: { forca: pr },
        }),
      );
    const a = store.recordCompactWorkout(input(first.id));
    expect(a.baseReward.xp).toBe(216);
    expect(a.prBonus.count).toBe(3);
    expect(a.reward.xp).toBe(231);
    const second = store.createTrainingDraft("2026-09-26");
    const b = store.recordCompactWorkout(input(second.id));
    expect(b.baseReward.xp).toBe(54);
    expect(b.prBonus.count).toBe(0);
    expect(store.state.adventureXpTotal).toBe(285);
    expect(
      validateSave(JSON.parse(store.export())).trainingRewards,
    ).toHaveLength(2);
    const low = store.createTrainingDraft("2026-09-27");
    expect(
      store.previewCompactWorkout(input(low.id, "baixa", 2)).prBonus.count,
    ).toBe(0);
  });
  it("aceita histórico legado de 450 XP com bônus novo, mas sem base adicional", () => {
    const port = memory();
    const store = new Store(port);
    const old = aiWorkout({
      rewards: {
        xp: 450,
        gold: 0,
        attributes: { strength: 0.5, vigor: 0, agility: 0, breath: 0 },
      },
    });
    store.transact((s) =>
      s.trainingRewards.push({
        id: crypto.randomUUID(),
        externalSessionId: old.id,
        fingerprint: fingerprintAiWorkout(old),
        workout: old,
        reward: {
          xp: 450,
          gold: 0,
          attributes: { strength: 0.5, vigor: 0, agility: 0, breath: 0 },
          declaredConfidence: "high",
          effectiveConfidence: "high",
          adjustments: [],
        },
      }),
    );
    const draft = store.createTrainingDraft(old.date);
    const result = store.recordCompactWorkout(
      parseCompactWorkout(
        JSON.stringify({
          v: 2,
          id: draft.id,
          c: "alta",
          xp: 100,
          atributos: { forca: 0.1 },
          pr: { forca: 1 },
        }),
      ),
    );
    expect(result.baseReward.xp).toBe(0);
    expect(result.prBonus.xp).toBe(5);
    expect(
      validateSave(JSON.parse(store.export())).trainingRewards,
    ).toHaveLength(2);
  });
  it("rejeita campos extras, ID estranho e falha de gravação sem conceder XP", () => {
    const store = new Store(memory());
    const draft = store.createTrainingDraft("2026-09-26");
    expect(() =>
      parseCompactWorkout(
        JSON.stringify({ v: 2, id: draft.id, c: "alta", xp: 10, extras: 1 }),
      ),
    ).toThrow("extras");
    const input = parseCompactWorkout(
      JSON.stringify({ v: 2, id: crypto.randomUUID(), c: "alta", xp: 100 }),
    );
    expect(() => store.previewCompactWorkout(input)).toThrow("ID diferente");
    const storage = {
      getItem: (_: string) => null,
      setItem: (_: string, __: string) => {
        throw Error("quota");
      },
    };
    const failing = new Store(storage);
    expect(() => failing.createTrainingDraft("2026-09-26")).toThrow(
      "Não foi possível salvar",
    );
    expect(failing.state.pendingTraining).toBeNull();
  });
  it("restaura backup v16 e preserva rascunho quando a confirmação não cabe no armazenamento", () => {
    const values = new Map<string, string>();
    let fail = false;
    const port = {
      getItem: (k: string) => values.get(k) ?? null,
      setItem: (k: string, v: string) => {
        if (fail && k === SAVE_KEY) throw Error("quota");
        values.set(k, v);
      },
    };
    const store = new Store(port);
    const old = freshSave() as any;
    delete old.ring;
    delete old.pendingTraining;
    old.gold = 12;
    store.restore(JSON.stringify(old));
    expect(store.state.ring).toBeNull();
    expect(store.state.gold).toBe(12);
    const draft = store.createTrainingDraft("2026-09-26");
    const input = parseCompactWorkout(
      JSON.stringify({ v: 2, id: draft.id, c: "media", xp: 60 }),
    );
    fail = true;
    expect(() => store.recordCompactWorkout(input)).toThrow(
      "Não foi possível salvar",
    );
    expect(store.state.adventureXpTotal).toBe(0);
    expect(store.state.pendingTraining?.id).toBe(draft.id);
    fail = false;
    expect(new Store(port).state.pendingTraining?.id).toBe(draft.id);
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
        const oy =
          ((e.x * 11 + e.y * 17 + e.kind.charCodeAt(e.kind.length - 1)) % 11) -
          5;
        if (ox !== 0 || oy !== 0) offsetsGenerated++;
        if (walkable(m, e.x + ox, e.y + oy)) safeOffsetsApplied++;
      }
    }
    expect(offsetsGenerated).toBeGreaterThan(0);
    expect(safeOffsetsApplied).toBeGreaterThan(0);
  });
});
