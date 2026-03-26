import { useState, useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { FALLBACK_KPIS, FALLBACK_TABLES, FALLBACK_CONFIGS } from '../../../data/analyticsFallbacks';
import { KpiCard, InsightBanner, Card, safeTableRows, safeConfigData } from './shared';
import s from '../AnalyticsLayout.module.css';

export function AiAnalyticsView({ showToast }) {
  const fetchViewKpis = useAppStore(st => st.fetchViewKpis);
  const fetchConfig = useAppStore(st => st.fetchConfig);
  const fetchViewTable = useAppStore(st => st.fetchViewTable);
  const period = useAppStore(st => st.analyticsPeriod);

  const fb = FALLBACK_KPIS.aianalytics || { kpis: [], insight: null };
  const [kpiData, setKpiData] = useState(fb);
  const [nlqExamples, setNlqExamples] = useState(FALLBACK_CONFIGS.nlq_examples);
  const [anomalies, setAnomalies] = useState(FALLBACK_CONFIGS.anomalies);
  const [predictiveModels, setPredictiveModels] = useState(FALLBACK_TABLES.predictive_models);

  useEffect(() => {
    fetchViewKpis('aianalytics').then(d => d && setKpiData(d));
    fetchConfig('nlq_examples').then(d => d && setNlqExamples(d));
    fetchConfig('anomalies').then(d => d && setAnomalies(d));
    fetchViewTable('aianalytics', 'predictive_models').then(d => d && setPredictiveModels(d));
  }, [period]);

  const kpis = kpiData?.kpis || fb.kpis || [];
  const insight = kpiData?.insight || fb.insight;
  const safeNlq = safeConfigData(nlqExamples, FALLBACK_CONFIGS.nlq_examples);
  const safeAnomalies = safeConfigData(anomalies, FALLBACK_CONFIGS.anomalies);
  const examples = safeNlq.examples || (FALLBACK_CONFIGS.nlq_examples || {}).examples || [];
  const anomalyList = safeAnomalies.anomalies || (FALLBACK_CONFIGS.anomalies || {}).anomalies || [];
  const modelRows = safeTableRows(predictiveModels, (FALLBACK_TABLES.predictive_models || {}).rows);

  return (
    <>
      {/* Insight Banner */}
      {insight ? (
        <InsightBanner
          icon={insight.icon}
          title={insight.title}
          variant={insight.variant}
          text={insight.text}
          buttons={insight.buttons || []}
          showToast={showToast}
        />
      ) : (
        <InsightBanner
          icon="solar:star-shine-linear"
          title="AI-Generated Narrative"
          text="Fold Unity detected <strong>3 anomalies</strong> this week: (1) CHF IP admissions <strong>+18%</strong> vs 4-week avg at Riverside Hospital. (2) RAF recapture velocity <strong>-12%</strong> since V28 transition. (3) TCM enrollment <strong>-24%</strong> from coordinator capacity gap."
          buttons={[
            { label: 'Review All Anomalies', primary: true, toast: 'Opening anomaly dashboard' },
            { label: 'Configure Alerts', toast: 'Opening alert config' },
          ]}
          showToast={showToast}
        />
      )}

      <div className={s.kpiGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {kpis.map(k => (
          <KpiCard key={k.key} value={k.value} label={k.label} delta={k.delta} deltaType={k.deltaType} sub={k.sub} accentColor={k.accentColor} />
        ))}
      </div>

      <Card title="Ask Fold \u2014 Natural Language Query Engine" sub="Click an example or type your own question">
        <div style={{ fontSize: 14, color: 'var(--neutral-300)', marginBottom: 12 }}>
          Type any clinical or operational question. Fold Unity translates to structured queries against your data.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {examples.map((q, i) => (
            <div key={i} className={s.nlqCard} onClick={() => showToast?.(`Running query: ${q.title}`)}>
              <div className={s.nlqTitle}>{q.title}</div>
              <div className={s.nlqDesc}>{q.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className={s.g2}>
        <Card title="Anomaly Detection" actions={<button className={`${s.btn} ${s.btnGhost}`} onClick={() => showToast?.('Configuring alert thresholds')}>Configure Thresholds</button>}>
          {anomalyList.map((a, i) => (
            <div key={i} className={s.ruleCard} style={{ borderLeft: `3px solid ${a.severity === 'red' ? 'var(--status-error)' : 'var(--status-warning)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`${s.stPill} ${a.severity === 'red' ? s.stRed : s.stAmber}`}>
                  {a.severity === 'red' ? 'Critical' : 'Warning'}
                </span>
                {a.detected && <span style={{ fontSize: 12, color: 'var(--neutral-200)' }}>{a.detected}</span>}
              </div>
              <div className={s.ruleTrigger} style={{ marginTop: 6, color: 'var(--neutral-500)' }}>{a.title}</div>
              <div style={{ fontSize: 12, color: 'var(--neutral-300)', lineHeight: 1.55, marginTop: 4 }}>{a.desc}</div>
              {a.actionLabel && (
                <button className={`${s.btn} ${a.severity === 'red' ? s.btnPrimary : s.btnGhost}`} style={{ marginTop: 8 }} onClick={() => showToast?.(a.actionToast || a.actionLabel)}>
                  {a.actionLabel}
                </button>
              )}
            </div>
          ))}
        </Card>

        <Card title="Predictive Models" sub="Performance & active predictions" flush>
          <div className={s.tblWrap}>
            <table className={s.tbl}>
              <thead>
                <tr><th>Model</th><th className={s.r}>AUC</th><th className={s.r}>Accuracy</th><th className={s.r}>Active Predictions</th><th className={s.r}>Last Retrained</th><th>Status</th></tr>
              </thead>
              <tbody>
                {modelRows.map((row, i) => {
                  const st = row.status;
                  return (
                    <tr key={i}>
                      <td className={s.fw600}>{row.model}</td>
                      <td className={`${s.r} ${s.mono}`}>{row.auc}</td>
                      <td className={`${s.r} ${s.mono}`}>{row.accuracy}</td>
                      <td className={`${s.r} ${s.mono}`}>{row.predictions}</td>
                      <td className={`${s.r} ${s.mono}`}>{row.retrained}</td>
                      <td>
                        <span className={`${s.stPill} ${st === 'green' ? s.stGreen : s.stAmber}`}>
                          {st === 'green' ? 'Active' : 'Stale'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--neutral-200)' }}>
            Models retrained bi-weekly on rolling 24-month data. Drift monitoring active. Alert threshold: AUC drop &gt; 0.03.
          </div>
        </Card>
      </div>
    </>
  );
}
