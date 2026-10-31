import { frequencyOfMidi } from '@/core/music';

/** Partials of the voice: frequency multiple, oscillator type and relative gain. */
const PARTIALS: readonly [number, OscillatorType, number][] = [
  [1, 'triangle', 1],
  [2, 'sine', 0.35],
  [3, 'sine', 0.12],
  [4, 'sine', 0.05],
];

const PEAK_GAIN = 0.3;
const DURATION_S = 1.9;

/**
 * Schedules a short, piano-like synthesized note: a few harmonic partials through a
 * closing low-pass filter, with a fast attack and an exponential decay.
 */
export function playPianoVoice(
  context: BaseAudioContext,
  destination: AudioNode,
  midi: number,
  when: number,
): void {
  const frequency = frequencyOfMidi(midi);

  const envelope = context.createGain();
  envelope.gain.setValueAtTime(0.0001, when);
  envelope.gain.exponentialRampToValueAtTime(PEAK_GAIN, when + 0.008);
  envelope.gain.exponentialRampToValueAtTime(0.08, when + 0.4);
  envelope.gain.exponentialRampToValueAtTime(0.0001, when + DURATION_S - 0.1);

  const lowPass = context.createBiquadFilter();
  lowPass.type = 'lowpass';
  lowPass.frequency.setValueAtTime(Math.min(9000, frequency * 10), when);
  lowPass.frequency.exponentialRampToValueAtTime(Math.max(200, frequency * 2), when + 1.2);
  lowPass.connect(envelope).connect(destination);

  for (const [multiple, type, gain] of PARTIALS) {
    const oscillator = context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency * multiple;
    const partialGain = context.createGain();
    partialGain.gain.value = gain;
    oscillator.connect(partialGain).connect(lowPass);
    oscillator.start(when);
    oscillator.stop(when + DURATION_S);
  }
}
