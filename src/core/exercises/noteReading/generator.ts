import type { Accidental, Clef, LedgerLines, Letter, Pitch } from '@/core/music';
import { isSamePitch, pitchFromDiatonicIndex, readingRange } from '@/core/music';
import type { Random } from '@/core/random';
import { pickRandom, randomInt } from '@/core/random';

/** What the generated notes look like. */
export interface NoteReadingOptions {
  readonly clef: Clef;
  readonly ledgerLines: LedgerLines;
  /** Whether notes may carry a sharp or a flat. */
  readonly accidentals: boolean;
}

/** Probability that a note gets an accidental when accidentals are enabled. */
export const ACCIDENTAL_PROBABILITY = 0.4;

/**
 * Accidentals that may be written on a letter. E♯, B♯, C♭ and F♭ are excluded so that
 * every generated note matches exactly one piano key under its usual name.
 */
export function allowedAccidentals(letter: Letter): readonly Exclude<Accidental, 0>[] {
  const sharpAllowed = letter !== 2 && letter !== 6; // E, B
  const flatAllowed = letter !== 0 && letter !== 3; // C, F
  return [...(sharpAllowed ? [1 as const] : []), ...(flatAllowed ? [-1 as const] : [])];
}

/**
 * Picks a random pitch for a reading exercise: a uniformly random position in the
 * clef's {@link readingRange}, optionally with an accidental. Never returns a pitch
 * identical to `previous`, so the same note does not appear twice in a row.
 */
export function randomPitch(options: NoteReadingOptions, random: Random, previous?: Pitch): Pitch {
  const range = readingRange(options.clef, options.ledgerLines);
  for (;;) {
    const natural = pitchFromDiatonicIndex(randomInt(range.low, range.high, random));
    const pitch = withRandomAccidental(natural, options, random);
    if (!previous || !isSamePitch(pitch, previous)) return pitch;
  }
}

function withRandomAccidental(pitch: Pitch, options: NoteReadingOptions, random: Random): Pitch {
  if (!options.accidentals || random() >= ACCIDENTAL_PROBABILITY) return pitch;
  const [first, ...rest] = allowedAccidentals(pitch.letter);
  if (first === undefined) return pitch;
  return { ...pitch, accidental: pickRandom([first, ...rest], random) };
}

/** Generates a round of `count` pitches with no immediate repetitions. */
export function generatePitches(
  options: NoteReadingOptions,
  count: number,
  random: Random,
): Pitch[] {
  const pitches: Pitch[] = [];
  for (let i = 0; i < count; i++) {
    pitches.push(randomPitch(options, random, pitches.at(-1)));
  }
  return pitches;
}
