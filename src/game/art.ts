import Phaser from "phaser";
import { polishArt } from "./polishArt";
export function createArt(scene: Phaser.Scene) {
  const texture = (
    key: string,
    w: number,
    h: number,
    draw: (ctx: CanvasRenderingContext2D) => void,
  ) => {
    const t = scene.textures.createCanvas(key, w, h)!;
    draw(t.context);
    t.refresh();
  };
  const rect = (
    c: CanvasRenderingContext2D,
    color: string,
    x: number,
    y: number,
    w: number,
    h: number,
  ) => {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
  };
  for (let variant = 0; variant < 4; variant++)
    texture("grass" + variant, 16, 16, (c) => {
      rect(
        c,
        ["#739456", "#769858", "#79985a", "#719153"][variant],
        0,
        0,
        16,
        16,
      );
      for (let i = 0; i < 6; i++) {
        const x = (i * 7 + variant * 3) % 15,
          y = (i * 11 + variant) % 15;
        rect(c, i % 2 ? "#88a263" : "#68864e", x, y, 1, 2);
      }
    });
  texture("path", 16, 16, (c) => {
    rect(c, "#c9b17c", 0, 0, 16, 16);
    rect(c, "#d6c395", 0, 1, 16, 13);
    rect(c, "#baa571", 3, 5, 2, 1);
    rect(c, "#e2cf9e", 11, 10, 3, 1);
    rect(c, "#baa571", 8, 15, 1, 1);
  });
  texture("water", 16, 16, (c) => {
    rect(c, "#387b80", 0, 0, 16, 16);
    rect(c, "#4d9091", 1, 5, 8, 1);
    rect(c, "#6aabaa", 9, 12, 5, 1);
  });
  texture("tree", 40, 52, (c) => {
    rect(c, "#557646", 8, 43, 27, 6);
    rect(c, "#604b35", 17, 29, 8, 20);
    rect(c, "#a5814f", 18, 32, 3, 15);
    rect(c, "#284d39", 8, 9, 26, 29);
    rect(c, "#284d39", 3, 20, 35, 14);
    rect(c, "#355f3e", 5, 13, 29, 20);
    rect(c, "#467448", 9, 5, 22, 24);
    rect(c, "#5e8650", 13, 3, 13, 16);
    rect(c, "#74995b", 13, 5, 10, 3);
    rect(c, "#74995b", 7, 18, 8, 2);
    rect(c, "#527f46", 25, 15, 9, 13);
    rect(c, "#223f31", 9, 34, 23, 3);
  });
  texture("house", 112, 88, (c) => {
    rect(c, "#59744b", 6, 73, 103, 12);
    rect(c, "#735b3e", 14, 28, 84, 49);
    rect(c, "#e5d1a0", 17, 31, 78, 43);
    rect(c, "#c0a475", 17, 62, 78, 12);
    rect(c, "#4c4e36", 12, 27, 88, 4);
    rect(c, "#7c4436", 4, 25, 104, 6);
    for (let y = 0; y < 6; y++) {
      rect(
        c,
        y % 2 ? "#b46a49" : "#a85941",
        12 - y * 2,
        4 + y * 4,
        88 + y * 4,
        4,
      );
      for (let x = 0; x < 10; x++)
        rect(c, "#d28758", 16 + x * 9 + (y % 2 ? 4 : 0), 5 + y * 4, 7, 1);
    }
    rect(c, "#654b34", 49, 47, 18, 30);
    rect(c, "#263e36", 52, 49, 12, 28);
    rect(c, "#d7b768", 62, 64, 2, 2);
    for (const x of [26, 77]) {
      rect(c, "#846541", x - 2, 43, 15, 19);
      rect(c, "#2e5960", x, 45, 11, 13);
      rect(c, "#e6cd83", x + 5, 45, 1, 13);
      rect(c, "#e6cd83", x, 51, 11, 1);
    }
    rect(c, "#ebe0bc", 47, 77, 22, 4);
    rect(c, "#beaa7a", 44, 81, 28, 3);
  });
  texture("stall", 64, 48, (c) => {
    rect(c, "#557646", 2, 42, 59, 6);
    rect(c, "#795536", 7, 10, 4, 32);
    rect(c, "#795536", 53, 10, 4, 32);
    rect(c, "#855d3e", 4, 33, 56, 11);
    rect(c, "#ca9a60", 6, 33, 52, 4);
    for (let i = 0; i < 6; i++) {
      rect(c, i % 2 ? "#efe0b5" : "#b76847", 2 + i * 10, 4, 10, 13);
      rect(c, i % 2 ? "#c5b48b" : "#934d3a", 2 + i * 10, 17, 10, 5);
    }
    rect(c, "#91aa62", 12, 28, 9, 5);
    rect(c, "#b66a49", 28, 27, 6, 6);
    rect(c, "#d7b768", 42, 28, 8, 5);
  });
  texture("rock", 24, 20, (c) => {
    rect(c, "#557047", 1, 15, 23, 5);
    rect(c, "#5e6b60", 3, 5, 19, 12);
    rect(c, "#859080", 6, 2, 13, 13);
    rect(c, "#a7ad8c", 8, 3, 9, 3);
    rect(c, "#71864e", 2, 12, 9, 4);
  });
  texture("fire", 24, 24, (c) => {
    rect(c, "#61714f", 2, 18, 20, 5);
    rect(c, "#776345", 3, 17, 18, 3);
    rect(c, "#cd7848", 7, 10, 12, 9);
    rect(c, "#e0a958", 9, 5, 8, 14);
    rect(c, "#f5d995", 11, 9, 4, 10);
    rect(c, "#e0a958", 13, 2, 3, 8);
  });
  texture("chest", 24, 20, (c) => {
    rect(c, "#4f5139", 2, 4, 20, 15);
    rect(c, "#9b633b", 3, 2, 18, 15);
    rect(c, "#d5a258", 3, 7, 18, 3);
    rect(c, "#e2c77e", 10, 7, 4, 7);
    rect(c, "#62462f", 4, 16, 16, 3);
  });
  for (const kind of ["hero", "master", "merchant"])
    for (let dir = 0; dir < 4; dir++)
      for (let frame = 0; frame < 5; frame++)
        texture(`${kind}-${dir}-${frame}`, 20, 32, (c) => {
          // ─── paleta por personagem ───────────────────────────────────────
          const coat =
            kind === "hero" ? "#3d6b73"
            : kind === "master" ? "#b98446" : "#927193";
          const coatDark =
            kind === "hero" ? "#2a4e56"
            : kind === "master" ? "#7d5b2a" : "#6a3d6a";
          const coatLight =
            kind === "hero" ? "#5a9099"
            : kind === "master" ? "#d4a462" : "#b090ba";

          // ─── ciclo de caminhada ──────────────────────────────────────────
          // frame 0 = neutral (idle base)
          // frame 1 = passo L  (perna esq +4y, braço dir sobe)
          // frame 2 = neutral alto (bob –1px, corpo sobe 1px)
          // frame 3 = passo R  (perna dir +4y, braço esq sobe)
          // frame 4 = neutral alto (espelho do 2)
          const neutral = frame === 0 || frame === 2 || frame === 4;
          const stepL   = frame === 1;   // perna esq à frente
          const stepR   = frame === 3;   // perna dir à frente
          const bob      = (frame === 2 || frame === 4) ? -1 : 0; // corpo 1px acima no meio da passada

          // deslocamentos de perna: +4 = à frente, -3 = atrás
          const legLy = stepL ? 4 : stepR ? -3 : 0;  // perna esquerda
          const legRy = stepR ? 4 : stepL ? -3 : 0;  // perna direita

          // deslocamentos de braço: sobe 3px quando a perna oposta avança
          const armLy = stepR ? -3 : stepL ? 2 : 0;  // braço esq (oposto ao passo)
          const armRy = stepL ? -3 : stepR ? 2 : 0;  // braço dir

          // ─── sombra de contato no chão ───────────────────────────────────
          rect(c, "#12392b", 5, 29, 12, 2);
          rect(c, "#0a2418", 7, 30, 8, 1);

          // ─── perna esquerda ──────────────────────────────────────────────
          // canela
          rect(c, coatDark, 6, 22 + legLy + bob, 3, neutral ? 6 : 5);
          rect(c, "#2e2e26", 5, 22 + legLy + bob, 4, neutral ? 6 : 5);
          // pé
          rect(c, "#222018", 4, 27 + legLy + bob, 5, 2);
          rect(c, "#333028", 4, 27 + legLy + bob, 5, 1);

          // ─── perna direita ───────────────────────────────────────────────
          rect(c, coatDark, 12, 22 + legRy + bob, 3, neutral ? 6 : 5);
          rect(c, "#2e2e26", 11, 22 + legRy + bob, 4, neutral ? 6 : 5);
          rect(c, "#222018", 11, 27 + legRy + bob, 5, 2);
          rect(c, "#333028", 11, 27 + legRy + bob, 5, 1);

          // ─── cinturão ────────────────────────────────────────────────────
          rect(c, "#d5b773", 5, 20 + bob, 11, 2);
          rect(c, "#b89650", 5, 21 + bob, 11, 1);
          rect(c, "#edd990", 9, 20 + bob, 3, 1); // fivela

          // ─── corpo / casaco ───────────────────────────────────────────────
          rect(c, "#1a3028", 4, 10 + bob, 13, 11); // contorno
          rect(c, coatDark, 4, 11 + bob, 13, 10);
          rect(c, coat, 5, 11 + bob, 11, 9);
          rect(c, coatLight, 6, 12 + bob, 3, 5); // reflexo esq
          rect(c, coatDark, 13, 13 + bob, 2, 6); // sombra dir

          // ─── braço esquerdo ──────────────────────────────────────────────
          rect(c, coatDark, 3, 12 + bob + armLy, 3, neutral ? 7 : 6);
          rect(c, "#e2ba88", 3, 14 + bob + armLy, 3, neutral ? 5 : 4);
          // mão esq
          rect(c, "#e8c898", 3, 18 + bob + armLy, 3, 2);

          // ─── braço direito ───────────────────────────────────────────────
          rect(c, coatDark, 15, 12 + bob + armRy, 3, neutral ? 7 : 6);
          rect(c, "#e2ba88", 15, 14 + bob + armRy, 2, neutral ? 5 : 4);
          // mão dir
          rect(c, "#e8c898", 15, 18 + bob + armRy, 2, 2);

          // ─── acessórios do herói ─────────────────────────────────────────
          if (kind === "hero") {
            // capa lateral esquerda
            rect(c, "#8a4e38", 4, 11 + bob, 3, 10);
            rect(c, "#b06040", 3, 13 + bob, 2, 7);
            // haste de espada (lado dir, atrás do braço)
            rect(c, "#c1cfb5", 17, 15 + bob + armRy, 2, 8);
            rect(c, "#8fa3a0", 17, 13 + bob + armRy, 1, 3);
          }

          // ─── pescoço ─────────────────────────────────────────────────────
          rect(c, "#c9a87c", 8, 8 + bob, 5, 3);
          rect(c, "#b8956c", 8, 10 + bob, 5, 1); // sombra pescoço→tronco

          // ─── cabeça ──────────────────────────────────────────────────────
          rect(c, "#e2ba88", 6, 2 + bob, 10, 9);
          // contorno pixel art
          rect(c, "#1a2e27", 5, 2 + bob, 1, 8);  // esq
          rect(c, "#1a2e27", 16, 3 + bob, 1, 7); // dir
          rect(c, "#1a2e27", 6, 1 + bob, 9, 1);  // topo
          rect(c, "#1a2e27", 6, 10 + bob, 9, 1); // base
          // volume / bochechas
          rect(c, "#f0ccaa", 6, 4 + bob, 2, 4);  // reflexo esq
          rect(c, "#cda071", 14, 5 + bob, 2, 3); // sombra dir

          // ─── cabelo ───────────────────────────────────────────────────────
          rect(c, "#5a3722", 5, 1 + bob, 12, 5);
          rect(c, "#7a4e2e", 7, 0 + bob, 9, 3);
          rect(c, "#9a6840", 9, 0 + bob, 5, 2); // topo claro
          rect(c, "#412818", 5, 4 + bob, 3, 2); // lateral esq escura
          rect(c, "#412818", 14, 5 + bob, 2, 2); // lateral dir escura
          rect(c, "#7a4e2e", 5, 6 + bob, 2, 2); // mecha lateral esq

          // ─── olhos e sobrancelhas ─────────────────────────────────────────
          if (dir !== 1) {
            const eyeX = dir === 2 ? 7 : dir === 3 ? 13 : 9;
            rect(c, "#1a2e27", eyeX, 6 + bob, 1, 2);           // olho principal
            if (dir === 0) rect(c, "#1a2e27", eyeX + 4, 6 + bob, 1, 2); // segundo olho (frente)
            rect(c, "#f5d9b0", eyeX + 1, 6 + bob, 1, 1);       // brilho do olho
            // sobrancelha
            rect(c, "#3d2010", eyeX, 5 + bob, 2, 1);
            if (dir === 0) rect(c, "#3d2010", eyeX + 4, 5 + bob, 2, 1);
          } else {
            // costas: nuca com cabelo
            rect(c, "#5a3722", 6, 6 + bob, 9, 5);
          }
        });

  texture("sprout", 32, 32, (c) => {
    rect(c, "#476140", 4, 26, 24, 4);
    rect(c, "#304e36", 6, 13, 21, 15);
    rect(c, "#9ca96a", 9, 13, 16, 13);
    rect(c, "#becc87", 11, 14, 10, 3);
    rect(c, "#254b37", 13, 4, 3, 11);
    rect(c, "#487e48", 3, 5, 12, 7);
    rect(c, "#7da556", 17, 2, 12, 8);
    rect(c, "#91b862", 18, 2, 8, 3);
    rect(c, "#1e3b32", 11, 20, 3, 3);
    rect(c, "#1e3b32", 21, 19, 3, 3);
    rect(c, "#5a7044", 9, 28, 5, 3);
    rect(c, "#5a7044", 22, 27, 5, 3);
  });
  texture("beetle", 32, 32, (c) => {
    rect(c, "#38483c", 2, 12, 28, 15);
    rect(c, "#69776a", 6, 7, 21, 19);
    rect(c, "#9ca286", 10, 6, 12, 15);
    rect(c, "#445744", 16, 7, 2, 17);
    rect(c, "#e3c786", 7, 24, 3, 2);
    rect(c, "#e3c786", 23, 24, 3, 2);
  });
  texture("moth", 32, 32, (c) => {
    rect(c, "#8787a3", 2, 7, 11, 17);
    rect(c, "#c2b8cd", 4, 9, 8, 10);
    rect(c, "#8787a3", 19, 7, 11, 17);
    rect(c, "#c2b8cd", 21, 9, 7, 10);
    rect(c, "#4a565f", 13, 10, 6, 19);
    rect(c, "#e8d3a5", 14, 12, 4, 3);
  });
  texture("guardian", 48, 52, (c) => {
    rect(c, "#264c37", 7, 13, 35, 32);
    rect(c, "#718757", 12, 9, 25, 34);
    rect(c, "#405e39", 4, 22, 10, 24);
    rect(c, "#405e39", 36, 22, 10, 24);
    rect(c, "#426b40", 8, 2, 32, 13);
    rect(c, "#91aa62", 13, 0, 22, 7);
    rect(c, "#e8ce81", 16, 19, 4, 4);
    rect(c, "#e8ce81", 29, 19, 4, 4);
    rect(c, "#344c35", 19, 32, 12, 3);
    rect(c, "#405e39", 11, 40, 10, 10);
    rect(c, "#405e39", 28, 40, 10, 10);
  });
  polishArt(scene);
}
