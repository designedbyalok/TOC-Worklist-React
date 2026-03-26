// ─── Analytics Fallback Data ────────────────────────────────
// Used when Supabase is unavailable. All values extracted from
// the 15 view files in src/features/analytics/views/.

// ═══════════════════════════════════════════════════════════
// KPIs — one entry per view with kpis[] and insight{}
// ═══════════════════════════════════════════════════════════

export const FALLBACK_KPIS = {
  executive: {
    kpis: [
      { key: 'total_lives', value: '8,420', label: 'Total Lives', delta: '+340 YoY', deltaType: 'pos', sub: 'Attributed population', accentColor: 'var(--primary-300)' },
      { key: 'tcoc_pmpm', value: '$890', label: 'TCOC PMPM', delta: '+$42 vs prior year', deltaType: 'neg', sub: 'Risk-adjusted, annualized', accentColor: 'var(--status-warning)' },
      { key: 'avg_raf', value: '1.042', label: 'Avg RAF Score', delta: '+0.018 QoQ', deltaType: 'pos', sub: 'Potential: 1.120 (+$2.1M)', accentColor: 'var(--primary-300)' },
      { key: 'mlr', value: '84.2%', label: 'Medical Loss Ratio', delta: '-1.2pp YoY', deltaType: 'pos', sub: 'Payer contracts only', accentColor: 'var(--status-success)' },
      { key: 'shared_savings', value: '$1.2M', label: 'Shared Savings YTD', delta: 'On track for $3.2M', deltaType: 'pos', sub: 'VBC contracts', accentColor: 'var(--status-success)' },
      { key: 'readmit_rate', value: '18.4%', label: '30-Day Readmit Rate', delta: '+2.8pp vs Q3', deltaType: 'neg', sub: 'Benchmark: 15.2%', accentColor: 'var(--status-error)' },
      { key: 'awv_completion', value: '61%', label: 'AWV Completion', delta: '+8pp YTD', deltaType: 'pos', sub: 'Target: 80% (3,280 remaining)', accentColor: 'var(--primary-300)' },
      { key: 'engagement_rate', value: '43%', label: 'Engagement Rate', delta: '+5pp QoQ', deltaType: 'pos', sub: 'Members with \u22652 touches', accentColor: 'var(--primary-300)' },
    ],
    insight: {
      icon: 'solar:danger-triangle-bold',
      title: '3 Priorities This Week',
      variant: 'amber',
      text: '(1) 30-day readmit rate <strong>18.4%</strong> \u2014 up 20% vs Q3. Concentrated at Valley SNF. (2) RAF recapture gap: <strong>$2.1M</strong> uncaptured revenue from 962 open HCC suspects. (3) AWV completion <strong>61%</strong> vs 80% target \u2014 1,600 members unscheduled.',
      buttons: [
        { label: 'View Readmission Detail', primary: true, toast: 'Opening readmission view' },
        { label: 'HCC Suspect List', toast: 'Opening risk & revenue' },
      ],
    },
  },

  population: {
    kpis: [
      { key: 'total_lives', value: '8,420', label: 'Total Attributed Lives', delta: '+340 YoY', deltaType: 'pos', sub: 'Across all payer contracts', accentColor: 'var(--primary-300)' },
      { key: 'tier45', value: '1,516', label: 'Tier 4-5 High Risk', delta: '18% of population', deltaType: 'neg', sub: 'Generating 62% of TCOC', accentColor: 'var(--status-error)' },
      { key: 'chronic', value: '1,842', label: '\u22652 Chronic Conditions', delta: '22% of population', deltaType: 'neu', sub: 'Average 2.8 conditions', accentColor: 'var(--status-warning)' },
      { key: 'sdoh_no_ref', value: '234', label: 'SDoH Positive No Referral', delta: 'Action needed', deltaType: 'neg', sub: 'Flagged in last 90 days', accentColor: 'var(--status-error)' },
    ],
    insight: {
      icon: 'solar:users-group-rounded-bold',
      title: 'Population Alert',
      variant: 'amber',
      text: '<strong>18%</strong> of attributed members are Tier 4-5 (high/very-high risk) \u2014 1,516 members generating <strong>62%</strong> of total cost. <strong>234 members</strong> flagged SDoH-positive with no community referral.',
      buttons: [
        { label: 'View High-Risk Cohort', primary: true, toast: 'Opening high-risk cohort' },
        { label: 'SDoH Campaign', toast: 'Launching SDoH outreach' },
      ],
    },
  },

  financial: {
    kpis: [
      { key: 'total_lives', value: '8,420', label: 'Total Lives', delta: '+340 YoY', deltaType: 'pos', accentColor: 'var(--primary-300)' },
      { key: 'tcoc_pmpm', value: '$890', label: 'Risk-Adj. TCOC PMPM', delta: '+$42 vs bench', deltaType: 'neg', accentColor: 'var(--status-error)' },
      { key: 'mlr', value: '84.2%', label: 'Medical Loss Ratio', delta: '-1.2pp YoY', deltaType: 'pos', sub: 'Payer contracts', accentColor: 'var(--status-success)' },
      { key: 'rx_growth', value: '+18%', label: 'Pharmacy PMPM Growth', delta: 'GLP-1 driven', deltaType: 'neg', accentColor: 'var(--status-error)' },
      { key: 'readmit_rate', value: '18.4%', label: '30-Day Readmit Rate', delta: '+2.8pp vs Q3', deltaType: 'neg', accentColor: 'var(--status-error)' },
    ],
    insight: {
      icon: 'solar:wallet-bold',
      title: 'Financial Alert',
      variant: 'red',
      text: 'TCOC PMPM <strong>$890</strong> \u2014 exceeding benchmark by <strong>$42/member</strong>. Primary drivers: Acute IP (<strong>+$23</strong>) and Pharmacy (<strong>+$23</strong>). Pharmacy growth +18% YoY driven by GLP-1 adoption.',
      buttons: [
        { label: 'IP Cost Deep Dive', primary: true, toast: 'Opening inpatient detail' },
        { label: 'Pharmacy Trend', toast: 'Opening pharmacy analysis' },
      ],
    },
  },

  risk: {
    kpis: [
      { key: 'avg_raf', value: '1.042', label: 'Avg RAF Score', delta: '+0.018 QoQ', deltaType: 'pos', sub: 'Community, non-dual', accentColor: 'var(--primary-300)' },
      { key: 'potential_raf', value: '1.120', label: 'Potential RAF', delta: '+0.078 gap', deltaType: 'neu', sub: 'If all suspects captured', accentColor: 'var(--status-warning)' },
      { key: 'open_hcc', value: '962', label: 'Open HCC Suspects', delta: '-84 vs last month', deltaType: 'pos', sub: 'Awaiting recapture', accentColor: 'var(--status-error)' },
      { key: 'codes_per_awv', value: '2.4', label: 'Codes Captured per AWV', delta: '+0.3 YoY', deltaType: 'pos', sub: 'Target: 3.0 per visit', accentColor: 'var(--primary-300)' },
    ],
    insight: {
      icon: 'solar:shield-warning-bold',
      title: 'RAF Recapture Opportunity',
      variant: 'amber',
      text: 'RAF recapture gap of <strong>$2.1M</strong> from <strong>962 open HCC suspects</strong>. Average RAF score 1.042 vs potential 1.120. Prioritize AWV scheduling for suspects with highest revenue impact.',
      buttons: [
        { label: 'View HCC Suspects', primary: true, toast: 'Opening HCC suspect list' },
        { label: 'Schedule AWVs', toast: 'Opening AWV scheduler' },
      ],
    },
  },

  quality: {
    kpis: [
      { key: 'quality_perf', value: '68%', label: 'Quality Performance', delta: '+4pp YoY', deltaType: 'pos', sub: 'Composite score', accentColor: 'var(--primary-300)' },
      { key: 'quality_bonus', value: '$840K', label: 'Quality Bonus', delta: 'At risk if <70%', deltaType: 'neu', sub: 'Annual VBC incentive', accentColor: 'var(--status-warning)' },
      { key: 'gaps_per_awv', value: '2.8', label: 'Gaps Closed / AWV', delta: '+0.4 YoY', deltaType: 'pos', sub: 'Target: 3.5 per visit', accentColor: 'var(--primary-300)' },
      { key: 'zero_gaps', value: '1,240', label: 'Members 0 Gaps', delta: '15% of population', deltaType: 'neg', sub: 'No closures this year', accentColor: 'var(--status-error)' },
    ],
    insight: {
      icon: 'solar:star-bold',
      title: 'Quality Gap Alert',
      variant: 'amber',
      text: '<strong>1,240 members</strong> have zero quality gap closures this year. Fall Risk Assessment at <strong>44%</strong> \u2014 lowest performer, 16pp below target. Potential quality bonus at risk: <strong>$840K</strong>.',
      buttons: [
        { label: 'View Zero-Gap Members', primary: true, toast: 'Opening zero-gap cohort' },
        { label: 'Gap Closure Campaign', toast: 'Launching gap closure campaign' },
      ],
    },
  },

  utilization: {
    kpis: [
      { key: 'ip_admits', value: '287', label: 'IP Admissions / 1000', delta: '-12 YoY', deltaType: 'pos', sub: 'Benchmark: 295', accentColor: 'var(--primary-300)' },
      { key: 'readmit_rate', value: '18.4%', label: '30-Day Readmit Rate', delta: '+2.8pp vs Q3', deltaType: 'neg', sub: 'Benchmark: 15.2%', accentColor: 'var(--status-error)' },
      { key: 'ed_visits', value: '342', label: 'ED Visits / 1000', delta: '+32 vs bench', deltaType: 'neg', sub: 'Benchmark: 310', accentColor: 'var(--status-warning)' },
      { key: 'snf_admits', value: '42', label: 'SNF Admissions / 1000', delta: '-6 YoY', deltaType: 'pos', sub: 'Post-acute utilization', accentColor: 'var(--status-success)' },
    ],
    insight: {
      icon: 'solar:hospital-bold',
      title: 'Readmission Rate Alert',
      variant: 'red',
      text: '30-day readmission rate <strong>18.4%</strong> \u2014 up <strong>2.8pp</strong> vs Q3 benchmark of 15.2%. CHF readmissions concentrated at Valley SNF (<strong>34% readmit rate</strong>). TCM program reducing readmissions by 42% where deployed.',
      buttons: [
        { label: 'Readmission Detail', primary: true, toast: 'Opening readmission deep dive' },
        { label: 'TCM Expansion Plan', toast: 'Opening TCM impact analysis' },
      ],
    },
  },

  care: {
    kpis: [
      { key: 'ccm', value: '$1.62M', label: 'CCM Savings', delta: '3.6x ROI', deltaType: 'pos', sub: 'Chronic Care Management', accentColor: 'var(--status-success)' },
      { key: 'tcm', value: '$980K', label: 'TCM Savings', delta: '3.5x ROI', deltaType: 'pos', sub: 'Transitional Care Mgmt', accentColor: 'var(--status-success)' },
      { key: 'ed_diversion', value: '$540K', label: 'ED Diversion Savings', delta: '3.0x ROI', deltaType: 'pos', sub: 'ED avoidance program', accentColor: 'var(--status-success)' },
      { key: 'post_discharge', value: '$660K', label: 'Post-Discharge Savings', delta: '3.0x ROI', deltaType: 'pos', sub: 'Discharge follow-up', accentColor: 'var(--status-success)' },
    ],
    insight: null,
  },

  network: {
    kpis: [
      { key: 'in_network', value: '71%', label: 'In-Network Rate', delta: '+3pp YoY', deltaType: 'pos', sub: 'Target: 85%', accentColor: 'var(--primary-300)' },
      { key: 'provider_rating', value: '4.2\u2605', label: 'Avg Provider Rating', delta: '+0.1 QoQ', deltaType: 'pos', sub: 'Based on quality composites', accentColor: 'var(--status-success)' },
      { key: 'leakage', value: '29%', label: 'Specialist Leakage', delta: '-2pp QoQ', deltaType: 'pos', sub: 'Est. $1.4M annual cost', accentColor: 'var(--status-warning)' },
      { key: 'preferred_snfs', value: '18', label: 'Preferred SNFs', delta: '+2 this quarter', deltaType: 'pos', sub: 'Based on quality criteria', accentColor: 'var(--primary-300)' },
    ],
    insight: {
      icon: 'solar:global-bold',
      title: 'Network Leakage Alert',
      variant: 'amber',
      text: 'Specialist leakage at <strong>29%</strong> \u2014 costing an estimated <strong>$1.4M annually</strong>. Cardiology and Orthopedics are top leakage specialties. Valley SNF flagged with <strong>34% readmission rate</strong>.',
      buttons: [
        { label: 'View Leakage Detail', primary: true, toast: 'Opening referral leakage' },
        { label: 'SNF Scorecard', toast: 'Opening SNF quality report' },
      ],
    },
  },

  shared: {
    kpis: [
      { key: 'savings_ytd', value: '$1.2M', label: 'Shared Savings YTD', delta: 'On track for $3.2M', deltaType: 'pos', sub: 'VBC contracts', accentColor: 'var(--status-success)' },
      { key: 'msr_prob', value: '78%', label: 'Prob. Exceeding MSR', delta: '+8pp vs Q3', deltaType: 'pos', sub: 'Monte Carlo simulation', accentColor: 'var(--primary-300)' },
      { key: 'tcoc_pmpm', value: '$890', label: 'TCOC PMPM', delta: '+$42 vs benchmark', deltaType: 'neg', sub: 'Risk-adjusted, annualized', accentColor: 'var(--status-warning)' },
      { key: 'quality_comp', value: '4.1/5', label: 'Quality Composite', delta: '+0.3 YoY', deltaType: 'pos', sub: 'Secures max sharing rate', accentColor: 'var(--status-success)' },
    ],
    insight: {
      icon: 'solar:hand-money-bold',
      title: 'Shared Savings Trajectory',
      variant: 'green',
      text: 'On track for <strong>$3.2M</strong> in shared savings with <strong>78% probability</strong> of exceeding MSR. Quality composite at <strong>4.1/5</strong> \u2014 securing maximum sharing rate. Key risk: IP cost trend (+$23 PMPM vs benchmark).',
      buttons: [
        { label: 'Savings Detail', primary: true, toast: 'Opening savings breakdown' },
        { label: 'Quality Composite', toast: 'Opening quality composite' },
      ],
    },
  },

  roi: {
    kpis: [],
    insight: null,
  },

  tools: {
    kpis: [
      { key: 'adoption', value: '64%', label: 'Sidecar Adoption', delta: '+8pp QoQ', deltaType: 'pos', sub: 'Active providers / total', accentColor: 'var(--primary-300)' },
      { key: 'auto_actions', value: '3,412', label: 'Automated Actions', delta: '+620 this month', deltaType: 'pos', sub: 'Rules engine & triggers', accentColor: 'var(--primary-300)' },
      { key: 'sms_sent', value: '1,840', label: 'SMS Outreach Sent', delta: '+340 vs prior month', deltaType: 'pos', sub: 'Patient engagement msgs', accentColor: 'var(--status-success)' },
      { key: 'hcc_alerts', value: '412', label: 'HCC Alerts Acted On', delta: '74% action rate', deltaType: 'pos', sub: 'Of 557 total alerts', accentColor: 'var(--primary-300)' },
    ],
    insight: {
      icon: 'solar:widget-bold',
      title: 'Adoption Opportunity',
      variant: 'amber',
      text: 'Sidecar adoption at <strong>64%</strong> \u2014 <strong>12 providers</strong> have zero logins in the past 30 days. Providers using Sidecar close <strong>38% more</strong> HCC gaps and respond to alerts <strong>2.4x faster</strong>.',
      buttons: [
        { label: 'View Non-Adopters', primary: true, toast: 'Opening non-adopter list' },
        { label: 'Training Resources', toast: 'Opening training hub' },
      ],
    },
  },

  platformops: {
    kpis: [
      { key: 'dq_score', value: '94.2', label: 'Data Quality Score', delta: '+1.4 QoQ', deltaType: 'pos', sub: 'Composite DQ index', accentColor: 'var(--status-success)' },
      { key: 'ehr_uptime', value: '99.4%', label: 'EHR Uptime', delta: 'SLA: 99.5%', deltaType: 'neu', sub: 'Past 30 days', accentColor: 'var(--primary-300)' },
      { key: 'claims_latency', value: '2.1h', label: 'Claims Latency', delta: 'SLA: 4h', deltaType: 'pos', sub: 'Avg processing time', accentColor: 'var(--status-success)' },
      { key: 'adt_latency', value: '18.2h', label: 'ADT Latency', delta: 'SLA: 4h \u2014 BREACH', deltaType: 'neg', sub: 'Degraded since 3/22', accentColor: 'var(--status-error)' },
    ],
    insight: {
      icon: 'solar:server-bold',
      title: 'ADT Feed Degraded',
      variant: 'red',
      text: 'ADT feed latency at <strong>18.2 hours</strong> \u2014 exceeding 4-hour SLA. Discharge notifications delayed, impacting TCM 48-hour follow-up compliance. EHR uptime stable at <strong>99.4%</strong>.',
      buttons: [
        { label: 'View Pipeline Status', primary: true, toast: 'Opening pipeline health' },
        { label: 'Contact Data Ops', toast: 'Opening support ticket' },
      ],
    },
  },

  aianalytics: {
    kpis: [
      { key: 'nlq_queries', value: '1,247', label: 'NLQ Queries', delta: '+180 this week', deltaType: 'pos', sub: 'Natural language queries', accentColor: 'var(--primary-300)' },
      { key: 'anomalies', value: '3', label: 'Active Anomalies', delta: '2 new this week', deltaType: 'neg', sub: 'Requiring attention', accentColor: 'var(--status-error)' },
      { key: 'pred_accuracy', value: '89.4%', label: 'Predictive Accuracy', delta: '+2.1pp QoQ', deltaType: 'pos', sub: 'Across all models', accentColor: 'var(--status-success)' },
      { key: 'narratives', value: '142', label: 'AI Narratives', delta: '+24 this week', deltaType: 'pos', sub: 'Auto-generated summaries', accentColor: 'var(--primary-300)' },
    ],
    insight: null,
  },

  sdoh: {
    kpis: [
      { key: 'high_dep', value: '34%', label: 'High-Deprivation Members', delta: '2,864 members', deltaType: 'neg', sub: 'ADI score \u2265 7', accentColor: 'var(--status-error)' },
      { key: 'screening_rate', value: '28%', label: 'SDoH Screening Rate', delta: '+6pp YoY', deltaType: 'pos', sub: 'Target: 50%', accentColor: 'var(--status-warning)' },
      { key: 'food_insecurity', value: '412', label: 'Food Insecurity Flagged', delta: 'No referral active', deltaType: 'neg', sub: 'Identified via screening', accentColor: 'var(--status-error)' },
      { key: 'referral_completion', value: '67%', label: 'Referral Completion', delta: '+12pp QoQ', deltaType: 'pos', sub: 'Community resource linkage', accentColor: 'var(--primary-300)' },
    ],
    insight: {
      icon: 'solar:heart-pulse-bold',
      title: 'Health Equity Alert',
      variant: 'red',
      text: '<strong>34%</strong> of members in high-deprivation areas. SDoH screening rate only <strong>28%</strong> \u2014 <strong>412 members</strong> flagged food insecurity with no active referral. Disparity gap of <strong>18pp</strong> in diabetes control between racial groups.',
      buttons: [
        { label: 'View SDoH Cohort', primary: true, toast: 'Opening SDoH member list' },
        { label: 'Community Referrals', toast: 'Opening referral network' },
      ],
    },
  },

  actionrules: {
    kpis: [
      { key: 'actions_week', value: '142', label: 'Actions This Week', delta: '+18 vs prior', deltaType: 'pos', sub: 'Across all rule types', accentColor: 'var(--primary-300)' },
      { key: 'false_triggers', value: '0', label: 'False Triggers', delta: '0 this month', deltaType: 'pos', sub: 'Precision: 100%', accentColor: 'var(--status-success)' },
      { key: 'time_saved', value: '18h', label: 'Time Saved', delta: '+4h vs prior week', deltaType: 'pos', sub: 'Estimated manual effort', accentColor: 'var(--primary-300)' },
      { key: 'active_rules', value: '23', label: 'Active Rules', delta: '+3 new this month', deltaType: 'pos', sub: '8 inline, 8 automated, 7 agent', accentColor: 'var(--primary-300)' },
    ],
    insight: null,
  },
};


