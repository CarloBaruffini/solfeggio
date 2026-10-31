import {
  Accidental,
  Formatter,
  Renderer,
  Stave,
  StaveNote,
  Voice,
  VoiceMode,
} from 'vexflow/bravura';

import type { Clef, Pitch } from '@/core/music';

/** A note to draw, with its colour. */
export interface StaffNote {
  readonly pitch: Pitch;
  readonly color: string;
}

export interface RenderStaffOptions {
  /** Available width in CSS pixels. */
  readonly width: number;
  readonly clef: Clef;
  readonly notes: readonly StaffNote[];
}

export interface StaffLayout {
  /** Horizontal centre of each note head, in CSS pixels from the left edge of the target. */
  readonly noteCenters: readonly number[];
  /** Rendered height in CSS pixels. */
  readonly height: number;
}

/** Unscaled height: the staff plus two ledger lines and stems above and below it. */
const LOGICAL_HEIGHT = 134;
const STAVE_TOP = 4;
const SIDE_MARGIN = 10;

/** Zoom applied to VexFlow's default staff size; smaller on narrow screens. */
export function staffScale(width: number): number {
  return width < 480 ? 1.3 : 1.65;
}

/** Rendered height of the staff for a given width, in CSS pixels. */
export function staffHeight(width: number): number {
  return Math.round(LOGICAL_HEIGHT * staffScale(width));
}

function vexflowKey(pitch: Pitch): string {
  const accidental = pitch.accidental === 1 ? '#' : pitch.accidental === -1 ? 'b' : '';
  return `${'cdefgab'.charAt(pitch.letter)}${accidental}/${pitch.octave}`;
}

/**
 * Draws a stave with `clef` and `notes` (quarter notes, evenly spaced) into `target` as SVG,
 * replacing its previous content. VexFlow sets the width of `target`: measure its parent.
 */
export function renderStaff(
  target: HTMLDivElement,
  { width, clef, notes }: RenderStaffOptions,
): StaffLayout {
  target.replaceChildren();
  const scale = staffScale(width);
  const height = staffHeight(width);

  const renderer = new Renderer(target, Renderer.Backends.SVG);
  renderer.resize(width, height);
  const context = renderer.getContext();
  context.scale(scale, scale);

  const stave = new Stave(SIDE_MARGIN, STAVE_TOP, width / scale - 2 * SIDE_MARGIN);
  stave.addClef(clef);
  stave.setContext(context).draw();

  if (notes.length === 0) return { noteCenters: [], height };

  const staveNotes = notes.map(({ pitch, color }) => {
    const style = { fillStyle: color, strokeStyle: color };
    const note = new StaveNote({ clef, keys: [vexflowKey(pitch)], duration: 'q', autoStem: true });
    if (pitch.accidental !== 0) {
      note.addModifier(new Accidental(pitch.accidental === 1 ? '#' : 'b').setStyle(style), 0);
    }
    return note.setStyle(style);
  });

  const voice = new Voice({ numBeats: staveNotes.length, beatValue: 4 })
    .setMode(VoiceMode.SOFT)
    .addTickables(staveNotes);
  new Formatter().joinVoices([voice]).formatToStave([voice], stave);
  voice.draw(context, stave);

  return {
    noteCenters: staveNotes.map((note) => (note.getAbsoluteX() + note.getGlyphWidth() / 2) * scale),
    height,
  };
}
