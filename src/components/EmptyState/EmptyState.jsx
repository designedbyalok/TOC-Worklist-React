import { Icon } from '../Icon/Icon';
import { Button } from '../Button/Button';

export function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300,
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center',
        padding: 32, maxWidth: 360,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 12, background: 'var(--primary-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={icon || 'solar:inbox-line-bold'} size={28} color="var(--primary-300)" />
        </div>
        <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--neutral-400)' }}>{title || 'Nothing here yet'}</div>
        <div style={{ fontSize: 14, color: 'var(--neutral-300)', lineHeight: 1.5 }}>{description || 'Items will appear here once available.'}</div>
        {actionLabel && onAction && (
          <Button variant="primary" size="L" leadingIcon="solar:add-circle-linear" onClick={onAction} style={{ marginTop: 4 }}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
