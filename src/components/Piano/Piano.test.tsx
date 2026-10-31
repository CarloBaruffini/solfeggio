import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Piano } from './Piano';

function renderPiano(props: Partial<Parameters<typeof Piano>[0]> = {}) {
  const onPress = vi.fn<(pitchClass: number) => void>();
  render(<Piano label="Tastiera" naming="solfege" showNames onPress={onPress} {...props} />);
  return onPress;
}

describe('Piano', () => {
  it('renders one octave with white and black keys named by solfège', () => {
    renderPiano();
    const keys = screen.getAllByRole('button');
    expect(keys).toHaveLength(12);
    expect(keys.map((key) => key.getAttribute('aria-label'))).toEqual([
      'Do',
      'Do♯ / Re♭',
      'Re',
      'Re♯ / Mi♭',
      'Mi',
      'Fa',
      'Fa♯ / Sol♭',
      'Sol',
      'Sol♯ / La♭',
      'La',
      'La♯ / Si♭',
      'Si',
    ]);
  });

  it('uses letter names when asked', () => {
    renderPiano({ naming: 'letter' });
    expect(screen.getByRole('button', { name: 'F♯ / G♭' })).toBeInTheDocument();
  });

  it('reports the pitch class on pointer down', () => {
    const onPress = renderPiano();
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Sol' }));
    expect(onPress).toHaveBeenCalledExactlyOnceWith(7);
  });

  it('can be played with the keyboard (Enter on a focused key)', async () => {
    const onPress = renderPiano();
    screen.getByRole('button', { name: 'Mi' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(onPress).toHaveBeenCalledExactlyOnceWith(4);
  });

  it('marks the hinted key', () => {
    renderPiano({ hintPitchClass: 9 });
    expect(screen.getByRole('button', { name: 'La' })).toHaveAttribute('data-hint');
    expect(screen.getByRole('button', { name: 'Si' })).not.toHaveAttribute('data-hint');
  });

  it('flashes a key with the result of the answer', () => {
    renderPiano({ flash: { pitchClass: 0, result: 'wrong' } });
    expect(screen.getByRole('button', { name: 'Do' })).toHaveAttribute('data-flash', 'wrong');
  });

  it('prints optional hints on the keys', () => {
    renderPiano({ keyHint: (pitchClass) => (pitchClass === 0 ? 'A' : undefined) });
    expect(screen.getByRole('button', { name: 'Do' })).toHaveTextContent('A');
  });
});
