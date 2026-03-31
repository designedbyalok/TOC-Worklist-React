import { useState, useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { FALLBACK_KPIS, FALLBACK_TABLES } from '../../../data/analyticsFallbacks';
import { KpiCard, InsightBanner, Card, StatusPill, safeTableRows } from './shared';
import s from '../AnalyticsLayout.module.css';

export function SdohView({ showToast }) {
  const fetchViewKpis = useAppStore(st => st.fetchViewKpis);
  const fetchViewTable = useAppStore(st => st.fetchViewTable);
  const period = useAppStore(st => st.analyticsPeriod);

  const fb = FALLBACK_KPIS.sdoh || { kpis: [], insight: null };
  const [kpiData, setKpiData] = useState(fb);
  const [equityByRace, setEquityByRace] = useState(FALLBACK_TABLES.equity_by_race);
  const [sdohRiskFactors, setSdohRiskFactors] = useState(FALLBACK_TABLES.sdoh_risk_factors);
  const [communityReferrals, setCommunityReferrals] = useState(FALLBACK_TABLES.community_referrals);

  useEffect(() => {
    fetchViewKpis('sdoh').then(d => d && setKpiData(d));
    fetchViewTable('sdoh', 'equity_by_race').then(d => d && setEquityByRace(d));
    fetchViewTable('sdoh', 'sdoh_risk_factors').then(d => d && setSdohRiskFactors(d));
    fetchViewTable('sdoh', 'community_referrals').then(d => d && setCommunityReferrals(d));
  }, [period]);

  const kpis = kpiData?.kpis || fb.kpis || [];
  const insight = kpiData?.insight || fb.insight;
  const equityRows = safeTableRows(equityByRace, (FALLBACK_TABLES.equity_by_race || {}).rows);
  const riskRows = safeTableRows(sdohRiskFactors, (FALLBACK_TABLES.sdoh_risk_factors || {}).rows);
  const referralRows = safeTableRows(communityReferrals, (FALLBACK_TABLES.community_referrals || {}).rows);

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

      <Card title="Health Equity Dashboard" sub="Quality measures by race/ethnicity" flush>
        <div className={s.tblWrap}>
          <table className={s.tbl}>
            <thead>
              <tr><th>Measure</th><th className={s.r}>Overall Rate</th><th className={s.r}>White</th><th className={s.r}>Black</th><th className={s.r}>Hispanic</th><th className={s.r}>Asian</th><th className={s.r}>Disparity Gap</th><th>Status</th></tr>
            </thead>
            <tbody>
              {equityRows.map((row, i) => {
                const gapNum = parseInt((row.gap || '').replace('pp', ''));
                const st = gapNum >= 16 ? 'red' : gapNum >= 12 ? 'amber' : 'green';
                // Calculate overall rate as avg of all groups
                const nums = [row.white, row.black, row.hispanic, row.asian, row.other].map(v => parseInt((v || '0').replace('%', '')));
                const overall = Math.round(nums.reduce((a, b) => a + b, 0) / nums.filter(n => !isNaN(n)).length);
                return (
                  <tr key={i}>
                    <td className={s.fw600}>{row.measure}</td>
                    <td className={`${s.r} ${s.mono}`}>{overall}%</td>
                    <td className={`${s.r} ${s.mono}`}>{row.white}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.black}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.hispanic}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.asian}</td>
                    <td className={`${s.r} ${s.valR}`}>{row.gap}</td>
                    <td><StatusPill label={st === 'red' ? 'Action Needed' : st === 'amber' ? 'Monitor' : 'On Track'} variant={st} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className={s.g2}>
        <Card title="SDoH Risk Factors" flush>
          <div className={s.tblWrap}>
            <table className={s.tbl}>
              <thead>
                <tr><th>Risk Factor</th><th className={s.r}>Members</th><th className={s.r}>% of Pop</th><th className={s.r}>TCOC Impact</th><th className={s.r}>Referral Rate</th></tr>
              </thead>
              <tbody>
                {riskRows.map((row, i) => (
                  <tr key={i}>
                    <td className={s.fw600}>{row.factor}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.members}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.pct}</td>
                    <td className={`${s.r} ${s.valR}`}>{row.tcoc_impact}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.referral_rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Community Referral Network" flush>
          <div className={s.tblWrap}>
            <table className={s.tbl}>
              <thead>
                <tr><th>Organization</th><th>Service</th><th className={s.r}>Referrals</th><th className={s.r}>Completion</th><th>Status</th></tr>
              </thead>
              <tbody>
                {referralRows.map((row, i) => {
                  const st = row.status;
                  return (
                    <tr key={i}>
                      <td className={s.fw600}>{row.org}</td>
                      <td>{row.service}</td>
                      <td className={`${s.r} ${s.mono}`}>{row.referrals}</td>
                      <td className={`${s.r} ${s.mono}`}>{row.completion}</td>
                      <td><StatusPill label={st === 'green' ? 'Active' : st === 'amber' ? 'Moderate' : 'Low'} variant={st} /></td>
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
