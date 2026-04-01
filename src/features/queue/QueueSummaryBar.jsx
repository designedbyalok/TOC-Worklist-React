import { useMemo } from 'react';
import { Icon } from '../../components/Icon/Icon';
import { useAppStore } from '../../store/useAppStore';

const cardStyle = {
  flex: 1,
  minWidth: 140,
  padding: '12px 16px',
  background: '#fff',
  border: '0.5px solid var(--neutral-150)',
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};
const labelStyle = { fontSize: 11, fontWeight: 500, color: 'var(--neutral-300)', textTransform: 'uppercase', letterSpacing: '0.04em' };
const valueStyle = { fontSize: 20, fontWeight: 500, color: 'var(--neutral-500)', lineHeight: 1.2 };

function StatCard({ icon, iconColor, label, value, sub, subColor }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name={icon} size={14} color={iconColor} />
        <span style={labelStyle}>{label}</span>
      </div>
      <div style={valueStyle}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: subColor || 'var(--neutral-300)' }}>{sub}</div>}
    </div>
  );
}

export function QueueSummaryBar() {
  const patients = useAppStore(s => s.patients);
  const callDetails = useAppStore(s => s.callDetails);

  const stats = useMemo(() => {
    const assigned = patients.filter(p => p.agentAssigned);
    const activeCalls = assigned.filter(p => p.status === 'oncall').length;
    const queued = assigned.filter(p => p.status === 'queued').length;
    const completed = assigned.filter(p => p.status === 'completed').length;
    const failed = assigned.filter(p => p.status === 'failed').length;
    const total = completed + failed;
    const resolutionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const escalated = callDetails.filter(c => c.escalation).length;
    const escalationRate = total > 0 ? Math.round((escalated / total) * 100) : 0;

    // Avg handle time from completed call records
    const completedCalls = callDetails.filter(c => c.callType === 'completed' && c.duration);
    let avgHandleTime = '0:00';
    if (completedCalls.length) {
      const totalSecs = completedCalls.reduce((acc, c) => {
        const [m, s] = (c.duration || '0:00').split(':').map(Number);
        return acc + m * 60 + (s || 0);
      }, 0);
      const avg = Math.round(totalSecs / completedCalls.length);
      avgHandleTime = `${Math.floor(avg / 60)}:${String(avg % 60).padStart(2, '0')}`;
    }

    return { activeCalls, queued, completed, resolutionRate, escalationRate, avgHandleTime, total: assigned.length };
  }, [patients, callDetails]);

  return (
    <div style={{ display: 'flex', gap: 10, padding: '12px 16px 4px', flexWrap: 'wrap' }}>
      <StatCard
        icon="solar:phone-calling-bold" iconColor="#059669"
        label="Active Calls" value={stats.activeCalls}
        sub={`${stats.queued} in queue`}
      />
      <StatCard
        icon="solar:check-circle-bold" iconColor="var(--status-success)"
        label="Resolution Rate" value={`${stats.resolutionRate}%`}
        sub={`${stats.completed} of ${stats.completed + (stats.total - stats.completed)} resolved`}
        subColor="var(--status-success)"
      />
      <StatCard
        icon="solar:clock-circle-bold" iconColor="var(--status-info)"
        label="Avg Handle Time" value={stats.avgHandleTime}
        sub="per call"
      />
      <StatCard
        icon="solar:danger-triangle-bold" iconColor="var(--status-error)"
        label="Escalation Rate" value={`${stats.escalationRate}%`}
        sub={stats.escalationRate > 15 ? 'Above threshold' : 'Within normal'}
        subColor={stats.escalationRate > 15 ? 'var(--status-error)' : 'var(--status-success)'}
      />
      <StatCard
        icon="solar:users-group-rounded-bold" iconColor="var(--primary-300)"
        label="Queue Depth" value={stats.total}
        sub={`${stats.activeCalls} active · ${stats.queued} queued`}
      />
    </div>
  );
}
