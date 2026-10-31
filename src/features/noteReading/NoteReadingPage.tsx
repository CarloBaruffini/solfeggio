import { Suspense, lazy, useCallback, useEffect, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { Piano } from '@/components/Piano';
import type { NoteReadingOptions } from '@/core/exercises/noteReading';
import { midiInOctave } from '@/core/music';
import type { Settings } from '@/features/settings';
import { useSettingsStore } from '@/features/settings';
import { t } from '@/i18n';
import { COMPUTER_KEY_LAYOUT, computerKeyLabel, createComputerKeyboardSource } from '@/input';

import { feedbackFor } from './feedback';
import styles from './NoteReadingPage.module.css';
import { NoteReadingSettings } from './NoteReadingSettings';
import { notesPerRound } from './noteCount';
import { useRecordsStore } from './recordsStore';
import { SessionStats } from './SessionStats';
import { useNoteReadingSession } from './useNoteReadingSession';

// VexFlow and its embedded music font are large: load them in their own chunk while the
// rest of the page renders.
const StaffView = lazy(() =>
  import('@/notation').then((module) => ({ default: module.StaffView })),
);

/** Octave of the notes played with the on-screen piano (it has a single octave). */
const SCREEN_PIANO_OCTAVE = 4;

const KEYBOARD_HINT = COMPUTER_KEY_LAYOUT.map((key) => key.label).join(' ');

/** The note-reading exercise: settings, staff, feedback, piano and statistics. */
export function NoteReadingPage() {
  const settings = useSettingsStore(useShallow(({ update, ...current }): Settings => current));
  const updateSettings = useSettingsStore((store) => store.update);
  const bestStreak = useRecordsStore((records) => records.bestStreak);

  const staffSlot = useRef<HTMLDivElement>(null);
  const getNoteCount = useCallback(
    () => notesPerRound(staffSlot.current?.clientWidth ?? document.documentElement.clientWidth),
    [],
  );

  const { clef, ledgerLines, accidentals } = settings;
  const options = useMemo<NoteReadingOptions>(
    () => ({ clef, ledgerLines, accidentals }),
    [clef, ledgerLines, accidentals],
  );

  const session = useNoteReadingSession({ options, sound: settings.sound, getNoteCount });
  const { play, startRound } = session;

  useEffect(() => {
    const keyboard = createComputerKeyboardSource();
    keyboard.start(play);
    return () => {
      keyboard.stop();
    };
  }, [play]);

  const changeSettings = (patch: Partial<Settings>) => {
    updateSettings(patch);
    const next: NoteReadingOptions = { ...options, ...pickRoundOptions(patch) };
    if (
      next.clef !== clef ||
      next.ledgerLines !== ledgerLines ||
      next.accidentals !== accidentals
    ) {
      startRound(next);
    }
  };

  const { state, notes } = session;
  const feedback = feedbackFor(state.lastEvent, settings.naming);
  const position = Math.min(state.currentIndex + 1, state.notes.length);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t.app.title}</h1>
        <p className={styles.subtitle}>{t.app.subtitle}</p>
      </header>

      <NoteReadingSettings settings={settings} onChange={changeSettings} />

      <div ref={staffSlot}>
        <Suspense fallback={<div className={styles.staffPlaceholder} />}>
          <StaffView
            clef={clef}
            notes={notes}
            label={t.staff.label(clef, position, state.notes.length)}
          />
        </Suspense>
      </div>

      <p className={styles.feedback} data-tone={feedback.tone} aria-live="polite">
        {feedback.text}
      </p>

      <Piano
        label={t.piano.label}
        naming={settings.naming}
        showNames={settings.showKeyNames}
        keyHint={computerKeyLabel}
        hintPitchClass={session.hint}
        flash={session.flash}
        onPress={(pitchClass) => {
          play({
            midi: midiInOctave(pitchClass, SCREEN_PIANO_OCTAVE),
            source: 'screen',
            time: performance.now(),
          });
        }}
      />

      <SessionStats stats={state.stats} bestStreak={bestStreak} />

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.button}
          onClick={() => {
            startRound();
          }}
        >
          {t.actions.newRound}
        </button>
        <button type="button" className={styles.button} onClick={session.resetStats}>
          {t.actions.resetStats}
        </button>
      </div>

      <p className={styles.keyboardHint}>
        {t.keyboardHint} {KEYBOARD_HINT}
      </p>
    </main>
  );
}

function pickRoundOptions(patch: Partial<Settings>): Partial<NoteReadingOptions> {
  const { clef, ledgerLines, accidentals } = patch;
  return {
    ...(clef !== undefined && { clef }),
    ...(ledgerLines !== undefined && { ledgerLines }),
    ...(accidentals !== undefined && { accidentals }),
  };
}
