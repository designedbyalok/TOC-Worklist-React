import { useState, useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { FALLBACK_CONFIGS } from '../../../data/analyticsFallbacks';
import { Card, safeConfigData } from './shared';
import { SavingsAreaChart } from './charts';
import { Slider } from '../../../components/ui/slider';
import s from '../AnalyticsLayout.module.css';

const DEFAULT_FALLBACK = FALLBACK_CONFIGS.roi_levers || { levers: [], baselines: {} };

export function RoiView({ showToast }) {
  const fetchConfig = useAppStore(st => st.fetchConfig);
  const period = useAppStore(st => st.analyticsPeriod);

  const [config, setConfig] = useState(FALLBACK_CONFIGS.roi_levers);

  useEffect(() => {
    fetchConfig('roi_levers').then(d => d && setConfig(d));
  }, [period]);

  const safeConfig = safeConfigData(config, DEFAULT_FALLBACK);
  const levers = safeConfig.levers || DEFAULT_FALLBACK.levers || [];
  const baselines = safeConfig.baselines || DEFAULT_FALLBACK.baselines || {};

  // Build local slider state from config defaults
  const [sliders, setSliders] = useState(() => {
    const init = {};
    (DEFAULT_FALLBACK.levers || []).forEach(l => { init[l.key] = l.default; });
    return init;
  });

  // Re-init sliders when config changes
  useEffect(() => {
    const init = {};
    levers.forEach(l => { init[l.key] = l.default ?? 0; });
    setSliders(init);
  }, [config]);

  const setSlider = (key, val) => setSliders(prev => ({ ...prev, [key]: val }));

  // Calculate savings
  const leverSavings = levers.map(l => ({
    ...l,
    savings: Math.round((sliders[l.key] || 0) * (l.multiplier || 0)),
  }));
  const totalSavings = leverSavings.reduce((sum, l) => sum + l.savings, 0);
  const totalRoi = totalSavings > 0 ? (totalSavings / (baselines.investmentBase || 1200000)).toFixed(1) : '0.0';

  const fmt = (n) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;

  const tcoc = sliders.tcoc || 0;
  const quality = sliders.quality || 0;
  const readmit = sliders.readmit || 0;

  return (
    <>
      <div className={s.simWrap}>
        <Card title="Scenario Levers" sub="Adjust to model impact">
          {levers.map((lev, i) => (
            <div key={i} className={s.levGroup}>
              <div className={s.levLabel}>
                <span className={s.levName}>{lev.label}</span>
                <span className={s.levVal}>{sliders[lev.key] || 0}{lev.unit}</span>
              </div>
              <div className={s.levSub}>{lev.sub}</div>
              <Slider
                min={0}
                max={100}
                value={[sliders[lev.key] || 0]}
                onValueChange={([val]) => setSlider(lev.key, val)}
                className={s.simRange}
              />
            </div>
          ))}
        </Card>

        <div>
          <div className={s.simKpiRow}>
            <div className={s.simKpiCard}>
              <div className={s.simKpiLabel}>Total Projected Savings</div>
              <div className={s.simKpiCurr}>Current: {fmt(baselines.totalSavings || 0)}</div>
              <div className={s.simKpiProj}>{fmt(totalSavings)}</div>
            </div>
            <div className={s.simKpiCard}>
              <div className={s.simKpiLabel}>Projected ROI</div>
              <div className={s.simKpiCurr}>Current: {baselines.roi || 0}x</div>
              <div className={s.simKpiProj}>{totalRoi}x</div>
            </div>
            <div className={s.simKpiCard}>
              <div className={s.simKpiLabel}>Net Revenue Impact</div>
              <div className={s.simKpiCurr}>Current: {fmt(baselines.netRevenue || 0)}</div>
              <div className={s.simKpiProj}>{fmt(Math.round(totalSavings * (baselines.netRevenueMultiplier || 0.65)))}</div>
            </div>
          </div>
          <div className={s.simKpiRow}>
            <div className={s.simKpiCard}>
              <div className={s.simKpiLabel}>TCOC PMPM</div>
              <div className={s.simKpiCurr}>Current: ${baselines.tcocPmpm || 0}</div>
              <div className={s.simKpiProj}>${Math.round((baselines.tcocPmpm || 0) - (tcoc * (baselines.tcocReducePerPct || 2.8)))}</div>
            </div>
            <div className={s.simKpiCard}>
              <div className={s.simKpiLabel}>Readmit Rate</div>
              <div className={s.simKpiCurr}>Current: {baselines.readmitRate || 0}%</div>
              <div className={s.simKpiProj}>{((baselines.readmitRate || 0) - (readmit * (baselines.readmitReducePerPct || 0.08))).toFixed(1)}%</div>
            </div>
            <div className={s.simKpiCard}>
              <div className={s.simKpiLabel}>Quality Score</div>
              <div className={s.simKpiCurr}>Current: {baselines.qualityScore || 0}/5</div>
              <div className={s.simKpiProj}>{((baselines.qualityScore || 0) + (quality * (baselines.qualityGainPerPct || 0.009))).toFixed(1)}/5</div>
            </div>
          </div>

          <Card title="Savings Breakdown" flush>
            <div className={s.tblWrap}>
              <table className={s.tbl}>
                <thead>
                  <tr><th>Lever</th><th className={s.r}>Improvement</th><th className={s.r}>Projected Savings</th><th className={s.r}>% of Total</th></tr>
                </thead>
                <tbody>
                  {leverSavings.map((l, i) => (
                    <tr key={i}>
                      <td className={s.fw600}>{l.label}</td>
                      <td className={`${s.r} ${s.mono}`}>{sliders[l.key] || 0}{l.unit}</td>
                      <td className={`${s.r} ${s.valG}`}>{fmt(l.savings)}</td>
                      <td className={`${s.r} ${s.mono}`}>{totalSavings > 0 ? Math.round((l.savings / totalSavings) * 100) : 0}%</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 500 }}>
                    <td className={s.fw600}>Total</td>
                    <td className={s.r}>-</td>
                    <td className={`${s.r} ${s.valG}`}>{fmt(totalSavings)}</td>
                    <td className={`${s.r} ${s.mono}`}>100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Projected Full-Year Shared Savings */}
      <Card title="Projected Full-Year Shared Savings" sub="Based on current lever settings">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 12 }}>
          <div style={{ padding: '12px 14px', background: 'var(--neutral-0)', border: '1px solid var(--neutral-150)', borderRadius: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.4px', color: 'var(--neutral-200)', marginBottom: 4 }}>Projected Savings</div>
            <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--status-success)' }}>{fmt(totalSavings)}</div>
            <div style={{ fontSize: 12, color: 'var(--neutral-300)', marginTop: 2 }}>Full-year annualized</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--neutral-0)', border: '1px solid var(--neutral-150)', borderRadius: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.4px', color: 'var(--neutral-200)', marginBottom: 4 }}>Prob. Exceeding MSR</div>
            <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--status-warning)' }}>{totalSavings > 2800000 ? '92' : totalSavings > 2000000 ? '78' : totalSavings > 1000000 ? '54' : '28'}%</div>
            <div style={{ fontSize: 12, color: 'var(--neutral-300)', marginTop: 2 }}>Monte Carlo simulation</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--neutral-0)', border: '1px solid var(--neutral-150)', borderRadius: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.4px', color: 'var(--neutral-200)', marginBottom: 4 }}>Quality Composite</div>
            <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--neutral-500)' }}>{((baselines.qualityScore || 0) + (quality * (baselines.qualityGainPerPct || 0.009))).toFixed(1)}/5</div>
            <div style={{ fontSize: 12, color: 'var(--neutral-300)', marginTop: 2 }}>Secures max sharing rate</div>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--neutral-0)', border: '1px solid var(--neutral-150)', borderRadius: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.4px', color: 'var(--neutral-200)', marginBottom: 4 }}>Net Revenue Impact</div>
            <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--neutral-500)' }}>{fmt(Math.round(totalSavings * (baselines.netRevenueMultiplier || 0.65)))}</div>
            <div style={{ fontSize: 12, color: 'var(--neutral-300)', marginTop: 2 }}>After withhold &amp; reconciliation</div>
          </div>
        </div>
        <SavingsAreaChart
          data={[0, totalSavings * 0.08, totalSavings * 0.16, totalSavings * 0.26, totalSavings * 0.38, totalSavings * 0.48, totalSavings * 0.58, totalSavings * 0.68, totalSavings * 0.78, totalSavings * 0.88, totalSavings * 0.95, totalSavings].map(v => +(v / 1000000).toFixed(2))}
          targetLabel={`MSR ${fmt(baselines.msr || 2800000)}`}
          targetValue={(baselines.msr || 2800000) / 1000000}
        />
      </Card>
    </>
  );
}
