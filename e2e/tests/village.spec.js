import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1366, height: 768 } });

async function resetApplication(page) {
  await page.goto('/');
  await page.evaluate(async () => {
    localStorage.clear();
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  });
  await page.reload();
  await page.waitForFunction(() => Boolean(window.writeTheRealm?.world));
}

async function beginJourney(page) {
  await page.getByRole('button', { name: 'Forge New Legend' }).click();
  await page.locator('[data-type="Shark Guardian"]').click();
  await page.locator('[data-domain="Coral Reef"]').click();
  await page.getByRole('button', { name: 'Begin Your Legend' }).click();
  await expect(page.locator('#dialogue-box')).toBeHidden();
}

async function playerPosition(page) {
  return page.evaluate(() => window.writeTheRealm.world.getPlayerPosition());
}

test('the Chromebook-sized 3D village lets a student walk to the Elder and press E', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await resetApplication(page);

  const village = await page.locator('#kokura-root').boundingBox();
  const canvas = await page.locator('#kokura-root canvas').boundingBox();
  expect(village.width).toBeGreaterThanOrEqual(1366);
  expect(village.height).toBeGreaterThanOrEqual(768);
  expect(canvas.width).toBeGreaterThanOrEqual(1366);
  expect(canvas.height).toBeGreaterThanOrEqual(768);
  await expect(page.locator('#credits')).toHaveCount(0);
  await expect(page.locator('.npc-name')).toHaveCount(0);

  await beginJourney(page);
  const avatar = await page.evaluate(() => {
    const { player, camera } = window.writeTheRealm.world;
    const projected = player.getWorldPosition(player.position.clone()).project(camera);
    return {
      visible: player.visible,
      inScene: Boolean(player.parent),
      onScreen: Math.abs(projected.x) < 1 && Math.abs(projected.y) < 1 && projected.z > 0 && projected.z < 1,
    };
  });
  expect(avatar).toEqual({ visible: true, inScene: true, onScreen: true });
  const start = await playerPosition(page);
  expect(start.z).toBeGreaterThan(22);
  const startingCameraZ = await page.evaluate(() => window.writeTheRealm.world.camera.position.z);
  await expect(page.locator('#controls-info')).toContainText(/WASD/i);

  await page.keyboard.down('w');
  try {
    await expect.poll(async () => (await playerPosition(page)).z, { intervals: [100] })
      .toBeLessThan(21.2);
    await expect(page.locator('#world-interaction-prompt')).toBeVisible();
    await expect(page.locator('#world-interaction-prompt')).toContainText('Village Elder');
    await page.keyboard.press('e');
  } finally {
    await page.keyboard.up('w');
  }
  const nearElder = await playerPosition(page);
  const cameraZ = await page.evaluate(() => window.writeTheRealm.world.camera.position.z);
  expect(cameraZ).toBeLessThan(startingCameraZ - 0.5);

  await expect(page.locator('#dialogue-box')).toBeVisible();
  await expect(page.locator('#dialogue-title')).toContainText('Village Elder');
  await page.keyboard.down('w');
  await page.waitForTimeout(350);
  await page.keyboard.up('w');
  expect((await playerPosition(page)).z).toBeCloseTo(nearElder.z, 1);

  await page.getByRole('button', { name: 'Accept Chapter 1' }).click();
  await expect(page.locator('#prewrite-battle')).toBeVisible();
  await page.keyboard.down('w');
  await page.waitForTimeout(350);
  await page.keyboard.up('w');
  expect((await playerPosition(page)).z).toBeCloseTo(nearElder.z, 1);
  await expect(page.getByRole('button', { name: 'Visit the Village Elder' })).toBeHidden();
  await expect(page.locator('#prewrite-battle')).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('movement stays on the island and continues at the saved position after refresh', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await resetApplication(page);
  await beginJourney(page);

  const start = await playerPosition(page);
  await page.keyboard.down('s');
  try {
    await expect.poll(async () => (await playerPosition(page)).z).toBeGreaterThan(start.z + 0.5);
    await page.waitForTimeout(2500);
  } finally {
    await page.keyboard.up('s');
  }
  const edge = await playerPosition(page);
  expect(edge.z).toBeGreaterThan(25.5);
  expect(Math.hypot(edge.x, edge.z)).toBeLessThanOrEqual(27);
  await page.keyboard.down('s');
  await page.waitForTimeout(300);
  await page.keyboard.up('s');
  expect((await playerPosition(page)).z).toBeCloseTo(edge.z, 1);
  await page.waitForTimeout(350);
  await page.reload();
  await page.waitForFunction(() => Boolean(window.writeTheRealm?.world));
  await expect(page.locator('#continue-game-btn')).toBeEnabled();
  await page.locator('#continue-game-btn').click();
  await expect.poll(async () => (await playerPosition(page)).x).toBeCloseTo(edge.x, 1);
  await expect.poll(async () => (await playerPosition(page)).z).toBeCloseTo(edge.z, 1);
  expect(pageErrors).toEqual([]);
});

