import { useState } from 'react';
import { Icon } from '../../../components/Icon/Icon';

const FEATURES = [
  { key: 'toc_outreach', label: 'TOC Outreach', desc: 'Post-discharge follow-up calls', icon: 'solar:phone-calling-bold', color: '#009B53' },
  { key: 'med_reconciliation', label: 'Medication Reconciliation', desc: 'Review medications during calls', icon: 'solar:pill-bold', color: '#8c5ae2' },
  { key: 'appointment_scheduling', label: 'Appointment Scheduling', desc: 'Book follow-up appointments', icon: 'solar:calendar-bold', color: '#145ECC' },
  { key: 'care_gap_outreach', label: 'Care Gap Outreach', desc: 'Proactive care gap notifications', icon: 'solar:clipboard-heart-bold', color: '#E8742C' },
  { key: 'refill_reminders', label: 'Refill Reminders', desc: 'Medication refill notifications', icon: 'solar:bottle-bold', color: '#D9A50B' },
  { key: 'waitlist_notifications', label: 'Waitlist Notifications', desc: 'Notify when appointment slots open', icon: 'solar:bell-bold', color: '#D72825' },
  { key: 'ai_disclosure', label: 'AI Disclosure', desc: 'Automated AI agent disclosure', icon: 'solar:bot-bold', color: '#3a485f' },
  { key: 'recording_consent', label: 'Recording Consent', desc: 'Capture consent for call recording', icon: 'solar:microphone-bold', color: '#3a485f' },
  { key: 'identity_verification', label: 'Identity Verification', desc: 'Verify patient identity before call', icon: 'solar:verified-check-bold', color: '#3a485f' },
  { key: 'emergency_detection', label: 'Emergency Detection', desc: 'Detect emergency keywords in calls', icon: 'solar:danger-triangle-bold', color: '#D72825' },
];

const s = {
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 16 },
  card: { background: '#fff', border: '0.5px solid #d0d6e1', borderRadius: 8, padding: 14, display: 'flex', alignItems: 'flex-start', gap: 12 },
  iconWrap: (color) => ({ width: 36, height: 36, borderRadius: 8, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
  info: { flex: 1 },
  label: { fontSize: 14, fontWeight: 500, color: '#3a485f', marginBottom: 2 },
  desc: { fontSize: 12, color: '#6f7a90' },
  toggle: (on) => ({ width: 36, height: 20, borderRadius: 10, background: on ? '#009B53' : '#d0d6e1', position: 'relative', cursor: 'pointer', border: 'none', transition: 'background .15s', flexShrink: 0 }),
  toggleThumb: (on) => ({ position: 'absolute', top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .15s' }),
};

export function FeatureTogglesPanel() {
  const [toggles, setToggles] = useState(
    Object.fromEntries(FEATURES.map(f => [f.key, true]))
  );

  return (
    <div style={s.grid}>
      {FEATURES.map(f => (
        <div key={f.key} style={s.card}>
          <div style={s.iconWrap(f.color)}>
            <Icon name={f.icon} size={18} color={f.color} />
          </div>
          <div style={s.info}>
            <div style={s.label}>{f.label}</div>
            <div style={s.desc}>{f.desc}</div>
          </div>
          <button style={s.toggle(toggles[f.key])} onClick={() => setToggles(p => ({ ...p, [f.key]: !p[f.key] }))}>
            <span style={s.toggleThumb(toggles[f.key])} />
          </button>
        </div>
      ))}
    </div>
  );
}
