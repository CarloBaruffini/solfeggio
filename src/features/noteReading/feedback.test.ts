import { describe, expect, it } from 'vitest';

import { parsePitch } from '@/core/music';

import { feedbackFor } from './feedback';

describe('feedbackFor', () => {
  it('invites to play at the start of a round', () => {
    expect(feedbackFor({ kind: 'roundStarted' }, 'solfege')).toEqual({
      text: 'Suona la nota evidenziata',
      tone: 'neutral',
    });
  });

  it('names the note after a correct answer', () => {
    expect(feedbackFor({ kind: 'correct', pitch: parsePitch('Bb4') }, 'solfege').text).toBe(
      '✓ Si♭',
    );
  });

  it('names the key played, and the expected note once the hint is due', () => {
    const expected = parsePitch('G4');
    expect(feedbackFor({ kind: 'wrong', expected, played: 1, hint: false }, 'letter').text).toBe(
      '✗ Hai suonato C♯/D♭ — riprova',
    );
    expect(feedbackFor({ kind: 'wrong', expected, played: 9, hint: true }, 'solfege').text).toBe(
      '✗ Hai suonato La — la nota è Sol',
    );
  });

  it('summarises a completed round', () => {
    const event = {
      kind: 'roundComplete',
      pitch: parsePitch('C4'),
      firstAttempt: 6,
      total: 8,
    } as const;
    expect(feedbackFor(event, 'solfege')).toEqual({
      text: 'Fatto! 6 su 8 al primo colpo',
      tone: 'complete',
    });
  });
});
