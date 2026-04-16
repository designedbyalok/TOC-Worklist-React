import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { HccWorklistRow } from './HccWorklistRow';
import { TableSkeleton } from '../../components/Skeleton/TableSkeleton';
import { Checkbox } from '../../components/ui/checkbox';
import { Icon } from '../../components/Icon/Icon';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { SearchIconButton } from '../../components/SearchIconButton/SearchIconButton';
import { SortableHeader } from '../../components/Table/SortableHeader';
import { useTableSort } from '../../components/Table/useTableSort';
import styles from './HccWorklistTable.module.css';
import rowStyles from './HccWorklistRow.module.css';

function EmptyState({ title, message, icon = 'solar:magnifer-linear' }) {
  return (
    <div className={styles.empty}>
      <Icon name={icon} size={40} color="var(--neutral-200)" />
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptyMessage}>{message}</p>
    </div>
  );
}

export function HccWorklistTable() {
  const hccMembers = useAppStore(s => s.hccMembers);
  const hccMembersLoading = useAppStore(s => s.hccMembersLoading);
  const fetchHccMembers = useAppStore(s => s.fetchHccMembers);
  const selectedHccIds = useAppStore(s => s.selectedHccIds);
  const selectAllHcc = useAppStore(s => s.selectAllHcc);
  const clearHccSelected = useAppStore(s => s.clearHccSelected);
  const searchQuery = useAppStore(s => s.searchQuery);
  const setSearchQuery = useAppStore(s => s.setSearchQuery);
  const currentPage = useAppStore(s => s.currentPage);
  const perPage = useAppStore(s => s.perPage);
  const showToast = useAppStore(s => s.showToast);

  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => { fetchHccMembers(); }, [fetchHccMembers]);

  const filtered = useMemo(() => {
    if (!searchQuery?.trim()) return hccMembers;
    const q = searchQuery.toLowerCase().trim();
    return hccMembers.filter(m =>
      m.name?.toLowerCase().includes(q) ||
      m.in?.toLowerCase().includes(q) ||
      m.id?.toLowerCase().includes(q)
    );
  }, [hccMembers, searchQuery]);

  const { sorted, sortKey, sortDir, requestSort } = useTableSort(filtered, 'date', 'desc');

  const startIdx = (currentPage - 1) * perPage;
  const paginated = sorted.slice(startIdx, startIdx + perPage);

  const visibleIds = paginated.map(m => m.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedHccIds.includes(id));
  const someSelected = selectedHccIds.length > 0 && !allSelected;

  const handleSelectAll = (checked) => {
    if (checked) selectAllHcc(visibleIds);
    else clearHccSelected();
  };

  if (hccMembersLoading) return <TableSkeleton rows={perPage} />;

  return (
    <div className={styles.wrap}>
      <div className={styles.tabBar}>
        <div className={styles.tabLeft}>
          <div className={`${styles.tabItem} ${styles.tabActive}`}>
            HCC Worklist
          </div>
        </div>

        <div className={styles.tabRight}>
          <div className={styles.searchWrap}>
            {searchOpen ? (
              <div className={styles.searchInput}>
                <Icon name="solar:magnifer-linear" size={15} color="var(--neutral-300)" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search by member name…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  className={styles.searchClose}
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  aria-label="Close search"
                >
                  ✕
                </button>
              </div>
            ) : (
              <SearchIconButton title="Search" onClick={() => setSearchOpen(true)} />
            )}
          </div>
          <span className={styles.iconDivider} />
          <ActionButton
            icon="solar:filter-linear"
            size="L"
            tooltip="Filter"
            className={filterOpen ? styles.iconActive : ''}
            onClick={() => { setFilterOpen(v => !v); showToast('Filters — coming soon'); }}
          />
          <span className={styles.iconDivider} />
          <ActionButton
            icon="solar:history-linear"
            size="L"
            tooltip="History"
            onClick={() => showToast('History — coming soon')}
          />
          <span className={styles.iconDivider} />
          <ActionButton
            icon="solar:upload-minimalistic-linear"
            size="L"
            tooltip="Export"
            onClick={() => showToast('Export — coming soon')}
          />
        </div>
      </div>
      <div className={styles.scrollWrap}>
        <table className={styles.table}>
        <thead>
          <tr>
            <th
              className={`${rowStyles.stickyLeft} ${rowStyles.stickyCheck} ${styles.checkTh}`}
            >
              <Checkbox
                checked={someSelected ? 'indeterminate' : allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all members"
              />
            </th>
            <th
              className={`${rowStyles.stickyLeft} ${rowStyles.stickyMember} ${rowStyles.colMember} ${styles.memberTh}`}
            >
              Member
            </th>

            <SortableHeader label="DOS" sortKey="dos" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className={rowStyles.colLastVisit} />
            <SortableHeader label="Open ICDs" sortKey="open" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className={rowStyles.colOpen} />
            <SortableHeader label="Create Date" sortKey="date" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className={rowStyles.colDate} />
            <SortableHeader label="HCC Evidence" sortKey="ch" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className={rowStyles.colEvidence} />
            <SortableHeader label="Support Team" sortKey="sup" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className={rowStyles.colRole} />
            <SortableHeader label="Coder" sortKey="cdr" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className={rowStyles.colRole} />
            <SortableHeader label="Reviewer 1" sortKey="r1" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className={rowStyles.colRole} />
            <SortableHeader label="Reviewer 2" sortKey="r2" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className={rowStyles.colRole} />
            <SortableHeader label="Reviewer 3" sortKey="r3" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className={rowStyles.colRole} />
            <SortableHeader label="Rendering Provider" sortKey="rp" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className={rowStyles.colProvider} />
            <th className={rowStyles.colPos}>POS Code</th>
            <th className={rowStyles.colPosDesc}>POS Description</th>
            <SortableHeader label="RAF Score" sortKey="raf" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className={rowStyles.colRaf} />
            <SortableHeader label="RAF Impact" sortKey="ri" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className={rowStyles.colRi} />
            <th className={rowStyles.colIpa}>IPA</th>
            <th className={rowStyles.colHp}>HP Code</th>
            <SortableHeader label="PCP" sortKey="pcp" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className={rowStyles.colPcp} />
            <SortableHeader label="Decile" sortKey="dec" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className={rowStyles.colDec} />
            <th className={rowStyles.colCoh}>Cohort</th>
            <SortableHeader label="Risk Level" sortKey="rl" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className={rowStyles.colRl} />
            <SortableHeader label="Advillness" sortKey="ad" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className={rowStyles.colAd} />
            <SortableHeader label="Frailty" sortKey="fr" currentKey={sortKey} currentDir={sortDir} onSort={requestSort} className={rowStyles.colFr} />

            <th className={`${rowStyles.stickyRight} ${rowStyles.colActions}`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map(m => <HccWorklistRow key={m.id} member={m} />)}
        </tbody>
      </table>

        {filtered.length === 0 && searchQuery?.trim() && (
          <EmptyState
            title="No results found"
            message={`No members match "${searchQuery.trim()}". Try a different search term.`}
          />
        )}
        {filtered.length === 0 && !searchQuery?.trim() && !hccMembersLoading && (
          <EmptyState
            title="No HCC members yet"
            message="Members will appear here once assigned."
            icon="solar:ghost-smile-linear"
          />
        )}
      </div>
    </div>
  );
}
