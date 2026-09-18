import Phaser from "phaser";
import { createArt } from "./art";
import { makeMap, walkable, type Entity, type MapData } from "./maps";
import { enemies, stats, type CombatEvent } from "../domain/game";
import { BattlePresentation } from "./battlePresentation";
import {
  AmbientController,
  type AmbientDiagnostics,
  type AmbientKind,
} from "./ambient";
import type { Store } from "../application/store";
export class World extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private mapData!: MapData;
  private keys = new Set<string>();
  private frame = 0;
  private direction = 0;
  private worldKey = "";
  private elapsed = 0;
  private speed = 56;
  private root!: Phaser.GameObjects.Container;
  private enemySprites = new Map<string, Phaser.GameObjects.Sprite>();
  private presentation?: BattlePresentation;
  private foreground!: Phaser.GameObjects.Container;
  private reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches;
  private flags: Phaser.GameObjects.Sprite[] = [];
  private chest?: Phaser.GameObjects.Sprite;
  private ambience?: AmbientController;
  private terrainSprites: Phaser.GameObjects.Sprite[] = [];
  private waterSprites: Phaser.GameObjects.Sprite[] = [];
  private treeSprites: Phaser.GameObjects.Sprite[] = [];
  private fireSprites: Phaser.GameObjects.Sprite[] = [];
  private effectSprites: Array<{
    sprite: Phaser.GameObjects.Sprite;
    kind: "leaf" | "dust";
  }> = [];
  private appliedCameraZoom = "";
  paused = true;
  touch = "";
  near: Entity | undefined;
  onNear: (e: Entity | undefined) => void = () => {};
  onInteract: (e: Entity) => void = () => {};
  constructor(public store: Store) {
    super("World");
  }
  create() {
    createArt(this);
    this.root = this.add.container(0, 0);
    this.build();
    const down = (e: KeyboardEvent) => {
      if (
        this.paused ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return;
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      )
        e.preventDefault();
      this.keys.add(e.key.toLowerCase());
      if (!e.repeat && (e.key.toLowerCase() === "e" || e.key === " "))
        this.interact();
    };
    const up = (e: KeyboardEvent) => this.keys.delete(e.key.toLowerCase());
    const blur = () => this.clearInput();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    this.events.once("shutdown", () => {
      this.ambience?.destroy();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    });
    this.scale.on("resize", () => this.resizeCamera());
    this.resizeCamera();
  }
  clearInput() {
    this.keys.clear();
    this.touch = "";
  }
  setPaused(value: boolean) {
    this.paused = value;
    this.clearInput();
  }
  build() {
    if (!this.root) return;
    this.ambience?.destroy();
    this.ambience = undefined;
    this.root.removeAll(true);
    this.enemySprites.clear();
    this.terrainSprites = [];
    this.waterSprites = [];
    this.treeSprites = [];
    this.fireSprites = [];
    this.effectSprites = [];
    this.flags = [];
    this.chest = undefined;
    this.near = undefined;
    this.onNear(undefined);
    const s = this.store.state;
    this.worldKey = s.map;
    this.mapData = makeMap(s.map === "forest");
    const m = this.mapData;
    for (let y = 0; y < m.height; y++)
      for (let x = 0; x < m.width; x++) {
        const tile = this.add
          .sprite(
            x * 16,
            y * 16,
            m.tiles[y][x] === 1
              ? "path"
              : m.tiles[y][x] === 2
                ? "water"
                : "grass" + ((x * 7 + y * 3) % 4),
          )
          .setOrigin(0);
        this.root.add(tile);
        if (m.tiles[y][x] === 2) {
          const phase = (x * 5 + y * 7) % 4;
          tile.setTexture(`water-${phase}`).setData("ambientPhase", phase);
          this.waterSprites.push(tile);
        }
        if (m.tiles[y][x] === 1) {
          const edge = (key: string) => {
            const overlay = this.add.sprite(x * 16, y * 16, key).setOrigin(0);
            this.root.add(overlay);
          };
          if (m.tiles[y - 1]?.[x] !== 1) edge("path-edge-n");
          if (m.tiles[y + 1]?.[x] !== 1) edge("path-edge-s");
          if (m.tiles[y]?.[x - 1] !== 1) edge("path-edge-w");
          if (m.tiles[y]?.[x + 1] !== 1) edge("path-edge-e");
          if ((x * 5 + y * 11) % 17 === 0) {
            const stones = this.add
              .sprite(x * 16, y * 16, "pebbles")
              .setOrigin(0);
            this.root.add(stones);
          }
        }
        if (
          m.tiles[y][x] === 0 &&
          (x * 11 + y * 7) % 53 === 0 &&
          this.terrainSprites.length < 8
        ) {
          const breeze = this.add
            .sprite(x * 16, y * 16, "grass-wind-0")
            .setOrigin(0)
            .setDepth(y * 16 - 1);
          this.root.add(breeze);
          this.terrainSprites.push(breeze);
        }
        if (m.tiles[y][x] === 0) {
          const detail = (x * 19 + y * 3) % 41;
          if (detail === 0 || detail === 13) {
            const decor = this.add
              .sprite(
                x * 16,
                y * 16,
                detail === 0 ? "wildflower" : "grass-tuft",
              )
              .setOrigin(0);
            this.root.add(decor);
            if (detail === 13) this.terrainSprites.push(decor);
          }
        }
      }
    this.foreground = this.add.container(0, 0);
    this.root.add(this.foreground);
    const sorted = [...m.entities].sort((a, b) => a.y - b.y);
    for (const e of sorted) {
      const npc = e.kind === "master" || e.kind === "merchant";
      let ox = 0,
        oy = 0;
      if (e.kind in enemies) {
        ox = ((e.x * 7 + e.y * 13 + e.kind.charCodeAt(0)) % 11) - 5;
        oy =
          ((e.x * 11 + e.y * 17 + e.kind.charCodeAt(e.kind.length - 1)) % 11) -
          5;
        if (!walkable(m, e.x + ox, e.y + oy)) {
          ox = 0;
          oy = 0;
        }
      }
      const sprite = this.add
        .sprite(e.x + ox, e.y + oy, npc ? `${e.kind}-0-idle-0` : e.kind)
        .setOrigin(0.5, 1)
        .setDepth(e.y);
      if (npc && !this.reduced) {
        sprite.play(`${e.kind}-idle-0`);
      }
      if (e.kind in enemies) {
        this.enemySprites.set(e.kind, sprite);
        sprite.setVisible(!s.defeated.includes(e.kind as keyof typeof enemies));
        sprite.setData("baseY", e.y);
        if (!this.reduced) sprite.play(`monster-${e.kind}-idle`);
      }
      if (e.kind === "tree") this.treeSprites.push(sprite);
      if (e.kind === "fire") this.fireSprites.push(sprite);
      if (e.kind === "chest") this.chest = sprite;
      this.foreground.add(sprite);
      if (e.label && !(e.kind in enemies)) {
        const mark = this.add
          .text(
            e.x,
            e.y - 32,
            e.kind === "master"
              ? "◆"
              : e.kind === "merchant"
                ? "$"
                : e.kind === "fire"
                  ? "♨"
                  : "◇",
            {
              fontFamily: "Georgia",
              fontSize: "10px",
              color: "#f1e6ca",
              stroke: "#183d35",
              strokeThickness: 3,
            },
          )
          .setOrigin(0.5)
          .setDepth(e.y + 1);
        this.foreground.add(mark);
      }
    }
    if (s.map === "village") {
      for (const x of [145, 258]) {
        const flag = this.add
          .sprite(x, 103, "flag-0")
          .setOrigin(0.5, 1)
          .setDepth(114);
        this.foreground.add(flag);
        this.flags.push(flag);
      }
    }
    this.createAmbientEffects();
    if (!walkable(m, s.x, s.y)) {
      s.x = s.map === "village" ? 200 : 40;
      s.y = 232;
    }
    const hero = s.appearance === "feminine" ? "hero-f" : "hero";
    this.player = this.add
      .sprite(s.x, s.y, `${hero}-0-idle-0`)
      .setOrigin(0.5, 1)
      .setDepth(s.y)
      .setData("heroKey", hero);
    this.foreground.add(this.player);
    if (!this.reduced) this.player.play(`${hero}-idle-0`);
    this.cameras.main.setBounds(0, 0, m.width * 16, m.height * 16);
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
    this.resizeCamera();
    this.setupAmbience();
    if (!this.reduced) this.cameras.main.fadeIn(200, 24, 61, 53);
    this.sync();
  }
  private createAmbientEffects() {
    const specs =
      this.store.state.map === "forest"
        ? [
            { kind: "leaf" as const, x: 118, y: 112 },
            { kind: "leaf" as const, x: 310, y: 264 },
            { kind: "leaf" as const, x: 520, y: 168 },
          ]
        : [
            { kind: "dust" as const, x: 174, y: 171 },
            { kind: "dust" as const, x: 238, y: 157 },
          ];
    for (const effect of specs) {
      const sprite = this.add
        .sprite(effect.x, effect.y, `ambient-${effect.kind}-0`)
        .setOrigin(0.5)
        .setDepth(effect.y - 20)
        .setVisible(false);
      this.foreground.add(sprite);
      this.effectSprites.push({ sprite, kind: effect.kind });
    }
  }
  private setupAmbience() {
    const fast = Boolean(
      (window as Window & { __FIZZI_TEST_AMBIENCE__?: boolean })
        .__FIZZI_TEST_AMBIENCE__,
    );
    const seed = this.store.state.map === "forest" ? 0x5f3759df : 0x13579bdf;
    const controller = new AmbientController(
      this,
      this.reduced,
      seed,
      this.reduced ? 1 : 2,
      fast,
    );
    const phase = (index: number, salt: number, spread: number) =>
      700 + ((index * 977 + salt * 613) % spread);
    const add = (
      sprites: Phaser.GameObjects.Sprite[],
      kind: AmbientKind,
      animation: string,
      baseTexture: (sprite: Phaser.GameObjects.Sprite, index: number) => string,
      options: {
        min: number;
        max: number;
        duration: number;
        probability: number;
        essential?: boolean;
        reducedAnimation?: string;
      },
    ) =>
      sprites.forEach((sprite, index) =>
        controller.add({
          id: `${kind}-${index}`,
          kind,
          sprite,
          animation,
          reducedAnimation: options.reducedAnimation,
          baseTexture: baseTexture(sprite, index),
          minInterval: options.min,
          maxInterval: options.max,
          duration: options.duration,
          initialDelay: phase(index, kind.length, options.max - options.min),
          probability: options.probability,
          essential: options.essential,
        }),
      );

    add(
      this.waterSprites,
      "water",
      "ambient-water",
      (sprite) => sprite.texture.key,
      {
        min: 7000,
        max: 15000,
        duration: 2200,
        probability: 0.55,
        essential: true,
        reducedAnimation: "ambient-water-reduced",
      },
    );
    add(this.fireSprites, "fire", "ambient-fire", () => "fire", {
      min: 3200,
      max: 7200,
      duration: 1100,
      probability: 0.82,
      essential: true,
      reducedAnimation: "ambient-fire-reduced",
    });
    add(this.treeSprites, "tree", "ambient-tree", () => "tree", {
      min: 9000,
      max: 19000,
      duration: 2300,
      probability: 0.48,
    });
    this.terrainSprites.forEach((sprite, index) => {
      const tuft = sprite.texture.key === "grass-tuft";
      controller.add({
        id: `grass-${index}`,
        kind: "grass",
        sprite,
        animation: tuft ? "ambient-grass-tuft" : "ambient-grass-wind",
        baseTexture: tuft ? "grass-tuft" : "grass-wind-0",
        minInterval: 6500,
        maxInterval: 14500,
        duration: tuft ? 1600 : 1900,
        initialDelay: phase(index, 17, 7200),
        probability: 0.58,
      });
    });
    add(this.flags, "flag", "ambient-flag", () => "flag-0", {
      min: 5200,
      max: 12500,
      duration: 1800,
      probability: 0.68,
    });
    this.effectSprites.forEach(({ sprite, kind }, index) =>
      controller.add({
        id: `${kind}-${index}`,
        kind,
        sprite,
        animation: `ambient-${kind}`,
        baseTexture: `ambient-${kind}-0`,
        minInterval: 12000,
        maxInterval: 22000,
        duration: kind === "leaf" ? 900 : 1300,
        initialDelay: phase(index, 31 + kind.length, 9000),
        probability: 0.35,
        decorative: true,
      }),
    );
    this.ambience = controller;
    controller.start();
  }
  getAmbientDiagnostics(): AmbientDiagnostics | undefined {
    return this.ambience?.diagnostics();
  }
  resizeCamera() {
    if (!this.player) return;
    if (this.presentation) {
      this.showBattle();
      return;
    }
    const w = this.scale.width,
      h = this.scale.height;
    const automatic = Math.max(2, Math.floor(Math.min(w / 240, h / 220))),
      preference = this.store.state.cameraZoom,
      zoom = Math.max(
        2,
        Math.min(
          5,
          automatic +
            (preference === "near" ? 1 : preference === "far" ? -1 : 0),
        ),
      );
    const mapWidth = this.mapData.width * 16,
      mapHeight = this.mapData.height * 16,
      padX = Math.max(0, (w / zoom - mapWidth) / 2),
      padY = Math.max(0, (h / zoom - mapHeight) / 2);
    this.cameras.main
      .setZoom(zoom)
      .setBounds(-padX, -padY, mapWidth + padX * 2, mapHeight + padY * 2)
      .centerOn(this.player.x, this.player.y)
      .setRoundPixels(true);
    document.documentElement.dataset.cameraZoom = String(zoom);
    document.documentElement.dataset.cameraZoomPreference = preference;
    document.documentElement.dataset.cameraPadding = `${Math.round(padX)},${Math.round(padY)}`;
    this.appliedCameraZoom = preference;
  }
  interact() {
    if (!this.paused && this.near) this.onInteract(this.near);
  }
  sync() {
    if (!this.player) return;
    const s = this.store.state;
    this.speed = 56 + Math.min(18, stats(s).speed * 1.2);
    if (this.worldKey !== s.map && !s.battle) this.build();
    const hero = s.appearance === "feminine" ? "hero-f" : "hero";
    if (this.player.getData("heroKey") !== hero) {
      this.player.stop();
      this.player
        .setData("heroKey", hero)
        .setTexture(`${hero}-${this.direction}-idle-0`);
      if (!this.reduced) this.player.play(`${hero}-idle-${this.direction}`);
    }
    if (this.appliedCameraZoom !== s.cameraZoom && !this.presentation)
      this.resizeCamera();
    for (const [key, sprite] of this.enemySprites)
      sprite.setVisible(!s.defeated.includes(key as keyof typeof enemies));
    this.chest?.setTexture(s.chest ? "chest-open" : "chest");
    this.flags.forEach((f) => f.setTint(s.guild ? 0xffffff : 0x889978));
  }
  showBattle() {
    this.presentation?.destroy();
    const b = this.store.state.battle;
    if (!b) return;
    const camera = this.cameras.main;
    camera.stopFollow();
    camera.removeBounds();
    camera.setZoom(1);
    camera.setScroll(0, 0);
    this.presentation = new BattlePresentation(this, b);
  }
  async battleFeedback(
    events: CombatEvent[],
    onEvent: (event: CombatEvent) => void,
  ) {
    await this.presentation?.play(events, onEvent);
    if (this.store.state.battle)
      this.presentation?.sync(this.store.state.battle);
  }
  hideBattle() {
    this.presentation?.destroy();
    this.presentation = undefined;
    this.build();
  }
  update(time: number, delta: number) {
    if (!this.player) return;
    void time;
    if (this.paused) return;
    this.sync();
    const s = this.store.state;
    let dx = 0,
      dy = 0;
    const touchKeys = this.touch ? this.touch.split("+") : [],
      has = (...k: string[]) =>
        k.some((x) => this.keys.has(x) || touchKeys.includes(x));
    dx = Number(has("arrowright", "d")) - Number(has("arrowleft", "a"));
    dy = Number(has("arrowdown", "s")) - Number(has("arrowup", "w"));
    if (dy < 0) this.direction = 1;
    else if (dy > 0) this.direction = 0;
    else if (dx < 0) this.direction = 2;
    else if (dx > 0) this.direction = 3;
    if (dx && dy) {
      dx *= Math.SQRT1_2;
      dy *= Math.SQRT1_2;
    }
    const step = (this.speed * Math.min(delta, 35)) / 1000,
      nx = s.x + dx * step,
      ny = s.y + dy * step;
    if (walkable(this.mapData, nx, s.y)) s.x = nx;
    if (walkable(this.mapData, s.x, ny)) s.y = ny;
    this.player.setPosition(Math.round(s.x), Math.round(s.y)).setDepth(s.y);
    if (this.reduced) {
      const hero = this.player.getData("heroKey") as string;
      this.player.setTexture(`${hero}-${this.direction}-${dx || dy ? 1 : 0}`);
    } else {
      const hero = this.player.getData("heroKey") as string;
      const anim =
        dx || dy
          ? `${hero}-walk-${this.direction}`
          : `${hero}-idle-${this.direction}`;
      if (this.player.anims.currentAnim?.key !== anim) {
        this.player.play(anim);
      }
    }
    this.foreground.sort("depth");
    const near = this.mapData.entities
      .filter(
        (e) =>
          e.label &&
          (!(e.kind in enemies) ||
            !s.defeated.includes(e.kind as keyof typeof enemies)),
      )
      .find((e) => Math.hypot(e.x - s.x, e.y - s.y) < 25);
    if (near !== this.near) {
      this.near = near;
      this.onNear(near);
    }
    if (s.map === "village" && s.x > 374) {
      s.map = "forest";
      s.x = 40;
      s.y = 232;
      this.clearInput();
      this.build();
      this.store.persist();
      this.store.emit();
    } else if (s.map === "forest" && s.x < 10) {
      s.map = "village";
      s.x = 360;
      s.y = 168;
      this.clearInput();
      this.build();
      this.store.persist();
      this.store.emit();
    }
    this.elapsed += delta;
    if (this.elapsed > 1500) {
      this.elapsed = 0;
      this.store.persist();
    }
  }
}
