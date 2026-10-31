import { midiOfFrequency } from '@/core/music';

import type { NoteInputSource } from '../types';
import { CLARITY_THRESHOLD, MIN_RMS, createNoteTracker } from './noteTracker';
import { ANALYSIS_WINDOW, createPitchAnalyzer } from './pitchDetector';

/** Where the source reads audio from: an open microphone (see `MicrophoneCapture` in audio/). */
export interface SampleReader {
  readonly sampleRate: number;
  readFrame(buffer: Float32Array<ArrayBuffer>): void;
}

/** What the microphone hears right now, for display. */
export interface MicrophoneFrame {
  /** The note heard (any octave), or `null` for silence or noise. */
  readonly midi: number | null;
  /** Loudness from 0 (-60 dBFS or quieter) to 1 (full scale). */
  readonly level: number;
}

/** Runs a callback once per frame; `requestAnimationFrame` in the browser. */
export interface FrameScheduler {
  request(callback: (time: number) => void): number;
  cancel(handle: number): void;
}

const animationFrames: FrameScheduler = {
  request: (callback) => requestAnimationFrame(callback),
  cancel: (handle) => {
    cancelAnimationFrame(handle);
  },
};

export interface MicrophoneSourceOptions {
  /** Called on every analysed frame, e.g. to show what the microphone hears. */
  readonly onFrame?: (frame: MicrophoneFrame) => void;
  /** Samples per frame; must match the window the reader was opened with. */
  readonly windowSize?: number;
  readonly scheduler?: FrameScheduler;
}

/** Converts an RMS amplitude to a 0–1 level on a 60 dB scale. */
export function levelOfRms(rms: number): number {
  if (rms <= 0) return 0;
  return Math.min(1, Math.max(0, (20 * Math.log10(rms) + 60) / 60));
}

/**
 * A note input from the microphone: analyses one window of samples per animation frame
 * and emits a note each time the {@link createNoteTracker | tracker} detects one.
 * Documented in docs/features/microphone-input.md.
 */
export function createMicrophoneSource(
  reader: SampleReader,
  {
    onFrame,
    windowSize = ANALYSIS_WINDOW,
    scheduler = animationFrames,
  }: MicrophoneSourceOptions = {},
): NoteInputSource {
  const analyzer = createPitchAnalyzer(windowSize);
  const buffer = new Float32Array(windowSize);
  let running = false;
  let handle = 0;

  return {
    kind: 'microphone',
    start(listener) {
      if (running) return;
      running = true;
      const tracker = createNoteTracker();
      const step = (time: number) => {
        if (!running) return;
        // Schedule first, so a listener that stops the source cancels the next frame.
        handle = scheduler.request(step);
        reader.readFrame(buffer);
        const frame = analyzer.analyze(buffer, reader.sampleRate);
        const midi = tracker.push({ ...frame, time });
        if (onFrame) {
          const heard =
            frame.frequency !== null && frame.clarity >= CLARITY_THRESHOLD && frame.rms >= MIN_RMS
              ? Math.round(midiOfFrequency(frame.frequency))
              : null;
          onFrame({ midi: heard, level: levelOfRms(frame.rms) });
        }
        if (midi !== null) listener({ midi, source: 'microphone', time });
      };
      handle = scheduler.request(step);
    },
    stop() {
      if (!running) return;
      running = false;
      scheduler.cancel(handle);
    },
  };
}