// ═══════════════════════════════════════════════════════════
// TIME SERIES
// ═══════════════════════════════════════════════════════════

export const FALLBACK_TIME_SERIES = {
  tcoc_all: [845, 858, 862, 870, 878, 882, 875, 890, 888, 892, 895, 890],
  tcoc_ip:  [310, 315, 312, 320, 318, 325, 315, 318, 322, 320, 316, 318],
  tcoc_op:  [130, 132, 135, 138, 140, 142, 138, 142, 140, 143, 141, 142],
  tcoc_ed:  [78, 80, 82, 84, 85, 86, 88, 88, 86, 89, 87, 88],
  tcoc_rx:  [148, 150, 152, 155, 158, 160, 162, 163, 165, 164, 162, 163],
  tcoc_pac: [100, 102, 105, 108, 110, 112, 108, 106, 108, 107, 105, 106],
};

export const TCOC_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


// ═══════════════════════════════════════════════════════════
// TABLES
// ═══════════════════════════════════════════════════════════

export const FALLBACK_TABLES = {
  // Executive
  cost_by_setting_benchmark: {
    columns: ['Setting', 'Actual PMPM', 'Benchmark', 'Variance', 'Status'],
    rows: [
      { setting: 'Acute Inpatient', actual: '$318', benchmark: '$295', variance: '+$23', status: 'red' },
      { setting: 'SNF / Post-Acute', actual: '$106', benchmark: '$115', variance: '-$9', status: 'green' },
      { setting: 'Outpatient', actual: '$142', benchmark: '$150', variance: '-$8', status: 'green' },
      { setting: 'Emergency Dept', actual: '$88', benchmark: '$80', variance: '+$8', status: 'amber' },
      { setting: 'Pharmacy', actual: '$163', benchmark: '$140', variance: '+$23', status: 'red' },
      { setting: 'Professional', actual: '$73', benchmark: '$70', variance: '+$3', status: 'neutral' },
    ],
  },

  // Financial
  cost_by_provider: {
    columns: ['Practice / Provider', 'Members', 'TCOC PMPM', 'IP PMPM', 'ED PMPM', 'Rx PMPM', 'vs Benchmark'],
    rows: [
      { name: 'Patel Family Medicine', members: '1,240', tcoc: '$920', ip: '$340', ed: '$92', rx: '$175', vs_bench: '+$72' },
      { name: 'Riverside Medical Group', members: '2,180', tcoc: '$865', ip: '$305', ed: '$84', rx: '$158', vs_bench: '+$17' },
      { name: 'Valley Primary Care', members: '1,860', tcoc: '$912', ip: '$328', ed: '$96', rx: '$170', vs_bench: '+$64' },
      { name: 'Lakeview Health Partners', members: '1,540', tcoc: '$842', ip: '$298', ed: '$78', rx: '$152', vs_bench: '-$6' },
      { name: 'Summit Internal Medicine', members: '1,600', tcoc: '$878', ip: '$312', ed: '$88', rx: '$162', vs_bench: '+$30' },
    ],
  },

  ip_cost_detail: {
    columns: ['DRG Category', 'Admits', 'Avg LOS', 'Avg Cost', 'Total PMPM'],
    rows: [
      { category: 'Cardiology (DRG 291-293)', admits: '142', avg_los: '4.8d', avg_cost: '$18,400', total_pmpm: '$78' },
      { category: 'Pulmonary (DRG 190-192)', admits: '98', avg_los: '5.2d', avg_cost: '$16,200', total_pmpm: '$54' },
      { category: 'Orthopedic (DRG 469-470)', admits: '76', avg_los: '3.1d', avg_cost: '$22,800', total_pmpm: '$58' },
      { category: 'GI (DRG 377-379)', admits: '64', avg_los: '3.8d', avg_cost: '$14,600', total_pmpm: '$32' },
      { category: 'Other Medical', admits: '218', avg_los: '3.4d', avg_cost: '$12,100', total_pmpm: '$96' },
    ],
  },

  op_ed_utilization: {
    columns: ['Category', 'Visits/1000', 'Benchmark', 'PMPM', 'Trend'],
    rows: [
      { category: 'ED Visits', visits_per_1k: '342', benchmark: '310', pmpm: '$88', trend: '\u2191 +8%' },
      { category: 'Observation Stays', visits_per_1k: '48', benchmark: '42', pmpm: '$24', trend: '\u2191 +4%' },
      { category: 'OP Surgery', visits_per_1k: '89', benchmark: '92', pmpm: '$62', trend: '\u2193 -3%' },
      { category: 'Imaging / Diagnostics', visits_per_1k: '580', benchmark: '560', pmpm: '$56', trend: '\u2192 flat' },
    ],
  },

  snf_spending: {
    columns: ['Facility', 'Admits', 'Avg LOS', 'Readmit %', 'Cost/Stay', 'Quality'],
    rows: [
      { facility: 'Valley SNF', admits: '24', avg_los: '18.2d', readmit: '34%', cost_per_stay: '$14,200', quality: 'Flagged' },
      { facility: 'Riverside SNF', admits: '42', avg_los: '12.4d', readmit: '12%', cost_per_stay: '$9,800', quality: 'Preferred' },
      { facility: 'Lakeview SNF', admits: '38', avg_los: '11.8d', readmit: '9%', cost_per_stay: '$9,200', quality: 'Preferred' },
      { facility: 'Summit Post-Acute', admits: '18', avg_los: '15.6d', readmit: '19%', cost_per_stay: '$12,400', quality: 'Monitor' },
    ],
  },

  // Risk
  raf_by_practice: {
    columns: ['Practice', 'Members', 'Avg RAF', 'Potential', 'Gap', 'Revenue Impact'],
    rows: [
      { name: 'Patel Family Medicine', members: '1,240', avg_raf: '1.08', potential: '1.16', gap: '+0.08', revenue: '$412K' },
      { name: 'Riverside Medical Group', members: '2,180', avg_raf: '1.04', potential: '1.12', gap: '+0.08', revenue: '$620K' },
      { name: 'Valley Primary Care', members: '1,860', avg_raf: '0.98', potential: '1.08', gap: '+0.10', revenue: '$540K' },
      { name: 'Lakeview Health Partners', members: '1,540', avg_raf: '1.06', potential: '1.12', gap: '+0.06', revenue: '$310K' },
      { name: 'Summit Internal Medicine', members: '1,600', avg_raf: '1.02', potential: '1.10', gap: '+0.08', revenue: '$218K' },
    ],
  },

  // Quality
  quality_measures: {
    columns: ['Measure', 'Current Rate', 'Target', 'Gap', 'Program', 'Trend'],
    rows: [
      { name: 'Annual Wellness Visit (AWV)', rate: 61, target: 80, tag: 'Stars', trend: 'up' },
      { name: 'Diabetes HbA1c Control (<8%)', rate: 72, target: 80, tag: 'HEDIS', trend: 'flat' },
      { name: 'Controlling Blood Pressure', rate: 64, target: 75, tag: 'ACO', trend: 'down' },
      { name: 'Colorectal Cancer Screening', rate: 58, target: 70, tag: 'Stars', trend: 'up' },
      { name: 'Breast Cancer Screening', rate: 71, target: 80, tag: 'HEDIS', trend: 'up' },
      { name: 'Depression Screening (PHQ-9)', rate: 83, target: 85, tag: 'ACO', trend: 'up' },
      { name: 'Statin Therapy (ASCVD)', rate: 71, target: 80, tag: 'Stars', trend: 'flat' },
      { name: 'Medication Adherence \u2013 Diabetes', rate: 78, target: 80, tag: 'Stars', trend: 'up' },
      { name: 'Medication Adherence \u2013 HTN', rate: 75, target: 80, tag: 'Stars', trend: 'flat' },
      { name: 'Medication Adherence \u2013 Statins', rate: 77, target: 80, tag: 'Stars', trend: 'up' },
      { name: 'Fall Risk Assessment (65+)', rate: 44, target: 60, tag: 'HEDIS', trend: 'down' },
      { name: 'Care Plan After Discharge', rate: 62, target: 75, tag: 'ACO', trend: 'up' },
      { name: 'Tobacco Cessation Counseling', rate: 69, target: 80, tag: 'HEDIS', trend: 'flat' },
    ],
  },

  // Utilization
  readmission_by_drg: {
    columns: ['DRG Category', 'Admits', 'Readmits', 'Rate', 'Benchmark', 'Status'],
    rows: [
      { drg: 'CHF (DRG 291-293)', admits: '142', readmits: '34', rate: '24.1%', benchmark: '18.0%', status: 'red' },
      { drg: 'COPD (DRG 190-192)', admits: '98', readmits: '19', rate: '19.8%', benchmark: '17.5%', status: 'amber' },
      { drg: 'Pneumonia (DRG 193-195)', admits: '86', readmits: '10', rate: '12.1%', benchmark: '14.8%', status: 'green' },
      { drg: 'Sepsis (DRG 870-872)', admits: '64', readmits: '12', rate: '18.8%', benchmark: '16.0%', status: 'amber' },
      { drg: 'Hip/Knee (DRG 469-470)', admits: '76', readmits: '4', rate: '5.3%', benchmark: '7.0%', status: 'green' },
      { drg: 'GI (DRG 377-379)', admits: '54', readmits: '8', rate: '14.8%', benchmark: '13.0%', status: 'amber' },
    ],
  },

  // Care
  productivity_by_cm: {
    columns: ['Care Manager', 'Calls', 'Contacts', 'CCM Min', 'TCM 48h', 'Follow-Up', 'Status'],
    rows: [
      { name: 'Sarah Chen, RN', calls: '312', contacts: '218', ccm_min: '2,180', tcm_48h: '94%', follow_up: '82%', status: 'green' },
      { name: 'Mike Torres, RN', calls: '298', contacts: '204', ccm_min: '2,040', tcm_48h: '91%', follow_up: '78%', status: 'green' },
      { name: 'Lisa Park, LPN', calls: '264', contacts: '182', ccm_min: '1,820', tcm_48h: '86%', follow_up: '74%', status: 'amber' },
      { name: 'James Wilson, RN', calls: '248', contacts: '168', ccm_min: '1,680', tcm_48h: '88%', follow_up: '72%', status: 'amber' },
      { name: 'Amy Rodriguez, RN', calls: '284', contacts: '196', ccm_min: '1,960', tcm_48h: '92%', follow_up: '80%', status: 'green' },
      { name: 'David Kim, LPN', calls: '236', contacts: '158', ccm_min: '1,580', tcm_48h: '82%', follow_up: '68%', status: 'amber' },
    ],
  },

  workflow_bottlenecks: {
    columns: ['Bottleneck', 'Affected Members', 'Avg Delay', 'Impact', 'Status'],
    rows: [
      { name: 'PCP follow-up scheduling', members: '342', delay: '4.2 days', impact: 'Readmission risk', status: 'red' },
      { name: 'Prior authorization delays', members: '218', delay: '6.8 days', impact: 'Treatment delays', status: 'red' },
      { name: 'Lab result turnaround', members: '186', delay: '2.1 days', impact: 'Care plan delays', status: 'amber' },
      { name: 'Specialist referral completion', members: '164', delay: '8.4 days', impact: 'Leakage risk', status: 'amber' },
      { name: 'Medication reconciliation', members: '142', delay: '1.8 days', impact: 'Safety concern', status: 'amber' },
    ],
  },

  team_overview: {
    columns: ['Team Member', 'Role', 'Caseload', 'Avg Touches', 'Satisfaction', 'Workload'],
    rows: [
      { name: 'Sarah Chen', role: 'RN Care Manager', caseload: '124', touches: '3.8', satisfaction: '4.6/5', workload: 'green' },
      { name: 'Mike Torres', role: 'RN Care Manager', caseload: '118', touches: '3.4', satisfaction: '4.4/5', workload: 'green' },
      { name: 'Lisa Park', role: 'LPN', caseload: '142', touches: '2.8', satisfaction: '4.2/5', workload: 'amber' },
      { name: 'James Wilson', role: 'RN Care Manager', caseload: '136', touches: '3.0', satisfaction: '4.3/5', workload: 'amber' },
      { name: 'Amy Rodriguez', role: 'RN Care Manager', caseload: '110', touches: '3.6', satisfaction: '4.5/5', workload: 'green' },
      { name: 'David Kim', role: 'LPN', caseload: '148', touches: '2.6', satisfaction: '4.0/5', workload: 'red' },
    ],
  },

  care_programs: {
    columns: ['Program', 'Enrolled', 'Eligible', 'Rate', 'Savings', 'ROI'],
    rows: [
      { program: 'Chronic Care Mgmt (CCM)', enrolled: '1,240', eligible: '2,100', rate: '59%', savings: '$1.62M', roi: '3.6x' },
      { program: 'Transitional Care (TCM)', enrolled: '680', eligible: '920', rate: '74%', savings: '$980K', roi: '3.5x' },
      { program: 'ED Diversion', enrolled: '412', eligible: '680', rate: '61%', savings: '$540K', roi: '3.0x' },
      { program: 'Post-Discharge Follow-Up', enrolled: '840', eligible: '1,120', rate: '75%', savings: '$660K', roi: '3.0x' },
      { program: 'Remote Patient Monitoring', enrolled: '320', eligible: '800', rate: '40%', savings: '$280K', roi: '2.4x' },
    ],
  },

  // Network
  referral_leakage: {
    columns: ['Specialty', 'Total Referrals', 'Out-of-Network', 'Leakage %', 'Est. Cost Impact'],
    rows: [
      { specialty: 'Cardiology', total: '412', oon: '148', leakage: '36%', cost: '$420K' },
      { specialty: 'Orthopedics', total: '386', oon: '124', leakage: '32%', cost: '$380K' },
      { specialty: 'Gastroenterology', total: '248', oon: '72', leakage: '29%', cost: '$210K' },
      { specialty: 'Neurology', total: '186', oon: '48', leakage: '26%', cost: '$165K' },
      { specialty: 'Pulmonology', total: '164', oon: '38', leakage: '23%', cost: '$125K' },
      { specialty: 'Endocrinology', total: '142', oon: '28', leakage: '20%', cost: '$100K' },
    ],
  },

  snf_scorecard: {
    columns: ['Facility', 'Admits', 'Avg LOS', 'Readmit %', 'Cost/Stay', 'Status'],
    rows: [
      { facility: 'Valley SNF', admits: '24', avg_los: '18.2d', readmit: '34%', cost: '$14,200', status: 'red' },
      { facility: 'Summit Post-Acute', admits: '18', avg_los: '15.6d', readmit: '19%', cost: '$12,400', status: 'amber' },
      { facility: 'Lakeview SNF', admits: '38', avg_los: '11.8d', readmit: '9%', cost: '$9,200', status: 'green' },
      { facility: 'Riverside SNF', admits: '42', avg_los: '12.4d', readmit: '12%', cost: '$9,800', status: 'green' },
      { facility: 'Meadow Creek SNF', admits: '28', avg_los: '13.2d', readmit: '14%', cost: '$10,400', status: 'green' },
    ],
  },

  // Shared Savings
  key_levers: {
    columns: ['Lever', 'Current', 'Target', 'Gap', 'Savings Impact', 'Status'],
    rows: [
      { lever: 'IP Admissions/1000', current: '287', target: '265', gap: '-22', impact: '$680K', status: 'amber' },
      { lever: '30-Day Readmit Rate', current: '18.4%', target: '15.0%', gap: '-3.4pp', impact: '$420K', status: 'red' },
      { lever: 'RAF Recapture Gap', current: '0.078', target: '0.030', gap: '-0.048', impact: '$2.1M', status: 'amber' },
      { lever: 'Quality Composite', current: '4.1/5', target: '4.5/5', gap: '-0.4', impact: '$340K', status: 'green' },
      { lever: 'Pharmacy PMPM', current: '$163', target: '$145', gap: '-$18', impact: '$1.8M', status: 'red' },
    ],
  },

  // Tool Usage
  adoption_by_provider: {
    columns: ['Provider', 'Weekly Active', 'Alerts Acted', 'HCC Gaps Closed', 'Avg Response Time', 'Status'],
    rows: [
      { provider: 'Dr. Patel', active: '5/5', alerts: '94%', gaps: '48', response: '1.2h', status: 'green' },
      { provider: 'Dr. Riverside', active: '5/5', alerts: '88%', gaps: '42', response: '1.8h', status: 'green' },
      { provider: 'Dr. Chen', active: '4/5', alerts: '82%', gaps: '36', response: '2.4h', status: 'green' },
      { provider: 'Dr. Wilson', active: '4/5', alerts: '76%', gaps: '32', response: '3.1h', status: 'amber' },
      { provider: 'Dr. Garcia', active: '3/5', alerts: '68%', gaps: '24', response: '4.2h', status: 'amber' },
      { provider: 'Dr. Thompson', active: '3/5', alerts: '62%', gaps: '20', response: '5.8h', status: 'amber' },
      { provider: 'Dr. Martinez', active: '2/5', alerts: '54%', gaps: '14', response: '8.2h', status: 'amber' },
      { provider: 'Dr. Brown', active: '1/5', alerts: '42%', gaps: '8', response: '12.4h', status: 'red' },
    ],
  },

  non_adopters: {
    columns: ['Provider', 'Practice', 'Members', 'Open HCC Gaps', 'Last Login', 'Outreach Status'],
    rows: [
      { provider: 'Dr. Adams', practice: 'Valley Primary Care', members: '86', gaps: '14', last_login: '62 days ago', outreach: 'Scheduled' },
      { provider: 'Dr. Baker', practice: 'Valley Primary Care', members: '92', gaps: '18', last_login: '48 days ago', outreach: 'Pending' },
      { provider: 'Dr. Clark', practice: 'Lakeview Health', members: '78', gaps: '12', last_login: '41 days ago', outreach: 'Scheduled' },
      { provider: 'Dr. Davis', practice: 'Summit Internal Med', members: '104', gaps: '22', last_login: '55 days ago', outreach: 'Contacted' },
      { provider: 'Dr. Evans', practice: 'Summit Internal Med', members: '68', gaps: '10', last_login: '38 days ago', outreach: 'Pending' },
      { provider: 'Dr. Foster', practice: 'Riverside Medical', members: '96', gaps: '16', last_login: '44 days ago', outreach: 'Scheduled' },
      { provider: 'Dr. Grant', practice: 'Riverside Medical', members: '82', gaps: '14', last_login: '52 days ago', outreach: 'Pending' },
      { provider: 'Dr. Harris', practice: 'Patel Family Med', members: '74', gaps: '8', last_login: '36 days ago', outreach: 'Contacted' },
      { provider: 'Dr. Irving', practice: 'Valley Primary Care', members: '88', gaps: '16', last_login: '60 days ago', outreach: 'Pending' },
      { provider: 'Dr. Johnson', practice: 'Lakeview Health', members: '64', gaps: '10', last_login: '42 days ago', outreach: 'Scheduled' },
      { provider: 'Dr. Kelly', practice: 'Summit Internal Med', members: '72', gaps: '12', last_login: '50 days ago', outreach: 'Pending' },
      { provider: 'Dr. Lopez', practice: 'Patel Family Med', members: '80', gaps: '14', last_login: '46 days ago', outreach: 'Scheduled' },
    ],
  },

  // Platform Ops
  data_quality: {
    columns: ['Dimension', 'Score', 'Threshold', 'Status'],
    rows: [
      { dimension: 'Completeness', score: '96.8%', threshold: '95%', status: 'green' },
      { dimension: 'Accuracy', score: '94.2%', threshold: '92%', status: 'green' },
      { dimension: 'Timeliness', score: '88.4%', threshold: '90%', status: 'amber' },
      { dimension: 'Consistency', score: '97.1%', threshold: '95%', status: 'green' },
      { dimension: 'Uniqueness', score: '99.2%', threshold: '98%', status: 'green' },
      { dimension: 'Validity', score: '93.8%', threshold: '90%', status: 'green' },
    ],
  },

  integration_status: {
    columns: ['System', 'Type', 'Uptime', 'Errors (7d)', 'Status'],
    rows: [
      { system: 'Epic EHR', type: 'HL7 / FHIR', uptime: '99.4%', errors: '3', status: 'green' },
      { system: 'Availity (Claims)', type: 'EDI 837/835', uptime: '99.8%', errors: '0', status: 'green' },
      { system: 'Surescripts (Rx)', type: 'NCPDP', uptime: '99.6%', errors: '1', status: 'green' },
      { system: 'HIE (ADT)', type: 'HL7 ADT', uptime: '92.1%', errors: '14', status: 'red' },
      { system: 'Quest (Labs)', type: 'HL7 ORU', uptime: '99.2%', errors: '2', status: 'green' },
      { system: 'DocuSign', type: 'REST API', uptime: '99.9%', errors: '0', status: 'green' },
      { system: 'Twilio (SMS)', type: 'REST API', uptime: '99.7%', errors: '1', status: 'green' },
    ],
  },

  // AI Analytics
  predictive_models: {
    columns: ['Model', 'AUC', 'Accuracy', 'Active Predictions', 'Last Retrained', 'Status'],
    rows: [
      { model: 'Readmission Risk (30-day)', auc: '0.84', accuracy: '89.2%', predictions: '842', retrained: '3 days ago', status: 'green' },
      { model: 'Rising Risk Prediction', auc: '0.81', accuracy: '86.4%', predictions: '1,240', retrained: '7 days ago', status: 'green' },
      { model: 'ED Utilization Forecast', auc: '0.79', accuracy: '84.8%', predictions: '620', retrained: '5 days ago', status: 'green' },
      { model: 'Medication Non-Adherence', auc: '0.77', accuracy: '82.1%', predictions: '1,480', retrained: '10 days ago', status: 'amber' },
      { model: 'Cost Outlier Detection', auc: '0.82', accuracy: '88.6%', predictions: '186', retrained: '2 days ago', status: 'green' },
    ],
  },

  // SDoH
  equity_by_race: {
    columns: ['Measure', 'White', 'Black', 'Hispanic', 'Asian', 'Other', 'Disparity Gap'],
    rows: [
      { measure: 'Diabetes HbA1c Control', white: '78%', black: '60%', hispanic: '64%', asian: '74%', other: '68%', gap: '18pp' },
      { measure: 'Blood Pressure Control', white: '70%', black: '54%', hispanic: '58%', asian: '68%', other: '62%', gap: '16pp' },
      { measure: 'AWV Completion', white: '68%', black: '52%', hispanic: '56%', asian: '64%', other: '58%', gap: '16pp' },
      { measure: 'Colorectal Screening', white: '64%', black: '48%', hispanic: '52%', asian: '62%', other: '54%', gap: '16pp' },
      { measure: 'Depression Screening', white: '86%', black: '78%', hispanic: '76%', asian: '84%', other: '80%', gap: '10pp' },
      { measure: 'Medication Adherence', white: '82%', black: '68%', hispanic: '70%', asian: '80%', other: '72%', gap: '14pp' },
    ],
  },

  sdoh_risk_factors: {
    columns: ['Risk Factor', 'Members', '% of Pop', 'TCOC Impact', 'Referral Rate'],
    rows: [
      { factor: 'Food Insecurity', members: '412', pct: '4.9%', tcoc_impact: '+$3,200 PMPM', referral_rate: '42%' },
      { factor: 'Housing Instability', members: '286', pct: '3.4%', tcoc_impact: '+$4,800 PMPM', referral_rate: '38%' },
      { factor: 'Transportation Barriers', members: '348', pct: '4.1%', tcoc_impact: '+$2,100 PMPM', referral_rate: '56%' },
      { factor: 'Social Isolation', members: '524', pct: '6.2%', tcoc_impact: '+$1,800 PMPM', referral_rate: '28%' },
      { factor: 'Health Literacy', members: '680', pct: '8.1%', tcoc_impact: '+$1,400 PMPM', referral_rate: '34%' },
    ],
  },

  community_referrals: {
    columns: ['Organization', 'Service', 'Referrals', 'Completion', 'Status'],
    rows: [
      { org: 'Regional Food Bank', service: 'Food assistance', referrals: '186', completion: '78%', status: 'green' },
      { org: 'Habitat for Humanity', service: 'Housing support', referrals: '42', completion: '62%', status: 'amber' },
      { org: 'MedRide Transport', service: 'Medical transport', referrals: '124', completion: '84%', status: 'green' },
      { org: 'Senior Services Agency', service: 'Social connection', referrals: '96', completion: '58%', status: 'amber' },
      { org: 'Community Health Workers', service: 'Navigation', referrals: '218', completion: '72%', status: 'green' },
      { org: 'Legal Aid Society', service: 'Benefits enrollment', referrals: '64', completion: '48%', status: 'red' },
    ],
  },

  // Population
  actionable_member_lists: {
    columns: ['Cohort', 'Members', 'Avg TCOC', 'Avg RAF', 'Top Conditions'],
    rows: [
      { cohort: 'High Cost Claimants (>$50K)', members: '50', avg_tcoc: '$68,400', avg_raf: '2.14', conditions: 'CHF, ESRD, Cancer' },
      { cohort: 'High ED Utilizers (\u22654 visits)', members: '89', avg_tcoc: '$32,100', avg_raf: '1.68', conditions: 'COPD, Anxiety, DM' },
      { cohort: 'Rising Risk (Tier 2\u21923 predicted)', members: '187', avg_tcoc: '$14,200', avg_raf: '1.12', conditions: 'HTN, Pre-DM, Obesity' },
      { cohort: 'SDoH Risk \u2014 No Screening', members: '412', avg_tcoc: '$11,800', avg_raf: '0.98', conditions: 'Various' },
      { cohort: 'Zero Engagement (12 mo)', members: '634', avg_tcoc: '$9,200', avg_raf: '0.87', conditions: 'Unknown \u2014 no claims' },
    ],
  },
};


