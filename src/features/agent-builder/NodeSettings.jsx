import { useState, useEffect, useRef } from 'react';
import { Icon } from '../../components/Icon/Icon';
import { useAppStore } from '../../store/useAppStore';
import styles from './NodeSettings.module.css';

const TYPE_CONFIG = {
  conversation: { icon: 'solar:chat-round-dots-linear', color: 'var(--status-success)' },
  appointment: { icon: 'solar:calendar-linear', color: 'var(--status-info)' },
  guardrails: { icon: 'solar:shield-check-linear', color: 'var(--status-warning)' },
  callTransfer: { icon: 'solar:phone-calling-linear', color: 'var(--primary-300)' },
  escalation: { icon: 'solar:danger-triangle-linear', color: 'var(--status-error)' },
  agents: { icon: 'solar:ghost-smile-linear', color: 'var(--primary-400)' },
  end: { icon: 'solar:stop-bold', color: 'var(--status-error)' },
};

/* ── Custom select dropdown ── */
function CustomSelect({ value, options, placeholder, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <div className={styles.customSelect} ref={ref}>
      <button className={`${styles.customSelectTrigger} ${open ? styles.customSelectTriggerOpen : ''}`} onClick={() => setOpen(!open)}>
        <span className={value ? styles.customSelectValue : styles.customSelectPlaceholder}>
          {selected?.label || placeholder || 'Select...'}
        </span>
        <Icon name="solar:alt-arrow-down-linear" size={12} color="var(--neutral-300)" />
      </button>
      {open && (
        <div className={styles.customSelectDropdown}>
          {options.map(o => (
            <div
              key={o.value}
              className={`${styles.customSelectItem} ${o.value === value ? styles.customSelectItemActive : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </div>
          ))}
          {options.length === 0 && (
            <div className={styles.customSelectEmpty}>No options</div>
          )}
        </div>
      )}
    </div>
  );
}

export function NodeSettings({ node, allNodes, onSave, onClose, onDelete }) {
  const updateNodeData = useAppStore(s => s.updateNodeData);
  const [label, setLabel] = useState(node.data.label || '');
  const [prompt, setPrompt] = useState(node.data.prompt || '');
  const [guardrails, setGuardrails] = useState(node.data.guardrails || '');
  const [transitions, setTransitions] = useState(node.data.transitions || []);
  const [isEditing, setIsEditing] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    setLabel(node.data.label || '');
    setPrompt(node.data.prompt || '');
    setGuardrails(node.data.guardrails || '');
    setTransitions(node.data.transitions || []);
    setIsEditing(false);
  }, [node.id]);

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditing]);

  const isEndNode = node.data.nodeType === 'end' || node.type === 'endNode';
  const config = TYPE_CONFIG[node.data.nodeType] || (isEndNode ? TYPE_CONFIG.end : TYPE_CONFIG.conversation);
  const otherNodes = allNodes.filter(n => n.id !== node.id && n.type !== 'startNode');
  const nodeOptions = otherNodes.map(n => ({ value: n.data.label || n.id, label: n.data.label || n.id }));

  const handleSave = () => {
    updateNodeData(node.id, { label, prompt, guardrails, transitions });
    if (onSave) onSave();
    setIsEditing(false);
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') { setIsEditing(false); updateNodeData(node.id, { label }); }
    else if (e.key === 'Escape') { setLabel(node.data.label || ''); setIsEditing(false); }
  };

  const addTransition = () => setTransitions(t => [...t, { condition: '', target: '' }]);
  const updateTransition = (i, field, val) => setTransitions(t => t.map((tr, idx) => idx === i ? { ...tr, [field]: val } : tr));
  const removeTransition = (i) => setTransitions(t => t.filter((_, idx) => idx !== i));

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Node Settings</span>
        <div className={styles.headerActions}>
          <button className={styles.saveTextBtn} onClick={handleSave}>Save</button>
        </div>
      </div>

      <div className={styles.nodeIdentity}>
        <div className={styles.nodeIcon} style={{ background: config.color }}>
          <Icon name={config.icon} size={16} color="#fff" />
        </div>
        {isEditing ? (
          <input
            ref={nameInputRef}
            className={styles.nodeNameInputEditing}
            value={label}
            onChange={e => setLabel(e.target.value)}
            onKeyDown={handleNameKeyDown}
            onBlur={() => { setIsEditing(false); updateNodeData(node.id, { label }); }}
            placeholder="Node name"
          />
        ) : (
          <span className={styles.nodeNameDisplay}>{label}</span>
        )}
        <button className={styles.editBtn} onClick={() => setIsEditing(!isEditing)} title={isEditing ? 'Done editing' : 'Rename node'}>
          <Icon name={isEditing ? 'solar:check-read-linear' : 'solar:pen-new-square-linear'} size={14} color="var(--primary-300)" />
        </button>
      </div>

      <div className={styles.divider} />

      {isEndNode ? (
        /* End node: simplified view — no transitions, just a description */
        <div className={styles.section}>
          <div className={styles.endNodeInfo}>
            <Icon name="solar:info-circle-linear" size={16} color="var(--neutral-300)" />
            <span>This is the terminal node of the conversation flow. All paths should eventually lead here.</span>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Conversation</label>
            <textarea className={styles.textarea} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Enter the conversation prompt for this node..." rows={6} />
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Transition</span>
              <button className={styles.addBtn} onClick={addTransition}>+ Add New</button>
            </div>

            {transitions.map((t, i) => (
              <div key={i} className={styles.transitionBlock}>
                <button className={styles.removeTransitionBtn} onClick={() => removeTransition(i)} title="Remove transition">
                  <Icon name="solar:trash-bin-minimalistic-linear" size={13} color="var(--status-error)" />
                </button>
                <div className={styles.transitionField}>
                  <label className={styles.fieldLabel}>Condition</label>
                  <input className={styles.fieldInput} value={t.condition} onChange={e => updateTransition(i, 'condition', e.target.value)} placeholder="e.g. If Yes" />
                </div>
                <div className={styles.transitionField}>
                  <label className={styles.fieldLabel}>Jump to Node</label>
                  <CustomSelect
                    value={t.target || ''}
                    options={nodeOptions}
                    placeholder="Select Node"
                    onChange={val => updateTransition(i, 'target', val)}
                  />
                </div>
              </div>
            ))}

            {transitions.length === 0 && (
              <div className={styles.emptyTransitions}>
                <Icon name="solar:transfer-horizontal-linear" size={20} color="var(--neutral-150)" />
                <span>No transitions configured</span>
              </div>
            )}
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <label className={styles.sectionLabel}>Guardrails</label>
            <textarea className={styles.textarea} value={guardrails} onChange={e => setGuardrails(e.target.value)} placeholder="Add guardrails for this node..." rows={3} />
          </div>
        </>
      )}

      <div className={styles.deleteSection}>
        <button className={styles.deleteBtn} onClick={onDelete}>
          <Icon name="solar:trash-bin-minimalistic-linear" size={14} />
          Delete Node
        </button>
      </div>
    </div>
  );
}
