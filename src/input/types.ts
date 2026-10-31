/** Which kind of device produced a note. */
export type NoteInputSourceKind = 'screen' | 'computerKeyboard' | 'midi' | 'microphone';

/** A note played by the user, whatever the device. */
export interface NoteInputEvent {
  /** MIDI note number. Devices without octave information use octave 4 (C4 = 60). */
  readonly midi: number;
  readonly source: NoteInputSourceKind;
  /** `performance.now()` timestamp of the event, in milliseconds. */
  readonly time: number;
}

export type NoteInputListener = (event: NoteInputEvent) => void;

/**
 * A device that produces notes (computer keyboard, MIDI keyboard, microphone…).
 * See docs/decisions/0004-framework-agnostic-core.md.
 */
export interface NoteInputSource {
  readonly kind: NoteInputSourceKind;
  /** Starts listening; `listener` is called for every note-on. */
  start(listener: NoteInputListener): void;
  /** Stops listening and releases the device. */
  stop(): void;
}
