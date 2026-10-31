import { describe, expect, it } from 'vitest';

import { MicrophoneError, microphoneErrorKind } from './microphone';

describe('microphoneErrorKind', () => {
  it('maps getUserMedia failures to what the user can do', () => {
    const domError = (name: string) => new DOMException('', name);
    expect(microphoneErrorKind(domError('NotAllowedError'))).toBe('denied');
    expect(microphoneErrorKind(domError('SecurityError'))).toBe('denied');
    expect(microphoneErrorKind(domError('NotFoundError'))).toBe('unavailable');
    expect(microphoneErrorKind(domError('NotReadableError'))).toBe('unavailable');
    expect(microphoneErrorKind(domError('AbortError'))).toBe('failed');
    expect(microphoneErrorKind(new TypeError('boom'))).toBe('failed');
    expect(microphoneErrorKind(new MicrophoneError('unsupported'))).toBe('unsupported');
  });
});
