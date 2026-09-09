import { useState } from 'react';
import { Icon } from '../../../../../components/Icon/Icon';
import { DownChevronIcon } from '../../../../../components/Icon/DownChevronIcon';
import styles from './CareUtilizationWidget.module.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const VISIT_TYPES = [
  { key:'OP',        label:'OP',         color:'#8c5ae2', bg:'#f5f0ff', count:9,  data:[1,0,1,0,1,0,1,0,0,0,1,1] },
  { key:'IP',        label:'IP',         color:'#109cae', bg:'#e5f8fb', count:2,  data:[0,2,0,0,0,0,0,0,0,0,0,0] },
  { key:'ER',        label:'ER',         color:'#e81e63', bg:'#fde8ef', count:4,  data:[0,0,1,0,1,2,0,0,0,0,0,0] },
  { key:'Specialty', label:'Speciality', color:'#eeb200', bg:'#fdf7e5', count:2,  data:[1,1,0,0,0,0,2,1,0,0,0,0] },
  { key:'HomeVisit', label:'Home Visit', color:'#8bc34a', bg:'#f3f9ed', count:3,  data:[0,0,2,0,0,0,0,0,1,0,1,0] },
];

export function CareUtilizationWidget() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.widget}>
      {/* Header — outside the bordered box */}
      <div className={styles.header}>
        <button className={styles.titleBtn} onClick={() => setCollapsed(v => !v)}>
          <DownChevronIcon
            size={13}
            color="var(--neutral-400)"
            style={collapsed ? { transform: 'rotate(-90deg)' } : undefined}
          />
          <span className={styles.title}>Care Utilization Summary</span>
        </button>
        {!collapsed && (
          <button className={styles.yearBtn}>
            2024
            <Icon name="solar:alt-arrow-down-linear" size={11} color="var(--neutral-300)" />
          </button>
        )}
      </div>

      {!collapsed && (
        <div className={styles.container}>
          {/* Legend */}
          <div className={styles.legend}>
            {VISIT_TYPES.map(vt => (
              <button key={vt.key} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: vt.color }} />
                <span className={styles.legendLabel}>{vt.label} ({vt.count})</span>
              </button>
            ))}
          </div>

          {/* Month grid */}
          <div className={styles.grid}>
            {MONTHS.map((month, mi) => (
              <div key={month} className={styles.monthCol}>
                <div className={styles.badgeStack}>
                  {VISIT_TYPES.map(vt =>
                    vt.data[mi] > 0 ? (
                      <span
                        key={vt.key}
                        className={styles.badge}
                        style={{ color: vt.color, background: vt.bg, borderColor: vt.color }}
                      >
                        {vt.data[mi]}
                      </span>
                    ) : null
                  )}
                </div>
                <div className={styles.monthLabelRow}>
                  <span className={styles.monthLabel}>{month}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <div className={styles.footerLeft}>
              <span className={styles.footerKeyText}>Last Annual Visit:</span>
              <span className={styles.footerLink}>
                <Icon name="solar:document-linear" size={14} color="var(--primary-300, #8c5ae2)" />
                12/23/2023
              </span>
            </div>
            <span className={styles.footerRight}>Total Cost: $67,450</span>
          </div>
        </div>
      )}
    </div>
  );
}
