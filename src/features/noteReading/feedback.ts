import type { SessionEvent } from '@/core/exercises/noteReading';
import type { NamingSystem } from '@/core/music';
import { pitchClassNames, pitchName } from '@/core/music';
import { t } from '@/i18n';

export type FeedbackTone = 'neutral' | 'correct' | 'wrong' | 'complete';

export interface Feedback {
  readonly text: string;
  readonly tone: FeedbackTone;
}

/** The message shown under the staff after the last event of the session. */
export function feedbackFor(event: SessionEvent, naming: NamingSystem): Feedback {
  switch (event.kind) {
    case 'roundStarted':
      return { text: t.feedback.start, tone: 'neutral' };
    case 'correct':
      return { text: t.feedback.correct(pitchName(event.pitch, naming)), tone: 'correct' };
    case 'wrong': {
      const played = pitchClassNames(event.played, naming).join('/');
      return {
        text: event.hint
          ? t.feedback.wrongWithHint(played, pitchName(event.expected, naming))
          : t.feedback.wrong(played),
        tone: 'wrong',
      };
    }
    case 'roundComplete':
      return { text: t.feedback.roundComplete(event.firstAttempt, event.total), tone: 'complete' };
  }
}
