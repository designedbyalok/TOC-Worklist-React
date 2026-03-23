import { useState } from 'react';
import { Icon } from '../../components/Icon/Icon';
import styles from './NodePanel.module.css';

const NODE_TYPES = [
  { type: 'conversation', icon: 'solar:chat-round-dots-linear', label: 'Conversation', color: '#009B53', bg: '#ECFDF5' },
  { type: 'appointment', icon: 'solar:calendar-linear', label: 'Appointment', color: '#145ECC', bg: '#EFF6FF' },
  { type: 'guardrails', icon: 'solar:shield-check-linear', label: 'Guardrails', color: '#D9A50B', bg: '#FFFBEB' },
  { type: 'callTransfer', icon: 'solar:phone-calling-linear', label: 'Call Transfer', color: '#8C5AE2', bg: '#F5F0FF' },
  { type: 'escalation', icon: 'solar:danger-triangle-linear', label: 'Escalations', color: '#D72825', bg: '#FEF2F2' },
  { type: 'agents', icon: 'solar:ghost-smile-linear', label: 'Agents', color: '#5020A0', bg: '#F5F0FF' },
  { type: 'end', icon: 'solar:stop-bold', label: 'End', color: '#D72825', bg: '#FEF2F2' },
];

const COMPONENTS = [
  { type: 'greeting', icon: 'solar:hand-shake-linear', label: 'Greeting', desc: 'Standard greeting message' },
  { type: 'verification', icon: 'solar:shield-user-linear', label: 'Verification', desc: 'Identity verification block' },
  { type: 'medCheck', icon: 'solar:pill-linear', label: 'Med Check', desc: 'Medication reconciliation' },
  { type: 'scheduling', icon: 'solar:calendar-mark-linear', label: 'Scheduling', desc: 'Appointment scheduling' },
];

export function NodePanel({ onDragStart }) {
  const [activeTab, setActiveTab] = useState('node');

  const handleDragStart = (e, nodeType, label) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType, label }));
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(nodeType);
  };

  return (
    <aside className={styles.panel}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'node' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('node')}
        >
          Node
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'components' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('components')}
        >
          Components
        </button>
      </div>

      <div className={styles.list}>
        {activeTab === 'node' ? (
          NODE_TYPES.map(n => (
            <div
              key={n.type}
              className={styles.nodeItem}
              draggable
              onDragStart={e => handleDragStart(e, n.type, n.label)}
            >
              <div className={styles.nodeIcon} style={{ background: n.bg }}>
                <Icon name={n.icon} size={18} color={n.color} />
              </div>
              <span className={styles.nodeLabel}>{n.label}</span>
            </div>
          ))
        ) : (
          COMPONENTS.map(c => (
            <div
              key={c.type}
              className={styles.componentItem}
              draggable
              onDragStart={e => handleDragStart(e, c.type, c.label)}
            >
              <div className={styles.componentIcon}>
                <Icon name={c.icon} size={16} color="#8C5AE2" />
              </div>
              <div className={styles.componentText}>
                <span className={styles.componentLabel}>{c.label}</span>
                <span className={styles.componentDesc}>{c.desc}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
