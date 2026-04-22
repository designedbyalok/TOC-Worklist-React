import React from 'react';
import styles from './EngagementCard.module.css';

export function EngagementCard({ engagementScore = 92, sentimentScore = 78, sentimentLabel = 'positive' }) {
  // --- Engagement State Logic ---
  const getEngState = (v) => {
    if (v >= 85) return {
      label: 'Excellent', color: '#009B53', light: '#4FD19A',
      halo: 'rgba(0,155,83,0.22)',
      chips: ['Clear intent', 'Strong outcome', 'Compliant'],
      haloA: 'rgba(140,90,226,0.07)', haloB: 'rgba(0,155,83,0.06)'
    };
    if (v >= 70) return {
      label: 'Good', color: '#009B53', light: '#4FD19A',
      halo: 'rgba(0,155,83,0.18)',
      chips: ['On-topic', 'Outcome met', 'Compliant'],
      haloA: 'rgba(140,90,226,0.06)', haloB: 'rgba(0,155,83,0.05)'
    };
    if (v >= 50) return {
      label: 'Fair', color: '#D9A50B', light: '#F1C94A',
      halo: 'rgba(217,165,11,0.22)',
      chips: ['Partial outcome', 'Minor drift'],
      haloA: 'rgba(217,165,11,0.08)', haloB: 'rgba(140,90,226,0.05)'
    };
    if (v >= 30) return {
      label: 'Needs review', color: '#D9A50B', light: '#F1C94A',
      halo: 'rgba(217,165,11,0.22)',
      chips: ['Outcome unclear', 'Disengaged', 'Review recommended'],
      haloA: 'rgba(217,165,11,0.10)', haloB: 'rgba(215,40,37,0.04)'
    };
    return {
      label: 'Poor', color: '#D72825', light: '#F47A7A',
      halo: 'rgba(215,40,37,0.22)',
      chips: ['Disengaged', 'Outcome missed', 'Compliance risk'],
      haloA: 'rgba(215,40,37,0.10)', haloB: 'rgba(215,40,37,0.05)'
    };
  };

  // --- Sentiment State Logic ---
  const getSentState = (v) => {
    if (v >= 80) return { emoji: '🤩', tag: 'Very positive', lbl: 'positive', color: '#009B53', light: '#4FD19A', bg: '#F5FFFA', border: 'rgba(0,155,83,0.22)' };
    if (v >= 60) return { emoji: '😄', tag: 'Positive', lbl: 'positive', color: '#009B53', light: '#4FD19A', bg: '#F5FFFA', border: 'rgba(0,155,83,0.22)' };
    if (v >= 45) return { emoji: '🙂', tag: 'Mostly positive', lbl: 'positive', color: '#009B53', light: '#4FD19A', bg: '#F5FFFA', border: 'rgba(0,155,83,0.18)' };
    if (v >= 30) return { emoji: '😐', tag: 'Neutral', lbl: 'neutral', color: '#D9A50B', light: '#F1C94A', bg: '#FFFCF5', border: 'rgba(217,165,11,0.24)' };
    if (v >= 15) return { emoji: '😕', tag: 'Negative', lbl: 'negative', color: '#D72825', light: '#F47A7A', bg: '#FFF5F5', border: 'rgba(215,40,37,0.22)' };
    return { emoji: '😞', tag: 'Very negative', lbl: 'negative', color: '#D72825', light: '#F47A7A', bg: '#FFF5F5', border: 'rgba(215,40,37,0.25)' };
  };

  const eng = getEngState(engagementScore);
  const sent = getSentState(sentimentScore);

  // Talk Ratio logic (mimicking the demo correlation)
  const agentRatio = Math.round(40 + (100 - engagementScore) * 0.30);
  const patientRatio = 100 - agentRatio;

  const R = 56;
  const CIRC = 2 * Math.PI * R;
  const offset = CIRC * (1 - engagementScore / 100);

  return (
    <div className={styles.card} style={{
      '--score-color': eng.color,
      '--score-light': eng.light,
      '--score-halo': eng.halo,
      '--halo-a': eng.haloA,
      '--halo-b': eng.haloB,
      '--sent-color': sent.color,
      '--sent-light': sent.light,
      '--sent-tag-bg': sent.bg,
      '--sent-tag-border': sent.border
    }}>
      {/* LEFT: Engagement Score */}
      <div className={styles.left}>
        <div className={styles.kicker}><span className={styles.dot}></span>Engagement Score</div>

        <div className={styles.scoreRow}>
          <div className={styles.scoreRing}>
            <svg viewBox="0 0 132 132" aria-hidden="true">
              <defs>
                <linearGradient id="gradScore" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--score-light)" />
                  <stop offset="100%" stopColor="var(--score-color)" />
                </linearGradient>
              </defs>
              <circle className={styles.track} cx="66" cy="66" r="56" fill="none" strokeWidth="10"></circle>
              <circle 
                className={styles.fill} 
                cx="66" cy="66" r="56" fill="none" strokeWidth="10" 
                strokeDasharray={CIRC.toFixed(2)}
                strokeDashoffset={offset}
              ></circle>
            </svg>
            <div className={styles.scoreCenter}>
              <div className={styles.scoreNum}>{engagementScore}<span className={styles.pct}>%</span></div>
              <div className={styles.scoreUnit}>of 100</div>
            </div>
          </div>

          <div className={styles.rating}>
            <div className={styles.ratingKicker}>Rating</div>
            <div className={styles.ratingValue}>{eng.label}</div>
            <div className={styles.ratingChips}>
              {eng.chips.map(chip => (
                <span key={chip} className={styles.chip}>{chip}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.divider}></div>

      {/* RIGHT: Sentiment & Talk Ratio */}
      <div className={styles.right}>
        <div>
          <div className={styles.sectionTitle}>Sentiment</div>
          <div className={styles.sentiment}>
            <div className={styles.emojiBig}>{sent.emoji}</div>
            <div className={styles.sentBody}>
              <div className={styles.sentHead}>
                <div className={styles.sentValue}>{sentimentScore}%<span className={styles.sentLbl}>{sent.lbl}</span></div>
                <div className={styles.sentTag}>{sent.tag}</div>
              </div>
              <div className={styles.sentBar} role="progressbar" aria-valuemin="0" aria-valuemax="100">
                <div className={styles.sentFill} style={{ width: `${sentimentScore}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className={styles.sectionTitle}>Talk Ratio <span className={styles.estimated}>· estimated</span></div>
          <div className={styles.talkTop}>
            <div className={styles.talkLabel}>Agent vs. Patient</div>
            <div className={styles.talkNums}>
              <span className={styles.talkAgentValue}>{agentRatio}%</span><span className={styles.slash}>/</span><span className={styles.talkPatientValue}>{patientRatio}%</span>
            </div>
          </div>
          <div className={styles.talkBar}>
            <div className={styles.talkAgentBar} style={{ width: `${agentRatio}%` }}></div>
            <div className={styles.talkPatientBar} style={{ width: `${patientRatio}%` }}></div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="6.2"/><path d="M8 5.2v3.6"/><circle cx="8" cy="11" r="0.6" fill="currentColor" stroke="none"/>
        </svg>
        Based on the end of the conversation (LLM). Re-check the transcript if needed.
      </div>
    </div>
  );
}
