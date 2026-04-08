import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../../components/Icon/Icon';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { Avatar } from '../../components/Avatar/Avatar';
import { ScheduleDrawer, FALLBACK_APPOINTMENT_TYPES } from '../../components/ScheduleDrawer/ScheduleDrawer';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';
import styles from './CalendarView.module.css';

// Default calendar color configs (used when DB types aren't loaded yet)
const DEFAULT_CALENDARS = {
  awv:        { colorName: 'awv',        lightColors: { main: '#D9A50B', container: '#FEF9E7', onContainer: '#3A485F' }, darkColors: { main: '#D9A50B', container: '#4A3600', onContainer: '#FEF3CD' } },
  followup:   { colorName: 'followup',   lightColors: { main: '#8C5AE2', container: '#F5F0FF', onContainer: '#3A485F' }, darkColors: { main: '#8C5AE2', container: '#2D1B69', onContainer: '#E8D5FF' } },
  specialty:  { colorName: 'specialty',  lightColors: { main: '#009B53', container: '#F0FDF4', onContainer: '#3A485F' }, darkColors: { main: '#009B53', container: '#1B4332', onContainer: '#D1FAE5' } },
  telehealth: { colorName: 'telehealth', lightColors: { main: '#145ECC', container: '#EEF4FF', onContainer: '#3A485F' }, darkColors: { main: '#145ECC', container: '#1A2744', onContainer: '#C7DEFF' } },
  selection:  { colorName: 'selection',  lightColors: { main: '#8C5AE2', container: 'transparent', onContainer: '#8C5AE2' }, darkColors: { main: '#8C5AE2', container: 'transparent', onContainer: '#8C5AE2' } },
};

// Build calendar color configs dynamically from appointment types
function buildCalendars(appointmentTypes) {
  const cals = { selection: DEFAULT_CALENDARS.selection };
  for (const t of appointmentTypes) {
    const key = t.name.toLowerCase().replace(/\s+/g, '_').substring(0, 20);
    const c = t.color || '#8C5AE2';
    cals[key] = {
      colorName: key,
      lightColors: { main: c, container: `${c}15`, onContainer: '#3A485F' },
      darkColors: { main: c, container: `${c}33`, onContainer: '#E0E0E0' },
    };
  }
  return cals;
}

// ── Timezone helpers ──
const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'IST (GMT+5:30)' },
  { value: 'America/New_York', label: 'EST (GMT-5)' },
  { value: 'America/Chicago', label: 'CST (GMT-6)' },
  { value: 'America/Denver', label: 'MST (GMT-7)' },
  { value: 'America/Los_Angeles', label: 'PST (GMT-8)' },
  { value: 'Europe/London', label: 'GMT (GMT+0)' },
  { value: 'Europe/Berlin', label: 'CET (GMT+1)' },
  { value: 'Asia/Dubai', label: 'GST (GMT+4)' },
  { value: 'Asia/Tokyo', label: 'JST (GMT+9)' },
  { value: 'Australia/Sydney', label: 'AEST (GMT+11)' },
];

function getTimezoneOffset(tz) {
  try {
    const parts = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'shortOffset' }).formatToParts(new Date());
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    return tzPart?.value || 'GMT';
  } catch { return 'GMT'; }
}

function getTodayInTimezone(tz) {
  return new Date().toLocaleDateString('en-CA', { timeZone: tz }); // YYYY-MM-DD
}

function getNowInTimezone(tz) {
  const str = new Date().toLocaleString('en-US', { timeZone: tz, hour: 'numeric', minute: 'numeric', hour12: false });
  const [h, m] = str.split(':').map(Number);
  return { hours: h, minutes: m };
}

const BROWSER_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';

