import { test, expect, type Page } from "@playwright/test";
import { freshSave, startBattle } from "../../src/domain/game";
import { mkdirSync } from "node:fs";
const evidence = "docs/evidence/v23.09.2003.27/after";
mkdirSync(evidence, { recursive: true });

const savedBattle = (page: Page) =>
  page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("fizzi-quest.save.v1")!).battle as {
        round: number;
        hp: number;
        status: string;
      } | null,
  );
const presentation = (page: Page) =>
  page.evaluate(() => {
    // @ts-expect-error exposed only for browser diagnostics
    const p = window.__PHASER_GAME__.scene.scenes[0].presentation;
    if (!p) return null;
    return {
      hero: p.hero.texture.key as string,
      numbers: p.root.list.filter(
        (o: { name: string }) => o.name === "damage-number",
      ).length as number,
      objects: p.root.list.length as number,
    };
  });

test("entrada animada, atalhos, números pixel, barras e saída com fade", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const s = freshSave();
  s.motion = "full";
  s.map = "forest";
  s.x = 150;
  s.y = 232;
  s.appearance = "feminine";
  await page.addInitScript(
    (save) => {
      if (!sessionStorage.getItem("v25-seeded")) {
        localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(save));
        sessionStorage.setItem("v25-seeded", "1");
      }
    },
    s,
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await expect.poll(() => page.evaluate(() => Boolean(
    // @ts-expect-error exposed only for browser diagnostics
    window.__PHASER_GAME__.scene.scenes[0].player,
  ))).toBe(true);
  await page.evaluate(() => {
    // @ts-expect-error exposed only for browser diagnostics
    const world = window.__PHASER_GAME__.scene.scenes[0];
    world.onInteract(
      world.mapData.entities.find((e: { kind: string }) => e.kind === "sprout"),
    );
  });
  // Mosaic veil adds many temporary blocks, then removes them.
  const entering = (await presentation(page))!;
  expect(entering.hero.startsWith("hero-f-")).toBe(true);
  await expect.poll(async () => (await presentation(page))!.objects).toBeLessThan(
    entering.objects,
  );
  await expect(page.locator(".toast")).not.toHaveClass(/show/);
  await page.screenshot({ path: `${evidence}/battle-ready-1366.png` });

  // Accessible names are unchanged by the visual shortcut hints.
  const attack = page.getByRole("button", { name: "Atacar", exact: true });
  await expect(attack).toHaveAttribute("aria-keyshortcuts", "1");
  const started = Date.now();
  await page.keyboard.press("a");
  await expect.poll(async () => (await presentation(page))!.numbers).toBeGreaterThan(0);
  await expect(page.locator(".battle-panel .meter.enemy .meter-ghost")).toHaveCount(1);
  await page.screenshot({ path: `${evidence}/battle-hit-1366.png` });
  expect((await savedBattle(page))!.round).toBe(2);
  await expect(attack).toBeEnabled();
  const roundMs = Date.now() - started;
  console.log(`round playback ${roundMs} ms`);
  expect(roundMs).toBeLessThan(3000);
  await expect(page.locator(".battle-log p.fresh")).not.toHaveCount(0);

  // Digit opens skills, Esc returns; letters are not stolen inside submenus.
  await page.keyboard.press("2");
  await expect(
    page.getByRole("button", { name: "Golpe pesado · 3", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(attack).toBeVisible();

  // Win quickly and leave with Enter: fade, rebuild and walk again.
  await page.evaluate(() => {
    // @ts-expect-error exposed only for browser diagnostics
    const world = window.__PHASER_GAME__.scene.scenes[0];
    world.store.transact((save: { battle: { hp: number } }) => {
      save.battle.hp = 1;
    });
  });
  await page.keyboard.press("1");
  await expect(
    page.getByRole("button", { name: "Voltar à aventura" }),
  ).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator(".battle-panel")).toBeHidden();
  await expect.poll(() => presentation(page)).toBeNull();
  await expect
    .poll(() =>
      page.evaluate(
        // @ts-expect-error exposed only for browser diagnostics
        () => window.__PHASER_GAME__.scene.scenes[0].paused as boolean,
      ),
    )
    .toBe(false);
  await page.screenshot({ path: `${evidence}/after-exit-1366.png` });
  expect(errors).toEqual([]);
});

test("movimento reduzido: sem mosaico nem partículas, rodada continua igual", async ({
  page,
}) => {
  const s = freshSave();
  s.motion = "reduced";
  s.map = "forest";
  startBattle(s, "beetle");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(
    (save) => localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(save)),
    s,
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  const before = (await presentation(page))!;
  await page.getByRole("button", { name: "Atacar", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Atacar", exact: true }),
  ).toBeEnabled();
  // No veil blocks or particles left behind once the short number fade ends.
  await expect
    .poll(async () => (await presentation(page))!.objects, { timeout: 2000 })
    .toBe(before.objects);
  const after = (await presentation(page))!;
  expect(after.hero).toBe("hero-1-0");
  expect((await savedBattle(page))!.round).toBe(2);
  await page.screenshot({ path: `${evidence}/battle-reduced-390.png` });
});
