import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Drawer } from '../Drawer/Drawer';
import { Icon } from '../Icon/Icon';
import { Button } from '../Button/Button';
import { ActionButton } from '../ActionButton/ActionButton';
import { Badge } from '../Badge/Badge';
import { PatientBanner } from '../PatientBanner/PatientBanner';
import styles from './CallQueueDrawer.module.css';

/* ── Helper: generate simple goal set ── */
function makeGoals(passCount, total = 7) {
  const mandatory = [
    { name: 'Greeting & reason for call', desc: 'Agent clearly introduces themselves, the organization, and the purpose of the call in patient-friendly language.', pass: passCount >= 1 },
    { name: 'Verify identity (2-factor)', desc: 'Successfully validates patient identity using two-factor authentication before discussing any PHI.', pass: passCount >= 2 },
    { name: 'Explain what I can and can\'t do', desc: 'Agent clearly explains capabilities, limitations, and how emergencies or urgent issues are handled.', pass: passCount >= 3 },
  ];
  const optional = [
    { name: 'Support patient goal (e.g., schedule visit)', desc: 'Correctly understands the patient\'s goal and completes the requested workflow (such as scheduling a visit) without errors.', pass: passCount >= 4 },
    { name: 'Summarize next steps', desc: 'Provides a concise, plain-language recap of actions taken and what will happen next, including any follow-ups.', pass: passCount >= 5 },
    { name: 'Close with reminder', desc: 'Ends the interaction with a friendly reminder of key details (e.g., appointment time, prep instructions, contact options).', pass: passCount >= 6 },
    { name: 'Escalation for red flags', desc: 'Correctly detects clinical or safety red flags and escalates to the appropriate human clinician or care team according to protocol.', pass: passCount >= 7 },
  ];
  const mandatoryMet = mandatory.every(g => g.pass);
  return { progress: Math.round((passCount / total) * 100), passed: passCount, total, mandatory, optional, mandatoryMet };
}

/* ── Mock data ── */
const ONGOING_CALLS = [
  { id: 'oc1', initials: 'IB', name: 'Isabella Brooks', gender: 'Female', dob: '06/15/1988', age: 35, duration: '02:30' },
  { id: 'oc2', initials: 'LT', name: 'Liam Thompson', gender: 'Male', dob: '11/22/1990', age: 32, duration: '02:35' },
  { id: 'oc3', initials: 'MJ', name: 'Mia Johnson', gender: 'Female', dob: '03/10/1995', age: 28, duration: '02:38' },
  { id: 'oc4', initials: 'AR', name: 'Aiden Rodriguez', gender: 'Male', dob: '05/05/1985', age: 38, duration: '02:30' },
  { id: 'oc5', initials: 'ST', name: 'Sophia Taylor', gender: 'Female', dob: '12/30/1992', age: 30, duration: '02:39' },
];

const QUEUED_MEMBERS = [
  { id: 'q1', initials: 'AJ', name: 'Ava Johnson', gender: 'Female', dob: '02/03/1975', age: 48, priority: 1 },
  { id: 'q2', initials: 'EC', name: 'Ethan Carter', gender: 'Male', dob: '09/10/1982', age: 41, priority: 2 },
  { id: 'q3', initials: 'MG', name: 'Mia Garcia', gender: 'Female', dob: '12/18/2000', age: 22, priority: 3 },
];

