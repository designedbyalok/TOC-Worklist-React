import { useState } from 'react';
import { Icon } from '../Icon/Icon';
import { Button } from '../Button/Button';
import { Avatar } from '../Avatar/Avatar';
import { Drawer } from '../Drawer/Drawer';
import { useAppStore } from '../../store/useAppStore';
import styles from './WorkflowPanel.module.css';

const IP_CHECKLIST = [
  'Reviewed discharge medication list with patient',
  'Compared to pre-admission medications',
  'Counseled on new medications (dosage, frequency, side effects)',
  'Confirmed discontinued medications understood',
  'Verified all prescriptions are filled / accessible',
  'Checked for drug interactions',
  'Patient verbalized understanding',
];

const ED_CHECKLIST = [
  'Reviewed ED-prescribed medications with patient',
  'Confirmed patient can access/fill new prescriptions',
  'Reviewed allergies or contraindications',
  'Patient verbalized understanding of dosage & instructions',
  'Follow-up labs or tests ordered (if applicable)',
];

function StepHeader({ num, title, state, open, onToggle }) {
  const numCls = state === 'done' ? styles.done : state === 'active' ? styles.active : styles.pending;
  const badgeCls = state === 'done' ? styles.done : state === 'active' ? styles.inProgress : styles.todo;
  const badgeLbl = state === 'done' ? 'Done' : state === 'active' ? 'In Progress' : 'To Do';

  return (
    <div className={styles.stepHeader} onClick={onToggle}>
      <div className={`${styles.stepNum} ${numCls}`}>
        {state === 'done' ? <Icon name="solar:check-read-bold" size={14} /> : num}
      </div>
      <div className={styles.stepTitle}>{title}</div>
      <span className={`${styles.stepBadge} ${badgeCls}`}>{badgeLbl}</span>
      <span className={`${styles.chevron} ${open ? styles.open : ''}`}>
        <Icon name="solar:alt-arrow-down-linear" size={16} />
      </span>
    </div>
  );
}

function ChecklistItem({ label }) {
  const [checked, setChecked] = useState(false);
  return (
    <div className={[styles.checkItem, checked ? styles.checked : ''].filter(Boolean).join(' ')} onClick={() => setChecked(v => !v)}>
      <div className={styles.checkBox}>
        {checked && <Icon name="solar:check-read-bold" size={12} color="#fff" />}
      </div>
      <span>{label}</span>
    </div>
  );
}

