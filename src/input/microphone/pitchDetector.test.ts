import { describe, expect, it } from 'vitest';

import { frequencyOfMidi, midiOfFrequency, pitchClassOfMidi } from '@/core/music';
import { createSeededRandom } from '@/core/random';
import type { Partial } from '@/test/signals';
import { noise, pianoLike, pluckedString, sawtooth, sine, synthesize } from '@/test/signals';

import { ANALYSIS_WINDOW, createPitchAnalyzer } from './pitchDetector';
import { CLARITY_THRESHOLD } from './noteTracker';

/** B♭1 (lowest note of the exercises, bass clef with two ledger lines) to D♯6 (highest). */
const LOWEST_MIDI = 34;
const HIGHEST_MIDI = 87;
const MIDI_RANGE = Array.from(
  { length: HIGHEST_MIDI - LOWEST_MIDI + 1 },
  (_, i) => LOWEST_MIDI + i,
);

const TIMBRES: Record<string, (frequency: number) => Partial[]> = {
  sine,
  sawtooth,
  pianoLike,
  pluckedString,
};

describe('createPitchAnalyzer', () => {
  for (const sampleRate of [44100, 48000]) {
    for (const [timbre, partials] of Object.entries(TIMBRES)) {
      it(`finds the pitch class of every note in range (${timbre}, ${sampleRate} Hz)`, () => {
        const analyzer = createPitchAnalyzer();
        const misses = MIDI_RANGE.filter((midi) => {
          const samples = synthesize(partials(frequencyOfMidi(midi)), {
            sampleRate,
            length: ANALYSIS_WINDOW,
            offset: 0.05,
            decay: 1.5,
          });
          const frame = analyzer.analyze(samples, sampleRate);
          return (
            frame.frequency === null ||
            frame.clarity < CLARITY_THRESHOLD ||
            pitchClassOfMidi(Math.round(midiOfFrequency(frame.frequency))) !==
              pitchClassOfMidi(midi)
          );
        });
        expect(misses).toEqual([]);
      });
    }
  }

  it('measures loudness as RMS', () => {
    const analyzer = createPitchAnalyzer();
    const samples = synthesize(sine(440), { sampleRate: 48000, length: ANALYSIS_WINDOW, peak: 1 });
    expect(analyzer.analyze(samples, 48000).rms).toBeCloseTo(Math.SQRT1_2, 2);
  });

  it('finds no clear pitch in noise or silence', () => {
    const analyzer = createPitchAnalyzer();
    const random = createSeededRandom(7);
    for (let i = 0; i < 20; i++) {
      const frame = analyzer.analyze(noise(random, ANALYSIS_WINDOW), 48000);
      expect(frame.frequency === null || frame.clarity < CLARITY_THRESHOLD).toBe(true);
    }
    const silence = analyzer.analyze(new Float32Array(ANALYSIS_WINDOW), 48000);
    expect(silence).toEqual({ frequency: null, clarity: 0, rms: 0 });
  });
});
