import { writeFakeMicrophoneWav } from './fakeMicrophone';

/** Runs once before the browsers start. */
export default function globalSetup(): void {
  writeFakeMicrophoneWav();
}
