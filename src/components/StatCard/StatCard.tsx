import styles from './StatCard.module.css';

export interface StatCardProps {
  readonly label: string;
  readonly value: string;
}

/** One statistic (value above its label). Render inside a `<dl>`. */
export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className={styles.card}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{value}</dd>
    </div>
  );
}
