import Phaser from "phaser";
import { createArt } from "./art";
import { makeMap, walkable, type Entity, type MapData } from "./maps";
import { enemies, stats, type CombatEvent } from "../domain/game";
import { BattlePresentation } from "./battlePresentation";
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
  private ambientTimer?: Phaser.Time.TimerEvent;
  private terrainSprites: Phaser.GameObjects.Sprite[] = [];
  private treeSprites: Phaser.GameObjects.Sprite[] = [];
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
    this.root.removeAll(true);
    this.enemySprites.clear();
    this.ambientTimer?.remove();
    this.terrainSprites = [];
    this.treeSprites = [];
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
        if (m.tiles[y][x] === 2 && !this.reduced) tile.play("ambient-water");
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
        if (m.tiles[y][x] === 0 && (x * 19 + y * 3) % 29 === 0) {
          this.root.add(
            this.add.rectangle(x * 16 + 5, y * 16 + 9, 2, 2, 0xe2cda0),
          );
          this.root.add(
            this.add.rectangle(x * 16 + 6, y * 16 + 11, 1, 3, 0x426447),
          );
        }
      }
    this.foreground = this.add.container(0, 0);
    this.root.add(this.foreground);
    const sorted = [...m.entities].sort((a, b) => a.y - b.y);
    for (const e of sorted) {
      const npc = e.kind === "master" || e.kind === "merchant";
      let ox = 0, oy = 0;
      if (e.kind in enemies) {
        ox = ((e.x * 7 + e.y * 13 + e.kind.charCodeAt(0)) % 11) - 5;
        oy = ((e.x * 11 + e.y * 17 + e.kind.charCodeAt(e.kind.length - 1)) % 11) - 5;
        if (!walkable(m, e.x + ox, e.y + oy)) {
          ox = 0; oy = 0;
        }
      }
      const sprite = this.add
        .sprite(e.x + ox, e.y + oy, npc ? e.kind + "-0-0" : e.kind)
        .setOrigin(0.5, 1)
        .setDepth(e.y);
      if (e.kind in enemies) {
        this.enemySprites.set(e.kind, sprite);
        sprite.setVisible(!s.defeated.includes(e.kind as keyof typeof enemies));
        sprite.setData("baseY", e.y);
        if (!this.reduced) sprite.play(`monster-${e.kind}-idle`);
      }
      if (e.kind === "tree") this.treeSprites.push(sprite);
      if (e.kind === "fire" && !this.reduced) sprite.play("ambient-fire");
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
    if (!walkable(m, s.x, s.y)) {
      s.x = s.map === "village" ? 200 : 40;
      s.y = 232;
    }
    this.player = this.add
      .sprite(s.x, s.y, "hero-0-0")
      .setOrigin(0.5, 1)
      .setDepth(s.y);
    this.foreground.add(this.player);
    this.cameras.main.setBounds(0, 0, m.width * 16, m.height * 16);
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
    this.resizeCamera();
    if (!this.reduced) {
      let cycle = 0;
      this.ambientTimer = this.time.addEvent({
        delay: 3600,
        loop: true,
        callback: () => {
          const terrain =
            this.terrainSprites[cycle % this.terrainSprites.length];
          const tree = this.treeSprites[(cycle * 3) % this.treeSprites.length];
          terrain?.play("ambient-grass-wind");
          tree?.play("ambient-tree");
          if (cycle % 2 === 0)
            this.flags[cycle % this.flags.length]?.play("ambient-flag");
          cycle++;
        },
      });
    }
    if (!this.reduced) this.cameras.main.fadeIn(200, 24, 61, 53);
    this.sync();
  }
  resizeCamera() {
    if (!this.player) return;
    if (this.presentation) {
      this.showBattle();
      return;
    }
    const w = this.scale.width,
      h = this.scale.height;
    const zoom = Math.max(2, Math.floor(Math.min(w / 240, h / 220)));
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
    document.documentElement.dataset.cameraPadding = `${Math.round(padX)},${Math.round(padY)}`;
  }
  interact() {
    if (!this.paused && this.near) this.onInteract(this.near);
  }
  sync() {
    if (!this.player) return;
    const s = this.store.state;
    this.speed = 56 + Math.min(18, stats(s).speed * 1.2);
    if (this.worldKey !== s.map && !s.battle) this.build();
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
    const has = (...k: string[]) =>
      k.some((x) => this.keys.has(x) || this.touch === x);
    if (has("arrowleft", "a")) {
      dx = -1;
      this.direction = 2;
    } else if (has("arrowright", "d")) {
      dx = 1;
      this.direction = 3;
    } else if (has("arrowup", "w")) {
      dy = -1;
      this.direction = 1;
    } else if (has("arrowdown", "s")) {
      dy = 1;
      this.direction = 0;
    }
    const step = (this.speed * Math.min(delta, 35)) / 1000,
      nx = s.x + dx * step,
      ny = s.y + dy * step;
    if (walkable(this.mapData, nx, ny)) {
      s.x = nx;
      s.y = ny;
    }
    this.player.setPosition(Math.round(s.x), Math.round(s.y)).setDepth(s.y);
    this.frame += delta;
    this.player.setTexture(
      `hero-${this.direction}-${dx || dy ? Math.floor(this.frame / 130) % 3 : 0}`,
    );
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
