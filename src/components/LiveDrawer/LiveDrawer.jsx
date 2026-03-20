import { useState, useEffect } from 'react';
import { Icon } from '../Icon/Icon';
import { useAppStore } from '../../store/useAppStore';
import styles from './LiveDrawer.module.css';

export function LiveDrawer() {
  const liveDrawerPatient = useAppStore(s => s.liveDrawerPatient);
  const closeLiveDrawer = useAppStore(s => s.closeLiveDrawer);
  const patients = useAppStore(s => s.patients);
  const showToast = useAppStore(s => s.showToast);
  const [listenActive, setListenActive] = useState(false);
  const [muteActive, setMuteActive] = useState(false);

  const p = patients.find(x => x.id === liveDrawerPatient);
  if (!p) return null;

  const goals = p.liveGoals || [];
  const transcript = p.liveTranscript || [];

  return (
    <>
      <div className={styles.overlay} onClick={closeLiveDrawer} />
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.liveTag}>
              <span className={styles.liveDot} />
              Live Call
            </div>
            <button className={styles.closeBtn} onClick={closeLiveDrawer}>
              <Icon name="solar:close-circle-linear" size={20} />
            </button>
          </div>
          <div className={styles.patientInfo}>
            <div className={styles.patientName}>{p.name}</div>
            <div className={styles.patientMeta}>{p.facility} • {p.admitReason}</div>
          </div>
          <div className={styles.timer}>{p.callDuration || '00:00'}</div>
        </div>

        {/* Action buttons */}
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${listenActive ? styles.active : ''}`}
            onClick={() => setListenActive(v => !v)}
          >
            <Icon name="solar:headphones-round-sound-bold" size={16} />
            Live Listen
          </button>
          <button className={styles.actionBtn} onClick={() => showToast('Take Over Call – coming soon')}>
            <Icon name="solar:phone-calling-bold" size={16} />
            Take Over Call
          </button>
          <button
            className={`${styles.actionBtn} ${muteActive ? styles.active : ''}`}
            onClick={() => setMuteActive(v => !v)}
          >
            <Icon name="solar:microphone-slash-linear" size={16} />
            Mute
          </button>
        </div>

        <div className={styles.body}>
          {/* Goals Section */}
          <div className={styles.goalsSection}>
            <div className={styles.sectionTitle}>
              <Icon name="solar:target-bold" size={15} color="var(--primary-300)" />
              Goals Tracking
            </div>
            {goals.map((g, i) => (
              <div key={i} className={`${styles.goalRow} ${g.done ? styles.completed : ''}`}>
                <Icon
                  name={g.done ? "solar:check-circle-bold" : "solar:clock-circle-linear"}
                  size={16}
                  color={g.done ? "#059669" : "var(--neutral-200)"}
                />
                <span className={styles.goalLabel}>{g.name}</span>
                {g.done && g.time && (
                  <span className={styles.goalTime}>
                    <Icon name="solar:check-circle-bold" size={12} color="#059669" /> {g.time}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Transcript */}
          <div className={styles.transcriptSection}>
            <div className={styles.sectionTitle}>
              <Icon name="solar:chat-round-dots-bold" size={15} color="var(--primary-300)" />
              Live Transcript
            </div>
            {transcript.map((msg, i) => (
              <div key={i} className={`${styles.message} ${styles[msg.sender]}`}>
                {msg.sender === 'agent' && (
                  <div className={styles.msgAvatar}>
                    <Icon name="solar:bot-bold" size={14} color="var(--primary-300)" />
                  </div>
                )}
                <div className={styles.msgContent}>
                  <div className={styles.msgSender}>{msg.name}</div>
                  <div className={styles.msgBubble}>{msg.text}</div>
                  <div className={styles.msgTime}>{msg.time}</div>
                </div>
              </div>
            ))}
            {/* Typing indicator */}
            <div className={styles.typing}>
              <Icon name="solar:bot-bold" size={14} color="var(--primary-300)" />
              <span>{p.agentAssigned || 'Anna'} is speaking</span>
              <span className={styles.typingDots}>
                <span>.</span><span>.</span><span>.</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
