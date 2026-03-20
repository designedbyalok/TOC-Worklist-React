import { useState } from 'react';
import { Avatar } from '../Avatar/Avatar';
import { Icon } from '../Icon/Icon';
import { useAppStore } from '../../store/useAppStore';
import styles from './InvokeAgentModal.module.css';

const AGENTS = [
  { name: 'Ricardo', role: 'SNP Agent' },
  { name: 'Erica', role: 'TOC Agent' },
  { name: 'Maria', role: 'AWV Agent' },
  { name: 'Jia', role: 'Follow-up Agent' },
  { name: 'Dubois', role: 'SDOH Agent' },
];

export function InvokeAgentModal() {
  const [selected, setSelected] = useState(null);
  const selectedIds = useAppStore(s => s.selectedIds);
  const invokeAgent = useAppStore(s => s.invokeAgent);
  const setShowInvokeModal = useAppStore(s => s.setShowInvokeModal);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) setShowInvokeModal(false);
  };

  const handleConfirm = () => {
    if (!selected) return;
    const agent = AGENTS.find(a => a.name === selected);
    invokeAgent(selectedIds, agent.name, agent.role);
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.title}>Select Agent to Invoke</div>
        <div className={styles.agentList}>
          {AGENTS.map(agent => (
            <label
              key={agent.name}
              className={[styles.agentRow, selected === agent.name ? styles.selected : ''].filter(Boolean).join(' ')}
              onClick={() => setSelected(agent.name)}
            >
              <input
                type="radio"
                name="invokeAgent"
                value={agent.name}
                checked={selected === agent.name}
                onChange={() => setSelected(agent.name)}
              />
              <Avatar variant="invokeAgent" agentName={agent.name} />
              <div className={styles.agentInfo}>
                <div className={styles.agentName}>{agent.name}</div>
                <div className={styles.agentRole}>{agent.role}</div>
              </div>
              {selected === agent.name && (
                <Icon name="solar:play-bold" size={14} color="var(--primary-300)" />
              )}
            </label>
          ))}
        </div>
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={() => setShowInvokeModal(false)}>Cancel</button>
          <button
            className={styles.confirmBtn}
            disabled={!selected}
            onClick={handleConfirm}
          >
            Invoke Agent
          </button>
        </div>
      </div>
    </div>
  );
}
