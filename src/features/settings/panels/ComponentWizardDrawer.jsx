import { useState, useMemo } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { Badge } from '../../../components/Badge/Badge';
import { Button } from '../../../components/Button/Button';
import { Drawer } from '../../../components/Drawer/Drawer';
import { Switch } from '../../../components/Switch/Switch';
import { useAppStore } from '../../../store/useAppStore';
import {
  DOMAINS, COMPONENTS, COMPONENT_CATEGORIES, ICON_OPTIONS, VISIBILITY_OPTIONS,
  ACTIVATION_OPTIONS, CONDITION_OPTIONS, TOKEN_LIFETIME_OPTIONS, CONTEXT_FIELDS,
  WEB_PLACEMENT_OPTIONS, SIDECAR_PATIENT_PLACEMENTS, SIDECAR_GLOBAL_PLACEMENTS,
  MOBILE_PLACEMENTS, DRAWER_TAB_OPTIONS, ACTION_MENU_LOCATIONS, WORKLIST_OPTIONS,
} from '../../../data/embeddedComponents';
import s from './EmbeddedComponents.module.css';
import g from './GoalsPanel.module.css';

const STEPS = ['Identity', 'Surfaces', 'Context', 'Preview'];

/* ── Placement SVG Thumbnails ── */
function P360TabSvg() {
  return (
    <svg width="52" height="38" viewBox="0 0 52 38">
      <rect width="52" height="38" fill="#F7F5FC" />
      <rect x="2" y="3" width="48" height="6" rx="2" fill="white" />
      <rect x="3" y="4" width="11" height="4" rx="1.5" fill="#D1C4E9" />
      <rect x="16" y="4" width="11" height="4" rx="1.5" fill="#D1C4E9" />
      <rect x="29" y="4" width="13" height="4" rx="1.5" fill="#8C5AE2" />
      <rect x="2" y="11" width="48" height="25" rx="2" fill="white" />
    </svg>
  );
}
function SideDrawerSvg() {
  return (
    <svg width="52" height="38" viewBox="0 0 52 38">
      <rect width="52" height="38" fill="#F7F5FC" />
      <rect x="2" y="2" width="30" height="34" rx="2" fill="white" opacity=".5" />
      <rect x="32" y="2" width="18" height="34" rx="2" fill="#F5F0FF" />
      <rect x="34" y="5" width="13" height="2" rx="1" fill="#8C5AE2" />
      <rect x="34" y="9" width="9" height="2" rx="1" fill="#D7C0FF" opacity=".5" />
      <rect x="34" y="13" width="12" height="10" rx="2" fill="white" />
    </svg>
  );
}
function WidgetCardSvg() {
  return (
    <svg width="52" height="38" viewBox="0 0 52 38">
      <rect width="52" height="38" fill="#F7F5FC" />
      <rect x="2" y="2" width="32" height="34" rx="2" fill="white" opacity=".4" />
      <rect x="35" y="2" width="15" height="34" rx="2" fill="white" />
      <rect x="36" y="4" width="12" height="4" rx="1.5" fill="#F5F0FF" />
      <rect x="36" y="10" width="12" height="12" rx="2" fill="#8C5AE2" opacity=".12" />
      <rect x="37" y="12" width="7" height="2" rx="1" fill="#8C5AE2" opacity=".5" />
    </svg>
  );
}
function ActionMenuSvg() {
  return (
    <svg width="52" height="38" viewBox="0 0 52 38">
      <rect width="52" height="38" fill="#F7F5FC" />
      <rect x="2" y="2" width="48" height="8" rx="2" fill="white" opacity=".5" />
      <rect x="22" y="12" width="28" height="22" rx="3" fill="white" />
      <rect x="24" y="15" width="16" height="2.5" rx="1" fill="#D1C4E9" />
      <rect x="24" y="19.5" width="16" height="2.5" rx="1" fill="#8C5AE2" opacity=".7" />
      <rect x="24" y="24" width="16" height="2.5" rx="1" fill="#D1C4E9" />
    </svg>
  );
}

const WEB_SVG_MAP = {
  'p360-tab': P360TabSvg,
  'side-drawer': SideDrawerSvg,
  'widget-card': WidgetCardSvg,
  'action-menu': ActionMenuSvg,
};

