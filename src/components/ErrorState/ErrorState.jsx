import { Icon } from '../Icon/Icon';
import { Button } from '../Button/Button';

export function ErrorState({ title, message, onRetry, icon }) {
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300,
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center',
        padding: 32, maxWidth: 360,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 12, background: 'var(--status-error-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={icon || 'solar:danger-triangle-bold'} size={28} color="var(--status-error)" />
        </div>
        <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--neutral-400)' }}>{title || 'Something went wrong'}</div>
        <div style={{ fontSize: 14, color: 'var(--neutral-300)', lineHeight: 1.5 }}>
          {message || 'An unexpected error occurred. Please try again or contact support if the problem persists.'}
        </div>
        {onRetry && (
          <Button variant="tertiary" size="L" leadingIcon="solar:refresh-linear" onClick={onRetry} style={{ marginTop: 4 }}>
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
