import { useState, useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { FALLBACK_KPIS, FALLBACK_TABLES } from '../../../data/analyticsFallbacks';
import { KpiCard, InsightBanner, Card, ProgressBar, StatusPill, safeTableRows } from './shared';
import s from '../AnalyticsLayout.module.css';

export function ToolUsageView({ showToast }) {
  const fetchViewKpis = useAppStore(st => st.fetchViewKpis);
  const fetchViewTable = useAppStore(st => st.fetchViewTable);
  const period = useAppStore(st => st.analyticsPeriod);

  const fb = FALLBACK_KPIS.tools || { kpis: [], insight: null };
  const [kpiData, setKpiData] = useState(fb);
  const [adoptionData, setAdoptionData] = useState(FALLBACK_TABLES.adoption_by_provider);

  useEffect(() => {
    fetchViewKpis('tools').then(d => d && setKpiData(d));
    fetchViewTable('tools', 'adoption_by_provider').then(d => d && setAdoptionData(d));
  }, [period]);

  const kpis = kpiData?.kpis || fb.kpis || [];
  const insight = kpiData?.insight || fb.insight;
  const adoptionRows = safeTableRows(adoptionData, (FALLBACK_TABLES.adoption_by_provider || {}).rows);
  const nonAdopterRows = safeTableRows(FALLBACK_TABLES.non_adopters, []);

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
        {/* Sidecar Usage by Provider */}
        <Card title="Sidecar Usage by Provider">
          <ProgressBar label="Weekly Active Users" value="28/44" pct={64} color="teal" sub="Target 100%" />
          <ProgressBar label="HCC Alerts Acted On" value="78%" pct={78} color="green" sub="Within 48 hours \u2713" />
          <ProgressBar label="Rx Opportunities Acted On" value="62%" pct={62} color="amber" sub="Target 75%" />
          <ProgressBar label="Quality Flags Reviewed" value="71%" pct={71} color="teal" sub="Target 80%" />
          <button
            className={`${s.btn} ${s.btnPrimary}`}
            style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}
            onClick={() => showToast?.('Viewing 12 non-adopters')}
          >
            View 12 Non-Adopters &rarr;
          </button>
        </Card>

        {/* Automation Engine Performance */}
        <Card title="Automation Engine Performance">
          <ProgressBar label="SMS Outreach Sent" value="1,840 msgs" pct={73} color="teal" sub="61% engagement rate" />
          <ProgressBar label="Auto-Scheduled AWVs" value="312 appts" pct={62} color="amber" sub="Via engaged members" />
          <ProgressBar label="TCM Auto-Assigned" value="184 tasks" pct={74} color="teal" sub="Post-discharge" />
          <ProgressBar label="HCC Suspect Alerts Pushed" value="412 alerts" pct={83} color="green" sub="To Sidecar EMR" />
        </Card>
      </div>

      <Card title="Adoption by Provider" flush>
        <div className={s.tblWrap}>
          <table className={s.tbl}>
            <thead>
              <tr><th>Provider</th><th className={s.r}>Weekly Active</th><th className={s.r}>Alerts Acted</th><th className={s.r}>HCC Gaps Closed</th><th className={s.r}>Avg Response Time</th><th>Status</th></tr>
            </thead>
            <tbody>
              {adoptionRows.map((row, i) => {
                const st = row.status;
                return (
                  <tr key={i}>
                    <td className={s.fw600}>{row.provider}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.active}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.alerts}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.gaps}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.response}</td>
                    <td><StatusPill label={st === 'green' ? 'Power User' : st === 'amber' ? 'Moderate' : 'Low'} variant={st} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Non-Adopters \u2014 0 Logins (Past 30 Days)" flush>
        <div className={s.tblWrap}>
          <table className={s.tbl}>
            <thead>
              <tr><th>Provider</th><th>Practice</th><th className={s.r}>Members</th><th className={s.r}>Open HCC Gaps</th><th className={s.r}>Last Login</th><th>Outreach Status</th></tr>
            </thead>
            <tbody>
              {nonAdopterRows.map((row, i) => (
                <tr key={i}>
                  <td className={s.fw600}>{row.provider}</td>
                  <td>{row.practice}</td>
                  <td className={`${s.r} ${s.mono}`}>{row.members}</td>
                  <td className={`${s.r} ${s.mono}`}>{row.gaps}</td>
                  <td className={`${s.r} ${s.mono}`}>{row.last_login}</td>
                  <td>
                    <span className={`${s.stPill} ${row.outreach === 'Contacted' ? s.stGreen : row.outreach === 'Scheduled' ? s.stAmber : s.stNeutral}`}>
                      {row.outreach}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
