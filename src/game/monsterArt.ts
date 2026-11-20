import type Phaser from "phaser";
import type { EnemyId } from "../domain/game";
import { ellipse, outline, rect, type Ctx } from "./pixel";

type Pose = "idle" | "attack" | "hurt" | "guard" | "prepare";
type Tones = [dark: string, mid: string, light: string, hi: string];

const sizes: Record<EnemyId, [number, number]> = {
  sprout: [32, 32],
  beetle: [32, 32],
  moth: [32, 32],
  guardian: [48, 52],
};

const INK = "#183d35";
const PAPER = "#f1e6ca";
const GOLD = "#d7b768";
const GLOW = "#f3dc92";

/** Rounded volume lit from the upper left: dark rim, mid body, light core, glint. */
function blob(c: Ctx, cx: number, cy: number, rx: number, ry: number, t: Tones) {
  ellipse(c, t[0], cx, cy, rx, ry);
  ellipse(c, t[1], cx - 1, cy - 1, Math.max(1, rx - 1), Math.max(1, ry - 1));
  if (rx > 3 && ry > 3)
    ellipse(c, t[2], cx - 2, cy - 2, Math.max(1, rx - 3), Math.max(1, ry - 3));
  if (rx > 2 && ry > 2)
    rect(c, t[3], cx - Math.ceil(rx / 2) - 1, cy - Math.ceil(ry / 2) - 1, 2, 1);
}

function painter(c: Ctx, width: number) {
  const r = (color: string, x: number, y: number, w = 1, h = 1) => rect(c, color, x, y, w, h);
  /** Draws a rect and its mirror across the vertical centre line. */
  const sym = (color: string, x: number, y: number, w = 1, h = 1) => {
    r(color, x, y, w, h);
    r(color, width - x - w, y, w, h);
  };
  return { r, sym };
}

// ── Broto Errante: seed bulb with two leaves, root feet and a big face ──
const SPROUT_BODY: Tones = ["#335f3e", "#5a8d4b", "#86ad5c", "#c2d184"];
const SPROUT_LEAF: Tones = ["#2c5e40", "#4b8a4d", "#86b660", "#cfe08e"];
function sprout(c: Ctx, frame: number, pose: Pose) {
  const { r, sym } = painter(c, 32);
  const sway = [0, 1, 0, -1][frame];
  let cy = 21,
    rx = 8,
    ry = 7;
  if (pose === "attack") [cy, rx, ry] = [21, 7, 8];
  else if (pose === "hurt" || (pose === "idle" && frame === 2)) [cy, rx, ry] = [22, 9, 6];
  const bottom = cy + ry;
  // Root feet
  sym("#5b4331", 10, bottom - 2, 2, 3);
  sym("#7a5a3c", 10, bottom - 2, 1, 2);
  sym("#5b4331", 8, bottom, 3, 1);
  // Stem with a curl
  const top = cy - ry - 4;
  r("#2c5e40", 15, top, 2, 6);
  r("#4b8a4d", 15, top, 1, 5);
  r("#4b8a4d", 17, top - 1, 2, 1);
  r("#2c5e40", 18, top - 2, 1, 1);
  // Leaves: swept back to attack, drooping when hurt
  const lift = pose === "attack" ? -2 : pose === "hurt" ? 3 : 0;
  const spread = pose === "attack" ? 2 : pose === "hurt" ? -1 : 0;
  // Each leaf is a tapered blade rising outward from the stem tip.
  const tilt = pose === "attack" ? 0.42 : pose === "hurt" ? -0.35 : 0.4;
  for (const side of [-1, 1]) {
    const bend = tilt + (side > 0 ? sway : -sway) * 0.12;
    const len = 10 + spread;
    for (let i = 0; i <= len; i++) {
      const x = side < 0 ? 15 - i : 16 + i,
        y = top + 1 + lift - Math.round(i * bend),
        th = Math.round(2.6 * Math.sin((Math.PI * (i + 0.5)) / (len + 1)));
      r(SPROUT_LEAF[0], x, y - th, 1, th * 2 + 1);
      if (th > 0) r(SPROUT_LEAF[1], x, y - th, 1, th * 2);
      if (th > 1) r(SPROUT_LEAF[2], x, y - th, 1, th);
      if (th > 1 && i > 2 && i < len - 1) r(SPROUT_LEAF[0], x, y, 1, 1);
      if (i === Math.floor(len / 2) - 1) r(SPROUT_LEAF[3], x, y - th, 1, 1);
    }
  }
  // Body and lighter belly
  blob(c, 16, cy, rx, ry, SPROUT_BODY);
  ellipse(c, "#a9c873", 16, cy + 2, rx - 3, ry - 3);
  ellipse(c, "#c2d184", 15, cy + 1, rx - 5, Math.max(1, ry - 5));
  // Face
  const ey = cy - 2;
  if (pose === "hurt") {
    for (const [dx, dy] of [
      [0, 0],
      [1, 1],
      [0, 2],
    ])
      r(INK, 11 + dx, ey + dy), r(INK, 20 - dx, ey + dy);
    r(INK, 14, ey + 4), r(INK, 15, ey + 3), r(INK, 16, ey + 4), r(INK, 17, ey + 3);
    r("#9ac2c0", 21, ey + 3, 1, 2);
  } else {
    const eh = pose === "attack" ? 2 : 3;
    sym(INK, 11, ey + (3 - eh), 2, eh);
    sym(PAPER, 11, ey + (3 - eh), 1, 1);
    if (pose === "attack") {
      r(INK, 10, ey - 1, 2, 1), r(INK, 12, ey, 1, 1);
      r(INK, 20, ey - 1, 2, 1), r(INK, 19, ey, 1, 1);
      r(INK, 14, ey + 3, 4, 2);
      r("#b66a49", 15, ey + 4, 2, 1);
    } else r("#335f3e", 15, ey + 4, 2, 1);
  }
  sym("#d79a62", 9, ey + 3, 2, 1);
}

