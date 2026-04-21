import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../../components/Icon/Icon';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { Avatar } from '../../components/Avatar/Avatar';
import { Badge } from '../../components/Badge/Badge';
import { Checkbox } from '../../components/ui/checkbox';
import { useAppStore } from '../../store/useAppStore';
import rowStyles from '../toc-worklist/WorklistRow.module.css';
import styles from './AllPatientsRow.module.css';

const LANG_MAP = { en: 'English', es: 'Spanish', zh: 'Chinese', yue: 'Cantonese', ko: 'Korean', vi: 'Vietnamese', hi: 'Hindi', pa: 'Punjabi' };

function DropdownMenu({ row, onClose }) {
  const showToast = useAppStore(s => s.showToast);

  const COMM = [
    { l: 'Send SMS', i: 'solar:chat-round-line-linear' },
    { l: 'Send Email', i: 'solar:letter-linear' },
    { l: 'Start Meeting', i: 'solar:videocamera-record-linear' },
    { l: 'Chat', i: 'solar:chat-dots-linear' },
  ];
  const CARE = [
    'Send Assessment', 'Add Task', 'Initiate Protocol',
    'Send Education', 'Warm Referral', 'Add to Program', 'Upload File',
  ];

  return (
    <div className={rowStyles.dropdown} onClick={e => e.stopPropagation()}>
      <div className={rowStyles.dropdownSection}>Communication</div>
      {COMM.map(({ l, i }) => (
        <button key={l} className={rowStyles.dropdownItem} onClick={() => { showToast(`${l} – coming soon`); onClose(); }}>
          <Icon name={i} size={18} color="var(--neutral-300)" />
          {l}
        </button>
      ))}
      <div className={rowStyles.dropdownDivider} />
      <div className={rowStyles.dropdownSection}>Care Actions</div>
      {CARE.map(l => (
        <button key={l} className={rowStyles.dropdownItem} onClick={() => { showToast(`${l} – coming soon`); onClose(); }}>
          <Icon name="solar:clipboard-check-linear" size={18} color="var(--neutral-300)" />
          {l}
        </button>
      ))}
      <div className={rowStyles.dropdownDivider} />
      <div className={rowStyles.dropdownSection}>Automation</div>
      <button className={rowStyles.dropdownItem} onClick={() => { showToast('Run Automation – coming soon'); onClose(); }}>
        <Icon name="solar:bolt-outline" size={18} color="var(--neutral-300)" />
        Run Automation
      </button>
      <div className={rowStyles.dropdownDivider} />
      <div className={rowStyles.dropdownSection}>Admin Actions</div>
      <button className={rowStyles.dropdownItem} onClick={() => { showToast('Open Workflow – coming soon'); onClose(); }}>
        <Icon name="solar:clipboard-list-linear" size={18} color="var(--neutral-300)" />
        Open Workflow
      </button>
    </div>
  );
}

function TagList({ tags, max = 2 }) {
  if (!tags?.length) return <span className={styles.dash}>—</span>;
  const shown = tags.slice(0, max);
  const overflow = tags.length - max;
  return (
    <div className={styles.tagList}>
      {shown.map((t, i) => (
        <Badge key={i} variant="ai-care" label={t} />
      ))}
      {overflow > 0 && <Badge variant="overflow" label={`+${overflow}`} />}
    </div>
  );
}

function ConditionList({ conditions, max = 2 }) {
  if (!conditions?.length) return <span className={styles.dash}>—</span>;
  const shown = conditions.slice(0, max);
  const overflow = conditions.length - max;
  return (
    <div className={styles.tagList}>
      {shown.map((c, i) => (
        <Badge key={i} variant="ai-risk" label={c} />
      ))}
      {overflow > 0 && <Badge variant="overflow" label={`+${overflow}`} />}
    </div>
  );
}

function AttributesCell({ row }) {
  const pairs = [
    row.groupNumber && ['Grp', row.groupNumber],
    row.planCode && ['Plan', row.planCode],
    row.coverageType && ['Cov', row.coverageType],
    row.tpa && ['TPA', row.tpa],
  ].filter(Boolean);

  if (!pairs.length) return <span className={styles.dash}>—</span>;

  return (
    <div className={styles.attrCell}>
      {pairs.slice(0, 2).map(([k, v]) => (
        <span key={k} className={styles.attrRow}>
          <span className={styles.attrKey}>{k}:</span>
          <span className={styles.attrVal}>{v}</span>
        </span>
      ))}
      {pairs.length > 2 && (
        <span className={styles.attrMore}>+{pairs.length - 2} more</span>
      )}
    </div>
  );
}

