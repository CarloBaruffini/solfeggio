import type { Random } from '@/core/random';

/**
 * Synthetic instrument signals for testing pitch detection without a microphone.
 * Each partial is `amplitude * sin(2π · frequency · t)`, with an optional decay.
 */

export interface Partial {
  readonly frequency: number;
  readonly amplitude: number;
}

export interface SignalOptions {
  readonly sampleRate: number;
  readonly length: number;
  /** Seconds after the attack at which the window starts. */
  readonly offset?: number;
  /** Seconds for the amplitude to fall by a factor of e; no decay when omitted. */
  readonly decay?: number;
  /** Peak amplitude of the result (full scale = 1). */
  readonly peak?: number;
}

/** Sums partials into a window of samples, normalised to `peak`. */
export function synthesize(
  partials: readonly Partial[],
  { sampleRate, length, offset = 0, decay, peak = 0.5 }: SignalOptions,
): Float32Array {
  const samples = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const t = offset + i / sampleRate;
    const envelope = decay === undefined ? 1 : Math.exp(-t / decay);
    let value = 0;
    for (const { frequency, amplitude } of partials) {
      if (frequency < sampleRate / 2) value += amplitude * Math.sin(2 * Math.PI * frequency * t);
    }
    samples[i] = value * envelope;
  }
  const max = samples.reduce((acc, value) => Math.max(acc, Math.abs(value)), 0);
  return max === 0 ? samples : samples.map((value) => (value / max) * peak);
}

export const sine = (frequency: number): Partial[] => [{ frequency, amplitude: 1 }];

/** A band-limited sawtooth: every harmonic, with amplitude 1/n. */
export const sawtooth = (frequency: number): Partial[] =>
  Array.from({ length: 30 }, (_, i) => ({
    frequency: frequency * (i + 1),
    amplitude: 1 / (i + 1),
  }));

/**
 * A piano-like tone: stretched (inharmonic) partials, and in the bass a fundamental weaker
 * than the second harmonic, as on real pianos.
 */
export const pianoLike = (frequency: number): Partial[] =>
  Array.from({ length: 16 }, (_, i) => {
    const n = i + 1;
    const inharmonicity = 0.0004;
    const weakFundamental = n === 1 && frequency < 110 ? 0.4 : 1;
    return {
      frequency: n * frequency * Math.sqrt(1 + inharmonicity * n * n),
      amplitude: (weakFundamental * 1) / n ** 1.1,
    };
  });

/** A plucked-string tone (guitar): harmonics shaped by plucking at a fifth of the string. */
export const pluckedString = (frequency: number): Partial[] =>
  Array.from({ length: 20 }, (_, i) => {
    const n = i + 1;
    return {
      frequency: n * frequency,
      amplitude: Math.abs(Math.sin(n * Math.PI * 0.2)) / n,
    };
  });

/** White noise, normalised to `peak`. */
export function noise(random: Random, length: number, peak = 0.5): Float32Array {
  return Float32Array.from({ length }, () => (random() * 2 - 1) * peak);
}
