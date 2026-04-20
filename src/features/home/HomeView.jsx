import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GridLayout from 'react-grid-layout/legacy';
import { Icon } from '../../components/Icon/Icon';
import { WelcomeCard } from './WelcomeCard';
import { AlertsMonitoringCard } from './AlertsMonitoringCard';
import { AssignedToMeCard } from './AssignedToMeCard';
import { TodayCalendarCard } from './TodayCalendarCard';
import { TasksCard } from './TasksCard';
import { QuickNotesCard } from './QuickNotesCard';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import styles from './HomeView.module.css';

const STORAGE_KEY = 'home-dashboard-layout-v2';
const DRAG_HANDLE = 'home-drag-handle';
const COLS = 12;
const ROW_HEIGHT = 40;

const DEFAULT_LAYOUT = [
  { i: 'welcome',  x: 0, y: 0,  w: 6, h: 4,  minW: 4, minH: 4, maxH: 6 },
  { i: 'alerts',   x: 0, y: 4,  w: 6, h: 16, minW: 4, minH: 8 },
  { i: 'assigned', x: 6, y: 0,  w: 3, h: 5,  minW: 2, minH: 3 },
  { i: 'calendar', x: 9, y: 0,  w: 3, h: 20, minW: 2, minH: 6 },
  { i: 'tasks',    x: 6, y: 5,  w: 3, h: 11, minW: 2, minH: 4 },
  { i: 'notes',    x: 6, y: 16, w: 3, h: 4,  minW: 2, minH: 3 },
];

function loadLayout() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LAYOUT;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== DEFAULT_LAYOUT.length) return DEFAULT_LAYOUT;
    return parsed;
  } catch {
    return DEFAULT_LAYOUT;
  }
}

const CARD_RENDERERS = {
  welcome:  WelcomeCard,
  alerts:   AlertsMonitoringCard,
  assigned: AssignedToMeCard,
  calendar: TodayCalendarCard,
  tasks:    TasksCard,
  notes:    QuickNotesCard,
};

export function HomeView() {
  const [layout, setLayout] = useState(loadLayout);
  const [editing, setEditing] = useState(false);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(1200);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth - 24);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleLayoutChange = useCallback((next) => {
    setLayout(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LAYOUT));
  }, []);

  const items = useMemo(() => layout.map(l => {
    const Card = CARD_RENDERERS[l.i];
    return (
      <div key={l.i}>
        <Card dragHandleClassName={editing ? DRAG_HANDLE : undefined} />
      </div>
    );
  }), [layout, editing]);

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <button className={styles.toolbarBtn}>
          <Icon name="solar:chart-linear" size={14} />
          View Business Insights
        </button>
        <div style={{ display: 'flex', gap: 4 }}>
          {editing && (
            <button className={styles.toolbarBtn} onClick={resetLayout}>
              <Icon name="solar:refresh-linear" size={14} />
              Reset
            </button>
          )}
          <button
            className={[styles.toolbarBtn, editing ? styles.editing : ''].filter(Boolean).join(' ')}
            onClick={() => setEditing(v => !v)}
          >
            <Icon name={editing ? 'solar:check-circle-linear' : 'solar:pen-linear'} size={14} />
            {editing ? 'Done' : 'Edit Dashboard'}
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className={[styles.gridContainer, editing ? styles.editing : ''].filter(Boolean).join(' ')}
      >
        <GridLayout
          className="layout"
          layout={layout}
          cols={COLS}
          rowHeight={ROW_HEIGHT}
          width={width}
          margin={[12, 12]}
          containerPadding={[0, 0]}
          isDraggable={editing}
          isResizable={editing}
          draggableHandle={`.${DRAG_HANDLE}`}
          onLayoutChange={handleLayoutChange}
          compactType="vertical"
          preventCollision={false}
        >
          {items}
        </GridLayout>
      </div>
    </div>
  );
}
