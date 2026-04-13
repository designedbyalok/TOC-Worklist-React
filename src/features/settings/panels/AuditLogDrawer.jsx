import { useState, useMemo, useEffect } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { Badge } from '../../../components/Badge/Badge';
import { Drawer } from '../../../components/Drawer/Drawer';
import { useAppStore } from '../../../store/useAppStore';
import { supabase } from '../../../lib/supabase';

/* ── Audit Log Entry Icons — color-coded by action type ── */
const ACTION_CONFIG = {
  created:   { icon: 'solar:add-circle-linear',          bg: 'var(--status-success-light)', border: 'color-mix(in srgb, var(--status-success) 20%, transparent)',  color: 'var(--status-success)' },
  updated:   { icon: 'solar:pen-linear',                  bg: 'var(--primary-100)', border: 'color-mix(in srgb, var(--primary-300) 20%, transparent)', color: 'var(--primary-300)' },
  deleted:   { icon: 'solar:trash-bin-minimalistic-linear',bg: 'var(--status-error-light)', border: 'color-mix(in srgb, var(--status-error) 30%, transparent)', color: 'var(--status-error)' },
  enabled:   { icon: 'solar:check-circle-linear',         bg: 'var(--status-success-light)', border: 'color-mix(in srgb, var(--status-success) 20%, transparent)',  color: 'var(--status-success)' },
  disabled:  { icon: 'solar:close-circle-linear',         bg: 'var(--status-error-light)', border: 'color-mix(in srgb, var(--status-error) 30%, transparent)', color: 'var(--status-error)' },
  previewed: { icon: 'solar:eye-linear',                   bg: 'var(--status-info-light)', border: 'color-mix(in srgb, var(--status-info) 15%, transparent)', color: 'var(--status-info)' },
};

const DEFAULT_CONFIG = { icon: 'solar:document-text-linear', bg: 'var(--neutral-50)', border: 'color-mix(in srgb, var(--neutral-300) 10%, transparent)', color: 'var(--neutral-300)' };

/* ── Status badge colors ── */
const STATUS_COLORS = {
  Enabled:  { bg: 'var(--status-success-light)', color: 'var(--status-success-bright)' },
  Disabled: { bg: 'var(--status-warning-light)', color: 'var(--status-warning)' },
  Active:   { bg: 'var(--status-success-light)', color: 'var(--status-success-bright)' },
  Inactive: { bg: 'var(--status-warning-light)', color: 'var(--status-warning)' },
  Verified: { bg: 'var(--status-success-light)', color: 'var(--status-success-bright)' },
  Removed:  { bg: 'var(--status-error-light)', color: 'var(--status-error)' },
};

/* ── Arrow icon between old→new ── */
function ArrowRight() {
  return (
    <Icon name="solar:arrow-right-linear" size={14} color="var(--neutral-200)" />
  );
}

