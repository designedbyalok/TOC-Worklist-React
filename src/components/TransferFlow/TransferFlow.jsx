import { useState } from 'react';
import { Icon } from '../Icon/Icon';
import { Button } from '../Button/Button';
import { Switch } from '../Switch/Switch';

const DEPARTMENTS = [
  { id: 'primary', label: 'Primary Care', phone: '(555) 100-0001', available: true },
  { id: 'cardiology', label: 'Cardiology', phone: '(555) 100-0002', available: true },
  { id: 'pulmonology', label: 'Pulmonology', phone: '(555) 100-0003', available: false },
  { id: 'pharmacy', label: 'Pharmacy', phone: '(555) 100-0004', available: true },
  { id: 'nursing', label: 'Nursing Triage', phone: '(555) 100-0005', available: true },
  { id: 'behavioral', label: 'Behavioral Health', phone: '(555) 100-0006', available: false },
];

const s = {
  card: { border: '0.5px solid var(--neutral-150)', borderRadius: 8, padding: 14, marginBottom: 12, background: '#fff' },
  title: { fontSize: 13, fontWeight: 500, color: 'var(--neutral-400)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 },
  deptRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid var(--neutral-100)', cursor: 'pointer' },
  deptDot: (avail) => ({ width: 8, height: 8, borderRadius: '50%', background: avail ? 'var(--status-success)' : 'var(--status-error)', flexShrink: 0 }),
  deptLabel: { flex: 1, fontSize: 13, color: 'var(--neutral-400)' },
  deptPhone: { fontSize: 12, color: 'var(--neutral-300)' },
  deptUnavail: { fontSize: 11, color: 'var(--status-error)' },
  transferringCard: { border: '1px solid #bbf7d0', borderRadius: 8, padding: 16, background: '#f0fdf4', marginBottom: 12, textAlign: 'center' },
  failureCard: { border: '1px solid rgba(215,40,37,0.3)', borderRadius: 8, padding: 16, background: 'var(--status-error-light)', marginBottom: 12 },
  callbackCard: { border: '0.5px solid rgba(20,94,204,0.3)', borderRadius: 8, padding: 14, background: 'var(--status-info-light)', marginBottom: 12 },
  feedbackCard: { border: '0.5px solid var(--neutral-150)', borderRadius: 8, padding: 14, background: '#fafbff', marginBottom: 12 },
};

export function DepartmentSelector({ onSelect, onCancel }) {
  return (
    <div style={s.card}>
      <div style={s.title}>
        <Icon name="solar:buildings-bold" size={14} color="var(--status-info)" />
        Select Department
      </div>
      {DEPARTMENTS.map(dept => (
        <div key={dept.id} style={s.deptRow} onClick={() => dept.available && onSelect(dept)}>
          <span style={s.deptDot(dept.available)} />
          <span style={s.deptLabel}>{dept.label}</span>
          {dept.available ? (
            <span style={s.deptPhone}>{dept.phone}</span>
          ) : (
            <span style={s.deptUnavail}>Unavailable</span>
          )}
        </div>
      ))}
      <Button variant="secondary" size="L" fullWidth style={{ marginTop: 10 }} onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}

export function TransferringState({ department, onCancel }) {
  return (
    <div style={s.transferringCard}>
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
      <Button variant="dangerFilled" size="L" fullWidth leadingIcon="solar:close-circle-bold" onClick={onCancel}>
        Cancel Transfer
      </Button>
    </div>
  );
}

export function TransferFailure({ reason, onRetry, onCallback }) {
  return (
    <div style={s.failureCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Icon name="solar:danger-triangle-bold" size={16} color="var(--status-error)" />
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--status-error)' }}>Transfer Failed</span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--neutral-300)', marginBottom: 12 }}>
        {reason || 'Unable to connect to the department. The line may be busy or unavailable.'}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="primary" size="L" leadingIcon="solar:refresh-linear" style={{ flex: 1 }} onClick={onRetry}>
          Retry
        </Button>
        <Button variant="secondary" size="L" leadingIcon="solar:clock-circle-bold" style={{ flex: 1 }} onClick={onCallback}>
          Offer Callback
        </Button>
      </div>
    </div>
  );
}

export function NoHumanAvailable({ onCallback, onMessage }) {
  return (
    <div style={s.failureCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Icon name="solar:users-group-rounded-bold" size={16} color="var(--status-warning)" />
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--status-warning)' }}>No Agent Available</span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--neutral-300)', marginBottom: 12 }}>
        All human agents are currently busy. You can offer the patient a callback or leave a message.
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="info" size="L" leadingIcon="solar:phone-calling-bold" style={{ flex: 1 }} onClick={onCallback}>
          Schedule Callback
        </Button>
        <Button variant="secondary" size="L" leadingIcon="solar:letter-bold" style={{ flex: 1 }} onClick={onMessage}>
          Leave Message
        </Button>
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
    <div style={s.callbackCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Icon name="solar:clock-circle-bold" size={14} color="var(--status-info)" />
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--status-info)' }}>Schedule Callback</span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--neutral-400)', marginBottom: 10 }}>
        Schedule a callback for {patientName || 'this patient'}:
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {['15', '30', '60'].map(t => (
          <Button
            key={t}
            variant={time === t ? 'info' : 'secondary'}
            size="L"
            style={{ flex: 1 }}
            onClick={() => setTime(t)}
          >
            {t} min
          </Button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="info" size="L" style={{ flex: 1 }} onClick={() => onSchedule(time)}>
          Confirm Callback
        </Button>
        <Button variant="secondary" size="L" onClick={onDismiss}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function PostTransferFeedback({ onSubmit }) {
  const [outcome, setOutcome] = useState('resolved');
  const [sendSurvey, setSendSurvey] = useState(true);

  return (
    <div style={s.feedbackCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Icon name="solar:clipboard-check-bold" size={14} color="var(--status-success)" />
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--status-success)' }}>Post-Transfer Feedback</span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--neutral-400)', marginBottom: 8 }}>Transfer Outcome:</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {['resolved', 'escalated', 'callback'].map(o => (
          <Button
            key={o}
            variant={outcome === o ? 'success' : 'secondary'}
            size="L"
            style={{ flex: 1, textTransform: 'capitalize' }}
            onClick={() => setOutcome(o)}
          >
            {o}
          </Button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, color: 'var(--neutral-400)' }}>
        <Switch checked={sendSurvey} onChange={setSendSurvey} />
        Send SMS satisfaction survey
      </div>
      <Button variant="success" size="L" fullWidth leadingIcon="solar:check-circle-bold" onClick={() => onSubmit({ outcome, sendSurvey })}>
        Submit Feedback
      </Button>
    </div>
  );
}
