import { useState, useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { FALLBACK_KPIS, FALLBACK_TABLES, FALLBACK_CONFIGS } from '../../../data/analyticsFallbacks';
import { KpiCard, InsightBanner, Card, StatusPill, safeTableRows, safeConfigData } from './shared';
import s from '../AnalyticsLayout.module.css';

export function PlatformOpsView({ showToast }) {
  const fetchViewKpis = useAppStore(st => st.fetchViewKpis);
  const fetchConfig = useAppStore(st => st.fetchConfig);
  const fetchViewTable = useAppStore(st => st.fetchViewTable);
  const period = useAppStore(st => st.analyticsPeriod);

  const fb = FALLBACK_KPIS.platformops || { kpis: [], insight: null };
  const [kpiData, setKpiData] = useState(fb);
  const [pipelineHealth, setPipelineHealth] = useState(FALLBACK_CONFIGS.pipeline_health);
  const [dataQuality, setDataQuality] = useState(FALLBACK_TABLES.data_quality);
  const [integrationStatus, setIntegrationStatus] = useState(FALLBACK_TABLES.integration_status);

  useEffect(() => {
    fetchViewKpis('platformops').then(d => d && setKpiData(d));
    fetchConfig('pipeline_health').then(d => d && setPipelineHealth(d));
    fetchViewTable('platformops', 'data_quality').then(d => d && setDataQuality(d));
    fetchViewTable('platformops', 'integration_status').then(d => d && setIntegrationStatus(d));
  }, [period]);

  const kpis = kpiData?.kpis || fb.kpis || [];
  const insight = kpiData?.insight || fb.insight;
  const safePipeline = safeConfigData(pipelineHealth, FALLBACK_CONFIGS.pipeline_health);
  const pipelines = safePipeline.pipelines || (FALLBACK_CONFIGS.pipeline_health || {}).pipelines || [];
  const dqRows = safeTableRows(dataQuality, (FALLBACK_TABLES.data_quality || {}).rows);
  const intRows = safeTableRows(integrationStatus, (FALLBACK_TABLES.integration_status || {}).rows);

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

      <Card title="Pipeline Health">
        <div style={{ padding: '4px 0' }}>
          {pipelines.map((p, i) => (
            <div key={i} className={s.pipelineRow}>
              <div className={`${s.pipelineDot} ${p.status === 'ok' ? s.ok : s.warn}`} />
              <div className={s.pipelineName}>{p.name}</div>
              <div className={s.pipelineInfo}>{p.info}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className={s.g2}>
        <Card title="Data Quality Scorecard" flush>
          <div className={s.tblWrap}>
            <table className={s.tbl}>
              <thead>
                <tr><th>Dimension</th><th className={s.r}>Score</th><th className={s.r}>Threshold</th><th>Status</th></tr>
              </thead>
              <tbody>
                {dqRows.map((row, i) => {
                  const st = row.status;
                  return (
                    <tr key={i}>
                      <td className={s.fw600}>{row.dimension}</td>
                      <td className={`${s.r} ${s.mono}`}>{row.score}</td>
                      <td className={`${s.r} ${s.mono}`}>{row.threshold}</td>
                      <td><StatusPill label={st === 'green' ? 'Pass' : 'Below'} variant={st} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Integration Status" flush>
          <div className={s.tblWrap}>
            <table className={s.tbl}>
              <thead>
                <tr><th>System</th><th>Type</th><th className={s.r}>Uptime</th><th className={s.r}>Errors (7d)</th><th>Status</th></tr>
              </thead>
              <tbody>
                {intRows.map((row, i) => {
                  const st = row.status;
                  return (
                    <tr key={i}>
                      <td className={s.fw600}>{row.system}</td>
                      <td>{row.type}</td>
                      <td className={`${s.r} ${s.mono}`}>{row.uptime}</td>
                      <td className={`${s.r} ${st === 'red' ? s.valR : s.mono}`}>{row.errors}</td>
                      <td><StatusPill label={st === 'green' ? 'Healthy' : 'Degraded'} variant={st} /></td>
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
