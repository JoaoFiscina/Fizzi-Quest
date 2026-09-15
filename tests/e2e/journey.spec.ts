import { test, expect, type Page } from "@playwright/test";
import { freshSave, startBattle } from "../../src/domain/game";
const move = async (page: Page, key: string, ms: number) => {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
};
test("treino, exploração, recompensa, reload, remoção e restauração", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "Nova aventura", exact: true })
    .click();
  await page.getByRole("button", { name: "Treinos", exact: true }).click();
  await page
    .getByRole("button", { name: "Importar treino", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Carregar exemplo do documento" })
    .click();
  await page.getByRole("button", { name: "Revisar JSON" }).click();
  await expect(
    page.getByRole("button", { name: "Confirmar treino", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Confirmo que esta é a data correta").check();
  await page
    .getByRole("button", { name: "Todas são séries de trabalho" })
    .click();
  await expect(page.getByText("Força +58,5 · total 58,5")).toBeVisible();
  await page
    .getByRole("button", { name: "Confirmar treino", exact: true })
    .click();
  await expect(page.getByText("Total do dia: 78 pontos")).toBeVisible();
  await page.getByRole("button", { name: "Fechar menu" }).click();
  await move(page, "ArrowUp", 1000);
  await move(page, "ArrowRight", 3000);
  await expect(page.locator(".place strong")).toHaveText("Bosque das Brumas");
  await move(page, "ArrowRight", 1900);
  await page.keyboard.press("e");
  await expect(page.locator(".battle-panel")).toBeVisible();
  await page.getByRole("button", { name: "Atacar", exact: true }).click();
  await page.getByRole("button", { name: "Atacar", exact: true }).click();
  await page.getByRole("button", { name: "Atacar", exact: true }).click();
  await expect(page.getByText(/Vitória! \+15 XP/)).toBeVisible();
  await page.getByRole("button", { name: "Voltar à aventura" }).click();
  await move(page, "ArrowLeft", 2700);
  await expect(page.locator(".place strong")).toHaveText("Vila da Guilda");
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await expect(page.locator(".gold")).toContainText("5");
  await page.getByRole("button", { name: "Ajustes", exact: true }).click();
  const dl = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Exportar backup", exact: true })
    .click();
  const backup = await dl;
  const path = await backup.path();
  await page.getByRole("button", { name: "Fechar menu" }).click();
  await page.getByRole("button", { name: "Treinos", exact: true }).click();
  await page.getByRole("button", { name: "Remover", exact: true }).click();
  await page.getByRole("button", { name: "Confirmar remoção" }).click();
  await page.getByRole("button", { name: "Fechar menu" }).click();
  await page.getByRole("button", { name: "Ajustes", exact: true }).click();
  await page.locator("input[type=file]").setInputFiles(path!);
  await page
    .getByRole("button", { name: "Restaurar backup", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirmar restauração" }).click();
  await page.getByRole("button", { name: "Personagem", exact: true }).click();
  await expect(page.getByText(/58,5 de maestria/)).toBeVisible();
  await page.getByRole("button", { name: "Fechar menu" }).click();
  await page.screenshot({ path: "test-results/desktop-village.png" });
  expect(errors).toEqual([]);
});
test("tela vertical, menus e movimento por ponteiro", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Nova aventura", exact: true })
    .click();
  const up = page.getByRole("button", { name: "Mover para cima" });
  const box = await up.boundingBox();
  await page.mouse.move(box!.x + 22, box!.y + 22);
  await page.mouse.down();
  await page.waitForTimeout(500);
  await page.mouse.up();
  await page.screenshot({ path: "test-results/mobile-village.png" });
  await page.getByRole("button", { name: "Treinos", exact: true }).click();
  await page
    .getByRole("button", { name: "Importar treino", exact: true })
    .click();
  await page.screenshot({ path: "test-results/mobile-import.png" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Fechar menu" }).click();
  await page.getByRole("button", { name: "Mapa", exact: true }).click();
  await expect(page.getByText("Mina do Eco")).toBeVisible();
  await expect(page.getByText("🔒 BLOQUEADA")).toHaveCount(3);
  await page.screenshot({ path: "test-results/mobile-map.png" });
  expect(
    await page.evaluate(() => document.documentElement.dataset.cameraZoom),
  ).toBe("2");
  expect(
    await page.evaluate(() => document.documentElement.dataset.cameraPadding),
  ).toBe("0,51");
});
test("rodada salva antes da animação, reload sem duplicação e layout de combate", async ({
  page,
}) => {
  const s = freshSave();
  s.map = "forest";
  s.x = 152;
  s.y = 232;
  startBattle(s, "sprout");
  await page.goto("/");
  await page.evaluate(
    (save) => localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(save)),
    s,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await page.screenshot({ path: "test-results/desktop-battle.png" });
  await page.getByRole("button", { name: "Atacar", exact: true }).click();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("fizzi-quest.save.v1")!).battle.hp,
    ),
  ).toBe(14);
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await expect(
    page.locator(".battle-panel").getByText("Vida 14/22"),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "test-results/mobile-battle.png" });
  await page.getByRole("button", { name: "Defender", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Atacar", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Item · 3", exact: true }).click();
  await page.getByRole("button", { name: "Usar poção · +20 vida" }).click();
  await expect(
    page.getByRole("button", { name: "Atacar", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Habilidades", exact: true }).click();
  await page
    .getByRole("button", { name: "Golpe pesado · 3", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Atacar", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Atacar", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await expect(page.getByText(/Vitória! \+15 XP/)).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("fizzi-quest.save.v1")!).gold,
    ),
  ).toBe(5);
});
test("câmera desktop usa o enquadramento amplo e monstros têm ciclo próprio", async ({
  page,
}) => {
  const s = freshSave();
  s.map = "forest";
  s.x = 152;
  s.y = 232;
  await page.goto("/");
  await page.evaluate(
    (save) => localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(save)),
    s,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  expect(
    await page.evaluate(() => document.documentElement.dataset.cameraZoom),
  ).toBe("3");
  await page.waitForTimeout(800);
  await page.screenshot({ path: "test-results/desktop-wide-forest.png" });
});
test("compra e descanso pela vila", async ({ page }) => {
  const s = freshSave();
  s.x = 104;
  s.y = 216;
  s.gold = 10;
  s.hp = 12;
  s.stamina = 1;
  s.defeated = ["sprout"];
  await page.goto("/");
  await page.evaluate(
    (save) => localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(save)),
    s,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await page.keyboard.press("e");
  await page.screenshot({ path: "test-results/desktop-shop.png" });
  await page.getByRole("button", { name: "8 ouro · Comprar" }).click();
  await expect(page.locator(".shop-balance")).toContainText("2 ouro");
  await expect(page.locator(".shop-balance")).toContainText("4 poções");
  await page.getByRole("button", { name: "Fechar menu" }).click();
  await move(page, "ArrowDown", 350);
  await move(page, "ArrowRight", 2700);
  await page.keyboard.press("e");
  await expect(page.getByText("Vida 50/50", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("fizzi-quest.save.v1")!).defeated,
    ),
  ).toEqual([]);
});
test("fuga, derrota e resize durante efeito liberam a interface", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const s = freshSave();
  s.map = "forest";
  s.hp = 1;
  startBattle(s, "moth");
  await page.goto("/");
  await page.evaluate(
    (save) => localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(save)),
    s,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await page.getByRole("button", { name: "Atacar", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Voltar à aventura" }).click();
  await expect(page.locator(".place strong")).toHaveText("Vila da Guilda");
  await expect(page.getByText("Vida 50/50", { exact: true })).toBeVisible();
  s.hp = 50;
  s.battle = null;
  startBattle(s, "sprout");
  await page.goto("/");
  await page.evaluate(
    (save) => localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(save)),
    s,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await page.getByRole("button", { name: "Fugir", exact: true }).click();
  await page.getByRole("button", { name: "Voltar à aventura" }).click();
  await expect(page.locator(".battle-panel")).toBeHidden();
  expect(errors).toEqual([]);
});
