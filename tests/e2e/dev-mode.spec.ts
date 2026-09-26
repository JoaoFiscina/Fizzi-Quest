import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { freshSave } from "../../src/domain/game";

const evidence = "docs/evidence/v23.09.2003.20";
mkdirSync(evidence, { recursive: true });

test("DEV23 altera somente a cópia de teste e permite voltar ao progresso normal", async ({
  page,
}) => {
  const save = freshSave();
  save.adventureXpTotal = 50;
  save.gold = 20;
  save.allocated.strength = 1;
  await page.goto("/");
  await page.evaluate(
    (state) =>
      localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(state)),
    save,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  const normalBefore = await page.evaluate(() =>
    localStorage.getItem("fizzi-quest.save.v1"),
  );
  await page.getByRole("button", { name: "Ajustes", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Código de desenvolvedor" })
    .fill("ERRADO");
  await page.getByRole("button", { name: "Aplicar código" }).click();
  await expect(page.getByText("Código incorreto.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Criar cópia de teste" }),
  ).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Código de desenvolvedor" })
    .fill("DEV23");
  await page.getByRole("button", { name: "Aplicar código" }).click();
  await page.getByRole("button", { name: "Criar cópia de teste" }).click();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await expect(page.getByText("MODO DEV", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Ajustes", exact: true }).click();
  await page.getByRole("button", { name: "Abrir painel DEV" }).click();
  await page.getByRole("button", { name: "Nível 5" }).click();
  await page.getByRole("spinbutton", { name: "Ouro total" }).fill("100");
  await page.getByRole("spinbutton", { name: "Adicionar ouro" }).fill("20");
  await page.getByRole("spinbutton", { name: "Agilidade" }).fill("4");
  await page
    .getByRole("combobox", { name: "XP ganho em combate e missão" })
    .selectOption("2");
  await expect(
    page.getByText(/Prévia: nível 5 · 350 XP · 120 ouro/),
  ).toBeVisible();
  await page.screenshot({ path: `${evidence}/desktop-dev-preview.png` });
  await page.getByRole("button", { name: "Aplicar alterações" }).click();
  await expect(page.locator(".hud")).toContainText("Nv. 5");
  await expect(page.locator(".hud")).toContainText("Ouro 120");
  expect(
    await page.evaluate(() => localStorage.getItem("fizzi-quest.save.v1")),
  ).toBe(normalBefore);
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("fizzi-quest.dev.save.v1")!).dev,
    ),
  ).toEqual({
    attributeBonus: { strength: 0, vigor: 0, agility: 4, breath: 0 },
    xpMultiplier: 2,
  });
  await page.getByRole("button", { name: "Voltar à aventura normal" }).click();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await expect(page.getByText("MODO DEV", { exact: true })).toHaveCount(0);
  await expect(page.locator(".hud")).toContainText("Nv. 2");
  await expect(page.locator(".hud")).toContainText("Ouro 20");
  expect(
    await page.evaluate(() => localStorage.getItem("fizzi-quest.save.v1")),
  ).toBe(normalBefore);
  await page.getByRole("button", { name: "Ajustes", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Código de desenvolvedor" })
    .fill("DEV23");
  await page.getByRole("button", { name: "Aplicar código" }).click();
  await page.getByRole("button", { name: "Continuar teste" }).click();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await expect(page.getByText("MODO DEV", { exact: true })).toBeVisible();
  await expect(page.locator(".hud")).toContainText("Nv. 5");
  await expect(page.locator(".hud")).toContainText("Ouro 120");
});

test("painel DEV cabe no celular e rejeita XP incompatível com pontos", async ({
  page,
}) => {
  const save = freshSave();
  save.adventureXpTotal = 350;
  save.allocated.strength = 3;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(
    (state) =>
      localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(state)),
    save,
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await page.getByRole("button", { name: "Ajustes", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Código de desenvolvedor" })
    .fill("DEV23");
  await page.getByRole("button", { name: "Aplicar código" }).click();
  await page.getByRole("button", { name: "Criar cópia de teste" }).click();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await page.getByRole("button", { name: "Ajustes", exact: true }).click();
  await page.getByRole("button", { name: "Abrir painel DEV" }).click();
  await page.getByRole("button", { name: "Nível 1", exact: true }).click();
  await expect(page.getByText(/mais pontos distribuídos/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Aplicar alterações" }),
  ).toBeDisabled();
  await page
    .getByRole("checkbox", {
      name: "Zerar pontos distribuídos na cópia de teste",
    })
    .check();
  await expect(
    page.getByRole("button", { name: "Aplicar alterações" }),
  ).toBeEnabled();
  await page.screenshot({ path: `${evidence}/mobile-dev-panel.png` });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.getByRole("button", { name: "Aplicar alterações" }).click();
  await expect(page.locator(".hud")).toContainText("Nv. 1");
  await page.getByRole("button", { name: "Desfazer última alteração" }).click();
  await expect(page.locator(".hud")).toContainText("Nv. 5");
  await page
    .getByRole("button", {
      name: "Recomeçar teste a partir do progresso normal",
    })
    .click();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("fizzi-quest.dev.save.v1")!).allocated
          .strength,
    ),
  ).toBe(3);
});
