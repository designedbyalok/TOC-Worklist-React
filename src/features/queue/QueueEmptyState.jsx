import { Icon } from '../../components/Icon/Icon';
import { useAppStore } from '../../store/useAppStore';

export function QueueEmptyState() {
  const setActiveTab = useAppStore(s => s.setActiveTab);

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', paddingBottom: 64 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 12,
          background: 'var(--neutral-50)', border: '0.5px solid var(--neutral-150)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4
        }}>
          <Icon name="solar:bot-linear" size={26} color="var(--neutral-200)" />
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--neutral-400)' }}>No active agent runs</div>
        <div style={{ fontSize: 13, color: 'var(--neutral-300)', lineHeight: 1.5 }}>
          Invoke an agent from the Worklist to start.
        </div>
        <a
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4,
            fontSize: 13, color: 'var(--primary-300)', cursor: 'pointer', textDecoration: 'none'
          }}
          onClick={() => setActiveTab('worklist')}
        >
          <Icon name="solar:arrow-left-linear" size={13} />
          Go to TOC Worklist
        </a>
      </div>
    </div>
  );
}
