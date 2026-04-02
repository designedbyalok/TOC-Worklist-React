import { useState, useMemo, useEffect } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { Drawer } from '../../../components/Drawer/Drawer';
import { useAppStore } from '../../../store/useAppStore';

/* ── Audit Log Entry Icons — color-coded by action type ── */
const ACTION_CONFIG = {
  created:   { icon: 'solar:add-circle-linear',          bg: '#F0FDF4', border: 'rgba(0,155,83,.2)',  color: '#009B53' },
  updated:   { icon: 'solar:pen-linear',                  bg: '#F5F0FF', border: 'rgba(140,90,226,.2)', color: '#8C5AE2' },
  deleted:   { icon: 'solar:trash-bin-minimalistic-linear',bg: '#FFF5F5', border: 'rgba(215,40,37,.3)', color: '#D72825' },
  enabled:   { icon: 'solar:check-circle-linear',         bg: '#F0FDF4', border: 'rgba(0,155,83,.2)',  color: '#009B53' },
  disabled:  { icon: 'solar:close-circle-linear',         bg: '#FFF5F5', border: 'rgba(215,40,37,.3)', color: '#D72825' },
  previewed: { icon: 'solar:eye-linear',                   bg: '#EFF6FF', border: 'rgba(20,94,204,.15)', color: '#145ECC' },
};

const DEFAULT_CONFIG = { icon: 'solar:document-text-linear', bg: '#F6F7F8', border: 'rgba(111,122,144,.1)', color: '#6F7A90' };

/* ── Group entries by month ── */
function groupByMonth(entries) {
  const groups = {};
  entries.forEach(e => {
    const d = new Date(e.createdAt);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups[monthKey]) groups[monthKey] = { label: monthLabel, entries: [] };
    groups[monthKey].entries.push(e);
  });
  return Object.values(groups);
}

/* ── Timeline Entry ── */
function TimelineEntry({ entry, isFirst, isLast }) {
  const cfg = ACTION_CONFIG[entry.action] || DEFAULT_CONFIG;

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {/* Timeline track */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
        <div style={{ width: 0.5, flex: '0 0 14px', background: isFirst ? 'transparent' : 'var(--neutral-150)' }} />
        <div style={{
          width: 24, height: 24, borderRadius: 6, flexShrink: 0,
          border: `0.5px solid ${cfg.border}`, background: cfg.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={cfg.icon} size={14} color={cfg.color} />
        </div>
        <div style={{ width: 0.5, flex: 1, minHeight: 12, background: isLast ? 'transparent' : 'var(--neutral-150)' }} />
      </div>

      {/* Content card */}
      <div style={{ flex: 1, background: '#fff', borderRadius: 8, padding: '6px 4px 12px 4px' }}>
        <div style={{ padding: 8 }}>
          <div style={{
            display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap',
            fontSize: 12, fontWeight: 500, color: '#6F7A90', marginBottom: 4,
          }}>
            <span>{entry.date}</span>
            <span style={{ color: '#D0D6E1' }}>•</span>
            <span>{entry.time}</span>
            <span style={{ color: '#D0D6E1' }}>•</span>
            <span>{entry.user}</span>
          </div>
          <div style={{ fontSize: 14, color: '#3A485F', lineHeight: 1.2, marginBottom: entry.details || entry.category ? 4 : 0 }}>
            {entry.details || `${entry.action} ${entry.entityName}`}
          </div>
          {entry.category && (
            <span style={{ fontSize: 14, color: '#145ECC', cursor: 'pointer' }}>
              {entry.category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Drawer ── */
export function AuditLogDrawer({ entity, onClose }) {
  const fetchAuditLogs = useAppStore(s => s.fetchAuditLogs);
  const [filter, setFilter] = useState('all');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real audit log data from Supabase
  useEffect(() => {
    if (!entity) return;
    setLoading(true);
    fetchAuditLogs(entity.type, entity.id).then(logs => {
      setEntries(logs);
      setLoading(false);
    });
  }, [entity, fetchAuditLogs]);

  const filteredEntries = useMemo(() => {
    if (filter === 'all') return entries;
    return entries.filter(e => e.action === filter);
  }, [entries, filter]);

  const monthGroups = useMemo(() => groupByMonth(filteredEntries), [filteredEntries]);

  const FILTERS = ['all', 'created', 'updated', 'enabled', 'disabled', 'deleted', 'previewed'];

  const title = entity?.type === 'Domain'
    ? `Audit Log — ${entity.domain || entity.name}`
    : `Audit Log — ${entity?.name}`;

  return (
    <Drawer title={title} onClose={onClose}>
      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        <Icon name="solar:filter-linear" size={16} color="#6F7A90" />
        {FILTERS.map(f => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '4px 8px', borderRadius: 4, fontSize: 12,
                border: `0.5px solid ${active ? '#8C5AE2' : '#D0D6E1'}`,
                background: active ? '#FCFAFF' : '#fff',
                color: active ? '#8C5AE2' : '#6F7A90',
                cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: active ? 500 : 400,
                textTransform: 'capitalize', whiteSpace: 'nowrap',
              }}
            >
              {f === 'all' ? 'All' : f}
            </button>
          );
        })}
        {filter !== 'all' && (
          <button onClick={() => setFilter('all')} style={{
            fontSize: 12, color: '#8C5AE2', background: 'none', border: 'none',
            cursor: 'pointer', fontFamily: "'Inter', sans-serif", padding: '4px 0',
          }}>
            Clear All
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: '#6F7A90' }}>
          <div style={{ fontSize: 14 }}>Loading audit log...</div>
        </div>
      )}

      {/* Timeline */}
      {!loading && (
        <div style={{ padding: '0 0 4px 0' }}>
          {monthGroups.map((group, gi) => (
            <div key={gi}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 2px', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#3A485F' }}>{group.label}</span>
                <Icon name="solar:alt-arrow-down-linear" size={13} color="#8A94A8" />
              </div>
              {group.entries.map((entry, ei) => (
                <TimelineEntry
                  key={entry.id}
                  entry={entry}
                  isFirst={gi === 0 && ei === 0}
                  isLast={gi === monthGroups.length - 1 && ei === group.entries.length - 1}
                />
              ))}
            </div>
          ))}

          {filteredEntries.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#6F7A90' }}>
              <Icon name="solar:history-linear" size={32} color="var(--neutral-150)" />
              <div style={{ fontSize: 14, fontWeight: 500, color: '#3D4A5C', marginTop: 8 }}>No entries found</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>
                {filter !== 'all' ? 'Try adjusting your filter.' : 'Activity will appear here as actions are taken.'}
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
