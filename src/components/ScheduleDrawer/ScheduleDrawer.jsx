import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../Icon/Icon';
import { Button } from '../Button/Button';
import { Drawer } from '../Drawer/Drawer';
import { Avatar } from '../Avatar/Avatar';
import { ActionButton } from '../ActionButton/ActionButton';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';
import styles from './ScheduleDrawer.module.css';

const APPOINTMENT_TYPES = [
  { name: 'Annual Wellness Visit', code: 'AWV', mode: 'In-person', duration: '60 min', color: '#D9A50B' },
  { name: 'Follow-up Appointment', code: 'Routine', mode: 'In-person/Virtual', duration: '15-30 min', color: '#8C5AE2' },
  { name: 'Specialty Consultation', code: 'Routine', mode: 'In-person', duration: '45 min', color: '#009B53' },
  { name: 'Telehealth Consultation', code: 'Routine', mode: 'Virtual', duration: '30 min', color: '#145ECC' },
  { name: 'Lab Results Discussion', code: 'Routine', mode: 'Virtual', duration: '15 min', color: '#009B53' },
];

const MODE_OPTIONS = [
  { label: 'At Clinic', icon: 'solar:buildings-linear' },
  { label: 'Virtual/Telehealth', icon: 'solar:monitor-linear' },
];
const LOCATION_OPTIONS = ['Fold Health, New York', '7 Hills Department', '68th Street, New York', '168th Street, New York'];
const PROVIDER_OPTIONS = [
  { name: 'Ralph Kessler', gender: 'Male', dob: '03-29-1992', age: 31, slots: '6 Slots Available' },
  { name: 'Robert Langdon', gender: 'Male', dob: '11-20-1986', age: 30, slots: '3 Slots Available' },
  { name: 'Cameron Haley', gender: 'Male', dob: '11-23-1986', age: 35, slots: '1 Slots Available' },
  { name: 'Mrs. Andrew Mayer IV', gender: 'Male', dob: '11-25-1986', age: 30, slots: 'Not Available' },
  { name: 'Gayle Jacobs', gender: 'Male', dob: '12-02-1986', age: 31, slots: '4 Slots Available' },
];
const TIME_SLOTS = ['11:00 am', '11:15 am', '11:30 am', '11:45 am', '12:00 pm', '12:15 pm', '12:30 pm', '1:00 pm', '1:30 pm', '2:00 pm'];

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

