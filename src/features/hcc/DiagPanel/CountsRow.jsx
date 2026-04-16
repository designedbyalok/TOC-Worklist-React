import styles from './CountsRow.module.css';

export function CountsRow({ icds = [] }) {
  const open = icds.filter(i => !['Accepted', 'Dismissed'].includes(i.status)).length;
  const accepted = icds.filter(i => i.status === 'Accepted').length;
  const rafTotal = icds
    .filter(i => i.status === 'Accepted')
    .reduce((s, i) => s + (Number(i.raf) || 0), 0);

  return (
    <div className={styles.row}>
      <Stat label="Open ICDs" value={open} />
      <Divider />
      <Stat label="Accepted" value={accepted} color="var(--status-success)" />
      <Divider />
      <Stat label="RAF Total" value={rafTotal.toFixed(3)} color="var(--primary-300)" />
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className={styles.stat}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value} style={color ? { color } : undefined}>{value}</span>
    </div>
  );
}

function Divider() {
  return <span className={styles.divider} aria-hidden />;
}
