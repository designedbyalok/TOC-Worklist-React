import { memo, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Icon } from '../../../components/Icon/Icon';
import { useAppStore } from '../../../store/useAppStore';
import styles from './ConversationNode.module.css';

const TYPE_CONFIG = {
  conversation: { icon: 'solar:chat-round-dots-linear', color: 'var(--status-success)', label: 'Conversation' },
  appointment: { icon: 'solar:calendar-linear', color: 'var(--status-info)', label: 'Appointment' },
  guardrails: { icon: 'solar:shield-check-linear', color: 'var(--status-warning)', label: 'Guardrails' },
  callTransfer: { icon: 'solar:phone-calling-linear', color: 'var(--primary-300)', label: 'Call Transfer' },
  escalation: { icon: 'solar:danger-triangle-linear', color: 'var(--status-error)', label: 'Escalation' },
  agents: { icon: 'solar:ghost-smile-linear', color: 'var(--primary-400)', label: 'Agents' },
};

function DragDots({ className }) {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" className={className}>
      <circle cx="2" cy="2" r="1" fill="currentColor" /><circle cx="6" cy="2" r="1" fill="currentColor" />
      <circle cx="2" cy="6" r="1" fill="currentColor" /><circle cx="6" cy="6" r="1" fill="currentColor" />
      <circle cx="2" cy="10" r="1" fill="currentColor" /><circle cx="6" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

export const ConversationNode = memo(function ConversationNode({ data, id }) {
  const config = TYPE_CONFIG[data.nodeType] || TYPE_CONFIG.conversation;
  const transitions = data.transitions || [];
  const builderSelectedNode = useAppStore(s => s.builderSelectedNode);
  const activeTransitionIdx = useAppStore(s => s.builderActiveTransition);
  const updateNodeData = useAppStore(s => s.updateNodeData);
  const isThisNodeSelected = builderSelectedNode === id;

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleDragStart = (idx) => { dragItem.current = idx; };
  const handleDragEnter = (idx) => { dragOverItem.current = idx; };
  const handleDragEnd = () => {
    const from = dragItem.current;
    const to = dragOverItem.current;
    if (from === null || to === null || from === to) { dragItem.current = null; dragOverItem.current = null; return; }
    const arr = [...transitions];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    updateNodeData(id, { transitions: arr });
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div className={`${styles.node} ${isThisNodeSelected ? styles.nodeSelected : ''}`}>
      <Handle type="target" position={Position.Left} className={styles.handle} />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIcon} style={{ background: config.color }}>
          <Icon name={config.icon} size={16} color="#fff" />
        </div>
        <span className={styles.headerLabel} style={{ color: config.color }}>{data.label}</span>
        {data.verified && (
          <span className={styles.verifiedBadge}>
            <Icon name="solar:shield-check-bold" size={10} color="var(--status-success)" />
            Verified Node
          </span>
        )}
      </div>

      {/* Body */}
      {data.prompt && (
        <div className={styles.body}>
          {data.prompt}
        </div>
      )}

      {/* Transitions */}
      {transitions.length > 0 && (
        <div className={styles.transitions}>
          <div className={styles.transitionHeader}>
            <Icon name="solar:tuning-2-linear" size={14} color="var(--neutral-300)" />
            <span>Transition</span>
            <button className={styles.addTransitionBtn}>
              <Icon name="solar:add-circle-linear" size={14} color="var(--primary-300)" />
            </button>
          </div>
          <div className={styles.transitionList}>
            {transitions.map((t, i) => {
              const isActiveRow = isThisNodeSelected && activeTransitionIdx === i;
              const condLabel = t.type === 'equation'
                ? (t.rules || []).map(r => `${r.variable || '?'} ${r.operator} ${r.value || '?'}`).join(', ') || 'Equation'
                : (t.condition || '—');
              return (
                <div
                  key={i}
                  className={`${styles.transitionRow} ${isActiveRow ? styles.transitionRowActive : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragEnter={() => handleDragEnter(i)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <DragDots className={styles.dragDots} />
                  <span className={styles.transitionText}>{condLabel} &rarr; {t.target || '—'}</span>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`t-${i}`}
                    className={styles.transitionHandle}
                    style={{ top: 'auto', right: -6 }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fallback source handle if no transitions */}
      {transitions.length === 0 && (
        <Handle type="source" position={Position.Right} className={styles.handle} />
      )}
    </div>
  );
});

export const StartNode = memo(function StartNode({ data }) {
  return (
    <div className={styles.startNode}>
      <div className={styles.startIcon}>
        <Icon name="solar:play-bold" size={16} color="#fff" />
      </div>
      <span className={styles.startLabel}>{data.label || 'Starts Here'}</span>
      <Handle type="source" position={Position.Right} className={styles.handle} />
    </div>
  );
});

export const EndNode = memo(function EndNode({ data }) {
  return (
    <div className={styles.endNode}>
      <Handle type="target" position={Position.Left} className={styles.handle} />
      <div className={styles.endIcon}>
        <Icon name="solar:stop-bold" size={14} color="#fff" />
      </div>
      <span className={styles.endLabel}>{data.label || 'End'}</span>
    </div>
  );
});
