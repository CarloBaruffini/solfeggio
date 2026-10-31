/** Running statistics of a note-reading session. See docs/features/note-reading.md. */
export interface ReadingStats {
  /** Correct key presses. */
  readonly correct: number;
  /** Wrong key presses. */
  readonly wrong: number;
  /** Consecutive notes answered right at the first attempt. */
  readonly streak: number;
  /** Sum of the response times of answered notes, in milliseconds. */
  readonly totalResponseMs: number;
  /** Number of notes included in {@link totalResponseMs}. */
  readonly answeredNotes: number;
}

export const EMPTY_STATS: ReadingStats = {
  correct: 0,
  wrong: 0,
  streak: 0,
  totalResponseMs: 0,
  answeredNotes: 0,
};

/** Records a correct answer given `responseMs` after the note became current. */
export function withCorrectAnswer(
  stats: ReadingStats,
  responseMs: number,
  firstAttempt: boolean,
): ReadingStats {
  return {
    ...stats,
    correct: stats.correct + 1,
    streak: firstAttempt ? stats.streak + 1 : stats.streak,
    totalResponseMs: stats.totalResponseMs + Math.max(0, responseMs),
    answeredNotes: stats.answeredNotes + 1,
  };
}

/** Records a wrong key press; it breaks the streak. */
export function withWrongAnswer(stats: ReadingStats): ReadingStats {
  return { ...stats, wrong: stats.wrong + 1, streak: 0 };
}

/** Share of correct presses in `[0, 1]`, or `null` before the first press. */
export function accuracy(stats: ReadingStats): number | null {
  const presses = stats.correct + stats.wrong;
  return presses === 0 ? null : stats.correct / presses;
}

/** Mean response time in milliseconds, or `null` before the first answered note. */
export function averageResponseMs(stats: ReadingStats): number | null {
  return stats.answeredNotes === 0 ? null : stats.totalResponseMs / stats.answeredNotes;
}
