import { describe, expect, it } from 'vitest';

import { midiNumber, parsePitch } from '@/core/music';

import type { SessionAction, SessionState } from './session';
import {
  createSession,
  currentNote,
  hintPitchClass,
  isRoundComplete,
  noteDisplayStates,
  sessionReducer,
} from './session';

const pitches = ['G4', 'C#5', 'Bb3'].map(parsePitch);
const [G4, CS5, BB3] = pitches.map(midiNumber) as [number, number, number];
const A4 = midiNumber(parsePitch('A4'));

function run(state: SessionState, ...actions: SessionAction[]) {
  return actions.reduce(sessionReducer, state);
}

const answer = (midi: number, at = 0): SessionAction => ({ type: 'answer', midi, at });

describe('sessionReducer', () => {
  it('starts on the first note', () => {
    const state = createSession(pitches, 0);
    expect(currentNote(state)?.pitch).toEqual(pitches[0]);
    expect(noteDisplayStates(state)).toEqual(['current', 'pending', 'pending']);
    expect(state.lastEvent).toEqual({ kind: 'roundStarted' });
  });

  it('advances on a correct answer and records the response time', () => {
    const state = run(createSession(pitches, 1000), answer(G4, 2500));
    expect(state.currentIndex).toBe(1);
    expect(state.currentSince).toBe(2500);
    expect(state.stats).toMatchObject({ correct: 1, streak: 1, totalResponseMs: 1500 });
    expect(state.lastEvent).toEqual({ kind: 'correct', pitch: pitches[0] });
  });

  it('compares answers by pitch class, in any octave', () => {
    const state = run(createSession(pitches, 0), answer(G4 + 24));
    expect(state.currentIndex).toBe(1);
  });

  it('accepts the enharmonic key for an accidental (D♭ for C♯)', () => {
    const state = run(createSession(pitches, 0), answer(G4), answer(CS5));
    expect(state.currentIndex).toBe(2);
  });

  it('keeps the note current on a wrong answer and marks it missed', () => {
    const state = run(createSession(pitches, 0), answer(A4));
    expect(state.currentIndex).toBe(0);
    expect(state.stats).toMatchObject({ wrong: 1, streak: 0 });
    expect(state.lastEvent).toEqual({
      kind: 'wrong',
      expected: pitches[0],
      played: 9,
      hint: false,
    });

    const answered = run(state, answer(G4));
    expect(noteDisplayStates(answered)).toEqual(['missed', 'current', 'pending']);
    expect(answered.stats.streak).toBe(0);
  });

  it('reveals the correct key after two wrong attempts on the same note', () => {
    const once = run(createSession(pitches, 0), answer(A4));
    expect(hintPitchClass(once)).toBeNull();
    const twice = run(once, answer(A4));
    expect(hintPitchClass(twice)).toBe(7);
    expect(twice.lastEvent).toMatchObject({ kind: 'wrong', hint: true });
    expect(hintPitchClass(run(twice, answer(G4)))).toBeNull();
  });

  it('completes the round and ignores further answers', () => {
    const done = run(createSession(pitches, 0), answer(A4), answer(G4), answer(CS5), answer(BB3));
    expect(isRoundComplete(done)).toBe(true);
    expect(done.lastEvent).toEqual({
      kind: 'roundComplete',
      pitch: pitches[2],
      firstAttempt: 2,
      total: 3,
    });
    expect(noteDisplayStates(done)).toEqual(['missed', 'correct', 'correct']);
    expect(run(done, answer(A4))).toBe(done);
  });

  it('keeps statistics across rounds and resets them on demand', () => {
    const played = run(createSession(pitches, 0), answer(G4), answer(A4));
    const next = run(played, { type: 'startRound', pitches: pitches.slice(0, 1), at: 10 });
    expect(next.stats).toEqual(played.stats);
    expect(next.currentIndex).toBe(0);
    expect(next.notes).toHaveLength(1);
    expect(run(next, { type: 'resetStats' }).stats.correct).toBe(0);
  });
});
