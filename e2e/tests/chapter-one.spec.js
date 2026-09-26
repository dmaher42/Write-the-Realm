import { test, expect } from '@playwright/test';

const opening = [
  'The storm screamed around the shattered beacon as my Shark Guardian climbed the flooded steps.',
  'Cold rain struck the stones while poisonous fog curled over the path and hid a huge shadow above.',
].join(' ');

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
  await page.waitForFunction(() => Boolean(window.writeTheRealm));
}

async function beginJourney(page) {
  await page.getByRole('button', { name: 'Forge New Legend' }).click();
  await page.locator('[data-type="Shark Guardian"]').click();
  await page.locator('[data-domain="Coral Reef"]').click();
  await page.getByRole('button', { name: 'Begin Your Legend' }).click();
  await expect(page.locator('#dialogue-box')).toBeVisible();
}

async function completePlan(page, sentence = 'I charge through the poisonous fog and race toward the broken beacon.') {
  await page.getByRole('button', { name: 'Accept Chapter 1' }).click();
  await expect(page.locator('#prewrite-battle')).toBeVisible();
  await page.locator('#pre-action-bank .chip', { hasText: 'charge' }).click();
  await page.locator('#prewrite-sentence').fill(sentence);
  await page.locator('#prewrite-submit-btn').click();
  await expect(page.locator('#writing-challenge')).toBeVisible();
}

async function reachVictory(page) {
  await beginJourney(page);
  await completePlan(page);

  await page.locator('#writing-input').fill(opening);
  await page.locator('#writing-submit').click();

  await expect(page.locator('#monster-created-panel')).toBeVisible();
  await expect(page.locator('#monster-name')).not.toHaveText('');
  await expect(page.locator('#monster-description')).toContainText('three precise pieces of writing');
  await page.locator('#start-combat-btn').click();

  await expect(page.locator('#combat-panel')).toBeVisible();
  await expect(page.locator('#combat-prompt')).toContainText('Turn 1 of 3');
  await page.locator('#combat-writing-input').fill(
    'I charge forward and strike the creature with my shining blade.'
  );
  await page.locator('#combat-submit-btn').click();

  await expect(page.locator('#combat-prompt')).toContainText('Turn 2 of 3');
  await page.locator('#combat-writing-input').fill(
    'Thunder cracks loudly as icy rain stings my face and hands.'
  );
  await page.locator('#combat-submit-btn').click();

  await expect(page.locator('#combat-prompt')).toContainText('Turn 3 of 3');
  await page.locator('#combat-writing-input').fill(
    'I leap like a hawk and drive the blade through its shadowy armour.'
  );
  await page.locator('#combat-submit-btn').click();

  await expect(page.locator('#combat-title')).toContainText('Victory over');
  await expect(page.locator('#combat-submit-btn')).toHaveText('Claim Victory Reward');
}

test.beforeEach(async ({ page }) => {
  await resetApplication(page);
});

