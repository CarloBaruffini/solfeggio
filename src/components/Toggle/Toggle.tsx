import styles from './Toggle.module.css';

export interface ToggleProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}

/** An on/off switch with a visible label. */
export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className={styles.toggle}>
      <input
        className={styles.input}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => {
          onChange(event.target.checked);
        }}
      />
      <span className={styles.track} aria-hidden="true" />
      {label}
    </label>
  );
}
