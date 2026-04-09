import { useState, useRef, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Icon } from '../../components/Icon/Icon';
import { PatientBanner } from './components/PatientBanner';
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
  const [leftWidth, setLeftWidth] = useState(496);
  const dragging = useRef(false);
  const bodyRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e) => {
      if (!dragging.current || !bodyRef.current) return;
      const rect = bodyRef.current.getBoundingClientRect();
      const newWidth = Math.max(300, Math.min(700, e.clientX - rect.left));
      setLeftWidth(newWidth);
    };

    const handleMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

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
      <PatientBanner patient={patient} />
      <div className={styles.body} ref={bodyRef}>
        <div style={{ width: leftWidth, minWidth: 300, maxWidth: 700, flexShrink: 0 }}>
          <CareGapsPanel patientId={selectedPatientId} />
        </div>
        {/* Drag handle */}
        <div className={styles.dragHandle} onMouseDown={handleMouseDown}>
          <div className={styles.dragHandleLine} />
        </div>
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
