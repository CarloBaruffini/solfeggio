import { playPianoVoice } from './pianoVoice';

/**
 * Owns the app's single `AudioContext` and plays notes on it.
 *
 * Browsers only allow audio after a user gesture, so the context is created lazily on
 * the first note (which is always triggered by a key press) and resumed if suspended.
 */
export class AudioEngine {
  private context: AudioContext | null = null;

  /** Plays a note now. Does nothing where Web Audio is unavailable. */
  playNote(midi: number): void {
    const context = this.ensureContext();
    if (!context) return;
    playPianoVoice(context, context.destination, midi, context.currentTime);
  }

  private ensureContext(): AudioContext | null {
    if (typeof AudioContext === 'undefined') return null;
    this.context ??= new AudioContext({ latencyHint: 'interactive' });
    if (this.context.state === 'suspended') void this.context.resume();
    return this.context;
  }
}

/** Shared engine: one AudioContext for the whole app. */
export const audioEngine = new AudioEngine();
