import { useState } from 'react';
import { Icon } from '../../../components/Icon/Icon';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DEFAULT_HOURS = { start: '8:00 AM', end: '9:00 PM' };

const HOLIDAYS = [
  { date: '2026-01-01', name: 'New Year\'s Day' },
  { date: '2026-07-04', name: 'Independence Day' },
  { date: '2026-11-26', name: 'Thanksgiving' },
  { date: '2026-12-25', name: 'Christmas Day' },
];

const VM_OPTIONS = ['Leave voicemail', 'Hang up silently', 'Leave callback number only'];

const s = {
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: '#3a485f', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 },
  card: { background: '#fff', border: '0.5px solid #d0d6e1', borderRadius: 8, padding: 16, marginBottom: 12 },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid #e9ecf1', fontSize: 14 },
  dayLabel: { width: 40, fontWeight: 500, color: '#3a485f' },
  timeInput: { padding: '4px 8px', border: '0.5px solid #d0d6e1', borderRadius: 4, fontSize: 13, color: '#3a485f', width: 100 },
  toggle: (on) => ({ width: 36, height: 20, borderRadius: 10, background: on ? '#009B53' : '#d0d6e1', position: 'relative', cursor: 'pointer', border: 'none', transition: 'background .15s' }),
  toggleThumb: (on) => ({ position: 'absolute', top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .15s' }),
  select: { padding: '6px 10px', border: '0.5px solid #d0d6e1', borderRadius: 4, fontSize: 13, color: '#3a485f', background: '#fff' },
  holidayRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid #e9ecf1', fontSize: 13, color: '#3a485f' },
  holidayDate: { color: '#6f7a90', width: 100 },
};

export function PracticeConfigPanel() {
  const [hours, setHours] = useState(DAYS.map(() => ({ ...DEFAULT_HOURS, enabled: true })));
  const [vmBehavior, setVmBehavior] = useState('Leave voicemail');
  const [amdEnabled, setAmdEnabled] = useState(true);

  return (
    <div style={{ padding: 16 }}>
      {/* Practice Hours */}
      <div style={s.section}>
        <div style={s.sectionTitle}>
          <Icon name="solar:clock-circle-bold" size={16} color="#145ECC" />
          Practice Hours
        </div>
        <div style={s.card}>
          {DAYS.map((day, i) => (
            <div key={day} style={s.row}>
              <span style={s.dayLabel}>{day}</span>
              <button style={s.toggle(hours[i].enabled)} onClick={() => {
                const next = [...hours]; next[i] = { ...next[i], enabled: !next[i].enabled }; setHours(next);
              }}>
                <span style={s.toggleThumb(hours[i].enabled)} />
              </button>
              <input style={s.timeInput} value={hours[i].start} readOnly disabled={!hours[i].enabled} />
              <span style={{ color: '#8a94a8' }}>to</span>
              <input style={s.timeInput} value={hours[i].end} readOnly disabled={!hours[i].enabled} />
            </div>
          ))}
        </div>
      </div>

      {/* Holidays */}
      <div style={s.section}>
        <div style={s.sectionTitle}>
          <Icon name="solar:calendar-bold" size={16} color="#D9A50B" />
          Holiday Schedule
        </div>
        <div style={s.card}>
          {HOLIDAYS.map(h => (
            <div key={h.date} style={s.holidayRow}>
              <span style={s.holidayDate}>{h.date}</span>
              <span style={{ flex: 1 }}>{h.name}</span>
              <Icon name="solar:close-circle-bold" size={16} color="#8a94a8" style={{ cursor: 'pointer' }} />
            </div>
          ))}
          <button style={{ marginTop: 8, padding: '6px 12px', border: '0.5px solid #d0d6e1', borderRadius: 6, background: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#8c5ae2' }}>
            <Icon name="solar:add-circle-linear" size={14} /> Add Holiday
          </button>
        </div>
      </div>

      {/* Voicemail / AMD Config */}
      <div style={s.section}>
        <div style={s.sectionTitle}>
          <Icon name="solar:phone-bold" size={16} color="#E8742C" />
          Voicemail & AMD Configuration
        </div>
        <div style={s.card}>
          <div style={s.row}>
            <span>Answering Machine Detection (AMD)</span>
            <button style={s.toggle(amdEnabled)} onClick={() => setAmdEnabled(!amdEnabled)}>
              <span style={s.toggleThumb(amdEnabled)} />
            </button>
          </div>
          <div style={{ ...s.row, borderBottom: 'none' }}>
            <span>When voicemail detected</span>
            <select style={s.select} value={vmBehavior} onChange={e => setVmBehavior(e.target.value)}>
              {VM_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