// ── Besouro de Pedra: domed stone shell, mossy plates, amber eyes ──
const STONE: Tones = ["#46524b", "#66746a", "#8d9784", "#c0c3a6"];
const STONE_HEAD: Tones = ["#3a4741", "#56645a", "#76836f", "#a3ab92"];
function beetle(c: Ctx, frame: number, pose: Pose) {
  const { r, sym } = painter(c, 32);
  const step = frame % 2;
  const guard = pose === "guard";
  const angry = pose === "attack" || pose === "prepare";
  const lift = guard ? 3 : angry ? -1 : 0;
  // Legs behind the shell, alternating lift while idle
  for (let i = 0; i < 3; i++) {
    const y = 14 + i * 4 + lift,
      up = (i + step) % 2;
    if (guard) {
      sym("#2c3833", 4, y + 1, 3, 1);
      continue;
    }
    sym(STONE_HEAD[1], 2, y - up, 4, 2);
    sym(STONE_HEAD[2], 3, y - up, 2, 1);
    sym(STONE_HEAD[1], 1, y + 1 - up, 2, 3);
    sym(STONE[2], 1, y + 3 - up, 1, 1);
  }
  // Shell
  const sx = guard ? 14 : 13,
    sy = guard ? 8 : 9,
    cy = 14 + lift + (pose === "idle" && frame === 2 ? 1 : 0);
  blob(c, 16, cy, sx, sy, STONE);
  r(STONE[0], 15, cy - sy + 2, 2, sy * 2 - 3);
  r(STONE[3], 14, cy - sy + 3, 1, 3);
  // Cracks and plates
  r(STONE[0], 7, cy - 1, 3, 1), r(STONE[0], 9, cy, 1, 2);
  r(STONE[0], 21, cy + 2, 4, 1), r(STONE[0], 24, cy + 3, 1, 2);
  r(STONE[0], 19, cy - 5, 1, 2);
  r(STONE[3], 6, cy - 4, 2, 1);
  // Moss caps
  ellipse(c, "#3f6b46", 10, cy - sy + 2, 4, 1);
  ellipse(c, "#5b8a50", 9, cy - sy + 1, 3, 1);
  r("#91aa62", 8, cy - sy + 1, 2, 1);
  ellipse(c, "#3f6b46", 22, cy - 3, 3, 1);
  r("#91aa62", 21, cy - 4, 1, 1);
  if (guard) {
    sym("#e6e2c6", 4, cy - 1, 1, 3);
    sym("#e6e2c6", 8, cy + 5, 3, 1);
    sym(GOLD, 13, cy + sy, 1, 1);
    return;
  }
  // Head peeking from under the front of the shell
  const hy = 24 + (angry ? 1 : 0);
  // Short horn-antennae, then the head plate with a brow ridge.
  sym(STONE_HEAD[0], 11, hy - 6, 1, 3);
  sym(STONE_HEAD[2], 10, hy - 7, 1, 1);
  blob(c, 16, hy, 7, 4, STONE_HEAD);
  r(STONE_HEAD[0], 11, hy - 2, 10, 1);
  const blink = pose === "idle" && frame === 3;
  if (pose === "hurt") {
    sym(GOLD, 12, hy, 2, 1);
    r("#d6d4b8", 14, cy - 6, 1, 4), r("#d6d4b8", 15, cy - 3, 1, 1);
    r(STONE[2], 26, 3, 2, 2), r(STONE[1], 28, 6, 1, 1), r(STONE[2], 4, 5, 1, 1);
  } else {
    if (blink) sym(GOLD, 12, hy, 2, 1);
    else {
      sym(angry ? GLOW : GOLD, 12, hy - 1, 2, 2);
      sym(angry ? "#fff3c8" : GLOW, 12, hy - 1, 1, 1);
    }
  }
  // Mandibles
  if (angry) {
    sym(STONE_HEAD[0], 7, hy + 2, 4, 1);
    sym(STONE_HEAD[0], 7, hy + 3, 1, 2);
    sym(STONE[3], 8, hy + 2, 1, 1);
  } else {
    sym(STONE_HEAD[0], 10, hy + 3, 4, 1);
    sym(STONE_HEAD[0], 10, hy + 4, 1, 1);
    sym(STONE[3], 11, hy + 3, 1, 1);
  }
}

