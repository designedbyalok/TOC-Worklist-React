import { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '../../components/Icon/Icon';
import { useAppStore } from '../../store/useAppStore';
import { GoalDetailDrawer } from '../settings/panels/GoalDetailDrawer';
import styles from './ConfigurePanel.module.css';

/* ── Section definitions ── */
const SECTIONS = [
  { id: 'agent-use-case', label: 'Agent Use Case', icon: 'solar:user-rounded-linear', complete: true },
  { id: 'personalization', label: 'Personalization', icon: 'solar:magic-stick-3-linear', complete: true },
  { id: 'policies', label: 'Policies', icon: 'solar:shield-check-linear', complete: true },
  { id: 'target-population', label: 'Target Population', icon: 'solar:users-group-rounded-linear', complete: true },
  { id: 'knowledge-base', label: 'Knowledge Base', icon: 'solar:book-2-linear', complete: false },
  { id: 'communication', label: 'Communication Preferences', icon: 'solar:phone-calling-rounded-linear', complete: true },
];

const TONE_OPTIONS = [
  { id: 'professional', title: 'Professional', desc: 'Formal & Businesslike' },
  { id: 'warm', title: 'Warm & Caring', desc: 'Empathetic & Friendly' },
  { id: 'casual', title: 'Casual', desc: 'Relaxed & Conversational' },
  { id: 'direct', title: 'Direct', desc: 'Clear & Concise' },
];

const VOICE_OPTIONS = [
  { id: 'erica', label: 'Erica - US Female - Empathetic & Calm' },
  { id: 'james', label: 'James - US Male - Professional & Warm' },
  { id: 'sophia', label: 'Sophia - US Female - Friendly & Upbeat' },
  { id: 'david', label: 'David - UK Male - Calm & Reassuring' },
];

const ROLE_OPTIONS = [
  { id: 'coordinator', label: 'Care Coordinator' },
  { id: 'navigator', label: 'Care Navigator' },
  { id: 'outreach', label: 'Outreach Specialist' },
  { id: 'scheduler', label: 'Scheduling Assistant' },
];

const LANGUAGE_OPTIONS = [
  { id: 'english', label: 'English (Primary)' },
  { id: 'chinese', label: 'Chinese (Mandarin)' },
  { id: 'spanish', label: 'Spanish' },
  { id: 'vietnamese', label: 'Vietnamese' },
  { id: 'korean', label: 'Korean' },
  { id: 'french', label: 'French' },
];

const ADAPTATION_OPTIONS = [
  { id: 'elderly', label: 'Elderly patients (slower pace, clearer speech, simpler language)' },
  { id: 'plain', label: 'Plain language (avoid medical jargon)' },
  { id: 'lowLiteracy', label: 'Low health literacy (extra explanations)' },
  { id: 'hearing', label: 'Hearing impaired (louder, clearer, slower)' },
];

const POLICY_TEMPLATES = [
  { id: 'emergency', name: 'Emergency Escalation', desc: 'Automatic 911 prompts for critical symptoms: chest pain, difficulty breathing, stroke symptoms, severe bleeding', recommended: false },
  { id: 'medication', name: 'Medication Adherence Monitoring', desc: 'Check each medication individually, document non-adherence reasons, offer interventions for cost or side effects', recommended: true },
  { id: 'empathetic', name: 'Empathetic Communication', desc: 'Natural acknowledgments, validation phrases, appropriate responses to patient distress', recommended: true },
];

const POPULATION_OPTIONS = [
  { id: 'popGroup', title: 'Population Group', desc: 'Select from pop-groups' },
  { id: 'worklist', title: 'Worklist', desc: 'Select predefined Worklist' },
  { id: 'upload', title: 'Upload Patient List', desc: 'Upload Excel or CSV file' },
];

const MODALITY_OPTIONS = [
  { id: 'voice', title: 'Voice' },
  { id: 'text', title: 'Text' },
  { id: 'both', title: 'Both' },
];

const DEFAULT_FORM = {
  agentName: '',
  agentRole: '',
  useCaseName: '',
  description: '',
  goalIds: [],
  systemPrompt: '',
  toneOfVoice: 'professional',
  voice: 'erica',
  empathyLevel: 75,
  speakingPace: 75,
  languages: ['english'],
  adaptations: [],
  selectedPolicies: [],
  populationType: 'worklist',
  selectedWorklist: '',
  modality: 'voice',
  phone: '',
  email: '',
  officeHours: '',
};

/* ─────────────── SectionCard ─────────────── */
function SectionCard({ id, icon, title, isComplete, expanded, onToggle, children }) {
  return (
    <div className={styles.card} id={`section-${id}`}>
      <button className={styles.cardHeader} onClick={onToggle} type="button">
        <div className={styles.cardHeaderLeft}>
          <Icon name={icon} size={16} color="#6F7A90" />
          <span className={styles.cardTitle}>{title}</span>
          {isComplete && (
            <span className={styles.completeBadge}>
              <Icon name="solar:check-read-linear" size={8} color="#fff" />
            </span>
          )}
        </div>
        <span className={`${styles.chevron} ${expanded ? styles.chevronOpen : ''}`}>
          <Icon name="solar:alt-arrow-down-linear" size={16} color="#6F7A90" />
        </span>
      </button>
      {expanded && <div className={styles.cardBody}>{children}</div>}
    </div>
  );
}

/* ─────────────── CustomSelect ─────────────── */
function CustomSelect({ value, options, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.id === value);

  return (
    <div className={styles.selectWrap} ref={ref}>
      <button className={styles.selectBtn} onClick={() => setOpen(!open)} type="button">
        <span className={`${styles.selectBtnText} ${!selected ? styles.selectBtnPlaceholder : ''}`}>
          {selected ? selected.label : placeholder}
        </span>
        <Icon name="solar:alt-arrow-down-linear" size={12} color="#8A94A8" />
      </button>
      {open && (
        <div className={styles.selectDropdown}>
          {options.map(o => (
            <div
              key={o.id}
              className={`${styles.selectOption} ${value === o.id ? styles.selectOptionActive : ''}`}
              onClick={() => { onChange(o.id); setOpen(false); }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────── Slider ─────────────── */
function Slider({ value, onChange, label, badgeText }) {
  return (
    <div className={styles.sliderRow}>
      <div className={styles.sliderHeader}>
        <span className={styles.sliderLabel}>{label}</span>
        <span className={styles.sliderBadge}>{badgeText}</span>
      </div>
      <div className={styles.sliderWrap}>
        <div className={styles.sliderTrack}>
          <div className={styles.sliderFill} style={{ width: `${value}%` }} />
          <div className={styles.sliderThumb} style={{ left: `${value}%` }}>
            <span className={styles.sliderTooltip}>{value}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className={styles.sliderInput}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Checkbox ─────────────── */
function Checkbox({ checked, onChange, label }) {
  return (
    <label className={styles.checkboxItem} onClick={() => onChange(!checked)}>
      <span className={`${styles.checkboxBox} ${checked ? styles.checkboxBoxChecked : ''}`}>
        {checked && <Icon name="solar:check-read-linear" size={14} color="#fff" />}
      </span>
      <span className={`${styles.checkboxLabel} ${checked ? styles.checkboxLabelChecked : ''}`}>
        {label}
      </span>
    </label>
  );
}

/* ─────────────── RadioCard ─────────────── */
function RadioCard({ selected, onClick, title, desc, className }) {
  return (
    <div
      className={`${styles.radioCard} ${selected ? styles.radioCardSelected : ''} ${className || ''}`}
      onClick={onClick}
    >
      <span className={`${styles.radioDot} ${selected ? styles.radioDotSelected : ''}`} />
      <div className={styles.radioCardContent}>
        <span className={styles.radioCardTitle}>{title}</span>
        {desc && <span className={styles.radioCardDesc}>{desc}</span>}
      </div>
    </div>
  );
}

/* ─────────────── GoalSelector ─────────────── */
function GoalSelector({ selectedIds, onToggle, onPreview }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const goalsData = useAppStore(s => s.goalsData) || [];
  const fetchGoals = useAppStore(s => s.fetchGoals);

  useEffect(() => {
    if (!goalsData.length) fetchGoals();
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedGoals = goalsData.filter(g => selectedIds.includes(g.id));
  const badgeColor = (program) => {
    if (program === 'TCM') return styles.programBadgePurple;
    if (program === 'Outreach') return styles.programBadgeBlue;
    return styles.programBadgeAmber;
  };

  return (
    <div className={styles.goalSelector} ref={ref}>
      <button className={styles.selectBtn} onClick={() => setOpen(!open)} type="button">
        <span className={`${styles.selectBtnText} ${!selectedIds.length ? styles.selectBtnPlaceholder : ''}`}>
          {selectedIds.length ? `${selectedIds.length} goal${selectedIds.length > 1 ? 's' : ''} selected` : 'Select goals…'}
        </span>
        <Icon name="solar:alt-arrow-down-linear" size={12} color="#8A94A8" />
      </button>

      {open && (
        <div className={styles.goalDropdown}>
          {goalsData.length === 0 ? (
            <div className={styles.goalEmpty}>No goals found. Create goals in Settings.</div>
          ) : goalsData.map(g => {
            const isSelected = selectedIds.includes(g.id);
            return (
              <div key={g.id} className={styles.goalOption} onClick={() => onToggle(g.id)}>
                <span className={`${styles.goalOptionCheck} ${isSelected ? styles.goalOptionCheckSelected : ''}`}>
                  {isSelected && <Icon name="solar:check-read-linear" size={10} color="#fff" />}
                </span>
                <div className={styles.goalOptionInfo}>
                  <div className={styles.goalOptionName}>{g.name}</div>
                  <div className={styles.goalOptionMeta}>{g.steps?.length || 0} steps &middot; {g.status}</div>
                </div>
                <span className={`${styles.programBadge} ${badgeColor(g.program)}`}>{g.program}</span>
              </div>
            );
          })}
        </div>
      )}

      {selectedGoals.length > 0 && (
        <div className={styles.goalTags}>
          {selectedGoals.map(g => (
            <span key={g.id} className={styles.goalTag}>
              {g.name}
              <button className={styles.goalTagPreview} type="button" onClick={() => onPreview(g.id)} title="Preview goal">
                <Icon name="solar:eye-linear" size={14} color="#8C5AE2" />
              </button>
              <button className={styles.goalTagRemove} type="button" onClick={() => onToggle(g.id)} title="Remove">
                <Icon name="solar:close-circle-linear" size={12} color="#6F7A90" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════ ConfigurePanel ═══════════════ */
export function ConfigurePanel({ agent, onSave }) {
  const scrollRef = useRef(null);
  const [activeSection, setActiveSection] = useState('agent-use-case');
  const [saving, setSaving] = useState(false);

  // Store
  const builderConfig = useAppStore(s => s.builderConfig);
  const builderConfigLoading = useAppStore(s => s.builderConfigLoading);
  const fetchAgentConfig = useAppStore(s => s.fetchAgentConfig);
  const saveAgentConfig = useAppStore(s => s.saveAgentConfig);
  const showToast = useAppStore(s => s.showToast);
  const setGoalDetailId = useAppStore(s => s.setGoalDetailId);
  const goalDetailId = useAppStore(s => s.goalDetailId);

  // Expand/collapse state
  const [expanded, setExpanded] = useState({
    'agent-use-case': true,
    'personalization': true,
    'policies': true,
    'target-population': true,
    'knowledge-base': false,
    'communication': true,
  });

  // Form state
  const [form, setForm] = useState({ ...DEFAULT_FORM, agentName: agent?.name || '' });
  const [formLoaded, setFormLoaded] = useState(false);

  // Fetch config on mount
  useEffect(() => {
    if (agent?.id) fetchAgentConfig(agent.id);
  }, [agent?.id]);

  // Populate form from DB config once loaded
  useEffect(() => {
    if (builderConfigLoading || formLoaded) return;
    if (builderConfig) {
      setForm({
        agentName: agent?.name || '',
        agentRole: builderConfig.agent_role || '',
        useCaseName: builderConfig.use_case_name || agent?.use_case || '',
        description: builderConfig.description || '',
        goalIds: builderConfig.goal_ids || [],
        systemPrompt: builderConfig.system_prompt || '',
        toneOfVoice: builderConfig.tone_of_voice || 'professional',
        voice: builderConfig.voice || 'erica',
        empathyLevel: builderConfig.empathy_level ?? 75,
        speakingPace: builderConfig.speaking_pace ?? 75,
        languages: builderConfig.languages || ['english'],
        adaptations: builderConfig.adaptations || [],
        selectedPolicies: builderConfig.selected_policies || [],
        populationType: builderConfig.population_type || 'worklist',
        selectedWorklist: builderConfig.selected_worklist || '',
        modality: builderConfig.modality || 'voice',
        phone: builderConfig.phone || '',
        email: builderConfig.email || '',
        officeHours: builderConfig.office_hours || '',
      });
      setFormLoaded(true);
    } else if (!builderConfigLoading) {
      // No saved config — use defaults with agent name
      setForm(prev => ({ ...prev, agentName: agent?.name || '', useCaseName: agent?.use_case || '' }));
      setFormLoaded(true);
    }
  }, [builderConfig, builderConfigLoading, formLoaded, agent]);

  const updateField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleExpanded = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleArrayItem = (field, item) => {
    setForm(prev => {
      const arr = prev[field];
      return { ...prev, [field]: arr.includes(item) ? arr.filter(v => v !== item) : [...arr, item] };
    });
  };

  const toggleGoal = (goalId) => {
    setForm(prev => {
      const ids = prev.goalIds;
      return { ...prev, goalIds: ids.includes(goalId) ? ids.filter(id => id !== goalId) : [...ids, goalId] };
    });
  };

  // Save handler
  const handleSave = async () => {
    if (!agent?.id) return;
    setSaving(true);
    const ok = await saveAgentConfig(agent.id, form);
    setSaving(false);
    if (ok) showToast('Configuration saved');
    else showToast('Failed to save configuration');
    if (onSave) onSave();
  };

  // ─── Section tab tracking ───
  // Use a scroll-based approach that finds the topmost visible section,
  // with a near-bottom override for the last sections
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollEl;
      const containerRect = scrollEl.getBoundingClientRect();
      const nearBottom = scrollTop + clientHeight >= scrollHeight - 100;

      if (nearBottom) {
        // When near bottom, find the last section whose top is visible
        for (let i = SECTIONS.length - 1; i >= 0; i--) {
          const el = document.getElementById(`section-${SECTIONS[i].id}`);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top < containerRect.bottom && rect.bottom > containerRect.top) {
              setActiveSection(SECTIONS[i].id);
              return;
            }
          }
        }
      } else {
        // Normal: find the first section whose top is within the top portion of the viewport
        const threshold = containerRect.top + containerRect.height * 0.3;
        let best = SECTIONS[0].id;
        for (const s of SECTIONS) {
          const el = document.getElementById(`section-${s.id}`);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= threshold) best = s.id;
          }
        }
        setActiveSection(best);
      }
    };

    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial check

    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (!expanded[id]) {
        setExpanded(prev => ({ ...prev, [id]: true }));
      }
    }
  };

  const getBadgeText = (val) => {
    if (val >= 80) return 'High';
    if (val >= 40) return 'Medium';
    return 'Low';
  };

  return (
    <div className={styles.wrapper}>
      {/* Secondary tab bar — centered, matching AgentsTable style */}
      <div className={styles.sectionTabs}>
        <div className={styles.sectionTabsInner}>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`${styles.sectionTab} ${activeSection === s.id ? styles.sectionTabActive : ''}`}
              onClick={() => scrollToSection(s.id)}
              type="button"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className={styles.scrollArea} ref={scrollRef}>
        <div className={styles.scrollInner}>

          {/* ═══ 1. Agent Use Case ═══ */}
          <SectionCard
            id="agent-use-case"
            icon="solar:user-rounded-linear"
            title="Agent Use Case"
            isComplete={true}
            expanded={expanded['agent-use-case']}
            onToggle={() => toggleExpanded('agent-use-case')}
          >
            <div className={styles.subsection}>
              <div className={styles.subsectionTitle}>Basic Information</div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Agent Name <span className={styles.fieldRequired} /></label>
                  <input
                    className={styles.fieldInput}
                    value={form.agentName}
                    onChange={e => updateField('agentName', e.target.value)}
                    placeholder="Enter agent name"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Agent Role <span className={styles.fieldRequired} /></label>
                  <CustomSelect
                    value={form.agentRole}
                    options={ROLE_OPTIONS}
                    onChange={v => updateField('agentRole', v)}
                    placeholder="Select role"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Use Case Name <span className={styles.fieldRequired} /></label>
                <div className={styles.fieldInputWrap}>
                  <input
                    className={styles.fieldInput}
                    value={form.useCaseName}
                    onChange={e => updateField('useCaseName', e.target.value.slice(0, 100))}
                    maxLength={100}
                    style={{ paddingRight: 48 }}
                    placeholder="e.g. Post-Discharge Follow-Up Calls"
                  />
                  <span className={styles.charCounter}>{form.useCaseName.length}/100</span>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Description</label>
                <textarea
                  className={styles.textarea}
                  value={form.description}
                  onChange={e => updateField('description', e.target.value)}
                  rows={3}
                  placeholder="Describe the agent's purpose and expected behavior…"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Agent Goals <span className={styles.fieldRequired} /></label>
                <GoalSelector
                  selectedIds={form.goalIds}
                  onToggle={toggleGoal}
                  onPreview={(id) => setGoalDetailId(id)}
                />
              </div>
            </div>

            <div className={styles.subsection}>
              <div className={styles.subsectionHeader}>
                <span className={styles.subsectionTitle}>Instruction for the Agent</span>
                <button className={styles.expandBtn} type="button" title="Expand">
                  <Icon name="solar:maximize-linear" size={16} color="#6F7A90" />
                </button>
              </div>
              <textarea
                className={`${styles.textarea} ${styles.textareaLarge}`}
                value={form.systemPrompt}
                onChange={e => updateField('systemPrompt', e.target.value)}
                placeholder="Enter detailed instructions for how the agent should behave, what it can and cannot do, and its communication style…"
              />
            </div>
          </SectionCard>

          {/* ═══ 2. Personalization ═══ */}
          <SectionCard
            id="personalization"
            icon="solar:magic-stick-3-linear"
            title="Personalization"
            isComplete={true}
            expanded={expanded['personalization']}
            onToggle={() => toggleExpanded('personalization')}
          >
            <div className={styles.subsection}>
              <div className={styles.subsectionTitle}>Tone of Voice</div>
              <div className={styles.radioCardGrid}>
                {TONE_OPTIONS.map(t => (
                  <RadioCard
                    key={t.id}
                    selected={form.toneOfVoice === t.id}
                    onClick={() => updateField('toneOfVoice', t.id)}
                    title={t.title}
                    desc={t.desc}
                  />
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.subsectionTitle}>Voice</label>
              <CustomSelect
                value={form.voice}
                options={VOICE_OPTIONS}
                onChange={v => updateField('voice', v)}
                placeholder="Select voice"
              />
            </div>

            <Slider
              value={form.empathyLevel}
              onChange={v => updateField('empathyLevel', v)}
              label="Empathy Level"
              badgeText={getBadgeText(form.empathyLevel)}
            />

            <Slider
              value={form.speakingPace}
              onChange={v => updateField('speakingPace', v)}
              label="Speaking Pace"
              badgeText={getBadgeText(form.speakingPace)}
            />

            <div className={styles.subsection}>
              <div className={styles.subsectionTitle}>Language Support</div>
              <div className={styles.checkboxGrid}>
                {LANGUAGE_OPTIONS.map(l => (
                  <Checkbox
                    key={l.id}
                    checked={form.languages.includes(l.id)}
                    onChange={() => toggleArrayItem('languages', l.id)}
                    label={l.label}
                  />
                ))}
              </div>
            </div>

            <div className={styles.subsection}>
              <div className={styles.subsectionTitle}>Special Adaptations</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {ADAPTATION_OPTIONS.map(a => (
                  <Checkbox
                    key={a.id}
                    checked={form.adaptations.includes(a.id)}
                    onChange={() => toggleArrayItem('adaptations', a.id)}
                    label={a.label}
                  />
                ))}
              </div>
            </div>
          </SectionCard>

          {/* ═══ 3. Policies ═══ */}
          <SectionCard
            id="policies"
            icon="solar:shield-check-linear"
            title="Policies"
            isComplete={true}
            expanded={expanded['policies']}
            onToggle={() => toggleExpanded('policies')}
          >
            <div className={styles.subsection}>
              <div className={styles.linkRow}>
                <span className={styles.linkRowText}>Required Compliance Policies</span>
                <Icon name="solar:alt-arrow-right-linear" size={16} color="#16181D" />
              </div>
            </div>

            <div className={styles.subsection}>
              <div>
                <div className={styles.subsectionTitle}>Optional Policy Templates</div>
                <div className={styles.subsectionDesc}>Apply additional policies to enhance agent behavior</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {POLICY_TEMPLATES.map(p => (
                  <div key={p.id} className={styles.policyCard} onClick={() => toggleArrayItem('selectedPolicies', p.id)}>
                    <span className={`${styles.checkboxBox} ${form.selectedPolicies.includes(p.id) ? styles.checkboxBoxChecked : ''}`}>
                      {form.selectedPolicies.includes(p.id) && <Icon name="solar:check-read-linear" size={12} color="#fff" />}
                    </span>
                    <div className={styles.policyContent}>
                      <span className={styles.policyName}>{p.name}</span>
                      <span className={styles.policyDesc}>{p.desc}</span>
                    </div>
                    <button className={styles.expandBtn} type="button" onClick={e => e.stopPropagation()}>
                      <Icon name="solar:pen-new-square-linear" size={16} color="#6F7A90" />
                    </button>
                    {p.recommended && <span className={styles.recommendedBadge}>Recommended</span>}
                  </div>
                ))}
              </div>

              <div className={styles.policyActions}>
                <button className={styles.linkBtn} type="button">
                  <Icon name="solar:add-circle-linear" size={14} color="#8C5AE2" />
                  Create Custom Policy
                </button>
                <button className={styles.linkBtn} type="button">
                  <Icon name="solar:import-linear" size={14} color="#8C5AE2" />
                  Import Policy from Document
                </button>
              </div>
            </div>
          </SectionCard>

          {/* ═══ 4. Target Population ═══ */}
          <SectionCard
            id="target-population"
            icon="solar:users-group-rounded-linear"
            title="Target Population"
            isComplete={true}
            expanded={expanded['target-population']}
            onToggle={() => toggleExpanded('target-population')}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span className={styles.subsectionTitle}>Target Population</span>
              <span className={styles.subsectionDesc}>Define the audience group for which the agent will be directed</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {POPULATION_OPTIONS.map(p => (
                <RadioCard
                  key={p.id}
                  selected={form.populationType === p.id}
                  onClick={() => updateField('populationType', p.id)}
                  title={p.title}
                  desc={p.desc}
                  className={styles.radioCardFlex}
                />
              ))}
            </div>

            {form.populationType === 'worklist' && (
              <CustomSelect
                value={form.selectedWorklist}
                options={[
                  { id: 'toc', label: 'TOC Post-Discharge' },
                  { id: 'awv', label: 'Annual Wellness Visit' },
                  { id: 'chronic', label: 'Chronic Care Management' },
                ]}
                onChange={v => updateField('selectedWorklist', v)}
                placeholder="Select Worklist"
              />
            )}
          </SectionCard>

          {/* ═══ 5. Knowledge Base ═══ */}
          <SectionCard
            id="knowledge-base"
            icon="solar:book-2-linear"
            title="Knowledge Base"
            isComplete={false}
            expanded={expanded['knowledge-base']}
            onToggle={() => toggleExpanded('knowledge-base')}
          >
            <div className={styles.subsection}>
              <div className={styles.subsectionDesc}>
                Upload documents, FAQs, and reference materials for the agent to use during conversations.
              </div>
              <button className={styles.linkBtn} type="button">
                <Icon name="solar:add-circle-linear" size={14} color="#8C5AE2" />
                Add Knowledge Source
              </button>
            </div>
          </SectionCard>

          {/* ═══ 6. Communication Preferences ═══ */}
          <SectionCard
            id="communication"
            icon="solar:phone-calling-rounded-linear"
            title="Communication Preferences"
            isComplete={true}
            expanded={expanded['communication']}
            onToggle={() => toggleExpanded('communication')}
          >
            <div className={styles.subsection}>
              <div className={styles.subsectionTitle}>Modality</div>
              <div className={styles.radioCardGrid}>
                {MODALITY_OPTIONS.map(m => (
                  <RadioCard
                    key={m.id}
                    selected={form.modality === m.id}
                    onClick={() => updateField('modality', m.id)}
                    title={m.title}
                    className={styles.radioCardFlex}
                  />
                ))}
              </div>
            </div>

            <div className={styles.subsection}>
              <div className={styles.subsectionTitle}>Communication Details</div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Phone Number</label>
                <input
                  className={styles.fieldInput}
                  value={form.phone}
                  onChange={e => updateField('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Email ID</label>
                <input
                  className={styles.fieldInput}
                  value={form.email}
                  onChange={e => updateField('email', e.target.value)}
                  placeholder="agent@fold.health"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Office Hours</label>
                <input
                  className={styles.fieldInput}
                  value={form.officeHours}
                  onChange={e => updateField('officeHours', e.target.value)}
                  placeholder="Monday-Friday, 8 AM - 5 PM"
                />
              </div>
            </div>
          </SectionCard>

        </div>
      </div>

      {/* Goal detail drawer (for preview) */}
      {goalDetailId && <GoalDetailDrawer />}
    </div>
  );
}
