import styles from './TableSkeleton.module.css';

function SkeletonCard() {
  return (
    <div style={{
      background: '#fff', border: '0.5px solid var(--neutral-100)', borderRadius: 10,
      padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {/* Top row: badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div className={styles.bone} style={{ width: 50, height: 20, borderRadius: 4 }} />
          <div className={styles.bone} style={{ width: 60, height: 20, borderRadius: 4 }} />
        </div>
        <div className={styles.bone} style={{ width: 50, height: 20, borderRadius: 4 }} />
      </div>
      {/* Title */}
      <div className={styles.bone} style={{ width: '75%', height: 14 }} />
      {/* Description */}
      <div className={styles.bone} style={{ width: '100%', height: 10 }} />
      <div className={styles.bone} style={{ width: '60%', height: 10 }} />
      {/* Step pills */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <div className={styles.bone} style={{ width: 80, height: 18, borderRadius: 10 }} />
        <div className={styles.bone} style={{ width: 100, height: 18, borderRadius: 10 }} />
        <div className={styles.bone} style={{ width: 70, height: 18, borderRadius: 10 }} />
      </div>
      {/* Footer stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '0.5px solid var(--neutral-100)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <div className={styles.bone} style={{ width: 36, height: 16 }} />
          <div className={styles.bone} style={{ width: 50, height: 8 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <div className={styles.bone} style={{ width: 36, height: 16 }} />
          <div className={styles.bone} style={{ width: 30, height: 8 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <div className={styles.bone} style={{ width: 36, height: 16 }} />
          <div className={styles.bone} style={{ width: 40, height: 8 }} />
        </div>
        <div className={styles.bone} style={{ width: 40, height: 26, borderRadius: 6 }} />
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12, padding: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// Generic KPI stat card skeleton
function KpiCardSkeleton() {
  return (
    <div style={{
      background: '#fff', border: '0.5px solid var(--neutral-100)', borderRadius: 8,
      padding: 14, flex: 1, minWidth: 140,
    }}>
      <div className={styles.bone} style={{ width: '60%', height: 10, marginBottom: 8 }} />
      <div className={styles.bone} style={{ width: '40%', height: 22, marginBottom: 6 }} />
      <div className={styles.bone} style={{ width: '70%', height: 8 }} />
    </div>
  );
}

export function KpiSkeleton({ count = 4 }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '12px 0' }}>
      {Array.from({ length: count }).map((_, i) => (
        <KpiCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Simple row skeleton for smaller tables
function SimpleRow({ cols = 6 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--neutral-100)', gap: 16 }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className={styles.bone} style={{ height: 12, width: i === 0 ? 160 : 80, flex: i === 0 ? 'none' : 1 }} />
      ))}
    </div>
  );
}

export function SimpleTableSkeleton({ rows = 6, cols = 6 }) {
  return (
    <div style={{ background: 'var(--neutral-0)' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <SimpleRow key={i} cols={cols} />
      ))}
    </div>
  );
}
