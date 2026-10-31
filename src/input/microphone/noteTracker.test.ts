import { describe, expect, it } from 'vitest';

import { frequencyOfMidi } from '@/core/music';

import type { TimedPitchFrame } from './noteTracker';
import { MIN_RMS, createNoteTracker } from './noteTracker';

/** Frames arrive at the display refresh rate. */
const FRAME_MS = 1000 / 60;

/** A stretch of sound: a (fractional) MIDI pitch, or `null` for an unpitched sound. */
interface Segment {
  readonly ms: number;
  readonly pitch?: number | null;
  /** Loudness: a constant, or a function of the time since the segment started. */
  readonly rms: number | ((elapsed: number) => number);
  readonly clarity?: number;
}

const silence = (ms: number): Segment => ({ ms, rms: 0 });

/** Feeds the segments to a new tracker at 60 frames per second; returns the notes it emits. */
function track(...segments: Segment[]): number[] {
  const tracker = createNoteTracker();
  const notes: number[] = [];
  let time = 0;
  for (const { ms, pitch = null, rms, clarity = 0.95 } of segments) {
    for (let elapsed = 0; elapsed < ms; elapsed += FRAME_MS, time += FRAME_MS) {
      const frame: TimedPitchFrame = {
        frequency: pitch === null ? null : frequencyOfMidi(pitch),
        clarity: pitch === null ? 0 : clarity,
        rms: typeof rms === 'number' ? rms : rms(elapsed),
        time,
      };
      const note = tracker.push(frame);
      if (note !== null) notes.push(note);
    }
  }
  return notes;
}

/** A struck note that decays, like a piano or a guitar. */
const struck =
  (peak: number, decayMs = 800) =>
  (elapsed: number) =>
    peak * Math.exp(-elapsed / decayMs);

describe('createNoteTracker', () => {
  it('emits a sustained note once', () => {
    expect(track(silence(100), { ms: 2000, pitch: 65, rms: struck(0.2) }, silence(300))).toEqual([
      65,
    ]);
  });

  it('ignores silence, quiet sounds and noise', () => {
    expect(
      track(
        silence(500),
        { ms: 500, pitch: 65, rms: MIN_RMS / 2 },
        { ms: 500, pitch: 65, rms: 0.2, clarity: 0.5 },
      ),
    ).toEqual([]);
  });

  it('ignores a pitch shorter than the stability time', () => {
    expect(track({ ms: 30, pitch: 71, rms: 0.2 }, silence(200))).toEqual([]);
    expect(
      track(
        { ms: 400, pitch: 65, rms: 0.2 },
        { ms: 30, pitch: 71, rms: 0.2 },
        { ms: 400, pitch: 65, rms: 0.2 },
      ),
    ).toEqual([65]);
  });

  it('emits a note again after a silence', () => {
    expect(
      track({ ms: 400, pitch: 65, rms: struck(0.2) }, silence(150), {
        ms: 400,
        pitch: 65,
        rms: struck(0.2),
      }),
    ).toEqual([65, 65]);
  });

  it('emits a repeated note on a new attack, without silence in between', () => {
    expect(
      track(
        { ms: 600, pitch: 65, rms: struck(0.2, 300) },
        { ms: 600, pitch: 65, rms: struck(0.2, 300) },
      ),
    ).toEqual([65, 65]);
  });

  it('does not count an attack that rises over several frames twice', () => {
    expect(
      track(silence(100), {
        ms: 600,
        pitch: 65,
        rms: (elapsed) => Math.min(0.3, 0.005 * 2 ** (elapsed / FRAME_MS)),
      }),
    ).toEqual([65]);
  });

  it('does not treat a slow crescendo as a new attack', () => {
    expect(track({ ms: 2000, pitch: 57, rms: (elapsed) => 0.03 + elapsed / 10000 })).toEqual([57]);
  });

  it('emits each note of a legato line', () => {
    expect(
      track(
        { ms: 300, pitch: 60, rms: 0.2 },
        { ms: 300, pitch: 62, rms: 0.2 },
        { ms: 300, pitch: 64, rms: 0.2 },
      ),
    ).toEqual([60, 62, 64]);
  });

  it('ignores octave jumps of the detector within one note', () => {
    expect(
      track(
        { ms: 200, pitch: 45, rms: 0.2 },
        { ms: 200, pitch: 57, rms: 0.2 },
        { ms: 200, pitch: 45, rms: 0.2 },
      ),
    ).toEqual([45]);
  });

  it('keeps an out-of-tune note with vibrato as one note', () => {
    expect(
      track(
        { ms: 1000, pitch: 69.45, rms: 0.2 },
        { ms: 200, pitch: 69.6, rms: 0.2 },
        { ms: 200, pitch: 69.4, rms: 0.2 },
        { ms: 200, pitch: 69.6, rms: 0.2 },
      ),
    ).toEqual([69]);
  });
});
