import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Settings } from './settings';
import { DEFAULT_SETTINGS, sanitizeSettings } from './settings';

interface SettingsStore extends Settings {
  readonly update: (patch: Partial<Settings>) => void;
}

/** Persisted user settings (`localStorage` key `solfeggio:settings`). */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      update: (patch) => {
        set(patch);
      },
    }),
    {
      name: 'solfeggio:settings',
      version: 1,
      partialize: ({ update, ...settings }) => settings,
      merge: (persisted, current) => ({ ...current, ...sanitizeSettings(persisted) }),
    },
  ),
);
