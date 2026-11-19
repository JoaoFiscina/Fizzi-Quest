import Phaser from "phaser";
import { enemies, type Battle, type CombatEvent } from "../domain/game";

const DIGIT_FONT = "fq-digits";
const DIGIT_CHARS = "0123456789+-";
// 5×7 glyphs, drawn in code (no external font asset).
const DIGIT_GLYPHS = [
  "01110100011001110101110011000101110",
  "00100011000010000100001000010001110",
  "01110100010000100010001000100011111",
  "11110000010000101110000010000111110",
  "00010001100101010010111110001000010",
  "11111100001111000001000011000101110",
  "00110010001000011110100011000101110",
  "11111000010001000100010000100001000",
  "01110100011000101110100011000101110",
  "01110100011000101111000010001001100",
  "00000001000010011111001000010000000",
  "00000000000000011111000000000000000",
];

/** Builds a tiny outlined pixel font for damage numbers, once per game. */
function ensureDigitFont(scene: Phaser.Scene) {
  if (scene.cache.bitmapFont.exists(DIGIT_FONT)) return;
  const cellW = 7,
    cellH = 9;
  const texture = scene.textures.createCanvas(
    DIGIT_FONT,
    cellW * DIGIT_CHARS.length,
    cellH,
  )!;
  const c = texture.context;
  DIGIT_GLYPHS.forEach((glyph, index) => {
    const ox = index * cellW + 1,
      oy = 1;
    const on = (x: number, y: number) =>
      x >= 0 && x < 5 && y >= 0 && y < 7 && glyph[y * 5 + x] === "1";
    c.fillStyle = "#183d35";
    for (let y = -1; y <= 7; y++)
      for (let x = -1; x <= 5; x++) {
        if (on(x, y)) continue;
        let near = false;
        for (let j = -1; j <= 1 && !near; j++)
          for (let i = -1; i <= 1 && !near; i++) near = on(x + i, y + j);
        if (near) c.fillRect(ox + x, oy + y, 1, 1);
      }
    c.fillStyle = "#ffffff";
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 5; x++) if (on(x, y)) c.fillRect(ox + x, oy + y, 1, 1);
  });
  texture.refresh();
  scene.cache.bitmapFont.add(
    DIGIT_FONT,
    Phaser.GameObjects.RetroFont.Parse(scene, {
      image: DIGIT_FONT,
      width: cellW,
      height: cellH,
      chars: DIGIT_CHARS,
      charsPerRow: DIGIT_CHARS.length,
      "offset.x": 0,
      "offset.y": 0,
      "spacing.x": 0,
      "spacing.y": 0,
      lineSpacing: 0,
    }),
  );
}

const SPARK: Record<Battle["enemy"], number[]> = {
  sprout: [0x9fc46a, 0xd8e7a0, 0x5d8a3c],
  beetle: [0xb6c0b0, 0x7d8b7f, 0xe3d8b4],
  moth: [0xc8b8e6, 0xf1e6ca, 0x8c7fb0],
  guardian: [0x7e9a5a, 0xe9c37a, 0x4f6b3f],
};

