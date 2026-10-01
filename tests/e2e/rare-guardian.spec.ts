import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { freshSave, rest } from "../../src/domain/game";

const evidence = "docs/evidence/v23.09.2003.22/after";
mkdirSync(evidence, { recursive: true });

test("descanso libera raro persistente, vitória não repete missão e layouts continuam legíveis", async ({
  page,
}) => {
  const save = freshSave();
  save.defeated = ["guardian"];
  save.quest = "completed";
  save.rareEncounter.seed = 1972;
  save.x = 272;
  save.y = 236;
  save.motion = "reduced";
  await page.goto("/");
  await page.evaluate(
    (s) => localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(s)),
    save,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await page.getByRole("button", { name: "Descansar · E" }).click();
  await page.evaluate(() => {
    // @ts-expect-error diagnostic scene
    const scene = window.__PHASER_GAME__.scene.scenes[0];
    scene.store.transact((s: typeof save) => {
      s.map = "forest";
      s.x = 40;
      s.y = 232;
    });
  });
  await expect
    .poll(() =>
      page.evaluate(() => {
        // @ts-expect-error diagnostic scene
        return window.__PHASER_GAME__.scene.scenes[0].patrolActors.has(
          "rare:1",
        );
      }),
    )
    .toBe(true);
  await page.evaluate(() => {
    // @ts-expect-error diagnostic scene
    const scene = window.__PHASER_GAME__.scene.scenes[0];
    const p = scene.patrolActors.get("rare:1").patrol;
    scene.store.transact((s: typeof save) => {
      s.x = p.x - 12;
      s.y = p.y;
    });
  });
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await expect(
    page.getByRole("button", { name: "Guardião errante · E" }),
  ).toBeEnabled();
  for (const size of [
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 1366, height: 768 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(size);
    await page.screenshot({ path: `${evidence}/rare-world-${size.width}.png` });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Guardião errante · E" }).click();
  await expect(
    page.getByRole("heading", { name: "Guardião errante", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: `${evidence}/rare-battle.png` });
  await page.evaluate(() => {
    // @ts-expect-error diagnostic scene
    window.__PHASER_GAME__.scene.scenes[0].store.transact(
      (s: typeof save) => (s.battle!.hp = 1),
    );
  });
  await page.getByRole("button", { name: "Atacar", exact: true }).click();
  await page.getByRole("button", { name: "Voltar à aventura" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  const final = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("fizzi-quest.save.v1")!),
  );
  expect(final.rareEncounter).toMatchObject({ cycle: 1, defeated: true });
  expect(final.quest).toBe("completed");
  expect([final.adventureXpTotal, final.gold, final.materials]).toEqual([
    60, 25, 3,
  ]);
  expect(
    await page.evaluate(() => {
      // @ts-expect-error diagnostic scene
      return window.__PHASER_GAME__.scene.scenes[0].enemySprites.get("rare:1")
        .visible;
    }),
  ).toBe(false);
});

test("patrulha rara e animações permanecem contínuas com recursos estáveis por 60s", async ({
  page,
}) => {
  test.setTimeout(120000);
  const s = freshSave();
  s.defeated = ["guardian"];
  s.rareEncounter.seed = 1972;
  rest(s);
  s.map = "forest";
  s.x = 40;
  s.y = 232;
  s.motion = "full";
  await page.goto("/");
  await page.evaluate(
    (save) => localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(save)),
    s,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  const samples: any[] = [];
  for (let i = 0; i < 61; i++) {
    samples.push(
      await page.evaluate(() => {
        // @ts-expect-error diagnostic scene
        const scene = window.__PHASER_GAME__.scene.scenes[0];
        const a = scene.patrolActors.get("rare:1");
        const count = (objects: any[]): number =>
          objects.reduce(
            (n, object) =>
              n + 1 + (Array.isArray(object.list) ? count(object.list) : 0),
            0,
          );
        return {
          x: a.sprite.x,
          y: a.sprite.y,
          texture: a.sprite.texture.key,
          count: count(scene.children.list),
          timers: scene.time._active.length,
          actors: scene.patrolActors.size,
          waterFire: [...scene.waterSprites, ...scene.fireSprites].every(
            (p: any) => p.anims.isPlaying,
          ),
        };
      }),
    );
    if (i < 60) await page.waitForTimeout(1000);
  }
  expect(new Set(samples.map((p) => `${p.x},${p.y}`)).size).toBeGreaterThan(5);
  expect(new Set(samples.map((p) => p.texture)).size).toBeGreaterThan(1);
  expect(new Set(samples.map((p) => p.count)).size).toBe(1);
  expect(new Set(samples.map((p) => p.timers)).size).toBe(1);
  expect(samples.every((p) => p.actors === 3 && p.waterFire)).toBe(true);
  writeFileSync(
    `${evidence}/rare-cadence.json`,
    JSON.stringify(samples, null, 2),
  );
  await page.screenshot({ path: `${evidence}/rare-patrol-full.png` });
});
