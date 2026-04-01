import { useMemo, useState } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { Badge } from '../../../components/Badge/Badge';
import { Button } from '../../../components/Button/Button';
import { ActionButton } from '../../../components/ActionButton/ActionButton';
import { useAppStore } from '../../../store/useAppStore';
import { CardSkeleton, SimpleTableSkeleton } from '../../../components/Skeleton/CardSkeleton';
import { ConfirmDialog } from '../../../components/Modal/ConfirmDialog';
import s from './GoalsPanel.module.css';

const PROGRAM_VARIANT = { purple: 'ai-care', blue: 'outreach-appointment', amber: 'outreach-care-gap' };
const STATUS_VARIANT = { active: 'status-completed', draft: 'status-queued' };

function GoalCard({ goal, onOpen, onEdit }) {
  const totalScore = goal.steps.reduce((a, st) => a + (st.score || 0), 0);

  return (
    <div className={s.card} onClick={() => onOpen(goal.id)}>
      <div className={s.cardTop}>
        <div className={s.cardTopLeft}>
          <Badge variant={PROGRAM_VARIANT[goal.programColor] || 'ai-care'} label={goal.program} />
          {goal.weightedScoring && <Badge variant="compliance-warn" label="Scored" icon="solar:chart-linear" />}
        </div>
        <Badge variant={STATUS_VARIANT[goal.status] || 'status-completed'} label={goal.status === 'active' ? 'Active' : 'Draft'} />
      </div>
      <div className={s.cardTitle}>{goal.name}</div>
      <div className={s.cardDesc}>{goal.description}</div>
      <div className={s.cardSteps}>
        {goal.steps.map(st => (
          <Badge
            key={st.id}
            variant={st.type === 'mandatory' ? 'compliance-pass' : 'compliance-warn'}
            label={st.name}
          />
        ))}
      </div>
      <div className={s.cardFooter}>
        <div className={s.cardStat}>
          <div className={s.cardStatVal}>{goal.completionRate}%</div>
          <div className={s.cardStatLabel}>Completion</div>
        </div>
        <div className={s.cardStat}>
          <div className={`${s.cardStatVal} ${goal.totalRuns === 0 ? s.cardStatValAmber : ''}`}>
            {goal.totalRuns > 0 ? goal.totalRuns.toLocaleString() : '—'}
          </div>
          <div className={s.cardStatLabel}>Runs</div>
        </div>
        <div className={s.cardStat}>
          {goal.weightedScoring ? (
            <>
              <div className={s.cardStatVal} style={{ fontSize: 12 }}>
                {goal.passingScore}<span style={{ fontSize: 10, color: 'var(--neutral-200)' }}>/{totalScore}pt</span>
              </div>
              <div className={s.cardStatLabel}>Threshold</div>
            </>
          ) : (
            <>
              <div className={s.cardStatVal}>{goal.steps.length}</div>
              <div className={s.cardStatLabel}>Steps</div>
            </>
          )}
        </div>
        <Button variant="secondary" size="S" onClick={(e) => { e.stopPropagation(); onEdit(goal.id); }}>Edit</Button>
      </div>
    </div>
  );
}

