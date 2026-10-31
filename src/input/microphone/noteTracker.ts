import { midiOfFrequency } from '@/core/music';

import type { PitchFrame } from './pitchDetector';

/** Frames less periodic than this are not treated as notes (see `PitchFrame.clarity`). */
export const CLARITY_THRESHOLD = 0.85;
/** Frames quieter than this RMS (about -40 dBFS) are silence. */
export const MIN_RMS = 0.01;
/** A pitch must hold this long (ms) before it counts, so attack transients are ignored. */
export const STABLE_MS = 50;
/** Silence lasting this long (ms) ends the sounding note, so it can be played again. */
export const RELEASE_MS = 80;
/** A jump in loudness by this factor over the last {@link ONSET_WINDOW_MS} is a new attack. */
export const ONSET_RATIO = 1.8;
export const ONSET_WINDOW_MS = 120;
/** No new attack is accepted this soon (ms) after a note, so one attack never counts twice. */
export const REARM_AFTER_MS = 150;
/**
 * A pitch stays the same note until it moves this many semitones past the halfway point,
 * so an out-of-tune note or vibrato does not flicker between two neighbours.
 */
export const HYSTERESIS = 0.2;

/** A {@link PitchFrame} with the time it was captured, in milliseconds. */
export interface TimedPitchFrame extends PitchFrame {
  readonly time: number;
}

export interface NoteTracker {
  /** Feeds the next frame; returns the MIDI note if a new note starts on it, otherwise `null`. */
  push(frame: TimedPitchFrame): number | null;
}

interface Run {
  readonly midi: number;
  readonly since: number;
}

/**
 * Turns a stream of pitch frames into note starts, one per played note.
 *
 * Notes are compared by pitch class, so octave errors of the detector never produce a
 * second note. A sounding note counts once; it can count again only after silence or a
 * new attack (a sudden rise in loudness), which is how repeated notes are detected.
 * Documented in docs/features/microphone-input.md.
 */
export function createNoteTracker(): NoteTracker {
  let run: Run | null = null;
  let sounding: { midi: number; since: number } | null = null;
  let quietSince: number | null = null;
  let recent: { time: number; rms: number }[] = [];

  return {
    push({ frequency, clarity, rms, time }) {
      recent = recent.filter((frame) => time - frame.time <= ONSET_WINDOW_MS);
      const valley = Math.min(...recent.map((frame) => frame.rms));
      recent.push({ time, rms });
      const attack = rms >= MIN_RMS && rms >= valley * ONSET_RATIO;
      if (attack && sounding && time - sounding.since >= REARM_AFTER_MS) sounding = null;

      if (rms < MIN_RMS) {
        quietSince ??= time;
        if (time - quietSince >= RELEASE_MS) sounding = null;
        run = null;
        return null;
      }
      quietSince = null;

      if (frequency === null || clarity < CLARITY_THRESHOLD) {
        run = null;
        return null;
      }

      const pitch = midiOfFrequency(frequency);
      if (!run || !isSameNote(pitch, run.midi)) run = { midi: Math.round(pitch), since: time };
      if (time - run.since < STABLE_MS) return null;
      if (sounding && isSameNote(pitch, sounding.midi)) return null;

      sounding = { midi: run.midi, since: time };
      recent = [{ time, rms }];
      return run.midi;
    },
  };
}

/** Whether a (fractional) MIDI pitch is the same pitch class as `midi`, in any octave. */
function isSameNote(pitch: number, midi: number): boolean {
  const distance = (((pitch - midi) % 12) + 12) % 12;
  return Math.min(distance, 12 - distance) < 0.5 + HYSTERESIS;
}