// ═══════════════════════════════════════════════════════════
// PROGRESS BARS
// ═══════════════════════════════════════════════════════════

export const FALLBACK_PROGRESS_BARS = {
  risk_tiers: [
    { label: 'Tier 1 \u2014 Healthy', value: '3,200 (38%)', pct: 95, color: 'green' },
    { label: 'Tier 2 \u2014 Low Risk', value: '2,020 (24%)', pct: 60, color: 'green' },
    { label: 'Tier 3 \u2014 Rising Risk', value: '1,684 (20%)', pct: 50, color: 'amber' },
    { label: 'Tier 4 \u2014 High Risk', value: '1,010 (12%)', pct: 30, color: 'red' },
    { label: 'Tier 5 \u2014 Very High', value: '506 (6%)', pct: 15, color: 'red' },
  ],

  chronic_conditions: [
    { label: 'Hypertension', value: '3,410 (41%)', pct: 90.2, color: 'purple' },
    { label: 'Type 2 Diabetes', value: '2,812 (33%)', pct: 72.6, color: 'purple' },
    { label: 'CKD', value: '1,240 (15%)', pct: 33, color: 'purple' },
    { label: 'COPD / Asthma', value: '1,104 (13%)', pct: 28.6, color: 'purple' },
    { label: 'CHF', value: '892 (11%)', pct: 24.2, color: 'purple' },
  ],

  hcc_recapture: [
    { label: 'Patel Family Medicine', value: '74% closure', pct: 74, color: 'green', sub: 'Highest closure rate \u2014 218 of 294 suspects' },
    { label: 'Riverside Medical Group', value: '68% closure', pct: 68, color: 'green', sub: 'Consistent performer \u2014 312 of 459 suspects' },
    { label: 'Lakeview Health Partners', value: '62% closure', pct: 62, color: 'amber', sub: 'Improving trend \u2014 up 8pp QoQ' },
    { label: 'Summit Internal Medicine', value: '54% closure', pct: 54, color: 'amber', sub: 'Below target \u2014 scheduling gaps identified' },
    { label: 'Valley Primary Care', value: '41% closure', pct: 41, color: 'red', sub: 'Lowest closure rate \u2014 186 of 454 suspects' },
  ],

  tcm_impact: [
    { label: '30-Day Readmit (Pre-TCM)', value: '18.4%', pct: 74, color: 'red', sub: 'Baseline before TCM enrollment' },
    { label: '30-Day Readmit (Post-TCM)', value: '10.7%', pct: 43, color: 'green', sub: '42% reduction with TCM \u2014 7.7pp improvement' },
    { label: 'ED Visits (Pre-TCM)', value: '342/1000', pct: 68, color: 'amber', sub: 'Baseline ED utilization' },
    { label: 'ED Visits (Post-TCM)', value: '218/1000', pct: 44, color: 'green', sub: '36% reduction \u2014 primarily avoidable visits' },
    { label: '48-Hour Follow-Up Rate', value: '89%', pct: 89, color: 'green', sub: 'Target: 85% \u2014 exceeding benchmark' },
    { label: 'TCM Enrollment Coverage', value: '62%', pct: 62, color: 'amber', sub: 'Target: 80% \u2014 expansion opportunity' },
  ],

  readmission_rates: [
    { label: 'Overall Readmit Rate', value: '18.4%', pct: 73.6, color: 'red', sub: 'Benchmark: 15.2% \u00b7 +2.8pp above target' },
    { label: 'CHF Readmit Rate', value: '24.1%', pct: 80.3, color: 'red', sub: 'Highest rate \u2014 concentrated at Valley SNF' },
    { label: 'COPD Readmit Rate', value: '19.8%', pct: 79.2, color: 'amber', sub: 'Improved from 22.4% after pulmonary rehab program' },
    { label: 'Pneumonia Readmit Rate', value: '12.1%', pct: 48.4, color: 'green', sub: 'Below benchmark (14.8%)' },
  ],

  pharmacy_cost: [
    { label: 'Total Pharmacy PMPM', value: '$163', pct: 82, color: 'red', sub: 'Benchmark: $140 \u00b7 +$23 above' },
    { label: 'GLP-1 (Ozempic/Mounjaro)', value: '$42 PMPM', pct: 42, color: 'red', sub: '+68% YoY \u2014 312 members on therapy' },
    { label: 'Specialty Drugs', value: '$38 PMPM', pct: 38, color: 'amber', sub: '+12% YoY \u2014 biosimilar substitution opportunity' },
    { label: 'Generic Utilization', value: '89%', pct: 89, color: 'green', sub: 'Target: 92% \u2014 3pp gap = $180K annual savings' },
  ],

  quality_composite: [
    { label: 'Annual Wellness Visit (AWV)', value: '61%', pct: 61, color: 'amber', sub: 'Weight: 20% \u00b7 Target: 80%' },
    { label: 'Diabetes HbA1c Control', value: '72%', pct: 72, color: 'amber', sub: 'Weight: 20% \u00b7 Target: 80%' },
    { label: 'Controlling Blood Pressure', value: '64%', pct: 64, color: 'amber', sub: 'Weight: 20% \u00b7 Target: 75%' },
    { label: 'Colorectal Cancer Screening', value: '58%', pct: 58, color: 'red', sub: 'Weight: 15% \u00b7 Target: 70%' },
    { label: 'Depression Screening (PHQ-9)', value: '83%', pct: 83, color: 'green', sub: 'Weight: 15% \u00b7 Target: 85%' },
    { label: 'Medication Adherence', value: '77%', pct: 77, color: 'amber', sub: 'Weight: 10% \u00b7 Target: 80%' },
  ],

  care_quality_metrics: [
    { label: 'Care Plan Completion', value: '84%', pct: 84, color: 'green', sub: 'Target: 80% \u2014 exceeding benchmark' },
    { label: 'Medication Reconciliation', value: '78%', pct: 78, color: 'amber', sub: 'Target: 85% \u2014 7pp below target' },
    { label: 'Patient Satisfaction (CAHPS)', value: '4.2/5', pct: 84, color: 'green', sub: 'Top quartile nationally' },
    { label: 'Documentation Compliance', value: '92%', pct: 92, color: 'green', sub: 'Target: 90% \u2014 audit-ready' },
    { label: 'Timely Follow-Up (<72h)', value: '76%', pct: 76, color: 'amber', sub: 'Target: 80% \u2014 improving trend' },
  ],
};


