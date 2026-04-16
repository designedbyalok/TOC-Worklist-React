import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { Drawer } from '../../../components/Drawer/Drawer';
import { Icon } from '../../../components/Icon/Icon';
import { ActionButton } from '../../../components/ActionButton/ActionButton';
import { SearchIconButton } from '../../../components/SearchIconButton/SearchIconButton';
import { HccCard } from './HccGroupRow';
import { getIcdsForMember, getNotLinkedForMember } from '../data/icds';
import styles from './DiagPanel.module.css';

function groupIcdsByHcc(icds) {
  const map = new Map();
  for (const icd of icds) {
    const key = icd.hcc || 'HCC Not Linked';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(icd);
  }
  return [...map.entries()];
}

/* ── Animated segmented control (same pattern as AgentCanvas toolbar tabs) ── */
const VIEW_MODES = ['HCC', 'ICD'];

function ViewByToggle({ active, onChange }) {
  const containerRef = useRef(null);
  const [sliderStyle, setSliderStyle] = useState({});

  const updateSlider = useCallback(() => {
    if (!containerRef.current) return;
    const activeBtn = containerRef.current.querySelector('[data-active="true"]');
    if (activeBtn) {
      setSliderStyle({ left: activeBtn.offsetLeft, width: activeBtn.offsetWidth });
    }
  }, []);

  useEffect(() => { updateSlider(); }, [active, updateSlider]);
  useEffect(() => { requestAnimationFrame(updateSlider); }, [updateSlider]);

  return (
    <div className={styles.segmented} ref={containerRef}>
      <div className={styles.segmentedSlider} style={sliderStyle} />
      {VIEW_MODES.map(mode => (
        <button
          key={mode}
          type="button"
          data-active={active === mode}
          className={`${styles.segmentBtn} ${active === mode ? styles.segmentBtnActive : ''}`}
          onClick={() => onChange(mode)}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}

export function DiagPanel() {
  const memberId = useAppStore(s => s.diagPanelMemberId);
  const closeDiagPanel = useAppStore(s => s.closeDiagPanel);
  const diagViewMode = useAppStore(s => s.diagViewMode);
  const setDiagViewMode = useAppStore(s => s.setDiagViewMode);
  const member = useAppStore(s => s.hccMembers.find(m => m.id === memberId));
  const showToast = useAppStore(s => s.showToast);

  const [overriddenOpen, setOverriddenOpen] = useState(false);
  const [closedOpen, setClosedOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const icds = useMemo(() => (member ? getIcdsForMember(member.name) : []), [member]);
  const notLinked = useMemo(() => (member ? getNotLinkedForMember(member.name) : []), [member]);
  const hccGroups = useMemo(() => groupIcdsByHcc(icds), [icds]);

  if (!member) return null;

  const activeGroups = hccGroups.filter(([, g]) =>
    g.some(i => !['Dismissed', 'Accepted'].includes(i.status))
  );
  const overriddenGroups = hccGroups.filter(([hcc, g]) =>
    g.some(i => i.dismissReason) && !activeGroups.some(ag => ag[0] === hcc)
  );
  const closedGroups = hccGroups.filter(([, g]) =>
    g.every(i => ['Accepted', 'Dismissed'].includes(i.status))
  );

  const rafImpact = (Number(member.ri) || 0).toFixed(3);
  const noop = (label) => () => showToast(`${label} — coming soon`);

  return (
    <Drawer
      title={<span className={styles.drawerTitle}>Diagnosis Gaps Details</span>}
      onClose={closeDiagPanel}
      className={styles.panel}
      bodyClassName={styles.body}
      headerStyle={{ display: 'none' }}
    >
      {/* ── Row 1: Title + Close ── */}
      <div className={styles.titleRow}>
        <span className={styles.titleText}>Diagnosis Gaps Details</span>
        <ActionButton icon="solar:close-linear" size="L" tooltip="Close" onClick={closeDiagPanel} />
      </div>

      {/* ── Row 2: Patient Banner ── */}
      <div className={styles.patientBanner}>
        <div className={styles.avatar}>{member.in}</div>
        <div className={styles.memberInfo}>
          <div className={styles.memberName}>{member.name}</div>
          <div className={styles.memberMeta}>
            <span>{member.g}</span>
            <span>&bull;</span>
            <span>{member.age?.split(' ')[0] || '—'}</span>
            <span>&bull;</span>
            <span className={styles.rafLabel}>RAF</span>
            <span className={styles.rafValue}>{member.raf}</span>
            <span className={styles.rafImpact}>
              {rafImpact}
              <Icon name="solar:arrow-up-linear" size={12} color="var(--status-success)" />
            </span>
          </div>
        </div>
        <div className={styles.bannerActions}>
          <ActionButton icon="solar:phone-linear" size="L" tooltip="Call" onClick={noop('Call')} />
          <span className={styles.divider} />
          <ActionButton icon="solar:chat-round-linear" size="L" tooltip="Message" onClick={noop('Message')} />
          <span className={styles.divider} />
          <ActionButton icon="solar:menu-dots-bold" size="L" tooltip="More" onClick={noop('More')} />
        </div>
      </div>

      {/* ── Row 3: View-by toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.viewBy}>
          <span className={styles.viewByLabel}>View by:</span>
          <ViewByToggle active={diagViewMode} onChange={setDiagViewMode} />
        </div>

        <div className={styles.toolbarIcons}>
          <ActionButton icon="solar:refresh-linear" size="S" tooltip="Refresh" onClick={noop('Refresh')} />
          <span className={styles.divider} />
          <button type="button" className={styles.addIcdBtn} onClick={noop('Add ICD')}>
            <Icon name="solar:add-circle-linear" size={16} color="var(--primary-300)" />
            <span>ICD</span>
          </button>
          <span className={styles.divider} />
          <ActionButton icon="solar:check-square-linear" size="S" tooltip="Bulk Action" onClick={noop('Bulk Action')} />
          <span className={styles.divider} />
          <ActionButton icon="solar:filter-linear" size="S" tooltip="Filter" notification count="1" onClick={noop('Filter')} />
          <span className={styles.divider} />
          <ActionButton icon="solar:sort-vertical-linear" size="S" tooltip="Sort" onClick={noop('Sort')} />
          <span className={styles.divider} />
          <ActionButton icon="solar:history-linear" size="S" tooltip="Activity Log" onClick={noop('Activity Log')} />
          <span className={styles.divider} />
          <ActionButton icon="solar:book-2-linear" size="S" tooltip="Notes" onClick={noop('Notes')} />
          <span className={styles.divider} />
          <ActionButton icon="solar:magnifer-linear" size="S" tooltip="Search" onClick={() => setSearchOpen(o => !o)} />
        </div>
      </div>

      {/* ── Search bar (shown when search icon toggled) ── */}
      {searchOpen && (
        <div className={styles.searchBar}>
          <div className={styles.searchInput}>
            <Icon name="solar:magnifer-linear" size={15} color="var(--neutral-300)" />
            <input
              autoFocus
              type="text"
              placeholder="Search by code or description"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="button"
              className={styles.searchClose}
              onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
              aria-label="Close search"
            >
              <Icon name="solar:close-linear" size={14} color="var(--neutral-300)" />
            </button>
          </div>
        </div>
      )}

      {/* ── HCC Cards ── */}
      <div className={styles.cardsList}>
        {activeGroups.length === 0 && notLinked.length === 0 && (
          <div className={styles.empty}>
            <Icon name="solar:file-text-linear" size={32} color="var(--neutral-200)" />
            <p>No HCC codes recorded yet for this member.</p>
          </div>
        )}

        {activeGroups.map(([hcc, group]) => (
          <HccCard key={hcc} hccTitle={hcc} icds={group} rafImpact={0.166} />
        ))}

        {notLinked.length > 0 && (
          <HccCard hccTitle="Not Linked" icds={notLinked} rafImpact={0} />
        )}

        {/* Overridden HCCs */}
        <div className={styles.collapsible}>
          <button
            type="button"
            className={styles.collapsibleHeader}
            onClick={() => setOverriddenOpen(o => !o)}
            aria-expanded={overriddenOpen}
          >
            <span>Overridden HCCs</span>
            <Icon
              name="solar:alt-arrow-right-linear"
              size={16}
              color="var(--neutral-300)"
              className={overriddenOpen ? styles.chevOpen : ''}
            />
          </button>
          {overriddenOpen && (
            <div className={styles.collapsibleBody}>
              {overriddenGroups.length === 0 ? (
                <p className={styles.collapsibleEmpty}>No overridden HCCs.</p>
              ) : overriddenGroups.map(([hcc, group]) => (
                <HccCard key={hcc} hccTitle={hcc} icds={group} rafImpact={0} />
              ))}
            </div>
          )}
        </div>

        {/* Closed HCCs */}
        <div className={styles.collapsible}>
          <button
            type="button"
            className={styles.collapsibleHeader}
            onClick={() => setClosedOpen(o => !o)}
            aria-expanded={closedOpen}
          >
            <span>Closed HCCs</span>
            <Icon
              name="solar:alt-arrow-right-linear"
              size={16}
              color="var(--neutral-300)"
              className={closedOpen ? styles.chevOpen : ''}
            />
          </button>
          {closedOpen && (
            <div className={styles.collapsibleBody}>
              {closedGroups.length === 0 ? (
                <p className={styles.collapsibleEmpty}>No closed HCCs.</p>
              ) : closedGroups.map(([hcc, group]) => (
                <HccCard key={hcc} hccTitle={hcc} icds={group} rafImpact={0} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
