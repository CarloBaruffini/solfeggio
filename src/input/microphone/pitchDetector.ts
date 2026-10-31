import { PitchDetector } from 'pitchy';

/**
 * Samples analysed per frame. At 48 kHz this is about 43 ms: long enough to hold two
 * periods of the lowest note in the exercises (B♭1, 58 Hz), short enough to answer quickly.
 */
export const ANALYSIS_WINDOW = 2048;

/** Detected frequencies outside this range (in hertz) are treated as no pitch. */
export const MIN_FREQUENCY = 50;
export const MAX_FREQUENCY = 2000;

/** What one analysis window contains. */
export interface PitchFrame {
  /** Fundamental frequency in hertz, or `null` when no pitch is found in range. */
  readonly frequency: number | null;
  /** How periodic the signal is, from 0 (noise) to 1 (a pure tone). */
  readonly clarity: number;
  /** Loudness as the root mean square of the samples (full scale = 1). */
  readonly rms: number;
}

export interface PitchAnalyzer {
  /** Analyses one window of samples; `samples.length` must equal the analyzer's window. */
  analyze(samples: Float32Array, sampleRate: number): PitchFrame;
}

/**
 * Creates a monophonic pitch analyzer (McLeod pitch method, via `pitchy`).
 * It keeps its buffers between calls, so analysing a frame does not allocate.
 * See docs/decisions/0006-microphone-pitch-detection.md.
 */
export function createPitchAnalyzer(windowSize = ANALYSIS_WINDOW): PitchAnalyzer {
  const detector = PitchDetector.forFloat32Array(windowSize);
  return {
    analyze(samples, sampleRate) {
      const rms = rootMeanSquare(samples);
      const [frequency, clarity] = detector.findPitch(samples, sampleRate);
      const inRange = frequency >= MIN_FREQUENCY && frequency <= MAX_FREQUENCY;
      return { frequency: inRange ? frequency : null, clarity: inRange ? clarity : 0, rms };
    },
  };
}

function rootMeanSquare(samples: Float32Array): number {
  let sum = 0;
  for (const sample of samples) sum += sample * sample;
  return Math.sqrt(sum / samples.length);
}
