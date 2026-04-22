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
import { WorklistTable } from '../features/toc-worklist/WorklistTable';
import { QueueTable } from '../features/toc-queue/QueueTable';
import { QueueSummaryBar } from '../features/toc-queue/QueueSummaryBar';
import { HccWorklistTable } from '../features/hcc/HccWorklistTable';
import { AllPatientsTable } from '../features/all-patients/AllPatientsTable';
import { DiagPanel } from '../features/hcc/DiagPanel/DiagPanel';
import { Icon } from '../components/Icon/Icon';
import { SettingsLayout } from '../features/settings/SettingsLayout';
import { CreateAgentDrawer } from '../features/settings/CreateAgentDrawer';
import { AgentCanvas } from '../features/agent-builder/AgentCanvas';
import { AnalyticsLayout } from '../features/analytics/AnalyticsLayout';
import { HomeView } from '../features/home/HomeView';
import { MessagesView } from '../features/messages/MessagesView';
import { CallsView } from '../features/calls/CallsView';
import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import styles from './AppLayout.module.css';

function ComingSoonState({ listName }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '64px 24px', gap: 12,
    }}>
      <Icon name="solar:hourglass-line-linear" size={44} color="var(--neutral-200)" />
      <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--neutral-400)', margin: 0 }}>
        {listName}
      </p>
      <p style={{ fontSize: 14, margin: 0, textAlign: 'center', maxWidth: 320, color: 'var(--neutral-300)' }}>
        This worklist is coming soon. Check back for updates.
      </p>
    </div>
  );
}

function Toast() {
  const toast = useAppStore(s => s.toast);
  const closeToast = useAppStore(s => s.closeToast);
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--neutral-500)', color: 'var(--neutral-0)', padding: '12px 20px', borderRadius: 8,
      fontSize: 14, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,.2)', zIndex: 10001,
      whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 12
    }}>
      {toast}
      <button onClick={closeToast} style={{
        background: 'none', border: 'none', color: 'var(--neutral-0)', cursor: 'pointer',
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
      background: 'var(--status-success)', color: '#fff', padding: '12px 20px', borderRadius: 8,
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
  const activeSubnavList = useAppStore(s => s.activeSubnavList);

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

  const isHcc = activeSubnavList === 'HCC';
  const isAllPatients = activeSubnavList === 'All Patients';
  const TOC_LISTS = ['TOC'];
  const isToc = TOC_LISTS.includes(activeSubnavList) || (!isHcc && !isAllPatients && activeSubnavList !== 'My Patients' && !['Day Optimizer', 'Review HRA', 'IP Visits', 'High Risk', 'High Cost', 'SNP', 'AWV', 'High Utilizers', 'DM', 'My Patients'].includes(activeSubnavList));
  const isComingSoon = ['Day Optimizer', 'Review HRA', 'IP Visits', 'High Risk', 'High Cost', 'SNP', 'AWV', 'High Utilizers', 'DM', 'My Patients'].includes(activeSubnavList);

  return (
    <>
      <SubNav collapsed={subnavCollapsed} />
      <div className={styles.main}>
        <TopBar />
        <DegradedBanner />
        <div className={styles.content}>
          {!isHcc && !isComingSoon && <TabBar />}
          {!isHcc && !isComingSoon && showFilterBar && <FilterBar />}
          {!isHcc && !isAllPatients && !isComingSoon && activeTab === 'toc-queue' && <QueueSummaryBar />}
          {isHcc
            ? <HccWorklistTable />
            : isAllPatients
              ? <AllPatientsTable />
              : isComingSoon
                ? <ComingSoonState listName={activeSubnavList} />
                : (activeTab === 'toc-worklist' ? <WorklistTable /> : <QueueTable />)}
          {!isHcc && !isComingSoon && <Pagination />}
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
  const builderAgent = useAppStore(s => s.builderAgent);

  // Keep profiles in sync with auth.users. Self-signups and OAuth logins don't
  // go through the Invite flow, so profiles would otherwise stay empty for them.
  // First login inserts with safe defaults; later logins only refresh identity
  // fields so admin-set role/status aren't clobbered.
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data?.user;
      if (!user) return;
      const meta = user.user_metadata || {};
      const firstName = meta.first_name || null;
      const lastName  = meta.last_name  || null;
      const fullName  = meta.full_name  || [firstName, lastName].filter(Boolean).join(' ') || null;

      const identity = {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        email: user.email,
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (existing) {
        await supabase.from('profiles').update(identity).eq('id', user.id);
      } else {
        await supabase.from('profiles').insert({
          ...identity,
          status: 'Active',
          role: 'Viewer',
          clinical_roles: [],
          admin_role: 'Employer',
        });
      }
    });
  }, []);

  // Re-open agent builder on page refresh when URL has agent edit path
  useEffect(() => {
    const pendingId = useAppStore.getState()._pendingAgentId;
    if (pendingId && !builderAgent) {
      // Try to find the agent in the already-loaded agents list
      const agents = useAppStore.getState().agents || [];
      const agent = agents.find(a => String(a.id) === String(pendingId));
      if (agent) {
        useAppStore.getState().openBuilder(agent);
      } else {
        // Agent list may not be loaded yet — wait for it
        const unsub = useAppStore.subscribe((state) => {
          if (state.agents?.length && state._pendingAgentId) {
            const a = state.agents.find(ag => String(ag.id) === String(state._pendingAgentId));
            if (a) {
              useAppStore.getState().openBuilder(a);
              useAppStore.setState({ _pendingAgentId: null });
            }
            unsub();
          }
        });
        // Clear after 5s timeout to avoid lingering
        setTimeout(() => { unsub(); useAppStore.setState({ _pendingAgentId: null }); }, 5000);
      }
    }
  }, []);
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
  const diagPanelOpen = useAppStore(s => s.diagPanelOpen);

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
      {activePage === 'home' ? <HomeView /> : activePage === 'messages' ? <MessagesView /> : activePage === 'calls' ? <CallsView /> : activePage === 'analytics' ? <AnalyticsView /> : activePage === 'settings' ? <SettingsView /> : activePage === 'calendar' ? <CalendarViewPage /> : <PopulationView />}

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
      {diagPanelOpen && <DiagPanel />}
      <Toast />
      <ToastSuccess />
    </div>
  );
}
