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
        if (key === "sprout") {
          // folhas oscilam: 2 grupos alternados
          const leafOff = f < 3 ? 0 : 1;
          const eyeOpen = f !== 2 && f !== 5; // pisca nos frames 2 e 5
          dot(c, leafOff ? "#91aa62" : "#7da556", 19 + leafOff, 2, 8, 2);
          dot(c, "#b9c979", 5 + leafOff, 6, 7, 1);
          // movimento sutil do corpo: frames pares levantam 1px
          if (f % 2 === 0) dot(c, "#9ca96a", 9, 12, 16, 1); // ombro claro sobe
          // olho pisca
          if (!eyeOpen) {
            dot(c, "#183d35", 13, 20, 3, 1);
            dot(c, "#183d35", 21, 19, 3, 1);
          } else {
            dot(c, "#183d35", 13, 20, 3, 3);
            dot(c, "#183d35", 21, 19, 3, 3);
          }
          // antenas oscilam
          dot(c, f % 3 === 0 ? "#c0ce80" : "#a4bd71", 20 + (f % 2), 4, 6, 1);
          dot(c, f % 3 === 1 ? "#a4bd71" : "#b9c979", 5, 7 + (f % 2), 7, 1);
        } else if (key === "beetle") {
          // pernas: 3 pares oscilam alternados
          const legPhase = f % 3;
          dot(c, "#263b34", 2, 25 - (legPhase === 0 ? 1 : 0), 7, 2);
          dot(c, "#263b34", 23, 24 + (legPhase === 1 ? 1 : 0), 7, 2);
          dot(c, "#263b34", 4, 21 - (legPhase === 2 ? 1 : 0), 5, 1);
          dot(c, "#263b34", 23, 21 + (legPhase === 0 ? 1 : 0), 5, 1);
          // carapaça “respira”
          const shell = f < 3 ? "#9ca286" : "#8a906e";
          dot(c, shell, 11, 8, 9, 2);
          // antenas oscilam suavemente
          dot(c, "#d7b768", 7 + (f % 3), 20, 2, 1);
          dot(c, "#d7b768", 22 - (f % 2), 19, 2, 1);
        } else if (key === "moth") {
          // asas: 3 posições (fechada, meio, aberta)
          const wingStage = f % 3;
          const wingY  = wingStage === 0 ? 10 : wingStage === 1 ? 8 : 6;
          const wingH  = wingStage === 0 ? 4  : wingStage === 1 ? 6 : 8;
          const wingCol = wingStage === 2 ? "#d1c8da" : wingStage === 1 ? "#bbb0c9" : "#aaa5bc";
          dot(c, wingCol, 3, wingY, 8, wingH);
          dot(c, wingCol, 21, wingY, 8, wingH);
          // brilho nas asas
          dot(c, "#f1e6ca", 6, wingY + 1, 2, 2);
          dot(c, "#f1e6ca", 24, wingY + 1, 2, 2);
          // antenas oscilam
          dot(c, f % 2 ? "#c8b8d4" : "#9890ac", 13, 5 + (f % 2), 1, 4);
          dot(c, f % 2 ? "#c8b8d4" : "#9890ac", 15, 5 + (f % 2), 1, 4);
        } else { // guardian
          // braços oscilam lentamente
          const armOff = f < 3 ? 0 : 2;
          dot(c, f < 3 ? "#d7b768" : "#f1e6ca", 16, 19 + armOff, 4, 4 - armOff);
          dot(c, f < 3 ? "#d7b768" : "#f1e6ca", 29, 19 + armOff, 4, 4 - armOff);
          // coroa de folhas oscila
          dot(c, f % 2 ? "#91aa62" : "#719557", 9 + (f % 2), 4, 12, 2);
          dot(c, "#4e7443", 35 - (f % 2), 7, 8, 3);
          // olhos brilham em ciclo
          const eyeGlow = ["#e8ce81", "#f0dc95", "#ffe8a0", "#f0dc95", "#e8ce81", "#d4b66c"];
          dot(c, eyeGlow[f], 16, 19, 4, 4);
          dot(c, eyeGlow[f], 29, 19, 4, 4);
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
  }
  scene.anims.create({
    key: "ambient-grass-wind",
    frames: Array.from({ length: 4 }, (_, i) => ({ key: `grass-wind-${i}` })),
    frameRate: 5,
    repeat: 0,
    yoyo: true,
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
      repeat: key === "water" || key === "fire" ? -1 : 0,
      yoyo: key === "tree" || key === "flag",
    });

  for (const kind of ["hero", "master", "merchant"]) {
    for (let d = 0; d < 4; d++) {
      // ── idle: 3 frames genuínos ──────────────────────────────────────────
      // frame 0: pose base
      // frame 1: ombros sobem 1px (inspiração) — clonado e redesenhado
      // frame 2: olho pisca — clonado e redesenhado

      clone(`${kind}-${d}-0`, `${kind}-${d}-idle-0`, 20, 32, () => {});

      // frame 1: parte superior do corpo 1px acima (cabeça + torso)
      clone(`${kind}-${d}-0`, `${kind}-${d}-idle-1`, 20, 32, (c) => {
        // apaga a faixa do torso + cabeça
        c.clearRect(0, 0, 20, 24);
        // redesenha 1px acima
        c.drawImage(
          scene.textures.get(`${kind}-${d}-0`).getSourceImage() as HTMLCanvasElement,
          0, 0, 20, 23,  // src: torso + cabeça (primeiros 23px)
          0, -1, 20, 23, // dst: 1px acima
        );
      });

      // frame 2: olho piscando — usa base e pinta 1 linha sobre os olhos
      clone(`${kind}-${d}-0`, `${kind}-${d}-idle-2`, 20, 32, (c) => {
        // fecha o olho: pinta sobre a pupila com a cor da pele
        const eyeX = d === 2 ? 7 : d === 3 ? 13 : 9;
        dot(c, "#e2ba88", eyeX, 6, 1, 2);  // olho principal
        if (d === 0) dot(c, "#e2ba88", eyeX + 4, 6, 1, 2); // segundo olho
        dot(c, "#d5b080", eyeX, 7, 1, 1);  // pálpebra escura
        if (d === 0) dot(c, "#d5b080", eyeX + 4, 7, 1, 1);
      });

      // animação idle: 0→1→0→0→2→0 (pisca infrequente)
      scene.anims.create({
        key: `${kind}-idle-${d}`,
        frames: [
          { key: `${kind}-${d}-idle-0` },
          { key: `${kind}-${d}-idle-1` },
          { key: `${kind}-${d}-idle-0` },
          { key: `${kind}-${d}-idle-0` },
          { key: `${kind}-${d}-idle-2` },
          { key: `${kind}-${d}-idle-0` },
        ],
        frameRate: 1.2,
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
