import { test, expect, type Page } from "@playwright/test";
import { freshSave } from "../../src/domain/game";

async function startWithSave(page: Page, map: "village" | "forest") {
  const save = freshSave();
  save.map = map;
  save.x = map === "forest" ? 152 : 200;
  save.y = 232;
  await page.goto("/");
  await page.evaluate(
    (state) =>
      localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(state)),
    save,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
}

async function ambience(page: Page) {
  return page.evaluate(() => {
    // @ts-expect-error exposed only for browser diagnostics
    const scene = window.__PHASER_GAME__.scene.scenes[0];
    return {
      ...scene.getAmbientDiagnostics(),
      timerEvents:
        (scene.time._active?.length ?? 0) +
        (scene.time._pendingInsertion?.length ?? 0),
      decorativeVisible: scene.effectSprites.filter(
        (entry: any) => entry.sprite.visible,
      ).length,
    };
  });
}

test("controlador ambiental alterna fases e sobrevive à troca de mapa sem duplicar timers", async ({
  page,
}) => {
  await startWithSave(page, "village");
  const still = await ambience(page);
  expect(still.mode).toBe("normal");
  expect(still.targetCount).toBeGreaterThan(20);
  expect(still.enabledTargetCount).toBe(still.targetCount);
  expect(still.timerEvents).toBe(1);
  expect(new Set(still.phases).size).toBeGreaterThan(4);
  await page.screenshot({ path: "test-results/v13-desktop-village-still.png" });

  await page.evaluate(() => {
    // @ts-expect-error test-only acceleration for finite ambient cycles
    window.__FIZZI_TEST_AMBIENCE__ = true;
    // @ts-expect-error exposed only for browser diagnostics
    window.__PHASER_GAME__.scene.scenes[0].build();
  });
  await expect
    .poll(async () => (await ambience(page)).activeCount)
    .toBeGreaterThan(0);
  const villageActive = await ambience(page);
  expect(villageActive.activeCount).toBeLessThanOrEqual(2);
  expect(villageActive.timerEvents).toBe(1);
  await page.screenshot({ path: "test-results/v13-desktop-village-cycle.png" });

  await page.evaluate(() => {
    // @ts-expect-error exposed only for browser diagnostics
    const scene = window.__PHASER_GAME__.scene.scenes[0];
    // @ts-expect-error test-only acceleration is disabled for the still frame
    window.__FIZZI_TEST_AMBIENCE__ = false;
    scene.store.state.x = 380;
    scene.player.x = 380;
  });
  await expect(page.locator(".place strong")).toHaveText("Bosque das Brumas");
  await expect(page.locator(".toast")).not.toHaveClass(/show/);
  await page.evaluate(() => {
    // @ts-expect-error exposed only for browser diagnostics
    window.__PHASER_GAME__.scene.scenes[0].build();
  });
  await expect.poll(async () => (await ambience(page)).timerEvents).toBe(1);
  const forestStill = await ambience(page);
  expect(forestStill.activeCount).toBe(0);
  await page.screenshot({ path: "test-results/v13-desktop-forest-still.png" });

  await page.evaluate(() => {
    // @ts-expect-error test-only acceleration for finite ambient cycles
    window.__FIZZI_TEST_AMBIENCE__ = true;
    // @ts-expect-error exposed only for browser diagnostics
    window.__PHASER_GAME__.scene.scenes[0].build();
  });
  await expect
    .poll(async () => (await ambience(page)).activeCount)
    .toBeGreaterThan(0);
  const forestActive = await ambience(page);
  expect(forestActive.timerEvents).toBe(1);
  expect(forestActive.activeCount).toBeLessThanOrEqual(2);
  await page.screenshot({ path: "test-results/v13-desktop-forest-cycle.png" });

  const animationRegistry = await page.evaluate(() => {
    // @ts-expect-error exposed only for browser diagnostics
    const manager = window.__PHASER_GAME__.anims;
    const keys = [
      "ambient-water",
      "ambient-fire",
      "ambient-tree",
      "ambient-grass-wind",
      "ambient-grass-tuft",
      "ambient-flag",
      "ambient-leaf",
      "ambient-dust",
    ];
    return keys.map((key) => ({ key, exists: manager.exists(key) }));
  });
  expect(animationRegistry.every((entry) => entry.exists)).toBe(true);
  expect(new Set(animationRegistry.map((entry) => entry.key)).size).toBe(
    animationRegistry.length,
  );
});

test("reduced motion limita ciclos essenciais e desativa detalhes decorativos", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    // @ts-expect-error test-only acceleration for finite ambient cycles
    window.__FIZZI_TEST_AMBIENCE__ = true;
  });
  await startWithSave(page, "village");
  await expect(page.locator("html")).toHaveAttribute(
    "data-ambient-mode",
    "reduced",
  );
  await expect
    .poll(async () => (await ambience(page)).activations)
    .toBeGreaterThan(0);
  const reduced = await ambience(page);
  expect(reduced.maxActive).toBe(1);
  expect(reduced.activeCount).toBeLessThanOrEqual(1);
  expect(reduced.enabledTargetCount).toBeLessThan(reduced.targetCount);
  expect(reduced.decorativeVisible).toBe(0);
  expect(
    reduced.kindsActivated.every((kind) => ["water", "fire"].includes(kind)),
  ).toBe(true);
  expect(reduced.timerEvents).toBe(1);
  await page.screenshot({
    path: "test-results/v13-desktop-reduced-motion.png",
  });
});

test("ambientação móvel preserva enquadramento, HUD e direcional", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    // @ts-expect-error test-only acceleration for finite ambient cycles
    window.__FIZZI_TEST_AMBIENCE__ = true;
  });
  await startWithSave(page, "village");
  await page.getByRole("button", { name: "Ajustes", exact: true }).click();
  await page.getByRole("button", { name: "Afastado", exact: true }).click();
  await page.getByRole("button", { name: "Fechar menu" }).click();
  await expect
    .poll(async () => (await ambience(page)).activeCount)
    .toBeGreaterThan(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const hud = await page.locator(".hud").boundingBox();
  const pad = await page.locator(".dpad").boundingBox();
  expect(hud!.y + hud!.height).toBeLessThan(pad!.y);
  expect((await ambience(page)).activeCount).toBeLessThanOrEqual(2);
  await page.screenshot({ path: "test-results/v13-mobile-village-cycle.png" });
});
