import { SegmentedControl } from '@/components/SegmentedControl';
import { Toggle } from '@/components/Toggle';
import { CLEFS, LEDGER_LINE_OPTIONS, NAMING_SYSTEMS } from '@/core/music';
import type { Settings } from '@/features/settings';
import { t } from '@/i18n';

import styles from './NoteReadingPage.module.css';

export interface NoteReadingSettingsProps {
  readonly settings: Settings;
  readonly onChange: (patch: Partial<Settings>) => void;
}

const clefOptions = CLEFS.map((value) => ({ value, label: t.settings.clefs[value] }));
const ledgerLineOptions = LEDGER_LINE_OPTIONS.map((value) => ({
  value,
  label: t.settings.ledgerLineOptions[value],
}));
const namingOptions = NAMING_SYSTEMS.map((value) => ({
  value,
  label: t.settings.namingOptions[value],
}));

/** The settings bar above the staff. */
export function NoteReadingSettings({ settings, onChange }: NoteReadingSettingsProps) {
  return (
    <section className={styles.settings} aria-label={t.settings.label}>
      <SegmentedControl
        label={t.settings.clef}
        options={clefOptions}
        value={settings.clef}
        onChange={(clef) => {
          onChange({ clef });
        }}
      />
      <SegmentedControl
        label={t.settings.ledgerLines}
        options={ledgerLineOptions}
        value={settings.ledgerLines}
        onChange={(ledgerLines) => {
          onChange({ ledgerLines });
        }}
      />
      <SegmentedControl
        label={t.settings.naming}
        options={namingOptions}
        value={settings.naming}
        onChange={(naming) => {
          onChange({ naming });
        }}
      />
      <div className={styles.toggles}>
        <Toggle
          label={t.settings.accidentals}
          checked={settings.accidentals}
          onChange={(accidentals) => {
            onChange({ accidentals });
          }}
        />
        <Toggle
          label={t.settings.showKeyNames}
          checked={settings.showKeyNames}
          onChange={(showKeyNames) => {
            onChange({ showKeyNames });
          }}
        />
        <Toggle
          label={t.settings.sound}
          checked={settings.sound}
          onChange={(sound) => {
            onChange({ sound });
          }}
        />
      </div>
    </section>
  );
}
