import { Icon } from '../../../components/Icon/Icon';
import { Badge } from '../../../components/Badge/Badge';
import { Drawer } from '../../../components/Drawer/Drawer';
import { useAppStore } from '../../../store/useAppStore';
// No local fallback — data loaded from DB via store
import s from './GoalsPanel.module.css';

export function GoalDetailDrawer() {
  const goalDetailId = useAppStore(st => st.goalDetailId);
  const setGoalDetailId = useAppStore(st => st.setGoalDetailId);
  const setGoalWizard = useAppStore(st => st.setGoalWizard);
  const showToast = useAppStore(st => st.showToast);
  const goalsData = useAppStore(st => st.goalsData) || [];
  const addGoal = useAppStore(st => st.addGoal);
  const deleteGoal = useAppStore(st => st.deleteGoal);

  const goal = goalsData.find(g => g.id === goalDetailId);
  if (!goal) return null;

  const mc = goal.steps.filter(st => st.type === 'mandatory').length;
  const cc = goal.steps.filter(st => st.type === 'conditional').length;
  const totalScore = goal.steps.reduce((a, st) => a + (st.score || 0), 0);

  const handleEdit = () => {
    setGoalDetailId(null);
    setTimeout(() => setGoalWizard(true, goal.id), 200);
  };

  const handleDuplicate = () => {
    const newGoal = {
      ...JSON.parse(JSON.stringify(goal)),
      id: Date.now(),
      name: goal.name + ' (Copy)',
      status: 'draft',
      completionRate: 0,
      totalRuns: 0,
      created: new Date().toISOString().slice(0, 10),
    };
    addGoal(newGoal);
    setGoalDetailId(null);
    showToast('Goal duplicated as draft');
  };

  const handleDelete = async () => {
    await deleteGoal(goal.id);
    setGoalDetailId(null);
    showToast('Goal deleted');
  };

  const headerRight = (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button className={`${s.footerBtn} ${s.footerBtnGhost}`} onClick={handleDelete}
        style={{ color: '#D72825' }}>
        <Icon name="solar:trash-bin-minimalistic-linear" size={14} color="#D72825" /> Delete
      </button>
      <button className={`${s.footerBtn} ${s.footerBtnGhost}`} onClick={handleDuplicate}>
        <Icon name="solar:copy-linear" size={14} /> Duplicate
      </button>
      <button className={`${s.footerBtn} ${s.footerBtnGhost}`} onClick={handleEdit}>
        <Icon name="solar:pen-linear" size={14} /> Edit
      </button>
    </div>
  );

  return (
    <Drawer
      title={goal.name}
      onClose={() => setGoalDetailId(null)}
      headerRight={headerRight}
    >
      {/* Weighted Scoring Banner */}
      {goal.weightedScoring && (
        <div className={s.warnBox}>
          <Icon name="solar:chart-linear" size={14} />
          <div>
            <strong>Weighted Scoring</strong> — Pass threshold: <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{goal.passingScore}/{totalScore}pt</strong> ({Math.round((goal.passingScore / totalScore) * 100)}%)
          </div>
        </div>
      )}

      {/* Info */}
      <div className={s.infoBox}>
        <Icon name="solar:info-circle-linear" size={14} />
        <span>Requires <strong style={{ color: '#009B53' }}>{mc} mandatory</strong> step{mc !== 1 ? 's' : ''}{cc ? ` + ${cc} conditional` : ''}</span>
      </div>

      {/* Stats */}
      <div className={s.detailStats}>
        <div className={s.detailStat}>
          <div className={s.detailStatVal}>{goal.completionRate}%</div>
          <div className={s.detailStatLabel}>Completion</div>
        </div>
        <div className={s.detailStat}>
          <div className={s.detailStatVal} style={{ color: 'var(--neutral-500)' }}>{goal.totalRuns.toLocaleString()}</div>
          <div className={s.detailStatLabel}>Runs</div>
        </div>
        <div className={s.detailStat}>
          <div className={s.detailStatVal} style={{ color: 'var(--neutral-500)' }}>{goal.agents.length}</div>
          <div className={s.detailStatLabel}>Agents</div>
        </div>
      </div>

      {/* Steps Timeline */}
      <div className={s.sectionTitle}>
        <Icon name="solar:clipboard-list-linear" size={14} color="var(--primary-300)" />
        Steps
      </div>
      <div className={s.stepTimeline}>
        {goal.steps.map((step, i) => (
          <div key={step.id} className={s.stepTimelineItem}>
            <div className={`${s.stepIcon} ${step.type === 'mandatory' ? s.stepIconMandatory : s.stepIconConditional}`}>
              {step.type === 'mandatory' ? <Icon name="solar:check-circle-linear" size={14} /> : <Icon name="solar:alt-arrow-right-linear" size={14} />}
            </div>
            <div className={`${s.stepBody} ${step.type === 'mandatory' ? s.stepBodyMandatory : ''}`}>
              <div className={s.stepName}>
                <span>{i + 1}. {step.name}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {goal.weightedScoring && <span className={s.scoreChip}>{step.score}pt</span>}
                  <Badge
                    variant={step.type === 'mandatory' ? 'compliance-pass' : 'compliance-warn'}
                    label={step.type === 'mandatory' ? 'Mandatory' : 'Conditional'}
                  />
                </div>
              </div>
              <div className={s.stepNote}>{step.desc}</div>
              {step.condition && (
                <div className={s.stepCondition}>
                  <Icon name="solar:bolt-linear" size={10} /> {step.condition}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <hr className={s.divider} />

      {/* Success Criteria */}
      <div className={s.sectionTitle}>
        <Icon name="solar:check-circle-linear" size={14} color="#009B53" />
        Success Criteria
      </div>
      {goal.successMetrics.map((m, i) => (
        <div key={i} className={s.successItem}>
          <Icon name="solar:check-circle-linear" size={14} color="#009B53" /> {m}
        </div>
      ))}

      {/* Linked Agents */}
      {goal.agents.length > 0 && (
        <>
          <hr className={s.divider} />
          <div className={s.sectionTitle}>
            <Icon name="solar:bot-linear" size={14} color="var(--primary-300)" />
            Linked Agents
          </div>
          <div>
            {goal.agents.map(a => (
              <span key={a} className={s.agentChip}>
                <Icon name="solar:bot-linear" size={12} /> {a}
              </span>
            ))}
          </div>
        </>
      )}
    </Drawer>
  );
}
