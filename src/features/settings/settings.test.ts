import { describe, expect, it } from 'vitest';

import { sanitizeSettings } from './settings';

describe('sanitizeSettings', () => {
  it('keeps valid values', () => {
    expect(
      sanitizeSettings({
        clef: 'alto',
        ledgerLines: 2,
        naming: 'letter',
        sound: false,
        microphone: true,
      }),
    ).toEqual({ clef: 'alto', ledgerLines: 2, naming: 'letter', sound: false, microphone: true });
  });

  it('drops invalid or unknown values', () => {
    expect(
      sanitizeSettings({
        clef: 'tenor',
        ledgerLines: 5,
        accidentals: 'yes',
        microphone: 1,
        foo: 1,
      }),
    ).toEqual({});
  });

  it('ignores non-object data', () => {
    expect(sanitizeSettings(null)).toEqual({});
    expect(sanitizeSettings('treble')).toEqual({});
  });
});
