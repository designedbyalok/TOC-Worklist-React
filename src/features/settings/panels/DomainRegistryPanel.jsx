import { useState, useMemo, useEffect } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { Badge } from '../../../components/Badge/Badge';
import { Button } from '../../../components/Button/Button';
import { ActionButton } from '../../../components/ActionButton/ActionButton';
import { Switch } from '../../../components/Switch/Switch';
import { useAppStore } from '../../../store/useAppStore';
import { DOMAINS, DOMAIN_CATEGORIES, HIPAA_OPTIONS, COMPONENTS } from '../../../data/embeddedComponents';
import { AuditLogDrawer } from './AuditLogDrawer';

const thStyle = {
  textAlign: 'left', padding: '8px 16px', color: '#6F7A90', fontWeight: 500,
  fontSize: 12, whiteSpace: 'nowrap', borderBottom: '1px solid #D0D6E1',
  background: 'var(--neutral-0)', position: 'sticky', top: 0,
};
const tdStyle = { padding: '12px 16px', fontSize: 14, fontWeight: 400, color: '#3D4A5C', verticalAlign: 'middle' };

const inputStyle = { padding: '8px 12px', border: '0.5px solid var(--neutral-150)', borderRadius: 8, fontSize: 13, fontFamily: "'Inter', sans-serif", width: '100%', outline: 'none', background: '#fff', color: 'var(--neutral-500)' };
const labelStyle = { fontSize: 12, fontWeight: 500, color: 'var(--neutral-300)', marginBottom: 4 };
const selectStyle = {
  ...inputStyle, appearance: 'none', cursor: 'pointer', paddingRight: 34,
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238a94a8' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
};

const CATEGORY_BADGE_MAP = {
  'Internal': 'ai-care',
  'Prior authorization': 'ai-care',
  'Analytics': 'compliance-warn',
  'Care gaps / HEDIS': 'toc-engaged',
};

const HIPAA_BADGE_MAP = {
  'Verified': 'status-completed',
  'BAA in place': 'status-completed',
  'Pending BAA': 'compliance-warn',
  'Verify externally': 'ai-neutral',
};

function StatusDot({ color }) {
  return (
    <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: color, marginRight: 4 }} />
  );
}

function getComponentsForDomain(domainId) {
  return COMPONENTS.filter(c => c.domainId === domainId);
}

function getComponentStats(domainId) {
  const comps = getComponentsForDomain(domainId);
  const active = comps.filter(c => c.enabled).length;
  const disabled = comps.filter(c => !c.enabled).length;
  return { active, disabled, total: comps.length };
}

function getDomainStatus(domain) {
  if (domain.status === 'removed') return { label: 'Removed', color: '#EF4444' };
  if (domain.activeComponents === 0) return { label: 'Unused', color: '#F59E0B' };
  return { label: 'Active', color: '#22C55E' };
}

/* ── Overlay backdrop + centered card ── */
function ModalOverlay({ children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 24,
        maxWidth: 520, width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,.18)',
        fontFamily: "'Inter', sans-serif",
      }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* ── Add Domain Modal ── */
function AddDomainModal({ onClose, onSave }) {
  const [form, setForm] = useState({ vendor: '', domain: '', category: DOMAIN_CATEGORIES[0], hipaa: HIPAA_OPTIONS[0] });

  const domainHint = useMemo(() => {
    const d = form.domain;
    if (d.includes('http')) return { text: 'Remove https:// \u2014 root domain only', color: '#EF4444' };
    if (d.includes('/')) return { text: 'No paths \u2014 root domain only', color: '#EF4444' };
    return { text: 'Root domain only \u2014 no https://, no paths', color: 'var(--neutral-200)' };
  }, [form.domain]);

  const canSave = form.vendor.trim() && form.domain.trim() && !form.domain.includes('http') && !form.domain.includes('/');

  return (
    <ModalOverlay>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--neutral-500)', marginBottom: 20 }}>
        Register new domain
      </div>

      {/* 2x2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={labelStyle}>Vendor / label</div>
          <input
            style={inputStyle}
            placeholder="e.g. Availity"
            value={form.vendor}
            onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
            autoFocus
          />
        </div>
        <div>
          <div style={labelStyle}>Domain</div>
          <input
            style={inputStyle}
            placeholder="e.g. portal.availity.com"
            value={form.domain}
            onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
          />
          <div style={{ fontSize: 11, color: domainHint.color, marginTop: 4 }}>{domainHint.text}</div>
        </div>
        <div>
          <div style={labelStyle}>Category</div>
          <select style={selectStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {DOMAIN_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <div style={labelStyle}>HIPAA compliance</div>
          <select style={selectStyle} value={form.hipaa} onChange={e => setForm(f => ({ ...f, hipaa: e.target.value }))}>
            {HIPAA_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      </div>

      {/* Warning */}
      <div style={{
        display: 'flex', gap: 8, padding: '10px 12px', borderRadius: 8,
        background: '#FFFBEB', border: '0.5px solid #FDE68A', marginBottom: 20,
      }}>
        <Icon name="solar:shield-warning-linear" size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>
          Patient context including patientId will be shared with iFrames on this domain. Only register domains from HIPAA-compliant vendors.
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button variant="secondary" size="S" onClick={onClose}>Cancel</Button>
        <Button variant="primary" size="S" disabled={!canSave} onClick={() => canSave && onSave(form)}>
          Register domain
        </Button>
      </div>
    </ModalOverlay>
  );
}

