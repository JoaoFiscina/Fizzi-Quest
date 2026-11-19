import { test, expect } from "@playwright/test";
import { freshSave, startBattle, type EnemyId } from "../../src/domain/game";
import { mkdirSync, writeFileSync } from "node:fs";
const evidence = "docs/evidence/v23.09.2003.27/after";
mkdirSync(evidence, { recursive: true });

test("folha dos monstros: quadros de idle e poses distintos, com contorno", async ({ page }) => {
  await page.goto("/");
  await expect
    .poll(() =>
      // @ts-expect-error exposed only for browser diagnostics
      page.evaluate(() => Boolean(window.__PHASER_GAME__?.textures.exists("guardian-prepare"))),
    )
    .toBe(true);
  const result = await page.evaluate(() => {
    // @ts-expect-error exposed only for browser diagnostics
    const textures = window.__PHASER_GAME__.textures;
    const kinds = ["sprout", "beetle", "moth", "guardian"];
    const keys = (k: string) => [0, 1, 2, 3].map((f) => `${k}-idle-${f}`).concat(["attack", "hurt", "guard", "prepare"].map((p) => `${k}-${p}`));
    const canvas = document.createElement("canvas");
    canvas.width = 8 * 200;
    canvas.height = 4 * 220;
    const c = canvas.getContext("2d")!;
    c.imageSmoothingEnabled = false;
    c.fillStyle = "#4e7650";
    c.fillRect(0, 0, canvas.width, canvas.height);
    const distinct: Record<string, number> = {};
    const outlined: Record<string, boolean> = {};
    kinds.forEach((kind, row) => {
      const seen = new Set<string>();
      keys(kind).forEach((key, col) => {
        const img = textures.get(key).getSourceImage() as HTMLCanvasElement;
        const scale = kind === "guardian" ? 4 : 6;
        c.drawImage(img, col * 200, row * 220, img.width * scale, img.height * scale);
        seen.add(img.toDataURL());
        if (col === 0) {
          const data = img.getContext("2d")!.getImageData(0, 0, img.width, img.height).data;
          let ink = 0;
          for (let i = 0; i < data.length; i += 4)
            if (data[i] === 0x18 && data[i + 1] === 0x3d && data[i + 2] === 0x35) ink++;
          outlined[kind] = ink > 40;
        }
      });
      distinct[kind] = seen.size;
    });
    return { image: canvas.toDataURL("image/png").split(",")[1], distinct, outlined };
  });
  writeFileSync(`${evidence}/monster-sheet.png`, Buffer.from(result.image, "base64"));
  for (const kind of ["sprout", "beetle", "moth", "guardian"]) {
    expect(result.outlined[kind], kind).toBe(true);
    // 4 idle frames + 4 poses; idle repeats at most once (yoyo frames 0/2).
    expect(result.distinct[kind], kind).toBeGreaterThanOrEqual(6);
  }
});

for (const enemy of ["sprout", "beetle", "moth", "guardian"] as EnemyId[]) {
  test(`palco de combate com o novo ${enemy}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const s = freshSave();
    s.motion = "reduced";
    s.map = "forest";
    startBattle(s, enemy);
    await page.addInitScript((save) => localStorage.setItem("fizzi-quest.save.v1", JSON.stringify(save)), s);
    await page.goto("/");
    await page.getByRole("button", { name: "Continuar aventura" }).click();
    await expect(page.getByRole("button", { name: "Atacar", exact: true })).toBeVisible();
    await page.screenshot({ path: `${evidence}/battle-${enemy}-1366.png` });
    expect(errors).toEqual([]);
  });
}
