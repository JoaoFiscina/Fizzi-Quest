import { test, expect, type Page } from "@playwright/test";
import { freshSave } from "../../src/domain/game";
import { mkdirSync } from "node:fs";
const evidence = "docs/evidence/v23.09.2003.27/after";
mkdirSync(evidence, { recursive: true });

const scene = (page: Page) =>
  page.evaluate(() => {
    // @ts-expect-error exposed only for browser diagnostics
    const world = window.__PHASER_GAME__?.scene.scenes[0];
    return world?.player
      ? { x: world.store.state.x, y: world.store.state.y, map: world.store.state.map }
      : null;
  });
const saved = (page: Page) =>
  page.evaluate(() => {
    const raw = localStorage.getItem("fizzi-quest.save.v1");
    return raw ? (JSON.parse(raw) as { x: number; y: number; map: string }) : null;
  });

test("canvas oculto no início não quebra o WebGL e o jogo abre depois", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  // Serve the page with the world container hidden from the very first paint.
  await page.route(/\/$/, async (route) => {
    const response = await route.fetch();
    const html = (await response.text()).replace(
      "</head>",
      '<style id="hide-world">#world{display:none!important}</style></head>',
    );
    await route.fulfill({ response, body: html });
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-renderer", "waiting");
  await page.evaluate(() => document.getElementById("hide-world")?.remove());
  await expect(page.locator("html")).toHaveAttribute("data-renderer", "auto");
  await page.getByRole("button", { name: "Nova aventura", exact: true }).click();
  await expect.poll(() => scene(page)).not.toBeNull();
  await page.screenshot({ path: `${evidence}/boot-after-hidden.png` });
  expect(errors).toEqual([]);
});

test("posição salva só depois de parar e aviso some ao trocar de mapa", async ({
  page,
}) => {
  const s = freshSave();
  s.x = 340;
  s.y = 168;
  await page.addInitScript(
    (save) => {
      if (!sessionStorage.getItem("v24-seeded")) {
        localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(save));
        sessionStorage.setItem("v24-seeded", "1");
      }
    },
    s,
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await expect(page.locator(".toast")).toHaveClass(/show/);
  await expect.poll(() => scene(page)).not.toBeNull();
  const start = (await saved(page))!;
  await page.keyboard.down("ArrowLeft");
  await page.waitForTimeout(450);
  const walking = (await scene(page))!;
  const duringWalk = (await saved(page))!;
  expect(walking.x).toBeLessThan(start.x - 5);
  expect(duringWalk.x).toBe(start.x);
  await page.keyboard.up("ArrowLeft");
  await expect
    .poll(async () => (await saved(page))!.x, { timeout: 3000 })
    .toBe((await scene(page))!.x);
  await page.keyboard.down("ArrowRight");
  await expect
    .poll(async () => (await scene(page))!.map, { timeout: 8000 })
    .toBe("forest");
  await page.keyboard.up("ArrowRight");
  await expect(page.locator(".toast")).not.toHaveClass(/show/);
  expect((await saved(page))!.map).toBe("forest");
  await page.screenshot({ path: `${evidence}/forest-after-transition.png` });
});

test("quina da casa não prende o herói ao andar só para cima", async ({
  page,
}) => {
  const s = freshSave();
  s.motion = "full";
  await page.addInitScript(
    (save) => localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(save)),
    s,
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await expect.poll(() => scene(page)).not.toBeNull();
  // Colado na borda direita do bloco da guilda (x 144–255, y 48–111), 2 px
  // para dentro da quina: subir direto bateria; o deslize contorna.
  await page.evaluate(() => {
    // @ts-expect-error exposed only for browser diagnostics
    const world = window.__PHASER_GAME__.scene.scenes[0];
    world.store.state.x = 258;
    world.store.state.y = 118;
  });
  await page.keyboard.down("ArrowUp");
  await page.waitForTimeout(700);
  await page.keyboard.up("ArrowUp");
  const after = (await scene(page))!;
  expect(after.y).toBeLessThan(110);
  expect(after.x).toBeGreaterThanOrEqual(260);
});
