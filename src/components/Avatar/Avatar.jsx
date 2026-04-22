import styles from './Avatar.module.css';

export function Avatar({ variant = 'patient', initials, agentName, size, icon, backgroundColor, borderColor, color, className }) {
  const agentKey = agentName ? agentName.toLowerCase() : '';
  
  if (variant === 'generic' || variant === 'icon') {
    return (
      <div 
        className={[styles.generic, className || ''].filter(Boolean).join(' ')}
        style={{ 
          background: backgroundColor, 
          borderColor: borderColor, 
          color: color,
          width: size,
          height: size
        }}
      >
        {icon || initials}
      </div>
    );
  }

  if (variant === 'agent') {
    const hasGradient = ['erica', 'ricardo', 'maria', 'jia', 'dubois'].includes(agentKey);
    return (
      <div className={[styles.agent, styles[agentKey], className || ''].filter(Boolean).join(' ')}>
        {!hasGradient && initials}
      </div>
    );
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
