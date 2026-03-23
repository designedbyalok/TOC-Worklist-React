import { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '../../store/useAppStore';
import { Icon } from '../../components/Icon/Icon';
import { TableSkeleton } from '../../components/Skeleton/TableSkeleton';
import { Pagination } from '../../components/Pagination/Pagination';
import { ConfirmDialog } from '../../components/Modal/ConfirmDialog';
import { supabase } from '../../lib/supabase';
import styles from './AgentsTable.module.css';

const TABS = ['Agents', 'Goals', 'Knowledge Base', 'Tools', 'Compliance Policies', 'Test Cases', 'Analytics'];

function VoiceBadge({ voice }) {
  if (!voice) return <span style={{ color: '#6F7A90' }}>—</span>;
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

function StatusToggle({ enabled, onToggle }) {
  return (
    <button className={[styles.toggle, enabled ? styles.toggleOn : ''].filter(Boolean).join(' ')} onClick={onToggle}>
      <span className={styles.toggleThumb} />
    </button>
  );
}

/* ── 3-dot action dropdown ── */
function AgentActionMenu({ agent, onClose, onRequestDelete }) {
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
        <Icon name="solar:pen-new-square-linear" size={16} color="#6F7A90" />
        Edit Agent
      </button>
      <button className={styles.dropdownItem} onClick={handleDuplicate}>
        <Icon name="solar:copy-linear" size={16} color="#6F7A90" />
        Duplicate
      </button>
      <div className={styles.dropdownDivider} />
      <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={() => { onClose(); onRequestDelete(); }}>
        <Icon name="solar:trash-bin-minimalistic-linear" size={16} color="#D72825" />
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

  // Close on outside click
  useEffect(() => {
    if (!showMenu) return;
    const close = (e) => {
      if (moreBtnRef.current && !moreBtnRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
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
        <StatusToggle enabled={agent.enabled} onToggle={() => updateAgent(agent.id, { enabled: !agent.enabled })} />
      </td>
      <td>
        <div className={styles.actions}>
          <button className={styles.actionBtn} title="Edit" onClick={() => openBuilder({ id: agent.id, name: agent.name })}>
            <Icon name="solar:pen-new-square-linear" size={18} />
          </button>
          <button className={styles.actionBtn} title="Analytics">
            <Icon name="solar:chart-2-linear" size={18} />
          </button>
          <button className={styles.actionBtn} title="More" ref={moreBtnRef} onClick={handleMoreClick}>
            <Icon name="solar:menu-dots-bold" size={18} />
          </button>
        </div>
        {showMenu && createPortal(
          <div style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 9999 }}>
            <AgentActionMenu
              agent={agent}
              onClose={() => setShowMenu(false)}
              onRequestDelete={() => setShowDeleteConfirm(true)}
            />
          </div>,
          document.body
        )}
        {showDeleteConfirm && (
          <ConfirmDialog
            icon="solar:danger-triangle-linear"
            iconColor="#D72825"
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

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => { fetchAgents(); }, [fetchAgents]);

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
                <Icon name="solar:magnifer-linear" size={15} color="#6F7A90" />
                <input autoFocus type="text" placeholder="Search agents…" value={searchVal} onChange={e => setSearchVal(e.target.value)} />
                <button className={styles.searchClose} onClick={() => { setSearchOpen(false); setSearchVal(''); }}>✕</button>
              </div>
            ) : (
              <button className={styles.searchBtn} title="Search" onClick={() => setSearchOpen(true)}>
                <Icon name="solar:magnifer-linear" size={18} />
              </button>
            )}
          </div>
          <span className={styles.tabDivider} />
          <button className={styles.createBtn} onClick={() => setShowCreateAgent(true)}>
            <Icon name="solar:add-circle-linear" size={16} />
            Create New
          </button>
        </div>
      </div>

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
                <Icon name="solar:magnifer-linear" size={40} color="#D0D6E1" />
                <p className={styles.emptyTitle}>No results found</p>
                <p className={styles.emptyDesc}>No agents match "<strong>{searchVal.trim()}</strong>". Try a different name or clear the search.</p>
              </div>
            )}
            {filteredAgents.length === 0 && !searchVal.trim() && (
              <div className={styles.emptySearch}>
                <Icon name="solar:ghost-smile-linear" size={40} color="#D0D6E1" />
                <p className={styles.emptyTitle}>No agents configured yet</p>
              </div>
            )}
          </>
        )}
      </div>
      <Pagination totalItems={filteredAgents.length} />
    </div>
  );
}