test('a student can finish Chapter 1, save, refresh and continue', async ({ page }) => {
  await reachVictory(page);
  await page.locator('#combat-submit-btn').click();

  await expect(page.locator('#loot-panel')).toBeVisible();
  await expect(page.locator('#loot-card')).toContainText('Tidal Blade');
  await page.getByRole('button', { name: 'Visit the Village Elder' }).click();
  await expect(page.locator('#loot-panel')).toBeVisible();
  await page.locator('#loot-equip-btn').click();

  await expect(page.locator('#quest-complete')).toBeVisible();
  await expect(page.locator('#reward-text')).toContainText('100 XP');
  await page.getByRole('button', { name: 'Visit the Village Elder' }).click();
  await expect(page.locator('#quest-complete')).toBeVisible();
  await page.locator('#continue-questing-btn').click();
  await expect(page.locator('#message-box')).toBeVisible();
  await page.locator('#message-button').click();

  await page.getByRole('button', { name: 'Visit the Village Elder' }).click();
  await expect(page.locator('#village-hub')).toBeVisible();
  await page.locator('#village-place-market').click();
  await expect(page.locator('#village-place-text')).toContainText(/garden/i);
  await page.locator('#village-place-chapel').click();
  await expect(page.locator('#village-place-text')).toContainText(/chapel/i);
  await page.locator('#village-place-keep').click();
  await expect(page.locator('#village-place-text')).toContainText(/keep/i);
  await page.locator('#village-read-journal').click();
  await expect(page.locator('#journal-panel')).toBeVisible();
  await expect(page.locator('#journal-entries')).toContainText('Battle at the Beacon');
  await expect(page.locator('#journal-entries')).toContainText('I leap like a hawk');
  await page.locator('#close-journal-btn').click();
  await expect(page.locator('#village-hub')).toBeVisible();
  await expect(page.locator('#village-place-keep')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#village-place-text')).toContainText(/keep/i);

  await page.getByRole('button', { name: 'Visit the Village Elder' }).click();
  await expect(page.locator('#village-hub')).toBeVisible();
  await page.locator('#village-close').click();
  await expect(page.locator('#village-hub')).toBeHidden();

  await page.locator('#save-game-btn').click();
  await expect(page.locator('#message-box')).toBeVisible();
  await page.locator('#message-button').click();

  await page.reload();
  await page.waitForFunction(() => Boolean(window.writeTheRealm));
  await expect(page.locator('#continue-game-btn')).toBeEnabled();
  await page.locator('#continue-game-btn').click();

  await expect(page.locator('#player-level-info')).toContainText('Level 2');
  await expect(page.locator('#slot-weapon')).toHaveText('Tidal Blade');
  await page.getByRole('button', { name: 'Visit the Village Elder' }).click();
  await expect(page.locator('#village-hub')).toBeVisible();
  await page.locator('#village-read-journal').click();
  await expect(page.locator('#journal-panel')).toBeVisible();
  await expect(page.locator('#journal-entries')).toContainText('Battle at the Beacon');
});

test('the reward stays available when browser storage stops working at victory', async ({ page }) => {
  await reachVictory(page);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => { throw new Error('Storage unavailable'); };
    Storage.prototype.getItem = () => { throw new Error('Storage unavailable'); };
  });

  await page.locator('#combat-submit-btn').click();
  await expect(page.locator('#loot-panel')).toBeVisible();
  await expect(page.locator('#loot-card')).toContainText('Tidal Blade');
  await page.locator('#loot-equip-btn').click();
  await expect(page.locator('#slot-weapon')).toHaveText('Tidal Blade');
  await expect(page.locator('#quest-complete')).toBeVisible();
});

test('Guided mode accepts the selected verb in its sentence starter', async ({ page }) => {
  await beginJourney(page);
  await page.locator('#teacher-settings-btn').click({ force: true });
  await page.locator('input[name="teacher-preset"][value="guided"]').check();
  await page.locator('#save-teacher-settings-btn').click();

  await page.getByRole('button', { name: 'Accept Chapter 1' }).click();
  await page.locator('#pre-action-bank .chip', { hasText: 'charge' }).click();
  await page.locator('#teacher-prewrite-starters button', { hasText: 'I charged towards' }).click();
  await page.locator('#prewrite-sentence').fill(
    'I charged towards the beacon because the storm threatened our village.'
  );
  await page.locator('#prewrite-submit-btn').click();
  await expect(page.locator('#writing-challenge')).toBeVisible();
});

test('Challenge mode keeps required choices but removes optional scaffolds', async ({ page }) => {
  await beginJourney(page);

  await page.locator('#teacher-settings-btn').click({ force: true });
  await expect(page.locator('#teacher-settings-panel')).toBeVisible();
  await page.locator('input[name="teacher-preset"][value="challenge"]').check();
  await expect(page.locator('#teacher-settings-summary')).toContainText('30+ words');
  await page.locator('#save-teacher-settings-btn').click();

  await expect(page.locator('#teacher-mode-indicator')).toHaveText('Challenge mode');
  await page.getByRole('button', { name: 'Accept Chapter 1' }).click();
  await expect(page.locator('#prewrite-battle')).toBeVisible();

  // The action word remains a required choice even when optional help is hidden.
  await expect(page.locator('#pre-action-bank')).toBeVisible();
  await expect(page.locator('#prewrite-battle .hint')).toBeHidden();
  await page.locator('#pre-action-bank .chip', { hasText: 'charge' }).click();
  await page.locator('#prewrite-sentence').fill(
    'I charge through the poisonous fog and race toward the broken beacon.'
  );
  await page.locator('#prewrite-submit-btn').click();

  await expect(page.locator('#writing-challenge')).toBeVisible();
  await expect(page.locator('#writing-tips-box')).toBeHidden();
  await expect(page.locator('#action-word-bank').locator('..')).toBeHidden();

  await page.locator('#writing-input').fill('This opening is deliberately too short for Challenge mode.');
  await page.locator('#writing-submit').click();
  await expect(page.locator('#message-text')).toContainText('30 words');
  await page.locator('#message-button').click();

  await page.locator('#writing-input').fill(opening);
  await page.locator('#writing-submit').click();
  await expect(page.locator('#monster-created-panel')).toBeVisible();
});