// Map a DB appointment row to a schedule-x event object (needs Temporal T + timezone)
function apptToEvent(appt, appointmentTypes, T, tz) {
  function toDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    const [mo, dd, yyyy] = dateStr.split('-');
    const match = timeStr.match(/(\d+):(\d+)\s*(am|pm)/i);
    if (!match) return null;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const p = match[3].toLowerCase();
    if (p === 'pm' && h < 12) h += 12;
    if (p === 'am' && h === 12) h = 0;
    return `${yyyy}-${mo}-${dd} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  const startStr = toDateTime(appt.date, appt.time_start);
  const endStr = toDateTime(appt.date, appt.time_end);
  if (!startStr || !endStr) return null;

  const [sd, st] = startStr.split(' ');
  const [ed, et] = endStr.split(' ');
  const start = T.PlainDateTime.from(`${sd}T${st}`).toZonedDateTime(tz);
  const end = T.PlainDateTime.from(`${ed}T${et}`).toZonedDateTime(tz);

  const calId = appt.calendar_id || 'followup';

  return {
    id: appt.id,
    start,
    end,
    title: appt.patient_name || 'Appointment',
    description: `${appt.appointment_type_name || ''} • ${appt.status || 'Scheduled'}`,
    calendarId: calId,
  };
}

const LOCATIONS = ['Fold Health, NY', '7 Hills Department', '68th Street'];
const STATUSES = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'];

const VIEWS = ['week', 'day', 'month-grid'];
const VIEW_LABELS = { 'week': 'Week', 'day': 'Day', 'month-grid': 'Month' };

function CalendarContent({ onSlotClick, onEventClick, calendarRef, eventsPluginRef, dbAppointments, appointmentTypes, timezone }) {
  const [calendarApp, setCalendarApp] = useState(null);
  const [SXCalendar, setSXCalendar] = useState(null);
  const [error, setError] = useState(null);
  const internalPluginRef = useRef(null);

  // Use refs for callbacks so the calendar always calls the latest handlers
  const slotClickRef = useRef(onSlotClick);
  const eventClickRef = useRef(onEventClick);
  slotClickRef.current = onSlotClick;
  eventClickRef.current = onEventClick;

  // Initialize calendar ONCE
  useEffect(() => {
    (async () => {
      try {
        const temporalMod = await import('temporal-polyfill');
        if (typeof globalThis.Temporal === 'undefined') {
          globalThis.Temporal = temporalMod.Temporal;
        }

        const calMod = await import('@schedule-x/calendar');
        const reactMod = await import('@schedule-x/react');
        const eventsMod = await import('@schedule-x/events-service');
        await import('@schedule-x/theme-default/dist/index.css');

        const eventsPlugin = eventsMod.createEventsServicePlugin();
        internalPluginRef.current = eventsPlugin;
        if (eventsPluginRef) eventsPluginRef.current = eventsPlugin;

        const app = calMod.createCalendar({
          views: [calMod.createViewWeek(), calMod.createViewDay(), calMod.createViewMonthGrid()],
          defaultView: 'week',
          events: [],
          calendars: DEFAULT_CALENDARS,
          dayBoundaries: { start: '00:00', end: '23:00' },
          weekOptions: { gridHeight: 2000, nDays: 7 },
          locale: 'en-US',
          callbacks: {
            onClickDateTime: (dateTime) => { if (slotClickRef.current) slotClickRef.current(dateTime); },
            onClickDate: (date) => { if (slotClickRef.current) slotClickRef.current(date); },
            onEventClick: (event) => { if (eventClickRef.current && event.id !== '__selection__') eventClickRef.current(event); },
          },
        }, [eventsPlugin]);

        calendarRef.current = app;
        setSXCalendar(() => reactMod.ScheduleXCalendar);
        setCalendarApp(app);
      } catch (err) {
        console.error('Schedule-X init error:', err);
        setError(err.message);
      }
    })();
  }, []);

  // Sync events dynamically when DB data changes (without recreating calendar)
  useEffect(() => {
    const ep = internalPluginRef.current;
    const T = globalThis.Temporal;
    if (!ep || !T) return;

    // Use BROWSER_TIMEZONE (not user-selected) for event positioning
    // Times are stored as wall-clock strings — they should always appear at the literal time
    const newEvents = (dbAppointments || [])
      .map(a => apptToEvent(a, appointmentTypes, T, BROWSER_TIMEZONE))
      .filter(Boolean);

    // Replace all events (except __selection__) with fresh DB events
    try {
      const existing = ep.getAll();
      for (const e of existing) {
        if (e.id !== '__selection__') ep.remove(e.id);
      }
    } catch {}
    for (const e of newEvents) {
      try { ep.add(e); } catch {}
    }

    // Mark cancelled events in the DOM with a CSS class (retry to catch late renders)
    const cancelledIds = (dbAppointments || []).filter(a => a.status === 'Cancelled').map(a => a.id);
    const applyCancelledClass = () => {
      cancelledIds.forEach(id => {
        const el = document.querySelector(`[data-event-id="${id}"]`);
        if (el && !el.classList.contains('is-cancelled')) el.classList.add('is-cancelled');
      });
    };
    const t1 = setTimeout(applyCancelledClass, 100);
    const t2 = setTimeout(applyCancelledClass, 300);
    const t3 = setTimeout(applyCancelledClass, 600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [dbAppointments, appointmentTypes]);

  if (error) return <div style={{ padding: 32, color: 'var(--status-error)', fontFamily: 'Inter' }}>Calendar error: {error}</div>;
  if (!calendarApp || !SXCalendar) return <div style={{ padding: 32, color: 'var(--neutral-300)', textAlign: 'center', fontFamily: 'Inter' }}>Loading calendar...</div>;

  return <SXCalendar calendarApp={calendarApp} />;
}

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '');
}

/* ── User Picker Dropdown (ProviderPicker-style for calendar toolbar) ── */
function UserPickerDropdown({ users, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const btnRef = useRef(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(u => u.name.toLowerCase().includes(q));
  }, [users, search]);

  const selectedName = value === 'all' ? 'All Users' : users.find(u => u.id === value)?.name || 'All Users';

  return (
    <div style={{ position: 'relative' }}>
      <button ref={btnRef} onClick={() => setOpen(v => !v)} className={styles.userPickerTrigger}>
        <span>{selectedName}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0 opacity-60"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => { setOpen(false); setSearch(''); }}>
          <div className={styles.userPickerDropdown} style={{ position: 'fixed', top: btnRef.current?.getBoundingClientRect().bottom + 4, left: btnRef.current?.getBoundingClientRect().left, zIndex: 9999 }} onClick={e => e.stopPropagation()}>
            <div className={styles.userPickerSearch}>
              <Icon name="solar:magnifer-linear" size={14} color="var(--neutral-200)" />
              <input placeholder="Search users" value={search} onChange={e => setSearch(e.target.value)} autoFocus />
            </div>
            <button className={`${styles.userPickerItem} ${value === 'all' ? styles.userPickerItemActive : ''}`} onClick={() => { onChange('all'); setOpen(false); setSearch(''); }}>
              <Icon name="solar:users-group-rounded-linear" size={16} color="var(--neutral-300)" />
              <span>All Users</span>
            </button>
            {filtered.map(u => (
              <button key={u.id} className={`${styles.userPickerItem} ${value === u.id ? styles.userPickerItemActive : ''}`} onClick={() => { onChange(u.id); setOpen(false); setSearch(''); }}>
                <Avatar variant="assignee" initials={getInitials(u.name).toUpperCase()} />
                <span>{u.name}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function CalendarView() {
  const [currentView, setCurrentView] = useState('week');
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const calendarRef = useRef(null);
  const eventsPluginRef = useRef(null);
  const [timezone, setTimezone] = useState(BROWSER_TIMEZONE);
  const timezoneLabel = getTimezoneOffset(timezone);

  const [calendarTitle, setCalendarTitle] = useState(() => {
    const today = getTodayInTimezone(timezone);
    const [y, m] = today.split('-');
    return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
  });

  // Filter state
  const [filterUser, setFilterUser] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch appointments and appointment types from store
  const appointments = useAppStore(s => s.appointments);
  const appointmentTypes = useAppStore(s => s.appointmentTypes);
  const fetchAppointments = useAppStore(s => s.fetchAppointments);
  const fetchAppointmentTypes = useAppStore(s => s.fetchAppointmentTypes);

  useEffect(() => {
    fetchAppointments();
    fetchAppointmentTypes();
  }, []);

  // Use DB types for filter dropdown, fall back to hardcoded
  const apptTypesForFilter = appointmentTypes.length > 0 ? appointmentTypes : FALLBACK_APPOINTMENT_TYPES;

  // Fetch users from Supabase profiles
  const [users, setUsers] = useState([]);
  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, full_name, email, status')
      .order('full_name')
      .then(({ data }) => {
        if (data?.length) {
          setUsers(data.map(u => ({
            id: u.id,
            name: u.full_name?.trim() || u.email?.split('@')[0] || 'Unknown',
          })));
        }
      });
  }, []);

  // Filter appointments by selected user and type
  const filteredAppointments = useMemo(() => {
    let filtered = appointments || [];
    if (filterUser !== 'all') {
      const userName = users.find(u => u.id === filterUser)?.name;
      if (userName) filtered = filtered.filter(a => a.primary_user === userName);
    }
    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.appointment_type_name === filterType);
    }
    return filtered;
  }, [appointments, filterUser, filterType, users]);

  const handleViewChange = (view) => {
    setCurrentView(view);
    const app = calendarRef.current;
    if (app?.$app?.calendarState) {
      const selectedDate = app.$app.datePickerState?.selectedDate?.value || new Date().toISOString().split('T')[0];
      app.$app.calendarState.setView(view, selectedDate);
    }
  };

  const handleToday = () => {
    const app = calendarRef.current;
    if (!app?.$app) return;
    const T = globalThis.Temporal;
    if (T) {
      app.$app.datePickerState.selectedDate.value = T.Now.plainDateISO(timezone);
      setTimeout(() => { updateTitle(); applyPastOverlays(); applyTimeIndicator(); }, 50);
    }
  };

  const navigateCalendar = useCallback((direction) => {
    const app = calendarRef.current;
    if (!app?.$app) return;
    const $app = app.$app;
    const currentView = $app.config.views.value.find(v => v.name === $app.calendarState.view.value);
    if (!currentView) return;
    const units = direction === 'forward' ? currentView.backwardForwardUnits : -currentView.backwardForwardUnits;
    $app.datePickerState.selectedDate.value = currentView.backwardForwardFn($app.datePickerState.selectedDate.value, units);
  }, []);

  const updateTitle = useCallback(() => {
    const app = calendarRef.current;
    if (!app?.$app) return;
    const dateVal = app.$app.datePickerState?.selectedDate?.value;
    if (dateVal) {
      // dateVal is a Temporal.PlainDate — has .year and .month
      const m = typeof dateVal.month === 'number' ? dateVal.month - 1 : new Date().getMonth();
      const y = typeof dateVal.year === 'number' ? dateVal.year : new Date().getFullYear();
      setCalendarTitle(`${MONTH_NAMES[m]} ${y}`);
    }
  }, []);

  const handlePrev = () => { navigateCalendar('backward'); setTimeout(() => { updateTitle(); applyPastOverlays(); applyTimeIndicator(); }, 50); };
  const handleNext = () => { navigateCalendar('forward'); setTimeout(() => { updateTitle(); applyPastOverlays(); applyTimeIndicator(); }, 50); };

  const clearSelection = useCallback(() => {
    const ep = eventsPluginRef.current;
    if (ep) {
      try { ep.remove('__selection__'); } catch {}
    }
  }, []);

  const showToast = useAppStore(s => s.showToast);

  const handleSlotClick = useCallback((dateTime) => {
    // Skip if an event click just happened (both callbacks fire for event clicks)
    if (eventClickRef.current) return;

    // Prevent booking in the past (must be at least 15 min from now)
    const T = globalThis.Temporal;
    if (T && dateTime?.epochMilliseconds) {
      const now = T.Now.zonedDateTimeISO(timezone);
      const minTime = now.add({ minutes: 15 });
      if (dateTime.epochMilliseconds < minTime.epochMilliseconds) {
        showToast('Cannot book in the past. Appointment must be at least 15 minutes from now.');
        return;
      }
    }

    // Check for overlapping events using the eventsPlugin (always in sync)
    const ep = eventsPluginRef.current;
    if (ep && T && dateTime?.add) {
      const clickStart = dateTime.epochMilliseconds;
      const clickEnd = dateTime.add({ minutes: 30 }).epochMilliseconds;
      try {
        const allEvents = ep.getAll();
        const hasOverlap = allEvents.some(e => {
          if (e.id === '__selection__') return false;
          return clickStart < e.end.epochMilliseconds && clickEnd > e.start.epochMilliseconds;
        });
        if (hasOverlap) return; // Slot occupied — onEventClick will handle it
      } catch {}
    }

    setClickedAppointment(null);
    setSelectedSlot(dateTime);
    setShowSchedule(true);

    // Add a 30-min selection block on the time grid
    if (ep && T && dateTime?.add) {
      clearSelection();
      const end = dateTime.add({ minutes: 30 });
      ep.add({
        id: '__selection__',
        start: dateTime,
        end,
        title: 'New Appointment',
        calendarId: 'selection',
      });
    }
  }, [clearSelection]);

  const [clickedAppointment, setClickedAppointment] = useState(null);
  const eventClickRef = useRef(false);

  const handleEventClick = useCallback((event) => {
    // Flag that an event click just happened — prevents handleSlotClick from overriding
    eventClickRef.current = true;
    setTimeout(() => { eventClickRef.current = false; }, 100);
    const appt = appointments.find(a => a.id === event.id);
    setClickedAppointment(appt || null);
    setSelectedSlot(event.start);
    setShowSchedule(true);
  }, [appointments]);

  const handleCloseDrawer = useCallback(() => {
    setShowSchedule(false);
    setClickedAppointment(null);
    clearSelection();
    // Re-apply cancelled styles after drawer closes (data may have changed via fetchAppointments)
    const applyCancelled = () => {
      const store = useAppStore.getState();
      (store.appointments || []).filter(a => a.status === 'Cancelled').forEach(a => {
        const el = document.querySelector(`[data-event-id="${a.id}"]`);
        if (el && !el.classList.contains('is-cancelled')) el.classList.add('is-cancelled');
      });
    };
    setTimeout(applyCancelled, 300);
    setTimeout(applyCancelled, 800);
    setTimeout(applyCancelled, 1500);
  }, [clearSelection]);

  // Reusable functions for past-day overlays and time indicator
  const applyPastOverlays = useCallback(() => {
    const today = getTodayInTimezone(timezone);
    document.querySelectorAll('.sx__week-grid__date').forEach(dateEl => {
      const dateStr = dateEl.getAttribute('data-date');
      dateEl.style.opacity = (dateStr && dateStr < today) ? '0.4' : '';
    });
    document.querySelectorAll('.sx__time-grid-day').forEach((dayCol, i) => {
      dayCol.querySelectorAll('[data-past-overlay]').forEach(el => el.remove());
      const dateEls = document.querySelectorAll('.sx__week-grid__date');
      const dateStr = dateEls[i]?.getAttribute('data-date');
      if (dateStr && dateStr < today) {
        const overlay = document.createElement('div');
        overlay.setAttribute('data-past-overlay', '1');
        overlay.className = styles.pastDayOverlay;
        dayCol.appendChild(overlay);
      }
    });
    // Also handle month view past days
    document.querySelectorAll('.sx__date-grid-day').forEach(cell => {
      cell.querySelectorAll('[data-past-overlay]').forEach(el => el.remove());
      const dateStr = cell.getAttribute('data-date');
      if (dateStr && dateStr < today) {
        cell.style.opacity = '0.5';
      } else {
        cell.style.opacity = '';
      }
    });
  }, [timezone]);

  const applyTimeIndicator = useCallback(() => {
    const START_HOUR = 0, END_HOUR = 23, GRID_HEIGHT = 2000;
    const weekGridEl = document.querySelector('.sx__week-grid');
    if (!weekGridEl) return;
    weekGridEl.querySelectorAll('[data-time-indicator]').forEach(el => el.remove());
    const { hours, minutes } = getNowInTimezone(timezone);
    const totalMinutesFromStart = (hours - START_HOUR) * 60 + minutes;
    if (totalMinutesFromStart >= 0 && totalMinutesFromStart <= (END_HOUR - START_HOUR) * 60) {
      const topPx = (totalMinutesFromStart / ((END_HOUR - START_HOUR) * 60)) * GRID_HEIGHT;
      const line = document.createElement('div');
      line.setAttribute('data-time-indicator', '1');
      line.className = styles.currentTimeLine;
      line.style.top = `${topPx}px`;
      weekGridEl.appendChild(line);
    }
  }, [timezone]);

  // Hover preview overlay for 30-min slot selection
  const hoverRef = useRef(null);
  useEffect(() => {
    const START_HOUR = 0;
    const END_HOUR = 23;
    const GRID_HEIGHT = 2000;
    const TOTAL_HOURS = END_HOUR - START_HOUR;
    const PX_PER_HOUR = GRID_HEIGHT / TOTAL_HOURS;
    const PX_PER_30 = PX_PER_HOUR / 2;

    function formatTime(h, m) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
    }

    function getOrCreateOverlay() {
      if (hoverRef.current) return hoverRef.current;
      const el = document.createElement('div');
      el.className = styles.hoverPreview;
      hoverRef.current = el;
      return el;
    }

    function handleMove(e) {
      // Hide preview when hovering over an existing event
      if (e.target.closest('.sx__event')) {
        const overlay = hoverRef.current;
        if (overlay) overlay.style.opacity = '0';
        return;
      }
      const col = e.currentTarget;
      const rect = col.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const slotIndex = Math.floor(y / PX_PER_30);
      const snappedY = slotIndex * PX_PER_30;
      const totalMinutes = (START_HOUR * 60) + (slotIndex * 30);
      const startH = Math.floor(totalMinutes / 60);
      const startM = totalMinutes % 60;
      const endH = Math.floor((totalMinutes + 30) / 60);
      const endM = (totalMinutes + 30) % 60;

      if (startH >= END_HOUR) return;

      const overlay = getOrCreateOverlay();
      if (overlay.parentElement !== col) col.appendChild(overlay);
      overlay.style.top = `${snappedY}px`;
      overlay.style.height = `${PX_PER_30}px`;
      overlay.textContent = `${formatTime(startH, startM)} – ${formatTime(endH, endM)}`;
      overlay.style.opacity = '1';
    }

    function handleLeave() {
      const overlay = hoverRef.current;
      if (overlay) overlay.style.opacity = '0';
    }

    // Attach after a short delay to let schedule-x render
    const timer = setTimeout(() => {
      const days = document.querySelectorAll('.sx__time-grid-day');
      days.forEach(day => {
        day.addEventListener('mousemove', handleMove);
        day.addEventListener('mouseleave', handleLeave);
      });

      // Inject/update timezone label
      const weekGrid = document.querySelector('.sx__week-grid');
      document.querySelectorAll('[data-tz-label]').forEach(el => el.remove());
      if (weekGrid) {
        const tzEl = document.createElement('div');
        tzEl.setAttribute('data-tz-label', '1');
        tzEl.className = styles.timezoneLabel;
        tzEl.textContent = timezoneLabel;
        weekGrid.insertBefore(tzEl, weekGrid.firstChild);
      }

      // Apply past-day overlays and time indicator
      applyPastOverlays();
      applyTimeIndicator();
    }, 800);

    return () => {
      clearTimeout(timer);
      const days = document.querySelectorAll('.sx__time-grid-day');
      days.forEach(day => {
        day.removeEventListener('mousemove', handleMove);
        day.removeEventListener('mouseleave', handleLeave);
      });
      if (hoverRef.current?.parentElement) {
        hoverRef.current.parentElement.removeChild(hoverRef.current);
      }
      hoverRef.current = null;
    };
  }, [currentView, timezone, timezoneLabel, applyPastOverlays, applyTimeIndicator]);

  return (
    <div className={styles.wrapper}>
      {/* Our custom toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h2 className={styles.monthTitle}>{calendarTitle}</h2>
          <div className={styles.viewTabs}>
            {VIEWS.map(v => (
              <button key={v} className={`${styles.viewTab} ${currentView === v ? styles.viewTabActive : ''}`} onClick={() => handleViewChange(v)}>
                {VIEW_LABELS[v]}
              </button>
            ))}
          </div>
          <button className={styles.todayBtn} onClick={handleToday}>Today</button>
          <ActionButton icon="solar:alt-arrow-left-linear" size="S" tooltip="Previous" onClick={handlePrev} />
          <ActionButton icon="solar:alt-arrow-right-linear" size="S" tooltip="Next" onClick={handleNext} />
        </div>
        <div className={styles.toolbarRight}>
          {/* Users — fetched from Supabase profiles, with search + avatars */}
          <UserPickerDropdown users={users} value={filterUser} onChange={setFilterUser} />

          {/* Locations */}
          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="h-7 text-xs min-w-[120px] max-w-[160px]">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {LOCATIONS.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Appointment Types — from DB or fallback */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-7 text-xs min-w-[140px] max-w-[180px]">
              <SelectValue placeholder="All Appointment Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Appointment Types</SelectItem>
              {apptTypesForFilter.map(t => (
                <SelectItem key={t.name} value={t.name}>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
                    {t.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-7 text-xs min-w-[100px] max-w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUSES.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Timezone */}
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="h-7 text-xs min-w-[100px] max-w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONE_OPTIONS.map(tz => (
                <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className={styles.availabilityToggle}>
            <input type="checkbox" />
            <span>Availability</span>
          </label>
          <ActionButton icon="solar:tuning-2-linear" size="L" tooltip="Settings" />
          <ActionButton icon="solar:info-circle-linear" size="L" tooltip="Help" />
        </div>
      </div>

      {/* Calendar — schedule-x header hidden via CSS */}
      <div className={styles.calendarWrap}>
        <CalendarContent
          onSlotClick={handleSlotClick}
          onEventClick={handleEventClick}
          calendarRef={calendarRef}
          eventsPluginRef={eventsPluginRef}
          dbAppointments={filteredAppointments}
          appointmentTypes={apptTypesForFilter}
          timezone={timezone}
        />
      </div>

      {/* Schedule drawer opens when clicking a time slot */}
      {showSchedule && <ScheduleDrawer selectedSlot={selectedSlot} existingAppointment={clickedAppointment} onClose={handleCloseDrawer} onSave={fetchAppointments} timezoneLabel={timezoneLabel} />}
    </div>
  );
}