/* ── Edit Domain Modal ── */
function EditDomainModal({ domain, onClose, onSave }) {
  const [form, setForm] = useState({
    vendor: domain.vendor,
    category: domain.category,
    hipaa: domain.hipaa,
  });

  const canSave = form.vendor.trim();

  return (
    <ModalOverlay>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--neutral-500)', marginBottom: 20 }}>
        Edit domain &mdash; {domain.domain}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={labelStyle}>Vendor / label</div>
          <input
            style={inputStyle}
            value={form.vendor}
            onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
            autoFocus
          />
        </div>
        <div>
          <div style={labelStyle}>Domain</div>
          <div style={{
            padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'var(--neutral-300)',
            background: 'var(--neutral-50)', border: '0.5px solid var(--neutral-100)',
            fontFamily: "'Inter', sans-serif",
          }}>
            {domain.domain}
          </div>
        </div>
        <div>
          <div style={labelStyle}>Category</div>
          <select style={selectStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {DOMAIN_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <div style={labelStyle}>HIPAA compliance</div>
          <select style={selectStyle} value={form.hipaa} onChange={e => setForm(f => ({ ...f, hipaa: e.target.value }))}>
            {HIPAA_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      </div>

      {/* Info */}
      <div style={{
        display: 'flex', gap: 8, padding: '10px 12px', borderRadius: 8,
        background: '#FFFBEB', border: '0.5px solid #FDE68A', marginBottom: 20,
      }}>
        <Icon name="solar:info-circle-linear" size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>
          Domain URL cannot be changed after registration. Delete and re-add to change the domain.
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button variant="secondary" size="S" onClick={onClose}>Cancel</Button>
        <Button variant="primary" size="S" disabled={!canSave} onClick={() => canSave && onSave(form)}>
          Save changes
        </Button>
      </div>
    </ModalOverlay>
  );
}

/* ── Delete Domain Modal ── */
function DeleteDomainModal({ domain, onClose, onConfirm, deleting }) {
  const affectedComponents = COMPONENTS.filter(c => c.domainId === domain.id && c.enabled);
  const hasActive = affectedComponents.length > 0;

  return (
    <ModalOverlay>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--neutral-500)', marginBottom: 20 }}>
        Remove domain
      </div>

      {!hasActive ? (
        /* Safe to remove */
        <div style={{
          display: 'flex', gap: 8, padding: '10px 12px', borderRadius: 8,
          background: '#F0FDF4', border: '0.5px solid #BBF7D0', marginBottom: 16,
        }}>
          <Icon name="solar:check-circle-linear" size={16} color="#22C55E" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 13, color: '#166534', lineHeight: 1.5 }}>
            No active components use this domain. Safe to remove.
          </div>
        </div>
      ) : (
        <>
          {/* Warning banner */}
          <div style={{
            display: 'flex', gap: 8, padding: '10px 12px', borderRadius: 8,
            background: '#FFFBEB', border: '0.5px solid #FDE68A', marginBottom: 12,
          }}>
            <Icon name="solar:danger-triangle-linear" size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 13, color: '#92400E', lineHeight: 1.5 }}>
              {affectedComponents.length} active component{affectedComponents.length > 1 ? 's' : ''} use this domain. Removing <strong>{domain.domain}</strong> will auto-disable the {affectedComponents.map(c => c.name).join(', ')}. Providers will see an error banner until the domain is re-registered.
            </div>
          </div>

          {/* Affected components list */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {affectedComponents.map(c => (
              <Badge key={c.id} variant="status-failed" label={c.name} />
            ))}
          </div>

          {/* Amber info */}
          <div style={{
            display: 'flex', gap: 8, padding: '10px 12px', borderRadius: 8,
            background: '#FFFBEB', border: '0.5px solid #FDE68A', marginBottom: 16,
          }}>
            <Icon name="solar:info-circle-linear" size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>
              Consider disabling components manually before removing a domain to avoid an unexpected outage for providers.
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button variant="secondary" size="S" onClick={onClose} disabled={deleting}>Cancel</Button>
        <Button variant="danger" size="S" onClick={onConfirm} disabled={deleting}>
          {deleting ? 'Removing\u2026' : hasActive ? 'Remove anyway' : 'Remove domain'}
        </Button>
      </div>
    </ModalOverlay>
  );
}

