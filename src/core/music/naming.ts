import type { Accidental, Letter, Pitch, PitchClass, Spelling } from './pitch';
import { spellingsOfPitchClass } from './pitch';

/** How note names are written: solfège (Do, Re, Mi…) or letters (C, D, E…). */
export type NamingSystem = 'solfege' | 'letter';

export const NAMING_SYSTEMS: readonly NamingSystem[] = ['solfege', 'letter'];

const LETTER_NAMES: Record<NamingSystem, Record<Letter, string>> = {
  solfege: ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'],
  letter: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
};

const ACCIDENTAL_SYMBOLS: Record<Accidental, string> = { [-1]: '♭', 0: '', 1: '♯' };

/** Name of a natural note letter, e.g. `Sol` or `G`. */
export function letterName(letter: Letter, naming: NamingSystem): string {
  return LETTER_NAMES[naming][letter];
}

/** Name of a spelling without octave, e.g. `Fa♯` or `F♯`. */
export function spellingName(spelling: Spelling, naming: NamingSystem): string {
  return letterName(spelling.letter, naming) + ACCIDENTAL_SYMBOLS[spelling.accidental];
}

/** Name of a written pitch without octave, e.g. `Si♭`. */
export function pitchName(pitch: Pitch, naming: NamingSystem): string {
  return spellingName(pitch, naming);
}

/** Names of a piano key: `['Do']` for a white key, `['Do♯', 'Re♭']` for a black key. */
export function pitchClassNames(pitchClassValue: PitchClass, naming: NamingSystem): string[] {
  return spellingsOfPitchClass(pitchClassValue).map((spelling) => spellingName(spelling, naming));
}
