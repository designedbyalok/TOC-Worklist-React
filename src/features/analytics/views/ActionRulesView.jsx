import { useState, useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { FALLBACK_KPIS, FALLBACK_CONFIGS } from '../../../data/analyticsFallbacks';
import { KpiCard, InsightBanner, Card, safeConfigData } from './shared';
import s from '../AnalyticsLayout.module.css';

export function ActionRulesView({ showToast }) {
  const fetchViewKpis = useAppStore(st => st.fetchViewKpis);
  const fetchConfig = useAppStore(st => st.fetchConfig);
  const period = useAppStore(st => st.analyticsPeriod);

  const fb = FALLBACK_KPIS.actionrules || { kpis: [], insight: null };
  const [kpiData, setKpiData] = useState(fb);
  const [rulesData, setRulesData] = useState(FALLBACK_CONFIGS.action_rules_data);

  useEffect(() => {
    fetchViewKpis('actionrules').then(d => d && setKpiData(d));
    fetchConfig('action_rules_data').then(d => d && setRulesData(d));
  }, [period]);

  const kpis = kpiData?.kpis || fb.kpis || [];
  const insight = kpiData?.insight || fb.insight;
  const safeRules = safeConfigData(rulesData, FALLBACK_CONFIGS.action_rules_data);
  const inlineRules = safeRules.inline || (FALLBACK_CONFIGS.action_rules_data || {}).inline || [];
  const automatedRules = safeRules.automated || (FALLBACK_CONFIGS.action_rules_data || {}).automated || [];
  const agentRules = safeRules.agent || (FALLBACK_CONFIGS.action_rules_data || {}).agent || [];

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
          icon="solar:bolt-linear"
          title="Action Engine Status"
          text="<strong>142 automated actions</strong> this week: 89 inline, 41 rules-engine, 12 AI agent. <strong>Zero false triggers</strong>. Highest-impact: auto-TOC assignment saved est. <strong>18 hours</strong> of coordinator time."
          buttons={[
            { label: 'Create New Rule', primary: true, toast: 'Opening rules builder' },
            { label: 'View Audit Log', toast: 'Opening action audit log' },
          ]}
          showToast={showToast}
        />
      )}

      <div className={s.kpiGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {kpis.map(k => (
          <KpiCard key={k.key} value={k.value} label={k.label} delta={k.delta} deltaType={k.deltaType} sub={k.sub} accentColor={k.accentColor} />
        ))}
      </div>

      <div className={s.g3}>
        <Card style={{ borderTop: '3px solid var(--primary-300)' }} title="1. Inline Actions" sub="User-triggered from dashboard context">
          {inlineRules.map((r, i) => (
            <div key={i} className={s.ruleCard}>
              <div className={s.ruleTrigger}>{r.trigger}</div>
              <div className={s.ruleAction}>{r.action}</div>
              {r.count && <div style={{ fontSize: 12, color: 'var(--neutral-200)', marginTop: 4 }}>Used {r.count} times this week</div>}
            </div>
          ))}
        </Card>

        <Card style={{ borderTop: '3px solid var(--status-warning)' }} title="2. Automated Rules Engine" sub="Configurable thresholds trigger actions">
          {automatedRules.map((r, i) => (
            <div key={i} className={s.ruleCard}>
              <div className={s.ruleTrigger}>{r.trigger}</div>
              <div className={s.ruleAction}>{r.action}</div>
              {r.count && <div style={{ fontSize: 12, color: 'var(--neutral-200)', marginTop: 4 }}>Triggered {r.count} times &middot; {r.overrides || 0} overrides</div>}
            </div>
          ))}
        </Card>

        <Card style={{ borderTop: '3px solid var(--secondary-300)' }} title="3. Agent-Triggered Actions" sub="AI-initiated multi-step interventions">
          {agentRules.map((r, i) => (
            <div key={i} className={s.ruleCard}>
              <div className={s.ruleTrigger}>{r.trigger}</div>
              <div className={s.ruleAction}>{r.action}</div>
              {r.count && <div style={{ fontSize: 12, color: 'var(--neutral-200)', marginTop: 4 }}>Triggered {r.count} times &middot; {r.resolved || 0} resolved without human</div>}
            </div>
          ))}
        </Card>
      </div>

      {/* Rules Builder */}
      <Card
        title="Rules Builder"
        actions={<button className={`${s.btn} ${s.btnPrimary}`} onClick={() => showToast?.('Opening no-code rules builder')}>+ New Rule</button>}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 14px', background: 'var(--neutral-25)', borderRadius: 8, fontSize: 14, color: 'var(--neutral-300)', lineHeight: 1.6 }}>
          <span style={{ fontSize: 14, marginTop: 1 }}>{'\u2139\uFE0F'}</span>
          <span>Rules are configurable by Clinical Ops Managers and Population Health Leaders through a no-code builder. Each rule has an owner, approval chain, and audit log. Rules can be paused, modified, or retired without engineering involvement.</span>
        </div>
      </Card>
    </>
  );
}
