import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react';

import type { MicrophoneCapture, MicrophoneErrorKind } from '@/audio';
import { audioEngine, microphoneErrorKind } from '@/audio';
import type { MicrophoneFrame, NoteInputListener } from '@/input';
import { ANALYSIS_WINDOW, createMicrophoneSource } from '@/input';

/**
 * - `off`: the microphone setting is off.
 * - `needsGesture`: the setting is on, but browsers need a tap before audio can start
 *   (after a reload).
 * - `starting`: waiting for the permission prompt or the device.
 * - `listening`: notes played into the microphone are answers.
 * - otherwise, why the microphone could not be opened.
 */
export type MicrophoneStatus =
  'off' | 'needsGesture' | 'starting' | 'listening' | MicrophoneErrorKind;

export interface MicrophoneInput {
  readonly status: MicrophoneStatus;
  /** What the microphone hears, with the level rounded so the UI updates sparingly. */
  readonly heard: MicrophoneFrame;
  /** Opens the microphone. Call it from a user gesture (a tap or a key press). */
  readonly start: () => void;
  /** Closes the microphone. */
  readonly stop: () => void;
}

export interface MicrophoneInputArgs {
  /** The user's setting: whether the microphone should be listening. */
  readonly enabled: boolean;
  /** Called for every note played into the microphone. */
  readonly onNote: NoteInputListener;
}

const SILENT: MicrophoneFrame = { midi: null, level: 0 };
const LEVEL_STEPS = 12;

type Phase = 'idle' | 'starting' | 'listening' | MicrophoneErrorKind;

/**
 * Runs the microphone as a note input: opens it on request, feeds what it hears to
 * `onNote`, and releases it when stopped or when the component unmounts.
 */
export function useMicrophoneInput({ enabled, onNote }: MicrophoneInputArgs): MicrophoneInput {
  const [capture, setCapture] = useState<MicrophoneCapture | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [heard, setHeard] = useState(SILENT);
  const openCapture = useRef<MicrophoneCapture | null>(null);
  // Incremented by every start and stop, so a slow start that was cancelled is discarded.
  const request = useRef(0);
  const handleNote = useEffectEvent(onNote);

  const release = useCallback(() => {
    request.current++;
    openCapture.current?.close();
    openCapture.current = null;
  }, []);

  const stop = useCallback(() => {
    release();
    setCapture(null);
    setPhase('idle');
    setHeard(SILENT);
  }, [release]);

  const start = useCallback(() => {
    release();
    const current = request.current;
    setPhase('starting');
    audioEngine.openMicrophone(ANALYSIS_WINDOW).then(
      (opened) => {
        if (current !== request.current) {
          opened.close();
          return;
        }
        openCapture.current = opened;
        setCapture(opened);
        setPhase('listening');
      },
      (error: unknown) => {
        if (current === request.current) setPhase(microphoneErrorKind(error));
      },
    );
  }, [release]);

  useEffect(() => {
    if (!capture) return;
    let last = SILENT;
    const source = createMicrophoneSource(capture, {
      onFrame: ({ midi, level }) => {
        const next = { midi, level: Math.round(level * LEVEL_STEPS) / LEVEL_STEPS };
        if (next.midi === last.midi && next.level === last.level) return;
        last = next;
        setHeard(next);
      },
    });
    source.start((event) => {
      handleNote(event);
    });
    return () => {
      source.stop();
    };
  }, [capture]);

  useEffect(() => release, [release]);

  const status: MicrophoneStatus = !enabled ? 'off' : phase === 'idle' ? 'needsGesture' : phase;
  return { status, heard: status === 'listening' ? heard : SILENT, start, stop };
}
