import { useEffect, useMemo, useState } from 'react';
import { Drawer } from '../../../../../../../../components/Drawer/Drawer';
import { Button } from '../../../../../../../../components/Button/Button';
import { Input } from '../../../../../../../../components/Input/Input';
import { Icon } from '../../../../../../../../components/Icon/Icon';
import { Link } from '../../../../../../../../components/Link/Link';
import { FilterChip } from '../../../../../../../../components/FilterChip/FilterChip';
import { Checkbox } from '../../../../../../../../components/ShadcnCheckbox/ShadcnCheckbox';
import { PriorityIcon } from '../../../../../../../../components/PriorityIcon/PriorityIcon';
import { useAppStore } from '../../../../../../../../store/useAppStore';
import styles from './ApplyTemplatesDrawer.module.css';

// Figma 2349:336796 — the picker lists PROBLEMS with the parent template as
// the subtitle line and a three-button priority selector on the right. The
// existing apply flow still keys off templateIds, so we pass just those to
// onApply; the priority selection is UI-only for now (a later change can
// carry it through to `applyPatientCarePlanTemplates`).
// Displayed High → Medium → Low (most urgent first). `medium` is the plan's
// effective default when a template is applied without an explicit pick, so a
// selected template reads Medium here to match what the care plan shows.
const PRIORITIES = ['high', 'medium', 'low'];
const DEFAULT_PRIORITY = 'medium';

// The condition(s) a template addresses, as a single display string. A
// template with no explicit condition reads as an em-dash placeholder.
const conditionTextOf = (t) => {
  const items = (Array.isArray(t.conditions) ? t.conditions : []).filter(Boolean);
  return items.length ? items.join(', ') : '';
};
// Sort/compare key — the first (primary) condition, lowercased. Templates with
// no condition sort last regardless of direction.
const conditionSortKey = (t) => {
  const first = (Array.isArray(t.conditions) ? t.conditions : []).filter(Boolean)[0];
  return (first || '').toLowerCase();
};

/**
 * Pick Care Plan Library templates to add to a patient plan.
 *
 * Row = a template, with its clinical Condition in a dedicated, sortable
 * column and a Low / Medium / High priority picker built from the shared
 * PriorityIcon component so priority reads the same wherever it appears in
 * the app. Templates already applied to the plan are grouped at the top so
 * re-opening the drawer surfaces what is already selected first, mirroring
 * the Barriers drawer.
 */
/**
 * @param {boolean} [props.showPriority=true]  Priority is a property of a
 *   template applied to a plan; a template being authored has nowhere to
 *   keep it, so that column and its header row come off.
 * @param {boolean} [props.showCreateNew=true]
 */
