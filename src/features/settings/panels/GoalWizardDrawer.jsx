import { useState } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { Badge } from '../../../components/Badge/Badge';
import { Drawer } from '../../../components/Drawer/Drawer';
import { useAppStore } from '../../../store/useAppStore';
import { Switch } from '../../../components/Switch/Switch';
import { GOAL_TEMPLATES } from '../../../data/goals'; // Templates are config, not DB data
import s from './GoalsPanel.module.css';

const WIZARD_LABELS = ['Describe', 'Configure', 'Steps', 'Review'];
const PROGRAMS = ['TCM', 'Outreach', 'Onboarding', 'Preventive', 'Billing'];
const MODES = [
  { value: 'all-mandatory', label: 'All mandatory required' },
  { value: 'sequential', label: 'Sequential order' },
  { value: 'any', label: 'Any step sufficient' },
];

export function GoalWizardDrawer() {
  const goalWizardOpen = useAppStore(st => st.goalWizardOpen);
  const goalWizardEditId = useAppStore(st => st.goalWizardEditId);
  const setGoalWizard = useAppStore(st => st.setGoalWizard);
  const addGoal = useAppStore(st => st.addGoal);
  const updateGoal = useAppStore(st => st.updateGoal);
  const showToast = useAppStore(st => st.showToast);
  const goalsData = useAppStore(st => st.goalsData) || [];

  const editGoal = goalWizardEditId ? goalsData.find(g => g.id === goalWizardEditId) : null;

  const [step, setStep] = useState(editGoal ? 1 : 0);
  const [name, setName] = useState(editGoal?.name || '');
  const [program, setProgram] = useState(editGoal?.program || 'TCM');
  const [mode, setMode] = useState(editGoal?.mode || 'all-mandatory');
  const [desc, setDesc] = useState(editGoal?.description || '');
  const [nlInput, setNlInput] = useState('');
  const [steps, setSteps] = useState(editGoal?.steps?.map(st => ({ ...st })) || []);
  const [metrics, setMetrics] = useState(editGoal?.successMetrics ? [...editGoal.successMetrics] : []);
  const [weighted, setWeighted] = useState(editGoal?.weightedScoring || false);
  const [passingScore, setPassingScore] = useState(editGoal?.passingScore || 100);
  const [showAddStep, setShowAddStep] = useState(false);
  const [newStep, setNewStep] = useState({ name: '', type: 'mandatory', score: 10, desc: '', condition: '' });
  const [newMetric, setNewMetric] = useState('');
  const [nameError, setNameError] = useState(false);
  const [stepsError, setStepsError] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [editingStepIdx, setEditingStepIdx] = useState(null); // index of step being inline-edited

  if (!goalWizardOpen) return null;

  const isEdit = !!goalWizardEditId;
  const totalScore = steps.reduce((a, st) => a + (st.score || 0), 0);

  const close = () => { setGoalWizard(false, null); resetForm(); };

  const resetForm = () => {
    setStep(0); setName(''); setProgram('TCM'); setMode('all-mandatory');
    setDesc(''); setNlInput(''); setSteps([]); setMetrics([]);
    setWeighted(false); setPassingScore(100); setShowAddStep(false);
    setNewStep({ name: '', type: 'mandatory', score: 10, desc: '', condition: '' });
    setNewMetric(''); setNameError(false); setStepsError(false);
  };

  const goNext = () => {
    if (step === 0) { setStep(1); return; }
    if (step === 1) {
      if (!name.trim()) { setNameError(true); return; }
      setNameError(false); setStep(2); return;
    }
    if (step === 2) {
      if (!steps.length) { setStepsError(true); return; }
      setStepsError(false); setStep(3); return;
    }
    if (step === 3) { saveGoal('active'); return; }
  };

  const goBack = () => { if (step > 0) setStep(step - 1); };

  const saveGoal = (status) => {
    const goalObj = {
      id: isEdit ? goalWizardEditId : Date.now(),
      name: name.trim(),
      program,
      programColor: program === 'TCM' ? 'purple' : program === 'Outreach' ? 'blue' : 'amber',
      description: desc.trim(),
      status,
      weightedScoring: weighted,
      passingScore: weighted ? passingScore : 100,
      mode,
      steps: steps.map((st, i) => ({ ...st, id: st.id || `s${i}` })),
      successMetrics: metrics,
      agents: isEdit ? (editGoal?.agents || []) : [],
      completionRate: isEdit ? (editGoal?.completionRate || 0) : 0,
      totalRuns: isEdit ? (editGoal?.totalRuns || 0) : 0,
      created: isEdit ? (editGoal?.created || new Date().toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10),
    };
    if (isEdit) { updateGoal(goalObj); } else { addGoal(goalObj); }
    close();
    showToast(isEdit ? 'Goal updated' : `Goal ${status === 'draft' ? 'saved as draft' : 'published'}`);
  };

  const useTemplate = (key) => {
    const t = GOAL_TEMPLATES[key];
    if (!t) return;
    setName(t.name); setProgram(t.program); setMode(t.mode); setDesc(t.desc);
    setSteps(t.steps.map(st => ({ ...st, id: `s${Date.now()}_${Math.random().toString(36).slice(2,6)}` })));
    setMetrics(t.metrics || []);
    setStep(1);
  };

  const generateFromNL = () => {
    if (!nlInput.trim()) return;
    setAiGenerating(true);
    setTimeout(() => {
      // Simulate AI generation
      const generatedName = nlInput.trim().length > 50 ? nlInput.trim().slice(0, 50) + '...' : nlInput.trim();
      setName(generatedName);
      setDesc(nlInput.trim());
      setSteps([
        { id: `g${Date.now()}_1`, name: 'Patient Identification', type: 'mandatory', score: 20, desc: 'Verify patient identity and consent.', condition: null },
        { id: `g${Date.now()}_2`, name: 'Clinical Assessment', type: 'mandatory', score: 35, desc: 'Complete structured assessment per protocol.', condition: 'Requires: Patient Identified' },
        { id: `g${Date.now()}_3`, name: 'Documentation', type: 'mandatory', score: 30, desc: 'Record findings and update care plan.', condition: 'Requires: Assessment complete' },
        { id: `g${Date.now()}_4`, name: 'Follow-up Scheduling', type: 'conditional', score: 15, desc: 'Schedule next touchpoint if indicated.', condition: 'If follow-up needed' },
      ]);
      setMetrics(['All mandatory steps completed', 'Documentation submitted within 24 hours']);
      setAiGenerating(false);
      setStep(1);
    }, 1500);
  };

  const addStepItem = () => {
    if (!newStep.name.trim()) return;
    setSteps([...steps, { ...newStep, id: `s${Date.now()}_${Math.random().toString(36).slice(2,6)}` }]);
    setNewStep({ name: '', type: 'mandatory', score: 10, desc: '', condition: '' });
    setShowAddStep(false);
    setStepsError(false);
  };

  const removeStep = (idx) => { setSteps(steps.filter((_, i) => i !== idx)); setEditingStepIdx(null); };
  const updateStep = (idx, updates) => setSteps(steps.map((st, i) => i === idx ? { ...st, ...updates } : st));

  const addMetricItem = () => {
    if (!newMetric.trim()) return;
    setMetrics([...metrics, newMetric.trim()]);
    setNewMetric('');
  };

  const removeMetric = (idx) => setMetrics(metrics.filter((_, i) => i !== idx));

  // ── Stepper (Figma: square bordered number + label with line connector) ──
  const renderStepper = () => (
    <div className={s.stepper}>
      {WIZARD_LABELS.map((label, i) => (
        <div key={label} style={{ display: 'contents' }}>
          <div
            className={`${s.wizStep} ${i === step ? s.wizStepActive : i < step ? s.wizStepDone : ''}`}
            onClick={() => i <= step && setStep(i)}
          >
            <div className={s.wizStepNum}>{i < step ? <Icon name="solar:check-read-linear" size={12} /> : i + 1}</div>
            <span className={s.wizStepLabel}>{label}</span>
          </div>
          {i < WIZARD_LABELS.length - 1 && (
            <div className={`${s.wizConnector} ${i < step ? s.wizConnectorDone : ''}`} />
          )}
        </div>
      ))}
    </div>
  );

  // ── Page 0: Describe ──
  const renderDescribe = () => (
    <div className={step === 0 ? s.wizPageActive : s.wizPage}>
      <div className={s.sectionTitle}>
        <Icon name="solar:bot-linear" size={14} color="var(--primary-300)" />
        Describe Your Goal
      </div>
      <div className={s.nlBox}>
        <div className={s.nlBoxHeader}>
          <span className={s.nlBadge}>AI POWERED</span>
          <button className={`${s.footerBtn} ${s.footerBtnSecondary}`} style={{ padding: '4px 10px', fontSize: 11 }}
            onClick={() => setNlInput('Complete a post-discharge follow-up within 72 hours including identity verification, medication adherence check, symptom assessment, and scheduling based on severity.')}>
            Try Example
          </button>
        </div>
        <textarea
          value={nlInput}
          onChange={e => setNlInput(e.target.value)}
          placeholder="Describe what the agent should accomplish. Be specific about step order, mandatory requirements, and dependencies..."
        />
        <div className={s.nlBoxFooter}>
          <span className={s.nlHint}>AI will generate steps, scoring, and success criteria</span>
          <button className={`${s.footerBtn} ${s.footerBtnPrimary}`} style={{ padding: '5px 12px', fontSize: 12 }}
            onClick={generateFromNL} disabled={aiGenerating}>
            <Icon name="solar:magic-stick-3-linear" size={12} />
            {aiGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
      {!isEdit && (
        <>
          <div style={{ fontSize: 11, color: 'var(--neutral-200)', marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.04em' }}>
            Or start from a template
          </div>
          <div className={s.templateGrid}>
            {[
              { key: 'tcm', icon: 'solar:pill-linear', title: 'TCM Workflow', desc: 'Outreach → Medication → Symptom → Billing' },
              { key: 'outreach', icon: 'solar:phone-calling-linear', title: 'Patient Outreach', desc: 'Identify → Communicate → Schedule → Confirm' },
              { key: 'onboarding', icon: 'solar:smartphone-linear', title: 'App Onboarding', desc: 'Invite → Register → Walkthrough → First Action' },
              { key: 'monitoring', icon: 'solar:heart-pulse-linear', title: 'Chronic Monitoring', desc: 'Engage → Vitals → Medication → Alert' },
            ].map(t => (
              <div key={t.key} className={s.templateCard} onClick={() => useTemplate(t.key)}>
                <div className={s.templateCardTitle}><Icon name={t.icon} size={14} /> {t.title}</div>
                <div className={s.templateCardDesc}>{t.desc}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // ── Page 1: Configure ──
  const renderConfigure = () => (
    <div className={step === 1 ? s.wizPageActive : s.wizPage}>
      {isEdit && (
        <div className={s.warnBox}><Icon name="solar:pen-linear" size={14} /><span>Editing a published goal. Changes apply to new runs.</span></div>
      )}
      <div className={s.formGroup}>
        <div className={s.formLabel}>Goal Name <span className={s.formReq}>●</span></div>
        <input className={`${s.formInput} ${nameError ? s.formInputError : ''}`} value={name}
          onChange={e => { setName(e.target.value); setNameError(false); }}
          placeholder="e.g. TCM Full Program Completion" />
        {nameError && <div className={`${s.formError} ${s.formErrorVisible}`}>Goal name is required</div>}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div className={s.formGroup} style={{ flex: 1 }}>
          <div className={s.formLabel}>Program</div>
          <select className={s.formSelect} value={program} onChange={e => setProgram(e.target.value)}>
            {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className={s.formGroup} style={{ flex: 1 }}>
          <div className={s.formLabel}>Completion Mode</div>
          <select className={s.formSelect} value={mode} onChange={e => setMode(e.target.value)}>
            {MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>
      <div className={s.formGroup}>
        <div className={s.formLabel}>Description</div>
        <textarea className={s.formTextarea} value={desc} onChange={e => setDesc(e.target.value)}
          placeholder="What is this goal about?" />
      </div>
    </div>
  );

  // ── Page 2: Steps ──
  const renderSteps = () => (
    <div className={step === 2 ? s.wizPageActive : s.wizPage}>
      {/* Weighted Scoring Toggle */}
      <div className={`${s.scoringToggle} ${weighted ? s.scoringToggleEnabled : ''}`} onClick={() => setWeighted(!weighted)}>
        <div className={s.scoringToggleLabel}>
          <Icon name="solar:chart-linear" size={16} color="var(--primary-300)" />
          <div>
            <div className={s.scoringTitle}>Weighted Scoring</div>
            <div className={s.scoringSub}>Assign point values to steps and set a pass threshold</div>
          </div>
        </div>
        <Switch checked={weighted} onChange={() => setWeighted(!weighted)} />
      </div>
      {weighted && (
        <div className={s.thresholdRow}>
          <label>Pass Threshold</label>
          <input className={s.thresholdInput} type="number" min={1} max={1000} value={passingScore}
            onChange={e => setPassingScore(parseInt(e.target.value) || 0)} />
          <span style={{ fontSize: 11, color: 'var(--neutral-300)' }}>pts</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: totalScore > 0 ? 'var(--primary-300)' : 'var(--neutral-200)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
            Total: {totalScore}pt
          </span>
        </div>
      )}

      {/* Steps Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div className={s.sectionTitle} style={{ marginBottom: 2 }}>
            <Icon name="solar:clipboard-list-linear" size={14} color="var(--primary-300)" />
            Goal Steps
          </div>
          <div style={{ fontSize: 11, color: 'var(--neutral-200)' }}>
            <span style={{ color: 'var(--status-success)' }}>●</span> Mandatory <span style={{ color: 'var(--status-warning)' }}>●</span> Conditional
          </div>
        </div>
        <button className={`${s.footerBtn} ${s.footerBtnSecondary}`} style={{ padding: '5px 10px', fontSize: 12 }}
          onClick={() => setShowAddStep(true)}>
          + Add Step
        </button>
      </div>

      {/* Steps List */}
      {steps.map((st, i) => (
        editingStepIdx === i ? (
          /* Inline Edit Form */
          <div key={st.id || i} style={{ background: 'var(--neutral-50)', border: '0.5px solid var(--primary-200)', borderRadius: 8, padding: 12, marginBottom: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--primary-300)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.04em' }}>Edit Step {i + 1}</div>
            <div className={s.addStepRow}>
              <input className={s.formInput} value={st.name} style={{ flex: 2 }}
                onChange={e => updateStep(i, { name: e.target.value })} />
              <select className={s.formSelect} value={st.type} style={{ flex: 1 }}
                onChange={e => updateStep(i, { type: e.target.value })}>
                <option value="mandatory">Mandatory</option>
                <option value="conditional">Conditional</option>
              </select>
              {weighted && (
                <input className={s.thresholdInput} type="number" min={1} max={999} value={st.score} style={{ width: 50 }}
                  onChange={e => updateStep(i, { score: parseInt(e.target.value) || 0 })} />
              )}
            </div>
            <textarea className={s.formTextarea} style={{ minHeight: 52, marginBottom: 8 }} value={st.desc || ''}
              onChange={e => updateStep(i, { desc: e.target.value })} placeholder="Step description" />
            <input className={s.formInput} style={{ marginBottom: 8 }} value={st.condition || ''}
              onChange={e => updateStep(i, { condition: e.target.value })} placeholder="Dependency condition (optional)" />
            <div style={{ display: 'flex', gap: 6 }}>
              <button className={`${s.footerBtn} ${s.footerBtnPrimary}`} style={{ padding: '5px 10px', fontSize: 12 }}
                onClick={() => setEditingStepIdx(null)}>Save</button>
              <button className={`${s.footerBtn} ${s.footerBtnGhost}`} style={{ padding: '5px 10px', fontSize: 12 }}
                onClick={() => setEditingStepIdx(null)}>Cancel</button>
            </div>
          </div>
        ) : (
          /* Step Display */
          <div key={st.id || i} className={s.stepItem}>
            <div className={s.stepNum}>{i + 1}</div>
            <div className={s.stepContent}>
              <div className={s.stepNameRow}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--neutral-500)' }}>{st.name}</span>
                <Badge variant={st.type === 'mandatory' ? 'compliance-pass' : 'compliance-warn'} label={st.type === 'mandatory' ? 'Mandatory' : 'Conditional'} />
                {weighted && <span className={s.scoreChip}>{st.score}pt</span>}
              </div>
              {st.desc && <div className={s.stepDesc}>{st.desc}</div>}
              {st.condition && (
                <div className={s.stepCondition}>
                  <Icon name="solar:bolt-linear" size={10} /> {st.condition}
                </div>
              )}
            </div>
            <div className={s.stepControls}>
              <button className={s.iconBtn} onClick={() => setEditingStepIdx(i)} title="Edit step">
                <Icon name="solar:pen-linear" size={12} />
              </button>
              <button className={`${s.iconBtn} ${s.iconBtnDelete}`} onClick={() => removeStep(i)} title="Delete step">
                <Icon name="solar:trash-bin-minimalistic-linear" size={12} />
              </button>
            </div>
          </div>
        )
      ))}

      {/* Add Step Form */}
      {showAddStep && (
        <div style={{ background: 'var(--neutral-50)', border: '0.5px dashed var(--neutral-200)', borderRadius: 8, padding: 12, marginBottom: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--neutral-300)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.04em' }}>New Step</div>
          <div className={s.addStepRow}>
            <input className={s.formInput} placeholder="Step name" style={{ flex: 2 }} value={newStep.name}
              onChange={e => setNewStep({ ...newStep, name: e.target.value })} />
            <select className={s.formSelect} style={{ flex: 1 }} value={newStep.type}
              onChange={e => setNewStep({ ...newStep, type: e.target.value })}>
              <option value="mandatory">Mandatory</option>
              <option value="conditional">Conditional</option>
            </select>
            {weighted && (
              <input className={s.thresholdInput} type="number" min={1} max={999} value={newStep.score} style={{ width: 50 }}
                onChange={e => setNewStep({ ...newStep, score: parseInt(e.target.value) || 0 })} />
            )}
          </div>
          <textarea className={s.formTextarea} style={{ minHeight: 52, marginBottom: 8 }} placeholder="What does this step require?"
            value={newStep.desc} onChange={e => setNewStep({ ...newStep, desc: e.target.value })} />
          <input className={s.formInput} style={{ marginBottom: 8 }} placeholder="Dependency condition (optional)"
            value={newStep.condition} onChange={e => setNewStep({ ...newStep, condition: e.target.value })} />
          <div style={{ display: 'flex', gap: 6 }}>
            <button className={`${s.footerBtn} ${s.footerBtnPrimary}`} style={{ padding: '5px 10px', fontSize: 12 }}
              onClick={addStepItem}>Add Step</button>
            <button className={`${s.footerBtn} ${s.footerBtnGhost}`} style={{ padding: '5px 10px', fontSize: 12 }}
              onClick={() => setShowAddStep(false)}>Cancel</button>
          </div>
        </div>
      )}

      {stepsError && <div className={`${s.formError} ${s.formErrorVisible}`}>At least one step is required</div>}
    </div>
  );

  // ── Page 3: Review ──
  const renderReview = () => (
    <div className={step === 3 ? s.wizPageActive : s.wizPage}>
      <div className={s.sectionTitle}>
        <Icon name="solar:check-circle-linear" size={14} color="var(--status-success)" />
        Success Criteria
      </div>
      <div style={{ fontSize: 12, color: 'var(--neutral-300)', marginBottom: 10, lineHeight: 1.5 }}>
        Define what constitutes a successful goal completion beyond just step completion.
      </div>
      {metrics.map((m, i) => (
        <div key={i} className={s.metricItem}>
          <Icon name="solar:check-circle-linear" size={13} color="var(--status-success)" />
          <span style={{ flex: 1 }}>{m}</span>
          <button className={s.metricRemove} onClick={() => removeMetric(i)}>✕</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <input className={s.formInput} placeholder="e.g. No escalated safety events" value={newMetric}
          onChange={e => setNewMetric(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addMetricItem()} />
        <button className={`${s.footerBtn} ${s.footerBtnSecondary}`} style={{ padding: '5px 10px', fontSize: 12, flexShrink: 0 }}
          onClick={addMetricItem}>+ Add</button>
      </div>

      <hr className={s.divider} />
      <div className={s.sectionTitle}>
        <Icon name="solar:clipboard-list-linear" size={14} color="var(--primary-300)" />
        Review Summary
      </div>
      <div className={s.reviewCard}>
        <div className={s.reviewLabel}>Goal Name</div>
        <div className={s.reviewValue}>{name || '—'}</div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div className={s.reviewCard} style={{ flex: 1 }}>
          <div className={s.reviewLabel}>Program</div>
          <div className={s.reviewValue}>{program}</div>
        </div>
        <div className={s.reviewCard} style={{ flex: 1 }}>
          <div className={s.reviewLabel}>Mode</div>
          <div className={s.reviewValue}>{MODES.find(m => m.value === mode)?.label || mode}</div>
        </div>
      </div>
      <div className={s.reviewCard}>
        <div className={s.reviewLabel}>Steps</div>
        <div className={s.reviewValue}>
          {steps.filter(st => st.type === 'mandatory').length} mandatory, {steps.filter(st => st.type === 'conditional').length} conditional
          {weighted && <span style={{ color: 'var(--neutral-300)', fontWeight: 400 }}> · Threshold: {passingScore}/{totalScore}pt</span>}
        </div>
      </div>
      {desc && (
        <div className={s.reviewCard}>
          <div className={s.reviewLabel}>Description</div>
          <div style={{ fontSize: 13, color: 'var(--neutral-400)', lineHeight: 1.5 }}>{desc}</div>
        </div>
      )}
    </div>
  );

  const headerRight = (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {step >= 2 && !isEdit && (
        <button className={`${s.footerBtn} ${s.footerBtnGhost}`} onClick={() => saveGoal('draft')}>Save Draft</button>
      )}
      <button className={`${s.footerBtn} ${s.footerBtnPrimary}`} onClick={goNext}>
        {step === 3 ? 'Publish Goal' : 'Next'}
      </button>
    </div>
  );

  return (
    <Drawer
      title={isEdit ? 'Edit Goal' : 'Create New Goal'}
      onClose={close}
      headerRight={headerRight}
    >
      {/* Back link at top of body when not on first step */}
      {step > 0 && (
        <button onClick={goBack} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--primary-300)', fontFamily: "'Inter', sans-serif", fontWeight: 500,
        }}>
          <Icon name="solar:alt-arrow-left-linear" size={14} /> Back
        </button>
      )}
      {renderStepper()}
      {renderDescribe()}
      {renderConfigure()}
      {renderSteps()}
      {renderReview()}
    </Drawer>
  );
}
