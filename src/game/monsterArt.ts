import type Phaser from "phaser";
import type { EnemyId } from "../domain/game";

type Pose = "idle" | "attack" | "hurt" | "guard" | "prepare";

const sizes: Record<EnemyId, [number, number]> = {
  sprout: [32, 32],
  beetle: [32, 32],
  moth: [32, 32],
  guardian: [48, 52],
};

function paint(
  c: CanvasRenderingContext2D,
  kind: EnemyId,
  frame: number,
  pose: Pose,
) {
  const r = (color: string, x: number, y: number, w: number, h: number) => {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
  };
  const active = pose === "attack" || pose === "prepare";
  const hurt = pose === "hurt";
  if (kind === "sprout") {
    const lift = frame === 2 ? 1 : 0;
    r("#3c5a3f", 8, 28, 17, 2);
    r("#354f38", 7, 25, 5, 4);
    r("#354f38", 21, 25, 5, 4);
    r("#567743", 9, 26, 3, 2);
    r("#567743", 22, 26, 3, 2);
    r("#1f4237", 7, 13, 19, 13);
    r("#628446", 8, 14, 17, 11);
    r("#a0b567", 10, 15, 13, 8);
    r("#c2cd81", 11, 16, 5, 2);
    r("#748d50", 19, 19, 5, 4);
    r("#244638", 12, 20, 3, hurt ? 1 : 2);
    r("#244638", 20, 20, 3, hurt ? 1 : 2);
    r("#e7e9b6", 12, 20, 1, 1);
    r("#e7e9b6", 20, 20, 1, 1);
    r("#a56a4b", 16, 23, 3, 1);
    r("#2c533b", 15, 6 - lift, 3, 9);
    // Three separated leaves keep the silhouette readable at the far zoom.
    r("#244d3a", 2, 6 - lift, 13, 7);
    r("#65934d", 3, 7 - lift, 11, 5);
    r("#b3c476", 5, 7 - lift, 7, 2);
    r("#31583c", 19, 4 + lift, 12, 9);
    r("#78a451", 20, 5 + lift, 10, 6);
    r("#b4c778", 22, 5 + lift, 6, 2);
    r("#416f42", 12, 3, 7, 5);
    r("#9fbc69", 14, 2, 4, 4);
    if (active) {
      r("#c6d683", 25, 10, 6, 3);
      r("#31583c", 26, 13, 4, 2);
    }
  } else if (kind === "beetle") {
    const step = frame === 1 || frame === 3 ? 1 : 0;
    r("#43584a", 3, 27, 26, 2);
    for (const x of [2, 7, 22, 27]) {
      r("#273f39", x, 21 + ((x + step) % 2), 3, 7);
      r("#74846b", x, 26 + ((x + step) % 2), 4, 2);
    }
    r("#263e39", 3, 13, 26, 13);
    r("#697968", 5, 12, 22, 12);
    r("#3e574a", 7, 8, 18, 3);
    r("#8c9b7a", 8, 7, 16, 14);
    r("#b1b392", 10, 8, 10, 4);
    r("#71826d", 20, 10, 4, 10);
    r("#3b5549", 15, 8, 2, 14);
    r("#526657", 11, 13, 3, 7);
    r("#aeb496", 19, 12, 3, 3);
    r("#31483f", 7, 22, 18, 5);
    r("#e6ce8f", 8, 23, 3, 2);
    r("#e6ce8f", 22, 23, 3, 2);
    r("#303f36", 4, 16, 3, 5);
    r("#303f36", 26, 16, 3, 5);
    if (pose === "guard") {
      r("#c4c8a0", 7, 7, 18, 2);
      r("#a7b196", 5, 12, 2, 11);
      r("#a7b196", 26, 12, 2, 11);
    }
    if (active) {
      r("#d5c48a", 8, 21, 4, 2);
      r("#d5c48a", 21, 21, 4, 2);
    }
    if (hurt) r("#d0be96", 12, 10, 9, 2);
  } else if (kind === "moth") {
    const open = frame === 1 || frame === 3 || active;
    const top = open ? 3 : 7;
    r("#566262", 13, 28, 7, 2);
    r("#434e58", 3, top + 2, 10, 18);
    r("#777d98", 4, top + 3, 9, 16);
    r("#c3bad0", 5, top + 4, 6, 8);
    r("#ebdfd4", 6, top + 6, 3, 3);
    r("#9ba1b3", 5, top + 14, 5, 3);
    r("#434e58", 19, top + 2, 10, 18);
    r("#777d98", 19, top + 3, 9, 16);
    r("#c3bad0", 21, top + 4, 6, 8);
    r("#ebdfd4", 23, top + 6, 3, 3);
    r("#9ba1b3", 22, top + 14, 5, 3);
    r("#34474d", 13, 10, 6, 17);
    r("#859297", 15, 11, 3, 13);
    r("#e9d8a9", 14, 12, 4, 3);
    r("#384a4c", 13, 6, 2, 5);
    r("#384a4c", 18, 6, 2, 5);
    r("#ded7c0", 13, 5, 2, 2);
    r("#ded7c0", 18, 5, 2, 2);
    if (hurt) r("#f1e4d8", 14, 16, 4, 2);
  } else {
    const breathe = frame === 2 ? 1 : 0;
    r("#37573e", 11, 48, 28, 3);
    r("#263e37", 10, 38, 12, 11);
    r("#263e37", 28, 38, 12, 11);
    r("#68804f", 12, 40, 8, 8);
    r("#68804f", 30, 40, 8, 8);
    r("#223e35", 8, 13 + breathe, 32, 30);
    r("#58764a", 11, 15 + breathe, 26, 26);
    r("#85945d", 15, 16 + breathe, 18, 20);
    r("#486743", 20, 31, 11, 7);
    r("#223e35", 2, 20 + breathe, 11, 26);
    r("#466b44", 4, 22 + breathe, 8, 21);
    r("#1e3b34", 36, 20 + breathe, 10, 26);
    r("#466b44", 37, 22 + breathe, 7, 21);
    r("#345d3e", 8, 8 + breathe, 31, 12);
    r("#709253", 12, 6 + breathe, 25, 10);
    r("#a1b46a", 14, 5 + breathe, 18, 4);
    r("#416b43", 4, 11, 11, 6);
    r("#416b43", 34, 11, 10, 7);
    r("#d7bb75", 15, 21 + breathe, 5, pose === "prepare" ? 5 : 3);
    r("#d7bb75", 29, 21 + breathe, 5, pose === "prepare" ? 5 : 3);
    r("#293d33", 21, 28, 8, 2);
    r("#9bae6b", 10, 17, 4, 7);
    r("#9bae6b", 34, 15, 3, 8);
    if (active) {
      r("#e8d28c", 16, 20, 4, 5);
      r("#e8d28c", 29, 20, 4, 5);
      r("#8eaa64", 5, 14, 7, 4);
      r("#8eaa64", 37, 14, 7, 4);
    }
    if (hurt) r("#b6ba83", 20, 15, 10, 2);
  }
}

export function createMonsterArt(scene: Phaser.Scene) {
  for (const kind of Object.keys(sizes) as EnemyId[]) {
    const [w, h] = sizes[kind];
    const texture = (key: string, frame: number, pose: Pose) => {
      const t = scene.textures.createCanvas(key, w, h)!;
      paint(t.context, kind, frame, pose);
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
