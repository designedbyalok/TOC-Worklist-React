import { useAppStore } from '../../store/useAppStore';
import { WorklistRow } from './WorklistRow';
import { BulkBar } from '../../components/BulkBar/BulkBar';

export function WorklistTable() {
  const patients = useAppStore(s => s.patients);
  const selectedIds = useAppStore(s => s.selectedIds);
  const selectPatient = useAppStore(s => s.selectPatient);
  const selectAll = useAppStore(s => s.selectAll);
  const clearSelected = useAppStore(s => s.clearSelected);
  const viewBy = useAppStore(s => s.viewBy);

  const allIds = patients.map(p => p.id);
  const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  const handleSelectAll = (e) => {
    if (e.target.checked) selectAll(allIds);
    else clearSelected();
  };

  const thStyle = {
    padding: '8px 14px',
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--neutral-300)',
    borderBottom: '1px solid var(--neutral-150)',
    background: 'var(--neutral-0)',
    position: 'sticky',
    top: 0,
    zIndex: 2,
    textAlign: 'left',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', background: 'var(--neutral-0)', position: 'relative', overscrollBehavior: 'none' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Inter', sans-serif", minWidth: 900 }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 36, padding: '8px 10px', position: 'sticky', top: 0, left: 0, zIndex: 4 }}>
              <input
                type="checkbox"
                checked={allSelected}
                ref={el => { if (el) el.indeterminate = someSelected; }}
                onChange={handleSelectAll}
              />
            </th>
            <th style={{ ...thStyle, padding: '8px 12px', position: 'sticky', top: 0, left: 36, zIndex: 4, borderRight: '1px solid var(--neutral-150)' }}>Members</th>
            <th style={thStyle}>LACE Acuity</th>
            <th style={thStyle}>Outreach Window</th>
            <th style={thStyle}>TOC Status</th>
            <th style={thStyle}>Outreach</th>
            <th style={thStyle}>Next Outreach</th>
            <th style={thStyle}>Start Date</th>
            <th style={thStyle}>Last Admission</th>
            <th style={thStyle}>Assignee</th>
            <th style={thStyle}>Agent Assigned</th>
            <th style={{ ...thStyle, width: 100, position: 'sticky', top: 0, right: 0, zIndex: 3 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(p => (
            <WorklistRow
              key={p.id}
              patient={p}
              isSelected={selectedIds.includes(p.id)}
              onSelect={selectPatient}
            />
          ))}
        </tbody>
      </table>
      <BulkBar />
    </div>
  );
}
