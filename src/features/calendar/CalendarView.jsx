import { useState, useMemo, useCallback } from 'react';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createViewWeek, createViewDay, createViewMonthGrid } from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import '@schedule-x/theme-default/dist/index.css';
import { Icon } from '../../components/Icon/Icon';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import styles from './CalendarView.module.css';

/* ── Sample events ── */
const SAMPLE_EVENTS = [
  { id: '1', title: 'Richard Wilson', start: '2026-04-07 01:00', end: '2026-04-07 02:30', description: 'Back Pain\nCCM First Visit (G0506)', calendarId: 'scheduled' },
  { id: '2', title: 'Elaine Beatty', start: '2026-04-08 03:00', end: '2026-04-08 04:30', description: 'Chief complaint/reason for visit\nF/U • Scheduled', calendarId: 'scheduled' },
  { id: '3', title: 'Ms. Jonathan Rosenba...', start: '2026-04-09 05:00', end: '2026-04-09 06:30', description: 'Chief complaint/reason for visit\nF/U • Scheduled', calendarId: 'scheduled' },
  { id: '4', title: 'Carlos Hernandez', start: '2026-04-07 09:00', end: '2026-04-07 10:00', description: 'Annual Wellness Visit\nAWV • Confirmed', calendarId: 'confirmed' },
  { id: '5', title: 'William Davis', start: '2026-04-08 10:00', end: '2026-04-08 10:30', description: 'Follow-up\nRoutine • Scheduled', calendarId: 'scheduled' },
  { id: '6', title: 'James Rivera', start: '2026-04-09 14:00', end: '2026-04-09 15:00', description: 'Specialty Consultation\nRoutine • Scheduled', calendarId: 'scheduled' },
  { id: '7', title: 'Ralph Halvorson', start: '2026-04-10 11:00', end: '2026-04-10 12:00', description: 'Telehealth\nVirtual • Confirmed', calendarId: 'confirmed' },
  { id: '8', title: 'Elena Garcia', start: '2026-04-11 08:00', end: '2026-04-11 09:00', description: 'Lab Results\nRoutine • Scheduled', calendarId: 'scheduled' },
];

const FILTER_OPTIONS = {
  users: ['All Users', 'Dr. Katherine Moss', 'Dr. James Chen', 'Ralph Kessler'],
  locations: ['All Locations', 'Fold Health, NY', '7 Hills Department', '68th Street'],
  types: ['All Appointment Types', 'AWV', 'Follow-up', 'Specialty', 'Telehealth'],
  status: ['All Status', 'Scheduled', 'Confirmed', 'Completed', 'Cancelled'],
};

function FilterDropdown({ label, options }) {
  return (
    <select className={styles.filterSelect}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function CalendarView() {
  const eventsService = useState(() => createEventsServicePlugin())[0];

  const calendar = useCalendarApp({
    views: [createViewWeek(), createViewDay(), createViewMonthGrid()],
    defaultView: 'week',
    events: SAMPLE_EVENTS,
    calendars: {
      scheduled: { colorName: 'scheduled', lightColors: { main: '#8C5AE2', container: '#F5F0FF', onContainer: '#3A485F' }, darkColors: { main: '#8C5AE2', container: '#2D1B69', onContainer: '#E8D5FF' } },
      confirmed: { colorName: 'confirmed', lightColors: { main: '#009B53', container: '#F0FDF4', onContainer: '#3A485F' }, darkColors: { main: '#009B53', container: '#1B4332', onContainer: '#D1FAE5' } },
    },
    dayBoundaries: { start: '00:00', end: '23:59' },
    weekOptions: { gridHeight: 1200, nDays: 7 },
    locale: 'en-US',
  }, [eventsService]);

  return (
    <div className={styles.wrapper}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <h2 className={styles.monthTitle}>April 2026</h2>
          <select className={styles.viewSelect}>
            <option value="week">Week</option>
            <option value="day">Day</option>
            <option value="month">Month</option>
          </select>
          <button className={styles.todayBtn}>Today</button>
          <ActionButton icon="solar:alt-arrow-left-linear" size="S" tooltip="Previous" />
          <ActionButton icon="solar:alt-arrow-right-linear" size="S" tooltip="Next" />
        </div>
        <div className={styles.toolbarRight}>
          <FilterDropdown options={FILTER_OPTIONS.users} />
          <FilterDropdown options={FILTER_OPTIONS.locations} />
          <FilterDropdown options={FILTER_OPTIONS.types} />
          <FilterDropdown options={FILTER_OPTIONS.status} />
          <label className={styles.availabilityToggle}>
            <input type="checkbox" />
            <span>Availability</span>
          </label>
          <ActionButton icon="solar:tuning-2-linear" size="L" tooltip="Settings" />
          <ActionButton icon="solar:info-circle-linear" size="L" tooltip="Help" />
        </div>
      </div>

      {/* Calendar */}
      <div className={styles.calendarWrap}>
        {calendar && <ScheduleXCalendar calendarApp={calendar} />}
      </div>
    </div>
  );
}
