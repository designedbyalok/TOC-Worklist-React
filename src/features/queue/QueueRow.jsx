import { useState, useRef } from 'react';
import { Icon } from '../../components/Icon/Icon';
import { Avatar } from '../../components/Avatar/Avatar';
import { Badge } from '../../components/Badge/Badge';
import { useAppStore } from '../../store/useAppStore';
import rowStyles from '../worklist/WorklistRow.module.css';
import styles from './QueueRow.module.css';

const LANG_MAP = { en: 'English', es: 'Spanish', zh: 'Chinese', yue: 'Cantonese' };

const AI_VARIANT_MAP = {
  'ai-tag-risk': 'ai-risk',
  'ai-tag-care': 'ai-care',
  'ai-tag-social': 'ai-social',
  'ai-tag-med': 'ai-med',
  'ai-tag-neutral': 'ai-neutral',
};

function TocStatusBadge({ status }) {
  const MAP = {
    enrolled: { variant: 'toc-enrolled', label: 'Enrolled', icon: 'solar:check-circle-bold' },
    engaged: { variant: 'toc-engaged', label: 'Engaged', icon: 'solar:link-round-bold' },
    attempted: { variant: 'toc-attempted', label: 'Attempted', icon: 'solar:history-bold' },
    new: { variant: 'toc-new', label: 'New', icon: 'solar:star-bold' },
    oncall: { variant: 'toc-oncall', label: 'On Call', icon: 'solar:phone-calling-bold' },
  };
  const cfg = MAP[status] || MAP.new;
  return <Badge variant={cfg.variant} label={cfg.label} icon={cfg.icon} />;
}

function StatusCell({ patient: p }) {
  const { status, goals, goalsDetail, attempts, scheduledTime, callDuration } = p;
  if (status === 'completed') {
    const pct = goals ? Math.round((goals.met / goals.total) * 100) : 0;
    return (
      <div className={styles.statusCompact}>
        <Badge variant="status-completed" label="Completed" icon="solar:check-circle-bold" />
        {goals && (
          <div className={styles.goalsPill}>
            <div className={styles.goalsFill}>
              <div className={styles.goalsFillInner} style={{ width: `${pct}%` }} />
            </div>
            <span className={styles.goalsText}>{goals.met}/{goals.total}</span>
          </div>
        )}
      </div>
    );
  }
  if (status === 'oncall') {
    return (
      <div className={styles.statusCompact}>
        <Badge
          variant="status-oncall"
          label={callDuration || '00:00'}
          icon="solar:phone-calling-bold"
          dot={false}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
        >
          <span className={styles.oncallPulse} />
        </Badge>
      </div>
    );
  }
  if (status === 'scheduled') {
    return (
      <div className={styles.statusCompact}>
        <Badge variant="status-scheduled" label="Scheduled" icon="solar:calendar-bold" />
        {scheduledTime && <div className={styles.scheduledSub}>{scheduledTime.split(' ')[0]}</div>}
      </div>
    );
  }
  if (status === 'queued') {
    return (
      <div className={styles.statusCompact}>
        <Badge variant="status-queued" label="Queued" icon="solar:clock-circle-bold" />
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className={styles.statusCompact}>
        <Badge variant="status-failed" label="Failed" icon="solar:close-circle-bold" />
        {attempts?.length > 0 && (
          <div className={styles.attemptsWrapper}>
            <span className={styles.attemptsBadge}>
              <Icon name="solar:history-bold" size={14} />
              {attempts.length} att.
            </span>
          </div>
        )}
      </div>
    );
  }
  if (status === 'review') {
    return <Badge variant="status-review" label="Review" icon="solar:danger-triangle-bold" />;
  }
  return <span style={{ fontSize: 13, color: 'var(--neutral-200)' }}>—</span>;
}

