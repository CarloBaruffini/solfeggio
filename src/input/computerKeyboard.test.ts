import { afterEach, describe, expect, it, vi } from 'vitest';

import { computerKeyLabel, createComputerKeyboardSource } from './computerKeyboard';
import type { NoteInputListener, NoteInputSource } from './types';

let source: NoteInputSource | null = null;

afterEach(() => {
  source?.stop();
  source = null;
});

function listen(octave?: number) {
  const listener = vi.fn<NoteInputListener>();
  source = createComputerKeyboardSource(octave === undefined ? {} : { octave });
  source.start(listener);
  return listener;
}

function press(code: string, init: KeyboardEventInit = {}, target: EventTarget = window) {
  target.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true, ...init }));
}

describe('createComputerKeyboardSource', () => {
  it('maps the home row to one octave starting on C4', () => {
    const listener = listen();
    press('KeyA');
    press('KeyW');
    press('KeyJ');
    expect(listener.mock.calls.map(([event]) => event.midi)).toEqual([60, 61, 71]);
    expect(listener.mock.calls[0]?.[0]).toMatchObject({ source: 'computerKeyboard' });
  });

  it('uses the configured octave', () => {
    const listener = listen(2);
    press('KeyH');
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ midi: 45 }));
  });

  it('ignores unmapped keys, auto-repeat and shortcuts', () => {
    const listener = listen();
    press('KeyZ');
    press('KeyA', { repeat: true });
    press('KeyA', { metaKey: true });
    press('KeyA', { ctrlKey: true });
    expect(listener).not.toHaveBeenCalled();
  });

  it('ignores typing in form fields', () => {
    const listener = listen();
    const input = document.createElement('input');
    document.body.append(input);
    press('KeyA', {}, input);
    input.remove();
    expect(listener).not.toHaveBeenCalled();
  });

  it('stops listening', () => {
    const listener = listen();
    source?.stop();
    press('KeyA');
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('computerKeyLabel', () => {
  it('returns the QWERTY label of a pitch class', () => {
    expect(computerKeyLabel(0)).toBe('A');
    expect(computerKeyLabel(8)).toBe('Y');
  });
});
