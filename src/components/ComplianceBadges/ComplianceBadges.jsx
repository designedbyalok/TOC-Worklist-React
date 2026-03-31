import { Icon } from '../Icon/Icon';
import styles from './ComplianceBadges.module.css';

const BADGE_DEFS = {
  aiDisclosed: {
    pass: { icon: 'solar:bot-bold', label: 'AI Disclosed', cls: 'pass' },
    fail: { icon: 'solar:bot-bold', label: 'AI Not Disclosed', cls: 'fail' },
  },
  recordingConsent: {
    obtained: { icon: 'solar:microphone-bold', label: 'Consent Obtained', cls: 'pass' },
    denied: { icon: 'solar:microphone-slash-bold', label: 'Consent Denied', cls: 'fail' },
    withdrawn: { icon: 'solar:microphone-slash-bold', label: 'Consent Withdrawn', cls: 'warn' },
    na: { icon: 'solar:microphone-bold', label: 'Consent N/A', cls: 'na' },
  },
  identityVerified: {
    pass: { icon: 'solar:verified-check-bold', label: 'Identity Verified', cls: 'pass' },
    fail: { icon: 'solar:shield-warning-bold', label: 'Unverified', cls: 'fail' },
  },
  emergencyDetected: {
    true: { icon: 'solar:danger-triangle-bold', label: 'Emergency Detected', cls: 'emergency' },
    false: null,
  },
  tcpaCompliant: {
    pass: { icon: 'solar:shield-check-bold', label: 'TCPA Compliant', cls: 'pass' },
    fail: { icon: 'solar:shield-warning-bold', label: 'TCPA Violation', cls: 'fail' },
    warn: { icon: 'solar:shield-warning-bold', label: 'TCPA Review', cls: 'warn' },
  },
};

function ComplianceBadge({ def }) {
  if (!def) return null;
  return (
    <span className={`${styles.badge} ${styles[def.cls]}`}>
      <Icon name={def.icon} size={13} />
      {def.label}
    </span>
  );
}

export function ComplianceBadges({ compliance, compact = false }) {
  if (!compliance) return null;

  const badges = [];

  // AI Disclosure
  if (compliance.aiDisclosed !== undefined) {
    const def = BADGE_DEFS.aiDisclosed[compliance.aiDisclosed ? 'pass' : 'fail'];
    if (def) badges.push(<ComplianceBadge key="ai" def={def} />);
  }

  // Recording Consent
  if (compliance.recordingConsent) {
    const def = BADGE_DEFS.recordingConsent[compliance.recordingConsent];
    if (def) badges.push(<ComplianceBadge key="consent" def={def} />);
  }

  // Identity Verified
  if (compliance.identityVerified !== undefined) {
    const def = BADGE_DEFS.identityVerified[compliance.identityVerified ? 'pass' : 'fail'];
    if (def) badges.push(<ComplianceBadge key="verified" def={def} />);
  }

  // Emergency Detected
  if (compliance.emergencyDetected) {
    const def = BADGE_DEFS.emergencyDetected['true'];
    if (def) badges.push(<ComplianceBadge key="emergency" def={def} />);
  }

  // TCPA Compliant
  if (compliance.tcpaCompliant) {
    const def = BADGE_DEFS.tcpaCompliant[compliance.tcpaCompliant];
    if (def) badges.push(<ComplianceBadge key="tcpa" def={def} />);
  }

  if (badges.length === 0) return null;

  return (
    <div className={`${styles.container} ${compact ? styles.compact : ''}`}>
      {!compact && <div className={styles.label}>Compliance</div>}
      <div className={styles.badges}>{badges}</div>
    </div>
  );
}

export function TcpaIndicator({ patient }) {
  if (!patient) return null;
  const tz = patient.tcpaTimezone || 'ET';
  const optIn = patient.tcpaOptIn !== false;
  const window = patient.preferredCallWindow || '8:00 AM – 9:00 PM';

  return (
    <div className={styles.tcpaIndicator}>
      <Icon name="solar:shield-check-bold" size={13} color={optIn ? '#009B53' : '#D72825'} />
      <span className={styles.tcpaText}>
        {optIn ? 'Opted In' : 'Opted Out'}
        <span className={styles.tcpaSep}>•</span>
        {window} {tz}
      </span>
    </div>
  );
}
