import { useEffect } from 'react';
import { Icon } from '../../components/Icon/Icon';
import { Avatar } from '../../components/Avatar/Avatar';
import { useAppStore } from '../../store/useAppStore';
import styles from './HomeView.module.css';

function alertsForPatient(p) {
  const badges = [];
  if (p.outreachType === 'call' && p.outreachLeft > 0) {
    badges.push({ type: 'missed', icon: 'solar:phone-calling-linear', text: '1 Missed' });
  }
  if (p.outreachType === 'sms' || p.outreachType === 'message') {
    badges.push({ type: 'message', icon: 'solar:chat-round-linear', text: '1 Message' });
  }
  if (p.readmission === 'high') {
    badges.push({ type: 'alert', icon: 'solar:flag-linear', text: '1 Alerts' });
  }
  if (p.tasks > 0) {
    badges.push({ type: 'task', icon: 'solar:checklist-minimalistic-linear', text: `${p.tasks} Tasks` });
  }
  return badges.slice(0, 3);
}

function formatPatientMeta(p) {
  const dob = p.dob || '03/29/1965';
  const genderLabel = p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : p.gender || 'Male';
  const age = p.age ? `(${p.age}Y)` : '';
  return `${genderLabel} • ${dob} ${age}`.trim();
}

export function AlertsMonitoringCard({ dragHandleClassName }) {
  const patients = useAppStore(s => s.patients);
  const loading = useAppStore(s => s.patientsLoading);
  const error = useAppStore(s => s.patientsError);
  const fetchPatients = useAppStore(s => s.fetchPatients);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const visible = patients.filter(p => p.status !== 'completed').slice(0, 15);

  return (
    <div className={styles.card}>
      <div className={[styles.cardHeader, dragHandleClassName].filter(Boolean).join(' ')}>
        <div className={styles.cardTitle}>
          <Icon name="solar:bell-bing-linear" size={14} color="var(--secondary-300)" />
          Alerts &amp; Monitoring
        </div>
        <div className={styles.cardActions}>
          <button className={styles.iconBtn} aria-label="Assignee view"><Icon name="solar:user-linear" size={14} /></button>
          <button className={styles.iconBtn} aria-label="List view"><Icon name="solar:hamburger-menu-linear" size={14} /></button>
          <button className={styles.iconBtn} aria-label="Filter"><Icon name="solar:filter-linear" size={14} /></button>
        </div>
      </div>
      <div className={styles.cardBody}>
        {loading && <div className={styles.loading}>Loading patients…</div>}
        {error && <div className={styles.errorState}>Failed to load patients</div>}
        {!loading && !error && visible.length === 0 && (
          <div className={styles.emptyBody}>No alerts to monitor</div>
        )}
        {!loading && visible.map(p => {
          const badges = alertsForPatient(p);
          return (
            <div key={p.id} className={styles.patientRow}>
              <div className={styles.checkbox} />
              <Avatar variant="patient" initials={p.initials} />
              <div className={styles.patientInfo}>
                <div className={styles.patientName}>
                  {p.name} <span className={styles.chevron}>›</span>
                </div>
                <div className={styles.patientMeta}>{formatPatientMeta(p)}</div>
              </div>
              <div className={styles.actionBadges}>
                {badges.map((b, i) => (
                  <span key={i} className={[styles.badge, styles[b.type]].filter(Boolean).join(' ')}>
                    <Icon name={b.icon} size={10} />
                    {b.text}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
