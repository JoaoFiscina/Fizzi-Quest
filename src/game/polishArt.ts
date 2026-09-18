import type Phaser from "phaser";
/** All details are authored here on the existing pixel grid. No external imagery. */
export function polishArt(scene: Phaser.Scene) {
  const edit = (key: string, draw: (c: CanvasRenderingContext2D) => void) => {
    const t = scene.textures.get(key) as Phaser.Textures.CanvasTexture;
    draw(t.context);
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
  edit("tree", (c) => {
    for (const [x, y] of [
      [11, 11],
      [20, 8],
      [8, 23],
      [19, 19],
      [27, 23],
      [16, 29],
    ]) {
      dot(c, "#91aa62", x, y, 3, 1);
      dot(c, "#719650", x - 1, y + 1, 5, 2);
      dot(c, "#2b553c", x + 1, y + 4, 4, 1);
    }
    dot(c, "#b2905c", 19, 35, 1, 10);
    dot(c, "#413f2f", 21, 39, 2, 3);
  });
  edit("house", (c) => {
    for (let y = 35; y < 73; y += 8)
      for (let x = 18; x < 94; x += 12) dot(c, "#d4bc8d", x + (y % 3), y, 8, 1);
    dot(c, "#d7b768", 51, 31, 15, 9);
    dot(c, "#41684b", 56, 33, 5, 5);
    dot(c, "#344e3a", 58, 32, 1, 7);
    for (let i = 0; i < 7; i++)
      dot(c, "#62804c", 17 + i * 11, 71 - (i % 2), 5, 3);
  });
  edit("sprout", (c) => {
    dot(c, "#dde4ae", 11, 14, 5, 2);
    dot(c, "#788747", 23, 17, 2, 8);
    dot(c, "#eef0ce", 11, 20);
    dot(c, "#eef0ce", 21, 19);
    dot(c, "#b66a49", 9, 24, 3, 1);
    dot(c, "#b66a49", 23, 23, 2, 1);
    dot(c, "#516942", 16, 25, 3, 1);
    dot(c, "#c0ce80", 20, 4, 6, 1);
    dot(c, "#a4bd71", 5, 7, 7, 1);
  });
  for (const hero of ["hero", "hero-f"])
    for (let d = 0; d < 4; d++)
      for (let f = 0; f < 3; f++)
        edit(`${hero}-${d}-${f}`, (c) => {
          const bob = f === 1 ? 1 : 0;
          dot(c, hero === "hero" ? "#29515d" : "#4f4663", 12, 14 + bob, 3, 5);
          dot(c, hero === "hero" ? "#6c9b9b" : "#9385a1", 8, 13 + bob, 2, 6);
          dot(c, "#efcf9c", 7, 6 + bob, 2, 2);
          dot(c, hero === "hero" ? "#4e382d" : "#49302f", 5, 4 + bob, 2, 5);
          dot(c, hero === "hero" ? "#9d7751" : "#80565b", 8, 3 + bob, 5, 1);
          dot(c, "#e1c38a", 6, 20, 1, 2);
          dot(c, "#f2e9bf", 17, 17 + bob, 1, 6);
          dot(c, "#1c342d", 7, 25, 3, 1);
        });
  const clone = (
    source: string,
    target: string,
    w: number,
    h: number,
    draw: (c: CanvasRenderingContext2D) => void,
  ) => {
    const t = scene.textures.createCanvas(target, w, h)!;
    t.context.drawImage(
      scene.textures.get(source).getSourceImage() as HTMLCanvasElement,
      0,
      0,
    );
    draw(t.context);
    t.refresh();
  };
  for (let f = 0; f < 4; f++) {
    clone("water", "water-" + f, 16, 16, (c) => {
      dot(c, "#387b80", 0, 0, 16, 16);
      dot(c, "#417f80", 0, 8, 16, 8);
      dot(c, "#69a5a0", (f * 3) % 10, 4, 6, 1);
      dot(c, "#4d9091", (12 + f * 2) % 14, 11, 4, 1);
      dot(c, "#b0c9ad", 2 + f * 3, 5, 1, 1);
    });
    clone("fire", "fire-" + f, 24, 24, (c) => {
      c.clearRect(0, 0, 24, 17);
      dot(c, "#b66a49", 6, 13, 13, 6);
      dot(c, "#df9e51", 8 + (f % 2), 8, 9, 10);
      dot(c, "#f0ca78", 10, 5 + (f % 3), 5, 12);
      dot(c, "#f8e5ac", 12, 12, 3, 7);
      dot(c, "#d7b768", 6 + f * 3, 2 + f, 1, 2);
    });
    clone("tree", "tree-" + f, 40, 52, (c) => {
      dot(c, "#87a961", 12 + (f % 2), 10, 3, 1);
      dot(c, "#659151", 26 - (f % 2), 19, 3, 2);
      dot(c, "#91aa62", 16 + (f % 3), 25, 2, 1);
    });
    const flag = scene.textures.createCanvas("flag-" + f, 24, 32)!;
    const c = flag.context;
    dot(c, "#755735", 3, 1, 2, 31);
    dot(c, "#d7b768", 2, 0, 4, 2);
    for (let x = 5; x < 22; x++) {
      const y = Math.round(Math.sin((x + f * 3) / 4));
      dot(c, "#b66a49", x, 4 + y, 1, 11);
      dot(c, "#e6b56d", x, 4 + y, 1, 1);
      if (x > 10 && x < 16) dot(c, "#f1e6ca", x, 7 + y, 1, 4);
    }
    flag.refresh();
  }
  clone("chest", "chest-open", 24, 20, (c) => {
    dot(c, "#302f23", 4, 7, 16, 7);
    dot(c, "#d7b768", 5, 11, 3, 2);
    dot(c, "#a27c45", 3, 2, 18, 4);
  });
  const monsterFrames = {
    sprout: { w: 32, h: 32 },
    beetle: { w: 32, h: 32 },
    moth: { w: 32, h: 32 },
    guardian: { w: 48, h: 52 },
  } as const;
  for (const [key, size] of Object.entries(monsterFrames)) {
    for (let f = 0; f < 4; f++)
      clone(key, `${key}-idle-${f}`, size.w, size.h, (c) => {
        if (key === "sprout") {
          dot(c, "#183d35", 13, f === 2 ? 21 : 20, 3, f === 2 ? 1 : 3);
          dot(c, "#183d35", 21, f === 2 ? 20 : 19, 3, f === 2 ? 1 : 3);
          dot(c, f % 2 ? "#91aa62" : "#7da556", 19 + (f % 2), 2, 8, 2);
          dot(c, "#b9c979", 5 + (f % 2), 6, 7, 1);
        } else if (key === "beetle") {
          dot(c, "#263b34", 2, 25 - (f % 2), 7, 2);
          dot(c, "#263b34", 23, 24 + (f % 2), 7, 2);
          dot(c, f === 2 ? "#bec29e" : "#8c987f", 11, 8, 9, 2);
          dot(c, "#d7b768", 7 + f, 20, 2, 1);
        } else if (key === "moth") {
          const wing = f === 1 || f === 3 ? "#d1c8da" : "#aaa5bc";
          dot(c, wing, 3, 8 + (f % 2), 8, 5);
          dot(c, wing, 21, 8 + (f % 2), 8, 5);
          dot(c, "#f1e6ca", 6, 11 + (f % 2), 2, 2);
          dot(c, "#f1e6ca", 24, 11 + (f % 2), 2, 2);
        } else {
          dot(c, f === 2 ? "#f1e6ca" : "#d7b768", 16, 19, 4, f === 2 ? 1 : 4);
          dot(c, f === 2 ? "#f1e6ca" : "#d7b768", 29, 19, 4, f === 2 ? 1 : 4);
          dot(c, f % 2 ? "#91aa62" : "#719557", 9 + (f % 2), 4, 12, 2);
          dot(c, "#4e7443", 35 - (f % 2), 7, 8, 3);
        }
      });
    scene.anims.create({
      key: `monster-${key}-idle`,
      frames: Array.from({ length: 4 }, (_, i) => ({
        key: `${key}-idle-${i}`,
      })),
      frameRate: key === "moth" ? 5 : 3,
      repeat: -1,
      yoyo: true,
    });
  }
  for (let f = 0; f < 4; f++) {
    const wind = scene.textures.createCanvas(`grass-wind-${f}`, 32, 16)!;
    const c = wind.context;
    for (let i = 0; i < 5; i++) {
      const x = 3 + i * 6 + (f > 1 ? 1 : 0),
        y = 5 + ((i * 3) % 8);
      dot(c, f === 3 ? "#a8ba71" : "#8eaa61", x, y, 1, 3);
      if (f > 0) dot(c, "#c4ca86", x + 1, y, 1, 1);
    }
    wind.refresh();

    const tuft = scene.textures.createCanvas(`grass-tuft-${f}`, 16, 16)!;
    const tuftContext = tuft.context;
    const sway = f === 1 ? 1 : f === 3 ? -1 : 0;
    tuftContext.drawImage(
      scene.textures.get("grass-tuft").getSourceImage() as HTMLCanvasElement,
      sway,
      0,
    );
    if (f === 2) dot(tuftContext, "#b6c780", 8, 7, 1, 1);
    tuft.refresh();

    for (const effect of ["leaf", "dust"] as const) {
      const detail = scene.textures.createCanvas(
        `ambient-${effect}-${f}`,
        16,
        16,
      )!;
      const detailContext = detail.context;
      if (effect === "leaf") {
        dot(detailContext, "#789a55", 2 + f * 3, 3 + f * 2, 2, 1);
        dot(detailContext, "#a6b96d", 3 + f * 3, 4 + f * 2, 1, 1);
      } else {
        dot(detailContext, "#ddc99a", 3 + f * 2, 12 - (f % 2), 1, 1);
        dot(detailContext, "#bda97c", 9 + f, 10 + (f % 2), 1, 1);
      }
      detail.refresh();
    }
  }
  scene.anims.create({
    key: "ambient-grass-wind",
    frames: Array.from({ length: 4 }, (_, i) => ({ key: `grass-wind-${i}` })),
    frameRate: 5,
    repeat: 0,
    yoyo: true,
  });
  scene.anims.create({
    key: "ambient-grass-tuft",
    frames: Array.from({ length: 4 }, (_, i) => ({ key: `grass-tuft-${i}` })),
    frameRate: 4,
    repeat: 0,
    yoyo: true,
  });
  for (const effect of ["leaf", "dust"] as const)
    scene.anims.create({
      key: `ambient-${effect}`,
      frames: Array.from({ length: 4 }, (_, i) => ({
        key: `ambient-${effect}-${i}`,
      })),
      frameRate: effect === "leaf" ? 5 : 3,
      repeat: 0,
    });
  for (const [key, rate] of [
    ["water", 3],
    ["fire", 6],
    ["tree", 2],
    ["flag", 4],
  ] as const)
    scene.anims.create({
      key: `ambient-${key}`,
      frames: Array.from({ length: 4 }, (_, i) => ({ key: `${key}-${i}` })),
      frameRate: rate,
      repeat: 0,
      yoyo: true,
    });
  for (const key of ["water", "fire"] as const)
    scene.anims.create({
      key: `ambient-${key}-reduced`,
      frames: [{ key: `${key}-0` }, { key: `${key}-1` }],
      frameRate: 1,
      repeat: 0,
      yoyo: true,
    });

  // Personagens mantêm o desenho compacto e recebem ciclos próprios.
  // O idle mexe só um detalhe por vez para evitar a sensação de flutuação.
  for (const kind of ["hero", "hero-f", "master", "merchant"]) {
    for (let d = 0; d < 4; d++) {
      for (let f = 0; f < 4; f++)
        clone(`${kind}-${d}-0`, `${kind}-${d}-idle-${f}`, 20, 28, (c) => {
          if (f === 2) {
            dot(c, "#886039", 14, 3, 2, 1);
            if (kind === "hero") dot(c, "#d1935a", 3, 15, 1, 3);
            if (kind === "hero-f") dot(c, "#a86f6c", 3, 15, 1, 3);
          }
        });
      scene.anims.create({
        key: `${kind}-idle-${d}`,
        frames: Array.from({ length: 4 }, (_, i) => ({
          key: `${kind}-${d}-idle-${i}`,
        })),
        frameRate: 2,
        repeat: -1,
      });
      scene.anims.create({
        key: `${kind}-walk-${d}`,
        frames: [
          { key: `${kind}-${d}-0` },
          { key: `${kind}-${d}-1` },
          { key: `${kind}-${d}-0` },
          { key: `${kind}-${d}-2` },
        ],
        frameRate: 7,
        repeat: -1,
      });
    }
  }
}
