import { useState, useMemo } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { Badge } from '../../../components/Badge/Badge';
import { Drawer } from '../../../components/Drawer/Drawer';

/* ── Audit Log Entry Icons — color-coded by action type ── */
const ACTION_CONFIG = {
  created:   { icon: 'solar:add-circle-linear',          bg: '#F0FDF4', border: 'rgba(0,155,83,.2)',  color: '#009B53' },
  updated:   { icon: 'solar:pen-linear',                  bg: '#F5F0FF', border: 'rgba(140,90,226,.2)', color: '#8C5AE2' },
  deleted:   { icon: 'solar:trash-bin-minimalistic-linear',bg: '#FFF5F5', border: 'rgba(215,40,37,.3)', color: '#D72825' },
  enabled:   { icon: 'solar:check-circle-linear',         bg: '#F0FDF4', border: 'rgba(0,155,83,.2)',  color: '#009B53' },
  disabled:  { icon: 'solar:close-circle-linear',         bg: '#FFF5F5', border: 'rgba(215,40,37,.3)', color: '#D72825' },
  previewed: { icon: 'solar:eye-linear',                   bg: '#EFF6FF', border: 'rgba(20,94,204,.15)', color: '#145ECC' },
  dismissed: { icon: 'solar:close-square-linear',          bg: '#FFF5F5', border: 'rgba(215,40,37,.3)', color: '#D72825' },
  status:    { icon: 'solar:transfer-horizontal-linear',   bg: '#FFFCF5', border: 'rgba(217,165,11,.2)', color: '#D9A50B' },
};

const DEFAULT_CONFIG = { icon: 'solar:document-text-linear', bg: '#F6F7F8', border: 'rgba(111,122,144,.1)', color: '#6F7A90' };

/* ── Generate entity-specific audit data ── */
function generateAuditEntries(entity) {
  if (!entity) return [];
  const { type, name } = entity;

  if (type === 'Domain') {
    return [
      { id: 1, date: '03/31/2026', time: '2:22 PM', user: 'Alok Kumar', action: 'updated', description: `HIPAA compliance changed to "Verified"`, category: 'Configuration' },
      { id: 2, date: '03/28/2026', time: '10:05 AM', user: 'Sarah Chen', action: 'enabled', description: `Domain re-enabled after BAA verification`, category: 'Status' },
      { id: 3, date: '03/25/2026', time: '4:20 PM', user: 'James Wilson', action: 'disabled', description: `Domain disabled — pending BAA review`, category: 'Status' },
      { id: 4, date: '03/22/2026', time: '11:30 AM', user: 'Alok Kumar', action: 'updated', description: `Category changed from "Other" to current`, category: 'Configuration' },
      { id: 5, date: '03/20/2026', time: '9:14 AM', user: 'Sarah Chen', action: 'created', description: `Domain "${name}" registered`, category: 'Lifecycle', detail: `Category: ${entity.category || 'Internal'} · HIPAA: ${entity.hipaa || 'Pending'}` },
      { id: 6, date: '03/18/2026', time: '3:45 PM', user: 'Alok Kumar', action: 'updated', description: `Vendor label updated`, category: 'Configuration' },
      { id: 7, date: '02/28/2026', time: '11:00 AM', user: 'James Wilson', action: 'previewed', description: `Security audit completed — no issues found`, category: 'Review' },
    ];
  }

  // Component type
  return [
    { id: 1, date: '03/31/2026', time: '2:22 PM', user: 'Alok Kumar', action: 'updated', description: `Placement changed to Side-drawer`, category: 'Configuration' },
    { id: 2, date: '03/30/2026', time: '4:05 PM', user: 'Sarah Chen', action: 'enabled', description: `Component enabled after preview validation`, category: 'Status' },
    { id: 3, date: '03/29/2026', time: '9:14 AM', user: 'Sarah Chen', action: 'previewed', description: `Previewed with patient Kevin Park (#305821)`, category: 'Testing' },
    { id: 4, date: '03/28/2026', time: '10:22 AM', user: 'James Wilson', action: 'disabled', description: `Disabled — preview not yet completed`, category: 'Status' },
    { id: 5, date: '03/27/2026', time: '5:45 PM', user: 'Sarah Chen', action: 'updated', description: `Context scope updated — added userEmail field`, category: 'Configuration' },
    { id: 6, date: '03/25/2026', time: '3:33 PM', user: 'Alok Kumar', action: 'created', description: `Component "${name}" created`, category: 'Lifecycle', detail: `Domain: ${entity.domain || 'fold.health'} · Surfaces: Web, Sidecar` },
    { id: 7, date: '02/15/2026', time: '2:10 PM', user: 'James Wilson', action: 'updated', description: `Token lifetime changed from 5 min to 15 min`, category: 'Configuration' },
    { id: 8, date: '02/10/2026', time: '11:30 AM', user: 'Alok Kumar', action: 'updated', description: `Visibility changed to "Physicians only"`, category: 'Configuration' },
  ];
}