/* ── Generic Detail Dropdown ── */
function DetailDropdown({ value, placeholder, icon, options, onSelect, renderItem }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  if (value) {
    return <button className={styles.detailValue} onClick={() => onSelect('')} style={{ cursor: 'pointer' }}><Icon name={icon} size={16} color="var(--neutral-300)" /> {value}</button>;
  }
  return (
    <div style={{ position: 'relative' }}>
      <button ref={btnRef} className={styles.detailValuePlaceholder} onClick={() => setOpen(v => !v)}><Icon name={icon} size={16} color="var(--neutral-200)" /> {placeholder}</button>
      {open && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setOpen(false)}>
          <div className={styles.simpleDropdown} style={{ position: 'fixed', top: btnRef.current?.getBoundingClientRect().bottom + 4, left: btnRef.current?.getBoundingClientRect().left, zIndex: 9999 }} onClick={e => e.stopPropagation()}>
            {options.map(opt => (
              <button key={opt.label} className={styles.simpleDropItem} onClick={() => { onSelect(opt.label); setOpen(false); }}>
                {renderItem ? renderItem(opt) : opt.label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ── Provider Picker (searchable with avatar + slots) ── */
function ProviderPicker({ value, onSelect, profileUsers = [], onAddSecondary }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const btnRef = useRef(null);

  // Merge DB users with fallback providers
  const allProviders = useMemo(() => {
    const dbUsers = profileUsers.map(u => ({ name: u.name, gender: 'Staff', dob: '', age: '', slots: 'Available' }));
    return dbUsers.length > 0 ? dbUsers : PROVIDER_OPTIONS;
  }, [profileUsers]);

  const filtered = allProviders.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  if (value) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
        <button className={styles.detailValue} onClick={() => onSelect('')} style={{ cursor: 'pointer', flex: 1 }}>
          <Avatar variant="assignee" initials={getInitials(value).toUpperCase()} /> {value}
        </button>
        <button className={styles.addSecondaryBtn} onClick={onAddSecondary}><Icon name="solar:user-plus-linear" size={14} color="var(--primary-300)" /> Add Secondary</button>
      </div>
    );
  }
  return (
    <div style={{ position: 'relative' }}>
      <button ref={btnRef} className={styles.detailValuePlaceholder} onClick={() => setOpen(v => !v)}><Icon name="solar:user-linear" size={16} color="var(--neutral-200)" /> Select Provider</button>
      {open && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setOpen(false)}>
          <div className={styles.providerDropdown} style={{ position: 'fixed', top: btnRef.current?.getBoundingClientRect().bottom + 4, left: btnRef.current?.getBoundingClientRect().left, zIndex: 9999 }} onClick={e => e.stopPropagation()}>
            <div className={styles.apptSearchWrap}><Icon name="solar:magnifer-linear" size={14} color="var(--neutral-200)" /><input className={styles.apptSearchInput} placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} autoFocus /></div>
            {filtered.map(p => (
              <button key={p.name} className={styles.providerItem} onClick={() => { onSelect(p.name); setOpen(false); }}>
                <Avatar variant="assignee" initials={getInitials(p.name).toUpperCase()} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--neutral-400)' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--neutral-200)' }}>{p.gender}</div>
                </div>
                <span style={{ fontSize: 12, color: p.slots === 'Not Available' ? 'var(--neutral-200)' : 'var(--primary-300)' }}>{p.slots || ''}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ── Secondary User Multi-Picker ── */
function SecondaryUserPicker({ selected, onChange, profileUsers, primary }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const btnRef = useRef(null);

  const allProviders = useMemo(() => {
    const dbUsers = profileUsers.map(u => u.name);
    const fallback = PROVIDER_OPTIONS.map(p => p.name);
    return (dbUsers.length > 0 ? dbUsers : fallback).filter(n => n !== primary);
  }, [profileUsers, primary]);

  const filtered = allProviders.filter(n => !search || n.toLowerCase().includes(search.toLowerCase()));
  const toggle = (name) => onChange(selected.includes(name) ? selected.filter(n => n !== name) : [...selected, name]);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, flex: 1 }}>
      {selected.map(name => (
        <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--neutral-400)', background: 'var(--neutral-50)', padding: '2px 8px', borderRadius: 4, border: '0.5px solid var(--neutral-100)' }}>
          <Avatar variant="assignee" initials={getInitials(name).toUpperCase()} /> {name}
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => toggle(name)}>
            <Icon name="solar:close-linear" size={10} color="var(--neutral-300)" />
          </button>
        </span>
      ))}
      <div style={{ position: 'relative' }}>
        <button ref={btnRef} className={styles.detailValuePlaceholder} onClick={() => setOpen(v => !v)} style={{ fontSize: 13 }}>
          <Icon name="solar:add-circle-linear" size={14} color="var(--primary-300)" /> {selected.length === 0 ? 'Select Secondary Users' : 'Add More'}
        </button>
        {open && createPortal(
          <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setOpen(false)}>
            <div className={styles.providerDropdown} style={{ position: 'fixed', top: btnRef.current?.getBoundingClientRect().bottom + 4, left: btnRef.current?.getBoundingClientRect().left, zIndex: 9999 }} onClick={e => e.stopPropagation()}>
              <div className={styles.apptSearchWrap}><Icon name="solar:magnifer-linear" size={14} color="var(--neutral-200)" /><input className={styles.apptSearchInput} placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} autoFocus /></div>
              {filtered.map(name => (
                <button key={name} className={styles.providerItem} onClick={() => toggle(name)} style={{ background: selected.includes(name) ? 'var(--primary-25)' : undefined }}>
                  <input type="checkbox" checked={selected.includes(name)} readOnly style={{ accentColor: 'var(--primary-300)', width: 15, height: 15 }} />
                  <Avatar variant="assignee" initials={getInitials(name).toUpperCase()} />
                  <span style={{ fontSize: 14, color: 'var(--neutral-400)' }}>{name}</span>
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}

/* ── Date Picker (simple calendar) ── */
function DatePicker({ value, onSelect }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const ref = useRef(null);
  useEffect(() => { if (!open) return; const c = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); }; document.addEventListener('click', c); return () => document.removeEventListener('click', c); }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  if (value) {
    return <button className={styles.detailValue} onClick={() => setOpen(true)} style={{ cursor: 'pointer' }}><Icon name="solar:calendar-linear" size={16} color="var(--neutral-300)" /> {value}</button>;
  }
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className={styles.detailValuePlaceholder} onClick={() => setOpen(v => !v)}><Icon name="solar:calendar-linear" size={16} color="var(--neutral-200)" /> Select Date</button>
      {open && (
        <div className={styles.calendarDropdown}>
          <div className={styles.calendarHeader}>
            <ActionButton icon="solar:alt-arrow-left-linear" size="S" onClick={() => setViewDate(new Date(year, month - 1, 1))} />
            <span className={styles.calendarTitle}>{monthNames[month]} {year}</span>
            <ActionButton icon="solar:alt-arrow-right-linear" size="S" onClick={() => setViewDate(new Date(year, month + 1, 1))} />
          </div>
          <div className={styles.calendarGrid}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className={styles.calendarDayLabel}>{d}</div>)}
            {days.map((d, i) => d ? (
              <button key={i} className={styles.calendarDay} onClick={() => { onSelect(`${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}-${year}`); setOpen(false); }}>{d}</button>
            ) : <div key={i} />)}
          </div>
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
  const [appointmentType, setAppointmentType] = useState(null);
  const [mode, setMode] = useState('');
  const [location, setLocation] = useState('');
  const [provider, setProvider] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [requireRsvp, setRequireRsvp] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);
  const [secondaryUsers, setSecondaryUsers] = useState([]);
  const [profileUsers, setProfileUsers] = useState([]);
  const [memberInstruction, setMemberInstruction] = useState('');
  const [showStaffInstructions, setShowStaffInstructions] = useState(false);
  const [staffInstruction, setStaffInstruction] = useState('');

  // Fetch staff users from profiles DB
  useEffect(() => {
    supabase.from('profiles').select('id, full_name, first_name, last_name, email, status').order('full_name').then(({ data }) => {
      if (data) setProfileUsers(data.filter(u => u.status === 'Active').map(u => ({
        name: u.full_name?.trim() || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
        email: u.email,
      })));
    });
  }, []);

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
                    <span style={{ color: '#009B53', display: 'inline-flex', alignItems: 'center', gap: 2 }}>+0.5 <Icon name="solar:arrow-up-linear" size={10} color="#009B53" /></span>
                  </div>
                </div>
                <ActionButton icon="solar:close-linear" size="S" tooltip="Remove" onClick={() => setSelectedPatient(null)} />
              </div>

              {/* Reason for Visit — always editable */}
              <div className={styles.reasonField}>
                <label className={styles.reasonLabel}>Reason for Visit</label>
                <input
                  className={styles.reasonInput}
                  placeholder="Enter Reason for Visit"
                  value={reasonForVisit}
                  onChange={e => setReasonForVisit(e.target.value)}
                />
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
            {/* Appointment Type */}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Appointment Type</span>
              <AppointmentTypePicker value={appointmentType} onSelect={setAppointmentType} />
            </div>

            {/* Mode of Appointment — dropdown */}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Mode of Appointment</span>
              <DetailDropdown
                value={mode}
                placeholder="Select Mode of Appointment"
                icon="solar:monitor-linear"
                options={MODE_OPTIONS.map(m => ({ label: m.label, icon: m.icon }))}
                onSelect={v => setMode(v)}
                renderItem={(opt) => <><Icon name={opt.icon} size={16} color="var(--neutral-300)" /> {opt.label}</>}
              />
            </div>

            {/* Location — dropdown */}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Location</span>
              <DetailDropdown
                value={location}
                placeholder="Select Location"
                icon="solar:map-point-linear"
                options={LOCATION_OPTIONS.map(l => ({ label: l }))}
                onSelect={v => setLocation(v)}
              />
            </div>

            {/* Primary User — dropdown with search, avatar, slots */}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Primary User</span>
              <ProviderPicker value={provider} onSelect={setProvider} profileUsers={profileUsers} onAddSecondary={() => setShowSecondary(true)} />
            </div>

            {/* Secondary Users */}
            {showSecondary && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Secondary User</span>
                <SecondaryUserPicker selected={secondaryUsers} onChange={setSecondaryUsers} profileUsers={profileUsers} primary={provider} />
              </div>
            )}

            {/* Date — calendar picker */}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Date</span>
              <DatePicker value={date} onSelect={setDate} />
              {date && (
                <div className={styles.recurringToggle}>
                  <label className={styles.switchLabel}>
                    <input type="checkbox" checked={recurring} onChange={() => setRecurring(v => !v)} className={styles.switchInput} />
                    <span className={styles.switchTrack}><span className={styles.switchThumb} /></span>
                  </label>
                  <span style={{ fontSize: 12, color: 'var(--neutral-300)' }}>Set Recurring</span>
                </div>
              )}
            </div>

            {/* Time — slot picker (shows after date is selected) */}
            {date && (
              <div className={styles.detailRow} style={{ flexWrap: 'wrap' }}>
                <span className={styles.detailLabel}>Time</span>
                <div className={styles.timeSlotArea}>
                  <div className={styles.timeSlotHeader}>
                    <span style={{ fontSize: 12, color: 'var(--neutral-300)' }}>Available Slots (15 mins)</span>
                    <button className={styles.pickTimeBtn}><Icon name="solar:clock-circle-linear" size={12} color="var(--primary-300)" /> Pick Time</button>
                    <span style={{ fontSize: 11, color: 'var(--neutral-200)' }}>USA (GMT-4)</span>
                  </div>
                  <div className={styles.timeSlots}>
                    {TIME_SLOTS.map(t => (
                      <button key={t} className={`${styles.timeSlot} ${time === t ? styles.timeSlotActive : ''}`} onClick={() => setTime(t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
            <div className={styles.instructionEditor}>
              <textarea
                className={styles.instructionTextarea}
                placeholder="Add Instructions for Staff"
                value={staffInstruction}
                onChange={e => setStaffInstruction(e.target.value)}
                rows={3}
                autoFocus
              />
              <div className={styles.instructionToolbar}>
                <ActionButton icon="solar:paperclip-linear" size="S" tooltip="Attach" />
                <span className={styles.toolbarDivider} />
                <ActionButton icon="solar:text-bold-linear" size="S" tooltip="Bold" />
                <ActionButton icon="solar:text-italic-linear" size="S" tooltip="Italic" />
                <ActionButton icon="solar:text-underline-linear" size="S" tooltip="Underline" />
                <div style={{ flex: 1 }} />
                <ActionButton icon="solar:trash-bin-minimalistic-linear" size="S" tooltip="Remove" state="error" onClick={() => { setShowStaffInstructions(false); setStaffInstruction(''); }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
