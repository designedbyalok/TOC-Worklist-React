import { useState } from 'react';
import { Icon } from '../Icon/Icon';
import { useAppStore } from '../../store/useAppStore';
import styles from './TabBar.module.css';

export function TabBar() {
  const activeTab = useAppStore(s => s.activeTab);
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const showFilterBar = useAppStore(s => s.showFilterBar);
  const setShowFilterBar = useAppStore(s => s.setShowFilterBar);
  const queueTabDot = useAppStore(s => s.queueTabDot);
  const clearQueueTabDot = useAppStore(s => s.clearQueueTabDot);
  const searchQuery = useAppStore(s => s.searchQuery);
  const setSearchQuery = useAppStore(s => s.setSearchQuery);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'queue') clearQueueTabDot();
  };

  return (
    <div className={styles.tabBar}>
      <div className={styles.left}>
        <div
          className={[styles.tabItem, activeTab === 'worklist' ? styles.active : ''].filter(Boolean).join(' ')}
          onClick={() => handleTabChange('worklist')}
        >
          TOC Worklist
        </div>
        <div
          className={[styles.tabItem, activeTab === 'queue' ? styles.active : ''].filter(Boolean).join(' ')}
          onClick={() => handleTabChange('queue')}
        >
          TOC Agent Queue
          {queueTabDot && <span className={styles.notifDot} title="Agent invoked — view queue" />}
        </div>
      </div>

      <div className={styles.right}>
        {activeTab === 'queue' && (
          <div className={styles.queueActions}>
            <button className={styles.btnSecondary}>
              <Icon name="solar:pen-new-square-linear" size={18} />
              Edit Configuration
            </button>
            <button className={styles.btnDanger}>
              <Icon name="solar:close-circle-bold" size={18} />
              Abort
            </button>
          </div>
        )}

        <div className={styles.searchWrap}>
          {searchOpen ? (
            <div className={styles.searchInput}>
              <Icon name="solar:magnifer-linear" size={15} color="var(--neutral-300)" />
              <input
                autoFocus
                type="text"
                placeholder="Search by member name…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button className={styles.searchClose} onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>✕</button>
            </div>
          ) : (
            <button className={styles.iconBtn} title="Search" onClick={() => setSearchOpen(true)}>
              <Icon name="solar:magnifer-linear" size={18} />
            </button>
          )}
        </div>
        <span className={styles.iconDivider} />
        <button
          className={[styles.iconBtn, showFilterBar ? styles.active : ''].filter(Boolean).join(' ')}
          title="Filter"
          onClick={() => setShowFilterBar(!showFilterBar)}
        >
          <Icon name="solar:filter-linear" size={18} />
        </button>
        <span className={styles.iconDivider} />
        <button className={styles.iconBtn} title="History">
          <Icon name="solar:history-linear" size={18} />
        </button>
        <span className={styles.iconDivider} />
        <button className={styles.iconBtn} title="Export">
          <Icon name="solar:upload-minimalistic-linear" size={18} />
        </button>
      </div>
    </div>
  );
}
