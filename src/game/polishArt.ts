import type Phaser from "phaser";

/** Clean texture animations and variations without noisy pixel overlays. */
export function polishArt(scene: Phaser.Scene) {
  const clone = (
    source: string,
    target: string,
    w: number,
    h: number,
    draw?: (c: CanvasRenderingContext2D) => void,
  ) => {
    const t = scene.textures.createCanvas(target, w, h)!;
    const src = scene.textures.get(source).getSourceImage() as HTMLCanvasElement;
    t.context.drawImage(src, 0, 0);
    if (draw) draw(t.context);
    t.refresh();
  };

  const dot = (
    c: CanvasRenderingContext2D,
    color: string,
    x: number,
    y: number,
    w = 1,
    h = 1,
  ) => {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
  };

  // Water animation frames
  for (let f = 0; f < 8; f++) {
    const p = f / 8;
    clone("water", "water-" + f, 16, 16, (c) => {
      rect(c, "#2b6b70", 0, 0, 16, 16);
      rect(c, "#3a8183", 0, 2, 16, 12);
      const shift = Math.round(Math.sin((f / 8) * Math.PI * 2));
      rect(c, "#4ca3a4", (1 + shift + 16) % 16, 4, 8, 2);
      rect(c, "#6bc2c0", (9 - shift + 16) % 16, 10, 5, 2);
      rect(c, "#85d9d7", (2 + shift + 16) % 16, 5, 4, 1);
      rect(c, "#6bc2c0", (11 - shift + 16) % 16, 4, 3, 1);
    });

    clone("fire", "fire-" + f, 24, 24, (c) => {
      const shift = f % 2;
      dot(c, "#f5d995", 11, 8 - shift, 4, 10);
    });

    clone("tree", "tree-" + f, 40, 52);

    const flag = scene.textures.createCanvas("flag-" + f, 24, 32)!;
    const c = flag.context;
    dot(c, "#755735", 3, 1, 2, 31);
    dot(c, "#d7b768", 2, 0, 4, 2);
    for (let x = 5; x < 22; x++) {
      const y = Math.round(Math.sin(x / 4 - (p * Math.PI * 2)) * 1.5);
      dot(c, "#b66a49", x, 4 + y, 1, 11);
      dot(c, "#e6b56d", x, 4 + y, 1, 1);
      if (x > 10 && x < 16) dot(c, "#f1e6ca", x, 7 + y, 1, 4);
    }
    flag.refresh();
  }

  function rect(
    c: CanvasRenderingContext2D,
    color: string,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
  }

  clone("chest", "chest-open", 24, 20, (c) => {
    rect(c, "#302f23", 4, 7, 16, 7);
    rect(c, "#d7b768", 5, 11, 3, 2);
    rect(c, "#a27c45", 3, 2, 18, 4);
  });

  const monsterSizes = {
    sprout: { w: 32, h: 32 },
    beetle: { w: 32, h: 32 },
    moth: { w: 32, h: 32 },
    guardian: { w: 48, h: 52 },
  } as const;

  for (const [key, size] of Object.entries(monsterSizes)) {
    for (let f = 0; f < 6; f++) {
      clone(key, `${key}-idle-${f}`, size.w, size.h);
    }

    scene.anims.create({
      key: `monster-${key}-idle`,
      frames: Array.from({ length: 6 }, (_, i) => ({
        key: `${key}-idle-${i}`,
      })),
      frameRate: 2,
      repeat: -1,
      yoyo: false,
    });
  }

  for (let f = 0; f < 8; f++) {
    const wind = scene.textures.createCanvas(`grass-wind-${f}`, 32, 16)!;
    wind.refresh();
  }

  scene.anims.create({
    key: "ambient-grass-wind",
    frames: Array.from({ length: 8 }, (_, i) => ({ key: `grass-wind-${i}` })),
    frameRate: 8,
    repeat: 0,
  });

  for (const [key, rate] of [
    ["water", 4],
    ["fire", 6],
    ["tree", 2],
    ["flag", 4],
  ] as const) {
    scene.anims.create({
      key: `ambient-${key}`,
      frames: Array.from({ length: 8 }, (_, i) => ({ key: `${key}-${i}` })),
      frameRate: rate,
      repeat: -1,
    });
  }

  for (const kind of ["hero", "master", "merchant"]) {
    for (let d = 0; d < 4; d++) {
      for (let f = 0; f < 6; f++) {
        clone(`${kind}-${d}-0`, `${kind}-${d}-idle-${f}`, 20, 32);
      }

      scene.anims.create({
        key: `${kind}-idle-${d}`,
        frames: Array.from({ length: 6 }, (_, i) => ({
          key: `${kind}-${d}-idle-${i}`,
        })),
        frameRate: 2,
        repeat: -1,
      });

      scene.anims.create({
        key: `${kind}-walk-${d}`,
        frames: [
          { key: `${kind}-${d}-1` },
          { key: `${kind}-${d}-2` },
          { key: `${kind}-${d}-3` },
          { key: `${kind}-${d}-4` },
        ],
        frameRate: 5,
        repeat: -1,
      });
    }
  }
}

