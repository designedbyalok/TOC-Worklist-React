import { useState } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { ActionButton } from '../../../components/ActionButton/ActionButton';
import { CareGapSection } from './CareGapSection';
import { CARE_GAP_SECTIONS_EXTENDED, CARE_GAP_TABS } from '../data/careGapsMock';
import styles from './CareGapsPanel.module.css';

export function CareGapsPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedGaps, setSelectedGaps] = useState([]);

  const toggleGap = (id) => {
    setSelectedGaps(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  return (
    <div className={styles.panel}>
      {/* Tab bar + search */}
      <div className={styles.tabRow}>
        <div className={styles.tabs}>
          {CARE_GAP_TABS.map((tab, i) => (
            <button key={tab} className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''}`} onClick={() => setActiveTab(i)}>
              {tab}
            </button>
          ))}
        </div>
        <ActionButton icon="solar:magnifer-linear" size="S" tooltip="Search" />
      </div>

      {/* Alert header */}
      <div className={styles.alertHeader}>
        <Icon name="solar:info-circle-linear" size={14} color="var(--status-warning)" />
        <span>Exercise caution when discussing family matters, as mentioning p...</span>
      </div>

      {activeTab === 0 && (
        <>
          {/* Care Gaps header */}
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Care Gaps</span>
            <div className={styles.sectionActions}>
              <span className={styles.viewBy}>View By: Action</span>
              <Icon name="solar:alt-arrow-down-linear" size={10} color="var(--neutral-300)" />
              <span className={styles.filterDivider} />
              <ActionButton icon="solar:filter-linear" size="S" tooltip="Filter" />
            </div>
          </div>

          {/* Care gap sections */}
          <div className={styles.sections}>
            {CARE_GAP_SECTIONS_EXTENDED.map(section => (
              <CareGapSection key={section.title} section={section} selectedGaps={selectedGaps} onToggleGap={toggleGap} />
            ))}
          </div>
        </>
      )}

      {activeTab !== 0 && (
        <div className={styles.placeholder}>
          <Icon name="solar:document-text-linear" size={32} color="var(--neutral-150)" />
          <span>Coming soon</span>
        </div>
      )}
    </div>
  );
}
