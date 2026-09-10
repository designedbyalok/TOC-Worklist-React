import { useState } from 'react';
import { Icon } from '../../../../../../components/Icon/Icon';
import { Badge } from '../../../../../../components/Badge/Badge';
import { Avatar } from '../../../../../../components/Avatar/Avatar';
import { TimelineItem } from '../TimelineItem/TimelineItem.jsx';
import { activityIcon } from '../programActivity';
import styles from './ProgramActivityCard.module.css';

/** Count badge on the timeline spine for a multi-activity program group. */
function SpineCount({ count, isLast }) {
  return (
    <div className={styles.spineCol}>
      <span className={styles.spineLine} />
      <Avatar variant="others" initials={String(count)} size="XS" className={styles.spineAvatar} />
      <span className={isLast ? styles.spineLineEnd : styles.spineLineGrow} />
    </div>
  );
}

/** One activity row with spine icon on the shared timeline (expanded stack / singles). */
function ActivitySpineRow({ item, programCode, isLast, showTopLine = true, compact = false }) {
  const { icon } = activityIcon(item.activityKind);

  return (
    <div className={styles.entry}>
      <div className={styles.spineCol}>
        {showTopLine && <span className={styles.spineLine} />}
        <Avatar type="icon" variant="others" iconName={icon} size="XS" className={styles.spineAvatar} />
        <span className={isLast ? styles.spineLineEnd : styles.spineLineGrow} />
      </div>
      <div className={[styles.entryBody, compact ? styles.entryBodyCompact : ''].filter(Boolean).join(' ')}>
        <TimelineItem item={item} programCode={programCode} />
      </div>
    </div>
  );
}

/** Collapse control row — spine tick aligns with the activity timeline. */
function ActivityCollapseRow({ isLast, onCollapse }) {
  return (
    <div className={styles.entry}>
      <div className={styles.spineCol}>
        <span className={styles.spineLineShort} />
        <span className={isLast ? styles.spineLineEnd : styles.spineLineGrow} />
      </div>
      <div className={`${styles.entryBody} ${styles.entryBodyCompact}`}>
        <button
          type="button"
          className={`${styles.toggleLink} ${styles.toggleButton}`}
          onClick={onCollapse}
          aria-expanded
        >
          <Icon name="solar:round-alt-arrow-up-right-linear" size={16} color="var(--primary-300)" />
          Collapse
        </button>
      </div>
    </div>
  );
}

/** A program's activities on a day: stacked summary + peek rows when collapsed,
 *  flat spine rows when expanded (Paper Care Feed Items / Figma 108:127731). */
function ActivityStack({ entry, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const peekCount = Math.min(2, entry.count - 1);
  const peekItems = entry.items.slice(0, peekCount);

  if (expanded) {
    return (
      <>
        {entry.items.map((item, idx) => (
          <ActivitySpineRow
            key={item.id}
            item={item}
            programCode={entry.programCode}
            showTopLine={idx === 0}
            compact
          />
        ))}
        <ActivityCollapseRow isLast={isLast} onCollapse={() => setExpanded(false)} />
      </>
    );
  }

  return (
    <div className={styles.entry}>
      <SpineCount count={entry.count} isLast={isLast} />
      <div className={styles.entryBody}>
        <div className={styles.stack}>
          {peekItems.slice().reverse().map((item, i) => (
            <div key={item.id} className={styles.peekLayer} style={{ zIndex: i + 1 }}>
              <TimelineItem item={item} programCode={entry.programCode} peek />
            </div>
          ))}
          <div className={styles.summaryCard} style={{ zIndex: peekCount + 1 }}>
            <div className={styles.summaryText}>
              <span className={styles.programTitle}>{entry.programName}</span>
              <span className={styles.summaryMeta}>
                {entry.count} {entry.count === 1 ? 'Activity' : 'Activities'}
              </span>
            </div>
            <Badge tone="primary" size="XS" label={entry.programCode} />
          </div>
        </div>
        <button
          type="button"
          className={`${styles.toggleLink} ${styles.toggleButton}`}
          onClick={() => setExpanded(true)}
          aria-expanded={false}
        >
          <Icon name="solar:round-alt-arrow-down-left-linear" size={16} color="var(--primary-300)" />
          See all activities
        </button>
      </div>
    </div>
  );
}

/** Single activity on a day — spine column + content (no stack). */
function ActivitySingle({ entry, isLast }) {
  const item = entry.items[0];
  const { icon } = activityIcon(item.activityKind);

  return (
    <div className={styles.entry}>
      <div className={styles.spineCol}>
        <span className={styles.spineLine} />
        <Avatar type="icon" variant="others" iconName={icon} size="XS" className={styles.spineAvatar} />
        <span className={isLast ? styles.spineLineEnd : styles.spineLineGrow} />
      </div>
      <div className={styles.entryBody}>
        <TimelineItem item={item} programCode={entry.programCode} />
      </div>
    </div>
  );
}

/**
 * One calendar day in the Program Activity Log — date column on the left,
 * program stacks / single rows on the right (Figma 108:119415).
 */
export function ProgramActivityDay({ day }) {
  return (
    <div className={styles.day}>
      <div className={styles.dateCol}>
        <span className={styles.date}>{day.date}</span>
        <Badge tone="grey" size="XS" label={day.day} />
      </div>
      <div className={styles.dayEntries}>
        {day.entries.map((entry, i) => {
          const isLast = i === day.entries.length - 1;
          if (entry.type === 'group') {
            return <ActivityStack key={entry.key} entry={entry} isLast={isLast} />;
          }
          return <ActivitySingle key={entry.key} entry={entry} isLast={isLast} />;
        })}
      </div>
    </div>
  );
}

/** @deprecated Use ProgramActivityDay */
export function ProgramActivityCard({ card }) {
  const day = {
    date: card.date,
    day: card.day,
    entries: [{
      ...card,
      type: card.count > 1 ? 'group' : 'single',
      key: card.key,
      items: card.items,
    }],
  };
  return <ProgramActivityDay day={day} />;
}
