import { useState, useEffect, useCallback, useRef } from 'react';
import { Icon } from '../../components/Icon/Icon';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { ScheduleDrawer } from '../../components/ScheduleDrawer/ScheduleDrawer';
import styles from './CalendarView.module.css';

const RAW_EVENTS = [
  { id: '1', title: 'Richard Wilson', start: '2026-04-07 09:00', end: '2026-04-07 10:30', description: 'Back Pain • CCM First Visit', calendarId: 'scheduled' },
  { id: '2', title: 'Elaine Beatty', start: '2026-04-08 11:00', end: '2026-04-08 12:00', description: 'Follow-up • Scheduled', calendarId: 'scheduled' },
  { id: '3', title: 'Carlos Hernandez', start: '2026-04-07 14:00', end: '2026-04-07 15:00', description: 'Annual Wellness Visit • Confirmed', calendarId: 'confirmed' },
  { id: '4', title: 'William Davis', start: '2026-04-09 10:00', end: '2026-04-09 10:30', description: 'Telehealth • Scheduled', calendarId: 'scheduled' },
  { id: '5', title: 'Ralph Halvorson', start: '2026-04-10 11:00', end: '2026-04-10 12:00', description: 'Specialty Consultation • Confirmed', calendarId: 'confirmed' },
  { id: '6', title: 'Elena Garcia', start: '2026-04-11 08:30', end: '2026-04-11 09:30', description: 'Lab Results • Scheduled', calendarId: 'scheduled' },
];

const FILTER_OPTIONS = {
  users: ['All Users', 'Dr. Katherine Moss', 'Dr. James Chen', 'Ralph Kessler'],
  locations: ['All Locations', 'Fold Health, NY', '7 Hills Department', '68th Street'],
  types: ['All Appointment Types', 'AWV', 'Follow-up', 'Specialty', 'Telehealth'],
  status: ['All Status', 'Scheduled', 'Confirmed', 'Completed', 'Cancelled'],
};

const VIEWS = ['week', 'day', 'month-grid'];
const VIEW_LABELS = { 'week': 'Week', 'day': 'Day', 'month-grid': 'Month' };

function CalendarContent({ onSlotClick, calendarRef }) {
  const [calendarApp, setCalendarApp] = useState(null);
  const [SXCalendar, setSXCalendar] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const temporalMod = await import('temporal-polyfill');
        if (typeof globalThis.Temporal === 'undefined') {
          globalThis.Temporal = temporalMod.Temporal;
        }
        const T = globalThis.Temporal;

        function toZDT(str) {
          const [date, time] = str.split(' ');
          return T.PlainDateTime.from(`${date}T${time}`).toZonedDateTime('America/New_York');
        }

        const events = RAW_EVENTS.map(e => ({ ...e, start: toZDT(e.start), end: toZDT(e.end) }));

        const calMod = await import('@schedule-x/calendar');
        const reactMod = await import('@schedule-x/react');
        const eventsMod = await import('@schedule-x/events-service');
        await import('@schedule-x/theme-default/dist/index.css');

        const eventsPlugin = eventsMod.createEventsServicePlugin();
        const app = calMod.createCalendar({
          views: [calMod.createViewWeek(), calMod.createViewDay(), calMod.createViewMonthGrid()],
          defaultView: 'week',
          events,
          calendars: {
            scheduled: { colorName: 'scheduled', lightColors: { main: '#8C5AE2', container: '#F5F0FF', onContainer: '#3A485F' }, darkColors: { main: '#8C5AE2', container: '#2D1B69', onContainer: '#E8D5FF' } },
            confirmed: { colorName: 'confirmed', lightColors: { main: '#009B53', container: '#F0FDF4', onContainer: '#3A485F' }, darkColors: { main: '#009B53', container: '#1B4332', onContainer: '#D1FAE5' } },
          },
          dayBoundaries: { start: '06:00', end: '20:00' },
          weekOptions: { gridHeight: 2000, nDays: 7 },
          locale: 'en-US',
          callbacks: {
            onClickDateTime: (dateTime) => { if (onSlotClick) onSlotClick(dateTime); },
            onClickDate: (date) => { if (onSlotClick) onSlotClick(date); },
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

  if (error) return <div style={{ padding: 32, color: 'var(--status-error)', fontFamily: 'Inter' }}>Calendar error: {error}</div>;
  if (!calendarApp || !SXCalendar) return <div style={{ padding: 32, color: 'var(--neutral-300)', textAlign: 'center', fontFamily: 'Inter' }}>Loading calendar...</div>;

  return <SXCalendar calendarApp={calendarApp} />;
}

export function CalendarView() {
  const [currentView, setCurrentView] = useState('week');
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const calendarRef = useRef(null);

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
      app.$app.datePickerState.selectedDate.value = T.Now.plainDateISO();
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

  const handlePrev = () => navigateCalendar('backward');
  const handleNext = () => navigateCalendar('forward');

  const handleSlotClick = useCallback((dateTime) => {
    setSelectedSlot(dateTime);
    setShowSchedule(true);
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* Our custom toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h2 className={styles.monthTitle}>April 2026</h2>
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
          {Object.values(FILTER_OPTIONS).map((opts, i) => (
            <select key={i} className={styles.filterSelect}>
              {opts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
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
        <CalendarContent onSlotClick={handleSlotClick} calendarRef={calendarRef} />
      </div>

      {/* Schedule drawer opens when clicking a time slot */}
      {showSchedule && <ScheduleDrawer onClose={() => setShowSchedule(false)} />}
    </div>
  );
}
