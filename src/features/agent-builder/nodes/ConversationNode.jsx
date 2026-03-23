import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Icon } from '../../../components/Icon/Icon';
import styles from './ConversationNode.module.css';

const TYPE_CONFIG = {
  conversation: { icon: 'solar:chat-round-dots-linear', color: '#009B53', label: 'Conversation' },
  appointment: { icon: 'solar:calendar-linear', color: '#145ECC', label: 'Appointment' },
  guardrails: { icon: 'solar:shield-check-linear', color: '#D9A50B', label: 'Guardrails' },
  callTransfer: { icon: 'solar:phone-calling-linear', color: '#8C5AE2', label: 'Call Transfer' },
  escalation: { icon: 'solar:danger-triangle-linear', color: '#D72825', label: 'Escalation' },
  agents: { icon: 'solar:ghost-smile-linear', color: '#5020A0', label: 'Agents' },
};

export const ConversationNode = memo(function ConversationNode({ data, selected }) {
  const config = TYPE_CONFIG[data.nodeType] || TYPE_CONFIG.conversation;
  const transitions = data.transitions || [];

  return (
    <div className={`${styles.node} ${selected ? styles.nodeSelected : ''}`}>
      <Handle type="target" position={Position.Left} className={styles.handle} />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIcon} style={{ background: config.color }}>
          <Icon name={config.icon} size={14} color="#fff" />
        </div>
        <span className={styles.headerLabel}>{data.label}</span>
        {data.verified && (
          <span className={styles.verifiedBadge}>
            <Icon name="solar:verified-check-bold" size={10} color="#009B53" />
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
            <Icon name="solar:transfer-horizontal-linear" size={14} color="#6F7A90" />
            <span>Transition</span>
            <button className={styles.addTransitionBtn}>
              <Icon name="solar:add-circle-linear" size={14} color="#8C5AE2" />
            </button>
          </div>
          <div className={styles.transitionDivider} />
          {transitions.map((t, i) => (
            <div key={i} className={styles.transitionRow}>
              <Icon name="solar:tuning-2-linear" size={12} color="#6F7A90" />
              <span>{t.condition} &rarr; {t.target}</span>
              <Handle
                type="source"
                position={Position.Right}
                id={`t-${i}`}
                className={styles.transitionHandle}
                style={{ top: 'auto', right: -6 }}
              />
            </div>
          ))}
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
