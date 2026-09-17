import { test, expect, type Page } from "@playwright/test";
import { freshSave, items, startBattle } from "../../src/domain/game";
const move = async (page: Page, key: string, ms: number) => {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
};
test("modelo da IA, importação, recompensa, histórico e reload", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "Nova aventura", exact: true })
    .click();
  await page.getByRole("button", { name: "Treinos", exact: true }).click();
  await page
    .getByRole("button", { name: "Copiar modelo para a IA", exact: true })
    .click();
  await expect(
    page.getByLabel("Prompt para analisar treino com IA"),
  ).toContainText("responda SOMENTE com um JSON válido");
  await page.screenshot({ path: "test-results/desktop-training-prompt.png" });
  await page
    .getByRole("button", { name: "Já tenho o resultado — importar" })
    .click();
  await page.getByRole("button", { name: "Carregar exemplo" }).click();
  await page
    .getByRole("button", { name: "Validar e visualizar", exact: true })
    .click();
  await expect(page.getByText("+340", { exact: true })).toBeVisible();
  await expect(page.getByText("+72", { exact: true })).toBeVisible();
  await expect(page.getByText("+0,18", { exact: true })).toBeVisible();
  await page.screenshot({ path: "test-results/desktop-training-preview.png" });
  await page
    .getByRole("button", { name: "Confirmar treino", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Treino concluído" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Voltar ao histórico" }).click();
  await expect(page.getByText("Treino de membros inferiores")).toBeVisible();
  await page.getByRole("button", { name: "Fechar menu" }).click();
  await expect(page.locator(".gold")).toContainText("72");
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await page.getByRole("button", { name: "Personagem", exact: true }).click();
  await expect(page.getByText("5,18", { exact: true })).toBeVisible();
  await expect(
    page.getByText("+0,18 · Treino de membros inferiores"),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/desktop-character.png" });
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
    .getByRole("button", { name: "Importar resultado da IA", exact: true })
    .click();
  await page.screenshot({ path: "test-results/mobile-import.png" });
  await page.getByRole("button", { name: "Carregar exemplo" }).click();
  await page
    .getByRole("button", { name: "Validar e visualizar", exact: true })
    .click();
  await page.screenshot({ path: "test-results/mobile-training-preview.png" });
  await page
    .getByRole("button", { name: "Confirmar treino", exact: true })
    .click();
  await page.screenshot({ path: "test-results/mobile-training-feedback.png" });
  await page.getByRole("button", { name: "Ver personagem" }).click();
  await page.screenshot({ path: "test-results/mobile-character.png" });
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
test("mochila organizada, tipos de item e tutorial consultável", async ({
  page,
}) => {
  const s = freshSave();
  s.owned = Object.keys(items) as (keyof typeof items)[];
  s.weapon = "dagger";
  s.shield = "wood_shield";
  s.armor = "leather_armor";
  s.accessory = "wind";
  await page.goto("/");
  await page.evaluate(
    (save) => localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(save)),
    s,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await page.getByRole("button", { name: "Mochila", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Armas" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Escudos" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Armaduras" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Acessórios" })).toBeVisible();
  await expect(page.locator(".item-kind", { hasText: /^Arma$/ })).toHaveCount(
    4,
  );
  await expect(page.locator(".item-kind", { hasText: /^Escudo$/ })).toHaveCount(
    2,
  );
  await expect(page.getByText("Broche", { exact: true })).toBeVisible();
  await expect(page.getByText("Pingente", { exact: true })).toBeVisible();
  await expect(page.locator(".inventory-item.equipped-item")).toHaveCount(4);
  await page.screenshot({ path: "test-results/desktop-inventory.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/mobile-inventory.png" });
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.getByRole("button", { name: "Fechar menu" }).click();
  await page.getByRole("button", { name: "Tutorial", exact: true }).click();
  await expect(page.locator('[data-topic="defense"]')).toHaveAttribute(
    "open",
    "",
  );
  await expect(page.getByText(/Defender age antes do inimigo/)).toBeVisible();
  await page.getByText("Fôlego e habilidades", { exact: true }).click();
  await expect(page.getByText(/Golpe pesado custa 3/)).toBeVisible();
  await page.screenshot({ path: "test-results/desktop-tutorial.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/mobile-tutorial.png" });
});
test("aparência, zoom e movimento diagonal persistem", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Nova aventura", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-camera-zoom", "3");
  await page.getByRole("button", { name: "Ajustes", exact: true }).click();
  await page.getByRole("button", { name: "Afastado", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-camera-zoom", "2");
  await page.getByRole("button", { name: "Feminino", exact: true }).click();
  await page.getByRole("button", { name: "Próximo", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Feminino", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "Próximo", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.screenshot({ path: "test-results/desktop-customization.png" });
  await page.getByRole("button", { name: "Fechar menu" }).click();
  await expect(page.locator(".vitals strong")).toContainText("Aventureira");
  await expect(page.locator("html")).toHaveAttribute("data-camera-zoom", "4");
  expect(
    await page.evaluate(() => {
      // @ts-expect-error exposed only for browser diagnostics
      const scene = window.__PHASER_GAME__.scene.scenes[0];
      return scene.player.texture.key.startsWith("hero-f-");
    }),
  ).toBe(true);
  const before = await page.evaluate(() => {
    // @ts-expect-error exposed only for browser diagnostics
    const player = window.__PHASER_GAME__.scene.scenes[0].player;
    return { x: player.x, y: player.y };
  });
  await page.keyboard.down("s");
  await page.keyboard.down("d");
  await page.waitForTimeout(500);
  await page.keyboard.up("s");
  await page.keyboard.up("d");
  const afterKeyboard = await page.evaluate(() => {
    // @ts-expect-error exposed only for browser diagnostics
    const player = window.__PHASER_GAME__.scene.scenes[0].player;
    return { x: player.x, y: player.y };
  });
  expect(afterKeyboard.x).toBeGreaterThan(before.x + 8);
  expect(afterKeyboard.y).toBeGreaterThan(before.y + 8);
  expect(
    Math.hypot(afterKeyboard.x - before.x, afterKeyboard.y - before.y),
  ).toBeLessThan(40);
  const diagonal = page.getByRole("button", {
    name: "Mover na diagonal para cima e esquerda",
  });
  const box = await diagonal.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(300);
  await page.mouse.up();
  const afterTouch = await page.evaluate(() => {
    // @ts-expect-error exposed only for browser diagnostics
    const player = window.__PHASER_GAME__.scene.scenes[0].player;
    return { x: player.x, y: player.y };
  });
  expect(afterTouch.x).toBeLessThan(afterKeyboard.x - 4);
  expect(afterTouch.y).toBeLessThan(afterKeyboard.y - 4);
  await page.screenshot({ path: "test-results/desktop-feminine-near.png" });
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await expect(page.locator(".vitals strong")).toContainText("Aventureira");
  await expect(page.locator("html")).toHaveAttribute("data-camera-zoom", "4");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("html")).toHaveAttribute("data-camera-zoom", "3");
  await page.getByRole("button", { name: "Ajustes", exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/mobile-customization.png" });
  await page.getByRole("button", { name: "Fechar menu" }).click();
  await page.screenshot({ path: "test-results/mobile-feminine-near.png" });
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
  await page
    .getByRole("button", { name: "Como funciona a Defesa?", exact: true })
    .click();
  await expect(page.getByText(/Defender age antes do inimigo/)).toBeVisible();
  await page.screenshot({
    path: "test-results/desktop-battle-defense-tutorial.png",
  });
  await page.getByRole("button", { name: "Fechar menu" }).click();
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
  await expect(page.locator(".resource-value").first()).toHaveText("50/50");
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
  await expect(page.locator(".resource-value").first()).toHaveText("50/50");
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

test("matriz visual mantém HUD, navegação e mapa dentro da tela", async ({
  page,
}) => {
  const viewports = [
    { name: "1920x1080", width: 1920, height: 1080 },
    { name: "1366x768", width: 1366, height: 768 },
    { name: "1024x768", width: 1024, height: 768 },
    { name: "430x932", width: 430, height: 932 },
    { name: "390x844", width: 390, height: 844 },
  ];
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page
      .getByRole("button", { name: "Nova aventura", exact: true })
      .click();
    await expect(page.locator(".hud")).toBeVisible();
    await expect(page.locator(".nav")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const hud = await page.locator(".hud").boundingBox();
    const nav = await page.locator(".nav").boundingBox();
    expect(hud!.x + hud!.width).toBeLessThanOrEqual(nav!.x);
    await page.screenshot({
      path: `test-results/visual-${viewport.name}.png`,
    });
  }
});
