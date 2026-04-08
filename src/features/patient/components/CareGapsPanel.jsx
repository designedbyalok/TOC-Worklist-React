import { useState } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { CareGapSection } from './CareGapSection';
import { CARE_GAP_SECTIONS, CARE_GAP_TABS } from '../data/careGapsMock';
import styles from './CareGapsPanel.module.css';

export function CareGapsPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedGaps, setSelectedGaps] = useState([]);

  const toggleGap = (id) => {
    setSelectedGaps(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  return (
    <div className={styles.panel}>
      {/* Tab bar */}
      <div className={styles.tabs}>
        {CARE_GAP_TABS.map((tab, i) => (
          <button key={tab} className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''}`} onClick={() => setActiveTab(i)}>
            {tab}
          </button>
        ))}
      </div>

      {/* Alert header */}
      <div className={styles.alertHeader}>
        <Icon name="solar:danger-triangle-linear" size={14} color="var(--status-warning)" />
        <span>{CARE_GAP_SECTIONS.reduce((sum, s) => sum + s.items.filter(it => it.status === 'Open').length, 0)} Open Care Gaps require attention</span>
      </div>

      {/* Care gap sections */}
      <div className={styles.sections}>
        {activeTab === 0 && CARE_GAP_SECTIONS.map(section => (
          <CareGapSection key={section.title} section={section} selectedGaps={selectedGaps} onToggleGap={toggleGap} />
        ))}
        {activeTab !== 0 && (
          <div className={styles.placeholder}>
            <Icon name="solar:document-text-linear" size={32} color="var(--neutral-150)" />
            <span>Coming soon</span>
          </div>
        )}
      </div>
    </div>
  );
}
