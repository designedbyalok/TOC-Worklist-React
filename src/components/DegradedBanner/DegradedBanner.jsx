import { Icon } from '../Icon/Icon';
import { useAppStore } from '../../store/useAppStore';

export function DegradedBanner() {
  const systemHealth = useAppStore(s => s.systemHealth);
  if (!systemHealth) return null;

  const degraded = Object.entries(systemHealth).filter(([, v]) => v === 'degraded' || v === 'down');
  if (degraded.length === 0) return null;

  const hasDown = degraded.some(([, v]) => v === 'down');
  const names = degraded.map(([k]) => {
    const labels = { ehr: 'Epic EHR', retell: 'Retell.ai', redis: 'Redis', supabase: 'Supabase' };
    return labels[k] || k;
  });

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 16px',
      background: hasDown ? 'var(--status-error-light)' : 'var(--status-warning-light)',
      borderBottom: `1px solid ${hasDown ? 'rgba(215,40,37,0.2)' : 'rgba(217,165,11,0.2)'}`,
      fontSize: 13,
      color: hasDown ? 'var(--status-error)' : 'var(--status-warning)',
      fontWeight: 500,
    }}>
      <Icon name="solar:danger-triangle-bold" size={16} />
      {hasDown ? 'System Outage' : 'Degraded Performance'}: {names.join(', ')}
      <span style={{ fontWeight: 400, fontSize: 12, marginLeft: 4 }}>
        — Some features may be limited. Contact engineering if issues persist.
      </span>
    </div>
  );
}
