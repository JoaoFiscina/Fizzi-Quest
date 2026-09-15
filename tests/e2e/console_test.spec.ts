import { test, expect } from '@playwright/test';
test('check sprites are animating', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  const data = await page.evaluate(() => {
    // @ts-ignore
    const game = window.__PHASER_GAME__;
    if (!game) return "NO GAME";
    const scene = game.scene.scenes[0];
    const player = scene.player;
    const water = scene.root.list.find((s: any) => s.anims && s.anims.currentAnim && s.anims.currentAnim.key === 'ambient-water');
    const monster = Array.from(scene.enemySprites.values())[0];
    return {
      player: {
        anim: player.anims.currentAnim?.key,
        isPlaying: player.anims.isPlaying,
        currentFrame: player.anims.currentFrame?.index
      },
      water: water ? {
        anim: water.anims.currentAnim?.key,
        isPlaying: water.anims.isPlaying,
        currentFrame: water.anims.currentFrame?.index
      } : null,
      monster: monster ? {
        anim: (monster as any).anims.currentAnim?.key,
        isPlaying: (monster as any).anims.isPlaying,
        currentFrame: (monster as any).anims.currentFrame?.index
      } : null
    };
  });
  console.log('DATA:', data);
  await page.waitForTimeout(2000);
  const data2 = await page.evaluate(() => {
    // @ts-ignore
    const scene = window.__PHASER_GAME__.scene.scenes[0];
    const water = scene.root.list.find((s: any) => s.anims && s.anims.currentAnim && s.anims.currentAnim.key === 'ambient-water');
    const monster = Array.from(scene.enemySprites.values())[0];
    return {
      waterFrame: water?.anims?.currentFrame?.index,
      monsterFrame: (monster as any)?.anims?.currentFrame?.index
    };
  });
  console.log('DATA 2:', data2);
});
