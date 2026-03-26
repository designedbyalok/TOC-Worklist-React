import { useState, useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { FALLBACK_KPIS, FALLBACK_TABLES } from '../../../data/analyticsFallbacks';
import { KpiCard, InsightBanner, Card, StatusPill, safeTableRows } from './shared';
import s from '../AnalyticsLayout.module.css';

export function NetworkView({ showToast }) {
  const fetchViewKpis = useAppStore(st => st.fetchViewKpis);
  const fetchViewTable = useAppStore(st => st.fetchViewTable);
  const period = useAppStore(st => st.analyticsPeriod);

  const fb = FALLBACK_KPIS.network || { kpis: [], insight: null };
  const [kpiData, setKpiData] = useState(fb);
  const [referralLeakage, setReferralLeakage] = useState(FALLBACK_TABLES.referral_leakage);
  const [snfScorecard, setSnfScorecard] = useState(FALLBACK_TABLES.snf_scorecard);

  useEffect(() => {
    fetchViewKpis('network').then(d => d && setKpiData(d));
    fetchViewTable('network', 'referral_leakage').then(d => d && setReferralLeakage(d));
    fetchViewTable('network', 'snf_scorecard').then(d => d && setSnfScorecard(d));
  }, [period]);

  const kpis = kpiData?.kpis || fb.kpis || [];
  const insight = kpiData?.insight || fb.insight;
  const leakageRows = safeTableRows(referralLeakage, (FALLBACK_TABLES.referral_leakage || {}).rows);
  const snfRows = safeTableRows(snfScorecard, (FALLBACK_TABLES.snf_scorecard || {}).rows);

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
        <Card title="Referral Leakage by Specialty" flush>
          <div className={s.tblWrap}>
            <table className={s.tbl}>
              <thead>
                <tr><th>Specialty</th><th className={s.r}>Total Referrals</th><th className={s.r}>Out-of-Network</th><th className={s.r}>Leakage %</th><th className={s.r}>Est. Cost Impact</th></tr>
              </thead>
              <tbody>
                {leakageRows.map((row, i) => (
                  <tr key={i}>
                    <td className={s.fw600}>{row.specialty}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.total}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.oon}</td>
                    <td className={`${s.r} ${s.valR}`}>{row.leakage}</td>
                    <td className={`${s.r} ${s.valA}`}>{row.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="SNF Quality Scorecard" flush>
          <div className={s.tblWrap}>
            <table className={s.tbl}>
              <thead>
                <tr><th>Facility</th><th className={s.r}>Admits</th><th className={s.r}>Avg LOS</th><th className={s.r}>Readmit %</th><th className={s.r}>Cost/Stay</th><th>Status</th></tr>
              </thead>
              <tbody>
                {snfRows.map((row, i) => {
                  const st = row.status;
                  return (
                    <tr key={i}>
                      <td className={s.fw600}>{row.facility}</td>
                      <td className={`${s.r} ${s.mono}`}>{row.admits}</td>
                      <td className={`${s.r} ${s.mono}`}>{row.avg_los}</td>
                      <td className={`${s.r} ${st === 'red' ? s.valR : st === 'amber' ? s.valA : s.valG}`}>{row.readmit}</td>
                      <td className={`${s.r} ${s.mono}`}>{row.cost}</td>
                      <td>
                        <StatusPill
                          label={st === 'red' ? 'Flagged' : st === 'amber' ? 'Monitor' : 'Preferred'}
                          variant={st}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