/** Disposable visuals only. The Store must commit the complete round before play(). */
export class BattlePresentation {
  readonly root: Phaser.GameObjects.Container;
  private hero: Phaser.GameObjects.Sprite;
  private enemy: Phaser.GameObjects.Sprite;
  private enemyKind: Battle["enemy"];
  private shield: Phaser.GameObjects.Arc;
  private cue: Phaser.GameObjects.Text;
  private hpBack: Phaser.GameObjects.Rectangle;
  private hpGhost: Phaser.GameObjects.Rectangle;
  private hpFill: Phaser.GameObjects.Rectangle;
  private hpWidth: number;
  private enemyMax: number;
  private enemyHp: number;
  private scale: number;
  private active = true;
  private pending = new Set<() => void>();
  private entering: Promise<void> = Promise.resolve();
  private floating = new Map<Phaser.GameObjects.Sprite, number>();
  constructor(
    private scene: Phaser.Scene,
    battle: Battle,
    private reduced = false,
    private heroKey = "hero",
    entrance = false,
  ) {
    ensureDigitFont(scene);
    this.enemyKind = battle.enemy;
    this.enemyMax = enemies[battle.enemy].hp;
    this.enemyHp = battle.hp;
    const w = scene.scale.width,
      h = scene.scale.height,
      mobile = w < 700;
    this.scale = mobile ? 3 : 5;
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
      .sprite(hx, hy, `${heroKey}-1-idle-0`)
      .setOrigin(0.5, 1)
      .setScale(this.scale);
    if (!this.reduced) this.hero.play(`${heroKey}-idle-1`);
    else this.hero.setTexture(`${heroKey}-1-0`);
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
    // Enemy life on the stage, in art pixels: background, delayed ghost, fill.
    const px = mobile ? 3 : 4;
    this.hpWidth = Math.round(Math.max(60, this.enemy.displayWidth * 0.8));
    const barY = Math.round(ey - this.enemy.displayHeight - 12);
    this.hpBack = scene.add
      .rectangle(ex - this.hpWidth / 2 - px, barY - px, this.hpWidth + px * 2, px * 3, 0x132f28)
      .setOrigin(0);
    this.hpGhost = scene.add
      .rectangle(ex - this.hpWidth / 2, barY, this.hpWidth, px, 0xf1e6ca)
      .setOrigin(0);
    this.hpFill = scene.add
      .rectangle(ex - this.hpWidth / 2, barY, this.hpWidth, px, 0x91aa62)
      .setOrigin(0);
    this.cue = scene.add
      .text(ex, barY - px - 18, "", {
        fontFamily: '"DM Sans", Arial, sans-serif',
        fontSize: mobile ? "12px" : "16px",
        fontStyle: "bold",
        color: "#f1e6ca",
        backgroundColor: "#183d35",
        padding: { x: 8, y: 5 },
      })
      .setOrigin(0.5);
    add(this.hero);
    add(this.enemy);
    add(this.shield);
    add(this.hpBack);
    add(this.hpGhost);
    add(this.hpFill);
    add(this.cue);
    this.drawEnemyHp(false);
    this.sync(battle);
    if (entrance && !this.reduced) this.entering = this.enter(w, h, mobile);
  }
  /** Flash + pixel mosaic that dissolves from the enemy outwards (~380 ms). */
  private async enter(w: number, h: number, mobile: boolean) {
    const block = mobile ? 48 : 64,
      cols = Math.ceil(w / block),
      rows = Math.ceil(h / block),
      fx = this.enemy.x,
      fy = this.enemy.y - this.enemy.displayHeight / 2,
      far = Math.hypot(Math.max(fx, w - fx), Math.max(fy, h - fy));
    const veil: Phaser.GameObjects.Rectangle[] = [];
    const tweens: Promise<void>[] = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const cx = c * block + block / 2,
          cy = r * block + block / 2;
        const tile = this.scene.add.rectangle(cx, cy, block + 1, block + 1, 0x183d35);
        this.root.add(tile);
        veil.push(tile);
        tweens.push(
          this.tween(
            tile,
            {
              scale: 0,
              delay: Math.round((Math.hypot(cx - fx, cy - fy) / far) * 220),
              ease: "Quad.easeIn",
            },
            160,
          ),
        );
      }
    const flash = this.scene.add
      .rectangle(0, 0, w, h, 0xf1e6ca, 0.85)
      .setOrigin(0);
    this.root.add(flash);
    tweens.push(this.tween(flash, { alpha: 0 }, 140));
    const heroX = this.hero.x,
      enemyX = this.enemy.x;
    this.hero.x -= 36;
    this.enemy.x += 36;
    tweens.push(this.tween(this.hero, { x: heroX, ease: "Quad.easeOut" }, 320));
    tweens.push(this.tween(this.enemy, { x: enemyX, ease: "Quad.easeOut" }, 320));
    await Promise.all(tweens);
    for (const tile of veil) tile.destroy();
    flash.destroy();
  }
  private drawEnemyHp(animate: boolean) {
    const ratio = Phaser.Math.Clamp(this.enemyHp / this.enemyMax, 0, 1),
      width = Math.round(this.hpWidth * ratio);
    this.hpFill.setSize(Math.max(0, width), this.hpFill.height);
    this.hpFill.setFillStyle(ratio > 0.5 ? 0x91aa62 : ratio > 0.25 ? 0xd7b768 : 0xc56b4f);
    if (!animate || this.reduced || this.hpGhost.width <= width) {
      this.scene.tweens.killTweensOf(this.hpGhost);
      this.hpGhost.setSize(Math.max(0, width), this.hpGhost.height);
      return;
    }
    this.scene.tweens.killTweensOf(this.hpGhost);
    this.scene.tweens.add({
      targets: this.hpGhost,
      width: Math.max(0, width),
      delay: 220,
      duration: 380,
      ease: "Quad.easeOut",
      onUpdate: () => this.hpGhost.setSize(this.hpGhost.width, this.hpGhost.height),
    });
  }
  sync(b: Battle) {
    // Same value: leave a running ghost animation alone.
    if (b.hp !== this.enemyHp) {
      this.enemyHp = b.hp;
      this.drawEnemyHp(false);
    }
    this.shield.setVisible(b.guard && b.status === "awaiting_player");
    const shell = b.enemy === "beetle" && b.round % 2 === 1;
    const prepare = b.enemy === "guardian" && b.round % 3 === 2;
    const strong = b.enemy === "guardian" && b.round % 3 === 0;
    this.enemy.setTint(shell ? 0xb6c9bb : strong ? 0xe9af6b : 0xffffff);
    if (shell || prepare) {
      this.enemy
        .stop()
        .setTexture(`${this.enemyKind}-${shell ? "guard" : "prepare"}`);
    } else this.restoreEnemy();
    this.cue.setVisible(true).setText(
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
    this.cue.setVisible(Boolean(this.cue.text));
  }
  private restoreEnemy() {
    this.enemy.stop().setTexture(this.enemyKind);
    if (!this.reduced) this.enemy.play(`monster-${this.enemyKind}-idle`);
  }
  private restoreHero() {
    if (this.reduced) this.hero.stop().setTexture(`${this.heroKey}-1-0`);
    else this.hero.play(`${this.heroKey}-idle-1`, true);
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
  /** Short freeze used as hit-stop; skipped in reduced motion. */
  private wait(ms: number) {
    if (this.reduced || ms <= 0) return Promise.resolve();
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
      this.scene.time.delayedCall(ms, done);
    });
  }
  /** Stack index so simultaneous numbers on one sprite never overlap. */
  private slot(sprite: Phaser.GameObjects.Sprite) {
    const index = this.floating.get(sprite) ?? 0;
    this.floating.set(sprite, index + 1);
    return {
      index,
      release: () =>
        this.floating.set(sprite, Math.max(0, (this.floating.get(sprite) ?? 1) - 1)),
    };
  }
  private number(sprite: Phaser.GameObjects.Sprite, value: string, tint: number) {
    const { index, release } = this.slot(sprite);
    const size = this.scale <= 3 ? 3 : 4;
    const n = this.scene.add
      .bitmapText(
        Math.round(sprite.x + index * 10),
        Math.round(sprite.y - sprite.displayHeight - 20 - index * 30),
        DIGIT_FONT,
        value,
      )
      .setOrigin(0.5, 1)
      .setLetterSpacing(-1)
      .setScale(this.reduced ? size : size * 1.6)
      .setTint(tint)
      .setName("damage-number");
    this.root.add(n);
    if (!this.reduced)
      this.scene.tweens.add({
        targets: n,
        scale: size,
        duration: 120,
        ease: "Back.easeOut",
      });
    this.scene.tweens.add({
      targets: n,
      y: n.y - 26,
      alpha: 0,
      delay: this.reduced ? 0 : 260,
      duration: this.reduced ? 160 : 420,
      onComplete: () => {
        release();
        n.destroy();
      },
    });
  }
  private word(sprite: Phaser.GameObjects.Sprite, text: string, color: string) {
    const { index, release } = this.slot(sprite);
    const n = this.scene.add
      .text(sprite.x, sprite.y - sprite.displayHeight - 20 - index * 30, text, {
        fontFamily: '"DM Sans", Arial, sans-serif',
        fontSize: this.scale <= 3 ? "18px" : "24px",
        fontStyle: "bold",
        color,
        stroke: "#183d35",
        strokeThickness: 5,
      })
      .setOrigin(0.5, 1);
    this.root.add(n);
    this.scene.tweens.add({
      targets: n,
      y: n.y - 24,
      alpha: 0,
      delay: this.reduced ? 0 : 240,
      duration: this.reduced ? 160 : 420,
      onComplete: () => {
        release();
        n.destroy();
      },
    });
  }
  private burst(target: Phaser.GameObjects.Sprite, colors: number[], count = 6) {
    if (this.reduced) return;
    const cx = target.x,
      cy = target.y - target.displayHeight * 0.55,
      size = this.scale;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + 0.4,
        reach = (14 + (i % 3) * 7) * (size / 3);
      const p = this.scene.add.rectangle(
        Math.round(cx),
        Math.round(cy),
        size,
        size,
        colors[i % colors.length],
      );
      this.root.add(p);
      this.scene.tweens.add({
        targets: p,
        x: Math.round(cx + Math.cos(angle) * reach),
        y: Math.round(cy + Math.sin(angle) * reach + reach * 0.4),
        alpha: 0,
        duration: 280,
        ease: "Quad.easeOut",
        onComplete: () => p.destroy(),
      });
    }
  }
  private shake(heavy: boolean) {
    if (this.reduced) return;
    this.scene.cameras.main.shake(heavy ? 170 : 110, heavy ? 0.009 : 0.005);
  }
  async play(events: CombatEvent[], onEvent: (event: CombatEvent) => void) {
    await this.entering;
    if (!this.active) return;
    this.cue.setVisible(false);
    for (const event of events) {
      if (!this.active) return;
      const actor = event.actor === "hero" ? this.hero : this.enemy,
        target = event.actor === "hero" ? this.enemy : this.hero;
      if (event.kind === "damage") {
        const x = actor.x,
          heavy = Boolean(event.heavy),
          away = event.actor === "hero" ? 1 : -1,
          delta = away * (heavy ? 26 : 14);
        if (event.actor === "enemy")
          this.enemy.stop().setTexture(`${this.enemyKind}-attack`);
        else if (!this.reduced) this.hero.play(`${this.heroKey}-walk-1`, true);
        await this.tween(actor, { x: x + delta, ease: "Quad.easeIn" }, 100);
        if (!this.active) return;
        if (event.actor === "hero")
          this.enemy.stop().setTexture(`${this.enemyKind}-hurt`);
        target.setTintFill(0xf1e6ca);
        this.number(target, `-${event.amount ?? 0}`, 0xffe4ba);
        this.burst(
          target,
          event.actor === "hero" ? SPARK[this.enemyKind] : [0xf1e6ca, 0xe3a07a, 0xffffff],
          heavy ? 8 : 6,
        );
        this.shake(heavy);
        if (event.actor === "hero") {
          this.enemyHp = Math.max(0, this.enemyHp - (event.amount ?? 0));
          this.drawEnemyHp(true);
        }
        onEvent(event);
        await this.wait(heavy ? 90 : 65);
        if (!this.active) return;
        target.clearTint();
        const tx = target.x;
        const knock = this.reduced
          ? Promise.resolve()
          : this.tween(
              target,
              { x: tx + away * (heavy ? 10 : 6), yoyo: true, ease: "Quad.easeOut" },
              70,
            );
        await Promise.all([this.tween(actor, { x }, 120), knock]);
        target.x = tx;
        this.restoreEnemy();
        this.restoreHero();
      } else if (event.kind === "heal" || event.kind === "recover") {
        actor.setTint(0xa2dfb3);
        this.number(
          actor,
          `+${event.amount ?? 0}`,
          event.kind === "heal" ? 0xb9f1b3 : 0xa8e1ec,
        );
        this.burst(
          actor,
          event.kind === "heal" ? [0xb9f1b3, 0xf1e6ca] : [0xa8e1ec, 0xf1e6ca],
          5,
        );
        onEvent(event);
        await this.tween(actor, { alpha: 0.65 }, 130);
        await this.tween(actor, { alpha: 1 }, 130);
        actor.clearTint();
      } else if (event.kind === "guard") {
        this.shield.setVisible(true).setScale(this.reduced ? 1 : 0.6);
        this.word(actor, "GUARDA", "#c0e7ef");
        onEvent(event);
        await this.tween(this.shield, { scale: 1, alpha: 0.6, ease: "Back.easeOut" }, 160);
        this.shield.setAlpha(1);
      } else if (event.kind === "prepare") {
        if (event.actor === "enemy")
          this.enemy.stop().setTexture(`${this.enemyKind}-prepare`);
        this.word(actor, "PREPARA", "#e3cb85");
        onEvent(event);
        await this.tween(actor, { alpha: 0.7 }, 110);
        await this.tween(actor, { alpha: 1 }, 110);
        this.restoreEnemy();
      } else if (event.kind === "flee") {
        onEvent(event);
        await this.tween(actor, { x: actor.x - 70, alpha: 0 }, 200);
      } else {
        const victory = event.kind === "victory",
          defeated = victory ? this.enemy : this.hero;
        this.word(
          this.hero,
          victory ? "VITÓRIA" : "RECOMEÇO",
          victory ? "#f2d78a" : "#d7e3cb",
        );
        if (victory) this.burst(this.enemy, SPARK[this.enemyKind], 10);
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