const ALL_PATIENTS = [
  { initials: 'JW', name: 'James Wilson', gender: 'Male', age: 67, memberId: '#219384756102', raf: '4.234', rafChange: '+0.512' },
  { initials: 'OC', name: 'Olivia Clark', gender: 'Female', age: 45, memberId: '#219384756103', raf: '2.110', rafChange: '+0.080' },
  { initials: 'MR', name: 'Michael Roberts', gender: 'Male', age: 58, memberId: '#219384756104', raf: '3.450', rafChange: '+0.230' },
  { initials: 'MG', name: 'Mia Garcia', gender: 'Female', age: 22, memberId: '#219384756105', raf: '1.200', rafChange: '+0.000' },
  { initials: 'AS', name: 'Ava Smith', gender: 'Female', age: 34, memberId: '#219384756106', raf: '1.890', rafChange: '+0.120' },
  { initials: 'CT', name: 'Christopher Taylor', gender: 'Male', age: 71, memberId: '#219384756107', raf: '5.120', rafChange: '+0.340' },
  { initials: 'LW', name: 'Liam White', gender: 'Male', age: 52, memberId: '#219384756108', raf: '2.780', rafChange: '+0.190' },
  { initials: 'EM', name: 'Emma Martinez', gender: 'Female', age: 39, memberId: '#219384756109', raf: '1.560', rafChange: '+0.070' },
  { initials: 'SL', name: 'Sophia Lee', gender: 'Female', age: 61, memberId: '#219384756110', raf: '3.890', rafChange: '+0.410' },
  { initials: 'DK', name: 'Daniel Kim', gender: 'Male', age: 48, memberId: '#219384756111', raf: '2.340', rafChange: '+0.150' },
  { initials: 'RH', name: 'Rachel Harris', gender: 'Female', age: 55, memberId: '#219384756112', raf: '3.010', rafChange: '+0.280' },
  { initials: 'NP', name: 'Nathan Patel', gender: 'Male', age: 73, memberId: '#219384756113', raf: '4.780', rafChange: '+0.610' },
  { initials: 'LJ', name: 'Laura Jackson', gender: 'Female', age: 41, memberId: '#219384756114', raf: '1.440', rafChange: '+0.050' },
  { initials: 'BT', name: 'Brian Thomas', gender: 'Male', age: 66, memberId: '#219384756115', raf: '3.670', rafChange: '+0.320' },
  { initials: 'KA', name: 'Karen Anderson', gender: 'Female', age: 79, memberId: '#219384756116', raf: '5.890', rafChange: '+0.740' },
  { initials: 'JC', name: 'Jason Chen', gender: 'Male', age: 37, memberId: '#219384756117', raf: '1.120', rafChange: '+0.030' },
  { initials: 'MW', name: 'Maria Williams', gender: 'Female', age: 63, memberId: '#219384756118', raf: '2.950', rafChange: '+0.210' },
  { initials: 'DP', name: 'David Park', gender: 'Male', age: 50, memberId: '#219384756119', raf: '2.560', rafChange: '+0.170' },
];

const CALL_TIMES_POOL = ['10:50 PM', '09:24 PM', '08:15 PM', '07:33 PM', '06:48 PM', '05:19 PM', '05:10 PM', '04:37 PM', '04:33 PM', '03:45 PM', '02:58 PM', '02:15 PM', '01:45 PM', '01:12 PM', '12:30 PM', '11:45 AM', '11:30 AM', '10:15 AM'];
const DURATIONS_POOL = ['02:39', '03:12', '02:15', '00:00', '01:47', '03:02', '02:50', '02:22', '01:58', '03:15', '01:33', '02:08', '04:01', '01:22', '02:45', '03:28', '01:55', '02:10'];

/* Seeded pseudo-random for deterministic but varied data */
function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

function generateDateGroup(date, idx) {
  const rng = seededRandom(idx * 7919 + 31);
  const callCount = 12 + Math.floor(rng() * 8); // 12-19 calls per day
  const shuffled = [...ALL_PATIENTS].sort(() => rng() - 0.5);
  const patients = [];
  while (patients.length < callCount) {
    patients.push(...shuffled);
  }

  return {
    date,
    agentInfo: 'Erica \u2022 TOC Agent \u2022 Ver. 1.3',
    calls: patients.slice(0, callCount).map((s, i) => {
      const r = rng();
      const isFailed = r < 0.12; // ~12% failure rate
      const passCount = isFailed ? 0 : (3 + Math.floor(rng() * 5)); // 3-7 goals passed
      return {
        id: `cl-${idx}-${i}`,
        ...s,
        calledAt: CALL_TIMES_POOL[i % CALL_TIMES_POOL.length],
        status: isFailed ? 'Failed' : 'Successful',
        duration: isFailed ? '00:00' : DURATIONS_POOL[Math.floor(rng() * DURATIONS_POOL.length)],
        goals: isFailed ? null : makeGoals(Math.min(passCount, 7)),
      };
    }),
  };
}

