import { useState } from 'react';
import { Icon } from '../Icon/Icon';
import { Avatar } from '../Avatar/Avatar';
import { useAppStore } from '../../store/useAppStore';
import styles from './DetailDrawer.module.css';

export function DetailDrawer() {
  const detailPatient = useAppStore(s => s.detailPatient);
  const closeDetail = useAppStore(s => s.closeDetail);
  const showToast = useAppStore(s => s.showToast);
  const [openSections, setOpenSections] = useState({ goals: true, summary: true, transcript: false });

  if (!detailPatient) return null;
  const p = detailPatient;

  const toggleSection = (key) => setOpenSections(s => ({ ...s, [key]: !s[key] }));

  return (
    <>
      <div className={styles.overlay} onClick={closeDetail} />
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>Call Details</h2>
          <button className={styles.closeBtn} onClick={closeDetail}>✕</button>
        </div>

        <div className={styles.body}>
          {/* Call Info */}
          <div className={styles.callCard}>
            <div className={styles.callCardLeft}>
              <div className={styles.callIcon}>
                <Icon name="solar:phone-calling-bold" size={18} color="#059669" />
              </div>
              <div className={styles.callInfo}>
                <div className={styles.callLine1}>
                  Outgoing Call <span className={styles.dot}>•</span> {p.callDate || '11/28/2025 10:55'} <span className={styles.dot}>•</span> {p.callDurationFull || '05:29'}s
                </div>
                <div className={styles.callLine2}>
                  Via: <Icon name="solar:bot-bold" size={13} color="var(--primary-300)" /> Anna (581) 824-1591 → To: {p.name} (581) 824-1591
                </div>
              </div>
            </div>
            <div className={styles.callCardActions}>
              <button className={styles.callCardBtn}><Icon name="solar:phone-linear" size={16} /></button>
              <button className={styles.callCardBtn}><Icon name="solar:menu-dots-linear" size={16} /></button>
            </div>
          </div>

          {/* Goals Tracking */}
          <div className={styles.sectionHeader} onClick={() => toggleSection('goals')}>
            <span className={styles.sectionTitle}>Goals Tracking</span>
            <Icon name="solar:alt-arrow-down-linear" size={16} color="var(--neutral-300)"
              style={{ transform: openSections.goals ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }} />
          </div>
          {openSections.goals && p.goalsDetail && (
            <div className={styles.goalsContent}>
              {p.goalsDetail.map((g, i) => (
                <div key={i} className={`${styles.goalRow} ${g.pass ? styles.goalPass : styles.goalFail}`}>
                  <Icon name={g.pass ? "solar:check-circle-bold" : "solar:close-circle-bold"}
                    size={18} color={g.pass ? "#059669" : "#DC2626"} />
                  <div className={styles.goalInfo}>
                    <div className={styles.goalName}>{g.name}</div>
                    <div className={styles.goalDesc}>{g.desc}</div>
                  </div>
                  <span className={`${styles.goalBadge} ${g.pass ? styles.pass : styles.fail}`}>
                    {g.pass ? 'Pass' : 'Fail'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Unity-Generated Call Summary */}
          <div className={styles.sectionHeader} onClick={() => toggleSection('summary')}>
            <span className={styles.sectionTitle}>
              <Icon name="solar:magic-stick-3-bold" size={14} color="var(--primary-300)" />
              Unity-Generated Call Summary
            </span>
            <Icon name="solar:alt-arrow-down-linear" size={16} color="var(--neutral-300)"
              style={{ transform: openSections.summary ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }} />
          </div>
          {openSections.summary && p.callSummary && (
            <div className={styles.summaryContent}>
              <div className={styles.summaryLabel}>Key Points Discussed:</div>
              <ul className={styles.summaryList}>
                {p.callSummary.keyPoints.map((pt, i) => <li key={i}>{pt}</li>)}
              </ul>
              <div className={styles.summaryLabel} style={{ marginTop: 16 }}>Action Items:</div>
              <ol className={styles.summaryList}>
                {p.callSummary.actionItems.map((a, i) => <li key={i}>{a}</li>)}
              </ol>
              <div className={styles.summaryFooter}>
                <span className={styles.generatedText}>Generated on: 03/24/26, 07:23 pm</span>
                <div className={styles.summaryActions}>
                  <button className={styles.summaryBtn} onClick={() => showToast('Refreshing summary...')} title="Refresh">
                    <Icon name="solar:refresh-linear" size={16} />
                  </button>
                  <button className={styles.summaryBtn} onClick={() => showToast('Copied to clipboard')} title="Copy">
                    <Icon name="solar:copy-linear" size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Call Recording & Transcript */}
          <div className={styles.sectionHeader} onClick={() => toggleSection('transcript')}>
            <span className={styles.sectionTitle}>Call Recording &amp; Transcript</span>
            <Icon name="solar:alt-arrow-down-linear" size={16} color="var(--neutral-300)"
              style={{ transform: openSections.transcript ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }} />
          </div>
          {openSections.transcript && p.callTranscript && (
            <div className={styles.transcriptContent}>
              {/* Audio Player */}
              <div className={styles.audioPlayer}>
                <span className={styles.audioTime}>00:{p.callDurationFull || '10:04'}</span>
                <div className={styles.waveform}>
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className={styles.waveBar} style={{ height: `${12 + Math.random() * 20}px` }} />
                  ))}
                </div>
                <button className={styles.playBtn}>
                  <Icon name="solar:play-bold" size={14} /> Play Recording
                </button>
              </div>

              {/* Transcript label */}
              <div className={styles.transcriptLabel}>
                Call Transcript <Icon name="solar:alt-arrow-down-linear" size={14} />
              </div>

              {/* Today divider */}
              <div className={styles.transcriptDivider}><span>Today</span></div>

              {/* Connection line */}
              <div className={styles.connectionLine}>
                <Icon name="solar:phone-calling-linear" size={14} />
                Outgoing Call Connected from Anna <span className={styles.connTime}>9:28 PM</span>
              </div>

              {/* Messages */}
              {p.callTranscript.map((msg, i) => (
                <div key={i} className={`${styles.message} ${styles[msg.sender]}`}>
                  {msg.sender === 'agent' && (
                    <div className={styles.msgAvatar}>
                      <Icon name="solar:bot-bold" size={14} color="var(--primary-300)" />
                    </div>
                  )}
                  <div className={styles.msgContent}>
                    <div className={styles.msgHeader}>
                      <span className={styles.msgSender}>{msg.name}</span>
                      <button className={styles.msgMore}><Icon name="solar:menu-dots-linear" size={14} /></button>
                    </div>
                    <div className={styles.msgBubble}>{msg.text}</div>
                    <div className={styles.msgTime}>
                      Today, {msg.time}
                      {msg.sender === 'patient' && <span className={styles.readReceipt}> ✓✓</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
