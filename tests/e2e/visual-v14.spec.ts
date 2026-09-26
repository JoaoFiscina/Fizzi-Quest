import { test, expect } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

test("cadência real por 30 segundos, escolha persistente e pixels ambientais", async ({
  page,
}) => {
  test.setTimeout(90000);
  const output = "docs/evidence/v23.09.2003.14";
  mkdirSync(output, { recursive: true });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Nova aventura", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-ambient-mode",
    "reduced",
  );
  await page.getByRole("button", { name: "Ajustes", exact: true }).click();
  await page.getByRole("button", { name: "Completa", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-ambient-mode",
    "normal",
  );
  await page.getByRole("button", { name: "Afastado", exact: true }).click();
  await page.screenshot({ path: output + "/desktop-settings.png" });
  await page.getByRole("button", { name: "Fechar menu" }).click();
  const samples: any[] = [];
  for (let i = 0; i < 55; i++) {
    samples.push(
      await page.evaluate(() => {
        // @ts-expect-error diagnostic scene
        const scene = window.__PHASER_GAME__.scene.scenes[0];
        const sprites = [...scene.waterSprites, ...scene.fireSprites];
        return {
          objects: scene.root.list.length + scene.foreground.list.length,
          positions: sprites.map((s) => [s.x, s.y]),
          frames: sprites.map((s) => s.texture.key),
          playing: sprites.every((s) => s.anims.isPlaying),
          active: scene.getAmbientDiagnostics().activeCount,
          timers: scene.time._active.length,
        };
      }),
    );
    if (i === 10 || i === 11)
      await page.screenshot({ path: output + "/desktop-time-" + i + ".png" });
    await page.waitForTimeout(557);
  }
  expect(samples.every((s) => s.playing)).toBe(true);
  expect(samples.every((s) => s.active <= 2 && s.timers === 1)).toBe(true);
  expect(new Set(samples.map((s) => JSON.stringify(s.positions))).size).toBe(1);
  expect(new Set(samples.map((s) => s.objects)).size).toBe(1);
  for (let i = 0; i < samples[0].frames.length; i++) {
    expect(new Set(samples.map((s) => s.frames[i])).size).toBeGreaterThan(1);
  }
  // Compare only rendered water/fire regions so HUD/player changes cannot pass this check.
  for (const kind of ["water", "fire"]) {
    const clip = await page.evaluate((kind) => {
      // @ts-expect-error diagnostic scene
      const scene = window.__PHASER_GAME__.scene.scenes[0];
      const sprite = kind === "water" ? scene.waterSprites[0] : scene.fireSprites[0];
      const b = sprite.getBounds(), c = scene.cameras.main;
      return { x: Math.round((b.x-c.worldView.x)*c.zoom), y: Math.round((b.y-c.worldView.y)*c.zoom),
        width: Math.round(b.width*c.zoom), height: Math.round(b.height*c.zoom) };
    },kind);
    const frames = [];
    for(let f=0;f<4;f++){
      frames.push((await page.screenshot({clip,path:output+"/"+kind+"-"+f+".png"})).toString("base64"));
      await page.waitForTimeout(173);
    }
    expect(new Set(frames).size).toBeGreaterThan(1);
  }
  // Read actual authored pixel data, not only animation counters.
  const sheet = await page.evaluate(() => {
    // @ts-expect-error diagnostic game
    const game = window.__PHASER_GAME__;
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#183d35";
    ctx.fillRect(0, 0, 640, 360);
    const keys = ["water", "fire", "tree", "grass-tuft", "flag"];
    const hashes: string[][] = [];
    keys.forEach((key, row) => {
      ctx.fillStyle = "#f1e6ca";
      ctx.font = "14px sans-serif";
      ctx.fillText(key, 8, row * 70 + 24);
      const values: string[] = [];
      for (let f = 0; f < 4; f++) {
        const source = game.textures.get(key + "-" + f).getSourceImage();
        const tmp = document.createElement("canvas");
        tmp.width = source.width;
        tmp.height = source.height;
        tmp.getContext("2d")!.drawImage(source, 0, 0);
        values.push(tmp.toDataURL());
        ctx.drawImage(
          source,
          110 + f * 130,
          row * 70,
          source.width * (key === "tree" ? 1 : 2),
          source.height * (key === "tree" ? 1 : 2),
        );
      }
      hashes.push(values);
    });
    return {
      data: canvas.toDataURL(),
      distinct: hashes.map((v) => new Set(v).size),
    };
  });
  expect(sheet.distinct.every((n) => n > 1)).toBe(true);
  writeFileSync(
    output + "/sprite-reference.png",
    Buffer.from(sheet.data.split(",")[1], "base64"),
  );
  writeFileSync(
    output + "/cadence.json",
    JSON.stringify({ sampleIntervalMs: 557, samples }, null, 2),
  );
  await page.reload();
  await page.getByRole("button", { name: "Continuar aventura" }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-ambient-mode",
    "normal",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: output + "/mobile-world.png" });
  await page.getByRole("button", { name: "Ajustes", exact: true }).click();
  await page.getByRole("button", { name: "Reduzida", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-ambient-mode",
    "reduced",
  );
  await page.screenshot({ path: output + "/mobile-reduced-settings.png" });
  await page.getByRole("button", { name: "Usar sistema", exact: true }).click();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("html")).toHaveAttribute(
    "data-ambient-mode",
    "normal",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute(
    "data-ambient-mode",
    "reduced",
  );
});