const CALL_LOG_GROUPS = Array.from({ length: 11 }, (_, i) => {
  const day = 15 - i;
  return generateDateGroup(`01/${String(day).padStart(2, '0')}/2026`, i);
});

const TABS = ['Ongoing Call', 'In Queue', 'Call Log'];

/* ── Shared components ── */

function MemberCell({ initials, name, subtitle, onClick, selected }) {
  return (
    <div className={`${styles.memberCell} ${onClick ? styles.memberCellClickable : ''} ${selected ? styles.memberCellSelected : ''}`} onClick={onClick}>
      <div className={styles.memberAvatar}>{initials}</div>
      <div className={styles.memberInfo}>
        <span className={styles.memberName}>{name}</span>
        <span className={styles.memberMeta}>{subtitle}</span>
      </div>
    </div>
  );
}

/* ── Search bar ── */
function SearchBar({ value, onChange, onClose }) {
  return (
    <div className={styles.searchBar}>
      <Icon name="solar:magnifer-linear" size={15} color="var(--neutral-300)" />
      <input
        autoFocus
        type="text"
        placeholder="Search\u2026"
        value={value}
        onChange={e => onChange(e.target.value)}
        className={styles.searchInput}
      />
      <button className={styles.searchClose} onClick={onClose}>&times;</button>
    </div>
  );
}

/* ── Goal Detail Panel ── */

