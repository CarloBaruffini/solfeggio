import type { CSSProperties } from 'react';

import type { NamingSystem } from '@/core/music';
import { pitchClassNames, pitchClassOfMidi } from '@/core/music';
import { t } from '@/i18n';

import styles from './MicrophonePanel.module.css';
import type { MicrophoneInput } from './useMicrophoneInput';

export interface MicrophonePanelProps {
  readonly microphone: MicrophoneInput;
  readonly naming: NamingSystem;
}

/** Microphone status: what it hears while listening, or what to do when it is not. */
export function MicrophonePanel({ microphone, naming }: MicrophonePanelProps) {
  const { status, heard, start } = microphone;
  if (status === 'off') return null;

  const retry = (label: string) => (
    <button type="button" className={styles.button} onClick={start}>
      {label}
    </button>
  );

  return (
    <section className={styles.panel} aria-label={t.microphone.label} data-status={status}>
      {status === 'listening' ? (
        <>
          <p className={styles.line}>
            <span className={styles.listening}>{t.microphone.listening}</span>
            <span
              className={styles.meter}
              role="meter"
              aria-label={t.microphone.level}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(heard.level * 100)}
              style={{ '--level': heard.level } as CSSProperties}
            />
            <span className={styles.heard}>
              {t.microphone.heard}{' '}
              <strong>
                {heard.midi === null
                  ? t.microphone.nothing
                  : pitchClassNames(pitchClassOfMidi(heard.midi), naming).join(' / ')}
              </strong>
            </span>
          </p>
          <p className={styles.note}>{t.microphone.soundMuted}</p>
        </>
      ) : (
        <p className={styles.line}>
          <span>{t.microphone.status[status]}</span>
          {status === 'needsGesture' && retry(t.microphone.activate)}
          {(status === 'denied' || status === 'unavailable' || status === 'failed') &&
            retry(t.microphone.retry)}
        </p>
      )}
    </section>
  );
}
