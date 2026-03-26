import { useState, useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { FALLBACK_KPIS, FALLBACK_PROGRESS_BARS, FALLBACK_TABLES } from '../../../data/analyticsFallbacks';
import { KpiCard, InsightBanner, Card, ProgressBar, safeBarItems, safeTableRows } from './shared';
import s from '../AnalyticsLayout.module.css';

export function PopulationView({ showToast }) {
  const fetchViewKpis = useAppStore(st => st.fetchViewKpis);
  const fetchProgressBars = useAppStore(st => st.fetchProgressBars);
  const fetchViewTable = useAppStore(st => st.fetchViewTable);
  const period = useAppStore(st => st.analyticsPeriod);

  const fb = FALLBACK_KPIS.population || { kpis: [], insight: null };
  const [kpiData, setKpiData] = useState(fb);
  const [riskTiers, setRiskTiers] = useState(FALLBACK_PROGRESS_BARS.risk_tiers);
  const [chronicConditions, setChronicConditions] = useState(FALLBACK_PROGRESS_BARS.chronic_conditions);
  const [memberLists, setMemberLists] = useState(FALLBACK_TABLES.actionable_member_lists);

  useEffect(() => {
    fetchViewKpis('population').then(d => d && setKpiData(d));
    fetchProgressBars('population', 'risk_tiers').then(d => d && setRiskTiers(d));
    fetchProgressBars('population', 'chronic_conditions').then(d => d && setChronicConditions(d));
    fetchViewTable('population', 'actionable_member_lists').then(d => d && setMemberLists(d));
  }, [period]);

  const kpis = kpiData?.kpis || fb.kpis || [];
  const insight = kpiData?.insight || fb.insight;
  const memberRows = safeTableRows(memberLists, (FALLBACK_TABLES.actionable_member_lists || {}).rows);
  const riskTierItems = safeBarItems(riskTiers);
  const chronicItems = safeBarItems(chronicConditions);

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
        <Card title="Risk Stratification">
          {riskTierItems.map(r => (
            <ProgressBar key={r.label} label={r.label} value={r.value} pct={r.pct} color={r.color} />
          ))}
        </Card>

        <Card title="Chronic Condition Distribution">
          {chronicItems.map(c => (
            <ProgressBar key={c.label} label={c.label} value={c.value} pct={c.pct} color={c.color} />
          ))}
        </Card>
      </div>

      <Card title="Actionable Member Lists" flush>
        <div className={s.tblWrap}>
          <table className={s.tbl}>
            <thead>
              <tr><th>Cohort</th><th className={s.r}>Members</th><th className={s.r}>Avg TCOC</th><th className={s.r}>Avg RAF</th><th>Top Conditions</th></tr>
            </thead>
            <tbody>
              {memberRows.map((row, i) => (
                <tr key={i}>
                  <td className={s.fw600}>{row.cohort}</td>
                  <td className={`${s.r} ${s.mono}`}>{row.members}</td>
                  <td className={`${s.r} ${s.mono}`}>{row.avg_tcoc}</td>
                  <td className={s.r}>{row.avg_raf}</td>
                  <td>{row.conditions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
