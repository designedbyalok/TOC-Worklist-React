import { useMemo, useEffect } from 'react';
import { Icon } from '../Icon/Icon';
import { useAppStore } from '../../store/useAppStore';
import styles from './SubNav.module.css';

// Define which lists map to which filter criteria
const MY_LISTS = [
  { label: 'Day Optimizer', filter: null },
  { label: 'Review HRA', filter: null },
  { label: 'IP Visits', filter: { tocType: 'IP' } },
  { label: 'High Risk', filter: { lace: 'High' } },
  { label: 'High Cost', filter: null },
];

const SHARED_LISTS = [
  { label: 'SNP', filter: null },
  { label: 'AWV', filter: null },
  { label: 'TOC', filter: null },  // default — shows all TOC patients
  { label: 'HCC', filter: null, view: 'hcc' },
  { label: 'High Utilizers', filter: { readmission: 'Yes' } },
  { label: 'DM', filter: null },
];

export function SubNav({ collapsed }) {
  const activeSubnavList = useAppStore(s => s.activeSubnavList);
  const setActiveSubnavList = useAppStore(s => s.setActiveSubnavList);
  const setActiveFilters = useAppStore(s => s.setActiveFilters);
  const patients = useAppStore(s => s.patients);
  const hccMembers = useAppStore(s => s.hccMembers);
  const fetchHccMembers = useAppStore(s => s.fetchHccMembers);
  const clearSelected = useAppStore(s => s.clearSelected);
  const clearHccSelected = useAppStore(s => s.clearHccSelected);

  // Prefetch HCC members on mount so the count is available immediately
  useEffect(() => { fetchHccMembers(); }, []);

  // Only TOC and HCC show real counts; all others show 0
  const getCounts = useMemo(() => {
    const counts = {};
    for (const list of [...MY_LISTS, ...SHARED_LISTS]) {
      if (list.view === 'hcc') counts[list.label] = hccMembers.length;
      else if (list.label === 'TOC') counts[list.label] = patients.length;
      else counts[list.label] = 0;
    }
    return counts;
  }, [patients, hccMembers]);

  const allPatientsCount = patients.length + hccMembers.length;

  const handleListClick = (list) => {
    setActiveSubnavList(list.label);
    // Clear selection from both worklists so selection doesn't bleed across lists
    clearSelected();
    clearHccSelected();
    // Apply the list's filter to the active filters
    if (list.filter) {
      setActiveFilters(list.filter);
    } else {
      setActiveFilters({});
    }
  };

  return (
    <aside className={[styles.subnav, collapsed ? styles.collapsed : ''].filter(Boolean).join(' ')}>
      <div className={styles.sectionLabel}>
        Worklists
        <button title="Add"><Icon name="solar:add-circle-linear" size={18} /></button>
      </div>
      <div className={styles.subLabel}>My Lists</div>
      {MY_LISTS.map(item => (
        <div
          key={item.label}
          className={[styles.item, activeSubnavList === item.label ? styles.active : ''].filter(Boolean).join(' ')}
          onClick={() => handleListClick(item)}
        >
          {item.label}
          <span className={styles.count}>{getCounts[item.label] || 0}</span>
        </div>
      ))}
      <div className={styles.subLabel} style={{ marginTop: 8 }}>Shared Lists</div>
      {SHARED_LISTS.map(item => (
        <div
          key={item.label}
          className={[styles.item, activeSubnavList === item.label ? styles.active : ''].filter(Boolean).join(' ')}
          onClick={() => handleListClick(item)}
        >
          {item.label}
          <span className={styles.count}>{getCounts[item.label] || 0}</span>
        </div>
      ))}
      <div className={styles.sectionLabel} style={{ marginTop: 8 }}>Patients</div>
      <div
        className={[styles.item, activeSubnavList === 'My Patients' ? styles.active : ''].filter(Boolean).join(' ')}
        onClick={() => { setActiveSubnavList('My Patients'); clearSelected(); clearHccSelected(); setActiveFilters({}); }}
      >
        My Patients
        <span className={styles.count}>0</span>
      </div>
      <div
        className={[styles.item, activeSubnavList === 'All Patients' ? styles.active : ''].filter(Boolean).join(' ')}
        onClick={() => { setActiveSubnavList('All Patients'); clearSelected(); clearHccSelected(); setActiveFilters({}); }}
      >
        All Patients
        <span className={styles.count}>{allPatientsCount || 0}</span>
      </div>
      <div className={styles.sectionLabel} style={{ marginTop: 8 }}>Population Groups</div>
      <div className={styles.sectionLabel} style={{ marginTop: 4 }}>Leads &amp; Contacts</div>
    </aside>
  );
}