export function AllPatientsRow({ row, isSelected, onSelect }) {
  const showToast = useAppStore(s => s.showToast);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const dropBtnRef = useRef(null);

  useEffect(() => {
    if (!showDropdown) return;
    const clickHandler = () => setShowDropdown(false);
    const closeHandler = (e) => { if (e.detail !== row.id) setShowDropdown(false); };
    const raf = requestAnimationFrame(() => {
      document.addEventListener('click', clickHandler);
      document.addEventListener('close-all-dropdowns', closeHandler);
    });
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('click', clickHandler);
      document.removeEventListener('close-all-dropdowns', closeHandler);
    };
  }, [showDropdown, row.id]);

  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    document.dispatchEvent(new CustomEvent('close-all-dropdowns', { detail: row.id }));
    const btn = dropBtnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const dropdownHeight = 420;
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const top = spaceBelow < dropdownHeight
        ? Math.max(8, rect.top - Math.min(dropdownHeight, rect.top - 8))
        : rect.bottom + 4;
      setDropdownPos({
        top,
        right: window.innerWidth - rect.right,
      });
    }
    setShowDropdown(v => !v);
  };

  const handleRowClick = () => {
    showToast(`${row.name} — details coming soon`);
  };

  const location = row.city && row.state ? `${row.city}, ${row.state}` : (row.location || '—');
  const ccm = row.ccmConsent;
  const apcm = row.apcmConsent;

  return (
    <tr className={rowStyles.row} onClick={handleRowClick}>
      <td className={`${rowStyles.checkTd} ${rowStyles.stickyLeft}`} style={{ left: 0 }} onClick={e => e.stopPropagation()}>
        <Checkbox checked={isSelected} onCheckedChange={() => onSelect(row.id)} />
      </td>
      <td className={`${rowStyles.membersTd} ${rowStyles.stickyLeft}`} style={{ left: 36 }}>
        <div className={rowStyles.patientCell}>
          <Avatar variant="patient" initials={row.initials} />
          <div>
            <div className={rowStyles.patientName}>
              {row.name}
              {row.gender && row.age != null && (
                <span className={rowStyles.patientDemo}> ({row.gender}•{row.age})</span>
              )}
            </div>
            <div className={rowStyles.patientMeta}>
              {row.memberId} •{' '}
              <span className={rowStyles.langBadge}>
                {(row.language || 'en').toUpperCase()}
                <span className={rowStyles.langTooltip}>Preferred Language: {LANG_MAP[row.language] || 'English'}</span>
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className={rowStyles.td}>
        <div className={styles.contactCell}>
          <span className={styles.contactLine}>
            <Icon name="solar:letter-linear" size={13} color="var(--neutral-300)" />
            {row.email || <span className={styles.dash}>—</span>}
          </span>
          <span className={styles.contactLine}>
            <Icon name="solar:phone-linear" size={13} color="var(--neutral-300)" />
            {row.phone || <span className={styles.dash}>—</span>}
          </span>
        </div>
      </td>
      <td className={rowStyles.td}>
        <span className={rowStyles.dateText}>{location}</span>
      </td>
      <td className={rowStyles.td}>
        <TagList tags={row.tags} />
      </td>
      <td className={rowStyles.td}>
        <AttributesCell row={row} />
      </td>
      <td className={rowStyles.td}>
        <ConditionList conditions={row.chronicConditions} />
      </td>
      <td className={rowStyles.td}>
        {row.pcp ? (
          <div className={rowStyles.assigneeCell}>
            <Avatar variant="provider" initials={row.pcpInitials || row.pcp.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()} />
            <span style={{ fontSize: 13 }}>{row.pcp}</span>
          </div>
        ) : (
          <span className={styles.dash}>—</span>
        )}
      </td>
      <td className={rowStyles.td}>
        <span className={rowStyles.dateText}>{row.lastVisit || '—'}</span>
      </td>
      <td className={rowStyles.td}>
        {row.activeCareProgram
          ? <Badge variant="toc-engaged" label={row.activeCareProgram} />
          : <span className={styles.dash}>—</span>}
      </td>
      <td className={rowStyles.td}>
        <Badge
          variant={ccm === true ? 'compliance-pass' : ccm === false ? 'compliance-fail' : 'compliance-na'}
          label={ccm === true ? 'Yes' : ccm === false ? 'No' : 'N/A'}
        />
      </td>
      <td className={rowStyles.td}>
        <Badge
          variant={apcm === true ? 'compliance-pass' : apcm === false ? 'compliance-fail' : 'compliance-na'}
          label={apcm === true ? 'Yes' : apcm === false ? 'No' : 'N/A'}
        />
      </td>
      <td className={`${rowStyles.td} ${rowStyles.stickyRight}`} onClick={e => e.stopPropagation()}>
        <div className={rowStyles.actionsCell}>
          <ActionButton
            icon="solar:letter-linear"
            size="L"
            tooltip="Email"
            onClick={() => showToast(`Email ${row.name} — coming soon`)}
          />
          <span className={rowStyles.actionDivider} />
          <ActionButton
            icon="solar:chat-dots-linear"
            size="L"
            tooltip="Chat"
            onClick={() => showToast(`Chat with ${row.name} — coming soon`)}
          />
          <span className={rowStyles.actionDivider} />
          <div style={{ position: 'relative' }}>
            <ActionButton
              ref={dropBtnRef}
              icon="solar:menu-dots-linear"
              size="L"
              tooltip="More options"
              onClick={handleDropdownToggle}
            />
            {showDropdown && createPortal(
              <div style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right, zIndex: 9999 }}>
                <DropdownMenu row={row} onClose={() => setShowDropdown(false)} />
              </div>,
              document.body
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}
