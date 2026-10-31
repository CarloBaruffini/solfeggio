import { describe, expect, it } from 'vitest';

import type { Clef, LedgerLines } from '@/core/music';
import { CLEFS, LEDGER_LINE_OPTIONS, diatonicIndex, isSamePitch, readingRange } from '@/core/music';
import { createSeededRandom } from '@/core/random';

import type { NoteReadingOptions } from './generator';
import { allowedAccidentals, generatePitches, randomPitch } from './generator';

const SAMPLES = 2000;

function sample(options: NoteReadingOptions, seed = 1) {
  return generatePitches(options, SAMPLES, createSeededRandom(seed));
}

describe('allowedAccidentals', () => {
  it('excludes E♯, B♯, C♭ and F♭', () => {
    expect(allowedAccidentals(0)).toEqual([1]); // C: sharp only
    expect(allowedAccidentals(2)).toEqual([-1]); // E: flat only
    expect(allowedAccidentals(3)).toEqual([1]); // F: sharp only
    expect(allowedAccidentals(6)).toEqual([-1]); // B: flat only
    expect(allowedAccidentals(4)).toEqual([1, -1]); // G: both
  });
});

describe('generatePitches', () => {
  const combinations = CLEFS.flatMap((clef) =>
    LEDGER_LINE_OPTIONS.map((ledgerLines) => [clef, ledgerLines] as [Clef, LedgerLines]),
  );

  it.each(combinations)(
    '%s clef, %i ledger lines: stays in range and covers it',
    (clef, ledgerLines) => {
      const range = readingRange(clef, ledgerLines);
      const positions = new Set(
        sample({ clef, ledgerLines, accidentals: false }).map(diatonicIndex),
      );
      expect(Math.min(...positions)).toBe(range.low);
      expect(Math.max(...positions)).toBe(range.high);
      expect(positions.size).toBe(range.high - range.low + 1);
    },
  );

  it('never repeats the same pitch twice in a row', () => {
    const pitches = sample({ clef: 'treble', ledgerLines: 0, accidentals: true });
    pitches.slice(1).forEach((pitch, i) => {
      const previous = pitches[i];
      expect(previous && isSamePitch(pitch, previous)).toBe(false);
    });
  });

  it('only writes naturals when accidentals are disabled', () => {
    const pitches = sample({ clef: 'bass', ledgerLines: 2, accidentals: false });
    expect(pitches.every((pitch) => pitch.accidental === 0)).toBe(true);
  });

  it('writes about 40% accidentals, never E♯, B♯, C♭ or F♭', () => {
    const pitches = sample({ clef: 'alto', ledgerLines: 1, accidentals: true });
    const altered = pitches.filter((pitch) => pitch.accidental !== 0);
    expect(altered.length / pitches.length).toBeGreaterThan(0.35);
    expect(altered.length / pitches.length).toBeLessThan(0.45);
    for (const pitch of altered) {
      expect(allowedAccidentals(pitch.letter)).toContain(pitch.accidental);
    }
  });

  it('is deterministic for a given seed', () => {
    const options = { clef: 'treble', ledgerLines: 1, accidentals: true } as const;
    expect(generatePitches(options, 8, createSeededRandom(9))).toEqual(
      generatePitches(options, 8, createSeededRandom(9)),
    );
  });
});

describe('randomPitch', () => {
  it('avoids the previous pitch', () => {
    const random = createSeededRandom(5);
    const options = { clef: 'treble', ledgerLines: 0, accidentals: false } as const;
    const previous = randomPitch(options, random);
    for (let i = 0; i < 200; i++) {
      expect(isSamePitch(randomPitch(options, random, previous), previous)).toBe(false);
    }
  });
});
