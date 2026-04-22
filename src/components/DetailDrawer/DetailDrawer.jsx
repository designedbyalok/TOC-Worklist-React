import { useState, useRef, useCallback, useEffect } from 'react';
import { Icon } from '../Icon/Icon';
import { Button } from '../Button/Button';
import { ActionButton } from '../ActionButton/ActionButton';
import { Drawer } from '../Drawer/Drawer';
import { useAppStore } from '../../store/useAppStore';
import { EngagementCard } from '../EngagementCard/EngagementCard';
import { GoalProgress } from '../GoalProgress/GoalProgress';
import { CallTypeAvatar, DIR_LABEL } from '../Avatar/CallTypeAvatar';
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
  const activeCallRow = useAppStore(s => s.activeCallRow);
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

  // Resolve the specific call record for the clicked row, then fall back to first completed
  const specificCall = activeCallRow?.id
    ? (detailPatientCalls || []).find(c => c.id === activeCallRow.id)
    : null;
  const completedCall = specificCall || (detailPatientCalls || []).find(c => c.callType === 'completed');
  const callRecord = completedCall || {};
  const goalsDetail = callRecord.goalsDetail || [];
  const callSummary = callRecord.callSummary || null;
  const callTranscript = callRecord.callTranscript || [];

  // Sync with activeCallRow if available
  const callDate = activeCallRow?.date || callRecord.startedAt || p.callDate || null;
  const callDurationFull = activeCallRow?.duration || callRecord.duration || p.callDurationFull || null;
  const callDir = activeCallRow?.dir || callRecord.direction || (callRecord.callType === 'voicemail' ? 'missed' : callRecord.callType === 'declined' ? 'declined' : 'outgoing');
  const agentName = activeCallRow?.agent || callRecord.agentName || 'Anna';
  const isMissedOrDeclined = callDir === 'missed' || callDir === 'declined';

  const toggleSection = (key) => setOpenSections(s => ({ ...s, [key]: !s[key] }));
  const progress = TOTAL_DURATION > 0 ? elapsed / TOTAL_DURATION : 0;
  const progressBarIdx = Math.floor(progress * WAVE_BARS.length);

  return (
    <Drawer title="Call Details" onClose={closeDetail}>
      {/* ── Call Info Card ── */}
      <div className={styles.callCard}>
        <div className={styles.callCardLeft}>
          <CallTypeAvatar dir={callDir} size={40} iconSize={20} />
          <div className={styles.callInfo}>
            <div className={styles.callLine1}>
              {DIR_LABEL[callDir]} Call
              <span className={styles.dot}>•</span>
              <span className={styles.callLine1Detail}>{callDate}</span>
              <span className={styles.dot}>•</span>
              <span className={styles.callLine1Detail}>{callDurationFull}</span>
              {detailPatientCalls?.length > 1 && (
                <>
                  <span className={styles.dot}>•</span>
                  <span className={styles.callLine1Detail}>{detailPatientCalls.length} calls</span>
                </>
              )}
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

      {/* ── Empty state for missed / declined calls ── */}
      {isMissedOrDeclined ? (
        <div className={styles.noCallState}>
          <CallTypeAvatar dir={callDir} size={36} iconSize={18} />
          <div className={styles.noCallStateTitle}>
            {callDir === 'declined' ? 'Patient declined this call.' : 'Call was not connected.'}
          </div>
          <div className={styles.noCallStateDesc}>
            No recording, transcript, goals, or summary available for this call.
          </div>
        </div>
      ) : (
        <>
          {/* ── Engagement Card ── */}
          {(callRecord.qualityScore || callRecord.sentimentScore || activeCallRow?.engagementScore) && (
            <EngagementCard
              engagementScore={activeCallRow?.engagementScore ?? callRecord.qualityScore?.overall ?? 0}
              sentimentScore={callRecord.sentimentScore?.overall || 0}
              sentimentLabel={callRecord.sentimentScore?.label || 'neutral'}
            />
          )}

          {/* ── Goal Progress ── */}
          {goalsDetail?.length > 0 && <GoalProgress goalsDetail={goalsDetail} />}

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
                    {DIR_LABEL[callDir] || 'Outgoing'} Call Connected from {agentName} <span className={styles.connTime}>9:28 PM</span>
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
        </>
      )}
    </Drawer>
  );
}
