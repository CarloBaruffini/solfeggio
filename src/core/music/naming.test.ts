import { describe, expect, it } from 'vitest';

import { pitchClassNames, pitchName } from './naming';
import { parsePitch } from './pitch';

describe('pitchName', () => {
  it('uses solfège or letter names', () => {
    expect(pitchName(parsePitch('G4'), 'solfege')).toBe('Sol');
    expect(pitchName(parsePitch('G4'), 'letter')).toBe('G');
  });

  it('appends the accidental symbol', () => {
    expect(pitchName(parsePitch('F#3'), 'solfege')).toBe('Fa♯');
    expect(pitchName(parsePitch('Bb3'), 'letter')).toBe('B♭');
  });
});

describe('pitchClassNames', () => {
  it('gives one name for white keys and two for black keys', () => {
    expect(pitchClassNames(0, 'solfege')).toEqual(['Do']);
    expect(pitchClassNames(1, 'solfege')).toEqual(['Do♯', 'Re♭']);
    expect(pitchClassNames(10, 'letter')).toEqual(['A♯', 'B♭']);
  });
});
