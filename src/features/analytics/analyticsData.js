// ─── Analytics Data & Constants ───

export const PAGES = [
  { section: 'OVERVIEW', items: [
    { id: 'executive', label: 'Executive Dashboard', icon: 'solar:chart-2-linear' },
  ]},
  { section: 'ANALYTICS', items: [
    { id: 'population', label: 'Population Overview', icon: 'solar:users-group-two-rounded-linear' },
    { id: 'financial', label: 'Financial Analytics', icon: 'solar:wallet-2-linear' },
    { id: 'risk', label: 'Risk & Revenue', icon: 'solar:shield-warning-linear' },
    { id: 'quality', label: 'Quality Management', icon: 'solar:verified-check-linear' },
    { id: 'utilization', label: 'Utilization Mgmt', icon: 'solar:hospital-linear' },
  ]},
  { section: 'CARE PROGRAMS', items: [
    { id: 'care', label: 'Care Management', icon: 'solar:clipboard-text-linear' },
    { id: 'network', label: 'Network Analytics', icon: 'solar:global-linear' },
  ]},
  { section: 'BUSINESS OUTCOMES', items: [
    { id: 'shared', label: 'Shared Savings', icon: 'solar:hand-money-linear' },
    { id: 'roi', label: 'ROI & Simulators', icon: 'solar:calculator-linear' },
  ]},
  { section: 'OPERATIONS', items: [
    { id: 'tools', label: 'Tool Usage', icon: 'solar:widget-2-linear' },
    { id: 'platformops', label: 'Platform Ops', icon: 'solar:server-2-linear' },
    { id: 'aianalytics', label: 'AI Analytics', icon: 'solar:magic-stick-3-linear' },
    { id: 'sdoh', label: 'SDoH & Equity', icon: 'solar:heart-pulse-2-linear' },
    { id: 'actionrules', label: 'Action Rules', icon: 'solar:bolt-circle-linear' },
  ]},
];

export const VIEW_TITLES = {
  executive:    { title: 'Executive Dashboard', sub: 'KPIs, trends & priorities' },
  population:   { title: 'Population Overview', sub: 'Risk stratification & chronic conditions' },
  financial:    { title: 'Financial Analytics', sub: 'TCOC, PMPM & benchmark comparisons' },
  risk:         { title: 'Risk & Revenue', sub: 'RAF scores, HCC suspects & coding accuracy' },
  quality:      { title: 'Quality Management', sub: 'HEDIS measures, gap closure & performance' },
  utilization:  { title: 'Utilization Management', sub: 'Admissions, readmissions, ED & SNF' },
  care:         { title: 'Care Management', sub: 'Program ROI, productivity & team metrics' },
  network:      { title: 'Network Analytics', sub: 'Provider scorecards & referral leakage' },
  shared:       { title: 'Shared Savings', sub: 'MSSP benchmark & trajectory' },
  roi:          { title: 'ROI & Simulators', sub: 'What-if modeling & scenario planning' },
  tools:        { title: 'Tool Usage', sub: 'Sidecar adoption & automation performance' },
  platformops:  { title: 'Platform Ops', sub: 'Data pipeline health & integration uptime' },
  aianalytics:  { title: 'AI Analytics', sub: 'Fold Unity NLQ, anomalies & predictions' },
  sdoh:         { title: 'SDoH & Equity', sub: 'Social determinants & health equity' },
  actionrules:  { title: 'Action Rules', sub: 'Automated rules engine & agent workflows' },
};

export const QUALITY_MEASURES = [
  { name: 'Annual Wellness Visit (AWV)', rate: 61, target: 80, tag: 'Stars', trend: 'up' },
  { name: 'Diabetes HbA1c Control (<8%)', rate: 72, target: 80, tag: 'HEDIS', trend: 'flat' },
  { name: 'Controlling Blood Pressure', rate: 64, target: 75, tag: 'ACO', trend: 'down' },
  { name: 'Colorectal Cancer Screening', rate: 58, target: 70, tag: 'Stars', trend: 'up' },
  { name: 'Breast Cancer Screening', rate: 71, target: 80, tag: 'HEDIS', trend: 'up' },
  { name: 'Depression Screening (PHQ-9)', rate: 83, target: 85, tag: 'ACO', trend: 'up' },
  { name: 'Statin Therapy (ASCVD)', rate: 71, target: 80, tag: 'Stars', trend: 'flat' },
  { name: 'Medication Adherence – Diabetes', rate: 78, target: 80, tag: 'Stars', trend: 'up' },
  { name: 'Medication Adherence – HTN', rate: 75, target: 80, tag: 'Stars', trend: 'flat' },
  { name: 'Medication Adherence – Statins', rate: 77, target: 80, tag: 'Stars', trend: 'up' },
  { name: 'Fall Risk Assessment (65+)', rate: 44, target: 60, tag: 'HEDIS', trend: 'down' },
  { name: 'Care Plan After Discharge', rate: 62, target: 75, tag: 'ACO', trend: 'up' },
  { name: 'Tobacco Cessation Counseling', rate: 69, target: 80, tag: 'HEDIS', trend: 'flat' },
];