function NextActionCell({ patient: p }) {
  const showToast = useAppStore(s => s.showToast);
  if (p.nextAction === '__MED_REVIEW__') {
    return (
      <div>
        <div className={styles.medDone}>
          <Icon name="solar:check-circle-bold" size={13} /> Agent tasks done
        </div>
        <a className={styles.medLink} onClick={() => showToast('Opening Medication Reconciliation…')}>
          <Icon name="solar:pill-bold" size={12} /> Review Med. Reconciliation →
        </a>
      </div>
    );
  }
  return <div className={styles.nextAction}>{p.nextAction || '—'}</div>;
}

function AiInsightsCell({ insights }) {
  if (!insights?.length) return <span style={{ color: 'var(--neutral-200)' }}>—</span>;
  const MAX_VISIBLE = 2;
  const visible = insights.slice(0, MAX_VISIBLE);
  const overflow = insights.slice(MAX_VISIBLE);
  return (
    <div className={styles.aiCell}>
      {visible.map((t, i) => (
        <Badge key={i} variant={AI_VARIANT_MAP[t.cls] || 'ai-neutral'} label={t.label} icon={t.icon} />
      ))}
      {overflow.length > 0 && (
        <span className={styles.aiOverflowBadge}>+{overflow.length}</span>
      )}
    </div>
  );
}

