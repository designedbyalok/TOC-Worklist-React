import { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../../../components/Icon/Icon';
import { Badge } from '../../../components/Badge/Badge';
import { ActionButton } from '../../../components/ActionButton/ActionButton';
import { Switch } from '../../../components/Switch/Switch';
import { ConfirmDialog } from '../../../components/Modal/ConfirmDialog';
import { useAppStore } from '../../../store/useAppStore';
import { COMPONENTS, DOMAINS } from '../../../data/embeddedComponents';
import { AuditLogDrawer } from './AuditLogDrawer';

const PLACEMENT_LABELS = {
  'p360-tab': 'P360 tab',
  'side-drawer': 'Side-drawer',
  'widget-card': 'Widget card',
  'action-menu': 'Action menu',
  tab: 'Sidecar tab',
  widget: 'Sidecar widget',
  'profile-tab': 'Mobile tab',
  'list-action': 'Mobile action',
  'widget-card-mobile': 'Mobile widget',
  'home-card': 'Home card',
};

const SURFACE_LABELS = { web: 'Fold Web', sidecar: 'Sidecar', mobile: 'Mobile' };

const thStyle = {
  textAlign: 'left', padding: '8px 16px', color: '#6F7A90', fontWeight: 500,
  fontSize: 12, whiteSpace: 'nowrap', borderBottom: '1px solid #D0D6E1',
  background: 'var(--neutral-0)', position: 'sticky', top: 0,
};
const tdStyle = { padding: '12px 16px', fontSize: 14, fontWeight: 400, color: '#3D4A5C', verticalAlign: 'middle' };

/* ── 3-dot action dropdown ── */
function ComponentActionMenu({ comp, onClose, onEdit, onAuditLog, onDuplicate, onRequestDelete }) {
  return (
    <div style={{
      background: 'var(--neutral-0)', border: '0.5px solid var(--neutral-150)',
      borderRadius: 8, minWidth: 180, boxShadow: '0 12px 32px rgba(0,0,0,.15)',
      overflow: 'hidden',
    }} onClick={e => e.stopPropagation()}>
      <button style={menuItemStyle} onClick={() => { onEdit(comp.id); onClose(); }}>
        <Icon name="solar:pen-new-square-linear" size={16} color="var(--neutral-300)" />
        Edit Component
      </button>
      <button style={menuItemStyle} onClick={() => { onAuditLog(comp); onClose(); }}>
        <Icon name="solar:history-linear" size={16} color="var(--neutral-300)" />
        Audit Log
      </button>
      <button style={menuItemStyle} onClick={() => { onDuplicate(comp); onClose(); }}>
        <Icon name="solar:copy-linear" size={16} color="var(--neutral-300)" />
        Duplicate
      </button>
      <div style={{ height: 1, background: 'var(--neutral-100)', margin: '2px 0' }} />
      <button style={{ ...menuItemStyle, color: '#D72825' }} onClick={() => { onClose(); onRequestDelete(comp); }}
        onMouseOver={e => e.currentTarget.style.background = '#FEF2F2'}
        onMouseOut={e => e.currentTarget.style.background = ''}
      >
        <Icon name="solar:trash-bin-minimalistic-linear" size={16} color="var(--status-error)" />
        Delete
      </button>
    </div>
  );
}

const menuItemStyle = {
  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
  fontSize: 13, fontWeight: 400, color: 'var(--neutral-400)', cursor: 'pointer',
  border: 'none', background: 'none', width: '100%', textAlign: 'left',
  fontFamily: "'Inter', sans-serif", transition: 'background .1s',
};

function ComponentRow({ comp, onToggle, onEdit, onPreview, onAuditLog, onDuplicate, onRequestDelete }) {
  const isDomainRemoved = comp.domainRemoved;
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const moreBtnRef = useRef(null);

  const handleMoreClick = (e) => {
    e.stopPropagation();
    const btn = moreBtnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const menuH = 200;
      setMenuPos({
        top: spaceBelow < menuH ? Math.max(8, rect.top - menuH) : rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setShowMenu(v => !v);
  };

  useEffect(() => {
    if (!showMenu) return;
    const close = (e) => {
      if (moreBtnRef.current && !moreBtnRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showMenu]);

  return (
    <tr
      style={{
        borderBottom: '0.5px solid #EAECF0',
        transition: 'background .1s',
        ...(!comp.enabled ? { opacity: 0.55 } : {}),
      }}
      onMouseOver={e => e.currentTarget.style.background = 'var(--primary-25, #faf8ff)'}
      onMouseOut={e => e.currentTarget.style.background = ''}
    >
      {/* Component name */}
      <td style={{ ...tdStyle, fontWeight: 500, color: '#1A1F36' }}>
        <div>
          <div>{comp.name}</div>
          <div style={{ fontSize: 12, color: '#6F7A90', fontWeight: 400, marginTop: 1 }}>
            {comp.category || 'Uncategorized'}
          </div>
        </div>
      </td>

      {/* Domain */}
      <td style={tdStyle}>
        <code style={{
          background: 'var(--neutral-50)', padding: '2px 6px', borderRadius: 4,
          fontSize: 11, fontFamily: "'SF Mono', 'Fira Code', monospace",
          color: 'var(--neutral-400)',
        }}>
          {comp.domain}
        </code>
        {isDomainRemoved && (
          <div style={{ marginTop: 2 }}>
            <Badge variant="compliance-warn" label="Domain removed" />
          </div>
        )}
      </td>

      {/* Surfaces / placements */}
      <td style={tdStyle}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {comp.surfaces?.map(surface => {
            const placement = comp.placements?.[surface];
            const label = placement ? (PLACEMENT_LABELS[placement] || placement) : SURFACE_LABELS[surface];
            return <Badge key={surface} variant="ai-neutral" label={label} />;
          })}
        </div>
      </td>

      {/* Errors 24h */}
      <td style={tdStyle}>
        {comp.errors24h > 0 ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: comp.errors24h >= 3 ? 'var(--status-error)' : 'var(--status-warning)', fontSize: 14, fontWeight: 500 }}>
            <Icon name={comp.errors24h >= 3 ? 'solar:close-circle-bold' : 'solar:danger-triangle-linear'} size={14} color={comp.errors24h >= 3 ? 'var(--status-error)' : 'var(--status-warning)'} />
            {comp.errors24h}
          </span>
        ) : (
          <span style={{ color: '#6F7A90' }}>0</span>
        )}
      </td>

      {/* Enabled toggle */}
      <td style={tdStyle}>
        <Switch
          checked={comp.enabled}
          onChange={() => onToggle(comp.id)}
          disabled={isDomainRemoved || !comp.previewed}
        />
      </td>

      {/* Actions: Edit | Audit Log | More (3-dot) */}
      <td style={tdStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ActionButton icon="solar:pen-linear" size="L" tooltip="Edit" onClick={() => onEdit(comp.id)} />
          <span style={{ width: 1, height: 16, background: 'var(--neutral-150)', flexShrink: 0 }} />
          <ActionButton icon="solar:eye-linear" size="L" tooltip="Preview" onClick={() => onPreview(comp.id)} />
          <span style={{ width: 1, height: 16, background: 'var(--neutral-150)', flexShrink: 0 }} />
          <ActionButton icon="solar:menu-dots-bold" size="L" tooltip="More" ref={moreBtnRef} onClick={handleMoreClick} />
        </div>
        {showMenu && createPortal(
          <div style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 9999 }}>
            <ComponentActionMenu
              comp={comp}
              onClose={() => setShowMenu(false)}
              onEdit={onEdit}
              onAuditLog={onAuditLog}
              onDuplicate={onDuplicate}
              onRequestDelete={onRequestDelete}
            />
          </div>,
          document.body
        )}
      </td>
    </tr>
  );
}

export function ComponentLibraryPanel({ searchQuery = '' }) {
  const showToast = useAppStore(s => s.showToast);
  const setComponentWizard = useAppStore(s => s.setComponentWizard);

  const [components, setComponents] = useState(COMPONENTS);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [warningDismissed, setWarningDismissed] = useState(false);
  const [auditDrawerEntity, setAuditDrawerEntity] = useState(null);

  const domains = DOMAINS;
  const removedDomains = domains.filter(d => d.status === 'removed');
  const affectedComponents = components.filter(c => c.domainRemoved);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return components;
    const q = searchQuery.toLowerCase().trim();
    return components.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.domain?.toLowerCase().includes(q)
    );
  }, [components, searchQuery]);

  const handleToggle = (id) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
    const comp = components.find(c => c.id === id);
    showToast(comp?.enabled ? `"${comp.name}" disabled` : `"${comp?.name}" enabled`);
  };

  const handleDuplicate = (comp) => {
    const dup = {
      ...comp,
      id: Date.now(),
      name: comp.name + ' (Copy)',
      enabled: false,
    };
    setComponents(prev => [...prev, dup]);
    showToast(`"${comp.name}" duplicated`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await new Promise(r => setTimeout(r, 400));
    setComponents(prev => prev.filter(c => c.id !== deleteTarget.id));
    showToast(`"${deleteTarget.name}" deleted`);
    setDeleting(false);
    setDeleteTarget(null);
  };

  const enabledCount = components.filter(c => c.enabled).length;
  const disabledCount = components.filter(c => !c.enabled).length;

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      {/* Domain removed banner */}
      {affectedComponents.length > 0 && !warningDismissed && (
        <div style={{
          background: 'var(--status-warning-light)', borderBottom: '0.5px solid rgba(217,165,11,.2)',
          padding: '10px 16px', display: 'flex', gap: 10, alignItems: 'center',
          fontSize: 12, lineHeight: 1.6, color: '#92400E',
        }}>
          <Icon name="solar:danger-triangle-bold" size={16} color="var(--status-warning)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong>{removedDomains.length} domain{removedDomains.length !== 1 ? 's were' : ' was'} removed.</strong>{' '}
            {affectedComponents.length} component{affectedComponents.length !== 1 ? 's have' : ' has'} been disabled.{' '}
            <a style={{ color: '#B45309', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}
              onClick={() => showToast('Navigate to Domain Registry to re-register')}>
              Re-register domain
            </a>
          </div>
          <button onClick={() => setWarningDismissed(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            flexShrink: 0, lineHeight: 1,
          }}>
            <Icon name="solar:close-circle-linear" size={16} color="#D9A50B" />
          </button>
        </div>
      )}

      {/* Table — edge-to-edge */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Inter', sans-serif" }}>
        <thead>
          <tr>
            <th style={thStyle}>Component</th>
            <th style={thStyle}>Domain</th>
            <th style={thStyle}>Surfaces</th>
            <th style={thStyle}>Errors</th>
            <th style={thStyle}>Enabled</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#6F7A90' }}>
                <Icon name={searchQuery.trim() ? 'solar:magnifer-linear' : 'solar:widget-5-linear'} size={32} color="var(--neutral-150)" />
                <div style={{ fontSize: 16, fontWeight: 500, color: '#3D4A5C', marginTop: 8 }}>
                  {searchQuery.trim() ? 'No results found' : 'No components configured yet'}
                </div>
                <div style={{ fontSize: 14, marginTop: 4 }}>
                  {searchQuery.trim()
                    ? <>No components match "<strong>{searchQuery.trim()}</strong>".</>
                    : 'Register a domain first, then create your first embedded component.'}
                </div>
              </td>
            </tr>
          )}
          {filtered.map(comp => (
            <ComponentRow
              key={comp.id}
              comp={comp}
              onToggle={handleToggle}
              onEdit={(id) => setComponentWizard(true, id)}
              onPreview={(id) => { showToast('Preview mode — coming soon'); }}
              onAuditLog={(c) => setAuditDrawerEntity({ type: 'Component', name: c.name, domain: c.domain, id: c.id })}
              onDuplicate={handleDuplicate}
              onRequestDelete={setDeleteTarget}
            />
          ))}
        </tbody>
      </table>

      {/* Footer count */}
      <div style={{ fontSize: 12, color: '#6F7A90', padding: '12px 16px' }}>
        {components.length} component{components.length !== 1 ? 's' : ''} &middot; {enabledCount} enabled &middot; {disabledCount} disabled
      </div>

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDialog
          icon="solar:danger-triangle-linear"
          iconColor="var(--status-error)"
          title={`Delete "${deleteTarget.name}"?`}
          description="This will permanently remove the component configuration. Providers will no longer see this component. This action cannot be undone."
          confirmLabel="Delete Component"
          variant="error"
          loading={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {auditDrawerEntity && (
        <AuditLogDrawer entity={auditDrawerEntity} onClose={() => setAuditDrawerEntity(null)} />
      )}
    </div>
  );
}
