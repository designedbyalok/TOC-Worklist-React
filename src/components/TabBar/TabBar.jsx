import { useState } from 'react';
import { Icon } from '../Icon/Icon';
import { useAppStore } from '../../store/useAppStore';
import styles from './TabBar.module.css';

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,.4)',
    }} onClick={onCancel}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: '24px 28px',
        maxWidth: 420, width: '100%', boxShadow: '0 16px 48px rgba(0,0,0,.2)',
        fontFamily: "'Inter', sans-serif",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--primary-50)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="solar:routing-2-bold" size={20} color="var(--primary-300)" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--neutral-500)' }}>
            Open Agent Builder?
          </div>
        </div>
        <p style={{ fontSize: 14, color: 'var(--neutral-300)', lineHeight: 1.6, margin: '0 0 20px' }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onCancel} style={{
            padding: '8px 16px', borderRadius: 6, border: '1px solid var(--neutral-150)',
            background: '#fff', fontSize: 13, fontWeight: 500, color: 'var(--neutral-400)',
            cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            padding: '8px 16px', borderRadius: 6, border: 'none',
            background: 'var(--primary-300)', fontSize: 13, fontWeight: 500,
            color: '#fff', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          }}>
            Open Agent Builder
          </button>
        </div>
      </div>
    </div>
  );
}

export function TabBar() {
  const activeTab = useAppStore(s => s.activeTab);
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const showFilterBar = useAppStore(s => s.showFilterBar);
  const setShowFilterBar = useAppStore(s => s.setShowFilterBar);
  const queueTabDot = useAppStore(s => s.queueTabDot);
  const clearQueueTabDot = useAppStore(s => s.clearQueueTabDot);
  const searchQuery = useAppStore(s => s.searchQuery);
  const setSearchQuery = useAppStore(s => s.setSearchQuery);
  const abortAllAgents = useAppStore(s => s.abortAllAgents);
  const showToast = useAppStore(s => s.showToast);
  const patients = useAppStore(s => s.patients);
  const agents = useAppStore(s => s.agents);
  const openBuilder = useAppStore(s => s.openBuilder);
  const [searchOpen, setSearchOpen] = useState(false);
  const [confirmAbort, setConfirmAbort] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  const hasActiveAgents = patients.some(p => p.agentAssigned);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'queue') clearQueueTabDot();
  };

  const handleAbort = () => {
    if (!confirmAbort) {
      setConfirmAbort(true);
      setTimeout(() => setConfirmAbort(false), 3000);
      return;
    }
    abortAllAgents();
    setConfirmAbort(false);
  };

  const handleEditConfiguration = () => {
    setShowEditConfirm(true);
  };

  const handleConfirmEdit = () => {
    setShowEditConfirm(false);
    // Find the TOC agent by name or use_case
    const tocAgent = agents.find(a =>
      (a.name && a.name.toLowerCase().includes('toc')) ||
      (a.use_case && a.use_case.toLowerCase().includes('toc'))
    );
    const agent = tocAgent || agents[0];
    if (agent) {
      openBuilder({ id: agent.id, name: agent.name });
    } else {
      showToast('No agents configured. Create one in Settings first.');
    }
  };

  return (
    <>
      <div className={styles.tabBar}>
        <div className={styles.left}>
          <div
            className={[styles.tabItem, activeTab === 'worklist' ? styles.active : ''].filter(Boolean).join(' ')}
            onClick={() => handleTabChange('worklist')}
          >
            TOC Worklist
          </div>
          <div
            className={[styles.tabItem, activeTab === 'queue' ? styles.active : ''].filter(Boolean).join(' ')}
            onClick={() => handleTabChange('queue')}
          >
            TOC Agent Queue
            {queueTabDot && <span className={styles.notifDot} title="Agent invoked — view queue" />}
          </div>
        </div>

        <div className={styles.right}>
          {activeTab === 'queue' && (
            <div className={styles.queueActions}>
              <button className={styles.btnSecondary} onClick={handleEditConfiguration}>
                <Icon name="solar:pen-new-square-linear" size={18} />
                Edit Configuration
              </button>
              <button
                className={styles.btnDanger}
                onClick={handleAbort}
                disabled={!hasActiveAgents}
                style={{ opacity: hasActiveAgents ? 1 : 0.5 }}
              >
                <Icon name="solar:close-circle-bold" size={18} />
                {confirmAbort ? 'Click again to confirm' : 'Abort'}
              </button>
            </div>
          )}

          <div className={styles.searchWrap}>
            {searchOpen ? (
              <div className={styles.searchInput}>
                <Icon name="solar:magnifer-linear" size={15} color="var(--neutral-300)" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search by member name…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <button className={styles.searchClose} onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>✕</button>
              </div>
            ) : (
              <button className={styles.iconBtn} title="Search" onClick={() => setSearchOpen(true)}>
                <Icon name="solar:magnifer-linear" size={18} />
              </button>
            )}
          </div>
          <span className={styles.iconDivider} />
          <button
            className={[styles.iconBtn, showFilterBar ? styles.active : ''].filter(Boolean).join(' ')}
            title="Filter"
            onClick={() => setShowFilterBar(!showFilterBar)}
          >
            <Icon name="solar:filter-linear" size={18} />
          </button>
          <span className={styles.iconDivider} />
          <button className={styles.iconBtn} title="History" onClick={() => showToast('History – coming soon')}>
            <Icon name="solar:history-linear" size={18} />
          </button>
          <span className={styles.iconDivider} />
          <button className={styles.iconBtn} title="Export" onClick={() => showToast('Export – coming soon')}>
            <Icon name="solar:upload-minimalistic-linear" size={18} />
          </button>
        </div>
      </div>

      {showEditConfirm && (
        <ConfirmDialog
          message="This will take you to the Agent Builder where you can modify the conversation flow, prompts, and transitions for the TOC agent. Any unsaved changes in the current view will be preserved."
          onConfirm={handleConfirmEdit}
          onCancel={() => setShowEditConfirm(false)}
        />
      )}
    </>
  );
}
