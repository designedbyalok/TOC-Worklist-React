import styles from './Avatar.module.css';

export function Avatar({ variant = 'patient', initials, agentName, size, className }) {
  const agentKey = agentName ? agentName.toLowerCase() : '';
  if (variant === 'agent') {
    return <div className={[styles.agent, styles[agentKey], className || ''].filter(Boolean).join(' ')} />;
  }
  if (variant === 'invokeAgent') {
    return <div className={[styles.invokeAgent, styles[agentKey], className || ''].filter(Boolean).join(' ')} />;
  }
  if (variant === 'provider') {
    return <div className={[styles.provider, className || ''].filter(Boolean).join(' ')}>{initials}</div>;
  }
  if (variant === 'assignee') {
    return <div className={[styles.assignee, className || ''].filter(Boolean).join(' ')}>{initials}</div>;
  }
  if (variant === 'callCard') {
    return <div className={[styles.callCard, className || ''].filter(Boolean).join(' ')}>{initials}</div>;
  }
  const sizeClass = size === 'lg' ? styles.lg : '';
  return (
    <div className={[styles.patient, sizeClass, className || ''].filter(Boolean).join(' ')}>{initials}</div>
  );
}
