import type { PitchClass } from '@/core/music';
import { midiInOctave } from '@/core/music';

import type { NoteInputSource } from './types';

/** A computer key mapped to a note. */
export interface ComputerKeyMapping {
  /** `KeyboardEvent.code`: the physical key, independent of the keyboard layout. */
  readonly code: string;
  /** Label printed on a QWERTY keyboard, shown as a hint. */
  readonly label: string;
  readonly pitchClass: PitchClass;
}

/**
 * One octave on the home row, like a DAW's typing keyboard:
 * white keys on A S D F G H J, black keys on W E T Y U.
 */
export const COMPUTER_KEY_LAYOUT: readonly ComputerKeyMapping[] = [
  'A',
  'W',
  'S',
  'E',
  'D',
  'F',
  'T',
  'G',
  'Y',
  'H',
  'U',
  'J',
].map((label, pitchClass) => ({ code: `Key${label}`, label, pitchClass }));

const PITCH_CLASS_BY_CODE = new Map(COMPUTER_KEY_LAYOUT.map((key) => [key.code, key.pitchClass]));

/** The QWERTY label of the key that plays `pitchClass`. */
export function computerKeyLabel(pitchClass: PitchClass): string | undefined {
  return COMPUTER_KEY_LAYOUT[pitchClass]?.label;
}

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName))
  );
}

export interface ComputerKeyboardOptions {
  /** Element that receives key events. Defaults to `window`. */
  readonly target?: Pick<EventTarget, 'addEventListener' | 'removeEventListener'>;
  /** Octave of the emitted notes. Defaults to 4. */
  readonly octave?: number;
}

/**
 * Plays notes from the computer keyboard (see {@link COMPUTER_KEY_LAYOUT}).
 * Ignores auto-repeat, shortcuts with Cmd/Ctrl/Alt and typing in form fields.
 */
export function createComputerKeyboardSource(
  options: ComputerKeyboardOptions = {},
): NoteInputSource {
  const target = options.target ?? window;
  const octave = options.octave ?? 4;
  let handler: ((event: Event) => void) | null = null;

  return {
    kind: 'computerKeyboard',
    start(listener) {
      this.stop();
      handler = (event) => {
        if (!(event instanceof KeyboardEvent)) return;
        if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
        if (isTypingTarget(event.target)) return;
        const pitchClass = PITCH_CLASS_BY_CODE.get(event.code);
        if (pitchClass === undefined) return;
        event.preventDefault();
        listener({
          midi: midiInOctave(pitchClass, octave),
          source: 'computerKeyboard',
          time: performance.now(),
        });
      };
      target.addEventListener('keydown', handler);
    },
    stop() {
      if (handler) target.removeEventListener('keydown', handler);
      handler = null;
    },
  };
}
