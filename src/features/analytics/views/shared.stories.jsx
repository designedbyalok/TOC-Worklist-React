import { KpiCard, InsightBanner, Card, ProgressBar, StatusPill, Tag } from './shared';
import { useAppStore } from '../../../store/useAppStore';

export default {
  title: 'Analytics/Widgets',
};

export const KpiCards = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, width: 900 }}>
      <KpiCard label="Total Lives" value="8,420" delta="+340 YoY" deltaType="pos" sub="Attributed population" accentColor="var(--primary-300)" />
      <KpiCard label="TCOC PMPM" value="$890" delta="+$42 vs prior year" deltaType="neg" sub="Risk-adjusted, annualized" accentColor="var(--status-error)" />
      <KpiCard label="Avg RAF Score" value="1.042" delta="+0.018 QoQ" deltaType="pos" sub="Community, non-dual" accentColor="var(--primary-300)" />
      <KpiCard label="Medical Loss Ratio" value="84.2%" delta="-1.2pp YoY" deltaType="pos" sub="Payer contracts only" accentColor="var(--status-success)" />
    </div>
  ),
};

export const InsightBannerDefault = {
  render: () => (
    <div style={{ width: 800 }}>
      <InsightBanner
        icon="solar:lightbulb-minimalistic-linear"
        title="AI Insight Summary — YTD 2025"
        text="Readmissions up <strong>+20% vs Q3</strong>. RAF gap on <strong>1,840 members</strong> = <strong>$2.1M</strong>."
        buttons={[
          { label: 'Utilization Detail', primary: true, navTo: 'utilization' },
          { label: 'Risk & Revenue', navTo: 'risk' },
        ]}
        showToast={(msg) => alert(msg)}
      />
    </div>
  ),
};

export const InsightBannerAmber = {
  render: () => (
    <div style={{ width: 800 }}>
      <InsightBanner
        icon="solar:chart-2-linear"
        title="Key Drivers — Where to Focus"
        variant="amber"
        text="Cost: <strong>Inpatient $23 over benchmark</strong>. Quality: <strong>AWV 19pp below target</strong>."
        buttons={[
          { label: 'Financial', toast: 'Opening Financial view' },
          { label: 'Quality', toast: 'Opening Quality view' },
        ]}
        showToast={(msg) => alert(msg)}
      />
    </div>
  ),
};

export const CardWithContent = {
  render: () => (
    <div style={{ width: 500 }}>
      <Card title="Quality Summary" sub="YTD 2025" actions={<button style={{ border: 'none', background: 'none', color: 'var(--primary-300)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Full View →</button>}>
        <ProgressBar label="AWV Completion" value="61%" pct={61} color="amber" sub="Target 80% · 847 unscheduled" />
        <ProgressBar label="Diabetes HbA1c Control" value="72%" pct={72} color="teal" sub="Target 70% ✓" />
        <ProgressBar label="BP Control (<140/90)" value="64%" pct={64} color="purple" sub="Target 70%" />
      </Card>
    </div>
  ),
};

export const ProgressBars = {
  render: () => (
    <div style={{ width: 400 }}>
      <ProgressBar label="AWV Completion" value="61%" pct={61} color="amber" sub="Target 80%" />
      <ProgressBar label="HbA1c Control" value="72%" pct={72} color="teal" sub="Target 70% ✓" />
      <ProgressBar label="BP Control" value="64%" pct={64} color="purple" sub="Target 70%" />
      <ProgressBar label="Screening" value="83%" pct={83} color="green" sub="Target 80% ✓" />
      <ProgressBar label="At Risk" value="38%" pct={38} color="red" sub="Target <30%" />
    </div>
  ),
};

export const StatusPills = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <StatusPill label="On Track" variant="green" />
      <StatusPill label="Review" variant="amber" />
      <StatusPill label="At Risk" variant="red" />
      <StatusPill label="Pending" variant="neutral" />
    </div>
  ),
};

export const Tags = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Tag label="★ STARS" variant="stars" />
      <Tag label="HEDIS" variant="hedis" />
      <Tag label="ACO" variant="aco" />
    </div>
  ),
};