/* ── Main Panel ── */
export function DomainRegistryPanel({ searchQuery = '' }) {
  const showToast = useAppStore(s => s.showToast);

  const [domains, setDomains] = useState(() =>
    DOMAINS.map(d => ({ ...d, enabled: d.status !== 'removed' }))
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDomain, setDeletingDomain] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [infoDismissed, setInfoDismissed] = useState(false);
  const [auditDrawerEntity, setAuditDrawerEntity] = useState(null);

  // Listen for "add new" trigger from parent (EmbeddedComponentsSettings)
  const domainAddTrigger = useAppStore(s => s.domainAddTrigger);
  const setDomainAddTrigger = useAppStore(s => s.setDomainAddTrigger);
  useEffect(() => {
    if (domainAddTrigger) {
      setShowAddModal(true);
      setDomainAddTrigger(false);
    }
  }, [domainAddTrigger, setDomainAddTrigger]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return domains;
    const q = searchQuery.toLowerCase();
    return domains.filter(d =>
      d.vendor.toLowerCase().includes(q) ||
      d.domain.toLowerCase().includes(q)
    );
  }, [domains, searchQuery]);

  const enabledDomains = domains.filter(d => d.enabled !== false);
  const disabledDomains = domains.filter(d => d.enabled === false);

  const handleAdd = (form) => {
    const newDomain = {
      id: Math.max(...domains.map(d => d.id)) + 1,
      vendor: form.vendor,
      domain: form.domain,
      category: form.category,
      hipaa: form.hipaa,
      activeComponents: 0,
      addedDate: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      status: 'active',
      enabled: true,
    };
    setDomains(prev => [...prev, newDomain]);
    setShowAddModal(false);
    showToast(`Domain "${form.domain}" registered`);
  };

  const handleEdit = (form) => {
    setDomains(prev => prev.map(d =>
      d.id === editingDomain.id ? { ...d, vendor: form.vendor, category: form.category, hipaa: form.hipaa } : d
    ));
    setShowEditModal(false);
    setEditingDomain(null);
    showToast(`Domain "${editingDomain.domain}" updated`);
  };

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(() => {
      setDomains(prev => prev.filter(d => d.id !== deletingDomain.id));
      showToast(`Domain "${deletingDomain.domain}" removed`);
      setDeleting(false);
      setShowDeleteModal(false);
      setDeletingDomain(null);
    }, 400);
  };

  const handleToggleDomain = (id) => {
    setDomains(prev => prev.map(d => {
      if (d.id !== id) return d;
      const newEnabled = !d.enabled;
      showToast(newEnabled ? `Domain "${d.domain}" enabled` : `Domain "${d.domain}" disabled`);
      return { ...d, enabled: newEnabled, status: newEnabled ? 'active' : 'disabled' };
    }));
  };

  const openEdit = (domain) => {
    setEditingDomain(domain);
    setShowEditModal(true);
  };

  const openDelete = (domain) => {
    setDeletingDomain(domain);
    setShowDeleteModal(true);
  };

  return (
    <>
      {/* Blue info banner */}
      {!infoDismissed && (
        <div style={{
          display: 'flex', gap: 8, padding: '10px 16px', alignItems: 'center',
          background: '#EFF6FF', borderBottom: '0.5px solid #BFDBFE',
        }}>
          <Icon name="solar:info-circle-linear" size={16} color="#3B82F6" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 12, color: '#1E40AF', lineHeight: 1.5, flex: 1 }}>
            Domains are account-scoped. Only URLs from registered domains can be used when configuring components.
          </div>
          <button onClick={() => setInfoDismissed(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            color: '#93C5FD', flexShrink: 0, lineHeight: 1, fontSize: 14,
          }}>
            <Icon name="solar:close-circle-linear" size={16} color="#93C5FD" />
          </button>
        </div>
      )}

      {/* Table — edge-to-edge, no card wrapper */}
      <div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Inter', sans-serif" }}>
          <thead>
            <tr>
              <th style={thStyle}>Vendor / label</th>
              <th style={thStyle}>Domain</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>HIPAA</th>
              <th style={thStyle}>Components</th>
              <th style={thStyle}>Enabled</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--neutral-200)' }}>
                  <Icon name="solar:global-linear" size={32} color="var(--neutral-150)" />
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--neutral-300)', marginTop: 8 }}>No domains found</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>
                    {searchQuery.trim() ? 'Try adjusting your search.' : 'Register your first domain to start configuring embedded components.'}
                  </div>
                </td>
              </tr>
            )}
            {filtered.map(d => {
              const stats = getComponentStats(d.id);
              const isDisabled = !d.enabled;

              return (
                <tr
                  key={d.id}
                  style={{
                    borderBottom: '0.5px solid #EAECF0',
                    transition: 'background .1s',
                    ...(isDisabled ? { opacity: 0.55 } : {}),
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--primary-25, #faf8ff)'}
                  onMouseOut={e => e.currentTarget.style.background = ''}
                >
                  {/* Vendor */}
                  <td style={{ ...tdStyle, fontWeight: 500, color: '#1A1F36' }}>
                    {d.vendor}
                  </td>

                  {/* Domain */}
                  <td style={tdStyle}>
                    <code style={{
                      background: 'var(--neutral-50)', padding: '2px 6px', borderRadius: 4,
                      fontSize: 11, fontFamily: "'SF Mono', 'Fira Code', monospace",
                      color: 'var(--neutral-400)',
                    }}>
                      {d.domain}
                    </code>
                  </td>

                  {/* Category */}
                  <td style={tdStyle}>
                    <Badge variant={CATEGORY_BADGE_MAP[d.category] || 'ai-neutral'} label={d.category} />
                  </td>

                  {/* HIPAA */}
                  <td style={tdStyle}>
                    <Badge variant={HIPAA_BADGE_MAP[d.hipaa] || 'ai-neutral'} label={d.hipaa} />
                  </td>

                  {/* Components */}
                  <td style={tdStyle}>
                    {stats.active > 0 && (
                      <Badge variant="status-completed" label={`${stats.active} active`} />
                    )}
                    {stats.active === 0 && stats.disabled === 0 && (
                      <Badge variant="status-queued" label="0 active" />
                    )}
                    {stats.disabled > 0 && (
                      <span style={{ marginLeft: stats.active > 0 ? 4 : 0 }}>
                        <Badge variant="status-failed" label={`${stats.disabled} disabled`} />
                      </span>
                    )}
                  </td>

                  {/* Enabled toggle */}
                  <td style={tdStyle}>
                    <Switch
                      checked={d.enabled !== false}
                      onChange={() => handleToggleDomain(d.id)}
                    />
                  </td>

                  {/* Actions */}
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ActionButton icon="solar:pen-linear" size="L" tooltip="Edit" onClick={() => openEdit(d)} />
                      <span style={{ width: 1, height: 16, background: 'var(--neutral-150)', flexShrink: 0 }} />
                      <ActionButton icon="solar:history-linear" size="L" tooltip="Audit Log" onClick={() => setAuditDrawerEntity({ type: 'Domain', name: d.vendor, domain: d.domain, id: d.id })} />
                      <span style={{ width: 1, height: 16, background: 'var(--neutral-150)', flexShrink: 0 }} />
                      <ActionButton icon="solar:trash-bin-minimalistic-linear" size="L" tooltip="Delete" onClick={() => openDelete(d)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ fontSize: 12, color: '#6F7A90', padding: '12px 16px' }}>
        {domains.length} domain{domains.length !== 1 ? 's' : ''} &middot; {enabledDomains.length} enabled &middot; {disabledDomains.length} disabled
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddDomainModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
        />
      )}

      {showEditModal && editingDomain && (
        <EditDomainModal
          domain={editingDomain}
          onClose={() => { setShowEditModal(false); setEditingDomain(null); }}
          onSave={handleEdit}
        />
      )}

      {showDeleteModal && deletingDomain && (
        <DeleteDomainModal
          domain={deletingDomain}
          onClose={() => { setShowDeleteModal(false); setDeletingDomain(null); }}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}

      {auditDrawerEntity && (
        <AuditLogDrawer entity={auditDrawerEntity} onClose={() => setAuditDrawerEntity(null)} />
      )}
    </>
  );
}
