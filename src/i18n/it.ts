import type { Clef, LedgerLines, NamingSystem } from '@/core/music';

/** All UI strings. Add a sibling file with the same shape to translate the app. */
export const it = {
  app: {
    title: 'Lettura delle note',
    subtitle: 'Leggi la nota evidenziata sul pentagramma e suonala sulla tastiera.',
  },
  settings: {
    label: 'Impostazioni',
    clef: 'Chiave',
    clefs: { treble: 'Violino', bass: 'Basso', alto: 'Contralto' } satisfies Record<Clef, string>,
    ledgerLines: 'Tagli addizionali',
    ledgerLineOptions: { 0: 'Nessuno', 1: '1', 2: '2' } satisfies Record<LedgerLines, string>,
    naming: 'Nomi',
    namingOptions: { solfege: 'Do Re Mi', letter: 'C D E' } satisfies Record<NamingSystem, string>,
    accidentals: 'Alterazioni ♯ ♭',
    showKeyNames: 'Nomi sui tasti',
    sound: 'Suono',
  },
  staff: {
    label: (clef: Clef, position: number, total: number) =>
      `Pentagramma in chiave di ${it.settings.clefs[clef].toLowerCase()}, nota ${position} di ${total}`,
  },
  feedback: {
    start: 'Suona la nota evidenziata',
    correct: (note: string) => `✓ ${note}`,
    wrong: (played: string) => `✗ Hai suonato ${played} — riprova`,
    wrongWithHint: (played: string, expected: string) =>
      `✗ Hai suonato ${played} — la nota è ${expected}`,
    roundComplete: (firstAttempt: number, total: number) =>
      `Fatto! ${firstAttempt} su ${total} al primo colpo`,
  },
  piano: {
    label: 'Tastiera',
  },
  stats: {
    label: 'Statistiche',
    correct: 'Corrette',
    wrong: 'Errori',
    accuracy: 'Precisione',
    streak: 'Serie',
    bestStreak: 'Record serie',
    averageTime: 'Tempo medio',
    empty: '—',
  },
  actions: {
    newRound: 'Nuove note',
    resetStats: 'Azzera statistiche',
  },
  keyboardHint: 'Puoi suonare anche dalla tastiera del computer:',
} as const;

/** Locale used for number formatting. */
export const LOCALE = 'it-IT';