export function WorkflowPanel() {
  const workflowPatient = useAppStore(s => s.workflowPatient);
  const stepStates = useAppStore(s => s.stepStates);
  const setStepState = useAppStore(s => s.setStepState);
  const updatePatient = useAppStore(s => s.updatePatient);
  const closeWorkflow = useAppStore(s => s.closeWorkflow);
  const saveWorkflow = useAppStore(s => s.saveWorkflow);
  const nextDate = useAppStore(s => s.nextDate);

  const [openSteps, setOpenSteps] = useState({ s1: true, s2: true, s3: false, s4: true });
  const [tocType, setTocType] = useState(workflowPatient?.tocType || 'IP');
  const [scheduleDate, setScheduleDate] = useState(nextDate(workflowPatient?.lace || 'High'));
  const [scheduleTime, setScheduleTime] = useState('10:00');

  if (!workflowPatient) return null;
  const p = workflowPatient;

  const toggleStep = (id) => setOpenSteps(prev => ({ ...prev, [id]: !prev[id] }));

  const laceBgColor = p.lace === 'High' ? 'var(--status-error-light)' : p.lace === 'Medium' ? 'var(--status-warning-light)' : 'var(--status-success-light)';
  const laceColor = p.lace === 'High' ? 'var(--status-error)' : p.lace === 'Medium' ? 'var(--status-warning)' : 'var(--status-success)';

  const headerTitle = (
    <div className={styles.patientInfo}>
      <Avatar variant="patient" initials={p.initials} size="lg" />
      <div>
        <div className={styles.name}>{p.name}</div>
        <div className={styles.meta}>
          {p.gender} • {p.age} &nbsp;|&nbsp; {p.memberId} &nbsp;|&nbsp;{' '}
          <span className={styles.laceBadge} style={{ background: laceBgColor, color: laceColor, border: `0.5px solid ${laceColor}30`, fontSize: 12, padding: '2px 6px' }}>
            {p.lace} LACE
          </span>
          &nbsp;|&nbsp; <strong>TOC {p.tocType}</strong> &nbsp;|&nbsp; Discharged: {p.dischargeDate}
        </div>
      </div>
    </div>
  );

  const footerContent = (
    <>
      <Button variant="secondary" size="L" onClick={closeWorkflow}>Cancel</Button>
      <Button variant="primary" size="L" leadingIcon="solar:diskette-bold" onClick={saveWorkflow}>
        Save &amp; Update
      </Button>
    </>
  );

  return (
    <Drawer title={headerTitle} onClose={closeWorkflow} footer={footerContent}>
      {/* Step 1: Patient Outreach */}
      <div className={styles.step}>
        <StepHeader num={1} title="Patient Outreach" state={stepStates.s1 || 'pending'} open={openSteps.s1} onToggle={() => toggleStep('s1')} />
        {openSteps.s1 && (
          <div className={styles.stepBody}>
            <div className={styles.info}>
              <strong>Window:</strong> TOC {p.outreachType} &nbsp;•&nbsp; {p.onCall ? `On call (${p.callDuration})` : `${p.outreachLeft} remaining`}<br />
              <strong>Facility:</strong> {p.facility} &nbsp;•&nbsp; <strong>Reason:</strong> {p.admitReason}
            </div>
            <div className={styles.script}>
              "Hi, may I speak with {p.name.split(' ').pop()}? This is [Agent] calling from Astrana Health. We're following up on your recent discharge from {p.facility} and would love to check in on how you're doing."
            </div>
            <div className={styles.question}>Contact outcome:</div>
            <div className={styles.options}>
              <button className={`${styles.optBtn} ${styles.optYes}`} onClick={() => setStepState('s1', 'done')}>
                <Icon name="solar:check-circle-bold" size={16} /> Reached patient
              </button>
              <button className={`${styles.optBtn} ${styles.optNo}`} onClick={() => setStepState('s1', 'pending')}>
                <Icon name="solar:close-circle-bold" size={16} /> No answer
              </button>
              <button className={`${styles.optBtn} ${styles.optLater}`} onClick={() => setStepState('s1', 'pending')}>
                <Icon name="solar:clock-circle-bold" size={16} /> Callback
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Program Enrollment */}
      <div className={styles.step}>
        <StepHeader num={2} title="Program Enrollment" state={stepStates.s2 || 'pending'} open={openSteps.s2} onToggle={() => toggleStep('s2')} />
        {openSteps.s2 && (
          <div className={styles.stepBody}>
            <div className={styles.info}>
              Ask if the patient would like to enroll in the <strong>Transitional Care Management (TCM)</strong> program for post-discharge support.
            </div>
            <div className={styles.script}>
              "We offer a Transitional Care program that includes follow-up calls, medication reviews, and scheduling your next appointment. Would you like to enroll at no extra cost?"
            </div>
            <div className={styles.question}>Patient's decision:</div>
            <div className={styles.options}>
              <button className={`${styles.optBtn} ${styles.optYes}`} onClick={() => {
                setStepState('s2', 'done');
                updatePatient(p.id, { tocStatus: 'enrolled' });
              }}>
                <Icon name="solar:check-circle-bold" size={16} /> Enrolled
              </button>
              <button className={`${styles.optBtn} ${styles.optNo}`} onClick={() => {
                setStepState('s2', 'done');
                updatePatient(p.id, { tocStatus: 'attempted' });
              }}>
                <Icon name="solar:close-circle-bold" size={16} /> Declined
              </button>
              <button className={`${styles.optBtn} ${styles.optLater}`} onClick={() => {
                updatePatient(p.id, { tocStatus: 'engaged' });
              }}>
                <Icon name="solar:clock-circle-bold" size={16} /> Considering
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Medication Reconciliation */}
      <div className={styles.step}>
        <StepHeader
          num={3}
          title={`Medication Reconciliation (${tocType === 'IP' ? 'Inpatient' : 'ED'})`}
          state={stepStates.s3 || 'pending'}
          open={openSteps.s3}
          onToggle={() => toggleStep('s3')}
        />
        {openSteps.s3 && (
          <div className={styles.stepBody}>
            <div className={styles.tocTypeToggle}>
              <button
                className={[styles.tocTypeBtn, tocType === 'IP' ? styles.active : ''].filter(Boolean).join(' ')}
                onClick={() => setTocType('IP')}
              >
                IP – Inpatient
              </button>
              <button
                className={[styles.tocTypeBtn, tocType === 'ED' ? styles.active : ''].filter(Boolean).join(' ')}
                onClick={() => setTocType('ED')}
              >
                ED – Emergency
              </button>
            </div>
            <div className={styles.checklist}>
              {(tocType === 'IP' ? IP_CHECKLIST : ED_CHECKLIST).map(item => (
                <ChecklistItem key={item} label={item} />
              ))}
            </div>
            <button className={`${styles.optBtn} ${styles.optYes}`} style={{ marginTop: 4 }} onClick={() => setStepState('s3', 'done')}>
              <Icon name="solar:check-circle-bold" size={16} /> Med Rec Complete
            </button>
          </div>
        )}
      </div>

      {/* Step 4: Schedule Follow-up */}
      <div className={styles.step}>
        <StepHeader num={4} title="Schedule Follow-up Appointment" state={stepStates.s4 || 'pending'} open={openSteps.s4} onToggle={() => toggleStep('s4')} />
        {openSteps.s4 && (
          <div className={styles.stepBody}>
            <div className={styles.info}>
              Schedule within <strong>{p.lace === 'High' ? '7 days' : p.lace === 'Medium' ? '14 days' : '30 days'}</strong> ({p.lace} LACE).{' '}
              {p.tocType === 'IP' ? 'Prioritize PCP or specialist follow-up.' : 'Schedule PCP for root-cause follow-up.'}
            </div>
            <div className={styles.scheduleRow}>
              <label className={styles.scheduleLabel}>Appointment Type</label>
              <select className={styles.scheduleInput}>
                <option>PCP Follow-up</option>
                <option>Specialist Referral</option>
                <option>Telehealth Visit</option>
                <option>Home Health Visit</option>
              </select>
            </div>
            <div className={styles.scheduleRow2}>
              <div className={styles.scheduleRow} style={{ flex: 1 }}>
                <label className={styles.scheduleLabel}>Date</label>
                <input
                  type="date"
                  className={styles.scheduleInput}
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                />
              </div>
              <div className={styles.scheduleRow} style={{ flex: 1 }}>
                <label className={styles.scheduleLabel}>Time</label>
                <input
                  type="time"
                  className={styles.scheduleInput}
                  value={scheduleTime}
                  onChange={e => setScheduleTime(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.scheduleRow}>
              <label className={styles.scheduleLabel}>Notes</label>
              <textarea className={styles.scheduleInput} rows={2} placeholder="E.g., needs interpreter, morning preferred…" style={{ resize: 'vertical' }} />
            </div>
            <button
              className={`${styles.optBtn} ${styles.optYes}`}
              style={{ marginTop: 2 }}
              onClick={() => {
                setStepState('s4', 'done');
                updatePatient(p.id, { scheduledTime: `${scheduleDate} ${scheduleTime}` });
              }}
            >
              <Icon name="solar:check-circle-bold" size={16} /> Confirm Appointment
            </button>
          </div>
        )}
      </div>
    </Drawer>
  );
}
