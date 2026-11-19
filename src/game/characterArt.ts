import type Phaser from "phaser";
import { copyCanvas, outline, paintTexture, rect, type Ctx } from "./pixel";

/**
 * Hand-authored 20×28 characters on the 16 px grid. Direction 0 faces the
 * camera, 1 faces away, 2 left and 3 right (mirror of 2). Frames: 0 standing,
 * 1/2 alternating steps, 3 passing pose with a 1 px lift. Idle frames add a
 * 1 px breath and a blink instead of moving the whole body.
 */
type Kind = "hero" | "hero-f" | "master" | "merchant";
type Tone = [dark: string, base: string, light: string];
type Look = {
  hair: Tone;
  coat: Tone;
  accent: Tone;
  pants: [string, string];
  boots: [string, string];
};

const SKIN = { base: "#e8c093", shade: "#c9966c", blush: "#e3a585" };
const EYE = "#22362f";
const GOLD = "#d7b768";
const SHEATH = "#5d4330";

const LOOKS: Record<Kind, Look> = {
  hero: {
    hair: ["#4e3426", "#6e4a32", "#93683f"],
    coat: ["#2b5059", "#3e6d77", "#62979a"],
    accent: ["#8e4d38", "#b66a49", "#d79a62"],
    pants: ["#2f2e29", "#3e3c34"],
    boots: ["#3e2e24", "#614532"],
  },
  "hero-f": {
    hair: ["#432a28", "#673f37", "#8c5a4a"],
    coat: ["#4c4561", "#6b637f", "#9088a6"],
    accent: ["#7b4f54", "#a86f6c", "#cc958a"],
    pants: ["#2f2e29", "#3e3c34"],
    boots: ["#3e2e24", "#614532"],
  },
  master: {
    hair: ["#a29a85", "#cfc8b4", "#efe9d6"],
    coat: ["#875c30", "#b98446", "#dcae68"],
    accent: ["#1b4150", "#245568", "#3e7a8b"],
    pants: ["#2f2e29", "#3e3c34"],
    boots: ["#3e2e24", "#614532"],
  },
  merchant: {
    hair: ["#4e3426", "#6e4a32", "#93683f"],
    coat: ["#6a5070", "#927193", "#b697b5"],
    accent: ["#47342a", "#5d4636", "#82664d"],
    pants: ["#2f2e29", "#3e3c34"],
    boots: ["#3e2e24", "#614532"],
  },
};

type Pose = { step: 0 | 1 | 2 | 3; breathe: 0 | 1; blink: boolean };

