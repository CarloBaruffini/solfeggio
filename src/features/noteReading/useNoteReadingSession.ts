import { useCallback, useEffect, useMemo, useReducer } from 'react';

import { audioEngine } from '@/audio';
import type { PianoFlash } from '@/components/Piano';
import type { NoteReadingOptions, SessionEvent } from '@/core/exercises/noteReading';
import {
  createSession,
  currentNote,
  generatePitches,
  hintPitchClass,
  noteDisplayStates,
  sessionReducer,
} from '@/core/exercises/noteReading';
import { midiInOctave, pitchClass, pitchClassOfMidi } from '@/core/music';
import { defaultRandom } from '@/core/random';
import type { NoteInputEvent } from '@/input';
import type { StaffViewNote } from '@/notation';

import { useRecordsStore } from './recordsStore';

/** Pause between a completed round and the next one, in milliseconds. */
export const NEXT_ROUND_DELAY_MS = 1100;

/** Octave used for sound when there is no note to read. */
const FALLBACK_OCTAVE = 4;

export interface NoteReadingSessionArgs {
  readonly options: NoteReadingOptions;
  readonly sound: boolean;
  /** How many notes the next round should have (depends on the available width). */
  readonly getNoteCount: () => number;
}

function flashFor(event: SessionEvent): PianoFlash | null {
  switch (event.kind) {
    case 'correct':
    case 'roundComplete':
      return { pitchClass: pitchClass(event.pitch), result: 'correct' };
    case 'wrong':
      return { pitchClass: event.played, result: 'wrong' };
    case 'roundStarted':
      return null;
  }
}

/**
 * Runs a note-reading session: owns the reducer state and the side effects around it
 * (random rounds, sound, the pause between rounds, the persisted best streak).
 */
export function useNoteReadingSession({ options, sound, getNoteCount }: NoteReadingSessionArgs) {
  const [state, dispatch] = useReducer(sessionReducer, null, () =>
    createSession(generatePitches(options, getNoteCount(), defaultRandom), performance.now()),
  );
  const recordStreak = useRecordsStore((records) => records.recordStreak);
  const resetRecords = useRecordsStore((records) => records.reset);

  /** Starts a new round, optionally with options that are not committed to state yet. */
  const startRound = useCallback(
    (roundOptions: NoteReadingOptions = options) => {
      dispatch({
        type: 'startRound',
        pitches: generatePitches(roundOptions, getNoteCount(), defaultRandom),
        at: performance.now(),
      });
    },
    [options, getNoteCount],
  );

  useEffect(() => {
    if (state.lastEvent.kind !== 'roundComplete') return;
    const timer = setTimeout(() => {
      startRound();
    }, NEXT_ROUND_DELAY_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [state.lastEvent, startRound]);

  useEffect(() => {
    recordStreak(state.stats.streak);
  }, [state.stats.streak, recordStreak]);

  /** Handles a note from any input: plays it in the octave of the note to read, then answers. */
  const play = useCallback(
    (event: NoteInputEvent) => {
      if (sound) {
        const octave = currentNote(state)?.pitch.octave ?? FALLBACK_OCTAVE;
        audioEngine.playNote(midiInOctave(pitchClassOfMidi(event.midi), octave));
      }
      dispatch({ type: 'answer', midi: event.midi, at: event.time });
    },
    [state, sound],
  );

  const resetStats = useCallback(() => {
    dispatch({ type: 'resetStats' });
    resetRecords();
  }, [resetRecords]);

  // Recompute only when the round or the position changes, not on every stats update.
  const { notes: roundNotes, currentIndex } = state;
  const notes = useMemo<StaffViewNote[]>(() => {
    const states = noteDisplayStates({ notes: roundNotes, currentIndex });
    return roundNotes.map((note, index) => ({
      pitch: note.pitch,
      state: states[index] ?? 'pending',
    }));
  }, [roundNotes, currentIndex]);

  const flash = useMemo(() => flashFor(state.lastEvent), [state.lastEvent]);

  return {
    state,
    notes,
    flash,
    hint: hintPitchClass(state),
    play,
    startRound,
    resetStats,
  };
}
