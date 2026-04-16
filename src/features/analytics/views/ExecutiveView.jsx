import { useState, useEffect } from 'react';
import { Button } from '../../../components/Button/Button';
import { useAppStore } from '../../../store/useAppStore';
import { FALLBACK_KPIS, FALLBACK_TIME_SERIES, FALLBACK_TABLES, FALLBACK_PROGRESS_BARS, FALLBACK_CONFIGS } from '../../../data/analyticsFallbacks';
import { Icon } from '../../../components/Icon/Icon';
import { Toggle } from '../../../components/Toggle/Toggle';
import { KpiCard, InsightBanner, Card, ProgressBar, GhostBtn, safeTableRows, safeBarItems } from './shared';
import { TcocLineChart, SavingsAreaChart } from './charts';
import s from '../AnalyticsLayout.module.css';

export function ExecutiveView({ showToast }) {
  const fetchViewKpis = useAppStore(st => st.fetchViewKpis);
  const fetchTimeSeries = useAppStore(st => st.fetchTimeSeries);
  const fetchViewTable = useAppStore(st => st.fetchViewTable);
  const fetchProgressBars = useAppStore(st => st.fetchProgressBars);
  const fetchConfig = useAppStore(st => st.fetchConfig);
  const period = useAppStore(st => st.analyticsPeriod);
  const periodMode = useAppStore(st => st.analyticsPeriodMode);

  const fb = FALLBACK_KPIS.executive || { kpis: [], insight: null };
  const [kpiData, setKpiData] = useState(fb);
  const [tcocData, setTcocData] = useState(FALLBACK_TIME_SERIES);
  const [costData, setCostData] = useState(FALLBACK_TABLES.cost_by_setting_benchmark);
  const [qualitySummary, setQualitySummary] = useState(FALLBACK_PROGRESS_BARS.executive_quality_summary);
  const [tcocTab, setTcocTab] = useState('all');
  const [tcocMode, setTcocMode] = useState('pmpm'); // 'pmpm' | 'total'
  const [costInlineData, setCostInlineData] = useState(FALLBACK_CONFIGS.exec_cost_by_setting_inline);
  const [savingsData, setSavingsData] = useState(FALLBACK_CONFIGS.exec_savings_trajectory);
  const [careProgramData, setCareProgramData] = useState(FALLBACK_CONFIGS.exec_care_programs);

  useEffect(() => {
    fetchViewKpis('executive').then(d => d && setKpiData(d));
    fetchTimeSeries(['tcoc_all','tcoc_ip','tcoc_op','tcoc_ed','tcoc_rx','tcoc_pac']).then(d => d && setTcocData(d));
    fetchViewTable('executive', 'cost_by_setting_benchmark').then(d => d && setCostData(d));
    fetchProgressBars('executive', 'executive_quality_summary').then(d => d && setQualitySummary(d));
    fetchConfig('exec_cost_by_setting_inline').then(d => d && setCostInlineData(d));
    fetchConfig('exec_savings_trajectory').then(d => d && setSavingsData(d));
    fetchConfig('exec_care_programs').then(d => d && setCareProgramData(d));
  }, [period, periodMode]);

  const kpis = kpiData?.kpis || fb.kpis || [];
  const insight = kpiData?.insight || fb.insight;
  const costRows = safeTableRows(costData, (FALLBACK_TABLES.cost_by_setting_benchmark || {}).rows);
  const qualityItems = safeBarItems(qualitySummary);

  // Fallback quality summary if not from DB
  const qualFallback = qualityItems.length > 0 ? qualityItems : [
    { label: 'AWV Completion', value: '61%', pct: 61, color: 'amber', sub: 'Target 80% \u00B7 847 unscheduled' },
    { label: 'Diabetes HbA1c Control', value: '72%', pct: 72, color: 'teal', sub: 'Target 70% \u2713' },
    { label: 'BP Control (<140/90)', value: '64%', pct: 64, color: 'purple', sub: 'Target 70%' },
    { label: 'Colorectal Screening', value: '58%', pct: 58, color: 'red', sub: 'Target 65%' },
    { label: 'Depression Screening', value: '83%', pct: 83, color: 'green', sub: 'Target 80% \u2713' },
  ];

  // Cost by setting inline data (from DB or fallback)
  const costBySettingInline = costInlineData?.items || FALLBACK_CONFIGS.exec_cost_by_setting_inline?.items || [];

  // Shared savings trajectory data — period mode adjusts values
  const rawSavings = savingsData?.data_points || FALLBACK_CONFIGS.exec_savings_trajectory?.data_points || [];
  const savingsTrajectory = periodMode === 'r12'
    ? rawSavings.map(v => v != null ? +(v * 1.15).toFixed(2) : null)
    : rawSavings;

  // Care program data (from DB or fallback)
  const carePrograms = careProgramData?.rows || FALLBACK_CONFIGS.exec_care_programs?.rows || [];

  const periodLabel = periodMode === 'ytd' ? 'YTD 2025' : 'Rolling 12M';

  return (
    <>
      {/* AI Insight Summary */}
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
        {kpis.slice(0, 4).map(k => (
          <KpiCard key={k.key} value={k.value} label={k.label} delta={k.delta} deltaType={k.deltaType} sub={k.sub} accentColor={k.accentColor} />
        ))}
      </div>

      <div className={s.kpiGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {kpis.slice(4, 8).map(k => (
          <KpiCard key={k.key} value={k.value} label={k.label} delta={k.delta} deltaType={k.deltaType} sub={k.sub} accentColor={k.accentColor} />
        ))}
      </div>

      {/* Key Drivers Insight Banner */}
      <InsightBanner
        icon="solar:chart-2-linear"
        title="Key Drivers \u2014 Where to Focus"
        text="Cost: <strong>Inpatient $23 over benchmark</strong> driven by readmission spike at 3 facilities. Quality: <strong>AWV 19pp below target</strong>. Risk: <strong>962 HCC suspects open</strong> = $2.1M revenue at risk. Engagement: <strong>SMS-first converting at 61%</strong> vs 29% phone."
        buttons={[
          { label: 'Financial', toast: 'Opening Financial view' },
          { label: 'Quality', toast: 'Opening Quality view' },
          { label: 'Risk', toast: 'Opening Risk view' },
        ]}
        showToast={showToast}
      />

      {/* TCOC Trend */}
      <Card
        title="TCOC Trend & Cost by Setting"
        sub={periodLabel}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Toggle
              items={[
                { key: 'pmpm', label: 'PMPM' },
                { key: 'total', label: 'Total Cost' },
              ]}
              active={tcocMode}
              onChange={setTcocMode}
              size="S"
            />
            <Toggle
              items={[
                { key: 'all', label: 'All' },
                { key: 'ip', label: 'Inpatient' },
                { key: 'op', label: 'Outpatient' },
                { key: 'ed', label: 'ED' },
                { key: 'rx', label: 'Pharmacy' },
                { key: 'pac', label: 'PAC' },
              ]}
              active={tcocTab}
              onChange={setTcocTab}
              size="S"
            />
          </div>
        }
      >
        <TcocLineChart tab={tcocTab} data={tcocData} mode={tcocMode} />

        {/* Cost by setting inline grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--neutral-100)' }}>
          {costBySettingInline.map(c => (
            <div key={c.label} style={{ textAlign: 'center', padding: '10px 6px', background: 'var(--neutral-0)', border: '1px solid var(--neutral-150)', borderRadius: 6 }}>
              <div style={{ fontSize: 12, color: 'var(--neutral-200)', marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: c.color, lineHeight: 1.2 }}>{c.value}</div>
              <div style={{ fontSize: 12, color: 'var(--neutral-300)', marginTop: 3 }}>{c.note}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quality Summary + Care Program Command Center */}
      <div className={s.g2}>
        <Card title="Quality Summary" actions={<Button variant="ghost" size="S" onClick={() => showToast?.('Opening Quality view')}>Full View &rarr;</Button>}>
          {qualFallback.map(q => (
            <ProgressBar key={q.label} label={q.label} value={q.value} pct={q.pct} color={q.color} sub={q.sub} />
          ))}
        </Card>

        <Card
          title="Care Program Command Center"
          sub={`8 programs \u00B7 $7.3M saved \u00B7 3.7\u00D7 blended ROI`}
          actions={<Button variant="ghost" size="S" onClick={() => showToast?.('Opening Care Management view')}>Full Program View &rarr;</Button>}
          flush
        >
          <div className={s.tblWrap}>
            <table className={s.tbl}>
              <thead>
                <tr>
                  <th>Program</th>
                  <th className={s.r}>Status</th>
                  <th className={s.r}>Saved</th>
                  <th className={s.r}>ROI</th>
                  <th>Top Alert</th>
                </tr>
              </thead>
              <tbody>
                {carePrograms.map((p, i) => (
                  <tr key={i} style={{ cursor: 'pointer' }} onClick={() => showToast?.(`Navigating to Care Management → Programs → ${p.abbr}`)}>
                    <td className={s.fw600}>{p.abbr}<div style={{ fontSize: 12, color: 'var(--neutral-200)' }}>{p.members} mbrs</div></td>
                    <td className={s.r}>
                      <span className={`${s.stPill} ${p.status === 'green' ? s.stGreen : p.status === 'amber' ? s.stAmber : s.stRed}`}>
                        {p.status === 'green' ? 'On Track' : p.status === 'amber' ? 'Review' : 'At Risk'}
                      </span>
                    </td>
                    <td className={`${s.r} ${s.mono} ${s.valG}`}>{p.saved}</td>
                    <td className={`${s.r} ${s.mono}`} style={{ fontWeight: 500 }}>{p.roi}</td>
                    <td style={{ fontSize: 12, color: p.status === 'red' ? 'var(--status-error)' : 'var(--status-warning)', maxWidth: 200 }}>{p.alert}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Shared Savings Trajectory */}
      <Card
        title="Shared Savings Trajectory"
        sub={periodLabel}
        actions={<Button variant="ghost" size="S" onClick={() => showToast?.('Opening Shared Savings view')}>Full View &rarr;</Button>}
      >
        <div style={{ display: 'flex', gap: 20, marginBottom: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--status-success)' }}>{periodMode === 'r12' ? '$1.8M' : '$1.2M'}</div>
            <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--neutral-200)' }}>Savings {periodMode === 'r12' ? 'Rolling 12M' : 'YTD'}</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--neutral-100)', paddingLeft: 16 }}>
            <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--status-warning)' }}>{periodMode === 'r12' ? '82%' : '78%'}</div>
            <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--neutral-200)' }}>Prob. of hitting MSR</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--neutral-100)', paddingLeft: 16 }}>
            <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--neutral-500)' }}>4.1</div>
            <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--neutral-200)' }}>Quality Composite</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--neutral-100)', paddingLeft: 16 }}>
            <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--neutral-500)' }}>{periodMode === 'r12' ? '$3.8M' : '$3.2M'}</div>
            <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--neutral-200)' }}>Full-year projection</div>
          </div>
        </div>
        <SavingsAreaChart data={savingsTrajectory} targetLabel="MSR $2.8M" targetValue={2.8} />
        <div style={{ fontSize: 12, color: 'var(--neutral-200)', padding: '8px 14px 4px', borderTop: '1px solid var(--neutral-100)', marginTop: 8 }}>
          MSSP Track 1B &middot; Performance Year 2025 &middot; Quality composite secures maximum sharing rate
        </div>
      </Card>

      {/* Cost by Setting Benchmark Table */}
      <Card title="Cost by Setting \u2014 Benchmark Comparison" flush>
        <div className={s.tblWrap}>
          <table className={s.tbl}>
            <thead>
              <tr><th>Setting</th><th className={s.r}>Actual PMPM</th><th className={s.r}>Benchmark</th><th className={s.r}>Variance</th><th>Status</th></tr>
            </thead>
            <tbody>
              {costRows.map((row, i) => {
                const setting = row.setting || row[0];
                const actual = row.actual || row[1];
                const bench = row.benchmark || row[2];
                const variance = row.variance || row[3];
                const st = row.status || row[4];
                return (
                  <tr key={i}>
                    <td className={s.fw600}>{setting}</td>
                    <td className={`${s.r} ${s.mono}`}>{actual}</td>
                    <td className={`${s.r} ${s.mono}`}>{bench}</td>
                    <td className={`${s.r} ${st === 'green' ? s.valG : st === 'red' ? s.valR : st === 'amber' ? s.valA : ''}`}>{variance}</td>
                    <td>
                      <span className={`${s.stPill} ${st === 'green' ? s.stGreen : st === 'red' ? s.stRed : st === 'amber' ? s.stAmber : s.stNeutral}`}>
                        {st === 'green' ? 'Below' : st === 'red' ? 'Above' : st === 'amber' ? 'Watch' : 'At'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

