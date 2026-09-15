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
  for (let d = 0; d < 4; d++)
    for (let f = 0; f < 3; f++)
      edit(`hero-${d}-${f}`, (c) => {
        const bob = f === 1 ? 1 : 0;
        dot(c, "#29515d", 12, 14 + bob, 3, 5);
        dot(c, "#6c9b9b", 8, 13 + bob, 2, 6);
        dot(c, "#efcf9c", 7, 6 + bob, 2, 2);
        dot(c, "#4e382d", 5, 4 + bob, 2, 5);
        dot(c, "#9d7751", 8, 3 + bob, 5, 1);
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
  for (let f = 0; f < 8; f++) {
    const p = f / 8;
    clone("water", "water-" + f, 16, 16, (c) => {
      dot(c, "#387b80", 0, 0, 16, 16);
      dot(c, "#417f80", 0, 8, 16, 8);
      for (let y = 0; y < 16; y++) {
        if (y % 4 !== 0) continue;
        const offset = Math.round(Math.sin((y + p * 16) * Math.PI / 8) * 2);
        dot(c, "#69a5a0", (offset + 4 + y + 16) % 16, y, 4, 1);
        dot(c, "#4d9091", (offset + 10 + y + 16) % 16, y + 1, 3, 1);
      }
    });
    clone("fire", "fire-" + f, 24, 24, (c) => {
      c.clearRect(0, 0, 24, 17);
      dot(c, "#b66a49", 6, 13, 13, 6);
      const r1 = Math.round(p * 7);
      const r2 = Math.round(((p + 0.5) % 1) * 7);
      dot(c, "#df9e51", 7, 10 - r1, 6, 8);
      dot(c, "#df9e51", 13, 10 - r2, 5, 8);
      dot(c, "#f0ca78", 8, 7 - r1, 4, 6);
      dot(c, "#f0ca78", 14, 7 - r2, 3, 6);
      dot(c, "#f8e5ac", 9, 4 - r1, 2, 4);
      dot(c, "#f8e5ac", 14, 4 - r2, 2, 4);
    });
    clone("tree", "tree-" + f, 40, 52, (c) => {
      const sway = Math.round(Math.sin(p * Math.PI * 2) * 1.5);
      dot(c, "#87a961", 12 + sway, 10, 3, 1);
      dot(c, "#659151", 26 + sway, 19, 3, 2);
      dot(c, "#91aa62", 16 + sway, 25, 2, 1);
    });
    const flag = scene.textures.createCanvas("flag-" + f, 24, 32)!;
    const c = flag.context;
    dot(c, "#755735", 3, 1, 2, 31);
    dot(c, "#d7b768", 2, 0, 4, 2);
    for (let x = 5; x < 22; x++) {
      const y = Math.round(Math.sin((x / 4) - (p * Math.PI * 2)) * 1.5);
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
  const monsterSizes = {
    sprout: { w: 32, h: 32 },
    beetle: { w: 32, h: 32 },
    moth:   { w: 32, h: 32 },
    guardian: { w: 48, h: 52 },
  } as const;

  for (const [key, size] of Object.entries(monsterSizes)) {
    // 6 frames idle por monstro
    for (let f = 0; f < 6; f++)
      clone(key, `${key}-idle-${f}`, size.w, size.h, (c) => {
        const src = scene.textures.get(key).getSourceImage() as HTMLCanvasElement;
        c.clearRect(0, 0, size.w, size.h);
        const p = f / 6;

        if (key === "sprout") {
          const squash = Math.round(Math.sin(p * Math.PI * 2));
          c.drawImage(src, 0, squash);
          const sway = Math.round(Math.cos(p * Math.PI * 2) * 2);
          c.clearRect(0, 0, 32, 12);
          c.drawImage(src, 0, 0, 32, 12, sway, squash, 32, 12);
          
          const eyeOpen = f !== 2; 
          if (!eyeOpen) {
            dot(c, "#183d35", 13 + sway/2, 20 + squash, 3, 1);
            dot(c, "#183d35", 21 + sway/2, 19 + squash, 3, 1);
          } else {
            dot(c, "#183d35", 13 + sway/4, 20 + squash, 3, 3);
            dot(c, "#183d35", 21 + sway/4, 19 + squash, 3, 3);
          }
        } else if (key === "beetle") {
          const breathe = Math.round(Math.sin(p * Math.PI * 2));
          c.drawImage(src, 0, breathe);
          c.clearRect(0, 24, 32, 8); 
          c.drawImage(src, 0, 24, 32, 8, 0, 24, 32, 8); 
          
          const shell = f < 3 ? "#9ca286" : "#8a906e";
          dot(c, shell, 11, 8 + breathe, 9, 2);
        } else if (key === "moth") {
          const float = Math.round(Math.sin(p * Math.PI * 2) * 2);
          c.drawImage(src, 0, float);
          c.clearRect(0, 0, 13, 32);
          c.clearRect(19, 0, 13, 32);
          
          const wingStage = f % 3;
          const wingY  = wingStage === 0 ? 10 : wingStage === 1 ? 7 : 4;
          const wingH  = wingStage === 0 ? 4  : wingStage === 1 ? 8 : 12;
          const wingCol = wingStage === 2 ? "#d1c8da" : wingStage === 1 ? "#bbb0c9" : "#aaa5bc";
          dot(c, wingCol, 3, wingY + float, 8, wingH);
          dot(c, wingCol, 21, wingY + float, 8, wingH);
        } else {
          const breathe = Math.round(Math.sin(p * Math.PI * 2));
          c.drawImage(src, 0, breathe);
          
          const armSway = Math.round(Math.sin(p * Math.PI * 2 - 1));
          c.clearRect(0, 19, 11, 33);
          c.clearRect(37, 19, 11, 33);
          c.drawImage(src, 0, 19, 11, 33, 0, 19 + armSway, 11, 33);
          c.drawImage(src, 37, 19, 11, 33, 37, 19 + armSway, 11, 33);
          
          const eyeGlow = ["#e8ce81", "#f0dc95", "#ffe8a0", "#f0dc95", "#e8ce81", "#d4b66c"];
          dot(c, eyeGlow[f], 16, 19 + breathe, 4, 4);
          dot(c, eyeGlow[f], 29, 19 + breathe, 4, 4);
        }
      });

    scene.anims.create({
      key: `monster-${key}-idle`,
      frames: Array.from({ length: 6 }, (_, i) => ({ key: `${key}-idle-${i}` })),
      frameRate: key === "moth" ? 6 : key === "guardian" ? 2 : 4,
      repeat: -1,
      yoyo: false,
    });
  }
  for (let f = 0; f < 8; f++) {
    const p = f / 8;
    const wind = scene.textures.createCanvas(`grass-wind-${f}`, 32, 16)!;
    const c = wind.context;
    for (let i = 0; i < 5; i++) {
      const wave = Math.sin((i / 5) * Math.PI - p * Math.PI * 2);
      const sway = wave > 0.5 ? 2 : wave > 0 ? 1 : 0;
      const x = 3 + i * 6 + sway,
        y = 5 + ((i * 3) % 8);
      dot(c, sway > 1 ? "#a8ba71" : "#8eaa61", x, y, 1, 3);
      if (sway > 0) dot(c, "#c4ca86", x + 1, y, 1, 1);
    }
    wind.refresh();
  }
  scene.anims.create({
    key: "ambient-grass-wind",
    frames: Array.from({ length: 8 }, (_, i) => ({ key: `grass-wind-${i}` })),
    frameRate: 8,
    repeat: 0,
  });
  for (const [key, rate] of [
    ["water", 6],
    ["fire", 8],
    ["tree", 4],
    ["flag", 6],
  ] as const)
    scene.anims.create({
      key: `ambient-${key}`,
      frames: Array.from({ length: 8 }, (_, i) => ({ key: `${key}-${i}` })),
      frameRate: rate,
      repeat: key === "water" || key === "fire" || key === "tree" || key === "flag" ? -1 : 0,
    });

  for (const kind of ["hero", "master", "merchant"]) {
    for (let d = 0; d < 4; d++) {
      for (let f = 0; f < 6; f++) {
        clone(`${kind}-${d}-0`, `${kind}-${d}-idle-${f}`, 20, 32, (c) => {
          const src = scene.textures.get(`${kind}-${d}-0`).getSourceImage() as HTMLCanvasElement;
          c.clearRect(0, 0, 20, 32);
          const p = f / 6;
          const breathe = Math.round(Math.sin(p * Math.PI * 2));
          c.drawImage(src, 0, 23, 20, 9, 0, 23, 20, 9);
          c.drawImage(src, 0, 0, 20, 23, 0, breathe, 20, 23);
          
          if (d !== 2) {
            const capeWave = Math.round(Math.cos(p * Math.PI * 2) * 1.5);
            c.clearRect(0, 19 + breathe, 20, 4);
            c.drawImage(src, 0, 19, 20, 4, capeWave, 19 + breathe, 20, 4);
          }
          
          if (d !== 0) {
            const eyeOpen = f !== 3;
            if (!eyeOpen) {
              const eyeX = d === 2 ? 7 : d === 3 ? 13 : 9;
              dot(c, "#e2ba88", eyeX, 6 + breathe, 1, 2);
              if (d === 2) dot(c, "#e2ba88", eyeX + 4, 6 + breathe, 1, 2);
              dot(c, "#d5b080", eyeX, 7 + breathe, 1, 1);
              if (d === 2) dot(c, "#d5b080", eyeX + 4, 7 + breathe, 1, 1);
            }
          }
        });
      }

      scene.anims.create({
        key: `${kind}-idle-${d}`,
        frames: Array.from({ length: 6 }, (_, i) => ({ key: `${kind}-${d}-idle-${i}` })),
        frameRate: 4,
        repeat: -1,
      });

      // ── walk: 4 frames distintos — pernas e braços reais ─────────────────
      // frame 1 = passo L, frame 2 = neutro alto, frame 3 = passo R, frame 4 = neutro alto
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
