import { Sidebar } from '../components/Sidebar/Sidebar';
import { PatientDetailView } from '../features/patient/PatientDetailView';
import { CalendarView as CalendarPageView } from '../features/calendar/CalendarView';
import { SubNav } from '../components/SubNav/SubNav';
import { TopBar } from '../components/TopBar/TopBar';
import { TabBar } from '../components/TabBar/TabBar';
import { FilterBar } from '../components/FilterBar/FilterBar';
import { Pagination } from '../components/Pagination/Pagination';
import { WorkflowPanel } from '../components/WorkflowPanel/WorkflowPanel';
import { ActiveCallCard } from '../components/ActiveCallCard/ActiveCallCard';
import { CallPopover } from '../components/CallPopover/CallPopover';
import { InvokeAgentModal } from '../components/InvokeAgentModal/InvokeAgentModal';
import { DetailDrawer } from '../components/DetailDrawer/DetailDrawer';
import { LiveDrawer } from '../components/LiveDrawer/LiveDrawer';
import { SystemHealthStrip } from '../components/SystemHealthStrip/SystemHealthStrip';
import { DegradedBanner } from '../components/DegradedBanner/DegradedBanner';
import { GoalDetailDrawer } from '../features/settings/panels/GoalDetailDrawer';
import { GoalWizardDrawer } from '../features/settings/panels/GoalWizardDrawer';
import { GroupDetailDrawer } from '../features/settings/panels/GroupDetailDrawer';
import { AgentRulesDrawer } from '../features/settings/panels/AgentRulesDrawer';
import { BusinessHoursDrawer } from '../features/settings/panels/BusinessHoursDrawer';
import { ComponentWizardDrawer } from '../features/settings/panels/ComponentWizardDrawer';
import { WorklistTable } from '../features/worklist/WorklistTable';
import { QueueTable } from '../features/queue/QueueTable';
import { QueueSummaryBar } from '../features/queue/QueueSummaryBar';
import { SettingsLayout } from '../features/settings/SettingsLayout';
import { CreateAgentDrawer } from '../features/settings/CreateAgentDrawer';
import { AgentCanvas } from '../features/agent-builder/AgentCanvas';
import { AnalyticsLayout } from '../features/analytics/AnalyticsLayout';
import { useAppStore } from '../store/useAppStore';
import styles from './AppLayout.module.css';

function Toast() {
  const toast = useAppStore(s => s.toast);
  const closeToast = useAppStore(s => s.closeToast);
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--neutral-500)', color: '#fff', padding: '12px 20px', borderRadius: 8,
      fontSize: 14, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,.2)', zIndex: 10001,
      whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 12
    }}>
      {toast}
      <button onClick={closeToast} style={{
        background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
        fontSize: 16, padding: 0, display: 'flex', opacity: 0.8, lineHeight: 1,
      }}>✕</button>
    </div>
  );
}

function ToastSuccess() {
  const toastSuccess = useAppStore(s => s.toastSuccess);
  const closeToastSuccess = useAppStore(s => s.closeToastSuccess);
  if (!toastSuccess) return null;
  return (
    <div style={{
      position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
      background: '#059669', color: '#fff', padding: '12px 20px', borderRadius: 8,
      fontSize: 14, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,.2)', zIndex: 600,
      display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap'
    }}>
      TOC Agent Invoked Successfully
      <button onClick={closeToastSuccess} style={{
        background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
        fontSize: 16, padding: 0, display: 'flex', opacity: 0.8, lineHeight: 1,
      }}>✕</button>
    </div>
  );
}

function PopulationView() {
  const subnavCollapsed = useAppStore(s => s.subnavCollapsed);
  const activeTab = useAppStore(s => s.activeTab);
  const showFilterBar = useAppStore(s => s.showFilterBar);

  const selectedPatientId = useAppStore(s => s.selectedPatientId);

  // Patient detail view — full-page, no subnav
  if (selectedPatientId) {
    return (
      <div className={styles.main}>
        <TopBar />
        <div className={styles.content}>
          <PatientDetailView />
        </div>
      </div>
    );
  }

  return (
    <>
      <SubNav collapsed={subnavCollapsed} />
      <div className={styles.main}>
        <TopBar />
        <DegradedBanner />
        <SystemHealthStrip />
        <div className={styles.content}>
          <TabBar />
          {showFilterBar && <FilterBar />}
          {activeTab === 'queue' && <QueueSummaryBar />}
          {activeTab === 'worklist' ? <WorklistTable /> : <QueueTable />}
          <Pagination />
        </div>
      </div>
    </>
  );
}

function SettingsView() {
  return (
    <div className={styles.main}>
      <TopBar />
      <div className={styles.content}>
        <SettingsLayout />
      </div>
    </div>
  );
}

function AnalyticsView() {
  return (
    <div className={styles.main}>
      <TopBar />
      <div className={styles.content}>
        <AnalyticsLayout />
      </div>
    </div>
  );
}

function CalendarViewPage() {
  return (
    <div className={styles.main}>
      <TopBar />
      <div className={styles.content}>
        <CalendarPageView />
      </div>
    </div>
  );
}

export function AppLayout() {
  const activePage = useAppStore(s => s.activePage);
  const showCreateAgent = useAppStore(s => s.showCreateAgent);
  const workflowPatient = useAppStore(s => s.workflowPatient);
  const callPopoverPatient = useAppStore(s => s.callPopoverPatient);
  const detailPatient = useAppStore(s => s.detailPatient);
  const liveDrawerPatient = useAppStore(s => s.liveDrawerPatient);
  const goalDetailId = useAppStore(s => s.goalDetailId);
  const goalWizardOpen = useAppStore(s => s.goalWizardOpen);
  const chatGroupDetailId = useAppStore(s => s.chatGroupDetailId);
  const agentRulesGroupId = useAppStore(s => s.agentRulesGroupId);
  const businessHoursOpen = useAppStore(s => s.businessHoursOpen);
  const componentWizardOpen = useAppStore(s => s.componentWizardOpen);

  // Agent Builder is a full-screen takeover
  if (activePage === 'builder') {
    return (
      <div className={styles.app}>
        <Sidebar />
        <AgentCanvas />
        <Toast />
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <Sidebar />
      {activePage === 'analytics' ? <AnalyticsView /> : activePage === 'settings' ? <SettingsView /> : activePage === 'calendar' ? <CalendarViewPage /> : <PopulationView />}

      {showCreateAgent && <CreateAgentDrawer />}
      {workflowPatient && <WorkflowPanel />}
      {callPopoverPatient && <CallPopover />}
      <ActiveCallCard />
      <InvokeAgentModal />
      {detailPatient && <DetailDrawer />}
      {liveDrawerPatient && <LiveDrawer />}
      {goalDetailId && <GoalDetailDrawer />}
      {goalWizardOpen && <GoalWizardDrawer />}
      {componentWizardOpen && <ComponentWizardDrawer />}
      {chatGroupDetailId && <GroupDetailDrawer />}
      {agentRulesGroupId && <AgentRulesDrawer />}
      {businessHoursOpen && <BusinessHoursDrawer />}
      <Toast />
      <ToastSuccess />
    </div>
  );
}