export function GoalDetailPanel({ call }) {
  if (!call) return null;
  const { goals } = call;
  const goalsMet = goals && goals.mandatoryMet;

  return (
    <>
      {/* Patient banner (reusable component) */}
      <PatientBanner
        initials={call.initials}
        name={call.name}
        gender={call.gender}
        age={`${call.age}y 2m`}
        memberId={call.memberId}
        raf={call.raf}
        rafChange={call.rafChange}
        onCall={() => {}}
      />

      {/* Goal Progress */}
      {goals && (
        <div className={styles.detailGoals}>
          <div className={styles.goalProgressHeader}>
            <span className={styles.goalProgressLabel}>Goal Progress</span>
            <Badge
              variant={goalsMet ? 'compliance-pass' : 'compliance-fail'}
              label={goalsMet ? 'Goals Met' : 'Goals Not Met'}
              icon="solar:info-circle-linear"
            />
          </div>
          <div className={styles.goalProgressBar}>
            <div className={styles.goalProgressFill} style={{ width: `${goals.progress}%`, background: goalsMet ? '#009b53' : '#D72825' }} />
          </div>
          <span className={styles.goalProgressText}>{goals.progress}% &bull; {goals.passed} of {goals.total} Tests Passed Successfully</span>

          {/* Mandatory */}
          <div className={styles.goalSection}>
            <span className={styles.goalSectionTitle}>Mandatory</span>
            {goals.mandatory.map((g, i) => (
              <div key={i} className={`${styles.goalCard} ${g.pass ? styles.goalPass : styles.goalFail}`}>
                <div className={styles.goalCardIcon}>
                  <Icon name={g.pass ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} size={16} color={g.pass ? '#009b53' : '#D72825'} />
                </div>
                <div className={styles.goalCardContent}>
                  <span className={styles.goalCardName}>{g.name}</span>
                  <span className={styles.goalCardDesc}>{g.desc}</span>
                </div>
                <Badge variant={g.pass ? 'compliance-pass' : 'compliance-fail'} label={g.pass ? 'Pass' : 'Fail'} />
              </div>
            ))}
          </div>

          {/* Optional */}
          <div className={styles.goalSection}>
            <span className={styles.goalSectionTitle}>Optional</span>
            {goals.optional.map((g, i) => (
              <div key={i} className={`${styles.goalCard} ${g.pass ? styles.goalPass : styles.goalFail}`}>
                <div className={styles.goalCardIcon}>
                  <Icon name={g.pass ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} size={16} color={g.pass ? '#009b53' : '#D72825'} />
                </div>
                <div className={styles.goalCardContent}>
                  <span className={styles.goalCardName}>{g.name}</span>
                  <span className={styles.goalCardDesc}>{g.desc}</span>
                </div>
                <Badge variant={g.pass ? 'compliance-pass' : 'compliance-fail'} label={g.pass ? 'Pass' : 'Fail'} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call Quality (Estimated) */}
      {goals && (() => {
        const engScore = Math.round(goals.progress * 0.4);
        const engVariant = engScore >= 60 ? 'success' : engScore >= 30 ? 'warning' : 'error';
        const engColor = engVariant === 'success' ? 'var(--status-success)' : engVariant === 'warning' ? 'var(--status-warning)' : 'var(--status-error)';
        return (
          <div className={styles.callQualitySection}>
            <div className={styles.goalProgressHeader}>
              <span className={styles.goalProgressLabel}>Call Quality (Estimated)</span>
            </div>

            {/* Engagement Score */}
            <div className={styles.callQualityRow}>
              <span className={styles.callQualityLabel}>Engagement Score</span>
              <span className={styles.callQualityValue}>{engScore}</span>
            </div>
            <div className={styles.engagementBar}>
              <div className={styles.engagementFill} style={{ width: `${engScore}%`, background: engColor }} />
            </div>

            <div className={styles.callQualityDivider} />

            {/* Talk Ratio */}
            <div className={styles.callQualityMeta}>
              <span className={styles.callQualityMetaLabel}>Talk Ratio (Est.)</span>
              <span className={styles.callQualityMetaValue}>~50% agent / ~50% patient (est.)</span>
            </div>

            <div className={styles.callQualityDivider} />

            {/* Sentiment */}
            <div className={styles.callQualitySentiment}>
              <span className={styles.callQualitySentimentLabel}>Sentiment &middot; From Transcript</span>
              <div>
                <Badge variant={goalsMet ? 'sentiment-positive' : 'sentiment-negative'} label={goalsMet ? 'Positive' : 'Negative'} />
              </div>
              <span className={styles.callQualitySentimentDesc}>Based on the end of the conversation (LLM). Re-check the transcript if needed.</span>
            </div>
          </div>
        );
      })()}
    </>
  );
}

/* ── Ongoing Call Tab ── */

function OngoingCallTab({ searchQuery }) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return ONGOING_CALLS;
    const q = searchQuery.toLowerCase();
    return ONGOING_CALLS.filter(m => m.name.toLowerCase().includes(q));
  }, [searchQuery]);

  if (filtered.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Icon name="solar:magnifer-linear" size={40} color="var(--neutral-150)" />
        <p className={styles.emptyTitle}>{searchQuery ? 'No results found' : 'No ongoing calls'}</p>
      </div>
    );
  }

  return (
    <table className={styles.queueTable}>
      <thead>
        <tr>
          <th>Member Name</th>
          <th>Call Duration</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map(member => (
          <tr key={member.id}>
            <td>
              <MemberCell initials={member.initials} name={member.name} subtitle={`${member.gender} \u2022 ${member.dob} (${member.age}Y)`} />
            </td>
            <td>
              <span className={styles.duration}>{member.duration}</span>
            </td>
            <td>
              <div className={styles.rowActions}>
                <button className={styles.liveTranscriptBtn}>
                  <Icon name="solar:translation-2-linear" size={16} color="var(--neutral-300)" />
                  Live Transcript
                </button>
                <ActionButton icon="solar:headphones-round-sound-linear" size="L" tooltip="Listen" />
                <span className={styles.actionDivider} />
                <ActionButton icon="solar:menu-dots-bold" size="L" tooltip="More Options" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── In Queue Tab ── */

function InQueueTab({ searchQuery }) {
  const [members, setMembers] = useState(QUEUED_MEMBERS);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(m => m.name.toLowerCase().includes(q));
  }, [members, searchQuery]);

  const moveUp = (idx) => {
    if (idx <= 0) return;
    const updated = [...members];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    setMembers(updated.map((m, i) => ({ ...m, priority: i + 1 })));
  };

  const moveDown = (idx) => {
    if (idx >= members.length - 1) return;
    const updated = [...members];
    [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    setMembers(updated.map((m, i) => ({ ...m, priority: i + 1 })));
  };

  const removeMember = (idx) => {
    const updated = members.filter((_, i) => i !== idx);
    setMembers(updated.map((m, i) => ({ ...m, priority: i + 1 })));
  };

  if (filtered.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Icon name={searchQuery ? 'solar:magnifer-linear' : 'solar:inbox-linear'} size={40} color="var(--neutral-150)" />
        <p className={styles.emptyTitle}>{searchQuery ? 'No results found' : 'Queue is empty'}</p>
      </div>
    );
  }

  return (
    <table className={styles.queueTable}>
      <thead>
        <tr>
          <th>Member Name</th>
          <th>Priority Order</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((member, idx) => (
          <tr key={member.id}>
            <td>
              <MemberCell initials={member.initials} name={member.name} subtitle={`${member.gender} \u2022 ${member.dob} (${member.age}Y)`} />
            </td>
            <td>
              <span className={styles.priorityBadge}>{member.priority}</span>
            </td>
            <td>
              <div className={styles.rowActions}>
                <div className={styles.callOrderBtn}>
                  <span className={styles.callOrderLabel}>Call Order</span>
                  <button className={styles.callOrderArrow} onClick={() => moveUp(idx)} title="Move up">
                    <Icon name="solar:alt-arrow-up-linear" size={16} color="var(--neutral-300)" />
                  </button>
                  <button className={styles.callOrderArrow} onClick={() => moveDown(idx)} title="Move down">
                    <Icon name="solar:alt-arrow-down-linear" size={16} color="var(--neutral-300)" />
                  </button>
                </div>
                <ActionButton icon="solar:close-circle-linear" size="L" tooltip="Remove from Queue" onClick={() => removeMember(idx)} />
                <span className={styles.actionDivider} />
                <ActionButton icon="solar:menu-dots-bold" size="L" tooltip="More Options" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ── Summary Card with Tooltip ── */

function SummaryCardWithTooltip({ label, value, tooltip }) {
  return (
    <div className={styles.summaryCard}>
      <span className={styles.summaryCardTooltip}>
        {label}{' '}
        <Icon name="solar:info-circle-linear" size={12} color="var(--neutral-200)" />
        <span className={styles.tooltipText}>{tooltip}</span>
      </span>
      <span className={styles.summaryCardValue}>{value}</span>
    </div>
  );
}

/* ── Call Log Tab ── */

function DateGroupStats({ calls }) {
  const total = calls.length;
  const successful = calls.filter(c => c.status === 'Successful').length;
  const failed = calls.filter(c => c.status === 'Failed').length;
  return (
    <div className={styles.dateGroupStats}>
      <span>{total} calls</span>
      <span className={styles.dot}>&bull;</span>
      <span style={{ color: '#009b53' }}>{successful} successful</span>
      {failed > 0 && (
        <>
          <span className={styles.dot}>&bull;</span>
          <span style={{ color: '#D72825' }}>{failed} failed</span>
        </>
      )}
    </div>
  );
}

export function CallLogTab({ onSelectCall, selectedCallId, searchQuery }) {
  // Only the first (most recent) date is expanded by default
  const [collapsedGroups, setCollapsedGroups] = useState(() => {
    const initial = {};
    CALL_LOG_GROUPS.forEach((_, i) => { if (i > 0) initial[i] = true; });
    return initial;
  });

  const toggleGroup = (idx) => {
    setCollapsedGroups(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return CALL_LOG_GROUPS;
    const q = searchQuery.toLowerCase();
    return CALL_LOG_GROUPS.map(g => ({
      ...g,
      calls: g.calls.filter(c => c.name.toLowerCase().includes(q)),
    })).filter(g => g.calls.length > 0);
  }, [searchQuery]);

  const totalCalls = CALL_LOG_GROUPS.reduce((sum, g) => sum + g.calls.length, 0);
  const connectedCalls = CALL_LOG_GROUPS.reduce((sum, g) => sum + g.calls.filter(c => c.status === 'Successful').length, 0);
  const goalsMet = CALL_LOG_GROUPS.reduce((sum, g) => sum + g.calls.filter(c => c.goals && c.goals.mandatoryMet).length, 0);

  return (
    <div className={styles.callLogWrap}>
      {/* Summary stats */}
      <div className={styles.summarySection}>
        <div className={styles.summaryTitle}>Patient Outreach Summary</div>
        <div className={styles.summaryCards}>
          <SummaryCardWithTooltip label="Total Calls" value={totalCalls} tooltip="All calls for this agent matching filters above (not filtered by outcome)." />
          <SummaryCardWithTooltip label="Connected Calls" value={connectedCalls} tooltip="Calls with meaningful live engagement (duration & disconnect reason)." />
          <SummaryCardWithTooltip label="Successful (Goals Met)" value={goalsMet} tooltip="Calls where all mandatory goals passed." />
        </div>
      </div>

      {/* Month picker */}
      <div className={styles.monthPicker}>
        <button className={styles.monthPickerBtn}>
          Jan 2026 <Icon name="solar:alt-arrow-down-linear" size={13} color="var(--neutral-400)" />
        </button>
      </div>

      {/* Date groups */}
      {filteredGroups.map((group, gi) => (
        <div key={gi} className={styles.dateGroup}>
          {/* Timeline trail */}
          <div className={styles.timeline}>
            <div className={styles.timelineLine} />
            <div className={styles.timelineIcon}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.1333 4.18663V5.86663L15.1833 6.91663M11.7506 13.2226L12.1301 12.823C12.6548 12.2706 13.4727 12.1571 14.144 12.5435L15.7361 13.4599C16.7585 14.0484 16.9838 15.4907 16.1847 16.332L15.0009 17.5783C14.6999 17.8952 14.3264 18.1268 13.8969 18.1692C12.539 18.3032 9.21841 18.1551 5.67943 14.4292C2.34222 10.9158 1.74416 7.90447 1.66903 6.50487C1.63967 5.9578 1.88182 5.46464 2.24317 5.08421L3.55117 3.70713C4.27993 2.93988 5.50853 3.05868 6.14434 3.95794L7.19516 5.44418C7.70886 6.17073 7.65335 7.16596 7.06456 7.78586L6.82555 8.03749C6.82555 8.03749 5.92339 8.98729 8.3859 11.5798C10.8484 14.1724 11.7506 13.2226 11.7506 13.2226ZM18.3333 5.86663C18.3333 8.18622 16.4529 10.0666 14.1333 10.0666C11.8137 10.0666 9.93329 8.18622 9.93329 5.86663C9.93329 3.54703 11.8137 1.66663 14.1333 1.66663C16.4529 1.66663 18.3333 3.54703 18.3333 5.86663Z" stroke="#6F7A90" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2"/>
              </svg>
            </div>
            <div className={styles.timelineLine} style={{ flex: 1 }} />
          </div>

          <div className={styles.dateGroupContent}>
            <div className={styles.dateGroupHeader} onClick={() => toggleGroup(gi)}>
              <div className={styles.dateGroupInfo}>
                <div className={styles.dateGroupLine1}>
                  <span className={styles.dateGroupDate}>{group.date}</span>
                  <span className={styles.dateGroupAgent}>&bull; {group.agentInfo.split(' \u2022 ')[0]} (v1.3)</span>
                </div>
                <div className={styles.dateGroupLine2}>
                  <DateGroupStats calls={group.calls} />
                  <Icon
                    name="solar:alt-arrow-down-linear"
                    size={16}
                    color="var(--neutral-300)"
                    className={collapsedGroups[gi] ? styles.chevronCollapsed : ''}
                  />
                </div>
              </div>
              <ActionButton icon="solar:menu-dots-linear" size="S" tooltip="More Options" onClick={e => e.stopPropagation()} />
            </div>

            {!collapsedGroups[gi] && (
              <div className={styles.dateGroupTableWrap}>
                <div className={styles.dateGroupTableScroll}>
                  <table className={`${styles.queueTable} ${styles.callLogTable}`}>
                    <thead>
                      <tr>
                        <th>Member Name</th>
                        <th>Status</th>
                        <th>Call Duration</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.calls.map(call => {
                        const isFailed = call.status === 'Failed';
                        const isSelected = selectedCallId === call.id;
                        return (
                          <tr
                            key={call.id}
                            className={`${styles.callLogRow} ${isSelected ? styles.callLogRowSelected : ''}`}
                            onClick={() => onSelectCall(isSelected ? null : call)}
                          >
                            <td>
                              <MemberCell
                                initials={call.initials}
                                name={call.name}
                                subtitle={`Called at: ${call.calledAt}`}
                                selected={isSelected}
                              />
                            </td>
                            <td>
                              <Badge variant={isFailed ? 'status-failed' : 'status-completed'} label={call.status} />
                            </td>
                            <td>
                              <span className={isFailed ? styles.durationFailed : styles.duration}>
                                {call.duration}
                                {isFailed && <> <Icon name="solar:danger-triangle-linear" size={12} color="#D72825" /></>}
                              </span>
                            </td>
                            <td>
                              <div className={styles.rowActions} onClick={e => e.stopPropagation()}>
                                {isFailed ? (
                                  <ActionButton icon="solar:refresh-linear" size="L" tooltip="Retry" />
                                ) : (
                                  <>
                                    <ActionButton icon="solar:document-text-linear" size="L" tooltip="Summary" />
                                    <ActionButton icon="solar:play-linear" size="L" tooltip="Play Recording" />
                                  </>
                                )}
                                <ActionButton icon="solar:menu-dots-bold" size="L" tooltip="More Options" />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {filteredGroups.length === 0 && (
        <div className={styles.emptyState}>
          <Icon name="solar:magnifer-linear" size={40} color="var(--neutral-150)" />
          <p className={styles.emptyTitle}>No results found</p>
        </div>
      )}
    </div>
  );
}

/* ── Main Drawer ── */

/* ── Resizable Dragger ── */

export function ResizeDragger({ onDrag }) {
  const [dragging, setDragging] = useState(false);
  const startXRef = useRef(0);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
    startXRef.current = e.clientX;

    const handleMouseMove = (e2) => {
      const delta = e2.clientX - startXRef.current;
      startXRef.current = e2.clientX;
      onDrag(delta);
    };
    const handleMouseUp = () => {
      setDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [onDrag]);

  return (
    <div
      className={`${styles.dragger} ${dragging ? styles.draggerActive : ''}`}
      onMouseDown={handleMouseDown}
    >
      <div className={styles.draggerGrip}>
        <span className={styles.draggerDot} />
        <span className={styles.draggerDot} />
        <span className={styles.draggerDot} />
      </div>
    </div>
  );
}

/* ── Main Drawer ── */

export function CallQueueDrawer({ agent, onClose, initialTab }) {
  const isAnalytics = initialTab === 'analytics';
  const [activeTab, setActiveTab] = useState(isAnalytics ? 'Call Log' : 'Ongoing Call');
  const [selectedCall, setSelectedCall] = useState(() => {
    // Auto-select first patient when opened via Call Analytics
    if (isAnalytics && CALL_LOG_GROUPS.length > 0 && CALL_LOG_GROUPS[0].calls.length > 0) {
      return CALL_LOG_GROUPS[0].calls[0];
    }
    return null;
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [leftWidth, setLeftWidth] = useState(null); // null = equal flex

  const agentName = agent?.voice?.name || agent?.name || 'Erica';
  const agentRole = agent?.use_case || 'TOC Agent';
  const isExpanded = activeTab === 'Call Log' && selectedCall !== null;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedCall(null);
    setSearchOpen(false);
    setSearchQuery('');
    setLeftWidth(null);
  };

  const handleSelectCall = useCallback((call) => {
    setSelectedCall(call);
    if (!call) setLeftWidth(null);
  }, []);

  const handleDrag = useCallback((delta) => {
    setLeftWidth(prev => {
      const layoutEl = document.querySelector('[class*="drawerLayout"]');
      if (!layoutEl) return prev;
      const totalWidth = layoutEl.offsetWidth - 6; // minus dragger width
      const current = prev ?? totalWidth / 2;
      const next = current + delta;
      const min = 480; // enough for summary cards + table columns
      const max = totalWidth - 380; // enough for goal detail panel
      return Math.max(min, Math.min(max, next));
    });
  }, []);

  const leftStyle = isExpanded && leftWidth != null ? { flex: 'none', width: leftWidth } : {};
  const rightStyle = isExpanded && leftWidth != null ? { flex: 'none', width: `calc(100% - ${leftWidth}px - 6px)` } : {};

  return (
    <Drawer
      title="Agent Outreach Queue"
      onClose={onClose}
      bodyClassName={`${styles.drawerBody} ${isExpanded ? styles.drawerBodyExpanded : ''}`}
      headerStyle={{ padding: '12px 12px 12px 16px' }}
      titleStyle={{ fontSize: 16 }}
      className={`${styles.drawerTransition} ${isExpanded ? styles.drawerExpanded : ''}`}
    >
      <div className={styles.drawerLayout}>
        {/* Main content column */}
        <div className={styles.mainColumn} style={leftStyle}>
          {/* Agent banner */}
          <div className={styles.agentBanner}>
            <div className={styles.agentInfo}>
              <div className={styles.agentAvatar} />
              <div>
                <div className={styles.agentName}>{agentName}</div>
                <div className={styles.agentRole}>{agentRole}</div>
              </div>
            </div>
            <div className={styles.bannerActions}>
              <Button variant="secondary" size="M" leadingIcon="solar:pen-linear">Edit Configuration</Button>
              <Button variant="error" size="M" leadingIcon="solar:forbidden-circle-linear">Stop</Button>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabsRow}>
            <div className={styles.tabsList}>
              {TABS.map(tab => (
                <button
                  key={tab}
                  className={`${styles.tabItem} ${activeTab === tab ? styles.tabItemActive : ''}`}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className={styles.tabActions}>
              <ActionButton icon="solar:refresh-linear" size="L" tooltip="Refresh" />
              <span className={styles.tabDivider} />
              <ActionButton icon="solar:filter-linear" size="L" tooltip="Filter" />
              <span className={styles.tabDivider} />
              <ActionButton icon="solar:magnifer-linear" size="L" tooltip="Search" onClick={() => { setSearchOpen(v => !v); if (searchOpen) setSearchQuery(''); }} />
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <SearchBar value={searchQuery} onChange={setSearchQuery} onClose={() => { setSearchOpen(false); setSearchQuery(''); }} />
          )}

          {/* Tab content */}
          <div className={styles.tableWrap}>
            {activeTab === 'Ongoing Call' && <OngoingCallTab searchQuery={searchQuery} />}
            {activeTab === 'In Queue' && <InQueueTab searchQuery={searchQuery} />}
            {activeTab === 'Call Log' && <CallLogTab onSelectCall={handleSelectCall} selectedCallId={selectedCall?.id} searchQuery={searchQuery} />}
          </div>
        </div>

        {/* Resizable dragger + Detail panel */}
        {isExpanded && (
          <>
            <ResizeDragger onDrag={handleDrag} />
            <div className={styles.detailPanel} style={rightStyle}>
              <GoalDetailPanel call={selectedCall} />
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}
