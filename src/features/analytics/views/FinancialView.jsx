import { useState, useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { FALLBACK_KPIS, FALLBACK_TABLES, FALLBACK_PROGRESS_BARS } from '../../../data/analyticsFallbacks';
import { KpiCard, InsightBanner, Card, ProgressBar, StatusPill, safeBarItems, safeTableRows } from './shared';
import s from '../AnalyticsLayout.module.css';

const TABS = ['TCOC', 'Inpatient', 'Readmissions', 'ED & Outpatient', 'SNF & Post-Acute', 'Pharmacy'];

export function FinancialView({ showToast }) {
  const fetchViewKpis = useAppStore(st => st.fetchViewKpis);
  const fetchViewTable = useAppStore(st => st.fetchViewTable);
  const fetchProgressBars = useAppStore(st => st.fetchProgressBars);
  const period = useAppStore(st => st.analyticsPeriod);

  const fb = FALLBACK_KPIS.financial || { kpis: [], insight: null };
  const [kpiData, setKpiData] = useState(fb);
  const [costByProvider, setCostByProvider] = useState(FALLBACK_TABLES.cost_by_provider);
  const [ipCostDetail, setIpCostDetail] = useState(FALLBACK_TABLES.ip_cost_detail);
  const [opEdUtil, setOpEdUtil] = useState(FALLBACK_TABLES.op_ed_utilization);
  const [snfSpending, setSnfSpending] = useState(FALLBACK_TABLES.snf_spending);
  const [readmissionRates, setReadmissionRates] = useState(FALLBACK_PROGRESS_BARS.readmission_rates);
  const [pharmacyCost, setPharmacyCost] = useState(FALLBACK_PROGRESS_BARS.pharmacy_cost);
  const [highCostClaimants, setHighCostClaimants] = useState(FALLBACK_TABLES.high_cost_claimants);
  const [topDrgs, setTopDrgs] = useState(FALLBACK_TABLES.top_drgs);
  const [topFacilitiesReadmit, setTopFacilitiesReadmit] = useState(FALLBACK_TABLES.top_facilities_readmit);
  const [edChiefComplaints, setEdChiefComplaints] = useState(FALLBACK_TABLES.ed_chief_complaints);
  const [edTopFacilities, setEdTopFacilities] = useState(FALLBACK_TABLES.ed_top_facilities);
  const [opEdOrgHierarchy, setOpEdOrgHierarchy] = useState(FALLBACK_TABLES.op_ed_org_hierarchy);
  const [snfQualityScorecard, setSnfQualityScorecard] = useState(FALLBACK_TABLES.snf_quality_scorecard);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    fetchViewKpis('financial').then(d => d && setKpiData(d));
    fetchViewTable('financial', 'cost_by_provider').then(d => d && setCostByProvider(d));
    fetchViewTable('financial', 'ip_cost_detail', 'inpatient').then(d => d && setIpCostDetail(d));
    fetchViewTable('financial', 'op_ed_utilization', 'op_ed').then(d => d && setOpEdUtil(d));
    fetchViewTable('financial', 'snf_spending', 'snf').then(d => d && setSnfSpending(d));
    fetchProgressBars('financial', 'readmission_rates').then(d => d && setReadmissionRates(d));
    fetchProgressBars('financial', 'pharmacy_cost').then(d => d && setPharmacyCost(d));
    fetchViewTable('financial', 'high_cost_claimants').then(d => d && setHighCostClaimants(d));
    fetchViewTable('financial', 'top_drgs').then(d => d && setTopDrgs(d));
    fetchViewTable('financial', 'top_facilities_readmit').then(d => d && setTopFacilitiesReadmit(d));
    fetchViewTable('financial', 'ed_chief_complaints').then(d => d && setEdChiefComplaints(d));
    fetchViewTable('financial', 'ed_top_facilities').then(d => d && setEdTopFacilities(d));
    fetchViewTable('financial', 'op_ed_org_hierarchy').then(d => d && setOpEdOrgHierarchy(d));
    fetchViewTable('financial', 'snf_quality_scorecard').then(d => d && setSnfQualityScorecard(d));
  }, [period]);

  const kpis = kpiData?.kpis || fb.kpis || [];
  const insight = kpiData?.insight || fb.insight;

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

      <div className={s.kpiGrid} style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {kpis.map(k => (
          <KpiCard key={k.key} value={k.value} label={k.label} delta={k.delta} deltaType={k.deltaType} sub={k.sub} accentColor={k.accentColor} />
        ))}
      </div>

      <div className={s.tabRow}>
        {TABS.map((t, i) => (
          <button key={t} className={`${s.tab} ${tab === i ? s.active : ''}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      {tab === 0 && <TcocTab data={costByProvider} highCost={highCostClaimants} showToast={showToast} />}
      {tab === 1 && <InpatientTab data={ipCostDetail} />}
      {tab === 2 && <ReadmissionsTab bars={readmissionRates} topDrgs={topDrgs} topFacilities={topFacilitiesReadmit} showToast={showToast} />}
      {tab === 3 && <EdOutpatientTab complaints={edChiefComplaints} facilities={edTopFacilities} orgHierarchy={opEdOrgHierarchy} opEdUtil={opEdUtil} showToast={showToast} />}
      {tab === 4 && <SnfPostAcuteTab data={snfSpending} scorecard={snfQualityScorecard} showToast={showToast} />}
      {tab === 5 && <PharmacyTab bars={pharmacyCost} />}
    </>
  );
}

function TcocTab({ data, highCost, showToast }) {
  const rows = safeTableRows(data, (FALLBACK_TABLES.cost_by_provider || {}).rows);
  const hcRows = safeTableRows(highCost, (FALLBACK_TABLES.high_cost_claimants || {}).rows);
  return (
    <>
      <Card title="Cost by Setting — Provider Hierarchy" flush>
        <div className={s.tblWrap}>
          <table className={s.tbl}>
            <thead>
              <tr><th>Practice / Provider</th><th className={s.r}>Members</th><th className={s.r}>TCOC PMPM</th><th className={s.r}>IP PMPM</th><th className={s.r}>ED PMPM</th><th className={s.r}>Rx PMPM</th><th className={s.r}>vs Benchmark</th></tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className={s.fw600}>{row.name}</td>
                  <td className={`${s.r} ${s.mono}`}>{row.members}</td>
                  <td className={`${s.r} ${s.mono}`}>{row.tcoc}</td>
                  <td className={`${s.r} ${s.mono}`}>{row.ip}</td>
                  <td className={`${s.r} ${s.mono}`}>{row.ed}</td>
                  <td className={`${s.r} ${s.mono}`}>{row.rx}</td>
                  <td className={`${s.r} ${(row.vs_bench || '').startsWith('+') ? s.valR : s.valG}`}>{row.vs_bench}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="High-Cost Claimants" flush actions={<button className={`${s.btn} ${s.btnGhost}`} onClick={() => showToast?.('Exporting high-cost claimant list...')}>Export</button>}>
        <div className={s.tblWrap}>
          <table className={s.tbl}>
            <thead>
              <tr><th>Member ID</th><th>Diagnosis</th><th className={s.r}>Total Cost</th><th className={s.r}>IP Admits</th><th>Status</th></tr>
            </thead>
            <tbody>
              {hcRows.map((row, i) => {
                const st = row.status === 'red' ? 'red' : row.status === 'amber' ? 'amber' : 'green';
                return (
                  <tr key={i}>
                    <td className={s.fw600}>{row.member_id}</td>
                    <td>{row.diagnosis}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.total_cost}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.ip_admits}</td>
                    <td><span className={`${s.stPill} ${st === 'red' ? s.stRed : st === 'amber' ? s.stAmber : s.stGreen}`}>{st === 'red' ? 'Critical' : st === 'amber' ? 'High' : 'Monitor'}</span></td>
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

function InpatientTab({ data }) {
  const rows = safeTableRows(data, (FALLBACK_TABLES.ip_cost_detail || {}).rows);
  return (
    <Card title="Inpatient Cost Detail" flush>
      <div className={s.tblWrap}>
        <table className={s.tbl}>
          <thead><tr><th>DRG Category</th><th className={s.r}>Admits</th><th className={s.r}>Avg LOS</th><th className={s.r}>Avg Cost</th><th className={s.r}>Total PMPM</th></tr></thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className={s.fw600}>{row.category}</td>
                <td className={`${s.r} ${s.mono}`}>{row.admits}</td>
                <td className={`${s.r} ${s.mono}`}>{row.avg_los}</td>
                <td className={`${s.r} ${s.mono}`}>{row.avg_cost}</td>
                <td className={`${s.r} ${s.mono}`}>{row.total_pmpm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ReadmissionsTab({ bars, topDrgs, topFacilities, showToast }) {
  const items = safeBarItems(bars);
  const drgRows = safeTableRows(topDrgs, (FALLBACK_TABLES.top_drgs || {}).rows);
  const facRows = safeTableRows(topFacilities, (FALLBACK_TABLES.top_facilities_readmit || {}).rows);

  return (
    <>
      {/* KPIs */}
      <div className={s.kpiGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <KpiCard value="18.4%" label="30-Day Readmit Rate" delta="+2.8pp vs Q3" deltaType="neg" sub="Benchmark: 15.2%" accentColor="var(--status-error)" />
        <KpiCard value="42" label="Avoidable Readmits" delta="This period" deltaType="neg" sub="62% of all readmits" accentColor="var(--status-warning)" />
        <KpiCard value="$18,200" label="Avg Cost / Readmit" delta="+$1,400 YoY" deltaType="neg" sub="Per readmission episode" accentColor="var(--status-error)" />
        <KpiCard value="72%" label="7-Day Follow-up Rate" delta="+4pp QoQ" deltaType="pos" sub="Target: 85%" accentColor="var(--primary-300)" />
      </div>

      <Card title="30-Day Readmission Analysis">
        {items.map(b => (
          <ProgressBar key={b.label} label={b.label} value={b.value} pct={b.pct} color={b.color} sub={b.sub} />
        ))}
      </Card>

      <div className={s.g2}>
        <Card title="Top 5 Admission DRGs" flush>
          <div className={s.tblWrap}>
            <table className={s.tbl}>
              <thead><tr><th>DRG</th><th>Description</th><th className={s.r}>Admits</th><th className={s.r}>Readmit%</th></tr></thead>
              <tbody>
                {drgRows.map((row, i) => (
                  <tr key={i}>
                    <td className={s.fw600}>{row.drg}</td>
                    <td>{row.description}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.admits}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.readmit_pct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Top 5 Facilities" flush>
          <div className={s.tblWrap}>
            <table className={s.tbl}>
              <thead><tr><th>Facility</th><th className={s.r}>Discharges</th><th className={s.r}>Readmit%</th><th className={s.r}>vs Avg</th></tr></thead>
              <tbody>
                {facRows.map((row, i) => {
                  const isOver = (row.vs_avg || '').startsWith('+');
                  return (
                    <tr key={i}>
                      <td className={s.fw600}>{row.facility}</td>
                      <td className={`${s.r} ${s.mono}`}>{row.discharges}</td>
                      <td className={`${s.r} ${s.mono}`}>{row.readmit_pct}</td>
                      <td className={`${s.r} ${isOver ? s.valR : s.valG}`}>{row.vs_avg}</td>
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

function EdOutpatientTab({ complaints, facilities, orgHierarchy, opEdUtil, showToast }) {
  const complaintRows = safeTableRows(complaints, (FALLBACK_TABLES.ed_chief_complaints || {}).rows);
  const facRows = safeTableRows(facilities, (FALLBACK_TABLES.ed_top_facilities || {}).rows);
  const orgRows = safeTableRows(orgHierarchy, (FALLBACK_TABLES.op_ed_org_hierarchy || {}).rows);
  const utilRows = safeTableRows(opEdUtil, (FALLBACK_TABLES.op_ed_utilization || {}).rows);

  return (
    <>
      <div className={s.g2}>
        <Card title="Top 5 ED Chief Complaints" flush>
          <div className={s.tblWrap}>
            <table className={s.tbl}>
              <thead><tr><th>Chief Complaint</th><th className={s.r}>Visits</th><th className={s.r}>Share%</th><th className={s.r}>Avoidable%</th></tr></thead>
              <tbody>
                {complaintRows.map((row, i) => (
                  <tr key={i}>
                    <td className={s.fw600}>{row.complaint}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.visits}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.share_pct}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.avoidable_pct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Top ED Facilities" flush>
          <div className={s.tblWrap}>
            <table className={s.tbl}>
              <thead><tr><th>Facility</th><th className={s.r}>ED Visits</th><th className={s.r}>Avoid%</th><th className={s.r}>Avg Cost</th></tr></thead>
              <tbody>
                {facRows.map((row, i) => (
                  <tr key={i}>
                    <td className={s.fw600}>{row.facility}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.visits}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.avoid_pct}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.avg_cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card title="Org Hierarchy OP/ED" flush>
        <div className={s.tblWrap}>
          <table className={s.tbl}>
            <thead><tr><th>Practice</th><th className={s.r}>ED/1K</th><th className={s.r}>Avoid%</th><th className={s.r}>OP/1K</th><th className={s.r}>AWV%</th></tr></thead>
            <tbody>
              {orgRows.map((row, i) => (
                <tr key={i}>
                  <td className={s.fw600}>{row.practice}</td>
                  <td className={`${s.r} ${s.mono}`}>{row.ed_per_1k}</td>
                  <td className={`${s.r} ${s.mono}`}>{row.avoid_pct}</td>
                  <td className={`${s.r} ${s.mono}`}>{row.op_per_1k}</td>
                  <td className={`${s.r} ${s.mono}`}>{row.awv_pct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Keep original OP/ED utilization table */}
      <Card title="Outpatient & ED Utilization" flush>
        <div className={s.tblWrap}>
          <table className={s.tbl}>
            <thead><tr><th>Category</th><th className={s.r}>Visits/1000</th><th className={s.r}>Benchmark</th><th className={s.r}>PMPM</th><th>Trend</th></tr></thead>
            <tbody>
              {utilRows.map((row, i) => (
                <tr key={i}>
                  <td className={s.fw600}>{row.category}</td>
                  <td className={`${s.r} ${s.mono}`}>{row.visits_per_1k}</td>
                  <td className={`${s.r} ${s.mono}`}>{row.benchmark}</td>
                  <td className={`${s.r} ${s.mono}`}>{row.pmpm}</td>
                  <td>{row.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function SnfPostAcuteTab({ data, scorecard, showToast }) {
  const rows = safeTableRows(data, (FALLBACK_TABLES.snf_spending || {}).rows);
  const scorecardRows = safeTableRows(scorecard, (FALLBACK_TABLES.snf_quality_scorecard || {}).rows);

  return (
    <>
      <Card title="SNF / Post-Acute Spending" flush>
        <div className={s.tblWrap}>
          <table className={s.tbl}>
            <thead><tr><th>Facility</th><th className={s.r}>Admits</th><th className={s.r}>Avg LOS</th><th className={s.r}>Readmit %</th><th className={s.r}>Cost/Stay</th><th>Quality</th></tr></thead>
            <tbody>
              {rows.map((row, i) => {
                const st = row.quality === 'Flagged' ? 'red' : row.quality === 'Monitor' ? 'amber' : 'green';
                return (
                  <tr key={i}>
                    <td className={s.fw600}>{row.facility}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.admits}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.avg_los}</td>
                    <td className={`${s.r} ${st === 'red' ? s.valR : st === 'green' ? s.valG : s.valA}`}>{row.readmit}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.cost_per_stay}</td>
                    <td><span className={`${s.stPill} ${st === 'red' ? s.stRed : st === 'green' ? s.stGreen : s.stAmber}`}>{row.quality}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="SNF Quality Scorecard" flush actions={<button className={`${s.btn} ${s.btnGhost}`} onClick={() => showToast?.('Exporting SNF scorecard...')}>Export</button>}>
        <div className={s.tblWrap}>
          <table className={s.tbl}>
            <thead><tr><th>SNF</th><th className={s.r}>Admits</th><th className={s.r}>Readmit%</th><th className={s.r}>Avg LOS</th><th className={s.r}>CMS Stars</th><th>Status</th></tr></thead>
            <tbody>
              {scorecardRows.map((row, i) => {
                const st = row.status;
                return (
                  <tr key={i}>
                    <td className={s.fw600}>{row.snf}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.admits}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.readmit_pct}</td>
                    <td className={`${s.r} ${s.mono}`}>{row.avg_los}</td>
                    <td className={`${s.r} ${s.mono}`}>{'★'.repeat(row.cms_stars || 0)}{'☆'.repeat(5 - (row.cms_stars || 0))}</td>
                    <td><StatusPill label={st === 'red' ? 'Flagged' : st === 'amber' ? 'Monitor' : 'Preferred'} variant={st} /></td>
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

function PharmacyTab({ bars }) {
  const items = safeBarItems(bars);
  return (
    <Card title="Pharmacy Cost Trend">
      {items.map(b => (
        <ProgressBar key={b.label} label={b.label} value={b.value} pct={b.pct} color={b.color} sub={b.sub} />
      ))}
    </Card>
  );
}
