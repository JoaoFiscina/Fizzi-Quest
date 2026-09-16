import {
  attributes,
  mastery,
  zero,
  type Attribute,
  type RecordEntry,
  type Vector,
} from "./workouts";
export const items = {
  blade: {
    name: "Lâmina de aprendiz",
    slot: "weapon",
    price: 0,
    bonus: zero(),
  },
  iron: {
    name: "Espada de ferro",
    slot: "weapon",
    price: 30,
    bonus: { ...zero(), strength: 2 },
  },
  dagger: {
    name: "Adaga da trilha",
    slot: "weapon",
    price: 30,
    bonus: { ...zero(), strength: 1, agility: 2 },
  },
  hammer: {
    name: "Martelo de pedra",
    slot: "weapon",
    price: 45,
    bonus: { ...zero(), strength: 4, agility: -1 },
  },
  moss: {
    name: "Broche de musgo",
    slot: "accessory",
    price: 25,
    bonus: { ...zero(), vigor: 2 },
  },
  wind: {
    name: "Pingente do vento",
    slot: "accessory",
    price: 25,
    bonus: { ...zero(), breath: 2 },
  },
  wood_shield: {
    name: "Escudo de madeira",
    slot: "shield",
    price: 20,
    bonus: { ...zero(), vigor: 1 },
  },
  iron_shield: {
    name: "Escudo de ferro",
    slot: "shield",
    price: 50,
    bonus: { ...zero(), vigor: 3, agility: -1 },
  },
  leather_armor: {
    name: "Armadura de couro",
    slot: "armor",
    price: 25,
    bonus: { ...zero(), vigor: 2 },
  },
  chainmail: {
    name: "Cota de malha",
    slot: "armor",
    price: 60,
    bonus: { ...zero(), vigor: 4, agility: -2 },
  },
} as const;
export type ItemId = keyof typeof items;
export const enemies = {
  sprout: {
    name: "Broto Errante",
    hp: 22,
    attack: 6,
    defense: 1,
    speed: 3,
    xp: 15,
    gold: 5,
    materials: 1,
  },
  beetle: {
    name: "Besouro de Pedra",
    hp: 32,
    attack: 7,
    defense: 4,
    speed: 2,
    xp: 20,
    gold: 8,
    materials: 1,
  },
  moth: {
    name: "Mariposa da Névoa",
    hp: 18,
    attack: 7,
    defense: 1,
    speed: 8,
    xp: 18,
    gold: 7,
    materials: 1,
  },
  guardian: {
    name: "Guardião de Musgo",
    hp: 65,
    attack: 9,
    defense: 3,
    speed: 4,
    xp: 60,
    gold: 25,
    materials: 3,
  },
};
export type EnemyId = keyof typeof enemies;
export type Battle = {
  enemy: EnemyId;
  hp: number;
  round: number;
  guard: boolean;
  status: "awaiting_player" | "victory" | "defeat" | "fled";
  log: string[];
};
export type Save = {
  saveVersion: 1;
  rulesVersion: 1;
  workouts: RecordEntry[];
  adventureXpTotal: number;
  allocated: Vector;
  gold: number;
  materials: number;
  potions: number;
  owned: ItemId[];
  weapon: ItemId;
  shield: ItemId | null;
  armor: ItemId | null;
  accessory: ItemId | null;
  hp: number;
  stamina: number;
  map: "village" | "forest";
  x: number;
  y: number;
  defeated: EnemyId[];
  quest: "not_started" | "active" | "emblem_recovered" | "completed";
  guild: boolean;
  chest: boolean;
  battle: Battle | null;
  muted: boolean;
  kills: number;
};
export function freshSave(): Save {
  return {
    saveVersion: 1,
    rulesVersion: 1,
    workouts: [],
    adventureXpTotal: 0,
    allocated: zero(),
    gold: 0,
    materials: 0,
    potions: 3,
    owned: ["blade"],
    weapon: "blade",
    shield: null,
    armor: null,
    accessory: null,
    hp: 50,
    stamina: 8,
    map: "village",
    x: 200,
    y: 232,
    defeated: [],
    quest: "not_started",
    guild: false,
    chest: false,
    battle: null,
    muted: true,
    kills: 0,
  };
}
export function level(xp: number) {
  let level = 1,
    remaining = xp;
  while (remaining >= 50 + 25 * (level - 1)) {
    remaining -= 50 + 25 * (level - 1);
    level++;
  }
  return { level, xp: remaining, next: 50 + 25 * (level - 1) };
}
export function stats(s: Save) {
  if (s.shield === undefined) s.shield = null;
  if (s.armor === undefined) s.armor = null;
  const l = level(s.adventureXpTotal),
    m = mastery(s.workouts),
    a = zero();
  attributes.forEach(
    (k) =>
      (a[k] =
        5 +
        Math.floor(m[k] / 10000) +
        s.allocated[k] +
        items[s.weapon].bonus[k] +
        (s.shield ? items[s.shield].bonus[k] : 0) +
        (s.armor ? items[s.armor].bonus[k] : 0) +
        (s.accessory ? items[s.accessory].bonus[k] : 0)),
  );
  return {
    ...l,
    attributes: a,
    mastery: m,
    maxHp: 30 + 4 * a.vigor + 5 * (l.level - 1) + (s.guild ? 5 : 0),
    maxStamina: 6 + Math.floor(a.breath / 2) + Math.floor((l.level - 1) / 2),
    attack: 4 + a.strength + Math.floor((l.level - 1) / 2),
    defense: 1 + Math.floor(a.vigor / 3),
    speed: a.agility,
    free: l.level - 1 - attributes.reduce((n, k) => n + s.allocated[k], 0),
  };
}
export function clampResources(s: Save) {
  const a = stats(s);
  s.hp = Math.min(s.hp, a.maxHp);
  s.stamina = Math.min(s.stamina, a.maxStamina);
}
export function rest(s: Save) {
  const a = stats(s);
  s.hp = a.maxHp;
  s.stamina = a.maxStamina;
  s.defeated = s.defeated.filter((e) => e === "guardian");
}
export function allocate(s: Save, a: Attribute) {
  if (s.battle || stats(s).free <= 0) throw Error("Nenhum ponto disponível.");
  s.allocated[a]++;
  clampResources(s);
}
export function buy(s: Save, id: ItemId | "potion") {
  if (s.battle) throw Error("Finalize o encontro.");
  const price = id === "potion" ? 8 : items[id].price;
  if (s.gold < price) throw Error("Ouro insuficiente.");
  if (id !== "potion" && s.owned.includes(id))
    throw Error("Você já possui este equipamento.");
  s.gold -= price;
  if (id === "potion") s.potions++;
  else s.owned.push(id);
}
export function equip(s: Save, id: ItemId) {
  if (s.battle || !s.owned.includes(id))
    throw Error("Equipamento indisponível.");
  const slot = items[id].slot;
  if (slot === "weapon") s.weapon = id;
  else if (slot === "shield") s.shield = id;
  else if (slot === "armor") s.armor = id;
  else s.accessory = id;
  clampResources(s);
}
export function startBattle(s: Save, id: EnemyId) {
  if (s.battle || s.defeated.includes(id)) return;
  s.battle = {
    enemy: id,
    hp: enemies[id].hp,
    round: 1,
    guard: false,
    status: "awaiting_player",
    log: ["O caminho se agita. Prepare-se!"],
  };
}
export function intent(b: Battle) {
  if (b.enemy === "beetle" && b.round % 2 === 1)
    return "Fecha a carapaça · defesa +4";
  if (b.enemy === "guardian")
    return b.round % 3 === 2
      ? "Reúne raízes · prepara sem atacar"
      : b.round % 3 === 0
        ? "Golpe de raízes · dano duplo"
        : "Vai investir";
  return "Vai investir";
}
export type Action =
  | "attack"
  | "heavy"
  | "recover"
  | "defend"
  | "potion"
  | "flee"
  | "quick"
  | "impact";