/* ── Render a single field change ── */
function ChangeDisplay({ change }) {
  if (change.type === 'status') {
    const fromColor = STATUS_COLORS[change.from] || { bg: 'var(--neutral-50)', color: 'var(--neutral-300)' };
    const toColor = STATUS_COLORS[change.to] || { bg: 'var(--neutral-50)', color: 'var(--neutral-300)' };
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex', padding: '2px 6px', borderRadius: 4, fontSize: 12,
          background: fromColor.bg, color: fromColor.color,
        }}>{change.from}</span>
        <ArrowRight />
        <span style={{
          display: 'inline-flex', padding: '2px 6px', borderRadius: 4, fontSize: 12,
          background: toColor.bg, color: toColor.color,
        }}>{change.to}</span>
      </div>
    );
  }

  // Text change: strikethrough old → arrow → new
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
      <span style={{ color: 'var(--neutral-300)', textDecoration: 'line-through' }}>{change.from || '(empty)'}</span>
      <ArrowRight />
      <span style={{ color: 'var(--neutral-400)' }}>{change.to || '(empty)'}</span>
    </div>
  );
}

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
function TimelineEntry({ entry, isFirst, isLast, currentUserName }) {
  const cfg = ACTION_CONFIG[entry.action] || DEFAULT_CONFIG;
  const isCurrentUser = currentUserName && entry.user && entry.user.toLowerCase() === currentUserName.toLowerCase();

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
      <div style={{ flex: 1, background: 'var(--neutral-0)', borderRadius: 8, padding: '6px 4px 12px 4px' }}>
        <div style={{ padding: 8 }}>
          <div style={{
            display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap',
            fontSize: 12, fontWeight: 500, color: 'var(--neutral-300)', marginBottom: 4,
          }}>
            <span>{entry.date}</span>
            <span style={{ color: 'var(--neutral-150)' }}>•</span>
            <span>{entry.time}</span>
            <span style={{ color: 'var(--neutral-150)' }}>•</span>
            <span>{entry.user}{isCurrentUser && <span style={{ color: 'var(--neutral-200)', fontWeight: 400 }}> (Current User)</span>}</span>
          </div>
          {/* Description text */}
          <div style={{ fontSize: 14, color: 'var(--neutral-400)', lineHeight: 1.2, marginBottom: 4 }}>
            {entry.details || `${entry.action} ${entry.entityName}`}
          </div>

          {/* Structured changes (field diffs) */}
          {entry.changes && entry.changes.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6, marginBottom: 4 }}>
              {entry.changes.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--neutral-200)', minWidth: 60, textTransform: 'capitalize' }}>{c.field}</span>
                  <ChangeDisplay change={c} />
                </div>
              ))}
            </div>
          )}

          {/* Category link */}
          {entry.category && (
            <span style={{ fontSize: 12, color: 'var(--neutral-200)' }}>
              {entry.category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Drawer ── */
/**
 * AuditLogContent — reusable audit log timeline with filters.
 * Can be embedded inside any container (drawer tab, panel, etc.)
 */
export function AuditLogContent({ entityType, entityId }) {
  const fetchAuditLogs = useAppStore(s => s.fetchAuditLogs);
  const [filter, setFilter] = useState('all');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserName, setCurrentUserName] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = data?.user?.user_metadata || {};
      if (meta.first_name && meta.last_name) setCurrentUserName(`${meta.first_name} ${meta.last_name}`);
      else if (meta.full_name) setCurrentUserName(meta.full_name);
      else if (data?.user?.email) setCurrentUserName(data.user.email.split('@')[0]);
    });
  }, []);

  useEffect(() => {
    if (!entityType || !entityId) return;
    setLoading(true);
    fetchAuditLogs(entityType, entityId).then(logs => {
      setEntries(logs);
      setLoading(false);
    });
  }, [entityType, entityId, fetchAuditLogs]);

  const filteredEntries = useMemo(() => {
    if (filter === 'all') return entries;
    return entries.filter(e => e.action === filter);
  }, [entries, filter]);

  const monthGroups = useMemo(() => groupByMonth(filteredEntries), [filteredEntries]);
  const FILTERS = ['all', 'created', 'updated', 'enabled', 'disabled', 'deleted'];

  return (
    <div style={{ padding: '12px 0' }}>
      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        <Icon name="solar:filter-linear" size={16} color="var(--neutral-300)" />
        {FILTERS.map(f => {
          const active = filter === f;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '4px 8px', borderRadius: 4, fontSize: 12,
              border: `0.5px solid ${active ? 'var(--primary-300)' : 'var(--neutral-150)'}`,
              background: active ? 'var(--primary-50)' : 'var(--neutral-0)',
              color: active ? 'var(--primary-300)' : 'var(--neutral-300)',
              cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: active ? 500 : 400,
              textTransform: 'capitalize', whiteSpace: 'nowrap',
            }}>{f === 'all' ? 'All' : f}</button>
          );
        })}
        {filter !== 'all' && (
          <button onClick={() => setFilter('all')} style={{
            fontSize: 12, color: 'var(--primary-300)', background: 'none', border: 'none',
            cursor: 'pointer', fontFamily: "'Inter', sans-serif", padding: '4px 0',
          }}>Clear All</button>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--neutral-300)' }}>
          <div style={{ fontSize: 14 }}>Loading audit log...</div>
        </div>
      )}

      {!loading && (
        <div>
          {monthGroups.map((group, gi) => (
            <div key={gi}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 2px', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--neutral-400)' }}>{group.label}</span>
                <Icon name="solar:alt-arrow-down-linear" size={13} color="var(--neutral-200)" />
              </div>
              {group.entries.map((entry, ei) => (
                <TimelineEntry
                  key={entry.id}
                  entry={entry}
                  isFirst={gi === 0 && ei === 0}
                  isLast={gi === monthGroups.length - 1 && ei === group.entries.length - 1}
                  currentUserName={currentUserName}
                />
              ))}
            </div>
          ))}
          {filteredEntries.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 16px', color: 'var(--neutral-300)' }}>
              <Icon name="solar:history-linear" size={32} color="var(--neutral-150)" />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--neutral-300)' }}>No entries found</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>
                  {filter !== 'all' ? 'Try adjusting your filter.' : 'Activity will appear here as actions are taken.'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AuditLogDrawer({ entity, onClose }) {
  const fetchAuditLogs = useAppStore(s => s.fetchAuditLogs);
  const [filter, setFilter] = useState('all');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserName, setCurrentUserName] = useState('');

  // Get current user name for "(Current User)" label
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = data?.user?.user_metadata || {};
      if (meta.first_name && meta.last_name) setCurrentUserName(`${meta.first_name} ${meta.last_name}`);
      else if (meta.full_name) setCurrentUserName(meta.full_name);
      else if (data?.user?.email) setCurrentUserName(data.user.email.split('@')[0]);
    });
  }, []);

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
        <Icon name="solar:filter-linear" size={16} color="var(--neutral-300)" />
        {FILTERS.map(f => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '4px 8px', borderRadius: 4, fontSize: 12,
                border: `0.5px solid ${active ? 'var(--primary-300)' : 'var(--neutral-150)'}`,
                background: active ? 'var(--primary-50)' : 'var(--neutral-0)',
                color: active ? 'var(--primary-300)' : 'var(--neutral-300)',
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
            fontSize: 12, color: 'var(--primary-300)', background: 'none', border: 'none',
            cursor: 'pointer', fontFamily: "'Inter', sans-serif", padding: '4px 0',
          }}>
            Clear All
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--neutral-300)' }}>
          <div style={{ fontSize: 14 }}>Loading audit log...</div>
        </div>
      )}

      {/* Timeline */}
      {!loading && (
        <div style={{ padding: '0 0 4px 0' }}>
          {monthGroups.map((group, gi) => (
            <div key={gi}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 2px', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--neutral-400)' }}>{group.label}</span>
                <Icon name="solar:alt-arrow-down-linear" size={13} color="var(--neutral-200)" />
              </div>
              {group.entries.map((entry, ei) => (
                <TimelineEntry
                  key={entry.id}
                  entry={entry}
                  isFirst={gi === 0 && ei === 0}
                  isLast={gi === monthGroups.length - 1 && ei === group.entries.length - 1}
                  currentUserName={currentUserName}
                />
              ))}
            </div>
          ))}

          {filteredEntries.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 16px', color: 'var(--neutral-300)' }}>
              <Icon name="solar:history-linear" size={32} color="var(--neutral-150)" />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--neutral-300)' }}>No entries found</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>
                  {filter !== 'all' ? 'Try adjusting your filter.' : 'Activity will appear here as actions are taken.'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
