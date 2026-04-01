/**
 * Analytics Charts — Recharts-based, interactive, themed to Fold Health design system
 *
 * All charts:
 * - Responsive (ResponsiveContainer)
 * - Custom tooltip matching Fold design
 * - Consistent colors from design tokens
 * - Data from props (DB or fallback)
 */
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend,
} from 'recharts';

// ─── Design Tokens ───
const COLORS = {
  primary: 'var(--primary-300)',      // --primary-300
  primaryLight: 'var(--primary-200)',  // --primary-200
  green: 'var(--status-success)',         // --status-success
  greenLight: 'var(--status-success-light)',    // --status-success-light
  red: 'var(--status-error)',           // --status-error
  amber: 'var(--status-warning)',         // --status-warning
  secondary: 'var(--secondary-300)',     // --secondary-300
  neutral300: 'var(--neutral-300)',    // --grey-300
  neutral200: 'var(--neutral-200)',    // --grey-200
  neutral150: 'var(--neutral-150)',    // --grey-150
  neutral100: 'var(--neutral-100)',    // --grey-100
  neutral50: 'var(--neutral-50)',     // --grey-50
  white: '#FFFFFF',         // --monochrome-white
};

const FONT = { fontFamily: "'Inter', sans-serif" };

// ─── Shared Custom Tooltip ───
function FoldTooltip({ active, payload, label, prefix = '$', suffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: COLORS.white, borderRadius: 8, padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,.1)', border: `1px solid ${COLORS.neutral100}`,
      minWidth: 120,
    }}>
      <div style={{ fontSize: 12, color: COLORS.neutral200, fontWeight: 500, marginBottom: 6, ...FONT }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: i < payload.length - 1 ? 4 : 0,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: COLORS.neutral300, flex: 1, ...FONT }}>
            {p.name || p.dataKey}
          </span>
          <span style={{ fontSize: 14, color: COLORS.neutral300, fontWeight: 500, ...FONT }}>
            {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Shared axis tick style ───
const AXIS_TICK = { fontSize: 12, fill: COLORS.neutral200, ...FONT };
const GRID_STYLE = { stroke: COLORS.neutral100, strokeDasharray: '3 3' };

// ═══════════════════════════════════════════════════
//  1. TCOC Trend Chart (Executive Dashboard)
// ═══════════════════════════════════════════════════
export function TcocLineChart({ tab, data, benchmark, mode = 'pmpm' }) {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const isTotal = mode === 'total';
  const series = data?.[`tcoc_${tab}`] || data?.tcoc_all || [];
  const benchSeries = benchmark || null;
  // For "Total Cost" mode, multiply PMPM by a member count factor (8,420 members / 1000)
  const multiplier = isTotal ? 8.42 : 1;

  const chartData = MONTHS.map((m, i) => ({
    month: m,
    value: series[i] != null ? Math.round(series[i] * multiplier) : null,
    ...(benchSeries ? { benchmark: benchSeries[i] != null ? Math.round(benchSeries[i] * multiplier) : null } : {}),
  }));

  const labelName = isTotal ? 'Total Cost' : 'TCOC PMPM';
  const yFormat = isTotal ? (v => `$${(v / 1000).toFixed(0)}K`) : (v => `$${v}`);
  const tipPrefix = '$';
  const tipSuffix = isTotal ? 'K' : '';

  return (
    <div style={{ padding: '8px 14px 4px' }}>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: 8 }}>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="month" tick={AXIS_TICK} axisLine={{ stroke: COLORS.neutral150 }} tickLine={false} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} tickFormatter={yFormat} width={isTotal ? 52 : 48} />
          <Tooltip content={<FoldTooltip prefix={tipPrefix} suffix={tipSuffix} />} />
          <Line type="monotone" dataKey="value" name={labelName} stroke={COLORS.primary} strokeWidth={2} dot={{ r: 3, fill: COLORS.primary, strokeWidth: 0 }} activeDot={{ r: 5, fill: COLORS.primary, stroke: COLORS.white, strokeWidth: 2 }} />
          {benchSeries && (
            <Line type="monotone" dataKey="benchmark" name="Benchmark" stroke={COLORS.neutral200} strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  2. Savings Trajectory Chart (Executive / Shared Savings)
// ═══════════════════════════════════════════════════
export function SavingsAreaChart({ data, targetLabel, targetValue }) {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const values = Array.isArray(data) ? data : [0.18, 0.34, 0.48, 0.62, 0.78, 0.88, 0.96, 1.04, 1.12, 1.20, 1.26, 1.32];

  const chartData = MONTHS.map((m, i) => ({
    month: m,
    savings: values[i] != null ? values[i] : null,
  }));

  return (
    <div style={{ padding: '8px 14px 4px' }}>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: 8 }}>
          <defs>
            <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLORS.green} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="month" tick={AXIS_TICK} axisLine={{ stroke: COLORS.neutral150 }} tickLine={false} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={v => `$${v}M`} width={48} />
          <Tooltip content={<FoldTooltip prefix="$" suffix="M" />} />
          {targetValue && (
            <ReferenceLine y={targetValue} stroke={COLORS.amber} strokeDasharray="4 4" strokeWidth={1.5} label={{ value: targetLabel || 'Target', position: 'right', fill: COLORS.amber, fontSize: 12, ...FONT }} />
          )}
          <Area type="monotone" dataKey="savings" name="Savings" stroke={COLORS.green} strokeWidth={2} fill="url(#savingsGrad)" dot={{ r: 3, fill: COLORS.green, strokeWidth: 0 }} activeDot={{ r: 5, fill: COLORS.green, stroke: COLORS.white, strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  3. RAF Score Trend Chart (Risk & Revenue)
// ═══════════════════════════════════════════════════
export function RafTrendLineChart({ data, potential }) {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const values = Array.isArray(data) ? data : [1.02, 1.02, 1.03, 1.03, 1.04, 1.04, 1.03, 1.04, 1.04, 1.04, 1.04, 1.042];

  const chartData = MONTHS.map((m, i) => ({
    month: m,
    raf: values[i] ?? null,
  }));

  return (
    <div style={{ padding: '8px 14px 4px' }}>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: 8 }}>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="month" tick={AXIS_TICK} axisLine={{ stroke: COLORS.neutral150 }} tickLine={false} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={['dataMin - 0.01', (potential || 1.15) + 0.01]} width={42} />
          <Tooltip content={<FoldTooltip prefix="" />} />
          {potential && (
            <ReferenceLine y={potential} stroke={COLORS.primary} strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `Potential ${potential}`, position: 'right', fill: COLORS.primary, fontSize: 12, ...FONT }} />
          )}
          <Line type="monotone" dataKey="raf" name="Avg RAF" stroke={COLORS.secondary} strokeWidth={2} dot={{ r: 3, fill: COLORS.secondary, strokeWidth: 0 }} activeDot={{ r: 5, fill: COLORS.secondary, stroke: COLORS.white, strokeWidth: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  4. Readmission Rate Trend Chart (Utilization)
// ═══════════════════════════════════════════════════
export function ReadmitTrendLineChart({ data, threshold }) {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const values = Array.isArray(data) ? data : [15.2, 15.8, 16.1, 16.4, 16.8, 17.2, 17.0, 17.6, 17.8, 18.0, 18.2, 18.4];

  const chartData = MONTHS.map((m, i) => ({
    month: m,
    rate: values[i] ?? null,
  }));

  return (
    <div style={{ padding: '8px 14px 4px' }}>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: 8 }}>
          <defs>
            <linearGradient id="readmitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.red} stopOpacity={0.12} />
              <stop offset="95%" stopColor={COLORS.red} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid {...GRID_STYLE} vertical={false} />
          <XAxis dataKey="month" tick={AXIS_TICK} axisLine={{ stroke: COLORS.neutral150 }} tickLine={false} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={42} domain={['dataMin - 1', 'dataMax + 1']} />
          <Tooltip content={<FoldTooltip prefix="" suffix="%" />} />
          {threshold && (
            <ReferenceLine y={threshold} stroke={COLORS.green} strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `Threshold ${threshold}%`, position: 'right', fill: COLORS.green, fontSize: 12, ...FONT }} />
          )}
          <Area type="monotone" dataKey="rate" name="Readmit Rate" stroke={COLORS.red} strokeWidth={2} fill="url(#readmitGrad)" dot={{ r: 3, fill: COLORS.red, strokeWidth: 0 }} activeDot={{ r: 5, fill: COLORS.red, stroke: COLORS.white, strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
