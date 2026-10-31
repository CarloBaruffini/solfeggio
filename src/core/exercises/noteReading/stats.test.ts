import { describe, expect, it } from 'vitest';

import {
  EMPTY_STATS,
  accuracy,
  averageResponseMs,
  withCorrectAnswer,
  withWrongAnswer,
} from './stats';

describe('stats', () => {
  it('has no accuracy or average before the first press', () => {
    expect(accuracy(EMPTY_STATS)).toBeNull();
    expect(averageResponseMs(EMPTY_STATS)).toBeNull();
  });

  it('counts first-attempt answers in the streak', () => {
    let stats = withCorrectAnswer(EMPTY_STATS, 1000, true);
    stats = withCorrectAnswer(stats, 3000, true);
    expect(stats).toMatchObject({ correct: 2, streak: 2, answeredNotes: 2 });
    expect(averageResponseMs(stats)).toBe(2000);
  });

  it('resets the streak on a wrong press, and a late correct answer does not extend it', () => {
    let stats = withCorrectAnswer(EMPTY_STATS, 500, true);
    stats = withWrongAnswer(stats);
    expect(stats.streak).toBe(0);
    stats = withCorrectAnswer(stats, 500, false);
    expect(stats).toMatchObject({ correct: 2, wrong: 1, streak: 0 });
    expect(accuracy(stats)).toBeCloseTo(2 / 3);
  });

  it('ignores negative response times', () => {
    expect(withCorrectAnswer(EMPTY_STATS, -50, true).totalResponseMs).toBe(0);
  });
});
