import { Icon } from '../../../components/Icon/Icon';
import { Button } from '../../../components/Button/Button';
import { useAppStore } from '../../../store/useAppStore';
import s from '../AnalyticsLayout.module.css';

// ─── Safe data extractors ───
// fetchProgressBars returns { items: [...] } from DB, but fallback is a plain array.
export function safeBarItems(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

// fetchConfig returns { configData: {...} } from DB, but fallback is the config object directly.
export function safeConfigData(data, fallback) {
  if (!data) return fallback || {};
  // DB shape: { configData: { ... } }
  if (data.configData && typeof data.configData === 'object') return data.configData;
  // Fallback shape: the config object itself (has domain-specific keys like levers, pipelines, etc.)
  return data;
}

// fetchViewTable returns { rows: [...] } from both DB and fallback, but guard anyway.
export function safeTableRows(data, fallbackRows) {
  if (!data) return fallbackRows || [];
  if (Array.isArray(data.rows)) return data.rows;
  if (Array.isArray(data)) return data;
  return fallbackRows || [];
}

// ─── KPI Card ───
export function KpiCard({ value, label, delta, deltaType = 'pos', sub, accentColor }) {
  return (
    <div className={s.kpiCard}>
      <div className={s.kpiEyebrow}>{label}</div>
      <div className={s.kpiHero}>{value}</div>
      {delta && (
        <span className={`${s.kpiDelta} ${s[deltaType]}`}>
          {deltaType === 'pos' ? (
            <Icon name="solar:alt-arrow-up-linear" size={10} />
          ) : deltaType === 'neg' ? (
            <Icon name="solar:alt-arrow-down-linear" size={10} />
          ) : (
            <Icon name="solar:minus-circle-linear" size={10} />
          )} {delta}
        </span>
      )}
      {sub && <div className={s.kpiSub}>{sub}</div>}
      {accentColor && <div className={s.kpiAccent} style={{ background: accentColor }} />}
    </div>
  );
}

// ─── Insight Banner ───
export function InsightBanner({ icon, title, text, variant = '', buttons = [], showToast }) {
  const setAnalyticsView = useAppStore(st => st.setAnalyticsView);

  const handleButtonClick = (b) => {
    if (b.navTo) {
      setAnalyticsView(b.navTo);
    } else {
      showToast?.(b.toast || b.label);
    }
  };

  return (
    <div className={`${s.insight} ${variant ? s[variant] : ''}`}>
      <div className={s.insightIcon}>
        <Icon name={icon} size={16} color={
          variant === 'amber' ? 'var(--status-warning)' : variant === 'red' ? 'var(--status-error)' : variant === 'green' ? 'var(--status-success)' : 'var(--primary-300)'
        } />
      </div>
      <div className={s.insightBody}>
        <div className={s.insightEyebrow}>{title}</div>
        <div className={s.insightText} dangerouslySetInnerHTML={{ __html: text }} />
        {buttons.length > 0 && (
          <div className={s.insightBtns}>
            {buttons.map((b, i) => (
              <Button
                key={i}
                variant={b.primary ? 'primary' : 'secondary'}
                size="S"
                onClick={() => handleButtonClick(b)}
              >
                {b.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Card ───
// flush=true removes padding (for tables that go edge-to-edge)
export function Card({ title, sub, actions, children, style, flush }) {
  return (
    <div className={s.card} style={style}>
      {title && (
        <div className={s.cardHeader}>
          <span className={s.cardTitle}>{title}</span>
          {sub && <span className={s.cardSub}>{sub}</span>}
          {actions && <div className={s.cardActions}>{actions}</div>}
        </div>
      )}
      <div className={flush ? s.cardBodyFlush : s.cardBody}>{children}</div>
    </div>
  );
}

// ─── Progress Bar ───
export function ProgressBar({ label, value, pct, color = 'purple', sub }) {
  return (
    <div className={s.prRow}>
      <div className={s.prHead}>
        <span className={s.prLabel}>{label}</span>
        <span className={s.prValue}>{value}</span>
      </div>
      <div className={s.prTrack}>
        <div className={`${s.prFill} ${s[color]}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      {sub && <div className={s.prSub}>{sub}</div>}
    </div>
  );
}

// ─── Status Pill ───
export function StatusPill({ label, variant = 'green' }) {
  const cls = variant === 'green' ? s.stGreen : variant === 'amber' ? s.stAmber : variant === 'red' ? s.stRed : s.stNeutral;
  return <span className={`${s.stPill} ${cls}`}>{label}</span>;
}

// ─── Tag ───
export function Tag({ label, variant = 'stars' }) {
  const cls = variant === 'stars' ? s.tagStars : variant === 'hedis' ? s.tagHedis : s.tagAco;
  return <span className={`${s.tag} ${cls}`}>{label}</span>;
}

// ─── Button helpers (thin wrappers around shared Button component) ───
export function GhostBtn({ label, onClick }) {
  return <Button variant="ghost" size="S" onClick={onClick}>{label}</Button>;
}
export function PrimaryBtn({ label, onClick }) {
  return <Button variant="primary" size="S" onClick={onClick}>{label}</Button>;
}
