import { useState, useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { FALLBACK_KPIS, FALLBACK_TABLES, FALLBACK_PROGRESS_BARS } from '../../../data/analyticsFallbacks';
import { KpiCard, InsightBanner, Card, ProgressBar, safeBarItems, safeTableRows } from './shared';
import { RafTrendLineChart } from './charts';
import s from '../AnalyticsLayout.module.css';

export function RiskView({ showToast }) {
  const fetchViewKpis = useAppStore(st => st.fetchViewKpis);
  const fetchViewTable = useAppStore(st => st.fetchViewTable);
  const fetchProgressBars = useAppStore(st => st.fetchProgressBars);
  const period = useAppStore(st => st.analyticsPeriod);

  const fb = FALLBACK_KPIS.risk || { kpis: [], insight: null };
  const [kpiData, setKpiData] = useState(fb);
  const [rafByPractice, setRafByPractice] = useState(FALLBACK_TABLES.raf_by_practice);
  const [hccRecapture, setHccRecapture] = useState(FALLBACK_PROGRESS_BARS.hcc_recapture);
  const [hccRecaptureCategories, setHccRecaptureCategories] = useState(FALLBACK_PROGRESS_BARS.hcc_recapture_categories);
  const [openHccSuspects, setOpenHccSuspects] = useState(FALLBACK_TABLES.open_hcc_suspects);

  useEffect(() => {
    fetchViewKpis('risk').then(d => d && setKpiData(d));
    fetchViewTable('risk', 'raf_by_practice').then(d => d && setRafByPractice(d));
    fetchProgressBars('risk', 'hcc_recapture').then(d => d && setHccRecapture(d));
    fetchProgressBars('risk', 'hcc_recapture_categories').then(d => d && setHccRecaptureCategories(d));
    fetchViewTable('risk', 'open_hcc_suspects').then(d => d && setOpenHccSuspects(d));
  }, [period]);

  const kpis = kpiData?.kpis || fb.kpis || [];
  const insight = kpiData?.insight || fb.insight;
  const rafRows = safeTableRows(rafByPractice, (FALLBACK_TABLES.raf_by_practice || {}).rows);
  const hccItems = safeBarItems(hccRecapture);

  const rafTrend = [1.010, 1.014, 1.018, 1.022, 1.025, 1.028, 1.031, 1.034, 1.037, 1.040, 1.041, 1.042];
  const periodLabel = period === 'ytd' ? 'YTD 2025' : 'Rolling 12M';

  // HCC performance data
  const hccHigh = [
    { code: 'HCC 19', label: 'Diabetes w/o complications', rate: '89%', pct: 89, color: 'var(--status-success)' },
    { code: 'HCC 108', label: 'Vascular Disease', rate: '84%', pct: 84, color: 'var(--status-success)' },
    { code: 'HCC 85', label: 'CHF', rate: '78%', pct: 78, color: 'var(--status-info)' },
    { code: 'HCC 22', label: 'Morbid Obesity', rate: '76%', pct: 76, color: 'var(--status-info)' },
    { code: 'HCC 18', label: 'Diabetes w/ chronic comp.', rate: '74%', pct: 74, color: 'var(--status-info)' },
  ];
  const hccLow = [
    { code: 'HCC 111', label: 'COPD', rate: '42%', pct: 42, color: 'var(--status-error)' },
    { code: 'HCC 138', label: 'Peripheral Artery Disease', rate: '47%', pct: 47, color: 'var(--status-error)' },
    { code: 'HCC 40', label: 'Rheumatoid Arthritis', rate: '51%', pct: 51, color: 'var(--status-warning)' },
    { code: 'HCC 10', label: 'Lymphatic Cancers', rate: '55%', pct: 55, color: 'var(--status-warning)' },
    { code: 'HCC 21', label: 'Protein-Calorie Malnutrition', rate: '58%', pct: 58, color: 'var(--status-warning)' },
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

      {/* RAF methodology note */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 14px', background: 'var(--neutral-0)', border: '1px solid var(--neutral-150)', borderRadius: 8, fontSize: 14, color: 'var(--neutral-400)', lineHeight: 1.6, marginBottom: 4 }}>
        <span style={{ fontSize: 14, marginTop: 1 }}>{'\u2139\uFE0F'}</span>
        <span>
          <strong>CMS HCC Model V28</strong> &mdash; RAF displayed to 3 decimal places. Potential RAF is derived from all open HCC suspects in the suspect worklist below.
        </span>
      </div>

      <div className={s.kpiGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {kpis.map(k => (
          <KpiCard key={k.key} value={k.value} label={k.label} delta={k.delta} deltaType={k.deltaType} sub={k.sub} accentColor={k.accentColor} />
        ))}
      </div>

      <div className={s.g2}>
        {/* RAF Score Trend */}
        <Card title="RAF Score Trend" sub={periodLabel}>
          <RafTrendLineChart data={rafTrend} potential={1.120} />
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--neutral-200)', marginTop: 6 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 2, background: 'var(--status-warning)', display: 'inline-block', borderRadius: 2 }} />Actual RAF</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 14, height: 0, borderTop: '2px dashed var(--grey-150)', display: 'inline-block' }} />Potential 1.120</span>
          </div>
        </Card>

        {/* RAF by Practice Table */}
        <Card title="RAF Breakup by Practice \u2014 Recapture Opportunity" flush>
          <div className={s.tblWrap}>
            <table className={s.tbl}>
              <thead>
                <tr><th>Practice</th><th className={s.r}>Members</th><th className={s.r}>Avg RAF</th><th className={s.r}>Capture%</th><th className={s.r}>Gap%</th><th className={s.r}>Rev. Opp.</th></tr>
              </thead>
              <tbody>
                {rafRows.map((row, i) => (
                  <tr key={i}>
                    <td className={s.fw600}>{row.name}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.members}</td>
                    <td className={`${s.r} ${s.mono}`} style={{ fontWeight: 500 }}>{row.avg_raf}</td>
                    <td className={`${s.r}`}>{row.potential || row.capture || '-'}</td>
                    <td className={`${s.r} ${s.valA}`}>{row.gap}</td>
                    <td className={`${s.r} ${s.valR}`} style={{ fontWeight: 500 }}>{row.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* HCC Performance */}
      <Card
        title="HCC Performance \u2014 Closure Rates"
        actions={<button className={`${s.btn} ${s.btnGhost}`} onClick={() => showToast?.('Opening HCC Suspect Worklist')}>Full Workbook &rarr;</button>}
      >
        <div className={s.g2}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--neutral-200)', marginBottom: 8 }}>{'\u2713'} Highest Closure Rates</div>
            {hccHigh.map(h => (
              <div key={h.code} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--neutral-50)' }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--primary-300)', minWidth: 55 }}>{h.code}</span>
                <span style={{ flex: 1, fontSize: 12 }}>{h.label}</span>
                <div style={{ width: 80, height: 6, background: 'var(--neutral-50)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${h.pct}%`, height: '100%', background: h.color, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: h.color, width: 35, textAlign: 'right' }}>{h.rate}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--neutral-200)', marginBottom: 8 }}>{'\u26A0'} Lowest Closure Rates &mdash; Biggest Opportunity</div>
            {hccLow.map(h => (
              <div key={h.code} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--neutral-50)' }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--primary-300)', minWidth: 55 }}>{h.code}</span>
                <span style={{ flex: 1, fontSize: 12 }}>{h.label}</span>
                <div style={{ width: 80, height: 6, background: 'var(--neutral-50)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${h.pct}%`, height: '100%', background: h.color, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: h.color, width: 35, textAlign: 'right' }}>{h.rate}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* HCC Recapture bars (kept from original) */}
      {hccItems.length > 0 && (
        <Card title="HCC Recapture Performance">
          {hccItems.map(b => (
            <ProgressBar key={b.label} label={b.label} value={b.value} pct={b.pct} color={b.color} sub={b.sub} />
          ))}
        </Card>
      )}

      {/* HCC Recapture by Category */}
      <Card title="HCC Recapture by Category">
        {safeBarItems(hccRecaptureCategories).map(b => (
          <ProgressBar key={b.label} label={b.label} value={b.value} pct={b.pct} color={b.color} sub={b.sub} />
        ))}
      </Card>

      {/* Top Open HCC Suspects */}
      <Card title="Top Open HCC Suspects" flush actions={<button className={`${s.btn} ${s.btnGhost}`} onClick={() => showToast?.('Opening full HCC suspect worklist')}>View All &rarr;</button>}>
        <div className={s.tblWrap}>
          <table className={s.tbl}>
            <thead>
              <tr><th>Member ID</th><th>HCC Category</th><th>Description</th><th className={s.r}>Est. Revenue Impact</th><th>Last Coded Date</th><th>Action</th></tr>
            </thead>
            <tbody>
              {safeTableRows(openHccSuspects, (FALLBACK_TABLES.open_hcc_suspects || {}).rows).map((row, i) => (
                <tr key={i}>
                  <td className={s.fw600}>{row.member_id}</td>
                  <td><span className={`${s.stPill} ${s.stNeutral}`}>{row.hcc_category}</span></td>
                  <td>{row.description}</td>
                  <td className={`${s.r} ${s.valR}`} style={{ fontWeight: 500 }}>{row.revenue_impact}</td>
                  <td className={s.mono}>{row.last_coded}</td>
                  <td><button className={`${s.btn} ${s.btnGhost}`} onClick={() => showToast?.(`${row.action} for ${row.member_id}`)}>{row.action}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

