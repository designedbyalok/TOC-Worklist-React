import { useAppStore } from '../../store/useAppStore';
import { Avatar } from '../../components/Avatar/Avatar';
import { Badge } from '../../components/Badge/Badge';
import { Checkbox } from '../../components/ui/checkbox';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import styles from './HccWorklistRow.module.css';

// Map HCC role status → our Badge variant
const STATUS_VARIANT = {
  Completed: 'status-completed',
  'In Progress': 'status-scheduled',
  New: 'status-queued',
  Assign: 'toc-new',
  Awaiting: 'toc-new',
  'Records Requested': 'status-queued',
  'Records Received': 'status-completed',
  Insufficient: 'status-failed',
  Rejected: 'status-failed',
  Returned: 'status-failed',
  Missed: 'toc-new',
  Skipped: 'toc-new',
  Accepted: 'status-completed',
  Dismissed: 'toc-new',
  Billed: 'status-completed',
};

const RISK_VARIANT = { High: 'lace-high', Medium: 'lace-medium', Low: 'lace-low' };

function RoleStatusCell({ name, status }) {
  if (!status || status === 'Assign') {
    return <span className={styles.assignText}>Assign</span>;
  }
  return (
    <div className={styles.roleCell}>
      {name && <span className={styles.roleName}>{name}</span>}
      <Badge variant={STATUS_VARIANT[status] || 'toc-new'} label={status} />
    </div>
  );
}

function DosCell({ dos, labelColor, dueLabel }) {
  if (!dos) return <span className={styles.muted}>—</span>;
  return (
    <div className={styles.dosCell}>
      <span className={styles.dosDate}>{dos}</span>
      {dueLabel && (
        <span className={styles.dosLabel} style={{ color: labelColor }}>
          <span className={styles.dosDot} style={{ background: labelColor }} />
          {dueLabel}
        </span>
      )}
    </div>
  );
}

function ChartCell({ count, docStatus }) {
  if (count == null) return <span className={styles.muted}>—</span>;
  return (
    <div className={styles.chartCell}>
      <span className={styles.chartCount}>{count}</span>
      <div className={styles.docDots}>
        {docStatus.map((s, i) => (
          <span
            key={i}
            className={[
              styles.docDot,
              s === 'passed' ? styles.docDotPass : s === 'failed' ? styles.docDotFail : styles.docDotPend,
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  );
}

export function HccWorklistRow({ member }) {
  const selectedHccIds = useAppStore(s => s.selectedHccIds);
  const selectHccMember = useAppStore(s => s.selectHccMember);
  const checked = selectedHccIds.includes(member.id);

  const firstDos = member.dos_list?.[0];
  const dueLabel = firstDos?.label;

  return (
    <tr className={checked ? styles.rowChecked : ''}>
      <td className={`${styles.memberCell} ${styles.stickyLeft} ${styles.colMember}`}>
        <div className={styles.memberInner}>
          <Checkbox
            checked={checked}
            onCheckedChange={() => selectHccMember(member.id)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${member.name}`}
          />
          <Avatar initials={member.in} />
          <div className={styles.memberIdentity}>
            <div className={styles.memberName}>{member.name}</div>
            <div className={styles.memberMeta}>
              {member.g} &middot; {member.age}
              {member.visits ? ` · ${member.visits}` : ''}
            </div>
          </div>
        </div>
      </td>

      <td className={styles.colDos}>
        <DosCell
          dos={member.dos}
          labelColor={firstDos?.labelColor}
          dueLabel={dueLabel}
        />
      </td>

      <td className={styles.colOpen}>
        {member.open != null
          ? <Badge variant="ai-care" label={String(member.open)} />
          : <span className={styles.muted}>—</span>}
      </td>

      <td className={styles.colDate}>
        <span className={styles.dateText}>{member.date}</span>
      </td>

      <td className={styles.colChart}>
        <ChartCell count={member.ch} docStatus={member.docStatus || []} />
      </td>

      <td className={styles.colRole}><RoleStatusCell name={member.sup} status={member.supS} /></td>
      <td className={styles.colRole}><RoleStatusCell name={member.cdr} status={member.cdrS} /></td>
      <td className={styles.colRole}><RoleStatusCell name={member.r1} status={member.r1s} /></td>
      <td className={styles.colRole}><RoleStatusCell name={member.r2} status={member.r2s} /></td>
      <td className={styles.colRole}><RoleStatusCell name={member.r3} status={member.r3s} /></td>

      <td className={styles.colRp}><span className={styles.providerText}>{member.rp}</span></td>
      <td className={styles.colVt}>
        {member.vt ? <Badge variant="toc-new" label={member.vt} /> : <span className={styles.muted}>—</span>}
      </td>

      <td className={styles.colRaf}><span className={styles.numStrong}>{member.raf}</span></td>
      <td className={styles.colRi}><span className={styles.numText}>{member.ri}</span></td>
      <td className={styles.colIpa}><span className={styles.codeText}>{member.ipa}</span></td>
      <td className={styles.colHp}><span className={styles.codeText}>{member.hp}</span></td>
      <td className={styles.colPcp}><span className={styles.providerText}>{member.pcp}</span></td>
      <td className={styles.colDec}><span className={styles.numText}>{member.dec}</span></td>
      <td className={styles.colCoh}>
        <Badge variant={member.coh === 'HCC' ? 'ai-care' : 'toc-new'} label={member.coh} />
      </td>
      <td className={styles.colRl}>
        {member.rl ? <Badge variant={RISK_VARIANT[member.rl] || 'toc-new'} label={member.rl} /> : <span className={styles.muted}>—</span>}
      </td>
      <td className={styles.colAd}><span className={styles.numText}>{member.ad}</span></td>
      <td className={styles.colFr}><span className={styles.numText}>{member.fr}</span></td>

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
