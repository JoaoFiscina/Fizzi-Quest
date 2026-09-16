import { test, expect } from "@playwright/test";
import { freshSave } from "../../src/domain/game";

test("água, personagem e monstro trocam quadros reais", async ({ page }) => {
  const save = freshSave();
  save.map = "forest";
  save.x = 152;
  save.y = 232;
  await page.goto("/");
  await page.evaluate(
    (state) =>
      localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(state)),
    save,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();

  const samples: Array<{ player: string; water: string; monster: string }> = [];
  for (let i = 0; i < 10; i++) {
    samples.push(
      await page.evaluate(() => {
        // @ts-expect-error exposed only for browser diagnostics
        const scene = window.__PHASER_GAME__.scene.scenes[0];
        const water = scene.root.list.find(
          (sprite: any) => sprite.anims?.currentAnim?.key === "ambient-water",
        );
        const monster = Array.from(scene.enemySprites.values())[0] as any;
        return {
          player: scene.player.texture.key,
          water: water?.texture.key ?? "missing",
          monster: monster?.texture.key ?? "missing",
        };
      }),
    );
    await page.waitForTimeout(140);
  }

  expect(new Set(samples.map((sample) => sample.player)).size).toBeGreaterThan(
    1,
  );
  expect(new Set(samples.map((sample) => sample.water)).size).toBeGreaterThan(
    1,
  );
  expect(new Set(samples.map((sample) => sample.monster)).size).toBeGreaterThan(
    1,
  );
});
