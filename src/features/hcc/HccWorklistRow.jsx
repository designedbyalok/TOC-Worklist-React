import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '../../store/useAppStore';
import { Avatar } from '../../components/Avatar/Avatar';
import { Badge } from '../../components/Badge/Badge';
import { Checkbox } from '../../components/ui/checkbox';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { Icon } from '../../components/Icon/Icon';
import { getIcdsForMember, getNotLinkedForMember } from './data/icds';
import styles from './HccWorklistRow.module.css';

// ── Icon + color treatment per role-status ──
const STATUS_SPEC = {
  Completed:           { icon: 'solar:check-circle-bold',    color: 'var(--status-success)' },
  'Records Received':  { icon: 'solar:check-circle-bold',    color: 'var(--status-success)' },
  Accepted:            { icon: 'solar:check-circle-bold',    color: 'var(--status-success)' },
  Billed:              { icon: 'solar:check-circle-bold',    color: 'var(--status-success)' },
  'In Progress':       { icon: 'solar:clock-circle-linear',  color: 'var(--status-warning)' },
  New:                 { icon: 'solar:clock-circle-linear',  color: 'var(--status-warning)' },
  Awaiting:            { icon: 'solar:clock-circle-linear',  color: 'var(--status-warning)' },
  'Records Requested': { icon: 'solar:paperclip-linear',     color: 'var(--secondary-300)' },
  Returned:            { icon: 'solar:refresh-linear',       color: 'var(--secondary-300)' },
  Rejected:            { icon: 'solar:close-circle-linear',  color: 'var(--status-error)' },
  Insufficient:        { icon: 'solar:info-circle-linear',   color: 'var(--status-error)' },
  Missed:              { icon: 'solar:info-circle-linear',   color: 'var(--status-error)' },
  Skipped:             { icon: 'solar:clock-circle-linear',  color: 'var(--neutral-300)' },
  Dismissed:           { icon: 'solar:close-circle-linear',  color: 'var(--neutral-300)' },
};

const RISK_VARIANT = { High: 'lace-high', Medium: 'lace-medium', Low: 'lace-low' };

function LastVisitCell({ dos, visits }) {
  if (!dos) return <span className={styles.muted}>—</span>;
  return (
    <div className={styles.stackCell}>
      <span className={styles.lastVisitDate}>{dos}</span>
      {visits && <span className={styles.lastVisitMeta}>{visits}</span>}
    </div>
  );
}

function CreateDateCell({ date, due, dueCol }) {
  return (
    <div className={styles.stackCell}>
      <span className={styles.dateText}>{date}</span>
      {due && (
        <span className={styles.dueLine} style={{ color: dueCol }}>
          <Icon name="solar:clock-circle-linear" size={12} color={dueCol} />
          <span>{due}</span>
        </span>
      )}
    </div>
  );
}

function summarizeDocs(docStatus = []) {
  if (docStatus.length === 0) return { label: 'No Charts', color: 'var(--neutral-200)' };
  const pass = docStatus.filter(s => s === 'passed').length;
  const fail = docStatus.filter(s => s === 'failed').length;
  const pend = docStatus.filter(s => s === 'pending').length;
  if (pass === docStatus.length) return { label: 'All Verified', color: 'var(--status-success)' };
  if (fail === docStatus.length) return { label: 'All Failed',   color: 'var(--status-error)' };
  if (pend === docStatus.length) return { label: 'All Pending',  color: 'var(--neutral-200)' };
  if (fail > 0)                  return { label: `${fail} Failed`, color: 'var(--status-error)' };
  return { label: `${pend} Pending`, color: 'var(--status-warning)' };
}

function HccEvidenceCell({ count, docStatus }) {
  if (count == null) return <span className={styles.muted}>—</span>;
  const summary = summarizeDocs(docStatus);
  return (
    <div className={styles.stackCell}>
      <div className={styles.evidenceBadge}>
        <Icon name="solar:file-text-linear" size={12} color="var(--primary-300)" />
        <span>{count}</span>
        <Icon name="solar:alt-arrow-down-linear" size={10} color="var(--primary-300)" />
      </div>
      <div className={styles.evidenceStatus}>
        <span className={styles.evidenceDot} style={{ background: summary.color }} />
        <span>{summary.label}</span>
      </div>
    </div>
  );
}

function RoleStatusCell({ name, status }) {
  if (!name || !status || status === 'Assign') {
    return (
      <div className={styles.roleUnassigned}>
        <Icon name="solar:user-linear" size={16} color="var(--neutral-150)" />
        <span>Assign</span>
      </div>
    );
  }
  const spec = STATUS_SPEC[status] || STATUS_SPEC['In Progress'];
  return (
    <div className={styles.stackCell}>
      <span className={styles.roleName}>{name}</span>
      <span className={styles.roleStatusLine} style={{ color: spec.color }}>
        <Icon name={spec.icon} size={12} color={spec.color} />
        <span>{status}</span>
      </span>
    </div>
  );
}

