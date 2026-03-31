import { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Icon } from '../../components/Icon/Icon';
import { Checkbox } from '../../components/ui/checkbox';
import { QueueRow } from './QueueRow';
import { QueueEmptyState } from './QueueEmptyState';
import { TableSkeleton } from '../../components/Skeleton/TableSkeleton';

export function QueueTable() {
  const patients = useAppStore(s => s.patients);
  const patientsLoading = useAppStore(s => s.patientsLoading);
  const searchQuery = useAppStore(s => s.searchQuery);
  const activeFilters = useAppStore(s => s.activeFilters);
  const currentPage = useAppStore(s => s.currentPage);
  const perPage = useAppStore(s => s.perPage);

  // Filter to only agent-assigned patients, then apply search + filters
  const filteredQueue = useMemo(() => {
    let result = patients.filter(p => p.agentAssigned)
      .sort((a, b) => (a.priority || 99) - (b.priority || 99)); // sort by priority

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.memberId?.toLowerCase().includes(q) ||
        p.initials?.toLowerCase().includes(q)
      );
    }

    for (const [key, value] of Object.entries(activeFilters)) {
      if (value) {
        result = result.filter(p => String(p[key]) === String(value));
      }
    }

    return result;
  }, [patients, searchQuery, activeFilters]);

  if (patientsLoading) return <TableSkeleton rows={6} />;

  if (!filteredQueue.length) {
    // Check if there are any invoked patients at all (before filters)
    const anyInvoked = patients.some(p => p.agentAssigned);
    if (!anyInvoked) return <QueueEmptyState />;
    // There are invoked patients but filters hide them
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', paddingBottom: 64 }}>
          <Icon name="solar:filter-linear" size={40} color="var(--neutral-200)" />
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--neutral-400)' }}>No matching agents</div>
          <div style={{ fontSize: 13, color: 'var(--neutral-300)', lineHeight: 1.5 }}>
            Active filters hide all queued patients. Try adjusting your filters.
          </div>
        </div>
      </div>
    );
  }

  const startIdx = (currentPage - 1) * perPage;
  const paginatedQueue = filteredQueue.slice(startIdx, startIdx + perPage);

  const thBase = {
    fontSize: 12, fontWeight: 500, color: 'var(--neutral-300)',
    padding: '10px 14px', borderBottom: '1px solid var(--neutral-150)',
    background: 'var(--neutral-0)', position: 'sticky', top: 0, zIndex: 2,
    textAlign: 'left', whiteSpace: 'nowrap', userSelect: 'none',
  };

  const agentTh = {
    ...thBase,
    background: 'var(--agent-col-bg)',
    color: 'var(--primary-300)',
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--neutral-0)', position: 'relative', overscrollBehavior: 'none' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Inter', sans-serif", minWidth: 2000 }}>
        <thead>
          <tr>
            <th style={{ ...thBase, width: 36, padding: '8px 10px', position: 'sticky', left: 0, zIndex: 4 }}>
              <Checkbox />
            </th>
            <th style={{ ...thBase, padding: '8px 12px', position: 'sticky', left: 36, zIndex: 4, borderRight: '1px solid var(--neutral-150)' }}>Members</th>
            <th style={thBase}>Priority</th>
            <th style={thBase}>Outreach Type</th>
            <th style={thBase}>LACE Acuity</th>
            <th style={thBase}>Outreach Window</th>
            <th style={{ ...agentTh, borderLeft: '2px solid var(--primary-200)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 1L8.5 5H13L9.5 7.5L11 11L7 8.5L3 11L4.5 7.5L1 5H5.5L7 1Z" fill="currentColor"/></svg>
                Status
              </span>
            </th>
            <th style={{ ...agentTh, minWidth: 260 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="2" width="10" height="2" rx="1" fill="currentColor"/><rect x="2" y="6" width="7" height="2" rx="1" fill="currentColor"/><rect x="2" y="10" width="5" height="2" rx="1" fill="currentColor"/></svg>
                Next Action
              </span>
            </th>
            <th style={{ ...agentTh, minWidth: 280, borderRight: '2px solid var(--primary-200)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon name="solar:magic-stick-3-bold" size={14} />
                AI Insights
              </span>
            </th>
            <th style={thBase}>TOC Status</th>
            <th style={thBase}>Due On</th>
            <th style={thBase}>Next Outreach</th>
            <th style={thBase}>Start Date</th>
            <th style={thBase}>Last Admission</th>
            <th style={thBase}>Assignee</th>
            <th style={thBase}>Readmission</th>
            <th style={thBase}>Tasks</th>
            <th style={thBase}>Care Plan Status</th>
            <th style={{ ...thBase, position: 'sticky', right: 0, zIndex: 3, borderLeft: '1px solid var(--neutral-150)', boxShadow: '-4px 0 8px rgba(0,0,0,.04)' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedQueue.map(p => (
            <QueueRow key={p.id} patient={p} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
