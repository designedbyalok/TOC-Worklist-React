import { useState } from 'react';
import { Icon } from '../Icon/Icon';
import { useAppStore } from '../../store/useAppStore';
import styles from './FilterBar.module.css';

const FILTER_CHIPS = [
  'DOB', 'Gender', 'Language', 'UTR Flag', 'UTR Age', 'Assigned to',
  'Status', 'Trigger Type', 'Program Due Date', 'Last Outreach Date'
];

const FILTER_CHIPS_2 = [
  'Assignment Date', 'IPA', 'HP Code', 'Member Status'
];

export function FilterBar() {
  const viewBy = useAppStore(s => s.viewBy);
  const setViewBy = useAppStore(s => s.setViewBy);
  const [activeChips, setActiveChips] = useState([]);

  const toggleChip = (chip) => {
    setActiveChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterRow}>
        {FILTER_CHIPS.map(chip => (
          <button
            key={chip}
            className={[styles.chip, activeChips.includes(chip) ? styles.active : ''].filter(Boolean).join(' ')}
            onClick={() => toggleChip(chip)}
          >
            {chip} <Icon name="solar:alt-arrow-down-linear" size={14} />
          </button>
        ))}
        <button className={styles.clearAll} onClick={() => setActiveChips([])}>Clear All</button>
      </div>
      <div className={styles.filterRow}>
        <div className={styles.viewByToggle}>
          <button
            className={[styles.viewByBtn, viewBy === 'window' ? styles.active : ''].filter(Boolean).join(' ')}
            onClick={() => setViewBy('window')}
          >
            <Icon name="solar:sort-from-top-to-bottom-bold" size={14} />
            Outreach Window
          </button>
          <button
            className={[styles.viewByBtn, viewBy === 'status' ? styles.active : ''].filter(Boolean).join(' ')}
            onClick={() => setViewBy('status')}
          >
            <Icon name="solar:list-down-bold" size={14} />
            Outreach Status
          </button>
        </div>
        {FILTER_CHIPS_2.map(chip => (
          <button
            key={chip}
            className={[styles.chip, activeChips.includes(chip) ? styles.active : ''].filter(Boolean).join(' ')}
            onClick={() => toggleChip(chip)}
          >
            {chip} <Icon name="solar:alt-arrow-down-linear" size={14} />
          </button>
        ))}
      </div>
    </div>
  );
}
