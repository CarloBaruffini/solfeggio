import { describe, expect, it, vi } from 'vitest';

import { frequencyOfMidi, pitchClassOfMidi } from '@/core/music';
import { pianoLike, synthesize } from '@/test/signals';

import type { NoteInputListener } from '../types';
import type { FrameScheduler, MicrophoneFrame, SampleReader } from './microphoneSource';
import { createMicrophoneSource, levelOfRms } from './microphoneSource';
import { ANALYSIS_WINDOW } from './pitchDetector';

const SAMPLE_RATE = 48000;
const FRAME_MS = 1000 / 60;

/** A scheduler driven by the test, one frame per `tick`. */
function manualScheduler() {
  let pending: ((time: number) => void) | null = null;
  let time = 0;
  const scheduler: FrameScheduler = {
    request(callback) {
      pending = callback;
      return 1;
    },
    cancel() {
      pending = null;
    },
  };
  return {
    scheduler,
    get time() {
      return time;
    },
    tick(frames = 1) {
      for (let i = 0; i < frames; i++) {
        time += FRAME_MS;
        const callback = pending;
        pending = null;
        callback?.(time);
      }
    },
    get scheduled() {
      return pending !== null;
    },
  };
}

/** A microphone that hears `midi` (struck at `fromMs`) and silence before. */
function fakeMicrophone(clock: { time: number }, midi: number, fromMs: number): SampleReader {
  return {
    sampleRate: SAMPLE_RATE,
    readFrame(buffer) {
      const sinceAttack = (clock.time - fromMs) / 1000;
      if (sinceAttack < 0) {
        buffer.fill(0);
        return;
      }
      buffer.set(
        synthesize(pianoLike(frequencyOfMidi(midi)), {
          sampleRate: SAMPLE_RATE,
          length: ANALYSIS_WINDOW,
          offset: sinceAttack,
          decay: 1.5,
        }),
      );
    },
  };
}

describe('createMicrophoneSource', () => {
  it('emits one microphone event for a played note and reports what it hears', () => {
    const clock = manualScheduler();
    const frames: MicrophoneFrame[] = [];
    const source = createMicrophoneSource(fakeMicrophone(clock, 57, 200), {
      scheduler: clock.scheduler,
      onFrame: (frame) => frames.push(frame),
    });
    const listener = vi.fn<NoteInputListener>();
    source.start(listener);
    clock.tick(60);

    expect(listener).toHaveBeenCalledTimes(1);
    const [event] = listener.mock.calls[0] ?? [];
    expect(event?.source).toBe('microphone');
    expect(pitchClassOfMidi(event?.midi ?? -1)).toBe(9);
    expect(event?.time).toBeGreaterThanOrEqual(200);
    expect(frames).toHaveLength(60);
    expect(frames[0]).toEqual({ midi: null, level: 0 });
    expect(frames.at(-1)?.level).toBeGreaterThan(0.5);
    expect(pitchClassOfMidi(frames.at(-1)?.midi ?? -1)).toBe(9);
  });

  it('stops reading when stopped', () => {
    const clock = manualScheduler();
    const source = createMicrophoneSource(fakeMicrophone(clock, 57, 0), {
      scheduler: clock.scheduler,
    });
    const listener = vi.fn<NoteInputListener>();
    source.start(listener);
    source.stop();
    expect(clock.scheduled).toBe(false);
    clock.tick(30);
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('levelOfRms', () => {
  it('maps -60…0 dBFS to 0…1', () => {
    expect(levelOfRms(0)).toBe(0);
    expect(levelOfRms(0.0001)).toBe(0);
    expect(levelOfRms(0.001)).toBeCloseTo(0, 9);
    expect(levelOfRms(0.01)).toBeCloseTo(1 / 3, 9);
    expect(levelOfRms(1)).toBe(1);
  });
});
