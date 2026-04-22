import { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '../Icon/Icon';
import { Button } from '../Button/Button';
import { ActionButton } from '../ActionButton/ActionButton';
import { Drawer } from '../Drawer/Drawer';
import { useAppStore } from '../../store/useAppStore';
import { EngagementCard } from '../EngagementCard/EngagementCard';
import styles from './DetailDrawer.module.css';

/* ── Waveform data (seeded random heights for consistent look) ── */
const WAVE_BARS = Array.from({ length: 80 }, (_, i) => {
  const seed = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return 3 + (seed - Math.floor(seed)) * 12;
});

const TOTAL_DURATION = 604; // 10:04 in seconds

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function DetailDrawer() {
  const detailPatient = useAppStore(s => s.detailPatient);
  const detailPatientCalls = useAppStore(s => s.detailPatientCalls);
  const closeDetail = useAppStore(s => s.closeDetail);
  const showToast = useAppStore(s => s.showToast);
  const [openSections, setOpenSections] = useState({ goals: true, summary: true, transcript: true });
  const [showTranscript, setShowTranscript] = useState(true);

  // Audio playback state
  const [playState, setPlayState] = useState('idle'); // idle | playing | paused
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const startPlayback = useCallback(() => {
    setPlayState('playing');
    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        if (prev >= TOTAL_DURATION) {
          clearInterval(timerRef.current);
          setPlayState('idle');
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  }, []);

  const pausePlayback = useCallback(() => {
    clearInterval(timerRef.current);
    setPlayState('paused');
  }, []);

  const stopPlayback = useCallback(() => {
    clearInterval(timerRef.current);
    setPlayState('idle');
    setElapsed(0);
  }, []);

  useEffect(() => () => clearInterval(timerRef.current), []);

  if (!detailPatient) return null;
  const p = detailPatient;

  // Resolve call data from call_details records
  const completedCall = (detailPatientCalls || []).find(c => c.callType === 'completed');
  const callRecord = completedCall || {};
  const goalsDetail = callRecord.goalsDetail || [];
  const callSummary = callRecord.callSummary || null;
  const callTranscript = callRecord.callTranscript || [];
  const callDate = callRecord.startedAt || p.callDate || null;
  const callDurationFull = callRecord.duration || p.callDurationFull || null;
  const agentName = callRecord.agentName || 'Anna';

  // Show voicemail attempts if available
  const voicemailCalls = (detailPatientCalls || []).filter(c => c.callType === 'voicemail');

  const toggleSection = (key) => setOpenSections(s => ({ ...s, [key]: !s[key] }));
  const progress = TOTAL_DURATION > 0 ? elapsed / TOTAL_DURATION : 0;
  const progressBarIdx = Math.floor(progress * WAVE_BARS.length);

  return (
    <Drawer title="Call Details" onClose={closeDetail}>
      {/* ── Call Info Card ── */}
      <div className={styles.callCard}>
        <div className={styles.callCardLeft}>
          <div className={styles.callIcon}>
            <Icon name="solar:outgoing-call-bold" size={24} color="#e8742c" />
          </div>
          <div className={styles.callInfo}>
            <div className={styles.callLine1}>
              Outgoing Call
              <span className={styles.dot}>•</span>
              <span className={styles.callLine1Detail}>{callDate || '11/28/2023 10:55'}</span>
              <span className={styles.dot}>•</span>
              <span className={styles.callLine1Detail}>{callDurationFull || '05:20'}s</span>
            </div>
            <div className={styles.callLine2}>
              Via: <Icon name="solar:bot-bold" size={13} color="var(--primary-300)" /> {agentName} (581) 824-1591 → To: {p.name} (581) 824-1591
            </div>
            {p.facility && (
              <div className={styles.callLine2}>{p.facility} • {p.admitReason}</div>
            )}
          </div>
        </div>
        <div className={styles.callCardActions} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ActionButton icon="solar:phone-linear" size="L" tooltip="Call" className={styles.callCardBtn} />
          <span style={{ width: 1, height: 16, background: 'var(--neutral-150)', flexShrink: 0 }} />
          <ActionButton icon="solar:menu-dots-linear" size="L" tooltip="More options" className={styles.callCardBtn} />
        </div>
      </div>

      {/* ── Engagement Card (Replaces Compliance, Quality, Sentiment, Sub-agents, Intents) ── */}
      {(callRecord.qualityScore || callRecord.sentimentScore) && (
        <EngagementCard 
          engagementScore={callRecord.qualityScore?.overall || 0}
          sentimentScore={callRecord.sentimentScore?.overall || 0}
          sentimentLabel={callRecord.sentimentScore?.label || 'neutral'}
        />
      )}

      {/* Escalation Details */}

      {/* Security Badges */}
      {callRecord.security && (
        <div className={styles.securityRow}>
          <span className={`${styles.secBadge} ${callRecord.security.piiScrubbed ? styles.secPass : styles.secFail}`}>
            <Icon name="solar:shield-check-bold" size={12} />
            {callRecord.security.piiScrubbed ? 'PII Scrubbed' : 'PII Present'}
          </span>
          <span className={styles.secBadge}>
            <Icon name="solar:map-point-bold" size={12} />
            {callRecord.security.stateCompliance}
          </span>
          <span className={styles.secBadge}>
            <Icon name="solar:clock-circle-bold" size={12} />
            {callRecord.security.dataRetentionDays}d retention
          </span>
          {callRecord.security.promptInjectionDetected && (
            <span className={`${styles.secBadge} ${styles.secAlert}`}>
              <Icon name="solar:danger-triangle-bold" size={12} />
              Injection Alert
            </span>
          )}
        </div>
      )}

      {/* ── Goals Tracking ── */}
      <div className={styles.sectionHeader} onClick={() => toggleSection('goals')}>
        <span className={styles.sectionTitle}>Goals Tracking</span>
        <span className={`${styles.chevron} ${openSections.goals ? styles.chevronOpen : ''}`}>
          <Icon name="solar:alt-arrow-right-linear" size={16} />
        </span>
      </div>
      {openSections.goals && (
        <div className={styles.goalsContainer}>
          {goalsDetail?.length > 0 ? goalsDetail.map((g, i) => (
            <div key={i} className={styles.goalRow}>
              <span className={styles.goalIcon}>
                <Icon name={g.pass ? "solar:check-circle-bold" : "solar:close-circle-bold"}
                  size={18} color={g.pass ? "var(--status-success)" : "var(--status-error)"} />
              </span>
              <div className={styles.goalInfo}>
                <div className={styles.goalName}>{g.name}</div>
                <div className={styles.goalDesc}>{g.desc}</div>
              </div>
              <span className={`${styles.goalBadge} ${g.pass ? styles.pass : styles.fail}`}>
                {g.pass ? 'Pass' : 'Fail'}
              </span>
            </div>
          )) : (
            <div style={{ padding: '16px', fontSize: 13, color: 'var(--neutral-300)', textAlign: 'center' }}>
              No goals data available for this patient yet.
            </div>
          )}
        </div>
      )}

      {/* ── Unity-Generated Call Summary ── */}
      <div className={styles.sectionHeader} onClick={() => toggleSection('summary')}>
        <span className={`${styles.sectionTitle} ${styles.purple}`}>
          <Icon name="solar:magic-stick-3-bold" size={14} color="var(--primary-300)" />
          Unity-Generated Call Summary
        </span>
        <span className={`${styles.chevron} ${openSections.summary ? styles.chevronOpen : ''}`}>
          <Icon name="solar:alt-arrow-right-linear" size={16} />
        </span>
      </div>
      {openSections.summary && !callSummary && (
        <div style={{ padding: '16px', fontSize: 13, color: 'var(--neutral-300)', textAlign: 'center' }}>
          No call summary generated yet. Summary will appear after a completed call.
        </div>
      )}
      {openSections.summary && callSummary && (
        <div className={styles.summaryContainer}>
          <div className={styles.summaryInner}>
            <div className={styles.summaryLabel}>Key Points Discussed:</div>
            <ul className={styles.summaryList}>
              {callSummary.keyPoints.map((pt, i) => <li key={i}>{pt}</li>)}
            </ul>
            <div className={styles.summaryLabel} style={{ marginTop: 12 }}>Action Items:</div>
            <ol className={styles.summaryList}>
              {callSummary.actionItems.map((a, i) => <li key={i}>{a}</li>)}
            </ol>
            <div className={styles.summaryFooter}>
              <span className={styles.generatedText}>Generated on: 03/24/26, 07:23 pm</span>
              <div className={styles.summaryActions} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ActionButton icon="solar:refresh-linear" size="L" tooltip="Refresh" className={styles.summaryBtn} onClick={(e) => { e.stopPropagation(); showToast('Refreshing summary...'); }} />
                <span style={{ width: 1, height: 16, background: 'var(--neutral-150)', flexShrink: 0 }} />
                <ActionButton icon="solar:copy-linear" size="L" tooltip="Copy" className={styles.summaryBtn} onClick={(e) => { e.stopPropagation(); showToast('Copied to clipboard'); }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Call Recording & Transcript ── */}
      <div className={styles.sectionHeader} onClick={() => toggleSection('transcript')}>
        <span className={styles.sectionTitle}>Call Recording &amp; Transcript</span>
        <span className={`${styles.chevron} ${openSections.transcript ? styles.chevronOpen : ''}`}>
          <Icon name="solar:alt-arrow-right-linear" size={16} />
        </span>
      </div>
      {openSections.transcript && (!callTranscript || callTranscript.length === 0) && (
        <div style={{ padding: '16px', fontSize: 13, color: 'var(--neutral-300)', textAlign: 'center' }}>
          No call recording available. Recording will appear after a completed call.
        </div>
      )}
      {openSections.transcript && callTranscript?.length > 0 && (
        <div className={styles.recordingContainer}>
          {/* Audio Player */}
          <div className={styles.audioPlayer}>
            <span className={styles.audioTime}>
              {playState === 'idle' ? `00:${p.callDurationFull || '10:04'}` : formatTime(elapsed)}
            </span>
            <div className={styles.waveformContainer}>
              <div className={styles.waveform}>
                {WAVE_BARS.map((h, i) => (
                  <div
                    key={i}
                    className={`${styles.waveBar} ${i <= progressBarIdx && playState !== 'idle' ? styles.waveBarPlayed : styles.waveBarUnplayed}`}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>
            <div className={styles.audioButtons}>
              {playState === 'idle' && (
                <Button variant="primary" size="S" leadingIcon="solar:play-bold" className={styles.playBtn} onClick={startPlayback}>
                  Play Recording
                </Button>
              )}
              {playState === 'playing' && (
                <>
                  <Button variant="secondary" size="S" leadingIcon="solar:pause-bold" className={styles.pauseBtn} onClick={pausePlayback}>
                    Pause
                  </Button>
                  <Button variant="ghost" size="S" leadingIcon="solar:stop-bold" className={styles.stopBtn} onClick={stopPlayback}>
                    Stop
                  </Button>
                </>
              )}
              {playState === 'paused' && (
                <>
                  <Button variant="primary" size="S" leadingIcon="solar:play-bold" className={styles.playBtn} onClick={startPlayback}>
                    Resume
                  </Button>
                  <Button variant="ghost" size="S" leadingIcon="solar:stop-bold" className={styles.stopBtn} onClick={stopPlayback}>
                    Stop
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Transcript Sub-section */}
          <div className={styles.transcriptSubHeader} onClick={() => setShowTranscript(v => !v)}>
            <span className={styles.transcriptSubTitle}>Call Transcript</span>
            <span className={`${styles.chevron} ${showTranscript ? styles.chevronOpen : ''}`}>
              <Icon name="solar:alt-arrow-right-linear" size={14} color="var(--neutral-200)" />
            </span>
          </div>

          {showTranscript && (
            <div className={styles.transcriptBody}>
              <div className={styles.transcriptDivider}><span>Today</span></div>
              <div className={styles.connectionLine}>
                <Icon name="solar:phone-calling-linear" size={14} />
                Outgoing Call Connected from Anna <span className={styles.connTime}>9:28 PM</span>
              </div>
              {callTranscript.map((msg, i) => (
                <div key={i} className={`${styles.message} ${styles[msg.sender]}`}>
                  {msg.sender === 'agent' && (
                    <div className={styles.msgAvatar}>
                      <Icon name="solar:bot-bold" size={12} color="var(--primary-300)" />
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
      )}
    </Drawer>
  );
}