// ── Mariposa da Névoa: fluffy body, misty wings with eye spots ──
const WING: Tones = ["#58637e", "#7f88a6", "#aab1c8", "#dfe2ea"];
const WING_LOW: Tones = ["#5e5874", "#7d7696", "#a39cba", "#d5d0e2"];
const FLUFF: Tones = ["#9c8f74", "#c9b994", "#e9dcc0", "#f7efdc"];
function moth(c: Ctx, frame: number, pose: Pose) {
  const { r, sym } = painter(c, 32);
  const hurt = pose === "hurt";
  // Wing states: open, half, closed, folded tight and raised high.
  const state =
    pose === "attack" ? "open" : pose === "prepare" ? "raised" : pose === "guard" ? "folded"
    : pose === "hurt" ? "half" : (["closed", "open", "half", "open"] as const)[frame];
  const [ux, uy, urx, ury] = {
    open: [8, 10, 7, 7],
    raised: [8, 8, 7, 7],
    half: [9, 12, 6, 6],
    closed: [10, 14, 5, 6],
    folded: [11, 15, 4, 5],
  }[state];
  const twitch = pose === "idle" && frame === 3 ? 1 : 0;
  for (const cx of [ux, 32 - ux]) {
    blob(c, cx + (cx < 16 ? 2 : -2), uy + 9, 4, 4, WING_LOW);
    blob(c, cx, uy, urx, ury, WING);
    ellipse(c, "#245568", cx, uy + 1, 2, 2);
    r(GOLD, cx - 1, uy, 2, 1);
    r(WING[3], cx - (cx < 16 ? 3 : -2), uy - ury + 2, 2, 1);
  }
  // Scalloped lower edge of the upper wings
  for (let i = 0; i < 3; i++) sym(WING[0], ux - urx + 2 + i * 3, uy + ury - 1, 1, 1);
  if (hurt) {
    c.clearRect(3, uy - 2, 2, 3);
    c.clearRect(27, uy + 1, 2, 2);
  }
  // Body and fluff collar
  blob(c, 16, 19, 4, 7, FLUFF);
  r("#8a7a5c", 13, 20, 6, 1), r("#8a7a5c", 13, 23, 6, 1), r("#8a7a5c", 14, 25, 4, 1);
  sym(FLUFF[3], 13, 17, 1, 1);
  r("#d7b768", 15, 21, 2, 1);
  ellipse(c, FLUFF[1], 16, 12, 6, 3);
  ellipse(c, FLUFF[2], 15, 11, 5, 2);
  sym(FLUFF[3], 11, 11, 1, 1);
  sym(FLUFF[1], 10, 13, 1, 1);
  // Head with big dark eyes
  blob(c, 16, 9, 4, 3, FLUFF);
  if (hurt) {
    sym(INK, 12, 8, 1, 1), sym(INK, 13, 9, 1, 1), sym(INK, 12, 10, 1, 1);
  } else {
    sym(INK, 12, 8, 2, 3);
    sym("#9ac2c0", 12, 8, 1, 1);
  }
  // Feathered antennae (twitch outward on one idle frame)
  for (const [x, y] of [
    [13, 5],
    [12, 4],
    [11 - twitch, 3],
    [10 - twitch, 3 - twitch],
  ])
    sym("#5c5848", x, y, 1, 1);
  sym("#9c8f74", 11 - twitch, 2, 1, 1);
  sym("#9c8f74", 12, 3, 1, 1);
  // Mist dust
  if (pose === "attack")
    for (const [x, y] of [
      [3, 22],
      [6, 26],
      [26, 23],
      [28, 18],
      [2, 15],
    ])
      r("#e6e9ee", x, y, 1, 1);
  if (hurt) r("#e6e9ee", 25, 27, 1, 1), r("#e6e9ee", 6, 28, 1, 1);
}

