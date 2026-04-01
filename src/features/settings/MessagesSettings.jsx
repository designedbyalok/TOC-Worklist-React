import { useState, useEffect } from 'react';
import { Icon } from '../../components/Icon/Icon';
import { ChatSettingsPanel } from './panels/ChatSettingsPanel';
import { useAppStore } from '../../store/useAppStore';
import styles from './AgentsTable.module.css';

const TAB_MAP = {
  'inboxes': 'Inboxes',
  'template-responses': 'Template Responses',
  'chat-settings': 'Chat Settings',
  'efax': 'eFax',
};
const TAB_KEYS = Object.keys(TAB_MAP);

export function MessagesSettings() {
  const messageTab = useAppStore(s => s.messageTab) || 'chat-settings';
  const setMessageTab = useAppStore(s => s.setMessageTab);
  const setChatGroupDetailId = useAppStore(s => s.setChatGroupDetailId);
  const fetchChatGroups = useAppStore(s => s.fetchChatGroups);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => { fetchChatGroups(); }, [fetchChatGroups]);

  const activeTabLabel = TAB_MAP[messageTab] || 'Chat Settings';

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabBar}>
        <div className={styles.tabs}>
          {TAB_KEYS.map(key => (
            <div
              key={key}
              className={[styles.tab, messageTab === key ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setMessageTab(key)}
            >
              {TAB_MAP[key]}
            </div>
          ))}
        </div>
        <div className={styles.tabActions}>
          {messageTab === 'chat-settings' && (
            <>
              <div className={styles.searchWrap}>
                {searchOpen ? (
                  <div className={styles.searchInput}>
                    <Icon name="solar:magnifer-linear" size={15} color="var(--neutral-300)" />
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
        {messageTab === 'chat-settings' ? (
          <ChatSettingsPanel searchQuery={searchVal} />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <div style={{ textAlign: 'center' }}>
              <Icon name="solar:inbox-linear" size={40} color="var(--neutral-200)" />
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--neutral-300)', marginTop: 8 }}>{activeTabLabel}</div>
              <div style={{ fontSize: 13, color: 'var(--neutral-200)', marginTop: 4 }}>Coming soon</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
