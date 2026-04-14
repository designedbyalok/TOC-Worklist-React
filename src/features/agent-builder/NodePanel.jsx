import { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '../../components/Icon/Icon';
import { ConversationIcon, GuardrailsIcon, CallTransferIcon, AgentsIcon } from './nodes/NodeIcons';
import styles from './NodePanel.module.css';

/* ── Node type config: drawer icons use light bg + colored border; canvas icons use solid bg ── */
const NODE_TYPES = [
  {
    type: 'conversation',
    label: 'Conversation',
    iconColor: '#009688',
    drawerBg: '#E5F4F3',
    drawerBorder: 'rgba(0,150,136,0.1)',
    CustomIcon: ConversationIcon,
  },
  {
    type: 'appointment',
    icon: 'solar:calendar-mark-linear',
    label: 'Appointment',
    iconColor: '#8C5AE2',
    drawerBg: '#FCFAFF',
    drawerBorder: 'rgba(140,90,226,0.3)',
  },
  {
    type: 'guardrails',
    label: 'Guardrails',
    iconColor: '#D9A50B',
    drawerBg: '#FFFCF5',
    drawerBorder: 'rgba(217,165,11,0.3)',
    CustomIcon: GuardrailsIcon,
  },
  {
    type: 'callTransfer',
    label: 'Call Transfer',
    iconColor: '#9C27B0',
    drawerBg: '#F5E9F7',
    drawerBorder: 'rgba(156,39,176,0.2)',
    CustomIcon: CallTransferIcon,
  },
  {
    type: 'escalation',
    icon: 'solar:danger-triangle-linear',
    label: 'Escalations',
    iconColor: '#D72825',
    drawerBg: '#FFFCF5',
    drawerBorder: 'rgba(215,40,37,0.2)',
  },
  {
    type: 'agents',
    label: 'Agents',
    iconColor: '#FF907F',
    drawerBg: 'linear-gradient(136deg, #FFF2F0 2%, #FFEDFA 52%, #EDF5FF 94%)',
    drawerBorder: '#FF907F',
    CustomIcon: AgentsIcon,
  },
  {
    type: 'end',
    icon: 'solar:forbidden-circle-linear',
    label: 'End',
    iconColor: '#109CAE',
    drawerBg: '#E5F8FB',
    drawerBorder: 'rgba(16,156,174,0.3)',
  },
];

const COMPONENTS = [
  { type: 'greeting', icon: 'solar:hand-shake-linear', label: 'Greeting', desc: 'Standard greeting message' },
  { type: 'verification', icon: 'solar:shield-user-linear', label: 'Verification', desc: 'Identity verification block' },
  { type: 'medCheck', icon: 'solar:pill-linear', label: 'Med Check', desc: 'Medication reconciliation' },
  { type: 'scheduling', icon: 'solar:calendar-mark-linear', label: 'Scheduling', desc: 'Appointment scheduling' },
];

export function NodePanel({ onDragStart }) {
  const [activeTab, setActiveTab] = useState('node');
  const toggleRef = useRef(null);
  const [sliderStyle, setSliderStyle] = useState({});

  const updateSlider = useCallback(() => {
    if (!toggleRef.current) return;
    const activeBtn = toggleRef.current.querySelector('[data-active="true"]');
    if (activeBtn) {
      setSliderStyle({ left: activeBtn.offsetLeft, width: activeBtn.offsetWidth });
    }
  }, []);

  useEffect(() => { updateSlider(); }, [activeTab, updateSlider]);
  useEffect(() => { requestAnimationFrame(updateSlider); }, [updateSlider]);

  const handleDragStart = (e, nodeType, label) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType, label }));
    e.dataTransfer.effectAllowed = 'move';
    if (onDragStart) onDragStart(nodeType);
  };

  return (
    <aside className={styles.panel}>
      {/* Segmented toggle */}
      <div className={styles.toggleWrap}>
        <div className={styles.toggle} ref={toggleRef}>
          <div className={styles.toggleSlider} style={sliderStyle} />
          <button
            data-active={activeTab === 'node'}
            className={`${styles.toggleBtn} ${activeTab === 'node' ? styles.toggleBtnActive : ''}`}
            onClick={() => setActiveTab('node')}
          >
            Node
          </button>
          <button
            data-active={activeTab === 'components'}
            className={`${styles.toggleBtn} ${activeTab === 'components' ? styles.toggleBtnActive : ''}`}
            onClick={() => setActiveTab('components')}
          >
            Components
          </button>
        </div>
      </div>

      <div className={styles.list}>
        {activeTab === 'node' ? (
          NODE_TYPES.map(n => {
            const isGradient = n.drawerBg.startsWith('linear');
            return (
              <div
                key={n.type}
                className={styles.nodeItem}
                draggable
                onDragStart={e => handleDragStart(e, n.type, n.label)}
              >
                <div
                  className={styles.nodeIcon}
                  style={{
                    background: n.drawerBg,
                    borderColor: n.drawerBorder,
                  }}
                >
                  {n.CustomIcon ? <n.CustomIcon size={16} color={n.iconColor} /> : <Icon name={n.icon} size={16} color={n.iconColor} />}
                </div>
                <span className={styles.nodeLabel}>{n.label}</span>
              </div>
            );
          })
        ) : (
          COMPONENTS.map(c => (
            <div
              key={c.type}
              className={styles.componentItem}
              draggable
              onDragStart={e => handleDragStart(e, c.type, c.label)}
            >
              <div className={styles.componentIcon}>
                <Icon name={c.icon} size={16} color="var(--primary-300)" />
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
