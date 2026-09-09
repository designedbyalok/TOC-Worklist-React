import { useState } from 'react';
import { Icon } from '../../../../../components/Icon/Icon';
import { DownChevronIcon } from '../../../../../components/Icon/DownChevronIcon';
import { ActionButton } from '../../../../../components/ActionButton/ActionButton';
import { Badge } from '../../../../../components/Badge/Badge';
import UnityAILogo from '../../../../../assets/unity-ai-logo.svg';
import styles from './PatientSynopsisWidget.module.css';

/* ── Unity logo ── */
function UnityDot({ size = 14 }) {
  return <img src={UnityAILogo} width={size} height={size} alt="Unity AI" />;
}

/* ── Numbered reference badge ── */
function R({ n }) {
  return <span className={styles.refBadge}>{n}</span>;
}

/* ── Full synopsis content ── */
function SynopsisContent() {
  return (
    <>
      <p className={styles.synopsisText}>
        The patient has a chronic history of kidney stones, with the documented{' '}
        <span className={styles.gradientText}>Extracorporeal Shock Wave Lithotripsy (ESWL)</span>
        <R n={1} /><R n={2} />. It was performed on 01/28/22 for symptomatic nephrolithiasis
        seen on imaging and labs <R n={3} />. Subsequent encounters and reports describe recurrent
        and enlarging renal calculi, intermittent, and microscopic hematuria though vitals signs
        remain stable. Patient is Covid Immunized. there exists an allergy to egg. Medical
        statements reflect repeated stone‑related care and there is known family history of stones.
        Patient has history of Alcohol Abuse. Patient is on{' '}
        <span className={styles.gradientText}>Tamsulosin (Flomax)</span> for treatment. Referred
        to Dr. John for treatment. <R n={4} />
      </p>

      <p className={styles.synopsisText}>
        In addition to the known urologic history, the patient has more recently been diagnosed
        with <span className={styles.gradientText}>hypertension</span> <R n={5} /> which is being
        managed medically. Elevated blood pressure has been intermittently noted during outpatient
        visits, prompting initiation of antihypertensive therapy. The patient is currently
        prescribed <span className={styles.gradientText}>Lisinopril</span> <R n={5} /> with
        documented improvement in blood pressure control on follow‑up assessments. This condition
        adds to the patient's overall cardiovascular risk profile and requires ongoing monitoring
        alongside renal health.
      </p>

      <p className={styles.synopsisText}>
        The patient has also undergone further urologic intervention following progression of stone
        disease. A ureteroscopy with laser lithotripsy and temporary ureteral stent placement was
        performed on 06/14/23 <R n={6} /> due to obstructing renal calculi and worsening flank
        pain. Post‑operative notes indicate the procedure was tolerated well without complications
        and the stent was subsequently removed as scheduled. This surgical history reflects
        escalation of care beyond ESWL due to disease persistence.
      </p>

      <p className={styles.synopsisText}>
        Additional medical history includes a diagnosis of{' '}
        <span className={styles.gradientText}>hyperlipidemia</span> <R n={4} /> for which the
        patient has been started on <span className={styles.gradientText}>Atorvastatin</span>{' '}
        <R n={4} />. This condition may contribute to systemic inflammation and overall health risk
        and is being addressed through both pharmacologic therapy and lifestyle counseling. Together
        with the patient's chronic nephrolithiasis, hypertension <R n={5} />, and prior substance
        use history, these new conditions underscore the need for coordinated, long‑term medical
        management across multiple specialties.
      </p>
    </>
  );
}

/* ── Main widget ── */
export function PatientSynopsisWidget() {
  const [collapsed, setCollapsed] = useState(false);
  const [expanded,  setExpanded]  = useState(false);
  const [feedback,  setFeedback]  = useState(null);

  return (
    <div className={`${styles.widget} ${collapsed ? styles.widgetCollapsed : ''}`}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.titleBtn} onClick={() => setCollapsed(v => !v)}>
            <DownChevronIcon
              size={13}
              color="var(--neutral-400)"
              style={collapsed ? { transform: 'rotate(-90deg)' } : undefined}
            />
            <span className={styles.title}>Patient Synopsis</span>
          </button>
        </div>
        {!collapsed && (
          <div className={styles.headerRight}>
            <button className={styles.overviewBtn}>
              <span>Health Overview</span>
              <Icon name="solar:alt-arrow-down-linear" size={12} color="var(--neutral-300)" />
            </button>
            <button className={styles.versionBtn}>
              <span>v4</span>
              <Icon name="solar:alt-arrow-down-linear" size={10} color="var(--neutral-300)" />
            </button>
            <ActionButton icon="solar:menu-dots-linear" size="S" />
          </div>
        )}
      </div>

      {/* Body + footer inside gradient border */}
      {!collapsed && (
        <div className={`${styles.contentArea} ${expanded ? styles.contentAreaExpanded : ''}`}>

          {/* Text body */}
          <div className={`${styles.body} ${expanded ? styles.bodyExpanded : ''}`}>
            <SynopsisContent />
          </div>

          {/* See More / See Less — always below text, white bg */}
          <button className={styles.seeMoreBtn} onClick={() => setExpanded(v => !v)}>
            {expanded ? 'See Less' : 'See More'}
          </button>

          {/* Footer */}
          <div className={styles.footer}>
            <div className={styles.footerMeta}>
              <span className={styles.metaText}>
                Last Generated on:<br />
                11/09/2025, 2:30 PM • Dr. Michael Chen
              </span>
              <Badge variant="toc-new" icon="solar:lock-keyhole-linear" label="Internal Use Only" />
            </div>
            <div className={styles.unityRow}>
              <div className={styles.unityBrand}>
                <UnityDot size={14} />
                <span className={styles.unityName}>Unity</span>
                <span className={styles.unityAlpha}>Alpha</span>
              </div>
              <div className={styles.feedbackBtns}>
                <ActionButton
                  icon="solar:dislike-linear"
                  size="S"
                  iconColor={feedback === 'down' ? 'var(--primary-300)' : undefined}
                  onClick={() => setFeedback(v => v === 'down' ? null : 'down')}
                />
                <ActionButton
                  icon="solar:like-linear"
                  size="S"
                  iconColor={feedback === 'up' ? 'var(--primary-300)' : undefined}
                  onClick={() => setFeedback(v => v === 'up' ? null : 'up')}
                />
                <ActionButton icon="solar:refresh-linear" size="S" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
