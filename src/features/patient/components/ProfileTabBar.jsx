import { PROFILE_TABS } from '../data/programActivityMock';
import styles from './ProfileTabBar.module.css';

export function ProfileTabBar({ activeTab, onTabChange }) {
  return (
    <div className={styles.tabBar}>
      {PROFILE_TABS.map(tab => (
        <button key={tab} className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`} onClick={() => onTabChange(tab)}>
          {tab}
        </button>
      ))}
    </div>
  );
}
