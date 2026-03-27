import React, { useState, useRef, useCallback } from 'react';
import { Icon } from '../../components/Icon/Icon';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { useAppStore } from '../../store/useAppStore';
import { PAGES, VIEW_TITLES } from './analyticsData';
import { ExecutiveView } from './views/ExecutiveView';
import { PopulationView } from './views/PopulationView';
import { FinancialView } from './views/FinancialView';
import { RiskView } from './views/RiskView';
import { QualityView } from './views/QualityView';
import { UtilizationView } from './views/UtilizationView';
import { CareView } from './views/CareView';
import { NetworkView } from './views/NetworkView';
import { SharedSavingsView } from './views/SharedSavingsView';
import { RoiView } from './views/RoiView';
import { ToolUsageView } from './views/ToolUsageView';
import { PlatformOpsView } from './views/PlatformOpsView';
import { AiAnalyticsView } from './views/AiAnalyticsView';
import { SdohView } from './views/SdohView';
import { ActionRulesView } from './views/ActionRulesView';
import s from './AnalyticsLayout.module.css';

class ViewErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div style={{ padding: 24, color: 'var(--neutral-300)', fontSize: 14 }}>
        Something went wrong loading this view.
      </div>
    );
    return this.props.children;
  }
}

const VIEW_MAP = {
  executive: ExecutiveView, population: PopulationView, financial: FinancialView,
  risk: RiskView, quality: QualityView, utilization: UtilizationView,
  care: CareView, network: NetworkView, shared: SharedSavingsView,
  roi: RoiView, tools: ToolUsageView, platformops: PlatformOpsView,
  aianalytics: AiAnalyticsView, sdoh: SdohView, actionrules: ActionRulesView,
};

const PERIODS = [
  { value: '2026-03', label: 'Mar 2026' },
  { value: '2026-02', label: 'Feb 2026' },
  { value: '2026-01', label: 'Jan 2026' },
  { value: 'Q1-2026', label: 'Q1 2026' },
  { value: 'YTD-2026', label: 'YTD 2026' },
  { value: '2025-12', label: 'Dec 2025' },
];

const PRACTICES = [
  { value: 'all', label: 'All Practices' },
  { value: 'patel', label: 'Patel Family Medicine' },
  { value: 'riverside', label: 'Riverside Medical Group' },
  { value: 'valley', label: 'Valley Primary Care' },
  { value: 'lakeview', label: 'Lakeview Health Partners' },
  { value: 'summit', label: 'Summit Internal Medicine' },
];

export function AnalyticsLayout() {
  const [view, setView] = useState('executive');
  const showToast = useAppStore(st => st.showToast);
  const canvasRef = useRef(null);
  const ViewComponent = VIEW_MAP[view] || ExecutiveView;
  const meta = VIEW_TITLES[view] || VIEW_TITLES.executive;

  const analyticsPeriod = useAppStore(st => st.analyticsPeriod);
  const analyticsPractice = useAppStore(st => st.analyticsPractice);
  const setAnalyticsPeriod = useAppStore(st => st.setAnalyticsPeriod);
  const setAnalyticsPractice = useAppStore(st => st.setAnalyticsPractice);

  const switchView = useCallback((id) => {
    setView(id);
    canvasRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className={s.wrap}>
      {/* ── Page Navigator ── */}
      <aside className={s.pageNav}>
        <div className={s.pnHeader}>Report Pages</div>
        <div className={s.pnScroll}>
          {PAGES.map(sec => (
            <div key={sec.section}>
              <div className={s.pnSection}>{sec.section}</div>
              {sec.items.map(p => (
                <button
                  key={p.id}
                  className={`${s.pnItem} ${view === p.id ? s.active : ''}`}
                  onClick={() => switchView(p.id)}
                >
                  <Icon name={p.icon} size={16} color={view === p.id ? 'var(--primary-300)' : 'var(--grey-300)'} />
                  {p.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Canvas ── */}
      <div className={s.canvas} ref={canvasRef}>
        {/* Recency bar */}
        <div className={s.recency}>
          <span className={`${s.recDot} ${s.ok}`} />
          <span className={s.recLabel}>Claims</span>
          <span>2h ago</span>
          <span className={s.recSep} />
          <span className={`${s.recDot} ${s.ok}`} />
          <span className={s.recLabel}>EHR</span>
          <span>45m ago</span>
          <span className={s.recSep} />
          <span className={`${s.recDot} ${s.warn}`} />
          <span className={s.recLabel}>ADT</span>
          <span style={{ color: 'var(--status-warning)' }}>18h ago</span>
          <span className={s.recSep} />
          <span className={`${s.recDot} ${s.ok}`} />
          <span className={s.recLabel}>Labs</span>
          <span>3h ago</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--neutral-200)' }}>
            Last full refresh: Today 6:00 AM
          </span>
        </div>

        {/* View header + global filters */}
        <div className={s.viewHeader}>
          <div style={{ flex: 1 }}>
            <div className={s.viewTitle}>{meta.title}</div>
            <div className={s.viewSub}>{meta.sub}</div>
          </div>
          <div className={s.filterBar}>
            <Select value={analyticsPeriod} onValueChange={setAnalyticsPeriod}>
              <SelectTrigger className={s.filterSelect}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={analyticsPractice} onValueChange={setAnalyticsPractice}>
              <SelectTrigger className={s.filterSelect}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRACTICES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <button className={s.filterBtn} onClick={() => showToast('Exporting report...')}>
              <Icon name="solar:download-minimalistic-linear" size={14} />
              Export
            </button>
          </div>
        </div>

        {/* Active view */}
        <ViewErrorBoundary key={view}>
          <ViewComponent showToast={showToast} />
        </ViewErrorBoundary>
      </div>
    </div>
  );
}
