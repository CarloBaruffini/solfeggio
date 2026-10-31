import { StatCard } from '@/components/StatCard';
import type { ReadingStats } from '@/core/exercises/noteReading';
import { accuracy, averageResponseMs } from '@/core/exercises/noteReading';
import { LOCALE, t } from '@/i18n';

import styles from './NoteReadingPage.module.css';

const percent = new Intl.NumberFormat(LOCALE, { style: 'percent' });
const seconds = new Intl.NumberFormat(LOCALE, {
  style: 'unit',
  unit: 'second',
  unitDisplay: 'short',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export interface SessionStatsProps {
  readonly stats: ReadingStats;
  readonly bestStreak: number;
}

/** The statistics row under the keyboard. */
export function SessionStats({ stats, bestStreak }: SessionStatsProps) {
  const accuracyValue = accuracy(stats);
  const averageMs = averageResponseMs(stats);
  return (
    <section aria-label={t.stats.label}>
      <dl className={styles.stats}>
        <StatCard label={t.stats.correct} value={String(stats.correct)} />
        <StatCard label={t.stats.wrong} value={String(stats.wrong)} />
        <StatCard
          label={t.stats.accuracy}
          value={accuracyValue === null ? t.stats.empty : percent.format(accuracyValue)}
        />
        <StatCard label={t.stats.streak} value={String(stats.streak)} />
        <StatCard label={t.stats.bestStreak} value={String(bestStreak)} />
        <StatCard
          label={t.stats.averageTime}
          value={averageMs === null ? t.stats.empty : seconds.format(averageMs / 1000)}
        />
      </dl>
    </section>
  );
}
