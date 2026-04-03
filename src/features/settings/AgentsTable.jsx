import { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '../../store/useAppStore';
import { Icon } from '../../components/Icon/Icon';
import { Button } from '../../components/Button/Button';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { SearchIconButton } from '../../components/SearchIconButton/SearchIconButton';
import { TableSkeleton } from '../../components/Skeleton/TableSkeleton';
import { Pagination } from '../../components/Pagination/Pagination';
import { ConfirmDialog } from '../../components/Modal/ConfirmDialog';
import { supabase } from '../../lib/supabase';
import { PracticeConfigPanel } from './panels/PracticeConfigPanel';
import { FeatureTogglesPanel } from './panels/FeatureTogglesPanel';
import { EscalationPolicyPanel } from './panels/EscalationPolicyPanel';
import { KnowledgeBasePanel } from './panels/KnowledgeBasePanel';
import { GoalsPanel } from './panels/GoalsPanel';
import { AuditLogDrawer } from './panels/AuditLogDrawer';
import styles from './AgentsTable.module.css';

const TABS = ['Agents', 'Goals', 'Knowledge Base', 'Tools', 'Compliance Policies', 'Test Cases', 'Analytics'];

function VoiceBadge({ voice }) {
  if (!voice) return <span style={{ color: 'var(--neutral-300)' }}>—</span>;
  const colors = { Erica: '#E74C8B', Ricardo: '#7C5CFC', Jia: '#F59E0B' };
  const name = voice.name || 'Erica';
  const color = colors[name] || '#7C5CFC';
  return (
    <div className={styles.voiceBadge}>
      <span className={styles.voiceDot} style={{ background: color }} />
      <span>{name}</span>
      <span className={styles.voiceMeta}>
        {voice.gender && <> &bull; {voice.gender}</>}
        {voice.language && <> &bull; {voice.language}</>}
      </span>
    </div>
  );
}

// StatusToggle now uses the shared Switch component
import { Switch } from '../../components/Switch/Switch';

/* ── 3-dot action dropdown ── */
function AgentActionMenu({ agent, onClose, onRequestDelete, onAuditLog }) {
  const openBuilder = useAppStore(s => s.openBuilder);
  const fetchAgents = useAppStore(s => s.fetchAgents);
  const showToast = useAppStore(s => s.showToast);

  const handleDuplicate = async () => {
    const dup = {
      id: 'a' + Date.now(),
      name: agent.name + ' (Copy)',
      use_case: agent.use_case,
      version: '1.0',
      voice: agent.voice,
      last_updated: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      last_updated_by: 'Current User',
      enabled: false,
    };
    await supabase.from('agents').insert(dup);
    await fetchAgents();
    showToast(`"${agent.name}" duplicated`);
    onClose();
  };

  return (
    <div className={styles.dropdown} onClick={e => e.stopPropagation()}>
      <button className={styles.dropdownItem} onClick={() => { openBuilder({ id: agent.id, name: agent.name }); onClose(); }}>
        <Icon name="solar:pen-new-square-linear" size={16} color="var(--neutral-300)" />
        Edit Agent
      </button>
      <button className={styles.dropdownItem} onClick={handleDuplicate}>
        <Icon name="solar:copy-linear" size={16} color="var(--neutral-300)" />
        Duplicate
      </button>
      <button className={styles.dropdownItem} onClick={() => { onAuditLog(); onClose(); }}>
        <Icon name="solar:history-linear" size={16} color="var(--neutral-300)" />
        Audit Log
      </button>
      <div className={styles.dropdownDivider} />
      <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={() => { onClose(); onRequestDelete(); }}>
        <Icon name="solar:trash-bin-minimalistic-linear" size={16} color="var(--status-error)" />
        Delete Agent
      </button>
    </div>
  );
}

function AgentRow({ agent }) {
  const updateAgent = useAppStore(s => s.updateAgent);
  const openBuilder = useAppStore(s => s.openBuilder);
  const fetchAgents = useAppStore(s => s.fetchAgents);
  const showToast = useAppStore(s => s.showToast);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [auditDrawerEntity, setAuditDrawerEntity] = useState(null);
  const moreBtnRef = useRef(null);

  const handleMoreClick = (e) => {
    e.stopPropagation();
    const btn = moreBtnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const menuH = 160;
      setMenuPos({
        top: spaceBelow < menuH ? Math.max(8, rect.top - menuH) : rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setShowMenu(v => !v);
  };

  // Close on outside click (use click instead of mousedown so menu button handlers fire first)
  useEffect(() => {
    if (!showMenu) return;
    const close = (e) => {
      if (moreBtnRef.current && !moreBtnRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showMenu]);

  return (
    <tr>
      <td className={styles.nameCell}>{agent.name}</td>
      <td>{agent.use_case}</td>
      <td className={styles.versionCell}>v{agent.version}</td>
      <td><VoiceBadge voice={agent.voice} /></td>
      <td className={styles.dateCell}>{agent.last_updated}</td>
      <td>{agent.last_updated_by}</td>
      <td>
        <Switch checked={agent.enabled} onChange={() => updateAgent(agent.id, { enabled: !agent.enabled })} />
      </td>
      <td>
        <div className={styles.actions}>
          <ActionButton icon="solar:pen-new-square-linear" size="L" tooltip="Edit" onClick={() => openBuilder({ id: agent.id, name: agent.name })} />
          <span className={styles.actionDivider} />
          <ActionButton icon="solar:chart-2-linear" size="L" tooltip="Analytics" />
          <span className={styles.actionDivider} />
          <ActionButton icon="solar:menu-dots-bold" size="L" tooltip="More" ref={moreBtnRef} onClick={handleMoreClick} />
        </div>
        {showMenu && createPortal(
          <div style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 9999 }}>
            <AgentActionMenu
              agent={agent}
              onClose={() => setShowMenu(false)}
              onRequestDelete={() => setShowDeleteConfirm(true)}
              onAuditLog={() => setAuditDrawerEntity({ type: 'Agent', name: agent.name, id: agent.id })}
            />
          </div>,
          document.body
        )}
        {showDeleteConfirm && (
          <ConfirmDialog
            icon="solar:danger-triangle-linear"
            iconColor="var(--status-error)"
            title={`Delete ${agent.name}`}
            description={`Are you sure you want to delete this agent? All associated workflows, conversation flows, and analytics data will be permanently removed. This action cannot be undone.`}
            confirmLabel="Delete Agent"
            cancelLabel="Cancel"
            variant="error"
            loading={deleting}
            onCancel={() => setShowDeleteConfirm(false)}
            onConfirm={async () => {
              setDeleting(true);
              await supabase.from('agents').delete().eq('id', agent.id);
              await fetchAgents();
              showToast(`"${agent.name}" deleted`);
              setDeleting(false);
              setShowDeleteConfirm(false);
            }}
          />
        )}
        {auditDrawerEntity && <AuditLogDrawer entity={auditDrawerEntity} onClose={() => setAuditDrawerEntity(null)} />}
      </td>
    </tr>
  );
}

export function AgentsTable() {
  const agents = useAppStore(s => s.agents);
  const agentsLoading = useAppStore(s => s.agentsLoading);
  const fetchAgents = useAppStore(s => s.fetchAgents);
  const settingsTab = useAppStore(s => s.settingsTab);
  const setSettingsTab = useAppStore(s => s.setSettingsTab);
  const setShowCreateAgent = useAppStore(s => s.setShowCreateAgent);
  const setGoalWizard = useAppStore(s => s.setGoalWizard);
  const fetchGoals = useAppStore(s => s.fetchGoals);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [goalsFilter, setGoalsFilter] = useState('all');
  const [goalsViewMode, setGoalsViewMode] = useState('table');
  const [goalsFilterOpen, setGoalsFilterOpen] = useState(false);

  useEffect(() => { fetchAgents(); }, [fetchAgents]);
  useEffect(() => { if (settingsTab === 'goals') fetchGoals(); }, [settingsTab, fetchGoals]);

  const currentPage = useAppStore(s => s.currentPage);
  const perPage = useAppStore(s => s.perPage);

  const filteredAgents = useMemo(() => {
    if (!searchVal.trim()) return agents;
    const q = searchVal.toLowerCase().trim();
    return agents.filter(a =>
      a.name?.toLowerCase().includes(q) ||
      a.use_case?.toLowerCase().includes(q) ||
      a.last_updated_by?.toLowerCase().includes(q)
    );
  }, [agents, searchVal]);

  const startIdx = (currentPage - 1) * perPage;
  const paginatedAgents = filteredAgents.slice(startIdx, startIdx + perPage);

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabBar}>
        <div className={styles.tabs}>
          {TABS.map(tab => (
            <div
              key={tab}
              className={[styles.tab, (tab.toLowerCase() === settingsTab || (tab === 'Agents' && settingsTab === 'agents')) ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setSettingsTab(tab.toLowerCase())}
            >
              {tab}
            </div>
          ))}
        </div>
        <div className={styles.tabActions}>
          <div className={styles.searchWrap}>
            {searchOpen ? (
              <div className={styles.searchInput}>
                <Icon name="solar:magnifer-linear" size={15} color="var(--neutral-300)" />
                <input autoFocus type="text" placeholder={settingsTab === 'goals' ? 'Search goals…' : settingsTab === 'knowledge base' ? 'Search FAQs…' : 'Search agents…'} value={searchVal} onChange={e => setSearchVal(e.target.value)} />
                <button className={styles.searchClose} onClick={() => { setSearchOpen(false); setSearchVal(''); }}>✕</button>
              </div>
            ) : (
              <SearchIconButton title="Search" onClick={() => setSearchOpen(true)} />
            )}
          </div>
          {settingsTab === 'goals' && (
            <ActionButton icon="solar:filter-linear" size="L" tooltip="Filter" onClick={() => setGoalsFilterOpen(v => !v)}
              style={goalsFilterOpen ? { background: 'var(--primary-50)' } : {}} />
          )}
          <span className={styles.tabDivider} />
          <Button variant="secondary" size="L" leadingIcon="solar:add-circle-linear" onClick={() => {
            if (settingsTab === 'goals') {
              setGoalWizard(true, null);
            } else if (settingsTab === 'knowledge base') {
              useAppStore.getState().setKbAddTrigger(true);
            } else {
              setShowCreateAgent(true);
            }
          }}>
            {settingsTab === 'goals' ? 'New Goal' : settingsTab === 'knowledge base' ? 'Add FAQ' : 'Create New'}
          </Button>
        </div>
      </div>

      {/* Goals filter bar (toggled by filter button, like worklist FilterBar) */}
      {settingsTab === 'goals' && goalsFilterOpen && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: '0.5px solid var(--neutral-150)', flexShrink: 0 }}>
          {['all', 'active', 'draft', 'TCM', 'Outreach'].map(f => (
            <button
              key={f}
              onClick={() => setGoalsFilter(f)}
              style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', border: '0.5px solid', fontFamily: "'Inter', sans-serif",
                transition: 'all .15s', userSelect: 'none',
                borderColor: goalsFilter === f ? 'var(--primary-200)' : 'var(--neutral-150)',
                background: goalsFilter === f ? 'var(--primary-50)' : '#fff',
                color: goalsFilter === f ? 'var(--primary-300)' : 'var(--neutral-300)',
              }}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 2, background: 'var(--neutral-50)', border: '0.5px solid var(--neutral-150)', borderRadius: 6, padding: 2 }}>
            <button
              onClick={() => setGoalsViewMode('grid')}
              title="Grid view"
              style={{
                width: 28, height: 26, borderRadius: 4, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: goalsViewMode === 'grid' ? '#fff' : 'transparent',
                boxShadow: goalsViewMode === 'grid' ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
                color: goalsViewMode === 'grid' ? 'var(--neutral-400)' : 'var(--neutral-200)',
              }}
            >
              <Icon name="solar:widget-linear" size={14} />
            </button>
            <button
              onClick={() => setGoalsViewMode('table')}
              title="Table view"
              style={{
                width: 28, height: 26, borderRadius: 4, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: goalsViewMode === 'table' ? '#fff' : 'transparent',
                boxShadow: goalsViewMode === 'table' ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
                color: goalsViewMode === 'table' ? 'var(--neutral-400)' : 'var(--neutral-200)',
              }}
            >
              <Icon name="solar:list-linear" size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Tab-specific content */}
      {settingsTab === 'goals' ? (
        <div className={styles.tableWrap}><GoalsPanel searchQuery={searchVal} filter={goalsFilter} viewMode={goalsViewMode} /></div>
      ) : settingsTab === 'knowledge base' ? (
        <div className={styles.tableWrap}><KnowledgeBasePanel searchQuery={searchVal} /></div>
      ) : settingsTab === 'tools' ? (
        <div className={styles.tableWrap}><PracticeConfigPanel /></div>
      ) : settingsTab === 'compliance policies' ? (
        <div className={styles.tableWrap}><EscalationPolicyPanel /></div>
      ) : settingsTab === 'test cases' ? (
        <div className={styles.tableWrap}><FeatureTogglesPanel /></div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            {agentsLoading ? (
              <TableSkeleton rows={8} />
            ) : (
              <>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Agent Name</th><th>Use Case</th><th>Version</th><th>Voice</th>
                      <th>Last Updated</th><th>Last Updated By</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAgents.map(agent => (
                      <AgentRow key={agent.id} agent={agent} />
                    ))}
                  </tbody>
                </table>
                {filteredAgents.length === 0 && searchVal.trim() && (
                  <div className={styles.emptySearch}>
                    <Icon name="solar:magnifer-linear" size={40} color="var(--neutral-150)" />
                    <p className={styles.emptyTitle}>No results found</p>
                    <p className={styles.emptyDesc}>No agents match "<strong>{searchVal.trim()}</strong>". Try a different name or clear the search.</p>
                  </div>
                )}
                {filteredAgents.length === 0 && !searchVal.trim() && (
                  <div className={styles.emptySearch}>
                    <Icon name="solar:ghost-smile-linear" size={40} color="var(--neutral-150)" />
                    <p className={styles.emptyTitle}>No agents configured yet</p>
                  </div>
                )}
              </>
            )}
          </div>
          <Pagination totalItems={filteredAgents.length} />
        </>
      )}
    </div>
  );
}
