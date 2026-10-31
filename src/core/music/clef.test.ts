import { describe, expect, it } from 'vitest';

import type { Clef, LedgerLines } from './clef';
import { CLEF_BOTTOM_LINE, rangeBounds, readingRange } from './clef';
import { formatPitch, parsePitch, diatonicIndex } from './pitch';

describe('CLEF_BOTTOM_LINE', () => {
  it.each([
    ['treble', 'E4'],
    ['bass', 'G2'],
    ['alto', 'F3'],
  ] as const)('the bottom line of the %s clef is %s', (clef, pitch) => {
    expect(CLEF_BOTTOM_LINE[clef]).toBe(diatonicIndex(parsePitch(pitch)));
  });
});

describe('readingRange', () => {
  // Same table as docs/features/note-reading.md.
  const cases: [Clef, LedgerLines, string, string][] = [
    ['treble', 0, 'D4', 'G5'],
    ['treble', 1, 'B3', 'B5'],
    ['treble', 2, 'G3', 'D6'],
    ['bass', 0, 'F2', 'B3'],
    ['bass', 1, 'D2', 'D4'],
    ['bass', 2, 'B1', 'F4'],
    ['alto', 0, 'E3', 'A4'],
    ['alto', 1, 'C3', 'C5'],
    ['alto', 2, 'A2', 'E5'],
  ];

  it.each(cases)('%s clef with %i ledger lines spans %s–%s', (clef, ledgerLines, low, high) => {
    const [lowest, highest] = rangeBounds(readingRange(clef, ledgerLines));
    expect([formatPitch(lowest), formatPitch(highest)]).toEqual([low, high]);
  });
});
