import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const evidence = "docs/evidence/v23.09.2003.21/after";
mkdirSync(evidence, { recursive: true });

test("PC com movimento reduzido explica a diferença e ativa os ciclos completos", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByText("Este aparelho pediu movimento reduzido:"),
  ).toBeVisible();
  await page.screenshot({ path: `${evidence}/pc-motion-reduced.png` });
  await page.getByRole("button", { name: "Nova aventura" }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-ambient-mode",
    "reduced",
  );
  await page.getByRole("button", { name: "Ajustes", exact: true }).click();
  await expect(
    page.getByText("Por isso monstros e folhas param", { exact: false }),
  ).toBeVisible();
  await page.screenshot({ path: `${evidence}/pc-motion-settings.png` });
  await page.getByRole("button", { name: "Fechar menu" }).click();
  await page.reload();
  await page
    .getByRole("button", { name: "Ativar animações completas" })
    .click();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-ambient-mode",
    "normal",
  );
  await page.evaluate(() => {
    // @ts-expect-error diagnostic scene
    const scene = window.__PHASER_GAME__.scene.scenes[0];
    scene.store.transact((save: any) => {
      save.map = "forest";
      save.x = 40;
      save.y = 232;
    });
  });
  await expect
    .poll(() =>
      page.evaluate(() => {
        // @ts-expect-error diagnostic scene
        const scene = window.__PHASER_GAME__.scene.scenes[0];
        return [...scene.enemySprites.values()].some(
          (sprite: any) => sprite.anims.isPlaying,
        );
      }),
    )
    .toBe(true);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Ativar animações completas" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-ambient-mode",
    "normal",
  );
});

test("aviso de versão nova recarrega os arquivos e conserva o save", async ({
  page,
}) => {
  await page.route("**/version.json?**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Cache-Control": "no-store" },
      body: JSON.stringify({ version: "v23.09.2003.22" }),
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Nova aventura" }).click();
  const previousSave = await page.evaluate(() =>
    localStorage.getItem("fizzi-quest.save.v1"),
  );
  await expect(
    page.getByRole("button", { name: "Atualizar jogo" }),
  ).toBeVisible();
  await page.screenshot({ path: `${evidence}/pc-new-version.png` });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: `${evidence}/mobile-new-version.png` });
  await page.getByRole("button", { name: "Atualizar jogo" }).click();
  await expect(page).toHaveURL(/atualizar=v23\.09\.2003\.22/);
  expect(
    await page.evaluate(() => localStorage.getItem("fizzi-quest.save.v1")),
  ).toBe(previousSave);
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await page.getByRole("button", { name: "Ajustes", exact: true }).click();
  await expect(
    page.getByText("Instalada neste navegador: v23.09.2003.21"),
  ).toBeVisible();
});

test("manifesto atual não mostra atualização e permite verificação manual", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Atualizar jogo" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Nova aventura" }).click();
  await page.getByRole("button", { name: "Ajustes", exact: true }).click();
  await page.getByRole("button", { name: "Verificar atualização" }).click();
  await expect(
    page.getByText("Você já está na versão v23.09.2003.21."),
  ).toBeVisible();
  await page.screenshot({ path: `${evidence}/pc-version-settings.png` });
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Verificar atualização" })
    .scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${evidence}/mobile-version-settings.png` });
});