/* ── Stepper (reuses Goal Wizard CSS classes from GoalsPanel.module.css) ── */
function Stepper({ step }) {
  return (
    <div className={g.stepper}>
      {STEPS.map((label, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <div key={label} style={{ display: 'contents' }}>
            <div
              className={`${g.wizStep} ${current ? g.wizStepActive : done ? g.wizStepDone : ''}`}
              onClick={() => done && step > i}
            >
              <div className={g.wizStepNum}>{done ? <Icon name="solar:check-read-linear" size={12} /> : i + 1}</div>
              <span className={g.wizStepLabel}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`${g.wizConnector} ${done ? g.wizConnectorDone : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Step 1: Identity ── */
function StepIdentity({ data, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className={s.formGroup} style={{ marginBottom: 0 }}>
          <label className={s.label}>Component name *</label>
          <input className={s.input} value={data.name} onChange={e => onChange({ name: e.target.value })} placeholder="e.g. Prior Auth Widget" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className={s.formGroup} style={{ marginBottom: 0 }}>
            <label className={s.label}>Category</label>
            <select className={s.select} value={data.category} onChange={e => onChange({ category: e.target.value })}>
              {COMPONENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className={s.formGroup} style={{ marginBottom: 0 }}>
            <label className={s.label}>Visible to</label>
            <select className={s.select} value={data.visibleTo} onChange={e => onChange({ visibleTo: e.target.value })}>
              {VISIBILITY_OPTIONS.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>
        <div className={s.formGroup} style={{ marginBottom: 0 }}>
          <label className={s.label}>Description <span style={{ fontWeight: 400, color: 'var(--neutral-200)' }}>(shown to providers in About popup)</span></label>
          <textarea className={s.textarea} value={data.description} onChange={e => onChange({ description: e.target.value.slice(0, 200) })} maxLength={200} placeholder="What does this component do?" />
          <span className={s.hint}>{data.description.length}/200</span>
        </div>
        <div className={s.formGroup} style={{ marginBottom: 0 }}>
          <label className={s.label}>Activation</label>
          <select className={s.select} value={data.activation} onChange={e => onChange({ activation: e.target.value })}>
            {ACTIVATION_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>
      </div>
      {data.activation === 'conditional' && (
        <div style={{ marginTop: 10 }}>
          <div className={s.infoBox} style={{ background: 'var(--primary-50)', color: 'var(--primary-400)', border: '0.5px solid rgba(140,90,226,.15)' }}>
            Component surfaces only when the selected condition is true — prevents irrelevant components from cluttering the provider view.
          </div>
          <div className={s.formGroup}>
            <label className={s.label}>Show when</label>
            <select className={s.select} value={data.condition} onChange={e => onChange({ condition: e.target.value })}>
              {CONDITION_OPTIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Step 2: Surfaces & Placement ── */
function StepSurfaces({ data, onChange }) {
  const toggleSurface = (key) => {
    const surfaces = data.surfaces.includes(key) ? data.surfaces.filter(s2 => s2 !== key) : [...data.surfaces, key];
    onChange({ surfaces });
  };

  const SURFACES = [
    { key: 'web', icon: 'solar:monitor-linear', name: 'Fold Web', desc: 'Patient 360, side-drawer, worklists' },
    { key: 'sidecar', icon: 'solar:link-round-linear', name: 'Sidecar', desc: 'EHR overlay - patient + global views' },
    { key: 'mobile', icon: 'solar:smartphone-linear', name: 'Mobile app', desc: 'iOS / Android provider app' },
  ];

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
        Select surfaces <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--neutral-300)' }}>(multi-select)</span>
      </div>
      <div className={s.surfaceGrid}>
        {SURFACES.map(sf => {
          const active = data.surfaces.includes(sf.key);
          return (
            <div key={sf.key} className={active ? s.surfaceCardActive : s.surfaceCard} onClick={() => toggleSurface(sf.key)}>
              <div className={s.surfaceIcon}><Icon name={sf.icon} size={18} color="var(--primary-300)" /></div>
              <div className={s.surfaceInfo}>
                <div className={s.surfaceName}>{sf.name}</div>
                <div className={s.surfaceDesc}>{sf.desc}</div>
              </div>
              <div className={s.surfaceCheck}>{active ? '✓' : ''}</div>
            </div>
          );
        })}
      </div>

      {/* Fold Web config */}
      {data.surfaces.includes('web') && (
        <div className={s.configSection}>
          <div className={s.configHeader}>
            <div className={s.configHeaderIcon}><Icon name="solar:monitor-linear" size={14} color="var(--primary-300)" /></div>
            Fold Web — Placement type
          </div>
          <div className={s.configBody}>
            <div className={s.placementGrid}>
              {WEB_PLACEMENT_OPTIONS.map(pl => {
                const SvgComp = WEB_SVG_MAP[pl.value];
                const active = data.webPlacement === pl.value;
                return (
                  <div key={pl.value} className={active ? s.placementCardActive : s.placementCard} onClick={() => onChange({ webPlacement: pl.value })}>
                    {SvgComp && <SvgComp />}
                    <div className={s.placementLabel}>{pl.label}</div>
                    <div className={s.placementDesc}>{pl.description}</div>
                  </div>
                );
              })}
            </div>
            {/* Side-drawer config */}
            {data.webPlacement === 'side-drawer' && (
              <div className={s.modalGrid} style={{ gap: 12 }}>
                <div className={s.formGroup}>
                  <label className={s.label}>Drawer width</label>
                  <div className={s.sliderRow}>
                    <input type="range" min={300} max={800} step={10} value={data.drawerWidth}
                      className={s.sliderRange}
                      onChange={e => onChange({ drawerWidth: Number(e.target.value) })} />
                    <span className={s.sliderValue}>{data.drawerWidth}px</span>
                  </div>
                  <div className={s.sliderBar}>
                    <div className={`${s.sliderFill} ${data.drawerWidth > 650 ? s.sliderRed : data.drawerWidth > 500 ? s.sliderAmber : s.sliderGreen}`}
                      style={{ width: `${Math.round((data.drawerWidth - 300) / 500 * 100)}%` }} />
                  </div>
                  <span className={s.hint}>
                    {data.drawerWidth > 650 ? 'Warning: will significantly overlap the patient chart' : data.drawerWidth > 500 ? 'Caution: may overlap chart on screens under 1280px' : 'Safe — fits alongside patient chart on 1280px+ screens'}
                  </span>
                </div>
                <div className={s.formGroup}>
                  <label className={s.label}>Opens via</label>
                  <select className={s.select} value={data.opensVia} onChange={e => onChange({ opensVia: e.target.value })}>
                    <option>Action menu item only</option>
                    <option>Nav tab + action menu</option>
                    <option>Inline button (e.g. in gap list)</option>
                  </select>
                </div>
                <div className={s.formGroup}>
                  <label className={s.label}>Show in tab context</label>
                  <select className={s.select} value={data.tabContext} onChange={e => onChange({ tabContext: e.target.value })}>
                    <option>All patient tabs</option>
                    <option>Gaps tab only</option>
                    <option>Orders tab only</option>
                    <option>Care Programs tab</option>
                  </select>
                </div>
                <div className={s.formGroup}>
                  <label className={s.label}>Background behavior</label>
                  <select className={s.select} value={data.background} onChange={e => onChange({ background: e.target.value })}>
                    <option>Dim patient chart</option>
                    <option>No dim</option>
                  </select>
                </div>
              </div>
            )}
            {/* P360 tab config */}
            {data.webPlacement === 'p360-tab' && (
              <div className={s.formGroup}>
                <label className={s.label}>Tab label</label>
                <input className={s.input} style={{ maxWidth: 220 }} value={data.webTabLabel} onChange={e => onChange({ webTabLabel: e.target.value })} />
              </div>
            )}
            {/* Widget card config */}
            {data.webPlacement === 'widget-card' && (
              <div className={s.modalGrid} style={{ gap: 12 }}>
                <div className={s.formGroup}>
                  <label className={s.label}>Display in drawer tab</label>
                  <select className={s.select} value={data.drawerTab} onChange={e => onChange({ drawerTab: e.target.value })}>
                    {DRAWER_TAB_OPTIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <span className={s.hint}>Widget appears as a card within this tab</span>
                </div>
                <div className={s.formGroup}>
                  <label className={s.label}>Widget height</label>
                  <select className={s.select} value={data.widgetHeight} onChange={e => onChange({ widgetHeight: e.target.value })}>
                    <option>Auto (up to 280px)</option>
                    <option>Fixed 200px</option>
                    <option>Fixed 300px</option>
                  </select>
                </div>
              </div>
            )}
            {/* Action menu config */}
            {data.webPlacement === 'action-menu' && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--neutral-300)', marginBottom: 8 }}>Apply to which action menus?</div>
                <div className={s.modalGrid} style={{ gap: 6, marginBottom: 12 }}>
                  {ACTION_MENU_LOCATIONS.map(loc => {
                    const active = data.actionMenus?.includes(loc.key);
                    return (
                      <div key={loc.key} className={active ? s.checkItemActive : s.checkItem}
                        onClick={() => {
                          const menus = active ? data.actionMenus.filter(k => k !== loc.key) : [...(data.actionMenus || []), loc.key];
                          onChange({ actionMenus: menus });
                        }}>
                        <div className={s.checkBox}>{active ? '✓' : ''}</div>
                        {loc.label}
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--neutral-300)', marginBottom: 6 }}>Worklists</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {WORKLIST_OPTIONS.map(wl => {
                    const active = data.worklists?.includes(wl);
                    return (
                      <div key={wl} className={active ? s.wlPillActive : s.wlPill}
                        onClick={() => {
                          const wls = active ? data.worklists.filter(w => w !== wl) : [...(data.worklists || []), wl];
                          onChange({ worklists: wls });
                        }}>
                        {wl}
                      </div>
                    );
                  })}
                </div>
                <div className={s.formGroup}>
                  <label className={s.label}>Action triggers</label>
                  <select className={s.select} value={data.actionTrigger} onChange={e => onChange({ actionTrigger: e.target.value })}>
                    <option>Opens a drawer on the right</option>
                    <option>Opens full-screen view</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sidecar config */}
      {data.surfaces.includes('sidecar') && (
        <div className={s.configSection}>
          <div className={s.configHeader}>
            <div className={s.configHeaderIcon}><Icon name="solar:link-round-linear" size={14} color="var(--primary-300)" /></div>
            Sidecar — Placement
          </div>
          <div className={s.configBody}>
            <div className={s.subTabs}>
              <div className={data.sidecarView === 'patient' ? s.subTabActive : s.subTab} onClick={() => onChange({ sidecarView: 'patient' })}>Patient context view</div>
              <div className={data.sidecarView === 'global' ? s.subTabActive : s.subTab} onClick={() => onChange({ sidecarView: 'global' })}>Global view (no patient)</div>
            </div>
            {data.sidecarView === 'patient' ? (
              <>
                <div className={s.infoBlue} style={{ marginBottom: 10 }}>Active when a provider has opened a patient in the EHR. Full JWT with patientId available.</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  {SIDECAR_PATIENT_PLACEMENTS.map(pl => {
                    const active = data.sidecarPlacement === pl.value;
                    return (
                      <div key={pl.value} className={active ? s.checkItemActive : s.checkItem}
                        style={{ padding: 12, borderRadius: 8, flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}
                        onClick={() => onChange({ sidecarPlacement: pl.value })}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{pl.label}</div>
                        <div style={{ fontSize: 11, opacity: .7 }}>{pl.description}</div>
                      </div>
                    );
                  })}
                </div>
                {data.sidecarPlacement === 'tab' && (
                  <div className={s.formGroup}>
                    <label className={s.label}>Tab label in Sidecar</label>
                    <input className={s.input} style={{ maxWidth: 200 }} value={data.sidecarTabLabel} onChange={e => onChange({ sidecarTabLabel: e.target.value })} />
                  </div>
                )}
                {data.sidecarPlacement === 'widget' && (
                  <div className={s.formGroup}>
                    <label className={s.label}>Display in existing tab</label>
                    <select className={s.select} value={data.sidecarWidgetTab} onChange={e => onChange({ sidecarWidgetTab: e.target.value })}>
                      {DRAWER_TAB_OPTIONS.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <span className={s.hint}>Widget appears as a collapsible card within this tab</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={s.infoAmber} style={{ marginBottom: 10 }}>No patient context available. JWT contains only userId and accountId. Suitable for account-level dashboards or task notifications only.</div>
                <div className={s.formGroup}>
                  <label className={s.label}>Placement in global view</label>
                  <select className={s.select} value={data.sidecarGlobalPlacement} onChange={e => onChange({ sidecarGlobalPlacement: e.target.value })}>
                    {SIDECAR_GLOBAL_PLACEMENTS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile config */}
      {data.surfaces.includes('mobile') && (
        <div className={s.configSection}>
          <div className={s.configHeader}>
            <div className={s.configHeaderIcon}><Icon name="solar:smartphone-linear" size={14} color="var(--primary-300)" /></div>
            Mobile app — Placement
          </div>
          <div className={s.configBody}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              {MOBILE_PLACEMENTS.map(pl => {
                const active = data.mobilePlacement === pl.value;
                return (
                  <div key={pl.value} className={active ? s.checkItemActive : s.checkItem}
                    style={{ padding: 12, borderRadius: 8, flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}
                    onClick={() => onChange({ mobilePlacement: pl.value })}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{pl.label}</div>
                    <div style={{ fontSize: 11, opacity: .7 }}>{pl.description}</div>
                  </div>
                );
              })}
            </div>
            {data.mobilePlacement === 'profile-tab' && (
              <div className={s.formGroup}>
                <label className={s.label}>Tab label on mobile</label>
                <input className={s.input} style={{ maxWidth: 200 }} value={data.mobileTabLabel} onChange={e => onChange({ mobileTabLabel: e.target.value })} />
              </div>
            )}
            {data.mobilePlacement === 'home-card' && (
              <div className={s.infoAmber}>Home screen components receive only userId and accountId. Not suitable for patient-specific tools.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Step 3: Context & Security ── */
function StepContext({ data, onChange }) {
  const activeDomains = DOMAINS.filter(d => d.status === 'active');
  const selectedDomain = activeDomains.find(d => d.id === data.domainId);
  const fullUrl = selectedDomain ? `https://${selectedDomain.domain}${data.url}` : '';
  const selectedFieldCount = data.contextFields.length;
  const totalFieldCount = CONTEXT_FIELDS.length;

  return (
    <div style={{ maxWidth: '100%' }}>
      <div className={s.modalGrid} style={{ gap: 14, marginBottom: 16 }}>
        <div className={s.formGroup}>
          <label className={s.label}>Domain *</label>
          <select className={s.select} value={data.domainId} onChange={e => onChange({ domainId: Number(e.target.value) })}>
            {activeDomains.map(d => <option key={d.id} value={d.id}>{d.domain}</option>)}
          </select>
        </div>
        <div className={s.formGroup}>
          <label className={s.label}>Path *</label>
          <input className={s.input} value={data.url} onChange={e => onChange({ url: e.target.value })} placeholder="/widget/..." />
          {fullUrl && <span className={s.hint}>Full URL: {fullUrl}</span>}
        </div>
        <div className={s.formGroup}>
          <label className={s.label}>Test / staging URL</label>
          <input className={s.input} value={data.stagingUrl} onChange={e => onChange({ stagingUrl: e.target.value })} placeholder="/widget/...?env=staging" />
          <span className={s.hint}>Used in preview mode — no real patient data</span>
        </div>
        <div className={s.formGroup}>
          <label className={s.label}>Token lifetime</label>
          <select className={s.select} value={data.tokenLifetime} onChange={e => onChange({ tokenLifetime: Number(e.target.value) })}>
            {TOKEN_LIFETIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {data.tokenLifetime === 30 && <span className={s.hint}>Use 30 min for complex workflows like prior auth</span>}
        </div>
      </div>

      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--neutral-300)', marginBottom: 8 }}>
        JWT context scope — fields sent to this component
      </div>
      <div className={s.modalGrid} style={{ gap: 6, marginBottom: 16 }}>
        {CONTEXT_FIELDS.map(field => {
          const active = data.contextFields.includes(field.key);
          return (
            <div key={field.key}
              className={field.locked ? s.checkItemLocked : active ? s.checkItemActive : s.checkItem}
              onClick={() => {
                if (field.locked) return;
                const fields = active ? data.contextFields.filter(f => f !== field.key) : [...data.contextFields, field.key];
                onChange({ contextFields: fields });
              }}>
              <div className={s.checkBox}>{active ? '✓' : ''}</div>
              {field.label}{field.description ? ` — ${field.description}` : ''}
            </div>
          );
        })}
      </div>

      {/* Save Summary */}
      <div className={s.summaryCard}>
        <div className={s.summaryLabel}>Save Summary</div>
        <div className={s.summaryGrid}>
          <div className={s.summaryKey}>Name</div><div className={s.summaryVal}>{data.name || '—'}</div>
          <div className={s.summaryKey}>Surfaces</div><div className={s.summaryVal}>{data.surfaces.map(sf => sf === 'web' ? 'Fold Web' : sf === 'sidecar' ? 'Sidecar' : 'Mobile').join(' · ') || '—'}</div>
          <div className={s.summaryKey}>Placement</div>
          <div className={s.summaryVal}>
            {[data.webPlacement && WEB_PLACEMENT_OPTIONS.find(p => p.value === data.webPlacement)?.label,
              data.sidecarPlacement && `Sidecar ${data.sidecarPlacement}`,
              data.mobilePlacement && MOBILE_PLACEMENTS.find(p => p.value === data.mobilePlacement)?.label,
            ].filter(Boolean).join(' · ') || '—'}
            {data.webPlacement === 'side-drawer' && data.drawerWidth ? ` (${data.drawerWidth}px)` : ''}
          </div>
          <div className={s.summaryKey}>URL</div>
          <div className={s.summaryVal} style={{ fontFamily: "'SF Mono', monospace", fontSize: 11 }}>{fullUrl || '—'}</div>
          <div className={s.summaryKey}>Token lifetime</div><div className={s.summaryVal}>{data.tokenLifetime} min</div>
          <div className={s.summaryKey}>Context scope</div><div className={s.summaryVal}>{selectedFieldCount} of {totalFieldCount} fields</div>
        </div>
        <div className={s.infoAmber} style={{ marginTop: 12, fontSize: 11 }}>
          Saved as disabled. Enable from the library after testing in preview mode.
        </div>
      </div>
    </div>
  );
}

/* ── Step 4: Preview (stub, links to full preview panel) ── */
function StepPreview({ data }) {
  const selectedDomain = DOMAINS.find(d => d.id === data.domainId);

  return (
    <div>
      <div className={s.previewHint}>
        This component will appear on: {data.surfaces.map(sf => sf === 'web' ? 'Fold Web' : sf === 'sidecar' ? 'Sidecar' : 'Mobile').join(', ')}.
        Below is a preview of how providers will see it.
      </div>

      {/* Simple preview mockup */}
      <div className={s.previewFrame} style={{ height: 260, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '8px 14px', borderBottom: '0.5px solid var(--neutral-150)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
            {data.icon}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{data.name || 'Component Name'}</div>
            <div style={{ fontSize: 11, color: 'var(--neutral-200)' }}>{selectedDomain?.domain || 'domain.com'}</div>
          </div>
          <Badge variant="compliance-warn" label="External" style={{ marginLeft: 'auto' }} />
        </div>
        <div className={s.externalBanner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="solar:danger-triangle-bold" size={12} color="#D97706" />
            <span style={{ fontWeight: 500 }}>External content</span> · {selectedDomain?.domain || 'domain.com'}
          </div>
          <span className={s.externalBannerLink}>What's shared?</span>
        </div>
        <div style={{ flex: 1, background: 'var(--neutral-50)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="solar:widget-5-linear" size={32} color="var(--neutral-200)" />
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--neutral-300)' }}>{data.name || 'Component'}</div>
          <div style={{ fontSize: 11, color: 'var(--neutral-200)' }}>iFrame · JWT {data.tokenLifetime} min token</div>
        </div>
        <div style={{ padding: '6px 14px', borderTop: '0.5px solid var(--neutral-150)', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--neutral-200)' }}>
          <span>Token {data.tokenLifetime - 1}m 58s</span>
          <span style={{ color: 'var(--primary-300)', cursor: 'pointer' }}>Refresh</span>
        </div>
      </div>

      {/* Dev console stub */}
      <div className={s.devConsole}>
        <div className={s.devConsoleHeader}>
          <span className={s.devConsoleTitle}>Developer Console</span>
          <Icon name="solar:alt-arrow-down-linear" size={12} color="rgba(255,255,255,.4)" />
        </div>
        <div className={s.devConsoleBody}>
          <div>{'{'}</div>
          <div>  <span className={s.devConsoleKey}>"patientId"</span>: <span className={s.devConsoleStr}>"mock-pt-001"</span>,</div>
          <div>  <span className={s.devConsoleKey}>"accountId"</span>: <span className={s.devConsoleStr}>"acct-fold-demo"</span>,</div>
          {data.contextFields.includes('userId') && <div>  <span className={s.devConsoleKey}>"userId"</span>: <span className={s.devConsoleStr}>"usr-dr-smith"</span>,</div>}
          {data.contextFields.includes('userEmail') && <div>  <span className={s.devConsoleKey}>"userEmail"</span>: <span className={s.devConsoleStr}>"dr.smith@fold.health"</span>,</div>}
          {data.contextFields.includes('screen') && <div>  <span className={s.devConsoleKey}>"screen"</span>: <span className={s.devConsoleStr}>"patient-360"</span>,</div>}
          {data.contextFields.includes('componentId') && <div>  <span className={s.devConsoleKey}>"componentId"</span>: <span className={s.devConsoleStr}>"comp-{data.name?.toLowerCase().replace(/\s/g, '-') || 'new'}"</span>,</div>}
          <div>  <span className={s.devConsoleKey}>"exp"</span>: {Date.now() + data.tokenLifetime * 60000}</div>
          <div>{'}'}</div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Wizard ── */
export function ComponentWizardDrawer() {
  const setComponentWizard = useAppStore(s => s.setComponentWizard);
  const editId = useAppStore(s => s.componentWizardEditId);
  const showToast = useAppStore(s => s.showToast);

  const existing = editId ? COMPONENTS.find(c => c.id === editId) : null;

  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: existing?.name || '',
    category: existing?.category || COMPONENT_CATEGORIES[0],
    icon: existing?.icon || '📋',
    description: existing?.description || '',
    visibleTo: existing?.visibleTo || VISIBILITY_OPTIONS[0],
    activation: existing?.activation || 'always',
    condition: existing?.condition || CONDITION_OPTIONS[0],
    surfaces: existing?.surfaces || [],
    webPlacement: existing?.placements?.web || 'side-drawer',
    drawerWidth: existing?.webConfig?.drawerWidth || 480,
    opensVia: existing?.webConfig?.opensVia || 'Action menu item only',
    tabContext: existing?.webConfig?.tabContext || 'All patient tabs',
    background: existing?.webConfig?.background || 'Dim patient chart',
    webTabLabel: existing?.webConfig?.tabLabel || '',
    drawerTab: existing?.webConfig?.drawerTab || 'Gaps',
    widgetHeight: existing?.webConfig?.widgetHeight || 'Auto (up to 280px)',
    actionMenus: existing?.webConfig?.actionMenus || [],
    worklists: existing?.webConfig?.worklists || [],
    actionTrigger: existing?.webConfig?.actionTrigger || 'Opens a drawer on the right',
    sidecarView: 'patient',
    sidecarPlacement: existing?.sidecarConfig?.placement || 'tab',
    sidecarTabLabel: existing?.sidecarConfig?.tabLabel || '',
    sidecarWidgetTab: 'Gaps',
    sidecarGlobalPlacement: SIDECAR_GLOBAL_PLACEMENTS[0],
    mobilePlacement: existing?.placements?.mobile || 'profile-tab',
    mobileTabLabel: '',
    domainId: existing?.domainId || DOMAINS.find(d => d.status === 'active')?.id || 1,
    url: existing?.url || '',
    stagingUrl: existing?.stagingUrl || '',
    tokenLifetime: existing?.tokenLifetime || 5,
    contextFields: existing?.contextFields || ['patientId', 'accountId', 'userId', 'userEmail', 'screen', 'componentId'],
  });

  const update = (patch) => setData(prev => ({ ...prev, ...patch }));
  const close = () => setComponentWizard(false, null);

  const handleSave = () => {
    showToast(editId ? `"${data.name}" updated` : `"${data.name}" created (disabled)`);
    close();
  };

  const canNext = step === 0 ? data.name.trim().length > 0 : step === 1 ? data.surfaces.length > 0 : true;

  const headerRight = (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button variant="primary" size="L" disabled={!canNext} onClick={() => {
        if (step < STEPS.length - 1) setStep(step + 1);
        else handleSave();
      }}>
        {step === STEPS.length - 1 ? (editId ? 'Save Changes' : 'Save & Enable') : 'Next'}
      </Button>
    </div>
  );

  return (
    <Drawer
      title={editId ? `Edit — ${data.name}` : 'New Component'}
      onClose={close}
      headerRight={headerRight}
    >
      {step > 0 && (
        <Button variant="ghost" size="S" leadingIcon="solar:alt-arrow-left-linear" onClick={() => setStep(step - 1)} style={{ marginBottom: 12 }}>
          Back
        </Button>
      )}
      <Stepper step={step} />
      <div style={{ padding: '16px 0' }}>
        {step === 0 && <StepIdentity data={data} onChange={update} />}
        {step === 1 && <StepSurfaces data={data} onChange={update} />}
        {step === 2 && <StepContext data={data} onChange={update} />}
        {step === 3 && <StepPreview data={data} />}
      </div>
    </Drawer>
  );
}