// ── Guardião de Musgo: mossy stone golem with a sapling and glowing runes ──
const G_STONE: Tones = ["#3a4640", "#56645a", "#7a8676", "#a9b09a"];
const G_MOSS: Tones = ["#2f5a3c", "#4f7a4c", "#76a05a", "#a6c47a"];
function guardian(c: Ctx, frame: number, pose: Pose) {
  const { r, sym } = painter(c, 48);
  const b = frame === 2 ? 1 : 0;
  const glow = pose === "prepare" || pose === "attack" || frame === 2;
  const hurt = pose === "hurt";
  // Pillar legs with mossy feet
  const stance = pose === "attack" ? 2 : 0;
  sym(G_STONE[0], 13 - stance, 39, 8, 11);
  sym(G_STONE[1], 14 - stance, 39, 6, 10);
  sym(G_STONE[2], 14 - stance, 40, 2, 7);
  sym(G_MOSS[1], 12 - stance, 48, 10, 2);
  sym(G_MOSS[2], 13 - stance, 48, 3, 1);
  // Raised arms go behind the head
  /** Chamfered stone block lit from the upper left. */
  const block = (cx: number, cy: number, w: number, h: number) => {
    const x = cx - (w >> 1),
      y = cy - (h >> 1);
    r(G_STONE[0], x, y + 1, w, h - 2);
    r(G_STONE[0], x + 1, y, w - 2, h);
    r(G_STONE[1], x + 1, y + 1, w - 2, h - 2);
    r(G_STONE[2], x + 1, y + 1, w - 3, 2);
    r(G_STONE[2], x + 1, y + 1, 2, h - 3);
    r(G_STONE[3], x + 2, y + 1, 2, 1);
    r(G_STONE[0], x + w - 2, y + 2, 1, h - 4);
  };
  const arm = (cx: number, cy: number, fx: number, fy: number) => {
    block(cx, cy, 10, 11);
    block(fx, fy, 11, 9);
    // Knuckles
    r(G_STONE[0], fx - 4, fy + 1, 9, 1);
    r(G_STONE[0], fx - 2, fy + 2, 1, 2), r(G_STONE[0], fx + 1, fy + 2, 1, 2);
  };
  const arms = () => {
    if (pose === "prepare") {
      arm(9, 24 + b, 8, 12);
      arm(39, 24 + b, 40, 12);
    } else if (pose === "attack") {
      arm(9, 27, 11, 41);
      arm(39, 27, 37, 41);
    } else if (pose === "guard") {
      arm(9, 27 + b, 18, 33);
      arm(39, 27 + b, 30, 33);
    } else {
      arm(8, 27 + b, 7, 38 + b);
      arm(40, 27 + b, 41, 38 + b);
    }
    // Moss on the shoulders
    for (const cx of [8, 40]) {
      ellipse(c, G_MOSS[1], cx, 22 + b, 5, 2);
      r(G_MOSS[3], cx - 3, 21 + b, 2, 1);
    }
  };
  if (pose === "prepare") arms();
  // Boulder body
  blob(c, 24, 28 + b, 15, 13, G_STONE);
  r(G_STONE[0], 14, 34 + b, 3, 1), r(G_STONE[0], 31, 36 + b, 4, 1), r(G_STONE[0], 33, 37 + b, 1, 2);
  // Chest rune
  const rune = hurt ? "#6f6a4c" : glow ? GLOW : GOLD;
  r(rune, 23, 30 + b, 2, 6);
  r(rune, 21, 32 + b, 6, 1);
  r(rune, 21, 35 + b, 1, 1), r(rune, 26, 35 + b, 1, 1);
  if (pose === "prepare") sym("#f7ecb8", 19, 31 + b, 1, 1), sym("#f7ecb8", 20, 28 + b, 1, 1);
  // Moss cap with drips
  blob(c, 24, 18 + b, 15, 6, G_MOSS);
  r(G_MOSS[1], 11, 21 + b, 2, 4), r(G_MOSS[1], 34, 22 + b, 2, 5), r(G_MOSS[0], 18, 23 + b, 1, 3);
  r(G_MOSS[0], 29, 23 + b, 1, 2);
  // Face hollow and eyes
  ellipse(c, "#1d2c27", 24, 26 + b, 8, 4);
  r(G_STONE[0], 15, 22 + b, 18, 1);
  r(G_STONE[2], 16, 21 + b, 16, 1);
  if (hurt) sym("#8a7f52", 19, 26 + b, 3, 1);
  else {
    sym(glow ? GLOW : GOLD, 19, 25 + b, 3, 2);
    sym(glow ? "#fff6d0" : GLOW, 19, 25 + b, 1, 1);
  }
  // Sapling with a small flower
  r("#5b4331", 25, 6 + b, 1, 7);
  ellipse(c, G_MOSS[1], 22, 8 + b, 3, 1);
  ellipse(c, G_MOSS[2], 29, 7 + b, 3, 1);
  r(G_MOSS[3], 21, 7 + b, 1, 1);
  r("#b66a49", 25, 4 + b, 2, 2);
  r(GOLD, 25, 4 + b, 1, 1);
  if (pose !== "prepare") arms();
  if (hurt) {
    r(G_STONE[2], 3, 10, 2, 2), r(G_STONE[1], 44, 14, 2, 1), r(G_MOSS[2], 6, 6, 1, 1);
    r("#d6d4b8", 30, 30, 1, 4);
  }
}

