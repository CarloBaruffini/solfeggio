import type { Pitch, PitchClass } from '@/core/music';
import { pitchClass, pitchClassOfMidi } from '@/core/music';

import type { ReadingStats } from './stats';
import { EMPTY_STATS, withCorrectAnswer, withWrongAnswer } from './stats';

/** Wrong attempts on the same note after which the correct key is revealed. */
export const HINT_AFTER_WRONG_ATTEMPTS = 2;

/** A note of the current round and how many times it was answered wrongly. */
export interface RoundNote {
  readonly pitch: Pitch;
  readonly wrongAttempts: number;
}

/** What happened last, used for feedback and key animations. */
export type SessionEvent =
  | { readonly kind: 'roundStarted' }
  | { readonly kind: 'correct'; readonly pitch: Pitch }
  | {
      readonly kind: 'wrong';
      readonly expected: Pitch;
      readonly played: PitchClass;
      /** Whether the correct key should now be revealed. */
      readonly hint: boolean;
    }
  | {
      readonly kind: 'roundComplete';
      /** The last note of the round, just answered correctly. */
      readonly pitch: Pitch;
      readonly firstAttempt: number;
      readonly total: number;
    };

export interface SessionState {
  readonly notes: readonly RoundNote[];
  /** Index of the note to play; equals `notes.length` when the round is complete. */
  readonly currentIndex: number;
  /** Timestamp (ms) at which the current note became current. */
  readonly currentSince: number;
  readonly stats: ReadingStats;
  readonly lastEvent: SessionEvent;
}

export type SessionAction =
  /** Replaces the round with new pitches, keeping the statistics. */
  | { readonly type: 'startRound'; readonly pitches: readonly Pitch[]; readonly at: number }
  /** A note was played; answers are compared by pitch class. Ignored when the round is complete. */
  | { readonly type: 'answer'; readonly midi: number; readonly at: number }
  | { readonly type: 'resetStats' };

/** Display state of a note on the staff. */
export type NoteDisplayState = 'pending' | 'current' | 'correct' | 'missed';

/** Creates a session whose first round uses `pitches`. */
export function createSession(pitches: readonly Pitch[], at: number): SessionState {
  return {
    notes: pitches.map((pitch) => ({ pitch, wrongAttempts: 0 })),
    currentIndex: 0,
    currentSince: at,
    stats: EMPTY_STATS,
    lastEvent: { kind: 'roundStarted' },
  };
}

/** Pure reducer for the note-reading exercise (use with `useReducer`). */
export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'startRound':
      return { ...createSession(action.pitches, action.at), stats: state.stats };
    case 'resetStats':
      return { ...state, stats: EMPTY_STATS };
    case 'answer':
      return answer(state, action.midi, action.at);
  }
}

function answer(state: SessionState, midi: number, at: number): SessionState {
  const target = currentNote(state);
  if (!target) return state;

  if (pitchClassOfMidi(midi) !== pitchClass(target.pitch)) {
    const updated: RoundNote = { ...target, wrongAttempts: target.wrongAttempts + 1 };
    return {
      ...state,
      notes: state.notes.with(state.currentIndex, updated),
      stats: withWrongAnswer(state.stats),
      lastEvent: {
        kind: 'wrong',
        expected: target.pitch,
        played: pitchClassOfMidi(midi),
        hint: updated.wrongAttempts >= HINT_AFTER_WRONG_ATTEMPTS,
      },
    };
  }

  const nextIndex = state.currentIndex + 1;
  const complete = nextIndex >= state.notes.length;
  return {
    ...state,
    currentIndex: nextIndex,
    currentSince: at,
    stats: withCorrectAnswer(state.stats, at - state.currentSince, target.wrongAttempts === 0),
    lastEvent: complete
      ? {
          kind: 'roundComplete',
          pitch: target.pitch,
          firstAttempt: state.notes.filter((note) => note.wrongAttempts === 0).length,
          total: state.notes.length,
        }
      : { kind: 'correct', pitch: target.pitch },
  };
}

/** The note to play next, or `undefined` when the round is complete. */
export function currentNote(state: SessionState): RoundNote | undefined {
  return state.notes[state.currentIndex];
}

export function isRoundComplete(state: SessionState): boolean {
  return state.currentIndex >= state.notes.length;
}

/** Pitch class of the key to reveal as a hint, or `null` when no hint is due. */
export function hintPitchClass(state: SessionState): PitchClass | null {
  const target = currentNote(state);
  return target && target.wrongAttempts >= HINT_AFTER_WRONG_ATTEMPTS
    ? pitchClass(target.pitch)
    : null;
}

/** How each note of the round should be drawn. */
export function noteDisplayStates(
  state: Pick<SessionState, 'notes' | 'currentIndex'>,
): NoteDisplayState[] {
  return state.notes.map((note, index) => {
    if (index === state.currentIndex) return 'current';
    if (index > state.currentIndex) return 'pending';
    return note.wrongAttempts === 0 ? 'correct' : 'missed';
  });
}
