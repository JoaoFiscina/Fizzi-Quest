import type Phaser from "phaser";
import { hash2 } from "./noise";
import {
  editTexture,
  ellipse,
  groundShadow,
  outline,
  paintTexture,
  rect,
  type Ctx,
} from "./pixel";

type Tones = { dark: string; mid: string; light: string; hi: string };
type Blob = [x: number, y: number, r: number];

/** Tree species. Keys keep `tree`/`tree-N` for the original oak. */
export const TREE_SPECIES = ["tree", "pine", "oakdark"] as const;

const OAK: Tones = { dark: "#2b553c", mid: "#3f6b46", light: "#5c8a4f", hi: "#91aa62" };
const DARK_OAK: Tones = { dark: "#22463a", mid: "#2f5a42", light: "#46714e", hi: "#6f9660" };
const PINE: Tones = { dark: "#1d4438", mid: "#2b5a46", light: "#437857", hi: "#6e9d68" };

function trunk(c: Ctx, top: number, mossy = false) {
  rect(c, "#5b4331", 17, top, 6, 48 - top);
  rect(c, "#7a5a3c", 17, top, 4, 48 - top);
  rect(c, "#9c7a4f", 18, top + 2, 1, 44 - top);
  rect(c, "#5b4331", 15, 46, 10, 2);
  rect(c, "#7a5a3c", 15, 46, 4, 1);
  rect(c, "#4a3628", 21, 44, 2, 4);
  if (mossy) {
    rect(c, "#5c8a4f", 17, 40, 2, 3);
    rect(c, "#91aa62", 17, 40, 1, 1);
  }
}

function canopy(c: Ctx, blobs: Blob[], t: Tones, seed: number) {
  for (const [x, y, r] of blobs) ellipse(c, t.dark, x, y + 1, r, r - 1);
  for (const [x, y, r] of blobs) ellipse(c, t.mid, x - 1, y - 1, r - 1, r - 2);
  for (const [x, y, r] of blobs)
    if (r > 4) ellipse(c, t.light, x - 2, y - 3, r - 4, r - 5);
  // Leaf clusters: small dark gaps low, bright tips high. Deterministic.
  const { width: w } = c.canvas;
  const data = c.getImageData(0, 0, w, 40).data;
  for (let i = 0; i < 46; i++) {
    const x = Math.floor(hash2(i, 1, seed) * w),
      y = Math.floor(hash2(i, 2, seed) * 38);
    if (data[(y * w + x) * 4 + 3] < 200) continue;
    const upper = blobs.some(([bx, by, br]) => y < by - br / 3 && Math.abs(x - bx) < br);
    if (upper && i % 3 !== 0) {
      rect(c, t.hi, x, y, 2, 1);
      rect(c, t.light, x - 1, y + 1, 1, 1);
    } else {
      rect(c, t.dark, x, y, 2, 1);
      rect(c, t.dark, x + 1, y - 1, 1, 1);
    }
  }
}

function paintOak(c: Ctx, dark: boolean) {
  trunk(c, 30, dark);
  if (dark)
    canopy(
      c,
      [
        [20, 15, 10],
        [10, 22, 8],
        [30, 22, 8],
        [20, 26, 11],
        [9, 30, 5],
        [31, 30, 5],
      ],
      DARK_OAK,
      77,
    );
  else
    canopy(
      c,
      [
        [20, 13, 9],
        [12, 20, 8],
        [28, 19, 8],
        [20, 25, 10],
        [11, 28, 6],
        [29, 28, 6],
      ],
      OAK,
      31,
    );
}

function paintPine(c: Ctx) {
  trunk(c, 38);
  const t = PINE;
  for (let tier = 0; tier < 4; tier++) {
    const top = 3 + tier * 9,
      height = 12 + (tier === 3 ? 1 : 0),
      topHalf = 1 + tier * 2,
      bottomHalf = 6 + tier * 3;
    for (let k = 0; k < height; k++) {
      const y = top + k,
        half = Math.round(topHalf + ((bottomHalf - topHalf) * k) / (height - 1));
      if (k === height - 1) {
        // Jagged needle tips on the tier's lower edge.
        for (let x = 20 - half; x < 20 + half; x++)
          if ((x + tier) % 2 === 0) rect(c, t.dark, x, y);
        continue;
      }
      rect(c, t.dark, 20 - half, y, half * 2);
      rect(c, t.mid, 20 - half, y, Math.max(1, half * 2 - 2));
      if (k < height * 0.7) rect(c, t.light, 20 - half + 1, y, Math.max(1, half - 1));
      if (k === 1 || k === 4) rect(c, t.hi, 20 - half + 2, y, Math.max(1, Math.floor(half / 2)));
    }
  }
  rect(c, t.hi, 19, 3, 1, 2);
}

