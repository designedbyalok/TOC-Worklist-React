import { Icon } from '../../components/Icon/Icon';
import styles from './SettingsSubNav.module.css';

const MENU_ITEMS = [
  { icon: 'solar:user-check-rounded-linear', label: 'Member/Leads' },
  { icon: 'solar:calendar-date-linear', label: 'Calendar' },
  { icon: 'solar:checklist-minimalistic-linear', label: 'Tasks' },
  { icon: 'solar:chat-square-linear', label: 'Messages', key: 'messages' },
  { icon: 'solar:phone-linear', label: 'Calls' },
  { icon: 'solar:widget-add-linear', label: 'CRM Widgets' },
  { icon: 'solar:documents-linear', label: 'Content' },
  { icon: 'solar:watch-square-linear', label: 'Wearables' },
  { icon: 'solar:rocket-linear', label: 'Journeys' },
  { icon: 'solar:ghost-smile-linear', label: 'Agents', key: 'agents' },
  { icon: 'solar:settings-linear', label: 'Automations' },
  { icon: 'solar:library-linear', label: 'Cost Template' },
  { icon: 'solar:user-id-linear', label: 'Memberships' },
  { icon: 'solar:shield-user-linear', label: 'Account' },
];

export function SettingsSubNav({ activeItem = 'agents', onItemClick }) {
  return (
    <aside className={styles.nav}>
      {MENU_ITEMS.map(item => {
        const key = item.key || item.label.toLowerCase();
        const isActive = key === activeItem;
        return (
          <div
            key={item.label}
            className={[styles.item, isActive ? styles.active : ''].filter(Boolean).join(' ')}
            onClick={() => onItemClick?.(key)}
          >
            <Icon name={item.icon} size={16} color={isActive ? 'var(--primary-300)' : 'var(--neutral-300)'} />
            <span>{item.label}</span>
          </div>
        );
      })}
    </aside>
  );
}
