import { expect, test } from '@playwright/test';

import { currentPitchClass, feedback, openApp, pianoKeys, playPitchClass, staff } from './helpers';

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test('shows a staff with a round of notes and a 12-key piano', async ({ page, isMobile }) => {
  await expect(page.getByRole('heading', { name: 'Lettura delle note' })).toBeVisible();
  await expect(staff(page).locator('.vf-stavenote')).toHaveCount(isMobile ? 5 : 8);
  await expect(pianoKeys(page)).toHaveCount(12);
  await expect(feedback(page)).toHaveText('Suona la nota evidenziata');
});

test('completes a round and starts the next one', async ({ page, hasTouch }) => {
  const total = await staff(page).locator('.vf-stavenote').count();
  for (let played = 0; played < total; played++) {
    await expect(staff(page)).toHaveAttribute(
      'aria-label',
      new RegExp(`nota ${played + 1} di ${total}`),
    );
    await playPitchClass(page, await currentPitchClass(page), hasTouch);
  }
  await expect(feedback(page)).toHaveText(`Fatto! ${total} su ${total} al primo colpo`);
  await expect(feedback(page)).toHaveText('Suona la nota evidenziata');
  await expect(staff(page)).toHaveAttribute('aria-label', new RegExp(`nota 1 di ${total}`));

  const stats = page.getByRole('region', { name: 'Statistiche' });
  await expect(stats.getByRole('definition').first()).toHaveText(String(total));
});

test('reveals the right key after two mistakes', async ({ page, hasTouch }) => {
  const target = await currentPitchClass(page);
  const wrong = (target + 1) % 12;

  await playPitchClass(page, wrong, hasTouch);
  await expect(feedback(page)).toContainText('riprova');
  await expect(pianoKeys(page).nth(target)).not.toHaveAttribute('data-hint');

  await playPitchClass(page, wrong, hasTouch);
  await expect(feedback(page)).toContainText('la nota è');
  await expect(pianoKeys(page).nth(target)).toHaveAttribute('data-hint');

  await playPitchClass(page, target, hasTouch);
  await expect(pianoKeys(page).nth(target)).not.toHaveAttribute('data-hint');
  await expect(staff(page)).toHaveAttribute('aria-label', /nota 2 di/);
});

test('changes clef and remembers the settings after a reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Basso' }).click();
  await page.getByRole('switch', { name: 'Alterazioni ♯ ♭' }).check({ force: true });
  await expect(staff(page)).toHaveAttribute('aria-label', /chiave di basso/);

  await page.reload();
  await expect(page.getByRole('button', { name: 'Basso' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('switch', { name: 'Alterazioni ♯ ♭' })).toBeChecked();
  await expect(staff(page)).toHaveAttribute('aria-label', /chiave di basso/);
});

test('switches note names on the keys', async ({ page }) => {
  await expect(pianoKeys(page).first()).toHaveAccessibleName('Do');
  await page.getByRole('button', { name: 'C D E' }).click();
  await expect(pianoKeys(page).first()).toHaveAccessibleName('C');
});

test('works offline once installed', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Service worker offline mode is tested on Chromium');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, {
    timeout: 15_000,
  });
  // Wait until the precache is complete before cutting the network.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await context.setOffline(true);
  await page.reload();
  await expect(staff(page).locator('.vf-stavenote').first()).toBeVisible();
  await context.setOffline(false);
});
