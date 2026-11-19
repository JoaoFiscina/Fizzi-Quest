import Phaser from "phaser";
import { polishArt } from "./polishArt";
import { createMonsterArt } from "./monsterArt";
import { createCharacterArt } from "./characterArt";
import { createNatureArt, finishProps } from "./natureArt";
export function createArt(scene: Phaser.Scene) {
  if (scene.textures.exists("water-0") && scene.anims.exists("ambient-water"))
    return;
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
  const pathEdge = (key: string, side: "n" | "e" | "s" | "w") =>
    texture(key, 16, 16, (c) => {
      const dark = "#9f8b61";
      const light = "#e1cf9f";
      if (side === "n" || side === "s") {
        const y = side === "n" ? 0 : 14;
        rect(c, dark, 0, y, 16, 2);
        for (let x = 1; x < 16; x += 4)
          rect(c, light, x, side === "n" ? y + 1 : y, 2, 1);
      } else {
        const x = side === "w" ? 0 : 14;
        rect(c, dark, x, 0, 2, 16);
        for (let y = 2; y < 16; y += 4)
          rect(c, light, side === "w" ? x + 1 : x, y, 1, 2);
      }
    });
  pathEdge("path-edge-n", "n");
  pathEdge("path-edge-e", "e");
  pathEdge("path-edge-s", "s");
  pathEdge("path-edge-w", "w");
  texture("grass-tuft", 16, 16, (c) => {
    rect(c, "#547642", 4, 9, 1, 5);
    rect(c, "#63864a", 7, 7, 1, 7);
    rect(c, "#8eaa61", 9, 9, 1, 5);
    rect(c, "#6d914f", 11, 8, 1, 6);
    rect(c, "#48693c", 3, 13, 10, 1);
  });
  texture("wildflower", 16, 16, (c) => {
    rect(c, "#4f733f", 8, 8, 1, 6);
    rect(c, "#d8c477", 6, 6, 5, 3);
    rect(c, "#f1e6ca", 7, 5, 3, 4);
    rect(c, "#9aaa62", 5, 11, 3, 1);
  });
  texture("pebbles", 16, 16, (c) => {
    rect(c, "#657263", 3, 10, 4, 2);
    rect(c, "#9ba088", 4, 9, 2, 1);
    rect(c, "#59675b", 10, 6, 3, 2);
    rect(c, "#a9aa91", 10, 5, 2, 1);
  });
  texture("courtyard-stone", 16, 16, (c) => {
    rect(c, "#a9956c", 2, 11, 6, 2);
    rect(c, "#e6d1a1", 3, 11, 4, 1);
    rect(c, "#af9c71", 10, 3, 4, 2);
    rect(c, "#ebd7aa", 10, 3, 3, 1);
  });
  texture("forest-moss", 16, 16, (c) => {
    rect(c, "#476b48", 2, 12, 8, 2);
    rect(c, "#658b55", 4, 11, 7, 1);
    rect(c, "#86a264", 6, 10, 3, 1);
    rect(c, "#4d7552", 11, 6, 3, 2);
  });
  texture("forest-stone", 16, 16, (c) => {
    rect(c, "#586b60", 3, 11, 7, 3);
    rect(c, "#a1ad8e", 4, 10, 5, 2);
    rect(c, "#61756a", 11, 5, 3, 2);
    rect(c, "#b4b99a", 11, 5, 2, 1);
  });
  texture("water", 16, 16, (c) => {
    rect(c, "#387b80", 0, 0, 16, 16);
    rect(c, "#4d9091", 1, 5, 8, 1);
    rect(c, "#6aabaa", 9, 12, 5, 1);
  });
  texture("house", 112, 88, (c) => {
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
    rect(c, "#5e6b60", 3, 5, 19, 12);
    rect(c, "#859080", 6, 2, 13, 13);
    rect(c, "#a7ad8c", 8, 3, 9, 3);
    rect(c, "#71864e", 2, 12, 9, 4);
  });
  texture("fire", 24, 24, (c) => {
    for (const [x, y] of [[2, 19], [6, 21], [11, 22], [16, 21], [19, 19]]) {
      rect(c, "#68705f", x, y, 4, 2);
      rect(c, "#a7a78e", x + 1, y, 2, 1);
    }
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
  createMonsterArt(scene);
  polishArt(scene);
  createCharacterArt(scene);
  createNatureArt(scene);
  finishProps(scene);
}
