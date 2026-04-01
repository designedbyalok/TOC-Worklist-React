import { useMemo, useState } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { Badge } from '../../../components/Badge/Badge';
import { Button } from '../../../components/Button/Button';
import { ActionButton } from '../../../components/ActionButton/ActionButton';
import { Switch } from '../../../components/Switch/Switch';
import { ConfirmDialog } from '../../../components/Modal/ConfirmDialog';
import { useAppStore } from '../../../store/useAppStore';
import { COMPONENTS, DOMAINS } from '../../../data/embeddedComponents';
import s from './EmbeddedComponents.module.css';

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

function ComponentCard({ comp, onEdit, onPreview, onToggle, onDelete }) {
  const isError = comp.errors24h >= 3;
  const isDomainRemoved = comp.domainRemoved;
  const statusColor = comp.enabled && !isDomainRemoved ? '#22C55E' : isError ? '#EF4444' : '#9CA3AF';

  return (
    <div className={s.compCard}>
      {/* Header */}
      <div className={s.compCardHeader}>
        <div className={s.compCardIcon}>{comp.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className={s.compCardName}>
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: statusColor, marginRight: 6, flexShrink: 0 }} />
            {comp.name}
          </div>
          <div className={s.compCardDomain}>
            <code className={s.domainCode}>{comp.domain}</code>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ActionButton icon="solar:pen-linear" size="L" tooltip="Edit" onClick={() => onEdit(comp.id)} />
          <span className={s.actionDivider} />
          <ActionButton icon="solar:trash-bin-minimalistic-linear" size="L" tooltip="Delete" onClick={() => onDelete(comp)} />
        </div>
      </div>

      {/* Description */}
      <div className={s.compCardDesc}>{comp.description || 'No description'}</div>

      {/* Badges row */}
      <div className={s.compCardBadges}>
        {comp.surfaces?.map(surface => {
          const placement = comp.placements?.[surface];
          const label = placement ? (PLACEMENT_LABELS[placement] || placement) : SURFACE_LABELS[surface];
          return <Badge key={surface} variant="ai-neutral" label={label} />;
        })}
        {isDomainRemoved && <Badge variant="compliance-warn" label="Domain removed" icon="solar:danger-triangle-bold" />}
        {isError && <Badge variant="status-failed" label={`${comp.errors24h} errors`} icon="solar:close-circle-bold" />}
        {!comp.previewed && <Badge variant="compliance-warn" label="Preview required" />}
      </div>

      {/* Footer */}
      <div className={s.compCardFooter}>
        <div className={s.compCardMeta}>
          {comp.errors24h > 0 && !isError && (
            <span className={s.compCardMetaItem}>
              <Icon name="solar:danger-triangle-linear" size={12} color="var(--status-warning)" />
              {comp.errors24h} error{comp.errors24h !== 1 ? 's' : ''} (24h)
            </span>
          )}
          {comp.lastLoaded && (
            <span className={s.compCardMetaItem}>
              <Icon name="solar:clock-circle-linear" size={12} color="var(--neutral-200)" />
              {comp.lastLoaded}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button variant="secondary" size="S" leadingIcon="solar:eye-linear" onClick={() => onPreview(comp.id)}>
            Preview
          </Button>
          <Switch
            checked={comp.enabled}
            onChange={() => onToggle(comp.id)}
            disabled={isDomainRemoved || !comp.previewed}
          />
        </div>
      </div>
    </div>
  );
}

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

  return (
    <div style={{ padding: 0, flex: 1, overflow: 'auto' }}>
      {/* Domain removed banner */}
      {affectedComponents.length > 0 && (
        <div className={s.warningBanner}>
          <Icon name="solar:danger-triangle-bold" size={16} color="var(--status-warning)" />
          <div>
            <strong>{removedDomains.length} domain{removedDomains.length !== 1 ? 's were' : ' was'} removed.</strong>{' '}
            {affectedComponents.length} component{affectedComponents.length !== 1 ? 's have' : ' has'} been disabled.{' '}
            <a className={s.warningLink} onClick={() => showToast('Navigate to Domain Registry to re-register')}>
              Re-register domain
            </a>
          </div>
        </div>
      )}

      {/* Card grid */}
      <div className={s.compGrid}>
        {filtered.map(comp => (
          <ComponentCard
            key={comp.id}
            comp={comp}
            onEdit={(id) => setComponentWizard(true, id)}
            onPreview={(id) => { setComponentPreviewId(id); showToast('Preview mode — coming soon'); }}
            onToggle={handleToggle}
            onDelete={setDeleteTarget}
          />
        ))}
      </div>

      {/* Empty states */}
      {filtered.length === 0 && searchQuery.trim() && (
        <div className={s.emptyState}>
          <Icon name="solar:magnifer-linear" size={40} color="var(--neutral-150)" />
          <p className={s.emptyTitle}>No results found</p>
          <p className={s.emptyDesc}>No components match "<strong>{searchQuery.trim()}</strong>".</p>
        </div>
      )}
      {filtered.length === 0 && !searchQuery.trim() && (
        <div className={s.emptyState}>
          <Icon name="solar:widget-5-linear" size={40} color="var(--neutral-150)" />
          <p className={s.emptyTitle}>No components configured yet</p>
          <p className={s.emptyDesc}>Register a domain first, then create your first embedded component.</p>
        </div>
      )}

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
