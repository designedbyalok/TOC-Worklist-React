import { useState, useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { FALLBACK_KPIS, FALLBACK_TABLES, FALLBACK_PROGRESS_BARS } from '../../../data/analyticsFallbacks';
import { KpiCard, InsightBanner, Card, ProgressBar, safeBarItems, safeTableRows } from './shared';
import { SavingsAreaChart } from './charts';
import s from '../AnalyticsLayout.module.css';

export function SharedSavingsView({ showToast }) {
  const fetchViewKpis = useAppStore(st => st.fetchViewKpis);
  const fetchViewTable = useAppStore(st => st.fetchViewTable);
  const fetchProgressBars = useAppStore(st => st.fetchProgressBars);
  const period = useAppStore(st => st.analyticsPeriod);

  const fb = FALLBACK_KPIS.shared || { kpis: [], insight: null };
  const [kpiData, setKpiData] = useState(fb);
  const [keyLevers, setKeyLevers] = useState(FALLBACK_TABLES.key_levers);
  const [qualityComposite, setQualityComposite] = useState(FALLBACK_PROGRESS_BARS.quality_composite);

  useEffect(() => {
    fetchViewKpis('shared').then(d => d && setKpiData(d));
    fetchViewTable('shared', 'key_levers').then(d => d && setKeyLevers(d));
    fetchProgressBars('shared', 'quality_composite').then(d => d && setQualityComposite(d));
  }, [period]);

  const kpis = kpiData?.kpis || fb.kpis || [];
  const insight = kpiData?.insight || fb.insight;
  const leverRows = safeTableRows(keyLevers, (FALLBACK_TABLES.key_levers || {}).rows);
  const compositeItems = safeBarItems(qualityComposite);

  const savingsData = [0, 0.1, 0.2, 0.35, 0.5, 0.62, 0.75, 0.9, 1.0, 1.1, 1.2, 1.32];

  const savingsMetadata = [
    { label: 'Benchmark PMPM', value: '$910' },
    { label: 'Actual PMPM', value: '$890' },
    { label: 'Savings/Member/Mo', value: '$20' },
    { label: 'Full-Year Proj.', value: '$3.2M' },
    { label: 'Min. Savings Rate', value: '$2.8M' },
    { label: 'Quality Withhold', value: '$320K' },
  ];

  // Quality composite fallback (8 measures in 2-col layout)
  const qualFallback = compositeItems.length > 0 ? compositeItems : [
    { label: 'AWV / Care Coordination', value: '61% / target 80%', pct: 61, color: 'amber', sub: 'Pulling composite down \u2014 847 open AWVs' },
    { label: 'Diabetes HbA1c Control', value: '72% / target 70%', pct: 72, color: 'teal', sub: '\u2713 On target' },
    { label: 'BP Control', value: '64% / target 70%', pct: 64, color: 'purple', sub: '6pp gap \u2014 504 members' },
    { label: 'Colorectal Screening', value: '58% / target 65%', pct: 58, color: 'red', sub: '7pp gap \u2014 588 members' },
    { label: 'Depression Screening PHQ-9', value: '83% / target 80%', pct: 83, color: 'green', sub: '\u2713 Above target' },
    { label: 'Statin Therapy \u2014 Diabetes', value: '71% / target 75%', pct: 71, color: 'amber', sub: '4pp gap \u2014 336 members' },
    { label: 'Patient Experience CAHPS', value: '4.3 / 5.0', pct: 86, color: 'green', sub: '\u2713 Strong' },
    { label: 'Preventive Screening', value: '63% / target 70%', pct: 63, color: 'amber', sub: '7pp gap \u2014 colorectal gap' },
  ];

  return (
    <>
      {insight && (
        <InsightBanner
          icon={insight.icon}
          title={insight.title}
          variant={insight.variant}
          text={insight.text}
          buttons={insight.buttons || []}
          showToast={showToast}
        />
      )}

      <div className={s.kpiGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {kpis.map(k => (
          <KpiCard key={k.key} value={k.value} label={k.label} delta={k.delta} deltaType={k.deltaType} sub={k.sub} accentColor={k.accentColor} />
        ))}
      </div>

      <div className={s.g2}>
        {/* Savings Trajectory Chart */}
        <Card title="Savings Trajectory" sub="MSSP">
          <SavingsAreaChart data={savingsData} targetLabel="MSR $2.8M" targetValue={2.8} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--neutral-100)' }}>
            {savingsMetadata.map(m => (
              <div key={m.label}>
                <div style={{ fontSize: 12, color: 'var(--neutral-200)' }}>{m.label}</div>
                <div style={{ fontSize: 14, fontWeight: 500, fontFamily: "'Inter', sans-serif", color: 'var(--neutral-500)', marginTop: 2 }}>{m.value}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Key Savings Levers */}
        <Card title="Key Savings Levers \u2014 Current Status">
          {leverRows.length > 0 ? (
            <div className={s.tblWrap}>
              <table className={s.tbl}>
                <thead>
                  <tr><th>Lever</th><th className={s.r}>Current</th><th className={s.r}>Target</th><th className={s.r}>Gap</th><th className={s.r}>Savings Impact</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {leverRows.map((row, i) => {
                    const st = row.status;
                    return (
                      <tr key={i}>
                        <td className={s.fw600}>{row.lever}</td>
                        <td className={`${s.r} ${s.mono}`}>{row.current}</td>
                        <td className={`${s.r} ${s.mono}`}>{row.target}</td>
                        <td className={`${s.r} ${st === 'red' ? s.valR : st === 'amber' ? s.valA : s.valG}`}>{row.gap}</td>
                        <td className={`${s.r} ${s.fw600}`}>{row.impact}</td>
                        <td>
                          <span className={`${s.stPill} ${st === 'green' ? s.stGreen : st === 'red' ? s.stRed : s.stAmber}`}>
                            {st === 'green' ? 'On Track' : st === 'red' ? 'At Risk' : 'Monitor'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <ProgressBar label="IP Admissions / 1000" value="287 vs 265 benchmark" pct={65} color="amber" sub="$23 PMPM over \u2014 top savings opportunity" />
              <ProgressBar label="30-Day Readmission Rate" value="18.4% vs 15% threshold" pct={55} color="red" sub="3.4pp over \u2014 $840K projected cost" />
              <ProgressBar label="RAF Recapture Gap" value="0.078 RAF pts \u00B7 $2.1M revenue" pct={42} color="red" sub="Open HCC suspects unaddressed" />
              <ProgressBar label="Quality Composite" value="4.1 / 5.0 \u00B7 above share threshold" pct={82} color="green" sub="100% quality withhold share secured" />
              <ProgressBar label="Pharmacy PMPM Growth" value="+18% QoQ \u00B7 GLP-1 driving" pct={58} color="amber" sub="Risk to TCOC if not managed" />
            </>
          )}
          <button
            className={`${s.btn} ${s.btnPrimary}`}
            style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}
            onClick={() => showToast?.('Opening ROI Simulator')}
          >
            &#9654; Run Scenario Simulator &rarr;
          </button>
        </Card>
      </div>

      {/* Quality Composite Breakdown */}
      <Card title="Quality Composite Breakdown" actions={<button className={`${s.btn} ${s.btnGhost}`} onClick={() => showToast?.('Opening full Quality view')}>Full Quality View &rarr;</button>}>
        <div className={s.g2}>
          <div>
            {qualFallback.slice(0, 4).map(b => (
              <ProgressBar key={b.label} label={b.label} value={b.value} pct={b.pct} color={b.color} sub={b.sub} />
            ))}
          </div>
          <div>
            {qualFallback.slice(4, 8).map(b => (
              <ProgressBar key={b.label} label={b.label} value={b.value} pct={b.pct} color={b.color} sub={b.sub} />
            ))}
          </div>
        </div>
      </Card>
    </>
  );
}

