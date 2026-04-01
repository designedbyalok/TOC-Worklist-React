import { useMemo, useState } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { Badge } from '../../../components/Badge/Badge';
import { ActionButton } from '../../../components/ActionButton/ActionButton';

const thStyle = {
  textAlign: 'left', padding: '8px 16px', color: 'var(--neutral-300)', fontWeight: 500,
  fontSize: 12, whiteSpace: 'nowrap', borderBottom: '1px solid var(--neutral-150)',
  background: 'var(--neutral-0)', position: 'sticky', top: 0,
};
const tdStyle = { padding: '10px 16px', fontSize: 13, color: 'var(--neutral-400)', verticalAlign: 'middle' };

const ACTION_BADGE_MAP = {
  created: 'status-completed',
  updated: 'ai-care',
  deleted: 'status-failed',
  enabled: 'status-completed',
  disabled: 'compliance-warn',
  previewed: 'ai-neutral',
};

const ACTION_ICON_MAP = {
  created: 'solar:add-circle-linear',
  updated: 'solar:pen-linear',
  deleted: 'solar:trash-bin-minimalistic-linear',
  enabled: 'solar:check-circle-linear',
  disabled: 'solar:close-circle-linear',
  previewed: 'solar:eye-linear',
};

const AUDIT_DATA = [
  {
    id: 1,
    timestamp: '03/31/2026 14:22',
    user: 'Alok Kumar',
    action: 'created',
    entityType: 'Component',
    entityName: 'Prior Auth Widget',
    details: 'Created new component on domain prior-auth.vendor.com',
  },
  {
    id: 2,
    timestamp: '03/31/2026 13:48',
    user: 'Sarah Chen',
    action: 'updated',
    entityType: 'Domain',
    entityName: 'fold.health',
    details: 'Changed category from "Other" to "Internal"',
  },
  {
    id: 3,
    timestamp: '03/30/2026 16:05',
    user: 'Alok Kumar',
    action: 'enabled',
    entityType: 'Component',
    entityName: 'SDOH Screener',
    details: 'Enabled component after preview validation',
  },
  {
    id: 4,
    timestamp: '03/30/2026 11:30',
    user: 'James Wilson',
    action: 'deleted',
    entityType: 'Domain',
    entityName: 'hedis-tool.example.com',
    details: 'Removed domain — 1 component auto-disabled (HEDIS Gap Tracker)',
  },
  {
    id: 5,
    timestamp: '03/29/2026 09:14',
    user: 'Sarah Chen',
    action: 'previewed',
    entityType: 'Component',
    entityName: 'Risk Dashboard',
    details: 'Previewed with patient Kevin Park (#305821)',
  },
  {
    id: 6,
    timestamp: '03/28/2026 15:33',
    user: 'Alok Kumar',
    action: 'created',
    entityType: 'Domain',
    entityName: 'analytics.arcadia.com',
    details: 'Registered new domain — category: Analytics, HIPAA: Pending BAA',
  },
  {
    id: 7,
    timestamp: '03/28/2026 10:22',
    user: 'James Wilson',
    action: 'disabled',
    entityType: 'Component',
    entityName: 'Medication Review Tool',
    details: 'Disabled — preview not yet completed',
  },
  {
    id: 8,
    timestamp: '03/27/2026 17:45',
    user: 'Sarah Chen',
    action: 'updated',
    entityType: 'Component',
    entityName: 'Prior Auth Widget',
    details: 'Updated placement from P360 tab to Side-drawer',
  },
  {
    id: 9,
    timestamp: '03/27/2026 14:10',
    user: 'Alok Kumar',
    action: 'created',
    entityType: 'Component',
    entityName: 'Risk Dashboard',
    details: 'Created new component on domain analytics.arcadia.com',
  },
  {
    id: 10,
    timestamp: '03/26/2026 09:50',
    user: 'James Wilson',
    action: 'updated',
    entityType: 'Domain',
    entityName: 'prior-auth.vendor.com',
    details: 'Updated HIPAA compliance from "Pending BAA" to "BAA in place"',
  },
  {
    id: 11,
    timestamp: '03/25/2026 16:20',
    user: 'Sarah Chen',
    action: 'enabled',
    entityType: 'Domain',
    entityName: 'prior-auth.vendor.com',
    details: 'Re-enabled domain after BAA verification',
  },
  {
    id: 12,
    timestamp: '03/24/2026 11:05',
    user: 'Alok Kumar',
    action: 'created',
    entityType: 'Domain',
    entityName: 'fold.health',
    details: 'Registered internal domain — category: Internal, HIPAA: Verified',
  },
];