test('a completed Chapter 1 save can walk to the Keep and interact in 3D', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await resetApplication(page);
  await page.evaluate(() => {
    localStorage.setItem('gameState', JSON.stringify({
      version: 2,
      phase: 'exploring',
      selectedGuardian: 'Shark Guardian',
      selectedDomain: 'Coral Reef',
      worldPosition: { x: 0, z: 1.5 },
      player: { level: 2, xp: 0, attack: 10, health: 110, speed: 5 },
      completedQuests: ['chapter-one-broken-beacon'],
      activeQuest: null,
      journalEntries: [{ id: 'beacon', title: 'The Broken Beacon', stage: 'Complete', text: 'The beacon shone.' }],
    }));
  });
  await page.reload();
  await page.waitForFunction(() => Boolean(window.writeTheRealm?.world));
  await page.getByRole('button', { name: 'Continue Journey' }).click();
  await expect.poll(async () => (await playerPosition(page)).z).toBeCloseTo(1.5, 1);
  await expect(page.locator('#world-interaction-prompt')).toBeHidden();

  await page.keyboard.down('w');
  try {
    await expect(page.locator('#world-interaction-prompt')).toContainText('Kokura Keep', { timeout: 15_000 });
  } finally {
    await page.keyboard.up('w');
  }
  const atKeep = await playerPosition(page);
  expect(atKeep.z).toBeLessThan(1);
  await page.keyboard.press('e');
  await expect(page.locator('#village-hub')).toBeVisible();
  await expect(page.locator('#village-hub-heading')).toHaveText('Kokura Keep');
  await expect(page.locator('#village-place-text')).toContainText(/restored beacon/i);
  await page.locator('#village-close').click();
  await expect(page.locator('#village-hub')).toBeHidden();

  await page.keyboard.down('s');
  try {
    await expect.poll(async () => (await playerPosition(page)).z).toBeGreaterThan(atKeep.z + 0.5);
  } finally {
    await page.keyboard.up('s');
  }
  expect(pageErrors).toEqual([]);
});

test('the Elder remains accessible when WebGL is unavailable', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (['webgl', 'webgl2', 'experimental-webgl'].includes(type)) return null;
      return originalGetContext.call(this, type, ...args);
    };
  });
  await resetApplication(page);

  const fallback = page.locator('#kokura-root [data-village-fallback]');
  await expect(fallback).toBeVisible();
  expect(await fallback.locator('path, rect, circle, polygon, ellipse').count()).toBeGreaterThan(12);
  await expect(page.locator('#kokura-root canvas')).toHaveCount(0);

  await beginJourney(page);
  const gateButton = page.getByRole('button', { name: 'Visit the Village Elder' });
  await expect(gateButton).toBeVisible();
  await gateButton.click();
  await expect(page.locator('#dialogue-box')).toBeVisible();
  await page.getByRole('button', { name: 'Accept Chapter 1' }).click();
  await expect(page.locator('#prewrite-battle')).toBeVisible();
  await expect(gateButton).toBeHidden();

  await resetApplication(page);
  await expect(fallback).toBeVisible();
  await beginJourney(page);
  await page.locator('[data-village-gate]').click();
  await expect(page.locator('#dialogue-box')).toBeVisible();
  expect(pageErrors).toEqual([]);
});