export function ApplyTemplatesDrawer({
  onClose,
  appliedTemplateIds = [],
  appliedTemplatePriorities = {},
  onApply,
  showPriority = true,
  showCreateNew = true,
}) {
  const templates = useAppStore(s => s.carePlanTemplates);
  const libraryDidFetch = useAppStore(s => s.carePlanLibraryDidFetch);
  const libraryLoading = useAppStore(s => s.carePlanLibraryLoading);
  const fetchCarePlanLibrary = useAppStore(s => s.fetchCarePlanLibrary);
  const favorites = useAppStore(s => s.carePlanFavorites);
  const carePlanFavoritesLoaded = useAppStore(s => s.carePlanFavoritesLoaded);
  const fetchCarePlanFavorites = useAppStore(s => s.fetchCarePlanFavorites);

  useEffect(() => {
    if (!libraryDidFetch) fetchCarePlanLibrary();
    if (!carePlanFavoritesLoaded) fetchCarePlanFavorites();
  }, [libraryDidFetch, carePlanFavoritesLoaded, fetchCarePlanLibrary, fetchCarePlanFavorites]);

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(() => new Set(appliedTemplateIds));
  // Seed from the plan's persisted priorities so re-opening the drawer shows
  // what the user picked last time. Applied templates without an explicit pick
  // fall back to Medium (the priority the plan itself uses by default) so the
  // drawer never shows "no priority" for a template the plan ranks as Medium.
  const [priorities, setPriorities] = useState(() => {
    const seed = { ...appliedTemplatePriorities };
    appliedTemplateIds.forEach(id => { if (!seed[id]) seed[id] = DEFAULT_PRIORITY; });
    return seed;
  });
  // Condition filter chip — an OR set of conditions to keep. Empty = all.
  const [conditionFilter, setConditionFilter] = useState([]);
  // Condition sort direction. null = library order (the default), then the
  // header cycles asc → desc → null.
  const [sortDir, setSortDir] = useState(null);

  // Grouping key — the templates already applied to the plan. Kept off the
  // live `selected` set so toggling a row in-session doesn't make it jump
  // groups; it stays where it was when the drawer opened, exactly like the
  // Barriers drawer's "Already Added" group.
  const appliedSet = useMemo(() => new Set(appliedTemplateIds), [appliedTemplateIds]);

  // Every distinct condition across the library, for the filter chip.
  const conditionOptions = useMemo(() => {
    const set = new Set();
    templates.forEach(t => (Array.isArray(t.conditions) ? t.conditions : [])
      .filter(Boolean).forEach(c => set.add(c)));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [templates]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const condSet = conditionFilter.length ? new Set(conditionFilter) : null;
    let list = templates.filter(t => {
      if (condSet && !(t.conditions || []).some(c => condSet.has(c))) return false;
      if (!q) return true;
      const inName = (t.name || '').toLowerCase().includes(q);
      const inCond = (t.conditions || []).some(c => (c || '').toLowerCase().includes(q));
      return inName || inCond;
    });
    if (sortDir) {
      const dir = sortDir === 'asc' ? 1 : -1;
      list = [...list].sort((a, b) => {
        const ka = conditionSortKey(a);
        const kb = conditionSortKey(b);
        // Unconditioned templates always fall to the bottom.
        if (!ka && !kb) return 0;
        if (!ka) return 1;
        if (!kb) return -1;
        return ka.localeCompare(kb) * dir;
      });
    }
    return list;
  }, [templates, query, conditionFilter, sortDir]);

  const addedRows = useMemo(() => rows.filter(t => appliedSet.has(t.id)), [rows, appliedSet]);
  const availableRows = useMemo(() => rows.filter(t => !appliedSet.has(t.id)), [rows, appliedSet]);

  const toggle = (id) => {
    const nowSelected = !selected.has(id);
    setSelected(prev => {
      const next = new Set(prev);
      if (nowSelected) next.add(id);
      else next.delete(id);
      return next;
    });
    // Checking a template gives it the Medium default (what the plan applies)
    // so the row's priority matches the plan; unchecking drops the pick.
    setPriorities(prev => {
      if (nowSelected) return prev[id] ? prev : { ...prev, [id]: DEFAULT_PRIORITY };
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const setPriority = (id, p) => setPriorities(prev => ({
    ...prev,
    [id]: prev[id] === p ? null : p,
  }));

  const cycleSort = () => setSortDir(prev => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));

  const templateNameOf = (t) => t.name;

  const headerRight = (
    <>
      {showCreateNew && (
        <>
          <Link
            onClick={() => { /* future: open Create New template flow */ }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}
          >
            <Icon name="solar:add-linear" size={14} color="var(--primary-300)" />
            Create New
          </Link>
          <span className={styles.headerDivider} aria-hidden />
        </>
      )}
      <Button
        variant="primary"
        size="M"
        disabled={selected.size === 0}
        onClick={() => onApply?.([...selected], priorities)}
      >
        Add
      </Button>
      <span className={styles.headerDivider} aria-hidden />
    </>
  );

  const renderRow = (t) => {
    const isChecked = selected.has(t.id);
    const activePriority = priorities[t.id] || null;
    const condition = conditionTextOf(t);
    return (
      <div key={t.id} className={styles.row}>
        <Checkbox
          checked={isChecked}
          onCheckedChange={() => toggle(t.id)}
          aria-label={`Select ${templateNameOf(t)}`}
        />
        <span className={styles.rowText}>
          <span className={styles.rowTitle}>{templateNameOf(t)}</span>
        </span>
        <span className={styles.conditionCell} title={condition || undefined}>
          {condition || <span className={styles.conditionEmpty}>—</span>}
        </span>
        {showPriority && (
          <div
            className={styles.priorityGroup}
            role="radiogroup"
            aria-label={`Priority for ${templateNameOf(t)}`}
          >
            {PRIORITIES.map(p => {
              const isActive = activePriority === p;
              return (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  aria-label={`${p} priority`}
                  data-priority={p}
                  className={`${styles.priorityBtn} ${isActive ? styles.priorityBtnActive : ''}`}
                  onClick={() => setPriority(t.id, p)}
                >
                  <PriorityIcon priority={p} size={14} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <Drawer title="Add Care Plan Templates" onClose={onClose} headerRight={headerRight} noCloseDivider>
      <div className={styles.body}>
        <div className={styles.controls}>
          <Input
            type="search"
            aria-label="Search templates or problems"
            placeholder="Search Templates or Problems"
            leadingIcon="solar:magnifer-linear"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <FilterChip
            label="Condition"
            options={conditionOptions}
            selected={conditionFilter}
            onChange={setConditionFilter}
            searchable
          />
        </div>

        <div className={styles.list}>
          <div className={styles.tableHead} role="row">
            <span className={styles.tableHeadName}>Template</span>
            <button
              type="button"
              className={styles.tableHeadCondition}
              onClick={cycleSort}
              aria-label="Sort by condition"
              aria-sort={sortDir === 'asc' ? 'ascending' : sortDir === 'desc' ? 'descending' : 'none'}
            >
              Condition
              <SortGlyph dir={sortDir} />
            </button>
            {showPriority && <span className={styles.tableHeadPriority}>Priority</span>}
          </div>
          {libraryLoading && templates.length === 0 ? (
            <p className={styles.empty}>Loading templates…</p>
          ) : rows.length === 0 ? (
            <p className={styles.empty}>
              {templates.length === 0
                ? 'No templates in the library yet. Create one in Settings → Care Plan Library.'
                : `No templates match your search.`}
            </p>
          ) : (
            <>
              {addedRows.length > 0 && (
                <>
                  <span className={styles.groupLabel}>Selected</span>
                  {addedRows.map(renderRow)}
                </>
              )}
              {addedRows.length > 0 && availableRows.length > 0 && (
                <span className={styles.groupDivider} aria-hidden />
              )}
              {availableRows.map(renderRow)}
            </>
          )}
        </div>
      </div>
    </Drawer>
  );
}

// Double-chevron sort affordance, matching HeaderCell's language: idle shows
// both arrows muted, an active direction keeps the pointing arrow.
function SortGlyph({ dir }) {
  return (
    <svg
      className={`${styles.sortGlyph} ${dir ? styles.sortGlyphActive : ''}`}
      width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"
    >
      <path
        d="M12.67 6.67L8 2.67L3.33 6.67"
        stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
        className={dir === 'desc' ? styles.sortGlyphHidden : ''}
      />
      <path
        d="M12.67 9.33L8 13.33L3.33 9.33"
        stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
        className={dir === 'asc' ? styles.sortGlyphHidden : ''}
      />
    </svg>
  );
}
