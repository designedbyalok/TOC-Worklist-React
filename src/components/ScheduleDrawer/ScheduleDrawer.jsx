import { useState, useMemo, useRef, useEffect } from 'react';
import { Icon } from '../Icon/Icon';
import { Button } from '../Button/Button';
import { Drawer } from '../Drawer/Drawer';
import { Avatar } from '../Avatar/Avatar';
import { ActionButton } from '../ActionButton/ActionButton';
import { useAppStore } from '../../store/useAppStore';
import styles from './ScheduleDrawer.module.css';

const APPOINTMENT_TYPES = [
  { name: 'Annual Wellness Visit', code: 'AWV', mode: 'In-person', duration: '60 min', color: '#D9A50B' },
  { name: 'Follow-up Appointment', code: 'Routine', mode: 'In-person/Virtual', duration: '15-30 min', color: '#8C5AE2' },
  { name: 'Specialty Consultation', code: 'Routine', mode: 'In-person', duration: '45 min', color: '#009B53' },
  { name: 'Telehealth Consultation', code: 'Routine', mode: 'Virtual', duration: '30 min', color: '#145ECC' },
  { name: 'Lab Results Discussion', code: 'Routine', mode: 'Virtual', duration: '15 min', color: '#009B53' },
];

const MODE_OPTIONS = ['At Clinic', 'Virtual', 'Home Visit', 'Phone'];
const LOCATION_OPTIONS = ['7 Hills Department', 'Downtown Clinic', 'Valley Medical Center', 'Tele-Med Center'];
const PROVIDER_OPTIONS = ['Dr. Katherine Moss', 'Dr. James Chen', 'Dr. Sarah Miller', 'Dr. Robert Kim'];

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '');
}

