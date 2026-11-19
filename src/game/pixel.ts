import type Phaser from "phaser";

/** Deep green of the registered palette; every outline uses it. */
export const OUTLINE = "#183d35";

export type Ctx = CanvasRenderingContext2D;

/** Creates a canvas texture, or repaints the existing one under the same key. */
export function paintTexture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  draw: (c: Ctx) => void,
) {
  let t: Phaser.Textures.CanvasTexture;
  if (scene.textures.exists(key)) {
    t = scene.textures.get(key) as Phaser.Textures.CanvasTexture;
    if (t.width !== w || t.height !== h) t.setSize(w, h);
    t.context.clearRect(0, 0, w, h);
  } else t = scene.textures.createCanvas(key, w, h)!;
  // Draw on a CPU-backed scratch canvas: outlines read pixels back, which is
  // slow on GPU-backed canvases. The texture receives a single copy at the end.
  const c = scratch(w, h);
  draw(c);
  t.context.imageSmoothingEnabled = false;
  t.context.drawImage(c.canvas, 0, 0);
  t.refresh();
  return t;
}

let scratchContext: Ctx | undefined;
function scratch(w: number, h: number) {
  if (!scratchContext) {
    const canvas = document.createElement("canvas");
    scratchContext = canvas.getContext("2d", { willReadFrequently: true })!;
  }
  const c = scratchContext;
  if (c.canvas.width !== w || c.canvas.height !== h) {
    c.canvas.width = w;
    c.canvas.height = h;
  } else c.clearRect(0, 0, w, h);
  c.imageSmoothingEnabled = false;
  c.globalCompositeOperation = "source-over";
  return c;
}

export function rect(c: Ctx, color: string, x: number, y: number, w = 1, h = 1) {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}

/** Filled pixel ellipse drawn row by row, so edges stay crisp. */
export function ellipse(
  c: Ctx,
  color: string,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
) {
  c.fillStyle = color;
  for (let dy = -ry; dy <= ry; dy++) {
    const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy / (ry + 0.5)) ** 2)));
    if (half > 0) c.fillRect(cx - half, cy + dy, half * 2, 1);
  }
}

/** 1 px outline around every opaque pixel (4-neighbour). */
export function outline(c: Ctx, color = OUTLINE) {
  const { width: w, height: h } = c.canvas;
  const image = c.getImageData(0, 0, w, h),
    data = image.data;
  const opaque = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < w && y < h && data[(y * w + x) * 4 + 3] > 160;
  const marks: number[] = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (opaque(x, y)) continue;
      if (opaque(x - 1, y) || opaque(x + 1, y) || opaque(x, y - 1) || opaque(x, y + 1))
        marks.push(x, y);
    }
  c.fillStyle = color;
  for (let i = 0; i < marks.length; i += 2) c.fillRect(marks[i], marks[i + 1], 1, 1);
}

/** Soft dithered ground shadow painted behind what is already drawn. */
export function groundShadow(
  c: Ctx,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  alpha = 0.32,
) {
  const previous = c.globalCompositeOperation;
  c.globalCompositeOperation = "destination-over";
  ellipse(c, `rgba(24, 61, 53, ${alpha})`, cx, cy, rx, ry);
  ellipse(c, `rgba(24, 61, 53, ${alpha * 0.55})`, cx, cy, rx + 2, ry + 1);
  c.globalCompositeOperation = previous;
}

/** Repaints a texture after applying `fn` to its current pixels. */
export function editTexture(scene: Phaser.Scene, key: string, fn: (c: Ctx) => void) {
  if (!scene.textures.exists(key)) return;
  const t = scene.textures.get(key) as Phaser.Textures.CanvasTexture;
  fn(t.context);
  t.refresh();
}

/** Copies `source` into a new canvas, optionally mirrored horizontally. */
export function copyCanvas(source: HTMLCanvasElement, flip = false) {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const c = canvas.getContext("2d")!;
  c.imageSmoothingEnabled = false;
  if (flip) {
    c.translate(source.width, 0);
    c.scale(-1, 1);
  }
  c.drawImage(source, 0, 0);
  return canvas;
}
