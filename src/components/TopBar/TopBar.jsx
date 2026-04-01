import { useRef } from 'react';
import { Icon } from '../Icon/Icon';
import { ActionButton } from '../ActionButton/ActionButton';
import { Avatar } from '../Avatar/Avatar';
import { CreateNewPopover } from '../CreateNewPopover/CreateNewPopover';
import { useAppStore } from '../../store/useAppStore';
import styles from './TopBar.module.css';

export function TopBar() {
  const toggleSubnav = useAppStore(s => s.toggleSubnav);
  const subnavCollapsed = useAppStore(s => s.subnavCollapsed);
  const activePage = useAppStore(s => s.activePage);
  const showCreateNew = useAppStore(s => s.showCreateNew);
  const setShowCreateNew = useAppStore(s => s.setShowCreateNew);
  const btnRef = useRef(null);

  const isSettings = activePage === 'settings';
  const isAnalytics = activePage === 'analytics';

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        {!isSettings && !isAnalytics && (
          <ActionButton
            icon={subnavCollapsed ? 'solar:alt-arrow-right-linear' : 'solar:sidebar-minimalistic-linear'}
            size="L"
            tooltip="Toggle panel"
            onClick={toggleSubnav}
          />
        )}
        <nav className={styles.breadcrumb}>
          {isAnalytics ? (
            <>
              <a className={styles.breadcrumbLink} href="#" onClick={e => e.preventDefault()}>Analytics</a>
              <span className={styles.sep}>/</span>
              <span className={styles.breadcrumbCurrent}>Fold Insights</span>
            </>
          ) : isSettings ? (
            <>
              <a className={styles.breadcrumbLink} href="#" onClick={e => e.preventDefault()}>Settings</a>
              <span className={styles.sep}>/</span>
              <span className={styles.breadcrumbCurrent}>Automation</span>
            </>
          ) : (
            <>
              <a className={styles.breadcrumbLink} href="#" onClick={e => e.preventDefault()}>Population</a>
              <span className={styles.sep}>/</span>
              <a className={styles.breadcrumbLink} href="#" onClick={e => e.preventDefault()}>Worklists</a>
              <span className={styles.sep}>/</span>
              <span className={styles.breadcrumbCurrent}>TOC</span>
            </>
          )}
        </nav>
      </div>

      <div className={styles.center}>
        <div className={styles.searchBox}>
          <Icon name="solar:magnifer-linear" size={18} color="var(--neutral-200)" />
          <input type="text" placeholder="Search Patients or Members" />
        </div>
        <button className={styles.askUnity}>
          <Icon name="solar:bolt-bold" size={18} />
          Ask Unity
        </button>
      </div>

      <div className={styles.right}>
        <ActionButton
          icon="solar:bell-outline"
          size="L"
          tooltip="Notifications"
          notification
        />
        <div className={styles.createNewWrap}>
          <button
            ref={btnRef}
            className={styles.btnPrimary}
            onClick={() => setShowCreateNew(!showCreateNew)}
          >
            <Icon name="solar:add-circle-bold" size={18} />
            Create New
          </button>
          {showCreateNew && (
            <CreateNewPopover onClose={() => setShowCreateNew(false)} anchorRef={btnRef} />
          )}
        </div>
        <button className={styles.btnSecondary}>Schedule</button>
        <Avatar variant="provider" initials="RF" />
      </div>
    </header>
  );
}