function OpenIcdsCell({ count, memberName, onOpen }) {
  const cellRef = useRef(null);
  const openTimer = useRef(null);
  const closeTimer = useRef(null);
  const [pos, setPos] = useState(null);

  const computeOpenIcds = () => {
    const all = [...getIcdsForMember(memberName), ...getNotLinkedForMember(memberName)];
    return all.filter(i => !['Accepted', 'Dismissed'].includes(i.status));
  };

  const open = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    if (pos) return;
    openTimer.current = setTimeout(() => {
      const rect = cellRef.current?.getBoundingClientRect();
      if (!rect) return;
      const W = 360;
      const H = 320;
      let left = rect.left;
      if (left + W > window.innerWidth - 12) left = window.innerWidth - W - 12;
      left = Math.max(12, left);
      const top = rect.bottom + H + 12 > window.innerHeight
        ? Math.max(12, rect.top - H - 8)
        : rect.bottom + 6;
      setPos({ top, left });
    }, 200);
  };

  const close = () => {
    if (openTimer.current) { clearTimeout(openTimer.current); openTimer.current = null; }
    closeTimer.current = setTimeout(() => setPos(null), 200);
  };

  useEffect(() => () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  }, []);

  if (count == null) return <span className={styles.muted}>—</span>;

  const icds = pos ? computeOpenIcds() : [];

  return (
    <>
      <div
        ref={cellRef}
        className={styles.openIcdsTrigger}
        onMouseEnter={open}
        onMouseLeave={close}
      >
        <Badge variant="status-queued" label={String(count)} />
      </div>
      {pos && createPortal(
        <div
          className={styles.openIcdsPopover}
          style={{ top: pos.top, left: pos.left }}
          onMouseEnter={() => { if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; } }}
          onMouseLeave={close}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.openIcdsHeader}>
            <span className={styles.openIcdsTitle}>
              Open ICDs <span className={styles.openIcdsCount}>{icds.length || count}</span>
            </span>
          </div>
          <div className={styles.openIcdsBody}>
            {icds.length === 0 ? (
              <div className={styles.openIcdsEmpty}>
                {count} open code{count === 1 ? '' : 's'} on chart · details pending
              </div>
            ) : (
              icds.map((icd, i) => (
                <div key={`${icd.code}-${i}`} className={styles.openIcdsRow}>
                  <span className={styles.openIcdsCode}>{icd.code}</span>
                  <div className={styles.openIcdsDetail}>
                    <div className={styles.openIcdsDesc}>{icd.desc}</div>
                    <div className={styles.openIcdsMeta}>
                      {icd.hcc && <span>{icd.hcc}</span>}
                      {icd.status && <span className={styles.openIcdsStatusPill}>{icd.status}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className={styles.openIcdsFooter}>
            <button type="button" className={styles.openIcdsOpenBtn} onClick={onOpen}>
              Open diagnosis review
              <Icon name="solar:arrow-right-linear" size={12} color="var(--primary-300)" />
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

function RafImpactCell({ value, ru }) {
  if (value == null) return <span className={styles.muted}>—</span>;
  const positive = ru !== false; // default to positive/up unless explicitly false
  const color = positive ? 'var(--status-success)' : 'var(--status-error)';
  const bg    = positive ? 'var(--status-success-light)' : 'var(--status-error-light)';
  const border = positive ? 'rgba(0,155,83,0.2)' : 'rgba(215,40,37,0.2)';
  const arrow = positive ? 'solar:arrow-up-linear' : 'solar:arrow-down-linear';
  return (
    <span className={styles.rafImpactBadge} style={{ color, background: bg, borderColor: border }}>
      <span>{value}</span>
      <Icon name={arrow} size={12} color={color} />
    </span>
  );
}

export function HccWorklistRow({ member }) {
  const selectedHccIds = useAppStore(s => s.selectedHccIds);
  const selectHccMember = useAppStore(s => s.selectHccMember);
  const openDiagPanel = useAppStore(s => s.openDiagPanel);
  const diagPanelMemberId = useAppStore(s => s.diagPanelMemberId);
  const checked = selectedHccIds.includes(member.id);
  const isOpenInDrawer = diagPanelMemberId === member.id;

  return (
    <tr
      className={[
        styles.row,
        checked ? styles.rowChecked : '',
        isOpenInDrawer ? styles.rowActive : '',
      ].filter(Boolean).join(' ')}
      onClick={() => openDiagPanel(member.id)}
    >
      {/* ── Sticky left: checkbox ── */}
      <td
        className={`${styles.checkTd} ${styles.stickyLeft} ${styles.stickyCheck}`}
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={checked}
          onCheckedChange={() => selectHccMember(member.id)}
          aria-label={`Select ${member.name}`}
        />
      </td>

      {/* ── Sticky left: member identity (matches TOC .patientCell exactly) ── */}
      <td className={`${styles.memberTd} ${styles.stickyLeft} ${styles.stickyMember} ${styles.colMember}`}>
        <div className={styles.patientCell}>
          <Avatar variant="patient" initials={member.in} />
          <div>
            <div className={styles.patientName}>
              <span className={styles.patientNameLink}>{member.name}</span>{' '}
              <span className={styles.patientDemo}>({member.g}&bull;{member.age})</span>
            </div>
            <div className={styles.patientMeta}>
              {member.memberId} &bull;{' '}
              <span className={styles.langBadge}>
                {(member.language || 'en').toUpperCase()}
                <span className={styles.langTooltip}>Preferred Language: English</span>
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* ── 1. Last Visit ── */}
      <td className={styles.colLastVisit}>
        <LastVisitCell dos={member.dos} visits={member.visits} />
      </td>

      {/* ── 2. Open ICDs ── */}
      <td className={styles.colOpen} onClick={(e) => e.stopPropagation()}>
        <OpenIcdsCell
          count={member.open}
          memberName={member.name}
          onOpen={() => openDiagPanel(member.id)}
        />
      </td>

      {/* ── 3. Create Date ── */}
      <td className={styles.colDate}>
        <CreateDateCell date={member.date} due={member.due} dueCol={member.dueCol} />
      </td>

      {/* ── 4. HCC Evidence ── */}
      <td className={styles.colEvidence}>
        <HccEvidenceCell count={member.ch} docStatus={member.docStatus || []} />
      </td>

      {/* ── 5–9. Role columns: Support Team, Coder, Reviewer 1/2/3 ── */}
      <td className={styles.colRole}><RoleStatusCell name={member.sup} status={member.supS} /></td>
      <td className={styles.colRole}><RoleStatusCell name={member.cdr} status={member.cdrS} /></td>
      <td className={styles.colRole}><RoleStatusCell name={member.r1}  status={member.r1s}  /></td>
      <td className={styles.colRole}><RoleStatusCell name={member.r2}  status={member.r2s}  /></td>
      <td className={styles.colRole}><RoleStatusCell name={member.r3}  status={member.r3s}  /></td>

      {/* ── 10. Rendering Provider ── */}
      <td className={styles.colProvider}>
        <span className={styles.providerText}>{member.rp}</span>
      </td>

      {/* ── 11. POS Code ── */}
      <td className={styles.colPos}>
        {member.pos ? (
          <span className={styles.posBadge}>{member.pos}</span>
        ) : <span className={styles.muted}>—</span>}
      </td>

      {/* ── 12. POS Description ── */}
      <td className={styles.colPosDesc}>
        <span className={styles.codeText}>{member.posDesc}</span>
      </td>

      {/* ── 13. RAF Score ── */}
      <td className={styles.colRaf}>
        <span className={styles.numText}>{member.raf}</span>
      </td>

      {/* ── 14. RAF Impact ── */}
      <td className={styles.colRi}>
        <RafImpactCell value={member.ri} ru={member.ru} />
      </td>

      {/* ── 15. IPA ── */}
      <td className={styles.colIpa}>
        <span className={styles.codeText}>{member.ipa}</span>
      </td>

      {/* ── 16. HP Code ── */}
      <td className={styles.colHp}>
        <span className={styles.codeText}>{member.hp}</span>
      </td>

      {/* ── 17. PCP ── */}
      <td className={styles.colPcp}>
        <span className={styles.providerText}>{member.pcp}</span>
      </td>

      {/* ── 18. Decile ── */}
      <td className={styles.colDec}>
        <span className={styles.numText}>{member.dec}</span>
      </td>

      {/* ── 19. Cohort ── */}
      <td className={styles.colCoh}>
        <span className={styles.codeText}>{member.coh}</span>
      </td>

      {/* ── 20. Risk Level ── */}
      <td className={styles.colRl}>
        {member.rl
          ? <Badge variant={RISK_VARIANT[member.rl] || 'toc-new'} label={member.rl} />
          : <span className={styles.muted}>—</span>}
      </td>

      {/* ── 21. Advillness ── */}
      <td className={styles.colAd}>
        <span className={styles.numText}>{member.ad}</span>
      </td>

      {/* ── 22. Frailty ── */}
      <td className={styles.colFr}>
        <span className={styles.numText}>{member.fr}</span>
      </td>

      {/* ── Sticky right: actions ── */}
      <td className={`${styles.actionsCell} ${styles.stickyRight} ${styles.colActions}`}>
        <ActionButton
          icon="solar:menu-dots-bold"
          size="L"
          tooltip="More (coming soon)"
          onClick={(e) => e.stopPropagation()}
        />
      </td>
    </tr>
  );
}
