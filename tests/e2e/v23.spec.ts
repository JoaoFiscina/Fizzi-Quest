import { test, expect } from "@playwright/test";
import { freshSave } from "../../src/domain/game";
import { mkdirSync } from "node:fs";
const evidence = "docs/evidence/v23.09.2003.23/after";
mkdirSync(evidence, { recursive: true });

test("Ajustes abre diário completo, navega por teclado e cabe nos quatro layouts", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Nova aventura" }).click();
  await page.getByRole("button", { name: "Ajustes", exact: true }).click();
  await page.getByRole("tab", { name: "Diário de versões" }).click();
  await expect(page.getByRole("tabpanel")).toContainText(
    "v23.09.2003.23 · 01/10/2026 · INSTALADA",
  );
  await expect(page.locator(".release-entry")).toHaveCount(21);
  for (const size of [
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 1366, height: 768 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(size);
    await page.locator(".release-entry").first().scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${evidence}/diary-${size.width}.png` });
    await page.locator(".release-entry").last().scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("heading", { name: "A Trilha Esquecida", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("tab", { name: "Diário de versões" }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("tab", { name: "Preferências" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(
    page.getByRole("heading", { name: "Sua forma de explorar" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Fechar menu" }).click();
});

test("teto runtime de 100 px/s permite Impulso acima dele, diagonal normalizada e colisão", async ({
  page,
}) => {
  const s = freshSave();
  s.adventureXpTotal = 20475;
  s.allocated.agility = 35;
  s.x = 160;
  s.y = 232;
  s.motion = "reduced";
  await page.goto("/");
  await page.evaluate(
    (save) => localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(save)),
    s,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  const speed = () =>
    page.evaluate(() => {
      // @ts-expect-error scene diagnostic
      return window.__PHASER_GAME__.scene.scenes[0].speed;
    });
  await expect.poll(speed).toBe(100);
  await page.getByRole("button", { name: "Ativar Impulso da Trilha" }).click();
  await expect.poll(speed).toBe(140);
  const point = () =>
    page.evaluate(() => {
      // @ts-expect-error scene diagnostic
      const s = window.__PHASER_GAME__.scene.scenes[0].store.state;
      return { x: s.x, y: s.y };
    });
  const start = await point();
  await page.keyboard.down("d");
  await page.waitForTimeout(200);
  await page.keyboard.up("d");
  const straight = await point();
  expect(straight.x - start.x).toBeGreaterThan(5);
  await page.evaluate(() => {
    // @ts-expect-error scene diagnostic
    const s = window.__PHASER_GAME__.scene.scenes[0].store.state;
    s.x = 160;
    s.y = 232;
  });
  await page.keyboard.down("d");
  await page.keyboard.down("s");
  await page.waitForTimeout(200);
  await page.keyboard.up("d");
  await page.keyboard.up("s");
  const diagonal = await point();
  expect(Math.hypot(diagonal.x - 160, diagonal.y - 232)).toBeLessThan(
    Math.hypot(straight.x - start.x, straight.y - start.y) * 1.3,
  );
  await page.evaluate(() => {
    // @ts-expect-error scene diagnostic
    const scene = window.__PHASER_GAME__.scene.scenes[0];
    scene.store.transact((s: any) => {
      s.x = 24;
      s.y = 232;
    });
  });
  await page.keyboard.down("a");
  await page.waitForTimeout(500);
  await page.keyboard.up("a");
  expect((await point()).x).toBeGreaterThanOrEqual(20);
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await expect.poll(speed).toBe(100);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("fizzi-quest.save.v1")!).stamina,
    ),
  ).toBe(7);
});