export function QueueRow({ patient }) {
  const openWorkflow = useAppStore(s => s.openWorkflow);
  const openCallPopover = useAppStore(s => s.openCallPopover);
  const showToast = useAppStore(s => s.showToast);
  const callBtnRef = useRef(null);

  const p = patient;
  const outreachBadgeVariant = p.outreachType === '48h' ? 'outreach-48h' : 'outreach-7d';

  const handleRowClick = () => openWorkflow(p.id);
  const handleCallClick = (e) => {
    e.stopPropagation();
    openCallPopover(p.id, callBtnRef);
  };

  const tdBase = {
    padding: '10px 14px',
    fontSize: 14,
    fontWeight: 400,
    color: 'var(--neutral-400)',
    verticalAlign: 'middle',
  };

  return (
    <tr style={{ borderBottom: '1px solid var(--neutral-150)', transition: 'background .1s', cursor: 'pointer' }}
      onClick={handleRowClick}
      onMouseOver={e => e.currentTarget.style.background = 'var(--primary-25)'}
      onMouseOut={e => e.currentTarget.style.background = ''}
    >
      <td style={{ ...tdBase, width: 36, padding: '8px 10px', position: 'sticky', left: 0, zIndex: 3, background: 'var(--neutral-0)' }}
        onClick={e => e.stopPropagation()}>
        <input type="checkbox" />
      </td>
      <td style={{ ...tdBase, padding: '8px 12px', position: 'sticky', left: 36, zIndex: 3, background: 'var(--neutral-0)', borderRight: '1px solid var(--neutral-150)' }}>
        <div className={rowStyles.patientCell}>
          <Avatar variant="patient" initials={p.initials} />
          <div>
            <div className={rowStyles.patientName}>{p.name} <span className={rowStyles.patientDemo}>({p.gender}•{p.age})</span></div>
            <div className={rowStyles.patientMeta}>
              {p.memberId} •{' '}
              <span className={rowStyles.langBadge}>
                {(p.language || 'en').toUpperCase()}
                <span className={rowStyles.langTooltip}>Preferred Language: {LANG_MAP[p.language] || 'English'}</span>
              </span>
            </div>
          </div>
        </div>
      </td>
      <td style={tdBase}><Badge variant={`lace-${p.lace.toLowerCase()}`} label={p.lace} /></td>
      <td style={tdBase}>
        <div className={rowStyles.outreachCell}>
          <Badge variant={outreachBadgeVariant} label={`TOC ${p.outreachType}`} />
          {p.onCall ? (
            <span className={rowStyles.outreachOncall}>
              <Icon name="solar:phone-calling-bold" size={14} />
              On Call: {p.callDuration}
            </span>
          ) : (
            <span className={rowStyles.outreachTime}>
              <Icon name="solar:clock-circle-linear" size={14} />
              {p.outreachLeft}
            </span>
          )}
        </div>
      </td>
      {/* Agent columns */}
      <td className={styles.agentColTd} style={{ background: 'var(--agent-col-bg)', borderLeft: '2px solid var(--primary-200)' }}>
        <StatusCell patient={p} />
      </td>
      <td className={styles.agentColTd} style={{ background: 'var(--agent-col-bg)' }}>
        <NextActionCell patient={p} />
      </td>
      <td className={styles.agentColTd} style={{ background: 'var(--agent-col-bg)', borderRight: '2px solid var(--primary-200)' }}>
        <AiInsightsCell insights={p.aiInsights} />
      </td>
      <td style={tdBase}><TocStatusBadge status={p.tocStatus} /></td>
      <td style={tdBase}><span style={{ fontSize: 14, color: 'var(--neutral-400)', whiteSpace: 'nowrap' }}>{p.dueOn || '—'}</span></td>
      <td style={tdBase}><span style={{ fontSize: 14, color: 'var(--neutral-400)', whiteSpace: 'nowrap' }}>{p.nextOutreach || '—'}</span></td>
      <td style={tdBase}><span style={{ fontSize: 14, color: 'var(--neutral-400)', whiteSpace: 'nowrap' }}>{p.startDate || '—'}</span></td>
      <td style={tdBase}><span style={{ fontSize: 14, color: 'var(--neutral-400)', whiteSpace: 'nowrap' }}>{p.lastAdmission || '—'}</span></td>
      <td style={tdBase}>
        <div className={rowStyles.assigneeCell}>
          <Avatar variant="assignee" initials={p.assigneeInitials} />
          <span style={{ fontSize: 13 }}>{p.assignee}</span>
        </div>
      </td>
      <td style={tdBase}>{p.readmission === 'Yes' ? <Badge variant="yes" label="Yes" /> : <Badge variant="no" label="No" />}</td>
      <td style={tdBase}>
        <div className={rowStyles.tasksCell}>
          {p.tasks > 0 ? <span className={rowStyles.taskBadge}>{p.tasks}</span> : <span className={rowStyles.dateDash}>—</span>}
        </div>
      </td>
      <td style={tdBase}>
        {p.carePlanStatus === 'updated' ? (
          <Badge variant="care-plan-updated" label="Updated" icon="solar:check-circle-bold" />
        ) : p.carePlanStatus === 'pending' ? (
          <Badge variant="care-plan-pending" label="Pending" icon="solar:clock-circle-bold" />
        ) : (
          <Badge variant="care-plan-none" label="No Care Plan" />
        )}
      </td>
      <td style={{ ...tdBase, position: 'sticky', right: 0, background: 'var(--neutral-0)', borderLeft: '1px solid var(--neutral-150)', boxShadow: '-4px 0 8px rgba(0,0,0,.04)' }}
        onClick={e => e.stopPropagation()}>
        <div className={rowStyles.actionsCell}>
          <button className={rowStyles.actionBtn} title="View details" onClick={() => openWorkflow(p.id)}>
            <Icon name="solar:document-text-linear" size={18} />
          </button>
          <button
            ref={callBtnRef}
            className={[rowStyles.actionBtn, p.status === 'oncall' ? rowStyles.oncall : p.status === 'queued' ? rowStyles.queuedCall : ''].filter(Boolean).join(' ')}
            title="Call patient"
            onClick={handleCallClick}
          >
            <Icon name="solar:phone-outline" size={18} />
            {p.status === 'oncall' && <span className={rowStyles.callLiveDot} />}
          </button>
          <button className={rowStyles.actionBtn} title="More options" onClick={e => { e.stopPropagation(); showToast('More options – coming soon'); }}>
            <Icon name="solar:menu-dots-linear" size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
