import { Icon } from '../Icon/Icon';
import { useAppStore } from '../../store/useAppStore';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { icon: 'solar:home-2-linear', label: 'Home', page: 'home' },
  { icon: 'solar:users-group-rounded-bold', label: 'Population', badge: 8, page: 'population' },
  { icon: 'solar:calendar-linear', label: 'Calendar', page: 'calendar' },
  { icon: 'solar:checklist-minimalistic-linear', label: 'Tasks', page: 'tasks' },
  { icon: 'solar:chat-round-dots-linear', label: 'Messages', badge: 8, page: 'messages' },
  { icon: 'solar:phone-linear', label: 'Calls', page: 'calls' },
  { icon: 'solar:user-speak-linear', label: 'Leads', page: 'leads' },
  { icon: 'solar:target-linear', label: 'Campaign', page: 'campaign' },
  { icon: 'solar:chart-2-linear', label: 'Analytics', page: 'analytics' },
  { icon: 'solar:settings-linear', label: 'Settings', page: 'settings' },
];

const BOTTOM_ITEMS = [
  { icon: 'solar:question-circle-linear', label: 'Help' },
];

export function Sidebar() {
  const activePage = useAppStore(s => s.activePage);
  const setActivePage = useAppStore(s => s.setActivePage);
  const setCurrentPage = useAppStore(s => s.setCurrentPage);

  const showToast = useAppStore(s => s.showToast);
  const implementedPages = ['population', 'settings'];

  const handleClick = (e, page) => {
    e.preventDefault();
    if (!page) return;
    if (implementedPages.includes(page)) {
      setActivePage(page);
      setCurrentPage(1);
    } else {
      showToast(`${page.charAt(0).toUpperCase() + page.slice(1)} – coming soon`);
    }
  };

  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="2" width="8" height="24" rx="4" fill="none" stroke="white" strokeWidth="2.5"/>
          <rect x="2" y="10" width="24" height="8" rx="4" fill="none" stroke="white" strokeWidth="2.5"/>
          <rect x="10" y="10" width="8" height="8" fill="#1A0647"/>
        </svg>
      </div>
      {NAV_ITEMS.map((item) => (
        <a
          key={item.label}
          className={[styles.item, activePage === item.page ? styles.active : ''].filter(Boolean).join(' ')}
          href="#"
          title={item.label}
          onClick={e => handleClick(e, item.page)}
        >
          {item.badge && <span className={styles.badge}>{item.badge}</span>}
          <div className={styles.itemInner}>
            <Icon name={item.icon} size={22} />
          </div>
          <span>{item.label}</span>
        </a>
      ))}
      <div className={styles.spacer} />
      {BOTTOM_ITEMS.map((item) => (
        <a
          key={item.label}
          className={styles.item}
          href="#"
          title={item.label}
          onClick={e => e.preventDefault()}
        >
          <div className={styles.itemInner}>
            <Icon name={item.icon} size={22} />
          </div>
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
