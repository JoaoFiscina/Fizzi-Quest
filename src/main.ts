import Phaser from "phaser";
import "./style.css";
import "./polish.css";
import { GAME_VERSION } from "./version";
import { Store } from "./application/store";
import { World } from "./game/world";
import {
  act,
  allocate,
  buy,
  equip,
  enemies,
  items,
  rest,
  startBattle,
  stats,
  intent,
  type Action,
  type ItemId,
  type EnemyId,
  type Save,
  type CombatEvent,
} from "./domain/game";
import { attributes } from "./domain/workouts";
import { el, button, bar, labels, fmt } from "./ui/dom";
import { workoutsUI } from "./ui/workouts";
import { TUTORIAL_TOPICS } from "./content/tutorial";
let storage: Storage;
try {
  storage = localStorage;
} catch {
  storage = {
    getItem: () => {
      throw Error("Storage unavailable");
    },
    setItem: () => {
      throw Error("Storage unavailable");
    },
  } as unknown as Storage;
}
const store = new Store(storage),
  world = new World(store),
  app = document.querySelector<HTMLDivElement>("#app")!;
const canvas = el("div", "", "world");
canvas.id = "world";
app.append(canvas);
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "world",
  backgroundColor: "#183d35",
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  scene: [world],
  render: { antialias: false },
});
// @ts-ignore
window.__PHASER_GAME__ = game;
const hud = el("header", "", "hud"),
  place = el("div", "", "place"),
  nav = el("nav", "", "nav"),
  toast = el("div", "", "toast");
toast.setAttribute("role", "status");
const storageError = el("div", "", "storage-error");
storageError.setAttribute("role", "alert");
const modal = el("dialog"),
  modalHead = el("div", "", "modal-head"),
  modalTitle = el("h2"),
  content = el("div", "", "modal-content");
modal.append(modalHead, content);
modalHead.append(modalTitle, button("✕", closeModal, "close"));
modalHead.lastElementChild!.setAttribute("aria-label", "Fechar menu");
const interact = button("Explorar", () => world.interact(), "interact");
interact.disabled = true;
const controls = el("div", "", "controls"),
  dpad = el("div", "", "dpad");
for (const [key, label, cls] of [
  ["character", "Personagem", "character-btn"],
  ["workouts", "Treinos", "workouts-btn"],
  ["bag", "Mochila", "bag-btn"],
  ["map", "Mapa", "map-button map-btn"],
  ["tutorial", "Tutorial", "tutorial-btn"],
  ["settings", "Ajustes", "settings-btn"],
] as const) {
  const b = button(
    label,
    () => {
      if (store.state.battle) return;
      if (key === "character") character();
      else if (key === "workouts") {
        openModal("Diário de treinos");
        workoutsUI(store, content, notify);
      } else if (key === "bag") equipment(false);
      else if (key === "map") worldMap();
      else if (key === "tutorial") tutorial();
      else if (key === "settings") settings();
    },
    cls,
  );
  b.dataset.section = key;
  nav.append(b);
}
for (const [key, label, cls] of [
  ["w+a", "↖", "up-left"],
  ["w", "↑", "up"],
  ["w+d", "↗", "up-right"],
  ["a", "←", "left"],
  ["d", "→", "right"],
  ["s+a", "↙", "down-left"],
  ["s", "↓", "down"],
  ["s+d", "↘", "down-right"],
]) {
  const b = button(label, () => {}, cls);
  b.setAttribute(
    "aria-label",
    {
      "w+a": "Mover na diagonal para cima e esquerda",
      w: "Mover para cima",
      "w+d": "Mover na diagonal para cima e direita",
      a: "Mover para esquerda",
      d: "Mover para direita",
      "s+a": "Mover na diagonal para baixo e esquerda",
      s: "Mover para baixo",
      "s+d": "Mover na diagonal para baixo e direita",
    }[key]!,
  );
  b.onpointerdown = (e) => {
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    if (!world.paused) world.touch = key;
  };
  b.onpointerup = b.onpointercancel = () => (world.touch = "");
  dpad.append(b);
}
controls.append(dpad, interact);
app.append(hud, place, nav, controls, toast, storageError, modal);
let started = false,
  busy = false;
