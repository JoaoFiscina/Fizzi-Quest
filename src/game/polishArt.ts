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
  edit("path", (c) => {
    dot(c, "#d3bd8c", 0, 0, 16, 16);
    dot(c, "#dfcb99", 2, 3, 9, 2);
    dot(c, "#c6af7e", 9, 12, 5, 1);
    dot(c, "#ead7a7", 4, 9, 5, 1);
    dot(c, "#bba575", 13, 5, 2, 1);
  });
  for (let variant = 0; variant < 4; variant++)
    edit(`grass${variant}`, (c) => {
      // Quiet clustered values keep the route and actors above the background.
      dot(
        c,
        ["#779657", "#79995a", "#7a995b", "#759455"][variant],
        0,
        0,
        16,
        16,
      );
      dot(c, "#729052", 2 + variant, 4, 4, 2);
      dot(c, "#86a362", 3 + variant, 4, 2, 1);
      dot(c, "#6b8c50", 10 - (variant % 2), 12, 3, 1);
      dot(c, "#8aa565", 11 - (variant % 2), 12, 1, 1);
    });
  edit("house", (c) => {
    for (let y = 35; y < 73; y += 8)
      for (let x = 18; x < 94; x += 12) dot(c, "#d4bc8d", x + (y % 3), y, 8, 1);
    dot(c, "#d7b768", 51, 31, 15, 9);
    dot(c, "#41684b", 56, 33, 5, 5);
    dot(c, "#344e3a", 58, 32, 1, 7);
    for (let i = 0; i < 7; i++)
      dot(c, "#62804c", 17 + i * 11, 71 - (i % 2), 5, 3);
    // Roof rim, timber columns and threshold reinforce the guild entrance.
    dot(c, "#6c4636", 5, 27, 102, 2);
    dot(c, "#e5ba78", 11, 29, 92, 1);
    dot(c, "#8d6b45", 18, 34, 2, 38);
    dot(c, "#8d6b45", 92, 34, 2, 38);
    dot(c, "#f1e5bf", 45, 77, 23, 2);
  });
  edit("stall", (c) => {
    dot(c, "#704432", 3, 21, 58, 2);
    dot(c, "#edd6a7", 5, 22, 54, 1);
    dot(c, "#5a7548", 10, 35, 44, 2);
    dot(c, "#dfb96d", 14, 29, 7, 2);
    dot(c, "#dfb96d", 40, 29, 9, 2);
  });
  edit("rock", (c) => {
    dot(c, "#4f5d53", 6, 15, 14, 2);
    dot(c, "#c0bea0", 8, 4, 7, 1);
    dot(c, "#637870", 17, 8, 2, 7);
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
      // Broken wave crests travel inside the tile; no layer displacement.
      for (let row = 0; row < 2; row++) {
        const crest = (f * 2 + row * 7) % 16;
        for (let p = 0; p < 5; p++) {
          dot(
            c,
            p === 2 ? "#86bcb0" : "#599d9b",
            (crest + p) % 16,
            3 + row * 8 + (f % 2),
            1,
            1,
          );
          dot(c, "#306e78", (crest + p) % 16, 5 + row * 8, 1, 1);
        }
      }
      dot(c, "#4d9091", (12 + f * 2) % 14, 11, 4, 1);
      dot(c, "#b0c9ad", 2 + f * 3, 5, 1, 1);
    });
    clone("fire", "fire-" + f, 24, 24, (c) => {
      c.clearRect(0, 0, 24, 17);
      dot(c, "#b66a49", 6, 13, 13, 6);
      // Two tongues change silhouette around a fixed ember bed.
      dot(c, "#d98542", 7, 12, 11, 6);
      dot(c, "#eead55", 7 + (f % 2), 7 + (f % 3), 4, 9);
      dot(c, "#eab35f", 14 - (f % 2), 5 + ((f + 1) % 3), 3, 12);
      dot(c, "#df9e51", 8 + (f % 2), 8, 9, 10);
      dot(c, "#f0ca78", 10, 5 + (f % 3), 5, 12);
      dot(c, "#f8e5ac", 12, 12, 3, 7);
      dot(c, "#d7b768", 6 + f * 3, 2 + f, 1, 2);
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
    ["flag", 4],
  ] as const)
    scene.anims.create({
      key: `ambient-${key}`,
      frames: Array.from({ length: 4 }, (_, i) => ({ key: `${key}-${i}` })),
      frameRate: rate,
      repeat: key === "water" || key === "fire" ? -1 : 0,
      yoyo: true,
    });
  for (const key of ["water", "fire"] as const)
    scene.anims.create({
      key: `ambient-${key}-reduced`,
      frames: [{ key: `${key}-0` }, { key: `${key}-1` }],
      frameRate: 1,
      repeat: -1,
      yoyo: true,
    });

}