/* ── Patient Search Dropdown ── */
function PatientSearch({ patients, onSelect }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return patients.slice(0, 8);
    const q = query.toLowerCase();
    return patients.filter(p => p.name?.toLowerCase().includes(q)).slice(0, 8);
  }, [patients, query]);

  return (
    <div ref={ref} className={styles.patientSearch}>
      <div className={styles.searchInputWrap}>
        <Icon name="solar:magnifer-linear" size={16} color="var(--neutral-200)" />
        <input
          className={styles.searchInput}
          placeholder="Search patient or prospect"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && filtered.length > 0 && (
        <div className={styles.searchDropdown}>
          {filtered.map(p => (
            <button key={p.id} className={styles.searchItem} onClick={() => { onSelect(p); setOpen(false); setQuery(''); }}>
              <Avatar variant="patient" initials={getInitials(p.name).toUpperCase()} />
              <div>
                <div className={styles.searchItemName}>{p.name}</div>
                <div className={styles.searchItemMeta}>{p.gender?.[0] || 'M'} &bull; {p.dob || '03-29-1992'} ({p.age || '31'}Y)</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Appointment Type Picker ── */
function AppointmentTypePicker({ value, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  const filtered = APPOINTMENT_TYPES.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()));

  if (value) {
    return (
      <button className={styles.detailValue} onClick={() => onSelect(null)} style={{ cursor: 'pointer' }}>
        <span className={styles.apptDot} style={{ background: value.color }} />
        {value.name}
      </button>
    );
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className={styles.detailValuePlaceholder} onClick={() => setOpen(v => !v)}>
        <Icon name="solar:calendar-mark-linear" size={16} color="var(--neutral-200)" />
        Select Appointment Type
      </button>
      {open && (
        <div className={styles.apptDropdown}>
          <div className={styles.apptSearchWrap}>
            <Icon name="solar:magnifer-linear" size={14} color="var(--neutral-200)" />
            <input className={styles.apptSearchInput} placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} autoFocus />
          </div>
          {filtered.map(t => (
            <button key={t.name} className={styles.apptItem} onClick={() => { onSelect(t); setOpen(false); }}>
              <span className={styles.apptDot} style={{ background: t.color }} />
              <div style={{ flex: 1 }}>
                <div className={styles.apptItemName}>{t.name}</div>
                <div className={styles.apptItemMeta}>{t.code} &bull; {t.mode}</div>
              </div>
              <div className={styles.apptItemDuration}>
                <Icon name="solar:clock-circle-linear" size={12} color="var(--neutral-200)" />
                {t.duration}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Drawer ── */
export function ScheduleDrawer({ onClose }) {
  const patients = useAppStore(s => s.patients);
  const showToast = useAppStore(s => s.showToast);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [editingReason, setEditingReason] = useState(false);
  const [appointmentType, setAppointmentType] = useState(null);
  const [mode, setMode] = useState('');
  const [location, setLocation] = useState('');
  const [provider, setProvider] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [requireRsvp, setRequireRsvp] = useState(false);
  const [memberInstruction, setMemberInstruction] = useState('');
  const [showStaffInstructions, setShowStaffInstructions] = useState(false);
  const [staffInstruction, setStaffInstruction] = useState('');

  // Auto-fill mode and location when appointment type is selected
  useEffect(() => {
    if (appointmentType) {
      setMode(appointmentType.mode === 'Virtual' ? 'Virtual' : 'At Clinic');
      setLocation(LOCATION_OPTIONS[0]);
    }
  }, [appointmentType]);

  const canSchedule = selectedPatient && appointmentType;

  const handleSchedule = () => {
    showToast(`Appointment scheduled for ${selectedPatient.name}`);
    onClose();
  };

  return (
    <Drawer title="Schedule Appointment" onClose={onClose} headerRight={
      <Button variant="primary" size="L" disabled={!canSchedule} onClick={handleSchedule}>Schedule</Button>
    } bodyClassName={styles.drawerBody}>
      <div className={styles.content}>
        {/* Patient Selection */}
        {!selectedPatient ? (
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Patient/Prospect <span className={styles.required}>*</span></label>
            <PatientSearch patients={patients} onSelect={setSelectedPatient} />
          </div>
        ) : (
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Patient Details</label>
            <div className={styles.patientCard}>
              <div className={styles.patientCardHeader}>
                <Avatar variant="patient" initials={getInitials(selectedPatient.name).toUpperCase()} />
                <div className={styles.patientCardInfo}>
                  <div className={styles.patientCardName}>{selectedPatient.name}</div>
                  <div className={styles.patientCardMeta}>
                    {selectedPatient.gender?.[0] || 'M'} &bull; {selectedPatient.age || '62'}Y ({selectedPatient.dob || '03/29/1961'}) &bull;{' '}
                    <span style={{ color: '#D72825', fontWeight: 500 }}>RAF Score: {selectedPatient.laceScore || '3.5'}</span>{' '}
                    <span style={{ color: '#009B53' }}>+0.5 <Icon name="solar:arrow-up-linear" size={10} color="#009B53" /></span>
                  </div>
                </div>
                <ActionButton icon="solar:close-linear" size="S" tooltip="Remove" onClick={() => setSelectedPatient(null)} />
              </div>

              {/* Reason for Visit */}
              <div className={styles.reasonField}>
                <label className={styles.reasonLabel}>Reason for Visit</label>
                {editingReason || !reasonForVisit ? (
                  <input
                    className={styles.reasonInput}
                    placeholder="Enter Reason for Visit"
                    value={reasonForVisit}
                    onChange={e => setReasonForVisit(e.target.value)}
                    onBlur={() => setEditingReason(false)}
                    autoFocus={editingReason}
                  />
                ) : (
                  <div className={styles.reasonValue} onClick={() => setEditingReason(true)}>{reasonForVisit}</div>
                )}
              </div>

              {/* Patient Info */}
              <div className={styles.patientInfoGrid}>
                <div className={styles.patientInfoRow}>
                  <span className={styles.patientInfoLabel}>Patient Location</span>
                  <span className={styles.patientInfoValue}>{selectedPatient.facility || 'New York'}</span>
                </div>
                <div className={styles.patientInfoRow}>
                  <span className={styles.patientInfoLabel}>Last Appointment</span>
                  <span className={styles.patientInfoValue}>
                    07-26-2023 with Katherine Moss{' '}
                    <button className={styles.viewDetailsLink}>View Details</button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Details */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>Appointment Details</label>
          <div className={styles.detailsCard}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Appointment Type</span>
              <AppointmentTypePicker value={appointmentType} onSelect={setAppointmentType} />
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Mode of Appointment</span>
              {mode ? (
                <span className={styles.detailValue}><Icon name="solar:buildings-linear" size={16} color="var(--neutral-300)" /> {mode}</span>
              ) : (
                <button className={styles.detailValuePlaceholder} onClick={() => setMode(MODE_OPTIONS[0])}>
                  <Icon name="solar:monitor-linear" size={16} color="var(--neutral-200)" /> Select Mode of Appointment
                </button>
              )}
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Location</span>
              {location ? (
                <span className={styles.detailValue}><Icon name="solar:map-point-linear" size={16} color="var(--neutral-300)" /> {location}</span>
              ) : (
                <button className={styles.detailValuePlaceholder} onClick={() => setLocation(LOCATION_OPTIONS[0])}>
                  <Icon name="solar:map-point-linear" size={16} color="var(--neutral-200)" /> Select Location
                </button>
              )}
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Primary User</span>
              {provider ? (
                <span className={styles.detailValue}><Icon name="solar:user-linear" size={16} color="var(--neutral-300)" /> {provider}</span>
              ) : (
                <button className={styles.detailValuePlaceholder} onClick={() => setProvider(PROVIDER_OPTIONS[0])}>
                  <Icon name="solar:user-linear" size={16} color="var(--neutral-200)" /> Select Provider
                </button>
              )}
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Date</span>
              {date ? (
                <span className={styles.detailValue}><Icon name="solar:calendar-linear" size={16} color="var(--neutral-300)" /> {date}</span>
              ) : (
                <div style={{ position: 'relative' }}>
                  <button className={styles.detailValuePlaceholder} onClick={() => setDate(new Date().toLocaleDateString())}>
                    <Icon name="solar:calendar-linear" size={16} color="var(--neutral-200)" /> Select Date
                  </button>
                </div>
              )}
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Time</span>
              {time ? (
                <span className={styles.detailValue}><Icon name="solar:clock-circle-linear" size={16} color="var(--neutral-300)" /> {time}</span>
              ) : (
                <button className={styles.detailValuePlaceholder} onClick={() => setTime('10:00 AM')}>
                  <Icon name="solar:clock-circle-linear" size={16} color="var(--neutral-200)" /> Select Time
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RSVP */}
        <label className={styles.rsvpRow}>
          <input type="checkbox" checked={requireRsvp} onChange={() => setRequireRsvp(v => !v)} className={styles.checkbox} />
          <span>Require RSVP</span>
          <Icon name="solar:info-circle-linear" size={14} color="var(--neutral-200)" />
        </label>

        {/* Member Instruction */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>Member Instruction</label>
          <div className={styles.instructionEditor}>
            <textarea
              className={styles.instructionTextarea}
              placeholder="Add Instructions for Member"
              value={memberInstruction}
              onChange={e => setMemberInstruction(e.target.value)}
              rows={3}
            />
            <div className={styles.instructionToolbar}>
              <ActionButton icon="solar:paperclip-linear" size="S" tooltip="Attach" />
              <span className={styles.toolbarDivider} />
              <ActionButton icon="solar:text-bold-linear" size="S" tooltip="Bold" />
              <ActionButton icon="solar:text-italic-linear" size="S" tooltip="Italic" />
              <ActionButton icon="solar:text-underline-linear" size="S" tooltip="Underline" />
              <span className={styles.toolbarDivider} />
              <ActionButton icon="solar:text-field-linear" size="S" tooltip="Heading" />
              <ActionButton icon="solar:list-linear" size="S" tooltip="List" />
            </div>
          </div>
        </div>

        {/* Staff Instructions */}
        {!showStaffInstructions ? (
          <button className={styles.addStaffBtn} onClick={() => setShowStaffInstructions(true)}>
            <Icon name="solar:document-add-linear" size={16} color="var(--primary-300)" />
            Add Staff Instructions
          </button>
        ) : (
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Staff Instructions</label>
            <textarea
              className={styles.instructionTextarea}
              placeholder="Add Instructions for Staff"
              value={staffInstruction}
              onChange={e => setStaffInstruction(e.target.value)}
              rows={3}
              autoFocus
            />
          </div>
        )}
      </div>
    </Drawer>
  );
}