function paint(c: Ctx, kind: EnemyId, frame: number, pose: Pose) {
  if (kind === "sprout") sprout(c, frame, pose);
  else if (kind === "beetle") beetle(c, frame, pose);
  else if (kind === "moth") moth(c, frame, pose);
  else guardian(c, frame, pose);
}

export function createMonsterArt(scene: Phaser.Scene) {
  for (const kind of Object.keys(sizes) as EnemyId[]) {
    const [w, h] = sizes[kind];
    const texture = (key: string, frame: number, pose: Pose) => {
      const t = scene.textures.createCanvas(key, w, h)!;
      paint(t.context, kind, frame, pose);
      outline(t.context);
      t.refresh();
    };
    texture(kind, 0, "idle");
    for (let frame = 0; frame < 4; frame++)
      texture(`${kind}-idle-${frame}`, frame, "idle");
    for (const pose of ["attack", "hurt", "guard", "prepare"] as const)
      texture(`${kind}-${pose}`, 0, pose);
    scene.anims.create({
      key: `monster-${kind}-idle`,
      frames: Array.from({ length: 4 }, (_, frame) => ({
        key: `${kind}-idle-${frame}`,
      })),
      frameRate: { sprout: 3, beetle: 2, moth: 5, guardian: 2 }[kind],
      repeat: -1,
      repeatDelay: { sprout: 650, beetle: 950, moth: 500, guardian: 1200 }[
        kind
      ],
      yoyo: true,
    });
  }
}
