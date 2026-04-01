import { useState } from 'react';
import { Icon } from '../Icon/Icon';

const DEPARTMENTS = [
  { id: 'primary', label: 'Primary Care', phone: '(555) 100-0001', available: true },
  { id: 'cardiology', label: 'Cardiology', phone: '(555) 100-0002', available: true },
  { id: 'pulmonology', label: 'Pulmonology', phone: '(555) 100-0003', available: false },
  { id: 'pharmacy', label: 'Pharmacy', phone: '(555) 100-0004', available: true },
  { id: 'nursing', label: 'Nursing Triage', phone: '(555) 100-0005', available: true },
  { id: 'behavioral', label: 'Behavioral Health', phone: '(555) 100-0006', available: false },
];

const styles = {
  card: { border: '0.5px solid var(--neutral-150)', borderRadius: 8, padding: 14, marginBottom: 12, background: '#fff' },
  title: { fontSize: 13, fontWeight: 500, color: 'var(--neutral-400)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 },
  deptRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--neutral-100)', cursor: 'pointer' },
  deptDot: (avail) => ({ width: 8, height: 8, borderRadius: '50%', background: avail ? 'var(--status-success)' : 'var(--status-error)', flexShrink: 0 }),
  deptLabel: { flex: 1, fontSize: 13, color: 'var(--neutral-400)' },
  deptPhone: { fontSize: 12, color: 'var(--neutral-300)' },
  deptUnavail: { fontSize: 11, color: 'var(--status-error)' },
  btn: { padding: '8px 14px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'center' },
  transferringCard: { border: '1px solid #bbf7d0', borderRadius: 8, padding: 16, background: '#f0fdf4', marginBottom: 12, textAlign: 'center' },
  failureCard: { border: '1px solid rgba(215,40,37,0.3)', borderRadius: 8, padding: 16, background: 'var(--status-error-light)', marginBottom: 12 },
  callbackCard: { border: '0.5px solid rgba(20,94,204,0.3)', borderRadius: 8, padding: 14, background: 'var(--status-info-light)', marginBottom: 12 },
  feedbackCard: { border: '0.5px solid var(--neutral-150)', borderRadius: 8, padding: 14, background: '#fafbff', marginBottom: 12 },
};

export function DepartmentSelector({ onSelect, onCancel }) {
  return (
    <div style={styles.card}>
      <div style={styles.title}>
        <Icon name="solar:buildings-bold" size={14} color="var(--status-info)" />
        Select Department
      </div>
      {DEPARTMENTS.map(dept => (
        <div key={dept.id} style={styles.deptRow} onClick={() => dept.available && onSelect(dept)}>
          <span style={styles.deptDot(dept.available)} />
          <span style={styles.deptLabel}>{dept.label}</span>
          {dept.available ? (
            <span style={styles.deptPhone}>{dept.phone}</span>
          ) : (
            <span style={styles.deptUnavail}>Unavailable</span>
          )}
        </div>
      ))}
      <button style={{ ...styles.btn, background: '#fff', border: '0.5px solid var(--neutral-150)', color: 'var(--neutral-300)', marginTop: 10 }} onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}

export function TransferringState({ department, onCancel }) {
  return (
    <div style={styles.transferringCard}>
      <div style={{ marginBottom: 8 }}>
        <Icon name="solar:phone-calling-bold" size={24} color="#059669" />
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: '#059669', marginBottom: 4 }}>Transferring Call</div>
      <div style={{ fontSize: 13, color: 'var(--neutral-300)', marginBottom: 8 }}>
        Connecting to {department?.label || 'department'}...
      </div>
      <div style={{ fontSize: 12, color: 'var(--neutral-300)', fontStyle: 'italic', marginBottom: 12 }}>
        "Please hold while I transfer you to our {department?.label?.toLowerCase() || 'care'} team."
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
        <Icon name="solar:music-notes-bold" size={14} color="var(--primary-300)" />
        <span style={{ fontSize: 12, color: 'var(--primary-300)' }}>Hold music playing</span>
      </div>
      <button style={{ ...styles.btn, background: 'var(--status-error)', color: '#fff' }} onClick={onCancel}>
        <Icon name="solar:close-circle-bold" size={14} /> Cancel Transfer
      </button>
    </div>
  );
}

