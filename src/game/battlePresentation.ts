import Phaser from "phaser";
import type { Battle, CombatEvent } from "../domain/game";

/** Disposable visuals only. The Store must commit the complete round before play(). */
export class BattlePresentation {
  readonly root: Phaser.GameObjects.Container;
  private hero: Phaser.GameObjects.Sprite;
  private enemy: Phaser.GameObjects.Sprite;
  private shield: Phaser.GameObjects.Arc;
  private cue: Phaser.GameObjects.Text;
  private active = true;
  private pending = new Set<() => void>();
  private reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches;
  constructor(
    private scene: Phaser.Scene,
    battle: Battle,
  ) {
    const w = scene.scale.width,
      h = scene.scale.height,
      mobile = w < 700;
    this.root = scene.add.container(0, 0).setDepth(10000);
    const add = (o: Phaser.GameObjects.GameObject) => this.root.add(o);
    add(scene.add.rectangle(0, 0, w, h, 0x183d35).setOrigin(0));
    const stageH = mobile ? Math.min(h * 0.43, 360) : h * 0.77;
    add(scene.add.rectangle(0, 0, w, stageH + 80, 0x315944).setOrigin(0));
    for (let i = 0; i < 18; i++)
      add(
        scene.add
          .image((i * w) / 17, stageH * 0.62 + (i % 3) * 12, "tree")
          .setScale(mobile ? 3 : 5)
          .setTint(i % 2 ? 0x718c73 : 0x91aa82),
      );
    const hx = w * (mobile ? 0.25 : 0.19),
      ex = w * (mobile ? 0.72 : 0.48),
      hy = stageH * (mobile ? 1 : 0.89),
      ey = stageH * (mobile ? 0.79 : 0.6);
    add(
      scene.add.ellipse(ex, ey, mobile ? 120 : 200, mobile ? 24 : 42, 0x5d7b4b),
    );
    add(
      scene.add.ellipse(hx, hy, mobile ? 140 : 220, mobile ? 30 : 48, 0x769055),
    );
    this.hero = scene.add
      .sprite(hx, hy, "hero-1-0")
      .setOrigin(0.5, 1)
      .setScale(mobile ? 3 : 5);
    this.enemy = scene.add
      .sprite(ex, ey, battle.enemy)
      .setOrigin(0.5, 1)
      .setScale(
        battle.enemy === "guardian" ? (mobile ? 2 : 4) : mobile ? 3 : 5,
      );
    if (!this.reduced) this.enemy.play(`monster-${battle.enemy}-idle`);
    this.shield = scene.add
      .circle(hx, hy - 35, mobile ? 30 : 49, 0x75b2b5, 0.12)
      .setStrokeStyle(3, 0xb7e0d1, 0.85)
      .setVisible(false);
    this.cue = scene.add
      .text(ex, ey - this.enemy.displayHeight - 24, "", {
        fontFamily: "Arial",
        fontSize: mobile ? "12px" : "16px",
        color: "#f1e6ca",
        backgroundColor: "#183d35",
        padding: { x: 8, y: 5 },
      })
      .setOrigin(0.5);
    add(this.hero);
    add(this.enemy);
    add(this.shield);
    add(this.cue);
    this.sync(battle);
  }
  sync(b: Battle) {
    this.shield.setVisible(b.guard && b.status === "awaiting_player");
    const shell = b.enemy === "beetle" && b.round % 2 === 1;
    const prepare = b.enemy === "guardian" && b.round % 3 === 2;
    const strong = b.enemy === "guardian" && b.round % 3 === 0;
    this.enemy.setTint(shell ? 0xb6c9bb : strong ? 0xe9af6b : 0xffffff);
    this.cue.setText(
      b.status !== "awaiting_player"
        ? ""
        : shell
          ? "◇ CARAPAÇA"
          : prepare
            ? "✦ PREPARANDO"
            : strong
              ? "! RAÍZES"
              : "! INVESTIDA",
    );
  }
  private tween(targets: object, props: object, duration = 130) {
    return new Promise<void>((resolve) => {
      if (!this.active) {
        resolve();
        return;
      }
      const done = () => {
        this.pending.delete(done);
        resolve();
      };
      this.pending.add(done);
      this.scene.tweens.add({
        targets,
        ...props,
        duration: this.reduced ? 1 : duration,
        onComplete: done,
      });
    });
  }
  private number(
    sprite: Phaser.GameObjects.Sprite,
    text: string,
    color: string,
  ) {
    const n = this.scene.add
      .text(sprite.x, sprite.y - sprite.displayHeight, text, {
        fontFamily: "Arial",
        fontSize: "25px",
        fontStyle: "bold",
        color,
        stroke: "#183d35",
        strokeThickness: 5,
      })
      .setOrigin(0.5);
    this.root.add(n);
    this.scene.tweens.add({
      targets: n,
      y: n.y - 28,
      alpha: 0,
      duration: this.reduced ? 160 : 520,
      onComplete: () => n.destroy(),
    });
  }
  async play(events: CombatEvent[], onEvent: (event: CombatEvent) => void) {
    for (const event of events) {
      if (!this.active) return;
      const actor = event.actor === "hero" ? this.hero : this.enemy,
        target = event.actor === "hero" ? this.enemy : this.hero;
      if (event.kind === "damage") {
        const x = actor.x,
          delta = (event.actor === "hero" ? 1 : -1) * (event.heavy ? 26 : 14);
        await this.tween(actor, { x: x + delta }, 100);
        if (!this.active) return;
        target.setTintFill(0xf1e6ca);
        this.number(target, `−${event.amount}`, "#ffe4ba");
        onEvent(event);
        await this.tween(actor, { x }, 120);
        target.clearTint();
      } else if (event.kind === "heal" || event.kind === "recover") {
        actor.setTint(0xa2dfb3);
        this.number(
          actor,
          `+${event.amount}`,
          event.kind === "heal" ? "#b9f1b3" : "#a8e1ec",
        );
        onEvent(event);
        await this.tween(actor, { alpha: 0.65 }, 130);
        await this.tween(actor, { alpha: 1 }, 130);
        actor.clearTint();
      } else if (event.kind === "guard") {
        this.shield.setVisible(true);
        this.number(actor, "GUARDA", "#c0e7ef");
        onEvent(event);
        await this.tween(this.shield, { alpha: 0.6 }, 120);
        this.shield.setAlpha(1);
      } else if (event.kind === "prepare") {
        this.number(actor, "PREPARA", "#e3cb85");
        onEvent(event);
        await this.tween(actor, { alpha: 0.7 }, 110);
        await this.tween(actor, { alpha: 1 }, 110);
      } else if (event.kind === "flee") {
        onEvent(event);
        await this.tween(actor, { x: actor.x - 70, alpha: 0 }, 200);
      } else {
        const defeated = event.kind === "victory" ? this.enemy : this.hero;
        this.number(
          this.hero,
          event.kind === "victory" ? "VITÓRIA" : "RECOMEÇO",
          event.kind === "victory" ? "#f2d78a" : "#d7e3cb",
        );
        onEvent(event);
        await this.tween(defeated, { alpha: 0.15 }, 220);
      }
    }
  }
  destroy() {
    this.active = false;
    for (const child of this.root.list) this.scene.tweens.killTweensOf(child);
    for (const done of this.pending) done();
    this.root.destroy(true);
  }
}
