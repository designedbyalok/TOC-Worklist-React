import { useState, useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { FALLBACK_KPIS, FALLBACK_TABLES } from '../../../data/analyticsFallbacks';
import { KpiCard, InsightBanner, Card, ProgressBar, Tag, safeTableRows } from './shared';
import s from '../AnalyticsLayout.module.css';

export function QualityView({ showToast }) {
  const fetchViewKpis = useAppStore(st => st.fetchViewKpis);
  const fetchViewTable = useAppStore(st => st.fetchViewTable);
  const period = useAppStore(st => st.analyticsPeriod);

  const fb = FALLBACK_KPIS.quality || { kpis: [], insight: null };
  const [kpiData, setKpiData] = useState(fb);
  const [qualityMeasures, setQualityMeasures] = useState(FALLBACK_TABLES.quality_measures);
  const [measureFilter, setMeasureFilter] = useState('All Measures');

  useEffect(() => {
    fetchViewKpis('quality').then(d => d && setKpiData(d));
    fetchViewTable('quality', 'quality_measures').then(d => d && setQualityMeasures(d));
  }, [period]);

  const kpis = kpiData?.kpis || fb.kpis || [];
  const insight = kpiData?.insight || fb.insight;
  const allMeasures = safeTableRows(qualityMeasures, (FALLBACK_TABLES.quality_measures || {}).rows);

  const filterOptions = ['All Measures', 'HEDIS', 'Star Ratings', 'ACO CAHPS', 'ACO PC01'];
  const measures = measureFilter === 'All Measures'
    ? allMeasures
    : allMeasures.filter(m => (m.tag || '') === measureFilter || (m.tag === 'Stars' && measureFilter === 'Star Ratings'));

  // Practice-level quality data
  const practiceQuality = [
    { name: 'Patel Family Med.', composite: '72%', gaps: 342, toGoal: '-18', awv: '71%', trend: '\u2191', status: 'green' },
    { name: 'Riverside Medical', composite: '58%', gaps: 511, toGoal: '+46', awv: '48%', trend: '\u2193', status: 'red' },
    { name: 'Valley Primary Care', composite: '65%', gaps: 428, toGoal: '+12', awv: '61%', trend: '\u2192', status: 'amber' },
    { name: 'Northside Clinic', composite: '69%', gaps: 198, toGoal: '-4', awv: '74%', trend: '\u2191', status: 'green' },
    { name: 'Eastside Health', composite: '71%', gaps: 162, toGoal: '-10', awv: '68%', trend: '\u2191', status: 'green' },
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

      {/* Measure Performance + Practice-Level Quality */}
      <div className={s.g2}>
        <Card
          title="Measure Performance"
          flush
          actions={
            <select
              value={measureFilter}
              onChange={e => setMeasureFilter(e.target.value)}
              style={{ fontSize: 12, padding: '3px 8px', minWidth: 130, borderRadius: 6, border: '1px solid var(--neutral-100)' }}
            >
              {filterOptions.map(f => <option key={f}>{f}</option>)}
            </select>
          }
        >
          <div className={s.tblWrap}>
            <table className={s.tbl}>
              <thead>
                <tr>
                  <th>Measure</th>
                  <th className={s.r}>Current Rate</th>
                  <th className={s.r}>Target</th>
                  <th className={s.r}>Gap</th>
                  <th>Program</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {measures.map((m, i) => {
                  const rate = m.rate ?? 0;
                  const target = m.target ?? 0;
                  const gap = rate - target;
                  const gapStr = gap >= 0 ? `+${gap}pp` : `${gap}pp`;
                  const gapCls = gap >= 0 ? s.valG : gap >= -10 ? s.valA : s.valR;
                  return (
                    <tr key={i}>
                      <td className={s.fw600}>{m.name}</td>
                      <td className={`${s.r} ${s.mono}`}>{rate}%</td>
                      <td className={`${s.r} ${s.mono}`}>{target}%</td>
                      <td className={`${s.r} ${gapCls}`}>{gapStr}</td>
                      <td>
                        <Tag
                          label={m.tag || ''}
                          variant={m.tag === 'Stars' ? 'stars' : m.tag === 'HEDIS' ? 'hedis' : 'aco'}
                        />
                      </td>
                      <td>{m.trend === 'up' ? '\u2191' : m.trend === 'down' ? '\u2193' : '\u2192'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Practice-Level Quality" flush actions={<button className={`${s.btn} ${s.btnGhost}`} onClick={() => showToast?.('Exporting practice quality...')}>Export</button>}>
          <div className={s.tblWrap}>
            <table className={s.tbl}>
              <thead>
                <tr><th>Practice</th><th className={s.r}>Composite</th><th className={s.r}>Open Gaps</th><th className={s.r}>Gaps to Goal</th><th className={s.r}>AWV%</th><th>Trend</th></tr>
              </thead>
              <tbody>
                {practiceQuality.map((p, i) => {
                  const rc = p.status === 'red' ? s.valR : p.status === 'green' ? s.valG : s.valA;
                  const tc = p.trend === '\u2191' ? 'var(--status-success)' : p.trend === '\u2193' ? 'var(--status-error)' : 'var(--status-warning)';
                  return (
                    <tr key={i}>
                      <td className={s.fw600}>{p.name}</td>
                      <td className={`${s.r} ${rc}`} style={{ fontWeight: 500 }}>{p.composite}</td>
                      <td className={`${s.r} ${s.mono}`}>{p.gaps}</td>
                      <td className={`${s.r} ${rc}`} style={{ fontWeight: 500 }}>{p.toGoal}</td>
                      <td className={`${s.r}`}>{p.awv}</td>
                      <td style={{ color: tc, fontSize: 14, textAlign: 'center' }}>{p.trend}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Zero-gap alert card */}
      <Card
        title={<span style={{ color: 'var(--status-error)' }}>\u26A0 1,240 Members \u2014 Zero Gaps Closed YTD</span>}
        style={{ border: '1px solid var(--status-error-light)' }}
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            <button className={`${s.btn} ${s.btnPrimary}`} style={{ fontSize: 12 }} onClick={() => showToast?.('Scheduling AWV for 620 members')}>Schedule AWV (620)</button>
            <button className={`${s.btn} ${s.btnGhost}`} style={{ fontSize: 12 }} onClick={() => showToast?.('Scheduling office visits for 620 members')}>Schedule Office Visit (620)</button>
          </div>
        }
      >
        <ProgressBar label="Tier 4\u20135 (High Risk)" value="412 members \u00B7 priority via care manager" pct={33} color="red" />
        <ProgressBar label="Tier 3 (Moderate Risk)" value="488 members \u00B7 close via AWV scheduling" pct={39} color="amber" />
        <ProgressBar label="Tier 1\u20132 (Low Risk)" value="340 members \u00B7 close via targeted reminder" pct={27} color="green" />
        <div style={{ display: 'flex', gap: 7, marginTop: 10, flexWrap: 'wrap' }}>
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => showToast?.('Viewing all 1,240 members')}>View All 1,240 Members &rarr;</button>
          <button className={`${s.btn} ${s.btnGhost}`} onClick={() => showToast?.('AWV Opportunity: 847 members')}>AWV Opportunity (847) &rarr;</button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--neutral-200)', marginTop: 8 }}>
          Two separate cohorts for split targeting: AWV scheduling for prevention-eligible members; office visit for members recently seen but no gap addressed.
        </div>
      </Card>
    </>
  );
}