export function TransferFailure({ reason, onRetry, onCallback }) {
  return (
    <div style={styles.failureCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Icon name="solar:danger-triangle-bold" size={16} color="var(--status-error)" />
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--status-error)' }}>Transfer Failed</span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--neutral-300)', marginBottom: 12 }}>
        {reason || 'Unable to connect to the department. The line may be busy or unavailable.'}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ ...styles.btn, flex: 1, background: 'var(--primary-300)', color: '#fff' }} onClick={onRetry}>
          <Icon name="solar:refresh-linear" size={14} /> Retry
        </button>
        <button style={{ ...styles.btn, flex: 1, background: '#fff', border: '0.5px solid var(--neutral-150)', color: 'var(--neutral-400)' }} onClick={onCallback}>
          <Icon name="solar:clock-circle-bold" size={14} /> Offer Callback
        </button>
      </div>
    </div>
  );
}

export function NoHumanAvailable({ onCallback, onMessage }) {
  return (
    <div style={styles.failureCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Icon name="solar:users-group-rounded-bold" size={16} color="var(--status-warning)" />
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--status-warning)' }}>No Agent Available</span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--neutral-300)', marginBottom: 12 }}>
        All human agents are currently busy. You can offer the patient a callback or leave a message.
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ ...styles.btn, flex: 1, background: 'var(--status-info)', color: '#fff' }} onClick={onCallback}>
          <Icon name="solar:phone-calling-bold" size={14} /> Schedule Callback
        </button>
        <button style={{ ...styles.btn, flex: 1, background: '#fff', border: '0.5px solid var(--neutral-150)', color: 'var(--neutral-400)' }} onClick={onMessage}>
          <Icon name="solar:letter-bold" size={14} /> Leave Message
        </button>
      </div>
      <div style={{ fontSize: 11, color: 'var(--neutral-200)', marginTop: 8, textAlign: 'center' }}>
        SLA: Callback within 30 minutes
      </div>
    </div>
  );
}

export function CallbackOffer({ patientName, onSchedule, onDismiss }) {
  const [time, setTime] = useState('30');
  return (
    <div style={styles.callbackCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Icon name="solar:clock-circle-bold" size={14} color="var(--status-info)" />
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--status-info)' }}>Schedule Callback</span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--neutral-400)', marginBottom: 10 }}>
        Schedule a callback for {patientName || 'this patient'}:
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {['15', '30', '60'].map(t => (
          <button key={t} style={{
            ...styles.btn, flex: 1,
            background: time === t ? 'var(--status-info)' : '#fff',
            color: time === t ? '#fff' : 'var(--neutral-400)',
            border: time === t ? 'none' : '0.5px solid var(--neutral-150)',
          }} onClick={() => setTime(t)}>
            {t} min
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={{ ...styles.btn, flex: 1, background: 'var(--status-info)', color: '#fff' }} onClick={() => onSchedule(time)}>
          Confirm Callback
        </button>
        <button style={{ ...styles.btn, flex: 0, background: '#fff', border: '0.5px solid var(--neutral-150)', color: 'var(--neutral-300)', padding: '8px 12px' }} onClick={onDismiss}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export function PostTransferFeedback({ onSubmit }) {
  const [outcome, setOutcome] = useState('resolved');
  const [sendSurvey, setSendSurvey] = useState(true);

  return (
    <div style={styles.feedbackCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Icon name="solar:clipboard-check-bold" size={14} color="var(--status-success)" />
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--status-success)' }}>Post-Transfer Feedback</span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--neutral-400)', marginBottom: 8 }}>Transfer Outcome:</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {['resolved', 'escalated', 'callback'].map(o => (
          <button key={o} style={{
            ...styles.btn, flex: 1,
            background: outcome === o ? 'var(--status-success)' : '#fff',
            color: outcome === o ? '#fff' : 'var(--neutral-400)',
            border: outcome === o ? 'none' : '0.5px solid var(--neutral-150)',
            textTransform: 'capitalize',
          }} onClick={() => setOutcome(o)}>
            {o}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, color: 'var(--neutral-400)' }}>
        <button style={{
          width: 36, height: 20, borderRadius: 10, position: 'relative', cursor: 'pointer', border: 'none',
          background: sendSurvey ? 'var(--status-success)' : 'var(--neutral-150)', transition: 'background .15s',
        }} onClick={() => setSendSurvey(!sendSurvey)}>
          <span style={{ position: 'absolute', top: 2, left: sendSurvey ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
        </button>
        Send SMS satisfaction survey
      </div>
      <button style={{ ...styles.btn, background: 'var(--status-success)', color: '#fff' }} onClick={() => onSubmit({ outcome, sendSurvey })}>
        <Icon name="solar:check-circle-bold" size={14} /> Submit Feedback
      </button>
    </div>
  );
}