function GoalsTable({ goals, onOpen, onEdit, onDelete }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const thStyle = {
    padding: '8px 16px', fontSize: 12, fontWeight: 500, color: 'var(--neutral-300)',
    textAlign: 'left', whiteSpace: 'nowrap', borderBottom: '1px solid var(--neutral-150)',
    background: 'var(--neutral-0)', position: 'sticky', top: 0,
  };
  const tdStyle = { padding: '10px 16px', fontSize: 14, color: 'var(--neutral-400)', verticalAlign: 'middle' };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await onDelete(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Inter', sans-serif" }}>
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Program</th>
            <th style={thStyle}>Steps</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Completion</th>
            <th style={thStyle}>Runs</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {goals.map(g => {
            const mc = g.steps.filter(st => st.type === 'mandatory').length;
            const cc = g.steps.filter(st => st.type === 'conditional').length;
            const pct = g.completionRate;
            return (
              <tr key={g.id} onClick={() => onOpen(g.id)}
                style={{ borderBottom: '1px solid #EAECF0', cursor: 'pointer', transition: 'background .1s' }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--primary-25)'}
                onMouseOut={e => e.currentTarget.style.background = ''}
              >
                <td style={tdStyle}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--neutral-500)', marginBottom: 2 }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--neutral-200)', maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.description}</div>
                </td>
                <td style={tdStyle}><Badge variant={PROGRAM_VARIANT[g.programColor] || 'ai-care'} label={g.program} /></td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', maxWidth: 80 }}>
                    {g.steps.map(st => (
                      <span key={st.id} style={{ width: 7, height: 7, borderRadius: '50%', display: 'inline-block', background: st.type === 'mandatory' ? 'var(--status-success)' : 'var(--status-warning)' }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--neutral-200)', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{mc}M · {cc}C</div>
                </td>
                <td style={tdStyle}>
                  <Badge variant={STATUS_VARIANT[g.status] || 'status-completed'} label={g.status === 'active' ? 'Active' : 'Draft'} />
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ background: 'var(--neutral-50)', borderRadius: 20, height: 4, width: 64, overflow: 'hidden', display: 'inline-block', verticalAlign: 'middle' }}>
                      <div style={{ height: '100%', borderRadius: 20, background: pct < 50 ? 'var(--status-warning)' : 'var(--status-success)', width: `${pct}%` }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: pct < 50 ? 'var(--status-warning)' : 'var(--status-success)' }}>{pct}%</span>
                  </div>
                </td>
                <td style={{ ...tdStyle, fontVariantNumeric: 'tabular-nums', fontSize: 13, color: 'var(--neutral-300)' }}>
                  {g.totalRuns > 0 ? g.totalRuns.toLocaleString() : '—'}
                </td>
                <td style={tdStyle} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ActionButton icon="solar:pen-linear" size="L" tooltip="Edit goal"
                      onClick={() => onEdit(g.id)} />
                    <span style={{ width: 1, height: 16, background: 'var(--neutral-150)', flexShrink: 0 }} />
                    <ActionButton icon="solar:trash-bin-minimalistic-linear" size="L" tooltip="Delete goal"
                      onClick={() => setDeleteTarget(g)} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {deleteTarget && (
        <ConfirmDialog
          icon="solar:danger-triangle-linear"
          iconColor="var(--status-error)"
          title={`Delete "${deleteTarget.name}"`}
          description="Are you sure you want to delete this goal? All steps, success criteria, and run history will be permanently removed. This action cannot be undone."
          confirmLabel="Delete Goal"
          cancelLabel="Cancel"
          variant="error"
          loading={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
}

export function GoalsPanel({ searchQuery = '', filter = 'all', viewMode = 'grid' }) {
  const goalsData = useAppStore(st => st.goalsData);
  const goalsLoading = useAppStore(st => st.goalsLoading);
  const setGoalDetailId = useAppStore(st => st.setGoalDetailId);
  const setGoalWizard = useAppStore(st => st.setGoalWizard);
  const deleteGoal = useAppStore(st => st.deleteGoal);
  const showToast = useAppStore(st => st.showToast);

  const handleDelete = async (id) => {
    await deleteGoal(id);
    showToast('Goal deleted');
  };

  const filtered = useMemo(() => {
    let result = goalsData || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g => g.name.toLowerCase().includes(q) || g.program.toLowerCase().includes(q) || g.description.toLowerCase().includes(q));
    }
    if (filter !== 'all') {
      result = result.filter(g => g.status === filter || g.program === filter);
    }
    return result;
  }, [goalsData, searchQuery, filter]);

  if (goalsLoading) {
    return viewMode === 'table' ? <SimpleTableSkeleton rows={5} cols={7} /> : <CardSkeleton count={4} />;
  }

  if (filtered.length === 0) {
    return (
      <div className={s.empty}>
        <div className={s.emptyIcon}><Icon name="solar:target-linear" size={40} color="var(--neutral-200)" /></div>
        <div className={s.emptyTitle}>No goals found</div>
        <div className={s.emptyDesc}>Adjust filters or create a new goal.</div>
      </div>
    );
  }

  if (viewMode === 'table') {
    return <GoalsTable goals={filtered} onOpen={setGoalDetailId} onEdit={(id) => setGoalWizard(true, id)} onDelete={handleDelete} />;
  }

  return (
    <div className={s.grid}>
      {filtered.map(g => (
        <GoalCard key={g.id} goal={g} onOpen={setGoalDetailId} onEdit={(id) => setGoalWizard(true, id)} />
      ))}
    </div>
  );
}