/** Copies the base tree, shifting the upper canopy by `sway` px. */
function swayFrame(c: Ctx, source: HTMLCanvasElement, sway: number, sparkle: boolean) {
  const split = 16;
  c.drawImage(source, 0, split, 40, 52 - split, 0, split, 40, 52 - split);
  c.drawImage(source, 0, 0, 40, split, sway, 0, 40, split);
  if (sparkle) {
    const data = c.getImageData(0, 0, 40, 30).data;
    for (const [x, y] of [
      [14, 9],
      [24, 14],
      [12, 22],
    ])
      if (data[(y * 40 + x) * 4 + 3] > 200) rect(c, "#a9bd73", x, y, 2, 1);
  }
}

export function createNatureArt(scene: Phaser.Scene) {
  // Trees: base texture plus four sway frames per species.
  for (const species of TREE_SPECIES) {
    const base = paintTexture(scene, species, 40, 52, (c) => {
      if (species === "pine") paintPine(c);
      else paintOak(c, species === "oakdark");
      outline(c);
      groundShadow(c, 20, 48, species === "pine" ? 12 : 14, 3);
    });
    const source = base.getSourceImage() as HTMLCanvasElement;
    [0, 1, 0, -1].forEach((sway, f) =>
      paintTexture(scene, `${species}-${f}`, 40, 52, (c) =>
        swayFrame(c, source, sway, f === 2),
      ),
    );
    const key = species === "tree" ? "ambient-tree" : `ambient-${species}`;
    if (!scene.anims.exists(key))
      scene.anims.create({
        key,
        frames: [0, 1, 2, 3].map((f) => ({ key: `${species}-${f}` })),
        frameRate: 2,
        repeat: 0,
        yoyo: true,
      });
  }

  paintTexture(scene, "bush", 20, 16, (c) => {
    ellipse(c, OAK.dark, 10, 10, 8, 4);
    ellipse(c, OAK.mid, 9, 9, 6, 3);
    ellipse(c, OAK.light, 8, 8, 3, 2);
    rect(c, OAK.hi, 6, 6, 2, 1);
    rect(c, OAK.hi, 12, 7, 1, 1);
    rect(c, "#b66a49", 13, 10, 1, 1);
    rect(c, "#b66a49", 6, 11, 1, 1);
    rect(c, "#d79a62", 13, 9, 1, 1);
    outline(c);
    groundShadow(c, 10, 14, 8, 2);
  });
  paintTexture(scene, "stump", 16, 14, (c) => {
    rect(c, "#5b4331", 3, 5, 10, 6);
    rect(c, "#7a5a3c", 3, 5, 6, 6);
    rect(c, "#5b4331", 2, 10, 12, 1);
    ellipse(c, "#b08a5a", 8, 5, 5, 1);
    rect(c, "#8c6a44", 6, 5, 4, 1);
    rect(c, "#d7b768", 7, 5, 1, 1);
    rect(c, "#5c8a4f", 3, 8, 2, 2);
    rect(c, "#91aa62", 3, 8, 1, 1);
    outline(c);
    groundShadow(c, 8, 12, 7, 2);
  });

  // Ground decor baked into the floor canvas (no collision).
  paintTexture(scene, "decor-fern", 16, 16, (c) => {
    for (const [x, y, dx] of [
      [7, 6, -1],
      [8, 5, 1],
      [6, 9, -1],
      [9, 8, 1],
    ])
      for (let i = 0; i < 4; i++) rect(c, i < 2 ? "#6f9a5c" : "#4f7a4c", x + dx * i, y + i, 1, 1);
    rect(c, "#355a42", 7, 9, 2, 4);
    rect(c, "#8fb26a", 8, 5, 1, 1);
  });
  paintTexture(scene, "decor-mushrooms", 16, 16, (c) => {
    rect(c, "#efe3c4", 5, 10, 2, 3);
    rect(c, "#b66a49", 3, 8, 6, 2);
    rect(c, "#d18a5c", 4, 8, 3, 1);
    rect(c, "#f1e6ca", 5, 8, 1, 1);
    rect(c, "#efe3c4", 10, 11, 1, 2);
    rect(c, "#a35b40", 9, 10, 3, 1);
    rect(c, "#355a42", 2, 13, 11, 1);
  });
  paintTexture(scene, "decor-shadeflower", 16, 16, (c) => {
    rect(c, "#355a42", 7, 8, 1, 5);
    rect(c, "#4f7a4c", 5, 11, 2, 1);
    rect(c, "#3e7a8b", 5, 6, 5, 2);
    rect(c, "#3e7a8b", 6, 5, 3, 4);
    rect(c, "#9ac2c0", 6, 5, 1, 1);
    rect(c, "#f1e6ca", 7, 6, 1, 1);
    rect(c, "#245568", 9, 7, 1, 1);
  });
  paintTexture(scene, "decor-flower", 16, 16, (c) => {
    rect(c, "#4f733f", 8, 8, 1, 5);
    rect(c, "#5e8447", 6, 11, 2, 1);
    rect(c, "#d7b768", 7, 6, 3, 3);
    rect(c, "#f1e6ca", 8, 5, 1, 1);
    rect(c, "#f1e6ca", 6, 7, 1, 1);
    rect(c, "#f1e6ca", 10, 7, 1, 1);
    rect(c, "#b66a49", 8, 7, 1, 1);
  });
  paintTexture(scene, "decor-pebbles", 16, 16, (c) => {
    rect(c, "#68705f", 3, 10, 4, 2);
    rect(c, "#a7a78e", 4, 9, 2, 1);
    rect(c, "#5c6658", 10, 6, 3, 2);
    rect(c, "#b4b49a", 10, 5, 2, 1);
  });
  paintTexture(scene, "decor-moss", 16, 16, (c) => {
    rect(c, "#3f6648", 2, 11, 9, 2);
    rect(c, "#5b8256", 3, 10, 6, 1);
    rect(c, "#7fa266", 5, 10, 2, 1);
    rect(c, "#466f4c", 11, 6, 3, 2);
  });
  paintTexture(scene, "decor-leaves", 16, 16, (c) => {
    rect(c, "#b0824c", 3, 4, 2, 1);
    rect(c, "#8c6a44", 9, 9, 2, 1);
    rect(c, "#c99a5c", 12, 3, 1, 1);
    rect(c, "#9c7d43", 6, 12, 2, 1);
  });

  // Ground shadows for actors (kept in a layer under the foreground).
  paintTexture(scene, "shadow-actor", 16, 6, (c) => {
    ellipse(c, "rgba(24, 61, 53, 0.22)", 8, 3, 7, 2);
    ellipse(c, "rgba(24, 61, 53, 0.22)", 8, 3, 5, 1);
  });
  paintTexture(scene, "shadow-big", 32, 8, (c) => {
    ellipse(c, "rgba(24, 61, 53, 0.22)", 16, 4, 14, 3);
    ellipse(c, "rgba(24, 61, 53, 0.22)", 16, 4, 10, 2);
  });

  // Interaction markers: small pixel speech bubbles.
  const bubble = (key: string, icon: (c: Ctx) => void) =>
    paintTexture(scene, key, 13, 14, (c) => {
      rect(c, "#f1e6ca", 2, 1, 9, 9);
      rect(c, "#f1e6ca", 1, 2, 11, 7);
      rect(c, "#d6c395", 2, 9, 9, 1);
      rect(c, "#f1e6ca", 5, 10, 3, 1);
      rect(c, "#f1e6ca", 6, 11, 1, 1);
      icon(c);
      outline(c);
    });
  bubble("mark-master", (c) => {
    rect(c, "#d7b768", 4, 3, 5, 3);
    rect(c, "#d7b768", 5, 6, 3, 1);
    rect(c, "#d7b768", 6, 7, 1, 1);
    rect(c, "#245568", 6, 4, 1, 2);
  });
  bubble("mark-merchant", (c) => {
    rect(c, "#d7b768", 5, 3, 3, 5);
    rect(c, "#d7b768", 4, 4, 5, 3);
    rect(c, "#9c7d43", 6, 4, 1, 3);
    rect(c, "#f1e6ca", 5, 4, 1, 1);
  });
  bubble("mark-fire", (c) => {
    rect(c, "#b66a49", 5, 4, 3, 4);
    rect(c, "#b66a49", 4, 6, 5, 2);
    rect(c, "#d7b768", 6, 3, 1, 4);
    rect(c, "#f1e6ca", 6, 6, 1, 1);
  });
  bubble("mark-chest", (c) => {
    rect(c, "#d7b768", 6, 3, 1, 5);
    rect(c, "#d7b768", 4, 5, 5, 1);
    rect(c, "#f1e6ca", 6, 5, 1, 1);
  });

  // Mist bands: tile horizontally, soft stepped alpha.
  const mist = (key: string, w: number, h: number, seed: number, count: number) =>
    paintTexture(scene, key, w, h, (c) => {
      for (let i = 0; i < count; i++) {
        const x = Math.floor(hash2(i, 0, seed) * w),
          y = Math.floor(h * 0.25 + hash2(i, 1, seed) * h * 0.5),
          rx = 22 + Math.floor(hash2(i, 2, seed) * 22),
          ry = 2 + Math.floor(hash2(i, 3, seed) * 3);
        for (const dx of [-w, 0, w]) {
          ellipse(c, "rgba(223, 232, 220, 0.12)", x + dx, y, rx + 8, ry + 2);
          ellipse(c, "rgba(223, 232, 220, 0.16)", x + dx, y, rx, ry);
        }
      }
    });
  mist("mist-near", 160, 56, 5, 4);
  mist("mist-far", 224, 72, 9, 4);
}

/** Final pass: outline and soft ground shadow on hand-drawn props. */
export function finishProps(scene: Phaser.Scene) {
  for (const key of ["house", "stall", "rock", "chest", "chest-open"])
    editTexture(scene, key, (c) => outline(c));
  for (let f = 0; f < 4; f++) editTexture(scene, `flag-${f}`, (c) => outline(c));
  editTexture(scene, "house", (c) => groundShadow(c, 56, 78, 52, 4, 0.28));
  editTexture(scene, "stall", (c) => groundShadow(c, 32, 44, 29, 3));
  editTexture(scene, "rock", (c) => groundShadow(c, 12, 17, 11, 2));
  for (const key of ["chest", "chest-open"])
    editTexture(scene, key, (c) => groundShadow(c, 12, 18, 10, 2));
}
