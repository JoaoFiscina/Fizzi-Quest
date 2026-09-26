import { test, expect } from "@playwright/test";
import { freshSave } from "../../src/domain/game";

test("v19 libera Botas no nível 5 e equipa o item na mochila", async ({
  page,
}) => {
  const save = freshSave();
  save.adventureXpTotal = 350;
  save.gold = 120;
  save.x = 104;
  save.y = 216;
  await page.goto("/");
  await page.evaluate(
    (state) =>
      localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(state)),
    save,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await expect(
    page.getByRole("button", { name: "Ativar Impulso da Trilha" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Mochila", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Botas" })).toBeVisible();
  await expect(page.getByText("Nenhuma bota na mochila.")).toBeVisible();
  await page.getByRole("button", { name: "Fechar menu" }).click();
  await page.keyboard.press("e");
  await expect(
    page.getByText("Botas de caminhada", { exact: true }),
  ).toBeVisible();
  await page
    .locator(".shop-item", { hasText: "Botas de caminhada" })
    .getByRole("button", { name: "45 ouro · Comprar" })
    .click();
  await page.getByRole("button", { name: "Fechar menu" }).click();
  await page.getByRole("button", { name: "Mochila", exact: true }).click();
  await page
    .locator(".inventory-item", { hasText: "Botas de caminhada" })
    .getByRole("button", { name: "Equipar" })
    .click();
  await expect(
    page.locator(".inventory-slot", { hasText: "Botas de caminhada" }),
  ).toBeVisible();
  await expect(page.locator(".hud-equipment")).toContainText(
    "Botas de caminhada",
  );
});

test("Impulso da Trilha aplica 5% por 5 segundos, custa 1 fôlego e não acumula", async ({
  page,
}) => {
  const save = freshSave();
  save.adventureXpTotal = 350;
  await page.goto("/");
  await page.evaluate(
    (state) =>
      localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(state)),
    save,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  const baseSpeed = await page.evaluate(() => {
    // @ts-expect-error diagnostic scene
    return window.__PHASER_GAME__.scene.scenes[0].speed;
  });
  await page.getByRole("button", { name: "Ativar Impulso da Trilha" }).click();
  await expect(page.getByText("Impulso +5%", { exact: false })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ativar Impulso da Trilha" }),
  ).toBeDisabled();
  const boostedSpeed = await page.evaluate(() => {
    // @ts-expect-error diagnostic scene
    return window.__PHASER_GAME__.scene.scenes[0].speed;
  });
  expect(boostedSpeed).toBeCloseTo(baseSpeed * 1.05, 3);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("fizzi-quest.save.v1")!).stamina,
    ),
  ).toBe(7);
  await expect
    .poll(() => page.getByText("Impulso +5%", { exact: false }).count(), {
      timeout: 9000,
    })
    .toBe(0);
  await expect(
    page.getByRole("button", { name: "Ativar Impulso da Trilha" }),
  ).toBeEnabled();
});
