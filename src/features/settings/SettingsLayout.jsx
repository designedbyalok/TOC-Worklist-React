import { SettingsSubNav } from './SettingsSubNav';
import { AgentsTable } from './AgentsTable';
import { MessagesSettings } from './MessagesSettings';
import { useAppStore } from '../../store/useAppStore';
import styles from './SettingsLayout.module.css';

export function SettingsLayout() {
  const settingsNavItem = useAppStore(s => s.settingsNavItem);
  const setSettingsNavItem = useAppStore(s => s.setSettingsNavItem);

  return (
    <div className={styles.layout}>
      <SettingsSubNav activeItem={settingsNavItem} onItemClick={setSettingsNavItem} />
      {settingsNavItem === 'messages' ? (
        <MessagesSettings />
      ) : (
        <AgentsTable />
      )}
    </div>
  );
}