function draw(c: Ctx, kind: Kind, dir: 0 | 1 | 2, pose: Pose) {
  const L = LOOKS[kind];
  const r = (color: string, x: number, y: number, w = 1, h = 1) =>
    rect(c, color, x, y, w, h);
  const u = pose.breathe + (pose.step === 3 ? -1 : 0);
  const robe = kind === "master";
  const swordBearer = kind === "hero" || kind === "hero-f";
  const longHair = kind === "hero-f";

  const leg = (x: number, up: number, near = true) => {
    r(near ? L.pants[1] : L.pants[0], x, 19, 3, 5 - up);
    r(L.pants[0], x + 2, 19, 1, 5 - up);
    r(L.boots[1], x, 24 - up, 3, 2);
    r(L.boots[0], x, 26 - up, 3, 1);
  };
  const sideLeg = (x: number, up: number, near: boolean) => {
    r(near ? L.pants[1] : L.pants[0], x, 19, 3, 5 - up);
    r(L.boots[near ? 1 : 0], x - 1, 24 - up, 4, 2);
    r(L.boots[0], x - 1, 26 - up, 4, 1);
  };

  if (dir === 0 || dir === 1) {
    // Legs: the forward foot reaches the ground, the other lifts 1 px.
    leg(6, pose.step === 2 ? 1 : 0);
    leg(11, pose.step === 1 ? 1 : 0);
    if (swordBearer && dir === 1) {
      r(GOLD, 2, 16 + u, 2, 1);
      r(SHEATH, 2, 17 + u, 1, 6);
      r(GOLD, 2, 23 + u);
    }
    // Arms swing opposite to the legs; front view reads it as 1 px up/down.
    const swing = pose.step === 1 ? -1 : pose.step === 2 ? 1 : 0;
    for (const [x, a] of [
      [3, swing],
      [15, -swing],
    ]) {
      r(L.coat[1], x, 13 + u + a, 2, 5);
      r(x === 3 ? L.coat[2] : L.coat[0], x, 13 + u + a, 1, 4);
      r(L.coat[0], x, 17 + u + a, 2, 1);
      r(SKIN.base, x, 18 + u + a, 2, 2);
      r(SKIN.shade, x + (x === 3 ? 0 : 1), 19 + u + a);
    }
    // Torso
    const torsoH = robe ? 12 : 8;
    r(L.coat[1], 5, 12 + u, 10, torsoH);
    r(L.coat[2], 5, 12 + u, 2, torsoH - 1);
    r(L.coat[0], 13, 12 + u, 2, torsoH);
    r(L.coat[0], 5, 11 + torsoH + u, 10, 1);
    if (robe) {
      for (let i = 0; i < 7; i++) r(L.accent[1], 6 + i, 13 + u + i, 2, 1);
      r(L.accent[2], 6, 13 + u, 1, 1);
    } else {
      r("#9c7d43", 5, 17 + u, 10, 1);
      if (dir === 0) r(GOLD, 9, 17 + u, 2, 1);
    }
    if (kind === "merchant" && dir === 0) {
      r("#e9dcb8", 7, 14 + u, 6, 5);
      r("#cdbf98", 7, 18 + u, 6, 1);
    }
    if (kind === "hero") {
      if (dir === 0) {
        r(L.accent[1], 6, 12 + u, 8, 2);
        r(L.accent[2], 6, 12 + u, 3, 1);
        r(L.accent[0], 11, 14 + u, 2, 2);
      } else {
        r(L.accent[1], 5, 12 + u, 10, 9);
        r(L.accent[2], 6, 12 + u, 3, 1);
        r(L.accent[0], 8, 14 + u, 1, 5);
        r(L.accent[0], 11, 14 + u, 1, 5);
        r(L.accent[0], 5, 20 + u, 10, 1);
      }
    }
    if (kind === "hero-f") {
      if (dir === 0) {
        r(L.accent[1], 6, 12 + u, 8, 1);
        r(GOLD, 9, 13 + u, 2, 1);
      } else {
        r(L.accent[1], 5, 12 + u, 10, 9);
        r(L.accent[2], 6, 14 + u, 2, 1);
        r(L.accent[0], 9, 15 + u, 1, 5);
        r(L.accent[0], 5, 20 + u, 10, 1);
      }
    }
    if (swordBearer && dir === 0) {
      r(GOLD, 16, 16 + u, 2, 1);
      r(SHEATH, 17, 17 + u, 1, 6);
      r(GOLD, 17, 23 + u);
    }
    // Head
    if (kind === "merchant") {
      r(L.hair[1], 5, 5 + u, 10, 4);
    }
    r(SKIN.base, 6, 4 + u, 8, 8);
    r(SKIN.base, 5, 6 + u, 10, 4);
    r(SKIN.shade, 6, 11 + u, 8, 1);
    if (dir === 0) {
      r(L.hair[1], 6, 2 + u, 8, 1);
      r(L.hair[1], 5, 3 + u, 10, 3);
      r(L.hair[2], 7, 3 + u, 4, 1);
      r(L.hair[0], 12, 4 + u, 2, 1);
      r(L.hair[1], 5, 6 + u, 1, 3);
      r(L.hair[1], 14, 6 + u, 1, 3);
      r(L.hair[1], 6, 6 + u, 2, 1);
      r(L.hair[1], 11, 6 + u, 3, 1);
      if (longHair) {
        r(L.hair[1], 4, 5 + u, 2, 9);
        r(L.hair[1], 14, 5 + u, 2, 9);
        r(L.hair[0], 4, 12 + u, 1, 2);
        r(L.hair[0], 15, 12 + u, 1, 2);
      }
      if (pose.blink) {
        r(SKIN.shade, 7, 8 + u, 2, 1);
        r(SKIN.shade, 11, 8 + u, 2, 1);
      } else {
        r(EYE, 7, 7 + u, 1, 2);
        r(EYE, 12, 7 + u, 1, 2);
      }
      r(SKIN.blush, 6, 9 + u);
      r(SKIN.blush, 13, 9 + u);
      if (kind === "master") {
        r(L.hair[1], 6, 9 + u, 8, 4);
        r(L.hair[2], 7, 9 + u, 2, 2);
        r(L.hair[0], 9, 12 + u, 2, 1);
        r(L.hair[2], 7, 6 + u, 2, 1);
        r(L.hair[2], 11, 6 + u, 2, 1);
      } else r(SKIN.shade, 9, 10 + u, 2, 1);
    } else {
      r(L.hair[1], 6, 2 + u, 8, 1);
      r(L.hair[1], 5, 3 + u, 10, 8);
      r(L.hair[2], 7, 3 + u, 4, 1);
      r(L.hair[0], 5, 9 + u, 10, 2);
      r(SKIN.shade, 7, 11 + u, 6, 1);
      r(SKIN.base, 4, 7 + u, 1, 2);
      r(SKIN.base, 15, 7 + u, 1, 2);
      if (longHair) {
        r(L.hair[1], 5, 10 + u, 10, 4);
        r(L.hair[0], 5, 13 + u, 10, 1);
        r(L.hair[2], 8, 11 + u, 1, 2);
      }
    }
    if (kind === "merchant") {
      r(L.accent[1], 3, 3 + u, 14, 2);
      r(L.accent[0], 3, 4 + u, 14, 1);
      r(L.accent[1], 6, 1 + u, 8, 2);
      r("#b66a49", 6, 2 + u, 8, 1);
      r(L.accent[2], 7, 1 + u, 3, 1);
    }
    return;
  }

  // Side view (facing left). Far parts first, near parts last.
  if (swordBearer) {
    r(GOLD, 13, 16 + u, 2, 1);
    r(SHEATH, 15, 17 + u, 1, 5);
    r(GOLD, 15, 22 + u);
  }
  const stride = pose.step === 1 || pose.step === 2;
  const nearFront = pose.step !== 2;
  if (stride) {
    sideLeg(11, 1, !nearFront);
    sideLeg(7, 0, nearFront);
  } else {
    sideLeg(10, 0, false);
    sideLeg(8, 0, true);
  }
  if (kind === "hero" || kind === "hero-f") {
    r(L.accent[1], 13, 12 + u, 2, 8);
    r(L.accent[0], 14, 13 + u, 1, 7);
  }
  const torsoH = robe ? 12 : 8;
  r(L.coat[1], 6, 12 + u, 8, torsoH);
  r(L.coat[2], 6, 12 + u, 2, torsoH - 1);
  r(L.coat[0], 12, 12 + u, 2, torsoH);
  r(L.coat[0], 6, 11 + torsoH + u, 8, 1);
  if (robe) for (let i = 0; i < 6; i++) r(L.accent[1], 7 + i, 13 + u + i, 1, 1);
  else {
    r("#9c7d43", 6, 17 + u, 8, 1);
    r(GOLD, 6, 17 + u, 2, 1);
  }
  if (kind === "merchant") r("#e9dcb8", 6, 14 + u, 3, 5);
  if (kind === "hero") {
    r(L.accent[1], 6, 12 + u, 7, 2);
    r(L.accent[2], 6, 12 + u, 3, 1);
    r(L.accent[1], 13, 13 + u, 3, 1);
    if (stride) r(L.accent[2], 15, 12 + u);
  }
  if (kind === "hero-f") {
    r(L.accent[1], 6, 12 + u, 7, 1);
    r(GOLD, 7, 13 + u);
  }
  // Head (profile)
  r(SKIN.base, 5, 4 + u, 8, 8);
  r(SKIN.base, 4, 8 + u);
  r(SKIN.shade, 6, 11 + u, 5, 1);
  if (kind === "merchant") r(L.hair[1], 9, 5 + u, 5, 4);
  r(L.hair[1], 6, 2 + u, 8, 1);
  r(L.hair[1], 5, 3 + u, 10, 3);
  r(L.hair[1], 10, 6 + u, 5, longHair ? 8 : 4);
  r(L.hair[0], 12, 7 + u, 3, longHair ? 7 : 3);
  r(L.hair[2], 7, 3 + u, 4, 1);
  r(L.hair[1], 5, 6 + u, 2, 1);
  r(SKIN.base, 10, 8 + u, 1, 2);
  r(SKIN.shade, 10, 9 + u);
  if (pose.blink) r(SKIN.shade, 6, 8 + u, 2, 1);
  else r(EYE, 6, 7 + u, 1, 2);
  r(SKIN.blush, 7, 9 + u);
  if (kind === "master") {
    r(L.hair[1], 4, 9 + u, 7, 4);
    r(L.hair[2], 5, 9 + u, 2, 2);
    r(L.hair[2], 6, 6 + u, 2, 1);
  } else r(SKIN.shade, 5, 10 + u);
  if (kind === "merchant") {
    r(L.accent[1], 2, 3 + u, 14, 2);
    r(L.accent[0], 2, 4 + u, 14, 1);
    r(L.accent[1], 6, 1 + u, 8, 2);
    r("#b66a49", 6, 2 + u, 8, 1);
    r(L.accent[2], 7, 1 + u, 3, 1);
  }
  // Near arm swings horizontally.
  const ax = 9 + (pose.step === 1 ? 2 : pose.step === 2 ? -2 : 0);
  r(L.coat[1], ax, 13 + u, 2, 5);
  r(L.coat[2], ax, 13 + u, 1, 4);
  r(L.coat[0], ax, 17 + u, 2, 1);
  r(SKIN.base, ax, 18 + u, 2, 2);
  r(SKIN.shade, ax + 1, 19 + u);
}

