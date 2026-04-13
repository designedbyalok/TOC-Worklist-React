import { Icon } from '../Icon/Icon';
import { useAppStore } from '../../store/useAppStore';

const SYSTEMS = [
  { key: 'ehr', label: 'Epic EHR', icon: 'solar:heart-pulse-bold' },
  { key: 'retell', label: 'Retell.ai', icon: 'solar:phone-calling-bold' },
  { key: 'redis', label: 'Redis', icon: 'solar:database-bold' },
  { key: 'supabase', label: 'Supabase', icon: 'solar:server-bold' },
];

const STATUS_COLORS = {
  ok: 'var(--status-success)',
  degraded: 'var(--status-warning)',
  down: 'var(--status-error)',
};

const dotStyle = (status) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: STATUS_COLORS[status] || 'var(--neutral-200)',
  flexShrink: 0,
});

export function SystemHealthStrip() {
  const systemHealth = useAppStore(s => s.systemHealth);
  if (!systemHealth) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '6px 16px',
      background: 'var(--neutral-50)',
      borderBottom: '0.5px solid var(--neutral-150)',
      fontSize: 12,
      color: 'var(--neutral-300)',
    }}>
      <span style={{ fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>System Health</span>
      {SYSTEMS.map(sys => {
        const status = systemHealth[sys.key] || 'ok';
        return (
          <div key={sys.key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={dotStyle(status)} />
            <Icon name={sys.icon} size={12} color={STATUS_COLORS[status]} />
            <span style={{ color: STATUS_COLORS[status], fontWeight: status !== 'ok' ? 500 : 400 }}>
              {sys.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
