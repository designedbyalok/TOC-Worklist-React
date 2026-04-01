import { useMemo, useState } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { Badge } from '../../../components/Badge/Badge';
import { Button } from '../../../components/Button/Button';
import { ActionButton } from '../../../components/ActionButton/ActionButton';
import { Switch } from '../../../components/Switch/Switch';
import { ConfirmDialog } from '../../../components/Modal/ConfirmDialog';
import { useAppStore } from '../../../store/useAppStore';
import { COMPONENTS, DOMAINS } from '../../../data/embeddedComponents';

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
  textAlign: 'left', padding: '8px 16px', color: 'var(--neutral-300)', fontWeight: 500,
  fontSize: 12, whiteSpace: 'nowrap', borderBottom: '1px solid var(--neutral-150)',
  background: 'var(--neutral-0)', position: 'sticky', top: 0,
};
const tdStyle = { padding: '10px 16px', fontSize: 13, color: 'var(--neutral-400)', verticalAlign: 'middle' };

export function ComponentLibraryPanel({ searchQuery = '' }) {
  const showToast = useAppStore(s => s.showToast);
  const setComponentWizard = useAppStore(s => s.setComponentWizard);
  const setComponentPreviewId = useAppStore(s => s.setComponentPreviewId);

  const [components, setComponents] = useState(COMPONENTS);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
    <div style={{ padding: 0, flex: 1, overflow: 'auto' }}>
      {/* Domain removed banner */}
      {affectedComponents.length > 0 && (
        <div style={{
          background: 'var(--status-warning-light)', border: '0.5px solid rgba(217,165,11,.2)',
          padding: '10px 22px', display: 'flex', gap: 10, alignItems: 'flex-start',
          fontSize: 12, lineHeight: 1.6, color: '#92400E',
          borderBottom: '0.5px solid rgba(217,165,11,.2)',
        }}>
          <Icon name="solar:danger-triangle-bold" size={16} color="var(--status-warning)" />
          <div>
            <strong>{removedDomains.length} domain{removedDomains.length !== 1 ? 's were' : ' was'} removed.</strong>{' '}
            {affectedComponents.length} component{affectedComponents.length !== 1 ? 's have' : ' has'} been disabled.{' '}
            <a style={{ color: '#B45309', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}
              onClick={() => showToast('Navigate to Domain Registry to re-register')}>
              Re-register domain
            </a>
          </div>
        </div>
      )}

      {/* Table card */}
      <div style={{
        border: '0.5px solid var(--neutral-100)', borderRadius: 10,
        overflow: 'hidden', background: '#fff', margin: 16, marginTop: affectedComponents.length > 0 ? 16 : 0,
      }}>
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
                <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'var(--neutral-200)' }}>
                  <Icon name={searchQuery.trim() ? 'solar:magnifer-linear' : 'solar:widget-5-linear'} size={32} color="var(--neutral-150)" />
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--neutral-300)', marginTop: 8 }}>
                    {searchQuery.trim() ? 'No results found' : 'No components configured yet'}
                  </div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>
                    {searchQuery.trim()
                      ? <>No components match "<strong>{searchQuery.trim()}</strong>".</>
                      : 'Register a domain first, then create your first embedded component.'}
                  </div>
                </td>
              </tr>
            )}
            {filtered.map(comp => {
              const isError = comp.errors24h >= 3;
              const isDomainRemoved = comp.domainRemoved;
              const statusColor = comp.enabled && !isDomainRemoved ? '#22C55E' : isError ? '#EF4444' : '#9CA3AF';

              return (
                <tr
                  key={comp.id}
                  style={{
                    borderBottom: '1px solid #EAECF0',
                    transition: 'background .1s',
                    ...(!comp.enabled ? { opacity: 0.55 } : {}),
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--primary-25, #faf8ff)'}
                  onMouseOut={e => e.currentTarget.style.background = ''}
                >
                  {/* Component name + icon + category badge */}
                  <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--neutral-500)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 32, height: 32, borderRadius: 8, background: 'var(--primary-50)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, flexShrink: 0,
                      }}>
                        {comp.icon}
                      </span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
                          {comp.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--neutral-200)', fontWeight: 400, marginTop: 2 }}>
                          {comp.category || 'Uncategorized'}
                        </div>
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
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: isError ? 'var(--status-error)' : 'var(--status-warning)', fontSize: 13, fontWeight: 500 }}>
                        <Icon name={isError ? 'solar:close-circle-bold' : 'solar:danger-triangle-linear'} size={14} color={isError ? 'var(--status-error)' : 'var(--status-warning)'} />
                        {comp.errors24h}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--neutral-200)', fontSize: 13 }}>0</span>
                    )}
                  </td>

                  {/* Enabled toggle */}
                  <td style={tdStyle}>
                    <Switch
                      checked={comp.enabled}
                      onChange={() => handleToggle(comp.id)}
                      disabled={isDomainRemoved || !comp.previewed}
                    />
                  </td>

                  {/* Actions */}
                  <td style={tdStyle} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ActionButton icon="solar:pen-linear" size="L" tooltip="Edit" onClick={() => setComponentWizard(true, comp.id)} />
                      <span style={{ width: 1, height: 16, background: 'var(--neutral-150)', flexShrink: 0 }} />
                      <ActionButton icon="solar:eye-linear" size="L" tooltip="Preview" onClick={() => { setComponentPreviewId(comp.id); showToast('Preview mode — coming soon'); }} />
                      <span style={{ width: 1, height: 16, background: 'var(--neutral-150)', flexShrink: 0 }} />
                      <ActionButton icon="solar:trash-bin-minimalistic-linear" size="L" tooltip="Delete" onClick={() => setDeleteTarget(comp)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div style={{ fontSize: 12, color: 'var(--neutral-200)', padding: '0 20px 12px' }}>
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
    </div>
  );
}
