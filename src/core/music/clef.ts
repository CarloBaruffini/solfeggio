import type { Pitch } from './pitch';
import { pitchFromDiatonicIndex } from './pitch';

export type Clef = 'treble' | 'bass' | 'alto';

export const CLEFS: readonly Clef[] = ['treble', 'bass', 'alto'];

/** How many ledger lines above and below the staff an exercise may use. */
export type LedgerLines = 0 | 1 | 2;

export const LEDGER_LINE_OPTIONS: readonly LedgerLines[] = [0, 1, 2];

/**
 * Diatonic index (see `diatonicIndex`) of the bottom line of the staff:
 * E4 for treble, G2 for bass, F3 for alto. The top line is 8 steps higher.
 */
export const CLEF_BOTTOM_LINE: Record<Clef, number> = {
  treble: 4 * 7 + 2,
  bass: 2 * 7 + 4,
  alto: 3 * 7 + 3,
};

/** Inclusive range of diatonic indexes. */
export interface DiatonicRange {
  readonly low: number;
  readonly high: number;
}

/**
 * Staff positions available to a reading exercise: the five lines and four spaces,
 * the space just outside the staff on each side, and two positions (line and space)
 * per allowed ledger line. That is `[b − 1 − 2L, b + 9 + 2L]` for bottom line `b`.
 */
export function readingRange(clef: Clef, ledgerLines: LedgerLines): DiatonicRange {
  const bottom = CLEF_BOTTOM_LINE[clef];
  return {
    low: bottom - 1 - 2 * ledgerLines,
    high: bottom + 9 + 2 * ledgerLines,
  };
}

/** Lowest and highest natural pitch of a reading range, for display and tests. */
export function rangeBounds(range: DiatonicRange): readonly [Pitch, Pitch] {
  return [pitchFromDiatonicIndex(range.low), pitchFromDiatonicIndex(range.high)];
}
