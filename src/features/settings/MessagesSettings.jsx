import { useState } from 'react';
import { Icon } from '../../components/Icon/Icon';
import { ChatSettingsPanel } from './panels/ChatSettingsPanel';
import { useAppStore } from '../../store/useAppStore';
import styles from './AgentsTable.module.css';

const TABS = ['Inboxes', 'Template Responses', 'Chat Settings', 'eFax'];

export function MessagesSettings() {
  const [activeTab, setActiveTab] = useState('Chat Settings');
  const [searchOpen, setSearchOpen] = useState(false);
  const setChatGroupDetailId = useAppStore(s => s.setChatGroupDetailId);
  const [searchVal, setSearchVal] = useState('');

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabBar}>
        <div className={styles.tabs}>
          {TABS.map(tab => (
            <div
              key={tab}
              className={[styles.tab, activeTab === tab ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
        <div className={styles.tabActions}>
          {activeTab === 'Chat Settings' && (
            <>
              <div className={styles.searchWrap}>
                {searchOpen ? (
                  <div className={styles.searchInput}>
                    <Icon name="solar:magnifer-linear" size={15} color="#6F7A90" />
                    <input autoFocus type="text" placeholder="Search groups..." value={searchVal} onChange={e => setSearchVal(e.target.value)} />
                    <button className={styles.searchClose} onClick={() => { setSearchOpen(false); setSearchVal(''); }}>✕</button>
                  </div>
                ) : (
                  <button className={styles.searchBtn} title="Search" onClick={() => setSearchOpen(true)}>
                    <Icon name="solar:magnifer-linear" size={18} />
                  </button>
                )}
              </div>
              <span className={styles.tabDivider} />
              <button className={styles.createBtn} onClick={() => setChatGroupDetailId('new')}>
                <Icon name="solar:add-circle-linear" size={16} />
                Add/Update Group
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.tableWrap}>
        {activeTab === 'Chat Settings' ? (
          <ChatSettingsPanel searchQuery={searchVal} />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <div style={{ textAlign: 'center' }}>
              <Icon name="solar:inbox-linear" size={40} color="var(--neutral-200)" />
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--neutral-300)', marginTop: 8 }}>{activeTab}</div>
              <div style={{ fontSize: 13, color: 'var(--neutral-200)', marginTop: 4 }}>Coming soon</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
