import styles from './TableSkeleton.module.css';

function SkeletonRow() {
  return (
    <div className={styles.row}>
      <div className={`${styles.bone} ${styles.checkbox}`} />
      <div className={`${styles.bone} ${styles.avatar}`} />
      <div className={styles.memberInfo}>
        <div className={`${styles.bone} ${styles.nameLine}`} />
        <div className={`${styles.bone} ${styles.idLine}`} />
      </div>
      <div className={`${styles.bone} ${styles.cell} ${styles.cellSm}`} />
      <div className={`${styles.bone} ${styles.cell} ${styles.cellLg}`} />
      <div className={`${styles.bone} ${styles.cell} ${styles.cellMd}`} />
      <div className={`${styles.bone} ${styles.cell} ${styles.cellXl}`} />
      <div className={`${styles.bone} ${styles.cell} ${styles.cellLg}`} />
      <div className={`${styles.bone} ${styles.cell} ${styles.cellLg}`} />
      <div className={`${styles.bone} ${styles.cell} ${styles.cellLg}`} />
      <div className={`${styles.bone} ${styles.cell} ${styles.cellLg}`} />
      <div className={`${styles.bone} ${styles.cell} ${styles.cellMd}`} />
      <div className={styles.actionsCell}>
        <div className={`${styles.bone} ${styles.actionDot}`} />
        <div className={`${styles.bone} ${styles.actionDot}`} />
        <div className={`${styles.bone} ${styles.actionDot}`} />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 10 }) {
  return (
    <div style={{ flex: 1, overflow: 'hidden', background: 'var(--neutral-0)' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
