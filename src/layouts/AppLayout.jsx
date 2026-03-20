import { Sidebar } from '../components/Sidebar/Sidebar';
import { SubNav } from '../components/SubNav/SubNav';
import { TopBar } from '../components/TopBar/TopBar';
import { TabBar } from '../components/TabBar/TabBar';
import { FilterBar } from '../components/FilterBar/FilterBar';
import { Pagination } from '../components/Pagination/Pagination';
import { WorkflowPanel } from '../components/WorkflowPanel/WorkflowPanel';
import { ActiveCallCard } from '../components/ActiveCallCard/ActiveCallCard';
import { CallPopover } from '../components/CallPopover/CallPopover';
import { InvokeAgentModal } from '../components/InvokeAgentModal/InvokeAgentModal';
import { WorklistTable } from '../features/worklist/WorklistTable';
import { QueueTable } from '../features/queue/QueueTable';
import { useAppStore } from '../store/useAppStore';
import styles from './AppLayout.module.css';

function Toast() {
  const toast = useAppStore(s => s.toast);
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--neutral-500)', color: '#fff', padding: '12px 20px', borderRadius: 8,
      fontSize: 14, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,.2)', zIndex: 400,
      whiteSpace: 'nowrap'
    }}>
      {toast}
    </div>
  );
}

function ToastSuccess() {
  const toastSuccess = useAppStore(s => s.toastSuccess);
  if (!toastSuccess) return null;
  return (
    <div style={{
      position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
      background: '#059669', color: '#fff', padding: '12px 20px', borderRadius: 8,
      fontSize: 14, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,.2)', zIndex: 600,
      display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap'
    }}>
      TOC Agent Invoked Successfully
    </div>
  );
}

export function AppLayout() {
  const subnavCollapsed = useAppStore(s => s.subnavCollapsed);
  const activeTab = useAppStore(s => s.activeTab);
  const workflowPatient = useAppStore(s => s.workflowPatient);
  const showInvokeModal = useAppStore(s => s.showInvokeModal);
  const showFilterBar = useAppStore(s => s.showFilterBar);
  const callPopoverPatient = useAppStore(s => s.callPopoverPatient);

  return (
    <div className={styles.app}>
      <Sidebar />
      <SubNav collapsed={subnavCollapsed} />
      <div className={styles.main}>
        <TopBar />
        <div className={styles.content}>
          <TabBar />
          {showFilterBar && <FilterBar />}
          {activeTab === 'worklist' ? <WorklistTable /> : <QueueTable />}
          <Pagination />
        </div>
      </div>

      {workflowPatient && <WorkflowPanel />}
      {callPopoverPatient && <CallPopover />}
      <ActiveCallCard />
      {showInvokeModal && <InvokeAgentModal />}
      <Toast />
      <ToastSuccess />
    </div>
  );
}
