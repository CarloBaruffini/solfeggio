import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { feedback, openApp } from './helpers';

// Runs in the "microphone" project only: Chromium's fake microphone plays a looping A4
// (see e2e/fakeMicrophone.ts).

const microphoneSwitch = (page: Page) => page.getByRole('switch', { name: 'Microfono' });
const microphonePanel = (page: Page) => page.getByRole('region', { name: 'Microfono' });

test.beforeEach(async ({ page }) => {
  await openApp(page);
});

test('answers with the notes played into the microphone', async ({ page }) => {
  await microphoneSwitch(page).check({ force: true });

  await expect(microphonePanel(page)).toContainText('In ascolto');
  await expect(microphonePanel(page).getByText('La', { exact: true })).toBeVisible();
  // A4 is either the note to read or a mistake: either way it is an answer.
  await expect(feedback(page)).toHaveText(/^(✓ La|✗ Hai suonato La)/);
  await expect(microphonePanel(page)).toContainText('suono dell’app è disattivato');
});

test('asks for a tap to restart the microphone after a reload', async ({ page }) => {
  await microphoneSwitch(page).check({ force: true });
  await expect(microphonePanel(page)).toContainText('In ascolto');

  await page.reload();
  await expect(microphoneSwitch(page)).toBeChecked();
  await page.getByRole('button', { name: 'Attiva il microfono' }).click();
  await expect(microphonePanel(page)).toContainText('In ascolto');

  await microphoneSwitch(page).uncheck({ force: true });
  await expect(microphonePanel(page)).toBeHidden();
});
