import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Icon } from '../../components/Icon/Icon';
import { PatientHeader } from './components/PatientHeader';
import { CareGapsPanel } from './components/CareGapsPanel';
import { ProfileTabBar } from './components/ProfileTabBar';
import { CareManagementView } from './components/CareManagementView';
import { OverviewTab } from './components/OverviewTab';
import styles from './PatientDetailView.module.css';

function TabPlaceholder({ tabName }) {
  return (
    <div className={styles.placeholder}>
      <Icon name="solar:widget-2-linear" size={40} color="var(--neutral-150)" />
      <span className={styles.placeholderTitle}>{tabName}</span>
      <span className={styles.placeholderText}>This section is under development</span>
    </div>
  );
}

export function PatientDetailView() {
  const selectedPatientId = useAppStore(s => s.selectedPatientId);
  const patients = useAppStore(s => s.patients);
  const [activeTab, setActiveTab] = useState('Overview');

  const patient = patients.find(p => p.id === selectedPatientId);

  if (!patient) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.placeholder}>
          <Icon name="solar:user-cross-linear" size={40} color="var(--neutral-150)" />
          <span className={styles.placeholderTitle}>Patient not found</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <PatientHeader patient={patient} />
      <div className={styles.body}>
        <CareGapsPanel />
        <div className={styles.rightPanel}>
          <ProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} />
          <div className={styles.tabContent}>
            {activeTab === 'Overview' ? (
              <OverviewTab />
            ) : activeTab === 'Care Management' ? (
              <CareManagementView />
            ) : (
              <TabPlaceholder tabName={activeTab} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
