import styles from './RoleDots.module.css';

// Map a role status → CSS-token dot color
function statusToColor(status) {
  switch (status) {
    case 'Completed':
    case 'Records Received':
    case 'Accepted':
    case 'Billed':
      return 'var(--status-success)';
    case 'In Progress':
    case 'New':
      return 'var(--status-warning)';
    case 'Records Requested':
    case 'Returned':
    case 'Rejected':
    case 'Insufficient':
      return 'var(--secondary-300)';
    case 'Awaiting':
    case 'Missed':
    case 'Skipped':
      return 'var(--status-info)';
    case 'Assign':
    case null:
    case undefined:
    default:
      return 'var(--neutral-200)';
  }
}

const ROLES = [
  { key: 'sup', label: 'Support' },
  { key: 'cdr', label: 'Coder' },
  { key: 'r1',  label: 'Reviewer 1' },
  { key: 'r2',  label: 'Reviewer 2' },
  { key: 'r3',  label: 'Reviewer 3' },
];

export function RoleDots({ member }) {
  return (
    <div className={styles.wrap} role="group" aria-label="Role progression">
      {ROLES.map((role, i) => {
        const status = member[`${role.key}s`];
        const assignee = member[role.key];
        const color = statusToColor(status);
        const tooltip = `${role.label}: ${status || 'Assign'}${assignee ? ` (${assignee})` : ''}`;
        return (
          <div key={role.key} className={styles.segment}>
            <span
              className={styles.dot}
              style={{ background: color }}
              title={tooltip}
              aria-label={tooltip}
            />
            <span className={styles.roleLabel}>{role.label}</span>
            {i < ROLES.length - 1 && <span className={styles.line} />}
          </div>
        );
      })}
    </div>
  );
}
