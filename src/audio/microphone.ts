/** Why the microphone could not be opened. */
export type MicrophoneErrorKind = 'denied' | 'unavailable' | 'unsupported' | 'failed';

export class MicrophoneError extends Error {
  readonly kind: MicrophoneErrorKind;

  constructor(kind: MicrophoneErrorKind, options?: ErrorOptions) {
    super(`Microphone ${kind}`, options);
    this.name = 'MicrophoneError';
    this.kind = kind;
  }
}

/** Maps a `getUserMedia` failure to what the user can do about it. */
export function microphoneErrorKind(error: unknown): MicrophoneErrorKind {
  if (error instanceof MicrophoneError) return error.kind;
  if (!(error instanceof DOMException)) return 'failed';
  switch (error.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'denied';
    case 'NotFoundError':
    case 'NotReadableError':
    case 'OverconstrainedError':
      return 'unavailable';
    default:
      return 'failed';
  }
}

/** An open microphone, read one window of samples at a time. */
export interface MicrophoneCapture {
  readonly sampleRate: number;
  /** Copies the latest samples into `buffer`, whose length is the capture's window size. */
  readFrame(buffer: Float32Array<ArrayBuffer>): void;
  /** Stops the microphone (and the browser's recording indicator). */
  close(): void;
}

/**
 * Opens the microphone on `context` with the browser's voice processing turned off:
 * echo cancellation, noise suppression and automatic gain all distort musical pitch.
 * Throws a {@link MicrophoneError}.
 */
export async function openMicrophoneCapture(
  context: AudioContext,
  windowSize: number,
): Promise<MicrophoneCapture> {
  // Missing on insecure (non-HTTPS) pages and in old browsers, despite the DOM typings.
  const mediaDevices = navigator.mediaDevices as MediaDevices | undefined;
  if (!mediaDevices) throw new MicrophoneError('unsupported');
  let stream: MediaStream;
  try {
    stream = await mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
  } catch (error) {
    throw new MicrophoneError(microphoneErrorKind(error), { cause: error });
  }

  const input = context.createMediaStreamSource(stream);
  const analyser = new AnalyserNode(context, { fftSize: windowSize });
  // Some browsers only process nodes that reach the destination: connect through silence.
  const mute = new GainNode(context, { gain: 0 });
  input.connect(analyser).connect(mute).connect(context.destination);

  return {
    sampleRate: context.sampleRate,
    readFrame(buffer) {
      analyser.getFloatTimeDomainData(buffer);
    },
    close() {
      for (const track of stream.getTracks()) track.stop();
      input.disconnect();
      analyser.disconnect();
      mute.disconnect();
    },
  };
}
