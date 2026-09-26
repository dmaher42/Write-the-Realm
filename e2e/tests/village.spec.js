import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1366, height: 768 } });

test('the village fills a Chromebook-sized screen and the gate reopens the quest', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/');
  await page.evaluate(async () => {
    localStorage.clear();
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  });
  await page.reload();
  await page.waitForFunction(() => Boolean(window.writeTheRealm));

  const village = await page.locator('#kokura-root').boundingBox();
  const canvas = await page.locator('#kokura-root canvas').boundingBox();
  expect(village.width).toBeGreaterThanOrEqual(1366);
  expect(village.height).toBeGreaterThanOrEqual(768);
  expect(canvas.width).toBeGreaterThanOrEqual(1366);
  expect(canvas.height).toBeGreaterThanOrEqual(768);
  await expect(page.locator('#credits')).toHaveCount(0);
  await expect(page.locator('.npc-name')).toHaveCount(0);

  await page.getByRole('button', { name: 'Forge New Legend' }).click();
  await page.locator('[data-type="Shark Guardian"]').click();
  await page.locator('[data-domain="Coral Reef"]').click();
  await page.getByRole('button', { name: 'Begin Your Legend' }).click();
  await expect(page.locator('#dialogue-box')).toBeVisible();

  const gateButton = page.getByRole('button', { name: 'Visit the Village Elder' });
  await expect(gateButton).toBeVisible();
  await expect(page.locator('#controls-info')).toContainText('Click the Elder’s Gate');
  await page.getByRole('button', { name: 'Accept Chapter 1' }).click();
  await expect(page.locator('#prewrite-battle')).toBeVisible();

  // Revisit the 3D gate after a panel is dismissed, as a student can do while exploring.
  await page.locator('#prewrite-battle').evaluate((panel) => { panel.style.display = 'none'; });
  await page.locator('#kokura-root canvas').click({ position: { x: 480, y: 490 } });
  await expect(page.locator('#prewrite-battle')).toBeVisible();

  await page.locator('#prewrite-battle').evaluate((panel) => { panel.style.display = 'none'; });
  await gateButton.click();
  await expect(page.locator('#prewrite-battle')).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('the village and Elder remain accessible when WebGL is unavailable', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (['webgl', 'webgl2', 'experimental-webgl'].includes(type)) return null;
      return originalGetContext.call(this, type, ...args);
    };
  });

  await page.goto('/');
  await page.evaluate(async () => {
    localStorage.clear();
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  });
  await page.reload();
  await page.waitForFunction(() => Boolean(window.writeTheRealm));

  const fallback = page.locator('#kokura-root [data-village-fallback]');
  await expect(fallback).toBeVisible();
  expect(await fallback.locator('path, rect, circle, polygon, ellipse').count()).toBeGreaterThan(12);
  await expect(page.locator('#kokura-root canvas')).toHaveCount(0);

  await page.getByRole('button', { name: 'Forge New Legend' }).click();
  await page.locator('[data-type="Shark Guardian"]').click();
  await page.locator('[data-domain="Coral Reef"]').click();
  await page.getByRole('button', { name: 'Begin Your Legend' }).click();
  await expect(page.locator('#dialogue-box')).toBeVisible();
  await page.getByRole('button', { name: 'Accept Chapter 1' }).click();
  await expect(page.locator('#prewrite-battle')).toBeVisible();

  await page.locator('#prewrite-battle').evaluate((panel) => { panel.style.display = 'none'; });
  await page.locator('[data-village-gate]').click();
  await expect(page.locator('#prewrite-battle')).toBeVisible();
  expect(pageErrors).toEqual([]);
});
