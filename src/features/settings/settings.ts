import type { Clef, LedgerLines, NamingSystem } from '@/core/music';
import { CLEFS, LEDGER_LINE_OPTIONS, NAMING_SYSTEMS } from '@/core/music';

/** User preferences. Documented in docs/features/note-reading.md. */
export interface Settings {
  readonly clef: Clef;
  readonly ledgerLines: LedgerLines;
  readonly accidentals: boolean;
  readonly naming: NamingSystem;
  readonly showKeyNames: boolean;
  readonly sound: boolean;
  /** Answer by playing an instrument into the microphone (see docs/features/microphone-input.md). */
  readonly microphone: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  clef: 'treble',
  ledgerLines: 1,
  accidentals: false,
  naming: 'solfege',
  showKeyNames: true,
  sound: true,
  microphone: false,
};

const isOneOf = <T>(options: readonly T[], value: unknown): value is T =>
  options.includes(value as T);

/**
 * Keeps only the valid fields of persisted data, so a corrupted or outdated
 * `localStorage` entry can never put the app in an invalid state.
 */
export function sanitizeSettings(stored: unknown): Partial<Settings> {
  if (typeof stored !== 'object' || stored === null) return {};
  const data = stored as Record<string, unknown>;
  const result: { -readonly [K in keyof Settings]?: Settings[K] } = {};
  if (isOneOf(CLEFS, data.clef)) result.clef = data.clef;
  if (isOneOf(LEDGER_LINE_OPTIONS, data.ledgerLines)) result.ledgerLines = data.ledgerLines;
  if (isOneOf(NAMING_SYSTEMS, data.naming)) result.naming = data.naming;
  if (typeof data.accidentals === 'boolean') result.accidentals = data.accidentals;
  if (typeof data.showKeyNames === 'boolean') result.showKeyNames = data.showKeyNames;
  if (typeof data.sound === 'boolean') result.sound = data.sound;
  if (typeof data.microphone === 'boolean') result.microphone = data.microphone;
  return result;
}
