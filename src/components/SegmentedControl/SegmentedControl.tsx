import { useId } from 'react';

import styles from './SegmentedControl.module.css';

export interface SegmentedOption<T> {
  readonly value: T;
  readonly label: string;
}

export interface SegmentedControlProps<T extends string | number> {
  /** Visible caption above the options. */
  readonly label: string;
  readonly options: readonly SegmentedOption<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
}

/** A row of mutually exclusive buttons with a caption, e.g. "Chiave: Violino | Basso | Contralto". */
export function SegmentedControl<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const labelId = useId();
  return (
    <div className={styles.field}>
      <span className={styles.label} id={labelId}>
        {label}
      </span>
      <div className={styles.options} role="group" aria-labelledby={labelId}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={styles.option}
            aria-pressed={option.value === value}
            onClick={() => {
              onChange(option.value);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
