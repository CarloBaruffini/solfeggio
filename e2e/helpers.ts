import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** Computer keys for pitch classes 0 (C) … 11 (B), as in src/input/computerKeyboard.ts. */
const KEY_CODES = [
  'KeyA',
  'KeyW',
  'KeyS',
  'KeyE',
  'KeyD',
  'KeyF',
  'KeyT',
  'KeyG',
  'KeyY',
  'KeyH',
  'KeyU',
  'KeyJ',
];

export const staff = (page: Page): Locator => page.getByTestId('staff');
export const feedback = (page: Page): Locator => page.locator('[aria-live="polite"]');
export const pianoKeys = (page: Page): Locator =>
  page.getByRole('group', { name: 'Tastiera' }).getByRole('button');

export async function openApp(page: Page): Promise<void> {
  await page.goto('./');
  await expect(staff(page).locator('.vf-stavenote').first()).toBeVisible();
}

/** Pitch class of the note to play, exposed by the staff for tests. */
export async function currentPitchClass(page: Page): Promise<number> {
  const value = await staff(page).getAttribute('data-current-pitch-class');
  if (value === null) throw new Error('No current note');
  return Number(value);
}

/** Plays a pitch class with the computer keyboard on desktop and by tapping on touch devices. */
export async function playPitchClass(page: Page, pitchClass: number, hasTouch: boolean) {
  if (hasTouch) {
    await pianoKeys(page).nth(pitchClass).tap();
  } else {
    await page.keyboard.press(KEY_CODES[pitchClass] ?? 'KeyA');
  }
}
