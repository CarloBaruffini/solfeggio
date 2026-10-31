import { useEffect, useRef } from 'react';

import type { NamingSystem, PitchClass } from '@/core/music';
import { PITCH_CLASSES, isBlackKey, pitchClassNames } from '@/core/music';

import styles from './Piano.module.css';

export type PianoKeyResult = 'correct' | 'wrong';

/** A brief colour feedback on one key. */
export interface PianoFlash {
  readonly pitchClass: PitchClass;
  readonly result: PianoKeyResult;
}

export interface PianoProps {
  /** Accessible name of the keyboard. */
  readonly label: string;
  readonly naming: NamingSystem;
  /** Whether note names are printed on the keys. */
  readonly showNames: boolean;
  /** Optional short hint printed on each key, e.g. the computer key that plays it. */
  readonly keyHint?: (pitchClass: PitchClass) => string | undefined;
  /** Key that pulses to suggest the answer. */
  readonly hintPitchClass?: PitchClass | null;
  /** Colours a key for a moment; pass a new object to show it again. */
  readonly flash?: PianoFlash | null;
  readonly onPress: (pitchClass: PitchClass) => void;
}

const FLASH_MS = 260;
const WHITE_KEYS_PER_OCTAVE = 7;

/** One octave of piano keys (C to B). Keys respond on pointer down for low latency. */
export function Piano({
  label,
  naming,
  showNames,
  keyHint,
  hintPitchClass = null,
  flash = null,
  onPress,
}: PianoProps) {
  const keys = useRef(new Map<PitchClass, HTMLButtonElement>());

  useEffect(() => {
    if (!flash) return;
    const key = keys.current.get(flash.pitchClass);
    if (!key) return;
    key.setAttribute('data-flash', flash.result);
    const timer = setTimeout(() => {
      key.removeAttribute('data-flash');
    }, FLASH_MS);
    return () => {
      clearTimeout(timer);
      key.removeAttribute('data-flash');
    };
  }, [flash]);

  let whiteKeysBefore = 0;
  return (
    <div className={styles.piano} role="group" aria-label={label} data-show-names={showNames}>
      {PITCH_CLASSES.map((pitchClass) => {
        const black = isBlackKey(pitchClass);
        if (!black) whiteKeysBefore++;
        const names = pitchClassNames(pitchClass, naming);
        const hint = keyHint?.(pitchClass);
        return (
          <button
            key={pitchClass}
            ref={(element) => {
              if (element) keys.current.set(pitchClass, element);
              return () => {
                keys.current.delete(pitchClass);
              };
            }}
            type="button"
            className={black ? styles.blackKey : styles.whiteKey}
            style={
              black
                ? { left: `calc(100% / ${WHITE_KEYS_PER_OCTAVE} * (${whiteKeysBefore} - 0.3))` }
                : undefined
            }
            aria-label={names.join(' / ')}
            data-hint={pitchClass === hintPitchClass ? true : undefined}
            onPointerDown={(event) => {
              event.preventDefault();
              onPress(pitchClass);
            }}
            onClick={(event) => {
              // Keyboard activation (Enter / Space) produces a click with detail 0.
              if (event.detail === 0) onPress(pitchClass);
            }}
          >
            <span className={styles.name} aria-hidden="true">
              {names.map((name) => (
                <span key={name}>{name}</span>
              ))}
            </span>
            {hint && (
              <span className={styles.keyHint} aria-hidden="true">
                {hint}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
