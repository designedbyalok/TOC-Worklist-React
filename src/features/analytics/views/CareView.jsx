import { useState, useEffect } from 'react';
import { Button } from '../../../components/Button/Button';
import { useAppStore } from '../../../store/useAppStore';
import { FALLBACK_KPIS, FALLBACK_TABLES, FALLBACK_PROGRESS_BARS, FALLBACK_CONFIGS } from '../../../data/analyticsFallbacks';
import { KpiCard, InsightBanner, Card, ProgressBar, StatusPill, safeBarItems, safeTableRows, safeConfigData } from './shared';
import s from '../AnalyticsLayout.module.css';

const TABS = ['Productivity', 'Bottlenecks', 'Team', 'Quality', 'Programs'];

export function CareView({ showToast }) {
  const fetchViewKpis = useAppStore(st => st.fetchViewKpis);
  const fetchViewTable = useAppStore(st => st.fetchViewTable);
  const fetchConfig = useAppStore(st => st.fetchConfig);
  const fetchProgressBars = useAppStore(st => st.fetchProgressBars);
  const period = useAppStore(st => st.analyticsPeriod);

  const fb = FALLBACK_KPIS.care || { kpis: [], insight: null };
  const [kpiData, setKpiData] = useState(fb);
  const [prodByCm, setProdByCm] = useState(FALLBACK_TABLES.productivity_by_cm);
  const [prodStrip, setProdStrip] = useState(FALLBACK_CONFIGS.care_productivity_strip);
  const [careQuality, setCareQuality] = useState(FALLBACK_PROGRESS_BARS.care_quality_metrics);
  const [programsDetail, setProgramsDetail] = useState(FALLBACK_TABLES.programs_detail);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    fetchViewKpis('care').then(d => d && setKpiData(d));
    fetchViewTable('care', 'productivity_by_cm').then(d => d && setProdByCm(d));
    fetchConfig('care_productivity_strip').then(d => d && setProdStrip(d));
    fetchProgressBars('care', 'care_quality_metrics').then(d => d && setCareQuality(d));
    fetchViewTable('care', 'programs_detail').then(d => d && setProgramsDetail(d));
  }, [period]);

  const kpis = kpiData?.kpis || fb.kpis || [];
  const insight = kpiData?.insight || fb.insight;
  const safeProdStrip = safeConfigData(prodStrip, FALLBACK_CONFIGS.care_productivity_strip);
  const stripMetrics = safeProdStrip.metrics || (FALLBACK_CONFIGS.care_productivity_strip || {}).metrics || [];
  const cmRows = safeTableRows(prodByCm, (FALLBACK_TABLES.productivity_by_cm || {}).rows);

  // Program ROI strip data
  const roiPrograms = [
    { prog: 'CCM', members: '4,823 members', saved: '$1,620K', spent: '$450K', roi: '3.6x' },
    { prog: 'TCM', members: '2,156 members', saved: '$980K', spent: '$280K', roi: '3.5x' },
    { prog: 'ED Diversion', members: '1,842 members', saved: '$540K', spent: '$180K', roi: '3.0x' },
    { prog: 'Post-Discharge', members: '3,241 members', saved: '$660K', spent: '$220K', roi: '3.0x' },
  ];

  return (
    <>
      {/* Insight Banner */}
      {insight ? (
        <InsightBanner icon={insight.icon} title={insight.title} variant={insight.variant} text={insight.text} buttons={insight.buttons || []} showToast={showToast} />
      ) : (
        <InsightBanner
          icon="solar:pulse-2-linear"
          title="Care Management Command Center"
          text="Caseload: <strong>1,856 open cases / 8 staff</strong>. CCM saved <strong>$1.62M</strong> (3.6x ROI). TCM 48h adherence: <strong>82%</strong> (target 85%). <strong>127 overdue cases</strong> need attention. Top performer: <strong>Sarah Chen</strong> &mdash; 78% engagement."
          buttons={[]}
          showToast={showToast}
        />
      )}

      {/* Program ROI Strip */}
      <div className={s.roiStrip}>
        {roiPrograms.map((r, i) => (
          <div key={i} className={s.roiCard}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--neutral-500)' }}>{r.prog}</div>
            <div style={{ fontSize: 12, color: 'var(--neutral-200)', marginTop: 2 }}>{r.members}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--neutral-200)' }}>Saved</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--status-success)' }}>{r.saved}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 12, color: 'var(--neutral-200)' }}>Spent</span>
              <span style={{ fontSize: 12, color: 'var(--neutral-300)' }}>{r.spent}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--primary-300)', marginTop: 4 }}>ROI {r.roi}</div>
          </div>
        ))}
      </div>

      <div className={s.tabRow}>
        {TABS.map((t, i) => (
          <button key={t} className={`${s.tab} ${tab === i ? s.active : ''}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      {tab === 0 && <ProductivityTab stripMetrics={stripMetrics} cmRows={cmRows} showToast={showToast} />}
      {tab === 1 && <BottlenecksTab showToast={showToast} />}
      {tab === 2 && <TeamTab showToast={showToast} />}
      {tab === 3 && <QualityTab bars={careQuality} showToast={showToast} />}
      {tab === 4 && <ProgramsTab showToast={showToast} programsDetail={programsDetail} />}
    </>
  );
}

function ProductivityTab({ stripMetrics, cmRows, showToast }) {
  // Productivity metrics strip
  const metrics = stripMetrics.length > 0 ? stripMetrics : [
    { label: 'Calls Completed', val: '2,847', target: '3,000', delta: '+5.2%', cls: 'g' },
    { label: 'Successful Contacts', val: '1,892', target: '2,100', delta: '+8.1%', cls: 'g' },
    { label: 'Touches / Member / Mo', val: '4.2', target: '5', delta: '-3.1%', cls: 'r' },
    { label: 'CCM Minutes', val: '142,500', target: '150,000', delta: '+12.4%', cls: 'g' },
    { label: 'TCM Within 48h', val: '82%', target: '85%', delta: '+4.5%', cls: 't' },
    { label: 'Follow-Up Adherence', val: '78%', target: '85%', delta: '+6.3%', cls: 't' },
  ];

  // Cases summary
  const cases = [
    { label: 'Cases Closed', value: '423', color: 'var(--status-success)' },
    { label: 'Cases Open', value: '1,856', color: 'var(--neutral-500)' },
    { label: 'Overdue Cases', value: '127', color: 'var(--status-error)' },
  ];

  return (
    <>
      <div className={s.prodStrip}>
        {metrics.map((m, i) => {
          const dc = m.cls === 'g' ? 'var(--status-success)' : m.cls === 'r' ? 'var(--status-error)' : 'var(--status-warning)';
          return (
            <div key={i} className={s.prodCard}>
              <div className={s.prodLabel}>{m.label}</div>
              <div className={s.prodVal}>{m.val}<span className={s.prodTarget}> / {m.target}</span></div>
              <div style={{ fontSize: 12, fontWeight: 500, color: dc, marginTop: 2 }}>{m.delta} vs last mo</div>
            </div>
          );
        })}
      </div>

      {/* Cases strip */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        {cases.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--neutral-0)', border: '1px solid var(--neutral-150)', borderRadius: 8, flex: '1 1 200px', cursor: 'pointer' }}
            onClick={() => c.label === 'Overdue Cases' ? showToast?.('Viewing 127 overdue cases') : showToast?.('Loading case list...')}
          >
            <div>
              <div style={{ fontSize: 24, fontWeight: 500, color: c.color }}>{c.value}</div>
              <div style={{ fontSize: 12, color: 'var(--neutral-200)' }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <Card title="Productivity by Care Manager" flush>
        <div className={s.tblWrap}>
          <table className={s.tbl}>
            <thead>
              <tr><th>Care Manager</th><th className={s.r}>Calls</th><th className={s.r}>Contacts</th><th className={s.r}>CCM Min</th><th className={s.r}>TCM 48h</th><th className={s.r}>Follow-Up</th><th>Status</th></tr>
            </thead>
            <tbody>
              {(cmRows || []).map((row, i) => {
                const st = row.status;
                return (
                  <tr key={i}>
                    <td className={s.fw600}>{row.name}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.calls}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.contacts}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.ccm_min}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.tcm_48h}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.follow_up}</td>
                    <td><StatusPill label={st === 'green' ? 'On Track' : 'Behind'} variant={st} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function BottlenecksTab({ showToast }) {
  const funnelStages = [
    { label: 'Identified', n: 4286, pct: 100 },
    { label: 'Outreach Attempted', n: 3214, pct: 75, drop: '-25%' },
    { label: 'Contacted', n: 2142, pct: 50, drop: '-33%' },
    { label: 'Consented', n: 1499, pct: 35, drop: '-30%' },
    { label: 'Enrolled', n: 1071, pct: 25, drop: '-29%' },
    { label: 'Active (90d+)', n: 642, pct: 15, drop: '-40%' },
  ];

  const leakagePoints = [
    { step: 'Outreach \u2192 Contact', reason: 'Unable to reach member', n: '1,072', drop: '33%', rec: 'Optimize outreach timing \u2014 best contact window 10am\u201312pm Tue/Wed', cls: 'r' },
    { step: 'Contact \u2192 Consent', reason: 'Declined enrollment', n: '643', drop: '30%', rec: 'Review value proposition script \u2014 peer success stories', cls: 'a' },
    { step: 'Consent \u2192 Enrolled', reason: 'Documentation incomplete', n: '428', drop: '29%', rec: 'Streamline e-consent paperwork \u2014 digital signature integration', cls: 'a' },
    { step: 'Enrolled \u2192 Active', reason: 'Lost to follow-up', n: '429', drop: '40%', rec: 'Early engagement protocol \u2014 Week 1 check-in within 48 hours', cls: 'r' },
  ];

  const alerts = [
    { label: 'Overdue TCM Calls', n: '47', color: 'var(--status-error)' },
    { label: 'Pending Consents', n: '123', color: 'var(--status-warning)' },
    { label: 'At-Risk Members', n: '89', color: 'var(--status-error)' },
  ];

  return (
    <>
      <div className={s.g2}>
        <Card title="Enrollment Funnel Drop-off Analysis" sub="Overall conversion: 15.0%">
          {funnelStages.map((stage, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--neutral-50)' }}>
              <div style={{ width: 140, fontSize: 12, fontWeight: 500 }}>{stage.label}</div>
              <div style={{ flex: 1, height: 20, background: 'var(--neutral-50)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                <div style={{ width: `${stage.pct}%`, height: '100%', background: stage.pct < 25 ? 'var(--status-success)' : stage.pct < 50 ? 'var(--status-info)' : 'var(--status-info)', borderRadius: 4, display: 'flex', alignItems: 'center', paddingLeft: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--neutral-0)' }}>{stage.n.toLocaleString()}</span>
                </div>
              </div>
              {stage.drop && <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--status-error)', width: 40 }}>{stage.drop}</span>}
            </div>
          ))}
        </Card>

        <Card title="Process Leakage Points">
          {leakagePoints.map((lp, i) => {
            const rc = lp.cls === 'r' ? 'var(--status-error)' : 'var(--status-warning)';
            return (
              <div key={i} style={{ padding: '10px 12px', background: 'var(--neutral-0)', border: '1px solid var(--neutral-150)', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{lp.step}</div>
                    <div style={{ fontSize: 12, color: 'var(--neutral-200)', marginTop: 2 }}>{lp.reason}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 500, color: rc }}>{lp.n}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: rc }}>{lp.drop} drop-off</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--status-info)', marginTop: 8 }}><strong>Recommended:</strong> {lp.rec}</div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Alert strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 4 }}>
        {alerts.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: 'var(--neutral-0)', border: '1px solid var(--neutral-150)', borderRadius: 8, cursor: 'pointer' }}
            onClick={() => showToast?.(`Viewing ${a.n} ${a.label.toLowerCase()}`)}
          >
            <div>
              <div style={{ fontSize: 24, fontWeight: 500, color: a.color }}>{a.n}</div>
              <div style={{ fontSize: 12, color: 'var(--neutral-200)' }}>{a.label}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function TeamTab({ showToast }) {
  const topPerformers = [
    { name: 'Sarah Chen', role: 'Senior Care Manager', rank: 1, engage: 78, tcm: 91, caseload: 48, trend: '\u2191' },
    { name: 'Michael Torres', role: 'Care Manager', rank: 2, engage: 75, tcm: 88, caseload: 44, trend: '\u2191' },
    { name: 'Emily Rodriguez', role: 'Care Manager', rank: 3, engage: 72, tcm: 85, caseload: 46, trend: '\u2192' },
    { name: 'James Wilson', role: 'Care Coordinator', rank: 4, engage: 68, tcm: 82, caseload: 42, trend: '\u2191' },
    { name: 'Lisa Park', role: 'Care Manager', rank: 5, engage: 66, tcm: 79, caseload: 50, trend: '\u2193' },
  ];

  const needsSupport = [
    { name: 'David Kim', role: 'Care Coordinator', rank: 16, engage: 52, tcm: 68, caseload: 40, trend: '\u2193' },
    { name: 'Amanda Foster', role: 'Care Manager', rank: 17, engage: 48, tcm: 62, caseload: 37, trend: '\u2193' },
    { name: 'Robert Chang', role: 'Care Coordinator', rank: 18, engage: 45, tcm: 58, caseload: 35, trend: '\u2193' },
  ];

  const StaffCard = ({ staff, isBottom }) => {
    const bg = isBottom ? 'var(--status-warning-light)' : 'var(--status-success-light)';
    const rkColor = isBottom ? 'var(--status-warning)' : 'var(--status-success)';
    const trendColor = staff.trend === '\u2191' ? 'var(--status-success)' : staff.trend === '\u2193' ? 'var(--status-error)' : 'var(--neutral-200)';
    return (
      <div style={{ padding: '10px 12px', background: bg, borderRadius: 8, marginBottom: 6, cursor: 'pointer' }}
        onClick={() => showToast?.(`Viewing ${staff.name} detail`)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: rkColor, color: 'var(--neutral-0)', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>#{staff.rank}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{staff.name}</div>
            <div style={{ fontSize: 12, color: 'var(--neutral-200)' }}>{staff.role}</div>
          </div>
          <span style={{ fontSize: 16, color: trendColor }}>{staff.trend}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: staff.engage > 70 ? 'var(--status-success)' : staff.engage > 55 ? 'var(--status-warning)' : 'var(--status-error)' }}>{staff.engage}%</div>
            <div style={{ fontSize: 12, color: 'var(--neutral-200)' }}>Engage</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: staff.tcm > 80 ? 'var(--status-success)' : staff.tcm > 65 ? 'var(--status-warning)' : 'var(--status-error)' }}>{staff.tcm}%</div>
            <div style={{ fontSize: 12, color: 'var(--neutral-200)' }}>TCM Adh.</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{staff.caseload}</div>
            <div style={{ fontSize: 12, color: 'var(--neutral-200)' }}>Caseload</div>
          </div>
        </div>
        {isBottom && <div style={{ fontSize: 12, color: 'var(--status-warning)', marginTop: 6 }}>Low contact rate &middot; TCM gaps &middot; High-risk challenges</div>}
      </div>
    );
  };

  return (
    <div className={s.g2}>
      <Card title={<span>&#x1F3C6; Top Performers</span>}>
        {topPerformers.map(st => <StaffCard key={st.name} staff={st} isBottom={false} />)}
      </Card>
      <Card title={<span>&#x26A0; Needs Support</span>} style={{ border: '1px solid var(--status-warning-light)' }}>
        {needsSupport.map(st => <StaffCard key={st.name} staff={st} isBottom={true} />)}
        <Button variant="primary" size="S" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }} onClick={() => showToast?.('Scheduling coaching sessions for 3 staff')}>
          Schedule Support Sessions (3)
        </Button>
      </Card>
    </div>
  );
}

function QualityTab({ bars, showToast }) {
  const items = safeBarItems(bars);

  const qualityScores = [
    { label: 'Call Quality', value: '86%', delta: '+3.2% vs last period', color: 'var(--status-success)' },
    { label: 'Documentation Accuracy', value: '92%', delta: '+1.5% vs last period', color: 'var(--status-success)' },
    { label: 'Care Plan Completeness', value: '78%', delta: '-2.1% vs last period', color: 'var(--status-error)' },
    { label: 'Patient Satisfaction', value: '88%', delta: '+4.2% vs last period', color: 'var(--status-success)' },
  ];

  const complianceIssues = [
    { issue: 'Late TCM contacts (>48h)', assigned: 'Michael T., Lisa P.', n: 47, severity: 'high' },
    { issue: 'Missing care plan documentation', assigned: 'David K., Amanda F.', n: 23, severity: 'medium' },
    { issue: 'Overdue follow-up calls', assigned: 'Robert C., James W.', n: 34, severity: 'high' },
    { issue: 'Incomplete consent forms', assigned: 'Emily R.', n: 12, severity: 'low' },
  ];

  const pathways = [
    { name: 'CCM Pathway', rate: 84, target: 85, delta: '+6.1%' },
    { name: 'TCM Pathway', rate: 79, target: 85, delta: '+5.8%' },
    { name: 'ED Diversion Pathway', rate: 88, target: 90, delta: '+4.2%' },
    { name: 'Post-Discharge', rate: 81, target: 85, delta: '+7.2%' },
  ];

  return (
    <>
      <div className={s.g2}>
        <Card title="Quality Scores">
          {qualityScores.map((q, i) => {
            const dc = q.delta.startsWith('+') ? 'var(--status-success)' : 'var(--status-error)';
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--neutral-50)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 12 }}>{q.label}</div>
                  <div style={{ fontSize: 12, color: dc, marginTop: 2 }}>{q.delta}</div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 500, color: q.color }}>{q.value}</div>
              </div>
            );
          })}
        </Card>

        <Card title={<span>&#x26A0; Compliance Issues</span>} style={{ border: '1px solid var(--status-warning-light)' }}
          actions={<Button variant="primary" size="S" style={{ fontSize: 12 }} onClick={() => showToast?.('Compliance alerts sent to managers')}>Alert All</Button>}
        >
          {complianceIssues.map((c, i) => {
            const sc = c.severity === 'high' ? 'var(--status-error)' : c.severity === 'medium' ? 'var(--status-warning)' : 'var(--status-success)';
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--neutral-50)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 12 }}>{c.issue}</div>
                  <div style={{ fontSize: 12, color: 'var(--neutral-200)', marginTop: 2 }}>Assigned: {c.assigned}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginLeft: 12 }}>
                  <span className={`${s.stPill} ${c.severity === 'high' ? s.stRed : c.severity === 'medium' ? s.stAmber : s.stGreen}`}>{c.severity}</span>
                  <span style={{ fontSize: 16, fontWeight: 500, color: sc }}>{c.n}</span>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      <Card title="Process Adherence by Pathway">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {pathways.map((p, i) => {
            const vc = p.rate >= p.target ? 'var(--status-success)' : p.rate >= p.target - 5 ? 'var(--status-warning)' : 'var(--status-error)';
            return (
              <div key={i} style={{ background: 'var(--neutral-0)', border: '1px solid var(--neutral-150)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 500, color: vc }}>{p.rate}%</div>
                <div style={{ fontSize: 12, fontWeight: 500, marginTop: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--neutral-200)', marginTop: 2 }}>Target: {p.target}%</div>
                <div style={{ fontSize: 12, color: 'var(--status-success)', marginTop: 3 }}>{'\u2191'} {p.delta}</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12 }}>
          <ProgressBar label="Coleman Model Compliance" value="78% of TCM episodes" pct={78} color="teal" sub="Target 85% \u2014 7pp gap" />
          <ProgressBar label="Care Plan Update Timeliness" value="72% updated within 30 days" pct={72} color="amber" sub="Target 90%" />
          <ProgressBar label="Medication Reconciliation" value="68% at enrollment" pct={68} color="amber" sub="Target 75%" />
        </div>
      </Card>

      {/* Original quality bars if available */}
      {items.length > 0 && (
        <Card title="Additional Quality Metrics">
          {items.map(b => (
            <ProgressBar key={b.label} label={b.label} value={b.value} pct={b.pct} color={b.color} sub={b.sub} />
          ))}
        </Card>
      )}
    </>
  );
}

function ProgramsTab({ showToast, programsDetail }) {
  const pdRows = safeTableRows(programsDetail, (FALLBACK_TABLES.programs_detail || {}).rows);
  const programs = [
    { name: 'Chronic Care Management', abbr: 'CCM', color: 'var(--status-info)', members: 4823, eligible: 6100, enrolled: 79, saved: '$1,620K', spent: '$450K', roi: '3.6x',
      kpis: [['Monthly Minutes Avg','38 min','\u226520 min','g'],['Monthly Review Plan %','71%','85%','a'],['1st Month Contact Rate','84%','80%','g'],['Care Plan Update Rate','58%','75%','r']],
      alert: '312 eligible members not yet enrolled \u2014 $390K revenue opportunity' },
    { name: 'Transitional Care', abbr: 'TCM', color: 'var(--status-success)', members: 2156, eligible: 2480, enrolled: 87, saved: '$980K', spent: '$280K', roi: '3.5x',
      kpis: [['48h Contact Rate','82%','85%','t'],['7-Day F/U Completion','88%','85%','g'],['Med Reconciliation','68%','75%','a'],['30-Day Readmit','14.2%','15%','g']],
      alert: '47 overdue TCM contacts \u2014 readmission risk elevated' },
    { name: 'TOC \u2014 Inpatient', abbr: 'TOC-IP', color: 'var(--primary-300)', members: 1284, eligible: 1410, enrolled: 91, saved: '$740K', spent: '$190K', roi: '3.9x',
      kpis: [['PCP F/U Within 7d','72%','80%','a'],['Discharge Summary','89%','95%','a'],['30-Day Readmit','16.8%','15%','r'],['SNF Placement','18%','<20%','g']],
      alert: '24 readmissions this month \u2014 3 facilities driving 71%' },
    { name: 'TOC \u2014 ED', abbr: 'TOC-ED', color: 'var(--status-error)', members: 1842, eligible: 2100, enrolled: 88, saved: '$540K', spent: '$180K', roi: '3.0x',
      kpis: [['Avoidable ED Rate','34%','<30%','r'],['Post-ED Contact <48h','78%','85%','a'],['ED \u2192 PCP Redirect','61%','70%','a'],['Repeat ED (\u22653/yr)','12%','<10%','r']],
      alert: '221 high-ED utilizers (3+ visits/yr) \u2014 top cost driver' },
    { name: 'Quality Program', abbr: 'Quality', color: 'var(--status-warning)', members: 8420, eligible: 8420, enrolled: 100, saved: '$840K', spent: '$220K', roi: '3.8x',
      kpis: [['Quality Composite','4.1/5.0','4.0','g'],['AWV Completion','61%','80%','r'],['HbA1c Control','72%','70%','g'],['Colorectal Screening','58%','65%','r']],
      alert: '847 members unscheduled for AWV \u2014 biggest drag on composite' },
    { name: 'Annual Wellness Visit', abbr: 'AWV', color: 'var(--status-info)', members: 5120, eligible: 8420, enrolled: 61, saved: '$620K', spent: '$160K', roi: '3.9x',
      kpis: [['Completion Rate','61%','80%','r'],['Codes/AWV','2.4','3.2','a'],['HCC Suspects Closed','42%','60%','r'],['Quality Gaps Closed','2.8','3.2','a']],
      alert: '847 members overdue for AWV \u2014 $127K revenue + quality impact' },
    { name: 'Risk Coding / HCC', abbr: 'Risk Coding', color: 'var(--status-warning)', members: 5280, eligible: 8420, enrolled: 63, saved: '$2,100K', spent: '$380K', roi: '5.5x',
      kpis: [['RAF Capture Rate','73%','85%','r'],['Avg RAF Score','1.042','1.120','a'],['Suspects Closed/AWV','2.4','3.2','a'],['Recapture Rate','71%','80%','a']],
      alert: '962 open HCC suspects \u2014 $2.1M uncaptured revenue' },
    { name: 'Health Risk Assessment', abbr: 'HRA', color: 'var(--status-success)', members: 3840, eligible: 8420, enrolled: 46, saved: '$410K', spent: '$90K', roi: '4.6x',
      kpis: [['Completion Rate','46%','70%','r'],['High-Risk Identified','22%','\u2014','t'],['SDOH Positive Screen','31%','\u2014','t'],['HRA \u2192 AWV Conversion','54%','65%','a']],
      alert: '4,580 eligible members without completed HRA this year' },
  ];

  // Summary bar
  return (
    <>
      {/* Programs Detail Table */}
      <Card title="Programs Detail" flush actions={<Button variant="ghost" size="S" onClick={() => showToast?.('Exporting programs detail...')}>Export</Button>}>
        <div className={s.tblWrap}>
          <table className={s.tbl}>
            <thead>
              <tr><th>Program</th><th className={s.r}>Eligible</th><th className={s.r}>Engaged</th><th>Last Outreach</th><th>Pref Mode</th><th>Language</th><th>Pref Day</th><th className={s.r}>Outreach%</th><th className={s.r}>Engage%</th><th>Action</th></tr>
            </thead>
            <tbody>
              {pdRows.map((row, i) => {
                const engColor = parseInt(row.engage_pct) >= 85 ? 'green' : parseInt(row.engage_pct) >= 70 ? 'amber' : 'red';
                return (
                  <tr key={i}>
                    <td className={s.fw600}>{row.program}</td>
                    <td className={`${s.r} ${s.mono}`}>{typeof row.eligible === 'number' ? row.eligible.toLocaleString() : row.eligible}</td>
                    <td className={`${s.r} ${s.mono}`}>{typeof row.engaged === 'number' ? row.engaged.toLocaleString() : row.engaged}</td>
                    <td className={s.mono}>{row.last_outreach}</td>
                    <td>{row.pref_mode}</td>
                    <td>{row.language}</td>
                    <td>{row.pref_day}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.outreach_pct}</td>
                    <td className={`${s.r}`}><span className={`${s.stPill} ${engColor === 'green' ? s.stGreen : engColor === 'amber' ? s.stAmber : s.stRed}`}>{row.engage_pct}</span></td>
                    <td><Button variant="ghost" size="S" onClick={() => showToast?.(`${row.action} ${row.program}`)}>{row.action}</Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12, padding: '12px 16px', background: 'var(--neutral-0)', border: '1px solid var(--neutral-150)', borderRadius: 8 }}>
        {[['Total in Programs', '11,062', 'var(--status-info)'], ['Total Savings', '$7.3M', 'var(--status-success)'], ['Total Spend', '$1.95M', 'var(--status-warning)'], ['Blended ROI', '3.7x', 'var(--status-success)']].map(([label, val, c], i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 500, color: c }}>{val}</div>
            <div style={{ fontSize: 12, color: 'var(--neutral-200)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {programs.map((p, i) => {
          const enrollColor = p.enrolled < 60 ? 'var(--status-error)' : p.enrolled < 75 ? 'var(--status-warning)' : 'var(--status-success)';
          return (
            <Card key={i} style={{ borderLeft: `4px solid ${p.color}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {p.name} <span style={{ fontSize: 12, padding: '2px 6px', borderRadius: 4, background: p.color + '20', color: p.color, fontWeight: 500 }}>{p.abbr}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center', marginBottom: 8 }}>
                <div><div style={{ fontSize: 14, fontWeight: 500, color: enrollColor }}>{p.enrolled}%</div><div style={{ fontSize: 12, color: 'var(--neutral-200)' }}>Enrolled</div></div>
                <div><div style={{ fontSize: 14, fontWeight: 500 }}>{p.members.toLocaleString()}</div><div style={{ fontSize: 12, color: 'var(--neutral-200)' }}>Members</div></div>
                <div><div style={{ fontSize: 14, fontWeight: 500, color: 'var(--status-success)' }}>{p.saved}</div><div style={{ fontSize: 12, color: 'var(--neutral-200)' }}>Saved</div></div>
                <div><div style={{ fontSize: 14, fontWeight: 500, color: p.color }}>{p.roi}</div><div style={{ fontSize: 12, color: 'var(--neutral-200)' }}>ROI</div></div>
              </div>
              <div style={{ background: 'var(--neutral-50)', borderRadius: 2, height: 4, marginBottom: 8 }}>
                <div style={{ height: 4, borderRadius: 2, background: enrollColor, width: `${p.enrolled}%` }} />
              </div>
              {p.kpis.map(([label, val, target, cl], j) => {
                const vc = cl === 'g' ? 'var(--status-success)' : cl === 'r' ? 'var(--status-error)' : cl === 'a' ? 'var(--status-warning)' : 'var(--neutral-300)';
                return (
                  <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 12 }}>
                    <span style={{ color: 'var(--neutral-300)' }}>{label}</span>
                    <span><span style={{ fontWeight: 500, color: vc }}>{val}</span> <span style={{ color: 'var(--neutral-200)' }}>/ {target}</span></span>
                  </div>
                );
              })}
              <div style={{ fontSize: 12, color: 'var(--status-warning)', marginTop: 6, padding: '6px 8px', background: 'var(--status-warning-light)', borderRadius: 4 }}>
                {'\u25CF'} {p.alert}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