let toastTimer: ReturnType<typeof setTimeout>;
let visualState: Save | null = null;
function notify(text: string) {
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 4500);
}
function safe(fn: () => void) {
  try {
    fn();
  } catch (e) {
    notify((e as Error).message);
  }
}
function openModal(title: string) {
  world.setPaused(true);
  store.persist();
  modalTitle.textContent = title;
  content.replaceChildren();
  content.className = "modal-content";
  if (!modal.open) modal.showModal();
}
function closeModal() {
  if (busy) return;
  modal.close();
  world.setPaused(!started || Boolean(store.state.battle));
  if (store.state.battle) {
    world.showBattle();
    battle();
  }
}
modal.addEventListener("cancel", (e) => {
  e.preventDefault();
  closeModal();
});
function renderHUD() {
  const s = visualState ?? store.state,
    a = stats(s);
  hud.replaceChildren();
  const crest = el("div", "FQ", "crest");
  const info = el("div", "", "vitals");
  info.append(
    el(
      "strong",
      `${s.appearance === "feminine" ? "Aventureira" : "Aventureiro"} · Nv. ${a.level}`,
    ),
  );

  const hp = el("div", "", "resource");
  const hpLabel = el("span", "Vida", "hud-icon");
  const hpVal = el("span", `${s.hp}/${a.maxHp}`, "resource-value");
  hp.append(hpLabel, bar(s.hp, a.maxHp), hpVal);

  const stamina = el("div", "", "resource");
  const stLabel = el("span", "Fôlego", "hud-icon");
  const stVal = el("span", `${s.stamina}/${a.maxStamina}`, "resource-value");
  stamina.append(stLabel, bar(s.stamina, a.maxStamina, "stamina"), stVal);

  info.append(hp, stamina);

  const equipment = el("div", "", "hud-equipment");
  const equipped = (slot: string, name: string, filled: boolean) => {
    const item = el("span", "", `equip-slot${filled ? " equipped" : ""}`);
    item.title = name;
    item.append(el("b", slot), el("small", name));
    return item;
  };
  equipment.append(
    equipped("ARMA", items[s.weapon].name, true),
    equipped(
      "ESC",
      s.shield ? items[s.shield].name : "Sem escudo",
      Boolean(s.shield),
    ),
    equipped(
      "ARM",
      s.armor ? items[s.armor].name : "Sem armadura",
      Boolean(s.armor),
    ),
  );
  const loot = el("div", "", "hud-loot");
  loot.append(
    el("span", `Ouro ${s.gold}`, "gold"),
    el("span", `Mat. ${s.materials}`, "materials-icon"),
    el("span", `Poções ${s.potions}`, "potions-icon"),
  );

  hud.append(crest, info, equipment, loot);
  place.replaceChildren(
    el("small", "A TRILHA ESQUECIDA"),
    el("strong", s.map === "village" ? "Vila da Guilda" : "Bosque das Brumas"),
  );
  storageError.textContent = store.error;
  storageError.hidden = !store.error;
  world.sync();
}
store.subscribe(renderHUD);
function character() {
  const s = store.state;
  openModal(
    s.appearance === "feminine" ? "Sua aventureira" : "Seu aventureiro",
  );
  const a = stats(s);
  content.classList.add("character-sheet");
  const overview = el("section", "", "character-overview");
  const levelCopy = el("div");
  levelCopy.append(
    el("small", "JORNADA DO AVENTUREIRO", "eyebrow-inline"),
    el("h3", `Nível ${a.level}`),
    el("p", `${a.xp}/${a.next} XP até o próximo nível`, "muted"),
    bar(a.xp, a.next, "xp"),
  );
  const wealth = el("div", "", "character-wealth");
  wealth.append(
    el("strong", `${s.gold} ouro`),
    el(
      "small",
      `${s.trainingRewards.length + s.workouts.length} treino(s) registrados`,
    ),
  );
  overview.append(levelCopy, wealth);
  const equipmentLine = el("section", "", "character-equipment");
  equipmentLine.append(
    el("small", "EQUIPAMENTOS", "eyebrow-inline"),
    el(
      "p",
      `${items[s.weapon].name} · ${s.shield ? items[s.shield].name : "sem escudo"} · ${s.armor ? items[s.armor].name : "sem armadura"}`,
    ),
  );
  content.append(
    overview,
    equipmentLine,
    el("p", `${a.free} ponto(s) livre(s). A alocação é permanente.`, "muted"),
  );
  attributes.forEach((k) => {
    const row = el("section", "", "attribute-card");
    const breakdown = a.attributeBreakdown[k];
    const progress = (a.attributes[k] - Math.floor(a.attributes[k])) * 100;
    const h3 = el("h3");
    h3.append(
      el("span", labels[k]),
      el("span", fmt(a.attributes[k]), "attr-value"),
    );
    row.append(
      h3,
      bar(progress, 100, "attribute-progress"),
      el(
        "p",
        `${fmt(progress)}% para ${Math.floor(a.attributes[k]) + 1}`,
        "muted",
      ),
    );
    const source = el("details", "", "attribute-source");
    source.append(
      el("summary", "Origem do atributo"),
      el(
        "p",
        `Base ${fmt(breakdown.base)} · Treinos ${fmt(breakdown.legacy + breakdown.training)} · Pontos ${fmt(breakdown.allocated)} · Equipamentos ${breakdown.equipment >= 0 ? "+" : ""}${fmt(breakdown.equipment)}`,
      ),
    );
    row.append(source);
    const recent = [...s.trainingRewards]
      .sort((left, right) =>
        right.workout.date.localeCompare(left.workout.date),
      )
      .filter((record) => record.reward.attributes[k] > 0)
      .slice(0, 3);
    if (recent.length) {
      const gains = el("div", "", "recent-gains");
      gains.append(el("small", "GANHOS RECENTES", "eyebrow-inline"));
      for (const record of recent)
        gains.append(
          el(
            "p",
            `+${fmt(record.reward.attributes[k])} · ${record.workout.summary}`,
          ),
        );
      row.append(gains);
    }
    if (k === "agility") {
      row.append(
        el(
          "small",
          `Velocidade: ${Math.floor(56 + Math.min(18, a.attributes[k] * 1.2))} px/s.`,
          "muted",
        ),
      );
    }
    const actions = el("div", "", "entry-actions");
    const b = button(
      "Alocar +1",
      () =>
        safe(() => {
          store.transact((s) => allocate(s, k));
          character();
        }),
      "alloc-btn",
    );
    b.disabled = a.free <= 0;
    actions.append(b);
    row.append(actions);
    content.append(row);
  });
}
type ItemSlot = (typeof items)[ItemId]["slot"];
const ITEM_GROUPS: { slot: ItemSlot; label: string; short: string }[] = [
  { slot: "weapon", label: "Armas", short: "ARMA" },
  { slot: "shield", label: "Escudos", short: "ESCUDO" },
  { slot: "armor", label: "Armaduras", short: "ARMADURA" },
  { slot: "accessory", label: "Acessórios", short: "ACESSÓRIO" },
];
function equippedItem(s: Save, slot: ItemSlot): ItemId | null {
  if (slot === "weapon") return s.weapon;
  if (slot === "shield") return s.shield;
  if (slot === "armor") return s.armor;
  return s.accessory;
}
function equipment(shop = false) {
  openModal(shop ? "Armazém da vila" : "Sua mochila");
  const s = store.state;
  content.classList.toggle("shop-content", shop);
  const balance = el("div", "", "shop-balance");
  balance.append(
    el("strong", `${s.gold} ouro`),
    el("span", `${s.materials} materiais`),
    el("span", `${s.potions} poções`),
  );
  content.append(balance);
  if (!shop) {
    const loadout = el("section", "", "inventory-loadout");
    loadout.append(el("small", "EQUIPADO AGORA", "eyebrow-inline"));
    const slots = el("div", "", "inventory-slots");
    for (const group of ITEM_GROUPS) {
      const id = equippedItem(s, group.slot);
      const slot = el("div", "", `inventory-slot${id ? " filled" : ""}`);
      slot.append(
        el("small", group.short),
        el("strong", id ? items[id].name : "Vazio"),
      );
      slots.append(slot);
    }
    loadout.append(slots);
    content.append(loadout);
  }
  const card = (id: ItemId, shopCard: boolean) => {
    const item = items[id];
    const equipped = equippedItem(s, item.slot) === id;
    const row = el(
      "section",
      "",
      `${shopCard ? "shop-item" : "inventory-item"}${equipped ? " equipped-item" : ""}`,
    );
    const copy = el("div", "", "item-copy");
    const heading = el("div", "", "item-heading");
    heading.append(
      el("span", item.kind, `item-kind item-kind-${item.slot}`),
      el("h3", item.name),
    );
    copy.append(
      heading,
      el(
        shopCard ? "small" : "p",
        attributes
          .filter((k) => item.bonus[k])
          .map(
            (k) =>
              `${item.bonus[k] > 0 ? "+" : ""}${item.bonus[k]} ${labels[k]}`,
          )
          .join(" · ") || "Equipamento inicial",
      ),
    );
    const b = button(
      shopCard
        ? s.owned.includes(id)
          ? "Já adquirido"
          : `${item.price} ouro · Comprar`
        : equipped
          ? "Equipado"
          : "Equipar",
      () =>
        safe(() => {
          store.transact((s) => (shopCard ? buy(s, id) : equip(s, id)));
          equipment(shopCard);
        }),
    );
    b.disabled = shopCard
      ? s.owned.includes(id) || s.gold < item.price
      : equipped;
    if (!shopCard && equipped) b.classList.add("equipped-state");
    row.append(copy, b);
    return row;
  };
  const list = el("div", "", shop ? "shop-list" : "inventory-list");
  if (shop) {
    for (const key of Object.keys(items)) {
      const id = key as ItemId;
      if (id !== "blade") list.append(card(id, true));
    }
  } else {
    for (const group of ITEM_GROUPS) {
      const owned = s.owned
        .filter((id) => items[id].slot === group.slot)
        .sort((left, right) => {
          const active = equippedItem(s, group.slot);
          if (left === active) return -1;
          if (right === active) return 1;
          return items[left].price - items[right].price;
        });
      if (!owned.length) continue;
      const section = el("section", "", "inventory-group");
      const heading = el("div", "", "inventory-group-heading");
      heading.append(
        el("h3", group.label),
        el("small", `${owned.length} ${owned.length === 1 ? "item" : "itens"}`),
      );
      const grid = el("div", "", "inventory-group-grid");
      for (const id of owned) grid.append(card(id, false));
      section.append(heading, grid);
      list.append(section);
    }
  }
  if (shop) {
    const b = button(
      "8 ouro · Comprar",
      () =>
        safe(() => {
          store.transact((s) => buy(s, "potion"));
          equipment(true);
        }),
      "primary",
    );
    b.disabled = s.gold < 8;
    const potion = el("section", "", "shop-item potion-item");
    const copy = el("div", "", "item-copy");
    copy.append(
      el("span", "Consumível", "item-kind item-kind-consumable"),
      el("h3", "Poção"),
      el("small", "Restaura 20 de vida durante o combate"),
    );
    potion.append(copy, b);
    list.append(potion);
  } else
    content.append(
      el(
        "p",
        "Poções restauram 20 de vida durante o combate. O descanso na fogueira é gratuito.",
        "muted",
      ),
    );
  content.append(list);
}
function download() {
  const url = URL.createObjectURL(
    new Blob([store.export()], { type: "application/json" }),
  );
  const a = el("a");
  a.href = url;
  a.download = "fizzi-quest-backup.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
function tutorial(openTopic = "defense") {
  openModal("Manual do aventureiro");
  content.classList.add("tutorial-content");
  const intro = el("section", "", "tutorial-intro");
  intro.append(
    el("small", "CONSULTA RÁPIDA", "eyebrow-inline"),
    el("h3", "Aprenda no seu ritmo"),
    el(
      "p",
      "Abra um tópico para rever as regras que já estão funcionando no jogo.",
      "muted",
    ),
  );
  content.append(intro);
  const topics = el("div", "", "tutorial-topics");
  for (const topic of TUTORIAL_TOPICS) {
    const details = el("details", "", "tutorial-topic");
    details.dataset.topic = topic.id;
    details.open = topic.id === openTopic;
    const summary = el("summary");
    const copy = el("span");
    copy.append(el("strong", topic.title), el("small", topic.summary));
    summary.append(copy, el("span", "+", "tutorial-toggle"));
    details.append(summary);
    const body = el("div", "", "tutorial-body");
    for (const paragraph of topic.paragraphs) body.append(el("p", paragraph));
    details.append(body);
    topics.append(details);
  }
  content.append(topics);
}
function settings() {
  openModal("Configurações");
  const personalization = el("section", "", "personalization-settings");
  personalization.append(
    el("small", "APARÊNCIA E CÂMERA", "eyebrow-inline"),
    el("h3", "Sua forma de explorar"),
  );
  const appearanceChoices = el("div", "", "appearance-choices");
  appearanceChoices.setAttribute("role", "group");
  appearanceChoices.setAttribute("aria-label", "Aparência do personagem");
  for (const [value, label] of [
    ["masculine", "Masculino"],
    ["feminine", "Feminino"],
  ] as const) {
    const choice = button(
      "",
      () => {
        store.transact((s) => (s.appearance = value));
        settings();
      },
      `appearance-choice${store.state.appearance === value ? " selected" : ""}`,
    );
    choice.setAttribute(
      "aria-pressed",
      String(store.state.appearance === value),
    );
    const preview = el("canvas", "", "appearance-preview");
    preview.width = 40;
    preview.height = 56;
    preview.setAttribute("aria-hidden", "true");
    const key = value === "feminine" ? "hero-f-0-0" : "hero-0-0";
    const context = preview.getContext("2d");
    if (context && game.textures.exists(key)) {
      context.imageSmoothingEnabled = false;
      context.drawImage(
        game.textures.get(key).getSourceImage() as CanvasImageSource,
        0,
        0,
        20,
        28,
        0,
        0,
        40,
        56,
      );
    }
    choice.append(preview, el("strong", label));
    appearanceChoices.append(choice);
  }
  const zoomChoices = el("div", "", "zoom-settings");
  zoomChoices.append(
    el("strong", "Zoom do mundo"),
    el(
      "small",
      "O jogo mantém pixels inteiros e centraliza o mapa em todos os modos.",
    ),
  );
  const zoomButtons = el("div", "", "zoom-choices");
  zoomButtons.setAttribute("role", "group");
  zoomButtons.setAttribute("aria-label", "Zoom do mundo");
  for (const [value, label] of [
    ["far", "Afastado"],
    ["auto", "Padrão"],
    ["near", "Próximo"],
  ] as const) {
    const choice = button(
      label,
      () => {
        store.transact((s) => (s.cameraZoom = value));
        settings();
      },
      store.state.cameraZoom === value ? "selected" : "",
    );
    choice.setAttribute(
      "aria-pressed",
      String(store.state.cameraZoom === value),
    );
    zoomButtons.append(choice);
  }
  zoomChoices.append(zoomButtons);
  personalization.append(appearanceChoices, zoomChoices);
  content.append(
    personalization,
    el("h3", "Seu progresso, com você"),
    el(
      "p",
      "O save fica neste navegador. Exporte um backup para transferir de aparelho ou endereço.",
    ),
    button("Exportar backup", download, "primary"),
  );
  const input = el("textarea");
  input.rows = 6;
  input.placeholder = "Cole seu backup JSON";
  input.setAttribute("aria-label", "JSON do backup");
  const file = el("input");
  file.type = "file";
  file.accept = ".json,application/json";
  file.onchange = () => {
    const f = file.files?.[0];
    if (f) {
      if (f.size > 8 * 1024 * 1024) {
        notify("Backup maior que 8 MB.");
        return;
      }
      void f.text().then((t) => (input.value = t));
    }
  };
  content.append(
    file,
    input,
    button("Restaurar backup", () => {
      const text = input.value;
      content.replaceChildren(
        el("h3", "Substituir o progresso atual?"),
        el("p", "Exporte seu progresso antes de restaurar um backup."),
        button("Exportar atual", download),
        button(
          "Confirmar restauração",
          () =>
            safe(() => {
              store.restore(text);
              world.hideBattle();
              notify("Backup restaurado.");
              closeModal();
            }),
          "primary",
        ),
        button("Cancelar", settings),
      );
    }),
    el("h3", "Controles"),
    el(
      "p",
      "WASD ou setas: mover, inclusive em diagonais ao combinar duas direções. E ou Espaço: interagir. Esc: fechar menus. No celular, use o direcional de oito posições.",
    ),
    button("Iniciar nova aventura", () => {
      content.replaceChildren(
        el("h3", "Começar do zero?"),
        el(
          "p",
          "Isso substitui o save deste navegador. Você pode guardar uma cópia antes.",
        ),
        button("Exportar backup", download),
        button(
          "Confirmar nova aventura",
          () => {
            store.reset();
            world.hideBattle();
            closeModal();
            notify("Uma nova história começa.");
          },
          "danger",
        ),
        button("Cancelar", settings),
      );
    }),
  );
}
function worldMap() {
  openModal("Mapa da região");
  const s = store.state;
  const map = el("div", "", "world-map");
  map.setAttribute("aria-label", "Mapa prévio das regiões de Fizzi Quest");
  const area = (
    name: string,
    note: string,
    className: string,
    status: string,
  ) => {
    const node = el("section", "", `map-area ${className}`);
    node.append(
      el("span", status, "map-status"),
      el("strong", name),
      el("small", note),
    );
    return node;
  };
  const villageStatus = s.map === "village" ? "VOCÊ ESTÁ AQUI" : "DESCOBERTA";
  const forestStatus = s.map === "forest" ? "VOCÊ ESTÁ AQUI" : "TRILHA ABERTA";
  map.append(
    area(
      "Vila da Guilda",
      "Descanso · loja · treinos",
      "village",
      villageStatus,
    ),
    el("div", "Trilha leste", "map-route open-route"),
    area(
      "Bosque das Brumas",
      "Criaturas · baú · bifurcação",
      "forest",
      forestStatus,
    ),
    el("div", "Passagem tomada", "map-route locked-route"),
    area(
      "Posto de Vigia",
      s.defeated.includes("guardian")
        ? "Emblema recuperado"
        : "Guardião de Musgo",
      `watch ${s.defeated.includes("guardian") ? "cleared" : "danger"}`,
      s.defeated.includes("guardian") ? "RECUPERADO" : "PERIGO",
    ),
    area("Mina do Eco", "Região futura", "locked mine", "🔒 BLOQUEADA"),
    area("Ruínas Altas", "Região futura", "locked ruins", "🔒 BLOQUEADA"),
    area("Costa Dourada", "Região futura", "locked coast", "🔒 BLOQUEADA"),
  );
  content.append(
    el(
      "p",
      "Este mapa mostra o caminho conhecido. Regiões futuras permanecem bloqueadas até existirem de verdade.",
      "muted",
    ),
    map,
    el(
      "p",
      "O mapa é apenas uma consulta e não teletransporta o aventureiro.",
      "muted",
    ),
  );
}

world.onNear = (e) => {
  interact.textContent = e ? `${e.label} · E` : "Explore a trilha";
  interact.disabled = !e;
};
world.onInteract = (e) =>
  safe(() => {
    if (e.kind in enemies) {
      store.transact((s) => startBattle(s, e.kind as EnemyId));
      world.setPaused(true);
      world.showBattle();
      battle();
    } else if (e.kind === "merchant") equipment(true);
    else if (e.kind === "fire") {
      store.transact(rest);
      notify("Descanso completo. As criaturas comuns voltaram ao bosque.");
    } else if (e.kind === "chest") {
      if (store.state.chest) {
        notify("O baú já está vazio.");
        return;
      }
      store.transact((s) => {
        s.chest = true;
        s.gold += 15;
        s.potions++;
      });
      notify("Baú encontrado! +15 ouro · +1 poção.");
    } else if (e.kind === "master") {
      openModal("Mestre da guilda");
      const q = store.state.quest;
      if (q === "not_started") {
        content.append(
          el(
            "p",
            "“Bom ver passos novos por aqui. O bosque tomou nossa antiga trilha. Encontre o emblema no posto de vigia e teremos um recomeço.”",
          ),
          button(
            "Aceitar a missão",
            () => {
              store.transact((s) => (s.quest = "active"));
              closeModal();
              notify("Missão iniciada: recupere o emblema da guilda.");
            },
            "primary",
          ),
        );
      } else if (q === "active")
        content.append(
          el(
            "p",
            "“Siga para leste. O Broto é pequeno, mas tem opinião forte. A fogueira estará aqui quando você voltar.”",
          ),
        );
      else if (q === "emblem_recovered")
        content.append(
          el(
            "p",
            "“Nosso emblema! Parece que esta casa ainda tem histórias para viver.”",
          ),
          button(
            "Entregar emblema · +40 XP e +30 ouro",
            () => {
              store.transact((s) => {
                if (s.quest !== "emblem_recovered") return;
                s.quest = "completed";
                s.adventureXpTotal += 40;
                s.gold += 30;
              });
              closeModal();
              notify("A trilha foi recuperada. Bem-vindo à guilda!");
            },
            "primary",
          ),
        );
      else {
        content.append(
          el(
            "p",
            store.state.guild
              ? "“A guilda está de portas abertas. Você fez parte deste recomeço.”"
              : "“Podemos reconstruir a sede juntos.”",
          ),
        );
        if (!store.state.guild)
          content.append(
            button(
              "Restaurar guilda · 30 ouro + 5 materiais",
              () =>
                safe(() => {
                  store.transact((s) => {
                    if (s.guild || s.gold < 30 || s.materials < 5)
                      throw Error("Você precisa de 30 ouro e 5 materiais.");
                    s.gold -= 30;
                    s.materials -= 5;
                    s.guild = true;
                  });
                  closeModal();
                  notify("Guilda restaurada! +5 de vida máxima.");
                }),
              "primary",
            ),
          );
      }
    }
  });
const battlePanel = el("section", "", "battle-panel");
app.append(battlePanel);
battlePanel.hidden = true;
function battle() {
  const s = visualState ?? store.state,
    b = s.battle;
  if (!b) {
    battlePanel.hidden = true;
    return;
  }
  world.setPaused(true);
  battlePanel.hidden = false;
  nav.hidden = true;
  controls.hidden = true;
  place.hidden = true;
  battlePanel.replaceChildren();
  const e = enemies[b.enemy];
  battlePanel.append(
    el("small", `RODADA ${b.round}`),
    el("h2", e.name),
    el("p", `Vida ${b.hp}/${e.hp}`),
    bar(b.hp, e.hp),
    el(
      "p",
      busy
        ? "Resolvendo a rodada…"
        : b.status === "awaiting_player"
          ? intent(b)
          : b.status === "victory"
            ? "Caminho livre!"
            : b.status === "defeat"
              ? "Um descanso merecido."
              : "Até a próxima.",
      "intent",
    ),
  );
  const log = el("div", "", "battle-log");
  log.setAttribute("aria-live", "polite");
  b.log.forEach((t) => log.append(el("p", t)));
  battlePanel.append(log);
  const actions = el("div", "", "battle-actions");
  battlePanel.append(actions);
  const choice = (text: string, action: Action, disabled = false) => {
    const btn = button(text, () => {
      void resolveRound(action);
    });
    btn.disabled = busy || disabled;
    actions.append(btn);
  };
  if (b.status !== "awaiting_player") {
    actions.append(
      button(
        "Voltar à aventura",
        () => {
          store.transact((s) => (s.battle = null));
          battlePanel.hidden = true;
          nav.hidden = false;
          controls.hidden = false;
          place.hidden = false;
          world.hideBattle();
          world.setPaused(false);
        },
        "primary",
      ),
    );
    return;
  }
  choice("Atacar", "attack");
  const skill = button("Habilidades", () => {
    actions.replaceChildren();
    choice("Golpe pesado · 3", "heavy", s.stamina < 3);
    choice("Recuperar fôlego +4", "recover");
    if (stats(s).level >= 2) choice("Corte veloz · 2", "quick", s.stamina < 2);
    if (stats(s).level >= 3)
      choice("Impacto firme · 4", "impact", s.stamina < 4);
    actions.append(button("Voltar", battle));
  });
  skill.disabled = busy;
  actions.append(skill);
  choice("Defender", "defend");
  const item = button(`Item · ${s.potions}`, () => {
    actions.replaceChildren();
    choice("Usar poção · +20 vida", "potion", s.potions === 0);
    actions.append(button("Voltar", battle));
  });
  item.disabled = busy;
  actions.append(item);
  choice("Fugir", "flee");
  actions.append(
    button("Como funciona a Defesa?", () => tutorial("defense"), "battle-help"),
  );
}
const intro = el("section", "", "intro");
intro.append(
  el("div", "UMA PEQUENA AVENTURA. UM NOVO COMEÇO.", "eyebrow"),
  el("h1", "Fizzi Quest"),
  el("p", "A trilha esquecida", "subtitle"),
  el(
    "p",
    "Entre no bosque. Encontre sua força.\nReconstrua uma história, no seu ritmo.",
    "intro-copy",
  ),
);
const begin = button(
  store.hasSave ? "Continuar aventura" : "Nova aventura",
  () => {
    started = true;
    intro.remove();
    store.persist();
    world.setPaused(false);
    renderHUD();
    if (store.state.battle) {
      world.setPaused(true);
      world.showBattle();
      battle();
    } else notify("Boas-vindas! Fale com o mestre da guilda ao norte.");
  },
  "primary start",
);
intro.append(
  begin,
  el("small", "Treinar ajuda a evoluir. A aventura já é sua."),
);
app.append(intro);
renderHUD();
async function resolveRound(action: Action) {
  if (busy) return;
  busy = true;
  visualState = structuredClone(store.state);
  let events: CombatEvent[] = [];
  try {
    // Atomic, synchronous resolution and persistence precede every visual effect.
    store.transact((s) => {
      events = act(s, action);
    });
    battle();
    await world.battleFeedback(events, (event) => {
      if (!visualState?.battle) return;
      if (event.kind === "damage") {
        if (event.actor === "hero")
          visualState.battle.hp = Math.max(
            0,
            visualState.battle.hp - (event.amount ?? 0),
          );
        else visualState.hp = Math.max(0, visualState.hp - (event.amount ?? 0));
      }
      if (event.kind === "heal") visualState.hp += event.amount ?? 0;
      if (event.kind === "recover") visualState.stamina += event.amount ?? 0;
      renderHUD();
      battle();
    });
  } catch (e) {
    notify((e as Error).message);
  } finally {
    visualState = null;
    busy = false;
    renderHUD();
    battle();
  }
}
const versionLabel = el("small", GAME_VERSION, "version-label");
app.append(versionLabel);
intro.append(el("small", GAME_VERSION, "intro-version"));
document.title = `Fizzi Quest · ${GAME_VERSION}`;
window.addEventListener("pagehide", () => {
  if (started) store.persist();
});
