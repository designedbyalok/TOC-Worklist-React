import { useState, useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { FALLBACK_KPIS, FALLBACK_TABLES, FALLBACK_PROGRESS_BARS } from '../../../data/analyticsFallbacks';
import { KpiCard, InsightBanner, Card, ProgressBar, safeBarItems, safeTableRows } from './shared';
import { ReadmitTrendLineChart } from './charts';
import s from '../AnalyticsLayout.module.css';

export function UtilizationView({ showToast }) {
  const fetchViewKpis = useAppStore(st => st.fetchViewKpis);
  const fetchViewTable = useAppStore(st => st.fetchViewTable);
  const fetchProgressBars = useAppStore(st => st.fetchProgressBars);
  const period = useAppStore(st => st.analyticsPeriod);

  const fb = FALLBACK_KPIS.utilization || { kpis: [], insight: null };
  const [kpiData, setKpiData] = useState(fb);
  const [readmissionByDrg, setReadmissionByDrg] = useState(FALLBACK_TABLES.readmission_by_drg);
  const [tcmImpact, setTcmImpact] = useState(FALLBACK_PROGRESS_BARS.tcm_impact);

  useEffect(() => {
    fetchViewKpis('utilization').then(d => d && setKpiData(d));
    fetchViewTable('utilization', 'readmission_by_drg').then(d => d && setReadmissionByDrg(d));
    fetchProgressBars('utilization', 'tcm_impact').then(d => d && setTcmImpact(d));
  }, [period]);

  const kpis = kpiData?.kpis || fb.kpis || [];
  const insight = kpiData?.insight || fb.insight;
  const drgRows = safeTableRows(readmissionByDrg, (FALLBACK_TABLES.readmission_by_drg || {}).rows);
  const tcmItems = safeBarItems(tcmImpact);

  // Fallback TCM items if not from DB
  const tcmFallback = tcmItems.length > 0 ? tcmItems : [
    { label: 'Readmit w/ TCM Follow-Up', value: '11%', pct: 22, color: 'green', sub: '62% below threshold \u2713' },
    { label: 'Readmit w/o TCM Follow-Up', value: '31%', pct: 74, color: 'red', sub: '2.8x higher \u2014 urgent gap' },
    { label: 'TCM Completion Rate', value: '72%', pct: 72, color: 'teal', sub: 'Target 80% \u2014 8pp gap' },
    { label: 'TCM Within 7 Days', value: '58%', pct: 58, color: 'amber', sub: 'Target 70%' },
  ];

  const readmitTrend = [14.2, 14.8, 15.1, 15.8, 14.9, 15.3, 15.8, 16.2, 16.8, 17.1, 17.8, 18.4];
  const periodLabel = period === 'ytd' ? 'YTD' : 'Rolling 12M';

  return (
    <>
      {/* ADT Alert (Manager View) */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--status-error-light)', border: '1px solid var(--status-error-light)', borderRadius: 8,
        padding: '12px 16px', marginBottom: 12
      }}>
        <div style={{ fontSize: 18 }}>&#x1F6A8;</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--status-error)' }}>Live ADT Alert &mdash; Manager View</div>
          <div style={{ fontSize: 12, color: 'var(--status-error)', marginTop: 2 }}>James M. (Tier 5) discharged to Valley SNF. 34% readmit risk. TCM: Maria Chen, RN.</div>
        </div>
        <button className={`${s.btn} ${s.btnPrimary}`} style={{ fontSize: 12 }} onClick={() => showToast?.('Opening ADT detail for James M.')}>View &rarr;</button>
      </div>

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
        {/* Readmission Rate Trend Chart */}
        <Card title="Readmission Rate Trend" sub={periodLabel}>
          <ReadmitTrendLineChart data={readmitTrend} threshold={15.0} />
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--neutral-200)', marginTop: 6 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 2, background: 'var(--status-error)', display: 'inline-block', borderRadius: 2 }} />Readmit Rate</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 14, height: 0, borderTop: '2px dashed var(--grey-150)', display: 'inline-block' }} />Threshold 15%</span>
          </div>
        </Card>

        {/* TCM Impact */}
        <Card title="TCM Impact">
          {tcmFallback.map(b => (
            <ProgressBar key={b.label} label={b.label} value={b.value} pct={b.pct} color={b.color} sub={b.sub} />
          ))}
          <button className={`${s.btn} ${s.btnPrimary}`} style={{ marginTop: 8, width: '100%', justifyContent: 'center' }} onClick={() => showToast?.('Creating post-discharge TCM cohort for 48 members')}>
            Create Post-Discharge TCM Cohort (48)
          </button>
        </Card>
      </div>

      {/* DRG Table */}
      <Card title="Readmission Rate by DRG" flush>
        <div className={s.tblWrap}>
          <table className={s.tbl}>
            <thead>
              <tr><th>DRG Category</th><th className={s.r}>Admits</th><th className={s.r}>Readmits</th><th className={s.r}>Rate</th><th className={s.r}>Benchmark</th><th>Status</th></tr>
            </thead>
            <tbody>
              {drgRows.map((row, i) => {
                const st = row.status;
                return (
                  <tr key={i}>
                    <td className={s.fw600}>{row.drg}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.admits}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.readmits}</td>
                    <td className={`${s.r} ${st === 'red' ? s.valR : st === 'amber' ? s.valA : s.valG}`}>{row.rate}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.benchmark}</td>
                    <td>
                      <span className={`${s.stPill} ${st === 'green' ? s.stGreen : st === 'red' ? s.stRed : s.stAmber}`}>
                        {st === 'green' ? 'Below' : st === 'red' ? 'Above' : 'Watch'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Manager Deep Dive */}
      <Card title="Manager Deep Dive &mdash; Readmission Drivers">
        <div className={s.g2}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--neutral-200)', marginBottom: 8 }}>By DRG</div>
            <ProgressBar label="DRG 291 \u2014 Heart Failure" value="8 readmits" pct={80} color="red" sub="18.7% readmit rate" />
            <ProgressBar label="DRG 193 \u2014 COPD" value="5 readmits" pct={50} color="amber" sub="17.9%" />
            <ProgressBar label="DRG 690 \u2014 UTI w/ MCC" value="4 readmits" pct={40} color="amber" sub="16.7%" />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--neutral-200)', marginBottom: 8 }}>By Avg LOS Before Readmit</div>
            <ProgressBar label="0\u20137 days post-discharge" value="42%" pct={84} color="red" sub="Very early \u2014 TCM critical" />
            <ProgressBar label="8\u201314 days" value="31%" pct={62} color="amber" sub="TCM + SNF coordination" />
            <ProgressBar label="15\u201330 days" value="27%" pct={54} color="green" sub="Late readmit \u2014 SNF quality" />
          </div>
        </div>
      </Card>
    </>
  );
}

