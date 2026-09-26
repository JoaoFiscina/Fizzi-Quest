import { test, expect, type Page } from "@playwright/test";
import { freshSave, startBattle } from "../../src/domain/game";
import { mkdirSync, writeFileSync } from "node:fs";

const evidence = "docs/evidence/v23.09.2003.15";
const phase = process.env.FIZZI_CAPTURE_BASELINE ? "before" : "after";

async function enter(
  page: Page,
  map: "village" | "forest",
  x: number,
  y: number,
) {
  const save = freshSave();
  save.map = map;
  save.x = x;
  save.y = y;
  save.motion = "reduced";
  save.cameraZoom = "far";
  await page.goto("/");
  await page.evaluate(
    (state) =>
      localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(state)),
    save,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await expect(page.locator(".place strong")).toContainText(
    map === "village" ? "Vila" : "Bosque",
  );
  await page.waitForTimeout(300);
}

test("referências comparáveis de vila, bosque e mapa", async ({ page }) => {
  mkdirSync(`${evidence}/${phase}`, { recursive: true });
  await enter(page, "village", 200, 232);
  await page.screenshot({ path: `${evidence}/${phase}/village.png` });
  await page.getByRole("button", { name: "Mapa", exact: true }).click();
  if (phase === "after") {
    await expect(page.locator(".map-known .map-area")).toHaveCount(3);
    await expect(page.locator(".map-future .map-area.locked")).toHaveCount(3);
  }
  await page.screenshot({ path: `${evidence}/${phase}/map-desktop.png` });
  await page.getByRole("button", { name: "Fechar menu" }).click();
  await enter(page, "forest", 152, 232);
  await page.screenshot({ path: `${evidence}/${phase}/forest.png` });
  await enter(page, "forest", 392, 184);
  await page.screenshot({ path: `${evidence}/${phase}/forest-fork.png` });
});

test("mapa responsivo e estados conhecidos", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enter(page, "forest", 152, 232);
  await page.screenshot({ path: `${evidence}/after/mobile-world.png` });
  await page.getByRole("button", { name: "Mapa", exact: true }).click();
  await expect(page.locator(".map-area.forest .map-status")).toHaveText(
    "VOCÊ ESTÁ AQUI",
  );
  await expect(page.locator(".map-future .map-area.locked")).toHaveCount(3);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: `${evidence}/after/map-mobile-top.png` });
  await page
    .locator(".world-map")
    .screenshot({ path: `${evidence}/after/map-mobile.png` });
  await page.getByRole("button", { name: "Fechar menu" }).click();
  await page.evaluate(() => {
    // @ts-expect-error scene exposed for diagnostics
    const store = window.__PHASER_GAME__.scene.scenes[0].store;
    store.transact((save: any) => save.defeated.push("guardian"));
  });
  await page.getByRole("button", { name: "Mapa", exact: true }).click();
  await expect(page.locator(".map-area.watch .map-status")).toHaveText(
    "RECUPERADO",
  );
  await page.getByRole("button", { name: "Fechar menu" }).click();
  for (const size of [
    { width: 430, height: 932 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(size);
    await page.getByRole("button", { name: "Mapa", exact: true }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Fechar menu" }).click();
  }
});

test("quatro criaturas animam sem deslocar posição por 30 segundos", async ({
  page,
}) => {
  test.setTimeout(90000);
  await enter(page, "forest", 152, 232);
  await page.evaluate(() => {
    // @ts-expect-error scene exposed for diagnostics
    const scene = window.__PHASER_GAME__.scene.scenes[0];
    scene.store.transact((save: any) => (save.motion = "full"));
  });
  const samples: any[] = [];
  for (let i = 0; i < 31; i++) {
    samples.push(
      await page.evaluate(() => {
        // @ts-expect-error scene exposed for diagnostics
        const scene = window.__PHASER_GAME__.scene.scenes[0];
        return {
          monsters: [...scene.enemySprites.entries()].map(
            ([key, sprite]: any) => [
              key,
              sprite.texture.key,
              sprite.x,
              sprite.y,
            ],
          ),
          waterFirePlaying: [...scene.waterSprites, ...scene.fireSprites].every(
            (sprite: any) => sprite.anims.isPlaying,
          ),
          timer: scene.getAmbientDiagnostics().timerActive,
        };
      }),
    );
    await page.waitForTimeout(1000);
  }
  expect(
    samples.every((sample) => sample.waterFirePlaying && sample.timer),
  ).toBe(true);
  for (let monster = 0; monster < 4; monster++) {
    expect(
      new Set(samples.map((sample) => sample.monsters[monster][1])).size,
    ).toBeGreaterThan(1);
    expect(
      new Set(
        samples.map((sample) => sample.monsters[monster].slice(2).join(",")),
      ).size,
    ).toBe(1);
  }
  writeFileSync(
    `${evidence}/after/monster-cadence.json`,
    JSON.stringify(samples, null, 2),
  );
  const sheet = await page.evaluate(() => {
    // @ts-expect-error game exposed for diagnostics
    const textures = window.__PHASER_GAME__.textures;
    const canvas = document.createElement("canvas");
    canvas.width = 4 * 56 * 4;
    canvas.height = 4 * 60 * 4;
    const context = canvas.getContext("2d")!;
    context.imageSmoothingEnabled = false;
    ["sprout", "beetle", "moth", "guardian"].forEach((kind, row) => {
      for (let frame = 0; frame < 4; frame++) {
        const image = textures.get(`${kind}-idle-${frame}`).getSourceImage();
        context.drawImage(
          image,
          frame * 56 * 4,
          row * 60 * 4,
          image.width * 4,
          image.height * 4,
        );
      }
    });
    return canvas.toDataURL("image/png").split(",")[1];
  });
  writeFileSync(
    `${evidence}/after/monster-frames.png`,
    Buffer.from(sheet, "base64"),
  );
});

test("poses de carapaça e preparo refletem o combate salvo", async ({
  page,
}) => {
  const save = freshSave();
  save.motion = "reduced";
  startBattle(save, "beetle");
  await page.goto("/");
  await page.evaluate(
    (state) =>
      localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(state)),
    save,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  expect(
    await page.evaluate(() => {
      // @ts-expect-error scene exposed for diagnostics
      return window.__PHASER_GAME__.scene.scenes[0].presentation.enemy.texture
        .key;
    }),
  ).toBe("beetle-guard");
  await page.screenshot({ path: `${evidence}/after/battle-beetle.png` });
  const guardian = freshSave();
  guardian.motion = "reduced";
  startBattle(guardian, "guardian");
  guardian.battle!.round = 2;
  const context = page.context();
  await page.close();
  const guardianPage = await context.newPage();
  await guardianPage.addInitScript(
    (state) =>
      localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(state)),
    guardian,
  );
  await guardianPage.goto("/");
  await guardianPage
    .getByRole("button", { name: "Continuar aventura" })
    .click();
  expect(
    await guardianPage.evaluate(() => {
      // @ts-expect-error scene exposed for diagnostics
      return window.__PHASER_GAME__.scene.scenes[0].presentation.enemy.texture
        .key;
    }),
  ).toBe("guardian-prepare");
  await guardianPage.screenshot({
    path: `${evidence}/after/battle-guardian.png`,
  });
});
