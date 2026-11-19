import { test, expect, type Page } from "@playwright/test";
import { freshSave } from "../../src/domain/game";
import { mkdirSync, writeFileSync } from "node:fs";
const evidence = "docs/evidence/v23.09.2003.26/after";
mkdirSync(evidence, { recursive: true });

async function open(
  page: Page,
  map: "village" | "forest",
  x: number,
  y: number,
  motion: "full" | "reduced" = "full",
) {
  const s = freshSave();
  s.motion = motion;
  s.map = map;
  s.x = x;
  s.y = y;
  await page.addInitScript((save) => {
    if (!sessionStorage.getItem("v26-seeded")) {
      localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(save));
      sessionStorage.setItem("v26-seeded", "1");
    }
  }, s);
  await page.goto("/");
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        // @ts-expect-error exposed only for browser diagnostics
        Boolean(window.__PHASER_GAME__.scene.scenes[0].player),
      ),
    )
    .toBe(true);
  await page.waitForTimeout(400);
}

const scene = (page: Page) =>
  page.evaluate(() => {
    // @ts-expect-error exposed only for browser diagnostics
    const w = window.__PHASER_GAME__.scene.scenes[0];
    const trees = w.mapData.entities.filter((e: { kind: string }) => e.kind === "tree");
    return {
      rootObjects: w.root.list.length as number,
      species: [...new Set(w.treeSprites.map((t: { texture: { key: string } }) => t.texture.key.split("-")[0]))] as string[],
      treeRows: new Set(trees.map((t: { y: number }) => t.y % 32)).size as number,
      mist: w.mist.length as number,
      shadows: w.shadowLayer.list.length as number,
      markers: w.markers.length as number,
    };
  });

for (const [name, width, height] of [
  ["1366", 1366, 768],
  ["390", 390, 844],
] as const) {
  test(`vila e bosque com nova estética (${name})`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height });
    await open(page, "village", 200, 232);
    const village = await scene(page);
    expect(village.mist).toBe(0);
    expect(village.markers).toBe(3);
    expect(village.shadows).toBeGreaterThanOrEqual(3);
    await page.screenshot({ path: `${evidence}/village-${name}.png` });
    await page.evaluate(() => {
      // @ts-expect-error exposed only for browser diagnostics
      const w = window.__PHASER_GAME__.scene.scenes[0];
      w.store.state.map = "forest";
      w.store.state.x = 120;
      w.store.state.y = 232;
      w.build();
    });
    await page.waitForTimeout(500);
    const forest = await scene(page);
    expect(forest.mist).toBe(2);
    expect(forest.species.length).toBeGreaterThanOrEqual(2);
    // Organic layout: trees no longer sit on one repeated row pattern.
    expect(forest.treeRows).toBeGreaterThan(4);
    // Baked floor: far fewer objects than one sprite per tile (~1.120).
    expect(forest.rootObjects).toBeLessThan(80);
    await page.screenshot({ path: `${evidence}/forest-${name}.png` });
    expect(errors).toEqual([]);
  });
}

test("folha de sprites: personagens, árvores e monstros com contorno", async ({ page }) => {
  await open(page, "village", 200, 232);
  const sheet = await page.evaluate(() => {
    // @ts-expect-error exposed only for browser diagnostics
    const textures = window.__PHASER_GAME__.textures;
    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 640;
    const c = canvas.getContext("2d")!;
    c.imageSmoothingEnabled = false;
    c.fillStyle = "#739456";
    c.fillRect(0, 0, 960, 640);
    const draw = (key: string, x: number, y: number, scale: number) => {
      const img = textures.get(key).getSourceImage();
      c.drawImage(img, x, y, img.width * scale, img.height * scale);
    };
    let y = 4;
    for (const kind of ["hero", "hero-f", "master", "merchant"]) {
      let x = 4;
      for (let d = 0; d < 4; d++)
        for (let f = 0; f < 4; f++) {
          draw(`${kind}-${d}-${f}`, x, y, 3);
          x += 58;
        }
      y += 86;
    }
    let x = 4;
    for (const key of ["tree", "pine", "oakdark", "bush", "stump", "house"]) {
      draw(key, x, y, 2);
      x += key === "house" ? 0 : 84;
    }
    y += 110;
    x = 4;
    for (const key of ["sprout", "beetle", "moth", "guardian", "rock", "chest", "mark-master", "mark-merchant", "mark-fire", "mark-chest"]) {
      draw(key, x, y, 3);
      x += key === "guardian" ? 150 : 90;
    }
    return canvas.toDataURL("image/png").split(",")[1];
  });
  writeFileSync(`${evidence}/sprite-sheet.png`, Buffer.from(sheet, "base64"));
});
