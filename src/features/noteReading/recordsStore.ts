import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecordsStore {
  readonly bestStreak: number;
  /** Raises the best streak if `streak` beats it. */
  readonly recordStreak: (streak: number) => void;
  readonly reset: () => void;
}

/** Persisted personal records (`localStorage` key `solfeggio:records`). */
export const useRecordsStore = create<RecordsStore>()(
  persist(
    (set) => ({
      bestStreak: 0,
      recordStreak: (streak) => {
        set((state) => (streak > state.bestStreak ? { bestStreak: streak } : state));
      },
      reset: () => {
        set({ bestStreak: 0 });
      },
    }),
    {
      name: 'solfeggio:records',
      version: 1,
      partialize: ({ bestStreak }) => ({ bestStreak }),
      merge: (persisted, current) => {
        const best = (persisted as { bestStreak?: unknown } | null)?.bestStreak;
        return typeof best === 'number' && best >= 0 ? { ...current, bestStreak: best } : current;
      },
    },
  ),
);
