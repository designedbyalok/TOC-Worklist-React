import { SettingsSubNav } from './SettingsSubNav';
import { AgentsTable } from './AgentsTable';
import styles from './SettingsLayout.module.css';

export function SettingsLayout() {
  return (
    <div className={styles.layout}>
      <SettingsSubNav activeItem="agents" />
      <AgentsTable />
    </div>
  );
}
