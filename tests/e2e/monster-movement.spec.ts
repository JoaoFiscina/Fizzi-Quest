import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { freshSave } from "../../src/domain/game";

const evidence = "docs/evidence/v23.09.2003.21/after";
mkdirSync(evidence, { recursive: true });

test("Broto patrulha e o encontro acompanha sua posição visível", async ({
  page,
}) => {
  const save = freshSave();
  save.map = "forest";
  save.x = 40;
  save.y = 232;
  save.motion = "full";
  await page.goto("/");
  await page.evaluate(
    (state) =>
      localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(state)),
    save,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  const before = await page.evaluate(() => {
    // @ts-expect-error scene exposed for diagnostics
    const scene = window.__PHASER_GAME__.scene.scenes[0];
    const actor = scene.patrolActors.get("sprout");
    return { x: actor.patrol.x, y: actor.patrol.y };
  });
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          // @ts-expect-error scene exposed for diagnostics
          const actor =
            window.__PHASER_GAME__.scene.scenes[0].patrolActors.get("sprout");
          return Math.hypot(
            actor.patrol.x - actor.patrol.home.x,
            actor.patrol.y - actor.patrol.home.y,
          );
        }),
      { timeout: 12_000 },
    )
    .toBeGreaterThan(2);
  const after = await page.evaluate(() => {
    // @ts-expect-error scene exposed for diagnostics
    const scene = window.__PHASER_GAME__.scene.scenes[0];
    const actor = scene.patrolActors.get("sprout");
    scene.store.state.x = actor.patrol.x - 12;
    scene.store.state.y = actor.patrol.y;
    return { x: actor.patrol.x, y: actor.patrol.y };
  });
  expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeGreaterThan(2);
  await expect(
    page.getByRole("button", { name: "Broto Errante · E" }),
  ).toBeEnabled();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${evidence}/forest-patrol-desktop.png` });
  await page.getByRole("button", { name: "Broto Errante · E" }).click();
  expect(
    await page.evaluate(() => {
      // @ts-expect-error scene exposed for diagnostics
      return window.__PHASER_GAME__.scene.scenes[0].store.state.battle?.enemy;
    }),
  ).toBe("sprout");
});

test("descanso redistribui pontos e persiste em save anterior", async ({
  page,
}) => {
  const previous = freshSave();
  delete (previous as Partial<typeof previous>).monsterRestCycle;
  previous.x = 272;
  previous.y = 236;
  await page.goto("/");
  await page.evaluate(
    (state) =>
      localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(state)),
    previous,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await expect(
    page.getByRole("button", { name: "Descansar · E" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Descansar · E" }).click();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("fizzi-quest.save.v1")!)
          .monsterRestCycle,
    ),
  ).toBe(1);
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  expect(
    await page.evaluate(() => {
      // @ts-expect-error scene exposed for diagnostics
      return window.__PHASER_GAME__.scene.scenes[0].store.state
        .monsterRestCycle;
    }),
  ).toBe(1);
  await page.evaluate(() => {
    // @ts-expect-error scene exposed for diagnostics
    const scene = window.__PHASER_GAME__.scene.scenes[0];
    scene.store.transact((save: typeof previous) => {
      save.map = "forest";
      save.x = 40;
      save.y = 232;
    });
  });
  await expect
    .poll(() =>
      page.evaluate(() => {
        // @ts-expect-error scene exposed for diagnostics
        return window.__PHASER_GAME__.scene.scenes[0].patrolActors.get("sprout")
          ?.patrol.home.x;
      }),
    )
    .toBe(392);
});

test("movimento reduzido mantém o monstro em repouso e interativo", async ({
  page,
}) => {
  const save = freshSave();
  save.map = "forest";
  save.x = 152;
  save.y = 232;
  save.motion = "reduced";
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(
    (state) =>
      localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(state)),
    save,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  const position = await page.evaluate(() => {
    // @ts-expect-error scene exposed for diagnostics
    const actor =
      window.__PHASER_GAME__.scene.scenes[0].patrolActors.get("sprout");
    return [actor.patrol.x, actor.patrol.y];
  });
  await page.waitForTimeout(4000);
  expect(
    await page.evaluate(() => {
      // @ts-expect-error scene exposed for diagnostics
      const actor =
        window.__PHASER_GAME__.scene.scenes[0].patrolActors.get("sprout");
      return [actor.patrol.x, actor.patrol.y];
    }),
  ).toEqual(position);
  await expect(
    page.getByRole("button", { name: "Broto Errante · E" }),
  ).toBeEnabled();
  await page.screenshot({ path: `${evidence}/forest-reduced-mobile.png` });
});
