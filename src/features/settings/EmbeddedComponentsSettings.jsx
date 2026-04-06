import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Icon } from '../../components/Icon/Icon';
import { Button } from '../../components/Button/Button';
import { SearchIconButton } from '../../components/SearchIconButton/SearchIconButton';
import { ProductTour } from '../../components/ProductTour/ProductTour';
import { DomainRegistryPanel } from './panels/DomainRegistryPanel';
import { ComponentLibraryPanel } from './panels/ComponentLibraryPanel';
import styles from './EmbeddedComponentsSettings.module.css';

const TAB_MAP = {
  'domain-registry': 'Domain Registry',
  'component-library': 'Component Library',
};
const TAB_KEYS = Object.keys(TAB_MAP);

export function EmbeddedComponentsSettings() {
  const embeddedComponentsTab = useAppStore(s => s.embeddedComponentsTab) || 'domain-registry';
  const setEmbeddedComponentsTab = useAppStore(s => s.setEmbeddedComponentsTab);
  const setComponentWizard = useAppStore(s => s.setComponentWizard);
  const setDomainAddTrigger = useAppStore(s => s.setDomainAddTrigger);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabBar} data-tour="embed-tabs">
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
          <span className={styles.tabDivider} />
          <Button
            variant="secondary"
            size="L"
            leadingIcon="solar:add-circle-linear"
            data-tour="embed-register-btn"
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
        </div>
      </div>

      <div className={styles.tableWrap}>
        {embeddedComponentsTab === 'domain-registry' ? (
          <DomainRegistryPanel searchQuery={searchVal} />
        ) : (
          <ComponentLibraryPanel searchQuery={searchVal} />
        )}
      </div>

      <ProductTour tourId="embed-settings" steps={EMBED_TOUR_STEPS} />
    </div>
  );
}

const EMBED_TOUR_STEPS = [
  {
    target: '[data-tour="embed-tabs"]',
    title: 'Embed Settings',
    content: 'Switch between Domain Registry to manage allowed domains and Component Library to configure embeddable widgets.',
    icon: 'solar:code-linear',
    placement: 'bottom',
    skipBeacon: true,
  },
  {
    target: '[data-tour="embed-register-btn"]',
    title: 'Register New Domain',
    content: 'Add third-party domains that are authorized to host your embedded components. Each domain requires HIPAA verification.',
    icon: 'solar:add-circle-linear',
    placement: 'bottom-end',
    skipBeacon: true,
  },
  {
    target: '[data-tour="embed-toggle"]',
    title: 'Enable or Disable',
    content: 'Toggle domains on or off instantly. Disabled domains will stop serving all embedded components.',
    icon: 'solar:toggle-on-linear',
    placement: 'left',
    skipBeacon: true,
  },
  {
    target: '[data-tour="embed-actions"]',
    title: 'Domain Actions',
    content: 'Edit domain settings, view the audit log for change history, or remove a domain entirely.',
    icon: 'solar:widget-linear',
    placement: 'left',
    skipBeacon: true,
  },
];