export type CombatEvent = {
  kind:
    | "damage"
    | "heal"
    | "recover"
    | "guard"
    | "prepare"
    | "flee"
    | "victory"
    | "defeat";
  actor: "hero" | "enemy";
  amount?: number;
  heavy?: boolean;
};
export function act(s: Save, action: Action): CombatEvent[] {
  const events: CombatEvent[] = [];
  const b = s.battle;
  if (!b || b.status !== "awaiting_player") return events;
  const a = stats(s),
    e = enemies[b.enemy],
    cost =
      action === "heavy"
        ? 3
        : action === "quick"
          ? 2
          : action === "impact"
            ? 4
            : 0;
  if (
    s.stamina < cost ||
    (action === "potion" && s.potions < 1) ||
    (action === "quick" && a.level < 2) ||
    (action === "impact" && a.level < 3)
  )
    throw Error("Recursos ou nível insuficientes.");
  b.log = [];
  if (action === "flee") {
    b.status = "fled";
    b.log = ["Você recua em segurança."];
    return [{ kind: "flee", actor: "hero" }];
  }
  const shell = b.enemy === "beetle" && b.round % 2 === 1,
    preparing = b.enemy === "guardian" && b.round % 3 === 2;
  if (action === "defend") {
    b.guard = true;
    b.log.push("Você ergue a guarda.");
    events.push({ kind: "guard", actor: "hero" });
  }
  const player = () => {
    if (s.hp <= 0) return;
    s.stamina -= cost;
    if (action === "recover") {
      const amount = Math.min(4, a.maxStamina - s.stamina);
      s.stamina += amount;
      b.log.push(`Você recupera ${amount} de fôlego.`);
      events.push({ kind: "recover", actor: "hero", amount });
    } else if (action === "potion") {
      s.potions--;
      const amount = Math.min(20, a.maxHp - s.hp);
      s.hp += amount;
      b.log.push(`Poção usada: +${amount} de vida.`);
      events.push({ kind: "heal", actor: "hero", amount });
    } else if (action !== "defend") {
      const base = Math.max(
        1,
        a.attack - (action === "impact" ? 0 : e.defense + (shell ? 4 : 0)),
      );
      const damage = Math.max(
        1,
        Math.floor(
          base *
            (action === "heavy"
              ? 1.6
              : action === "quick"
                ? 1.1
                : action === "impact"
                  ? 1.3
                  : 1),
        ),
      );
      b.hp = Math.max(0, b.hp - damage);
      b.log.push(`Você causa ${damage} de dano.`);
      events.push({
        kind: "damage",
        actor: "hero",
        amount: damage,
        heavy: action === "heavy" || action === "impact",
      });
    }
  };
  const enemy = () => {
    if (b.hp <= 0) return;
    if (shell || preparing) {
      b.log.push(shell ? "A carapaça resiste." : "Raízes se acumulam no chão.");
      events.push({ kind: "prepare", actor: "enemy" });
      return;
    }
    let damage =
      Math.max(1, e.attack - a.defense) *
      (b.enemy === "guardian" && b.round % 3 === 0 ? 2 : 1);
    if (b.guard) {
      damage = Math.ceil(damage / 2);
      b.guard = false;
    }
    s.hp = Math.max(0, s.hp - damage);
    b.log.push(`${e.name} causa ${damage} de dano.`);
    events.push({
      kind: "damage",
      actor: "enemy",
      amount: damage,
      heavy: b.enemy === "guardian" && b.round % 3 === 0,
    });
  };
  if (action === "defend") {
    enemy();
  } else if (a.speed + (action === "quick" ? 5 : 0) >= e.speed) {
    player();
    enemy();
  } else {
    enemy();
    player();
  }
  if (b.hp <= 0) {
    b.status = "victory";
    s.adventureXpTotal += e.xp;
    s.gold += e.gold;
    s.materials += e.materials;
    s.defeated.push(b.enemy);
    s.kills = (s.kills || 0) + 1;
    if (b.enemy === "guardian" && s.quest !== "completed")
      s.quest = "emblem_recovered";
    b.log.push(
      `Vitória! +${e.xp} XP · +${e.gold} ouro · +${e.materials} material.`,
    );
    events.push({ kind: "victory", actor: "hero" });
  } else if (s.hp <= 0) {
    b.status = "defeat";
    s.map = "village";
    s.x = 200;
    s.y = 232;
    rest(s);
    b.log.push("A guilda cuida de você. Nenhum progresso perdido.");
    events.push({ kind: "defeat", actor: "hero" });
  } else b.round++;
  return events;
}
