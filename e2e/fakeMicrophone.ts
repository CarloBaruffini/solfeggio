import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

/**
 * Audio file that Chromium plays as its fake microphone (it loops it):
 * a piano-like A4, struck every two seconds.
 */
export const FAKE_MICROPHONE_WAV = join(tmpdir(), 'solfeggio-e2e', 'microphone-a4.wav');

const SAMPLE_RATE = 48000;
const LOOP_SECONDS = 2;
const SOUNDING_SECONDS = 1.5;
const A4 = 440;

/** Writes {@link FAKE_MICROPHONE_WAV}: 16-bit mono PCM, the format Chromium expects. */
export function writeFakeMicrophoneWav(): void {
  const samples = new Int16Array(SAMPLE_RATE * LOOP_SECONDS);
  for (let i = 0; i < SAMPLE_RATE * SOUNDING_SECONDS; i++) {
    const t = i / SAMPLE_RATE;
    let value = 0;
    for (let n = 1; n <= 8; n++) value += Math.sin(2 * Math.PI * A4 * n * t) / n ** 1.1;
    samples[i] = Math.round(value * 0.25 * Math.exp(-t / 0.6) * 0x7fff);
  }

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + samples.byteLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write('data', 36);
  header.writeUInt32LE(samples.byteLength, 40);

  mkdirSync(dirname(FAKE_MICROPHONE_WAV), { recursive: true });
  writeFileSync(FAKE_MICROPHONE_WAV, Buffer.concat([header, Buffer.from(samples.buffer)]));
}