export const CHARACTER_KINDS: readonly Kind[] = ["hero", "hero-f", "master", "merchant"];

export function createCharacterArt(scene: Phaser.Scene) {
  for (const kind of CHARACTER_KINDS) {
    const frame = (key: string, dir: 0 | 1 | 2 | 3, pose: Pose) => {
      if (dir === 3) {
        const left = scene.textures
          .get(key.replace(`${kind}-3-`, `${kind}-2-`))
          .getSourceImage() as HTMLCanvasElement;
        paintTexture(scene, key, 20, 28, (c) => c.drawImage(copyCanvas(left, true), 0, 0));
        return;
      }
      paintTexture(scene, key, 20, 28, (c) => {
        draw(c, kind, dir, pose);
        outline(c);
      });
    };
    for (const dir of [0, 1, 2, 3] as const) {
      for (const step of [0, 1, 2, 3] as const)
        frame(`${kind}-${dir}-${step}`, dir, { step, breathe: 0, blink: false });
      const idle: Pose[] = [
        { step: 0, breathe: 0, blink: false },
        { step: 0, breathe: 1, blink: false },
        { step: 0, breathe: 0, blink: false },
        { step: 0, breathe: 0, blink: dir !== 1 },
      ];
      idle.forEach((pose, f) => frame(`${kind}-${dir}-idle-${f}`, dir, pose));
      const idleKey = `${kind}-idle-${dir}`,
        walkKey = `${kind}-walk-${dir}`;
      if (!scene.anims.exists(idleKey))
        scene.anims.create({
          key: idleKey,
          // Mostly still: a short breath and an occasional blink.
          frames: [0, 0, 1, 1, 2, 2, 0, 3].map((f) => ({
            key: `${kind}-${dir}-idle-${f}`,
          })),
          frameRate: 4,
          repeat: -1,
        });
      if (!scene.anims.exists(walkKey))
        scene.anims.create({
          key: walkKey,
          frames: [1, 3, 2, 3].map((f) => ({ key: `${kind}-${dir}-${f}` })),
          frameRate: 8,
          repeat: -1,
        });
    }
  }
}