const ENTITY_ICON = {
  Component: 'solar:widget-5-linear',
  Domain: 'solar:global-linear',
};

function UserAvatar({ name }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 24, height: 24, borderRadius: '50%',
      background: 'var(--primary-100)', color: 'var(--primary-400)',
      fontSize: 10, fontWeight: 600, flexShrink: 0,
    }}>
      {initials}
    </span>
  );
}

export function AuditLogPanel({ searchQuery = '' }) {
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return AUDIT_DATA;
    const q = searchQuery.toLowerCase();
    return AUDIT_DATA.filter(e =>
      e.user.toLowerCase().includes(q) ||
      e.entityName.toLowerCase().includes(q) ||
      e.action.toLowerCase().includes(q) ||
      e.details.toLowerCase().includes(q) ||
      e.entityType.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      {/* Table card */}
      <div style={{
        border: '0.5px solid var(--neutral-100)', borderRadius: 10,
        overflow: 'hidden', background: '#fff', margin: 16,
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Inter', sans-serif" }}>
          <thead>
            <tr>
              <th style={thStyle}>Timestamp</th>
              <th style={thStyle}>User</th>
              <th style={thStyle}>Action</th>
              <th style={thStyle}>Entity</th>
              <th style={thStyle}>Details</th>
              <th style={{ ...thStyle, width: 36 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'var(--neutral-200)' }}>
                  <Icon name="solar:document-text-linear" size={32} color="var(--neutral-150)" />
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--neutral-300)', marginTop: 8 }}>No audit entries found</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>
                    {searchQuery.trim()
                      ? <>No entries match "<strong>{searchQuery.trim()}</strong>".</>
                      : 'Activity will appear here as domains and components are managed.'}
                  </div>
                </td>
              </tr>
            )}
            {filtered.map(entry => {
              const isExpanded = expandedId === entry.id;
              return (
                <tr
                  key={entry.id}
                  style={{
                    borderBottom: '1px solid #EAECF0',
                    transition: 'background .1s',
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--primary-25, #faf8ff)'}
                  onMouseOut={e => e.currentTarget.style.background = ''}
                >
                  {/* Timestamp */}
                  <td style={{ ...tdStyle, fontSize: 12, color: 'var(--neutral-300)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                    {entry.timestamp}
                  </td>

                  {/* User */}
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <UserAvatar name={entry.user} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--neutral-500)' }}>{entry.user}</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td style={tdStyle}>
                    <Badge variant={ACTION_BADGE_MAP[entry.action] || 'ai-neutral'} label={entry.action} icon={ACTION_ICON_MAP[entry.action]} />
                  </td>

                  {/* Entity (type + name) */}
                  <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--neutral-500)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon name={ENTITY_ICON[entry.entityType] || 'solar:document-text-linear'} size={14} color="var(--neutral-200)" />
                      <div>
                        <div>{entry.entityName}</div>
                        <div style={{ fontSize: 11, color: 'var(--neutral-200)', fontWeight: 400 }}>{entry.entityType}</div>
                      </div>
                    </div>
                  </td>

                  {/* Details */}
                  <td style={{ ...tdStyle, fontSize: 12, color: 'var(--neutral-300)', maxWidth: 280 }}>
                    <div style={{
                      whiteSpace: isExpanded ? 'normal' : 'nowrap',
                      overflow: isExpanded ? 'visible' : 'hidden',
                      textOverflow: isExpanded ? 'unset' : 'ellipsis',
                    }}>
                      {entry.details}
                    </div>
                  </td>

                  {/* Expand */}
                  <td style={tdStyle}>
                    <Icon
                      name={isExpanded ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'}
                      size={14}
                      color="var(--neutral-200)"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div style={{ fontSize: 12, color: 'var(--neutral-200)', padding: '0 20px 12px' }}>
        {filtered.length} entr{filtered.length !== 1 ? 'ies' : 'y'} shown
      </div>
    </div>
  );
}
