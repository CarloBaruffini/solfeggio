import { use, useLayoutEffect, useRef } from 'react';

import type { Clef, Pitch } from '@/core/music';
import { pitchClass } from '@/core/music';

import { loadNotationFonts } from './fonts';
import { renderStaff } from './renderStaff';
import styles from './StaffView.module.css';
import { useElementWidth } from './useElementWidth';

/** How a note is drawn: still to play, to play now, played right, played after mistakes. */
export type StaffNoteState = 'pending' | 'current' | 'correct' | 'missed';

export interface StaffViewNote {
  readonly pitch: Pitch;
  readonly state: StaffNoteState;
}

/** Note colours. The staff is always drawn on light paper, so they do not follow the theme. */
export const STAFF_NOTE_COLORS: Record<StaffNoteState, string> = {
  pending: '#1f1c18',
  current: '#2d5b8c',
  correct: '#2e7d4f',
  missed: '#c2412d',
};

export interface StaffViewProps {
  readonly clef: Clef;
  /** Notes in reading order; at most one should be `current`. */
  readonly notes: readonly StaffViewNote[];
  /** Accessible description of the staff. */
  readonly label: string;
}

/**
 * A staff with a highlighted current note. Suspends until the music font is loaded,
 * so render it inside a `<Suspense>` boundary.
 */
export function StaffView({ clef, notes, label }: StaffViewProps) {
  use(loadNotationFonts());
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const targetRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const previousIndex = useRef(-1);

  const currentIndex = notes.findIndex((note) => note.state === 'current');
  const current = notes[currentIndex];

  useLayoutEffect(() => {
    const target = targetRef.current;
    const cursor = cursorRef.current;
    if (!target || !cursor || width === 0) return;

    const layout = renderStaff(target, {
      width,
      clef,
      notes: notes.map((note) => ({ pitch: note.pitch, color: STAFF_NOTE_COLORS[note.state] })),
    });

    const center = layout.noteCenters[currentIndex];
    cursor.hidden = center === undefined;
    if (center !== undefined) {
      // Slide forward between notes; jump when a new round starts or on resize.
      cursor.style.transition = currentIndex > previousIndex.current ? '' : 'none';
      cursor.style.left = `${center}px`;
    }
    previousIndex.current = currentIndex;
  }, [width, clef, notes, currentIndex]);

  return (
    <div
      ref={containerRef}
      className={styles.card}
      role="img"
      aria-label={label}
      data-testid="staff"
      data-current-pitch-class={current ? pitchClass(current.pitch) : undefined}
    >
      <div ref={cursorRef} className={styles.cursor} hidden aria-hidden="true" />
      <div ref={targetRef} className={styles.target} />
    </div>
  );
}
