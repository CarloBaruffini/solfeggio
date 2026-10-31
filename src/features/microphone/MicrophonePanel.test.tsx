import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { MicrophoneFrame } from '@/input';

import { MicrophonePanel } from './MicrophonePanel';
import type { MicrophoneInput, MicrophoneStatus } from './useMicrophoneInput';

function renderPanel(status: MicrophoneStatus, heard: MicrophoneFrame = { midi: null, level: 0 }) {
  const microphone: MicrophoneInput = { status, heard, start: vi.fn(), stop: vi.fn() };
  const { container } = render(<MicrophonePanel microphone={microphone} naming="solfege" />);
  return { microphone, container };
}

describe('MicrophonePanel', () => {
  it('renders nothing when the microphone is off', () => {
    const { container } = renderPanel('off');
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the note and level it hears while listening', () => {
    renderPanel('listening', { midi: 66, level: 0.5 });
    expect(screen.getByText('🎤 In ascolto')).toBeInTheDocument();
    expect(screen.getByText('Fa♯ / Sol♭')).toBeInTheDocument();
    expect(screen.getByRole('meter', { name: 'Livello del microfono' })).toHaveAttribute(
      'aria-valuenow',
      '50',
    );
    expect(screen.getByText(/suono dell’app è disattivato/)).toBeInTheDocument();
  });

  it('shows a dash when it hears no note', () => {
    renderPanel('listening');
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('asks for a tap to start after a reload', async () => {
    const { microphone } = renderPanel('needsGesture');
    await userEvent.click(screen.getByRole('button', { name: 'Attiva il microfono' }));
    expect(microphone.start).toHaveBeenCalledOnce();
  });

  it('explains a denied permission and offers to retry', async () => {
    const { microphone } = renderPanel('denied');
    expect(screen.getByText(/Permesso negato/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Riprova' }));
    expect(microphone.start).toHaveBeenCalledOnce();
  });

  it('offers no retry when the browser cannot record', () => {
    renderPanel('unsupported');
    expect(screen.getByText(/non permette di usare il microfono/)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
