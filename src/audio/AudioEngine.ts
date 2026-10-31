import type { MicrophoneCapture } from './microphone';
import { MicrophoneError, openMicrophoneCapture } from './microphone';
import { playPianoVoice } from './pianoVoice';

/**
 * Owns the app's single `AudioContext`: plays notes on it and captures the microphone.
 *
 * Browsers only allow audio after a user gesture, so the context is created lazily on
 * the first note or microphone request (always triggered by the user) and resumed if
 * suspended.
 */
export class AudioEngine {
  private context: AudioContext | null = null;

  /** Plays a note now. Does nothing where Web Audio is unavailable. */
  playNote(midi: number): void {
    const context = this.ensureContext();
    if (!context) return;
    playPianoVoice(context, context.destination, midi, context.currentTime);
  }

  /**
   * Opens the microphone, reading `windowSize` samples per frame. Call it from a user
   * gesture (it may resume the context and asks for permission). Throws a `MicrophoneError`.
   */
  async openMicrophone(windowSize: number): Promise<MicrophoneCapture> {
    const context = this.ensureContext();
    if (!context) throw new MicrophoneError('unsupported');
    return openMicrophoneCapture(context, windowSize);
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
