/** Note letter as an index: C = 0, D = 1, E = 2, F = 3, G = 4, A = 5, B = 6. */
export type Letter = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Written accidental: -1 = flat (♭), 0 = natural, 1 = sharp (♯). */
export type Accidental = -1 | 0 | 1;

/** Pitch class: the note regardless of octave, 0 = C … 11 = B. */
export type PitchClass = number;

/**
 * A written note: letter, accidental and octave in scientific pitch notation
 * (C4 is middle C). Two pitches can sound the same but be spelled differently (C♯4 / D♭4).
 */
export interface Pitch {
  readonly letter: Letter;
  readonly accidental: Accidental;
  readonly octave: number;
}

/** A letter plus accidental, without octave. */
export interface Spelling {
  readonly letter: Letter;
  readonly accidental: Accidental;
}

/** Semitones above C of each natural letter. */
const LETTER_SEMITONES = [0, 2, 4, 5, 7, 9, 11] as const;

/** How each pitch class is spelled on a piano key: white keys have one name, black keys two. */
const PITCH_CLASS_SPELLINGS: readonly (readonly Spelling[])[] = [
  [{ letter: 0, accidental: 0 }],
  [
    { letter: 0, accidental: 1 },
    { letter: 1, accidental: -1 },
  ],
  [{ letter: 1, accidental: 0 }],
  [
    { letter: 1, accidental: 1 },
    { letter: 2, accidental: -1 },
  ],
  [{ letter: 2, accidental: 0 }],
  [{ letter: 3, accidental: 0 }],
  [
    { letter: 3, accidental: 1 },
    { letter: 4, accidental: -1 },
  ],
  [{ letter: 4, accidental: 0 }],
  [
    { letter: 4, accidental: 1 },
    { letter: 5, accidental: -1 },
  ],
  [{ letter: 5, accidental: 0 }],
  [
    { letter: 5, accidental: 1 },
    { letter: 6, accidental: -1 },
  ],
  [{ letter: 6, accidental: 0 }],
];

/** All twelve pitch classes, from C to B. */
export const PITCH_CLASSES: readonly PitchClass[] = Array.from({ length: 12 }, (_, pc) => pc);

const mod = (value: number, divisor: number) => ((value % divisor) + divisor) % divisor;

/**
 * Position of the pitch on the staff, counted in diatonic steps (lines and spaces):
 * `octave × 7 + letter`. The accidental does not change the position.
 */
export function diatonicIndex(pitch: Pitch): number {
  return pitch.octave * 7 + pitch.letter;
}

/** Inverse of {@link diatonicIndex}. */
export function pitchFromDiatonicIndex(index: number, accidental: Accidental = 0): Pitch {
  return {
    letter: mod(index, 7) as Letter,
    accidental,
    octave: Math.floor(index / 7),
  };
}

/** Pitch class of a written pitch (C♯ and D♭ both give 1). */
export function pitchClass(pitch: Pitch): PitchClass {
  return mod(LETTER_SEMITONES[pitch.letter] + pitch.accidental, 12);
}

/** MIDI note number of a written pitch (C4 = 60, A4 = 69). */
export function midiNumber(pitch: Pitch): number {
  return (pitch.octave + 1) * 12 + LETTER_SEMITONES[pitch.letter] + pitch.accidental;
}

/** Pitch class of a MIDI note number. */
export function pitchClassOfMidi(midi: number): PitchClass {
  return mod(midi, 12);
}

/** MIDI number of a pitch class in the given octave (scientific pitch notation). */
export function midiInOctave(pitchClassValue: PitchClass, octave: number): number {
  return (octave + 1) * 12 + mod(pitchClassValue, 12);
}

/** Whether the pitch class is played on a black key of the piano. */
export function isBlackKey(pitchClassValue: PitchClass): boolean {
  return spellingsOfPitchClass(pitchClassValue).length > 1;
}

/** Usual spellings of a pitch class: one for white keys, sharp then flat for black keys. */
export function spellingsOfPitchClass(pitchClassValue: PitchClass): readonly Spelling[] {
  return PITCH_CLASS_SPELLINGS[mod(pitchClassValue, 12)] ?? [];
}

/** Whether two written pitches are identical (same letter, accidental and octave). */
export function isSamePitch(a: Pitch, b: Pitch): boolean {
  return a.letter === b.letter && a.accidental === b.accidental && a.octave === b.octave;
}

const LETTER_CHARS = 'CDEFGAB';

/**
 * Formats a pitch in scientific pitch notation with ASCII accidentals:
 * `C4`, `F#5`, `Bb3`. Handy for logs, test names and fixtures.
 */
export function formatPitch(pitch: Pitch): string {
  const accidental = pitch.accidental === 1 ? '#' : pitch.accidental === -1 ? 'b' : '';
  return `${LETTER_CHARS.charAt(pitch.letter)}${accidental}${pitch.octave}`;
}

/** Parses {@link formatPitch} notation (`C4`, `F#5`, `Bb3`). Throws on invalid input. */
export function parsePitch(text: string): Pitch {
  const match = /^([A-G])([#b]?)(-?\d+)$/.exec(text.trim());
  if (!match) throw new Error(`Invalid pitch: "${text}"`);
  const [, letterChar = '', accidentalChar, octave = ''] = match;
  return {
    letter: LETTER_CHARS.indexOf(letterChar) as Letter,
    accidental: accidentalChar === '#' ? 1 : accidentalChar === 'b' ? -1 : 0,
    octave: Number(octave),
  };
}

/** Frequency in hertz of a MIDI note in twelve-tone equal temperament (A4 = 440 Hz). */
export function frequencyOfMidi(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

/**
 * MIDI note number of a frequency in hertz (A4 = 440 Hz), the inverse of
 * {@link frequencyOfMidi}. The result is fractional: round it for the nearest semitone;
 * the fractional part is the deviation in hundredths of a semitone (cents / 100).
 */
export function midiOfFrequency(frequency: number): number {
  return 69 + 12 * Math.log2(frequency / 440);
}