// ═══════════════════════════════════════════════════════════
// CONFIGS
// ═══════════════════════════════════════════════════════════

export const FALLBACK_CONFIGS = {
  roi_levers: {
    levers: [
      { key: 'raf', label: 'RAF Recapture', sub: 'HCC suspect closure rate improvement', default: 50, unit: '%', multiplier: 42000 },
      { key: 'tcoc', label: 'TCOC Reduction', sub: 'Total cost of care PMPM reduction', default: 30, unit: '%', multiplier: 28000 },
      { key: 'quality', label: 'Quality Improvement', sub: 'Quality composite score increase', default: 40, unit: '%', multiplier: 21000 },
      { key: 'members', label: 'Member Count Growth', sub: 'Attributed lives increase', default: 50, unit: '%', multiplier: 14000 },
      { key: 'readmit', label: 'Readmission Reduction', sub: '30-day readmission rate decrease', default: 35, unit: '%', multiplier: 12000 },
      { key: 'pharmacy', label: 'Pharmacy Cost Reduction', sub: 'Pharmacy PMPM decrease', default: 25, unit: '%', multiplier: 18000 },
    ],
    baselines: {
      totalSavings: 1200000,
      roi: 2.8,
      netRevenue: 890000,
      tcocPmpm: 890,
      readmitRate: 18.4,
      qualityScore: 4.1,
      investmentBase: 1200000,
      netRevenueMultiplier: 0.65,
      tcocReducePerPct: 2.8,
      readmitReducePerPct: 0.08,
      qualityGainPerPct: 0.009,
    },
  },

  pipeline_health: {
    pipelines: [
      { name: 'Claims Feed', status: 'ok', info: 'Last sync: 2.1h ago \u00b7 12,480 records \u00b7 No errors' },
      { name: 'EHR Integration', status: 'ok', info: 'Last sync: 18 min ago \u00b7 Real-time \u00b7 99.4% uptime' },
      { name: 'Eligibility Feed', status: 'ok', info: 'Last sync: 6h ago \u00b7 Daily batch \u00b7 8,420 members' },
      { name: 'ADT Feed', status: 'warn', info: 'DEGRADED \u2014 Last sync: 18.2h ago \u00b7 SLA breach \u00b7 Investigating' },
      { name: 'Lab Results', status: 'ok', info: 'Last sync: 1.4h ago \u00b7 2,840 results \u00b7 No errors' },
      { name: 'Pharmacy Feed', status: 'ok', info: 'Last sync: 3.2h ago \u00b7 6,200 scripts \u00b7 No errors' },
      { name: 'SDoH Screening', status: 'ok', info: 'Last sync: 12h ago \u00b7 Weekly batch \u00b7 412 screenings' },
    ],
  },

  nlq_examples: {
    examples: [
      { title: 'Which patients are at highest readmission risk?', desc: 'Predictive model identifies top 50 patients by 30-day readmission probability' },
      { title: 'Show me RAF recapture opportunities by practice', desc: 'HCC suspects grouped by PCP with revenue impact estimates' },
      { title: 'What drove the TCOC increase this quarter?', desc: 'Cost variance decomposition by setting, DRG, and provider' },
      { title: 'Compare quality measure trends year-over-year', desc: 'All 13 quality measures with YoY change and gap-to-target' },
    ],
  },

  anomalies: {
    anomalies: [
      { title: 'ED Utilization Spike \u2014 Valley Primary Care', desc: 'ED visits increased 34% in the past 2 weeks. 12 patients with 3+ visits. Pattern suggests possible care gap.', severity: 'red', border: 'var(--status-error)' },
      { title: 'Claims Processing Delay \u2014 Availity', desc: 'Claims batch processing time increased from 2.1h to 4.8h. Investigating potential EDI mapping issue.', severity: 'amber', border: 'var(--status-warning)' },
      { title: 'RAF Score Drop \u2014 Riverside Medical', desc: 'Average RAF decreased 0.04 this month. 18 members lost HCC codes at recertification. Review coding accuracy.', severity: 'amber', border: 'var(--status-warning)' },
    ],
  },

  action_rules_data: {
    inline: [
      { trigger: 'AWV Due Alert', action: 'Show scheduling prompt with open slots when provider opens chart' },
      { trigger: 'HCC Suspect Detected', action: 'Display suspect condition with suggested ICD-10 codes in sidebar' },
      { trigger: 'Medication Gap', action: 'Alert provider to adherence gap with refill recommendation' },
      { trigger: 'Quality Gap Open', action: 'Surface gap closure opportunity during visit with order set' },
    ],
    automated: [
      { trigger: 'ADT Discharge Alert', action: 'Auto-create TCM task, assign care manager, send patient SMS within 2h' },
      { trigger: 'ED Visit Notification', action: 'Flag member, update risk score, notify PCP and care team via inbox' },
      { trigger: 'Claims Threshold ($10K)', action: 'Auto-escalate to case review queue with cost summary attached' },
      { trigger: 'Eligibility Change', action: 'Update member status, pause outreach, notify assigned care manager' },
    ],
    agent: [
      { trigger: 'Predicted Readmission (>70%)', action: 'Generate intervention plan, schedule nurse outreach, prep med reconciliation' },
      { trigger: 'Anomaly: Cost Spike', action: 'Auto-investigate root cause, draft summary narrative, flag for review' },
      { trigger: 'SDoH Risk Identified', action: 'Match community resources, draft referral, queue for care manager approval' },
    ],
  },

  care_productivity_strip: {
    metrics: [
      { label: 'Calls Made', val: '1,842', target: '2,000' },
      { label: 'Contacts Reached', val: '1,284', target: '1,400' },
      { label: 'Touches / Member', val: '3.2', target: '4.0' },
      { label: 'CCM Minutes', val: '12,480', target: '14,000' },
      { label: 'TCM 48h Rate', val: '89%', target: '85%' },
      { label: 'Follow-Up Rate', val: '76%', target: '80%' },
    ],
  },

  // ── Executive: Cost by Setting inline cards ──
  exec_cost_by_setting_inline: {
    items: [
      { label: 'IP', value: '$318', color: 'var(--status-info)', note: '\u2191 $23 over' },
      { label: 'OP', value: '$142', color: 'var(--status-info-light)', note: '\u2713 Benching' },
      { label: 'ED', value: '$88', color: 'var(--status-warning)', note: '\u2191 $8 over' },
      { label: 'Rx', value: '$163', color: 'var(--status-error)', note: '\u2191 $23 over' },
      { label: 'PAC', value: '$106', color: 'var(--status-success)', note: '\u2713 $9 under' },
      { label: 'Prof', value: '$205', color: 'var(--primary-300)', note: '\u2713 $15 under' },
    ],
  },

  // ── Executive: Savings trajectory (12 monthly values in $M) ──
  exec_savings_trajectory: {
    data_points: [0, 0.1, 0.2, 0.35, 0.5, 0.62, 0.75, 0.9, 1.0, 1.1, 1.2, 1.32],
  },

  // ── Executive: Care program command center ──
  exec_care_programs: {
    rows: [
      { abbr: 'CCM', members: '4,823', saved: '$1,620K', roi: '3.6x', status: 'green', alert: '312 eligible members not yet enrolled' },
      { abbr: 'TCM', members: '2,156', saved: '$980K', roi: '3.5x', status: 'green', alert: '47 overdue TCM contacts' },
      { abbr: 'TOC-IP', members: '1,284', saved: '$740K', roi: '3.9x', status: 'amber', alert: '24 readmissions this month' },
      { abbr: 'TOC-ED', members: '1,842', saved: '$540K', roi: '3.0x', status: 'red', alert: '221 high-ED utilizers (3+/yr)' },
      { abbr: 'Quality', members: '8,420', saved: '$840K', roi: '3.8x', status: 'green', alert: '847 members unscheduled for AWV' },
      { abbr: 'AWV', members: '5,120', saved: '$620K', roi: '3.9x', status: 'red', alert: '847 members overdue for AWV' },
      { abbr: 'Risk Coding', members: '5,280', saved: '$2,100K', roi: '5.5x', status: 'red', alert: '962 open HCC suspects' },
      { abbr: 'HRA', members: '3,840', saved: '$410K', roi: '4.6x', status: 'red', alert: '4,580 eligible without HRA' },
    ],
  },
};
