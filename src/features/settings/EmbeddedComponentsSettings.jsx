import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Icon } from '../../components/Icon/Icon';
import { Button } from '../../components/Button/Button';
import { SearchIconButton } from '../../components/SearchIconButton/SearchIconButton';
import { DomainRegistryPanel } from './panels/DomainRegistryPanel';
import { ComponentLibraryPanel } from './panels/ComponentLibraryPanel';
import styles from './EmbeddedComponentsSettings.module.css';

const TAB_MAP = {
  'domain-registry': 'Domain Registry',
  'component-library': 'Component Library',
  'audit-log': 'Audit Log',
};
const TAB_KEYS = Object.keys(TAB_MAP);

export function EmbeddedComponentsSettings() {
  const embeddedComponentsTab = useAppStore(s => s.embeddedComponentsTab) || 'domain-registry';
  const setEmbeddedComponentsTab = useAppStore(s => s.setEmbeddedComponentsTab);
  const setComponentWizard = useAppStore(s => s.setComponentWizard);
  const setDomainAddTrigger = useAppStore(s => s.setDomainAddTrigger);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const activeTabLabel = TAB_MAP[embeddedComponentsTab] || 'Domain Registry';

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabBar}>
        <div className={styles.tabs}>
          {TAB_KEYS.map(key => (
            <div
              key={key}
              className={[styles.tab, embeddedComponentsTab === key ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setEmbeddedComponentsTab(key)}
            >
              {TAB_MAP[key]}
            </div>
          ))}
        </div>
        <div className={styles.tabActions}>
          {embeddedComponentsTab !== 'audit-log' && (
            <div className={styles.searchWrap}>
              {searchOpen ? (
                <div className={styles.searchInput}>
                  <Icon name="solar:magnifer-linear" size={15} color="var(--neutral-300)" />
                  <input
                    autoFocus
                    type="text"
                    placeholder={embeddedComponentsTab === 'component-library' ? 'Search components...' : 'Search domains...'}
                    value={searchVal}
                    onChange={e => setSearchVal(e.target.value)}
                  />
                  <button className={styles.searchClose} onClick={() => { setSearchOpen(false); setSearchVal(''); }}>
                    ✕
                  </button>
                </div>
              ) : (
                <SearchIconButton title="Search" onClick={() => setSearchOpen(true)} />
              )}
            </div>
          )}
          {embeddedComponentsTab !== 'audit-log' && (
            <>
              <span className={styles.tabDivider} />
              <Button
                variant="primary"
                size="L"
                leadingIcon="solar:add-circle-linear"
                onClick={() => {
                  if (embeddedComponentsTab === 'component-library') {
                    setComponentWizard(true, null);
                  } else {
                    setDomainAddTrigger(true);
                  }
                }}
              >
                {embeddedComponentsTab === 'component-library' ? 'New Component' : 'Register Domain'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className={styles.tableWrap}>
        {embeddedComponentsTab === 'domain-registry' ? (
          <DomainRegistryPanel searchQuery={searchVal} />
        ) : embeddedComponentsTab === 'component-library' ? (
          <ComponentLibraryPanel searchQuery={searchVal} />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <div style={{ textAlign: 'center' }}>
              <Icon name="solar:document-text-linear" size={40} color="var(--neutral-200)" />
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--neutral-300)', marginTop: 8 }}>{activeTabLabel}</div>
              <div style={{ fontSize: 13, color: 'var(--neutral-200)', marginTop: 4 }}>Coming soon</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
