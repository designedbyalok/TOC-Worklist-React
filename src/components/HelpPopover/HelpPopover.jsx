import { useEffect, useRef } from 'react';
import { Icon } from '../Icon/Icon';
import { useAppStore } from '../../store/useAppStore';
import styles from './HelpPopover.module.css';

const FEATURES = [
  {
    group: 'Home',
    items: [
      {
        icon: 'solar:home-2-linear',
        crumbs: ['Home', 'Dashboard'],
        description: 'Draggable, resizable overview of alerts, tasks, calendar, and notes.',
        page: 'home',
      },
    ],
  },
  {
    group: 'Population',
    items: [
      {
        icon: 'solar:clipboard-list-linear',
        crumbs: ['Population', 'TOC Worklist'],
        description: 'Prioritized worklist of patients in transition of care.',
        page: 'population',
        tab: 'toc-worklist',
      },
      {
        icon: 'solar:users-group-two-rounded-linear',
        crumbs: ['Population', 'TOC Queue'],
        description: 'Queue of patients awaiting agent-led outreach.',
        page: 'population',
        tab: 'toc-queue',
      },
      {
        icon: 'solar:document-medicine-linear',
        crumbs: ['Population', 'HCC Coding'],
        description: 'Hierarchical Condition Categories for risk adjustment.',
        page: 'population',
        tab: 'hcc',
      },
    ],
  },
  {
    group: 'Analytics',
    items: [
      {
        icon: 'solar:presentation-graph-linear',
        crumbs: ['Analytics', 'Executive'],
        description: 'High-level KPIs and organizational performance.',
        page: 'analytics',
        analyticsView: 'executive',
      },
      {
        icon: 'solar:heart-pulse-linear',
        crumbs: ['Analytics', 'Care'],
        description: 'Clinical outcomes and care delivery metrics.',
        page: 'analytics',
        analyticsView: 'care',
      },
      {
        icon: 'solar:dollar-minimalistic-linear',
        crumbs: ['Analytics', 'Financial'],
        description: 'Revenue, costs, and shared savings performance.',
        page: 'analytics',
        analyticsView: 'financial',
      },
      {
        icon: 'solar:pie-chart-2-linear',
        crumbs: ['Analytics', 'Population'],
        description: 'Member counts and demographic segmentation.',
        page: 'analytics',
        analyticsView: 'population',
      },
      {
        icon: 'solar:shield-warning-linear',
        crumbs: ['Analytics', 'Risk'],
        description: 'Risk stratification and HCC distribution insights.',
        page: 'analytics',
        analyticsView: 'risk',
      },
      {
        icon: 'solar:chart-square-linear',
        crumbs: ['Analytics', 'Utilization'],
        description: 'ED visits, admissions, and service usage patterns.',
        page: 'analytics',
        analyticsView: 'utilization',
      },
      {
        icon: 'solar:medal-star-linear',
        crumbs: ['Analytics', 'Quality'],
        description: 'Quality measure performance and gap tracking.',
        page: 'analytics',
        analyticsView: 'quality',
      },
      {
        icon: 'solar:home-smile-linear',
        crumbs: ['Analytics', 'SDOH'],
        description: 'Social determinants and community risk factors.',
        page: 'analytics',
        analyticsView: 'sdoh',
      },
      {
        icon: 'solar:share-linear',
        crumbs: ['Analytics', 'Network'],
        description: 'Provider network performance and referral flow.',
        page: 'analytics',
        analyticsView: 'network',
      },
      {
        icon: 'solar:magic-stick-3-linear',
        crumbs: ['Analytics', 'AI Analytics'],
        description: 'Agent performance and automation insights.',
        page: 'analytics',
        analyticsView: 'ai',
      },
      {
        icon: 'solar:widget-linear',
        crumbs: ['Analytics', 'Tool Usage'],
        description: 'Platform feature adoption and user engagement.',
        page: 'analytics',
        analyticsView: 'tool-usage',
      },
      {
        icon: 'solar:bolt-linear',
        crumbs: ['Analytics', 'Action Rules'],
        description: 'Automated rule triggers and compliance tracking.',
        page: 'analytics',
        analyticsView: 'action-rules',
      },
    ],
  },
  {
    group: 'Calendar',
    items: [
      {
        icon: 'solar:calendar-linear',
        crumbs: ['Calendar', 'Scheduling'],
        description: 'View and schedule patient appointments by type.',
        page: 'calendar',
      },
    ],
  },
  {
    group: 'Settings',
    items: [
      {
        icon: 'solar:chat-square-like-linear',
        crumbs: ['Settings', 'Agents'],
        description: 'Configure AI agents for automated outreach.',
        page: 'settings',
        settingsNavItem: 'agents',
      },
      {
        icon: 'solar:routing-linear',
        crumbs: ['Settings', 'Agent Builder'],
        description: 'Visual flow editor for custom agent workflows.',
        page: 'settings',
        settingsNavItem: 'agents',
      },
      {
        icon: 'solar:letter-linear',
        crumbs: ['Settings', 'Messages'],
        description: 'Manage SMS templates and message groups.',
        page: 'settings',
        settingsNavItem: 'messages',
      },
      {
        icon: 'solar:widget-add-linear',
        crumbs: ['Settings', 'Embedded Components'],
        description: 'Domain registry and CRM widget configuration.',
        page: 'settings',
        settingsNavItem: 'embedded-components',
      },
      {
        icon: 'solar:user-circle-linear',
        crumbs: ['Settings', 'Account'],
        description: 'Organization profile, billing, and API credentials.',
        page: 'settings',
        settingsNavItem: 'account',
      },
    ],
  },
];

export function HelpPopover({ onClose }) {
  const setActivePage = useAppStore(s => s.setActivePage);
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const setCurrentPage = useAppStore(s => s.setCurrentPage);
  const setSettingsNavItem = useAppStore(s => s.setSettingsNavItem);
  const setAnalyticsView = useAppStore(s => s.setAnalyticsView);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onEsc = (e) => { if (e.key === 'Escape') onClose(); };
    const t = setTimeout(() => document.addEventListener('click', handler), 0);
    document.addEventListener('keydown', onEsc);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  const handleNavigate = (item) => {
    setActivePage(item.page);
    setCurrentPage(1);
    if (item.tab) setActiveTab(item.tab);
    if (item.settingsNavItem) setSettingsNavItem(item.settingsNavItem);
    if (item.analyticsView) setAnalyticsView(item.analyticsView);
    onClose();
  };

  return (
    <div ref={ref} className={styles.popover} onClick={e => e.stopPropagation()} role="dialog" aria-label="Platform features">
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Icon name="solar:compass-linear" size={16} color="var(--primary-300)" />
          Platform features
        </div>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <Icon name="solar:close-circle-linear" size={18} />
        </button>
      </div>
      <div className={styles.body}>
        {FEATURES.map(section => (
          <div key={section.group} className={styles.group}>
            <div className={styles.groupLabel}>{section.group}</div>
            {section.items.map((item, i) => (
              <button
                key={`${section.group}-${i}`}
                className={styles.item}
                onClick={() => handleNavigate(item)}
              >
                <div className={styles.itemIcon}>
                  <Icon name={item.icon} size={16} />
                </div>
                <div className={styles.itemContent}>
                  <div className={styles.breadcrumb}>
                    {item.crumbs.map((c, idx) => (
                      <span key={idx}>
                        {idx > 0 && <span className={styles.crumbSep}>/</span>}
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className={styles.description}>{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
