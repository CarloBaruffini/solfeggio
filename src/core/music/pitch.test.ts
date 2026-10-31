import { describe, expect, it } from 'vitest';

import {
  diatonicIndex,
  formatPitch,
  frequencyOfMidi,
  isBlackKey,
  midiInOctave,
  midiNumber,
  parsePitch,
  pitchClass,
  pitchClassOfMidi,
  pitchFromDiatonicIndex,
  spellingsOfPitchClass,
} from './pitch';

describe('parsePitch / formatPitch', () => {
  it.each(['C4', 'F#5', 'Bb3', 'G-1', 'A0'])('round-trips %s', (text) => {
    expect(formatPitch(parsePitch(text))).toBe(text);
  });

  it('rejects invalid input', () => {
    expect(() => parsePitch('H2')).toThrow();
    expect(() => parsePitch('C')).toThrow();
  });
});

describe('midiNumber', () => {
  it.each([
    ['C4', 60],
    ['A4', 69],
    ['C#4', 61],
    ['Db4', 61],
    ['B3', 59],
    ['A0', 21],
    ['C8', 108],
  ])('%s is MIDI %i', (text, midi) => {
    expect(midiNumber(parsePitch(text))).toBe(midi);
  });
});

describe('pitchClass', () => {
  it('treats enharmonic spellings as the same pitch class', () => {
    expect(pitchClass(parsePitch('C#4'))).toBe(1);
    expect(pitchClass(parsePitch('Db2'))).toBe(1);
  });

  it('wraps around the octave', () => {
    expect(pitchClass(parsePitch('B4'))).toBe(11);
    expect(pitchClass(parsePitch('Bb4'))).toBe(10);
  });

  it('matches the pitch class of the MIDI number', () => {
    for (const text of ['C4', 'F#3', 'Ab5', 'E2', 'Bb1']) {
      const pitch = parsePitch(text);
      expect(pitchClassOfMidi(midiNumber(pitch))).toBe(pitchClass(pitch));
    }
  });
});

describe('diatonicIndex', () => {
  it('counts lines and spaces, ignoring accidentals', () => {
    expect(diatonicIndex(parsePitch('E4'))).toBe(30);
    expect(diatonicIndex(parsePitch('F4'))).toBe(31);
    expect(diatonicIndex(parsePitch('F#4'))).toBe(31);
    expect(diatonicIndex(parsePitch('C5'))).toBe(35);
  });

  it('is inverted by pitchFromDiatonicIndex', () => {
    for (let index = 0; index < 60; index++) {
      expect(diatonicIndex(pitchFromDiatonicIndex(index))).toBe(index);
    }
  });
});

describe('piano keys', () => {
  it('knows which pitch classes are black keys', () => {
    const black = Array.from({ length: 12 }, (_, pc) => pc).filter(isBlackKey);
    expect(black).toEqual([1, 3, 6, 8, 10]);
  });

  it('spells black keys as sharp then flat', () => {
    expect(spellingsOfPitchClass(6)).toEqual([
      { letter: 3, accidental: 1 },
      { letter: 4, accidental: -1 },
    ]);
  });

  it('places a pitch class in an octave', () => {
    expect(midiInOctave(0, 4)).toBe(60);
    expect(midiInOctave(9, 4)).toBe(69);
    expect(midiInOctave(11, 2)).toBe(47);
  });
});

describe('frequencyOfMidi', () => {
  it('tunes A4 to 440 Hz and doubles every octave', () => {
    expect(frequencyOfMidi(69)).toBe(440);
    expect(frequencyOfMidi(81)).toBe(880);
    expect(frequencyOfMidi(60)).toBeCloseTo(261.63, 2);
  });
});