/* ── Group entries by month ── */
function groupByMonth(entries) {
  const groups = {};
  entries.forEach(e => {
    const parts = e.date.split('/');
    const monthKey = `${parts[2]}-${parts[0]}`;
    const monthLabel = new Date(Number(parts[2]), Number(parts[0]) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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
        {/* Top connector */}
        <div style={{ width: 0.5, flex: isFirst ? '0 0 14px' : '0 0 14px', background: isFirst ? 'transparent' : 'var(--neutral-150)' }} />
        {/* Icon avatar */}
        <div style={{
          width: 24, height: 24, borderRadius: 6, flexShrink: 0,
          border: `0.5px solid ${cfg.border}`, background: cfg.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={cfg.icon} size={14} color={cfg.color} />
        </div>
        {/* Bottom connector */}
        <div style={{ width: 0.5, flex: 1, minHeight: 12, background: isLast ? 'transparent' : 'var(--neutral-150)' }} />
      </div>

      {/* Content card */}
      <div style={{
        flex: 1, background: '#fff', borderRadius: 8, padding: '6px 4px 12px 4px',
      }}>
        <div style={{ padding: 8 }}>
          {/* Meta line: date • time • user */}
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

          {/* Main description */}
          <div style={{ fontSize: 14, color: '#3A485F', lineHeight: 1.2, marginBottom: entry.detail || entry.category ? 4 : 0 }}>
            {entry.description}
          </div>

          {/* Optional detail */}
          {entry.detail && (
            <div style={{ fontSize: 12, color: '#6F7A90', lineHeight: 1.4, marginBottom: 4 }}>
              {entry.detail}
            </div>
          )}

          {/* Category link */}
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
  const [filter, setFilter] = useState('all');

  const entries = useMemo(() => generateAuditEntries(entity), [entity]);

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

      {/* Timeline */}
      <div style={{ padding: '0 0 4px 0' }}>
        {monthGroups.map((group, gi) => {
          let entryIndex = 0;
          return (
            <div key={gi}>
              {/* Month header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '6px 2px',
                marginBottom: 4,
              }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#3A485F' }}>{group.label}</span>
                <Icon name="solar:alt-arrow-down-linear" size={13} color="#8A94A8" />
              </div>

              {/* Entries */}
              {group.entries.map((entry, ei) => {
                const isFirst = gi === 0 && ei === 0;
                const isLast = gi === monthGroups.length - 1 && ei === group.entries.length - 1;
                return <TimelineEntry key={entry.id} entry={entry} isFirst={isFirst} isLast={isLast} />;
              })}
            </div>
          );
        })}

        {filteredEntries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: '#6F7A90' }}>
            <Icon name="solar:history-linear" size={32} color="var(--neutral-150)" />
            <div style={{ fontSize: 14, fontWeight: 500, color: '#3D4A5C', marginTop: 8 }}>No entries found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filter.</div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
