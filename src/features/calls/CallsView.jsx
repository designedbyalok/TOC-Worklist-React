import { useState, useEffect } from 'react';
import { TopBar } from '../../components/TopBar/TopBar';
import { Icon } from '../../components/Icon/Icon';
import { MissedCallIcon } from '../../components/Icon/MissedCallIcon';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { Avatar } from '../../components/Avatar/Avatar';
import { DeclinedCallIcon } from '../../components/Icon/DeclinedCallIcon';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Toggle } from '../../components/Toggle/Toggle';
import { DetailDrawer } from '../../components/DetailDrawer/DetailDrawer';
import { AgentsIcon } from '../agent-builder/nodes/NodeIcons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useAppStore } from '../../store/useAppStore';
import styles from './CallsView.module.css';

// ── Left commPanel — inbox + channels ──
const INBOX_ITEMS = [
  { id: 'all',      icon: 'solar:inbox-linear',                 label: 'All Calls' },
  { id: 'incoming', icon: 'solar:incoming-call-rounded-linear', label: 'Incoming' },
  { id: 'outgoing', icon: 'solar:outgoing-call-rounded-linear', label: 'Outgoing' },
  { id: 'missed',   label: 'Missed Calls', isCustomIcon: true },
  { id: 'voicemail',icon: 'solar:microphone-linear',            label: 'Voicemail' },
  { id: 'starred',  icon: 'solar:star-linear',                  label: 'Starred' },
  { id: 'archived', icon: 'solar:archive-linear',               label: 'Archived' },
];

const CHANNEL_ITEMS = [
  { id: 'agents',   icon: 'solar:user-speak-linear',    label: 'Calling Agents' },
  { id: 'support',  icon: 'solar:phone-calling-linear', label: 'Support Line' },
  { id: 'clinical', icon: 'solar:stethoscope-linear',   label: 'Clinical Line' },
];

const CALL_LINES = [
  { id: 'all',       label: 'All Call Lines' },
  { id: 'support',   label: 'Support — (581) 555-0101' },
  { id: 'clinical',  label: 'Clinical — (581) 555-0102' },
  { id: 'billing',   label: 'Billing — (581) 555-0103' },
];

// ── Sample data ──
const CALL_LIST = [
  { id: 'c1',  name: 'Williamy Jammy',    status: 'Call Back',     time: 'Now',   dir: 'outgoing', pinned: true,  active: true  },
  { id: 'c2',  name: 'Dawn Braun',        status: 'Call Back',     time: '08:44', dir: 'outgoing', pinned: true  },
  { id: 'c3',  name: 'Natalie Welch',     status: 'Call Back',     time: '08:44', dir: 'outgoing', pinned: true  },
  { id: 'c4',  name: 'Dr. Stacy Quigley', status: 'Missed Call',   time: '08:44', dir: 'missed'   },
  { id: 'c5',  name: 'Natalie Welch',     status: 'Answered Call', time: '08:44', dir: 'incoming' },
  { id: 'c6',  name: 'Toby Quigley',      status: 'Answered Call', time: '08:44', dir: 'incoming' },
  { id: 'c7',  name: 'Natalie Welch',     status: 'Missed Call',   time: '08:44', dir: 'missed'   },
  { id: 'c8',  name: 'Natalie Welch',     status: 'Missed Call',   time: '08:44', dir: 'missed'   },
  { id: 'c9',  name: 'Dawn Braun',        status: 'Missed Call',   time: '08:44', dir: 'missed'   },
  { id: 'c10', name: 'Natalie Welch',     status: 'Incoming',      time: '08:44', dir: 'incoming' },
  { id: 'c11', name: 'Dr. Stacy Quigley', status: 'Missed Call',   time: '08:44', dir: 'missed'   },
  { id: 'c12', name: 'Natalie Welch',     status: 'Answered Call', time: '08:44', dir: 'incoming' },
];

const CALLS_ROWS = [
  { id: 'r1', dir: 'outgoing', agent: 'Anna',              isBot: true,  date: 'Nov 02 2023 12:42 PM', duration: '10 m 4s', ooo: '-', goalStatus: '3/4 Met', engagementScore: 92, patientId: 'p1' },
  { id: 'r2', dir: 'missed',   agent: 'Anna',              isBot: true,  date: 'Nov 02 2023 12:42 PM', duration: '-',       ooo: '-', goalStatus: '-',      engagementScore: null, patientId: 'p2' },
  { id: 'r3', dir: 'missed',   agent: 'Automation',        isBot: true,  date: 'Nov 02 2023 12:42 PM', duration: '-',       ooo: '-', goalStatus: '-',      engagementScore: null, patientId: 'p3' },
  { id: 'r4', dir: 'answered', agent: 'Albert Flores',     isBot: false, date: 'Nov 02 2023 12:42 PM', duration: '1 m 23s', ooo: '-', goalStatus: '2/4 Met', engagementScore: 78, patientId: 'p4' },
  { id: 'r5', dir: 'outgoing', agent: 'Anna',              isBot: true,  date: 'Nov 02 2023 12:42 PM', duration: '4 m 12s', ooo: '-', goalStatus: '4/4 Met', engagementScore: 95, patientId: 'p5' },
  { id: 'r6', dir: 'incoming', agent: 'Louise Koch',       isBot: false, date: 'Nov 02 2023 12:42 PM', duration: '2 m 45s', ooo: '-', goalStatus: '3/4 Met', engagementScore: 82, patientId: 'p6' },
  { id: 'r7', dir: 'declined', agent: 'Richard Floyd',     isBot: false, date: 'Nov 02 2023 12:42 PM', duration: '-',       ooo: '-', goalStatus: '-',      engagementScore: null, patientId: 'p7' },
  { id: 'r8', dir: 'incoming', agent: 'Dr. Courtney Henry',isBot: false, date: 'Nov 02 2023 12:42 PM', duration: '2 m 21s', ooo: '-', goalStatus: '1/4 Met', engagementScore: 64, patientId: 'p8' },
  { id: 'r9', dir: 'incoming', agent: 'Louise Koch',       isBot: false, date: 'Nov 02 2023 12:42 PM', duration: '1 m 23s', ooo: '-', goalStatus: '3/4 Met', engagementScore: 88, patientId: 'p9' },
];

const DIR_LABEL = {
  outgoing: 'Outgoing',
  incoming: 'Incoming',
  missed:   'Missed',
  answered: 'Answered',
  declined: 'Declined',
};

// ── Helpers ──
function getInitials(name) {
  if (!name) return '?';
  return name
    .replace(/^Dr\.\\s*/i, '')
    .split(' ')
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase();
}

const DIR_ICON = {
  outgoing: { icon: 'solar:outgoing-call-rounded-linear', color: 'var(--primary-300)',        bg: 'var(--primary-100)',        border: 'var(--primary-200)' },
  incoming: { icon: 'solar:incoming-call-rounded-linear', color: 'var(--status-success)',     bg: 'rgba(5, 150, 105, 0.1)',   border: 'rgba(5, 150, 105, 0.2)' },
  answered: { icon: 'solar:phone-calling-linear',         color: 'var(--status-success)',     bg: 'rgba(5, 150, 105, 0.1)',   border: 'rgba(5, 150, 105, 0.2)' },
  missed:   { isMissed: true,                             color: 'var(--status-error)',       bg: 'rgba(220, 38, 38, 0.1)',    border: 'rgba(220, 38, 38, 0.2)' },
  declined: { isDeclined: true,                           color: 'var(--neutral-300)',       bg: 'var(--neutral-50)',         border: 'var(--neutral-150)' },
};

function CallTypeAvatar({ dir }) {
  const cfg = DIR_ICON[dir] || DIR_ICON.outgoing;
  return (
    <div className={styles.callTypeAvatar} style={{ background: cfg.bg, borderColor: cfg.border }}>
      {cfg.isMissed && <MissedCallIcon size={18} color={cfg.color} />}
      {cfg.isDeclined && <DeclinedCallIcon size={18} color={cfg.color} />}
      {!cfg.isMissed && !cfg.isDeclined && <Icon name={cfg.icon} size={18} color={cfg.color} />}
    </div>
  );
}

function CallDirBadge({ dir, size = 14 }) {
  if (dir === 'missed') {
    return <MissedCallIcon size={size} color="var(--status-error)" />;
  }
  const map = {
    outgoing: { icon: 'solar:outgoing-call-linear',  color: 'var(--primary-300)' },
    incoming: { icon: 'solar:incoming-call-linear',  color: 'var(--accent-teal)' },
    answered: { icon: 'solar:phone-calling-linear',  color: 'var(--accent-light-green)' },
    declined: { icon: 'solar:end-call-linear',       color: 'var(--status-error)' },
  };
  const cfg = map[dir] || map.outgoing;
  return <Icon name={cfg.icon} size={size} color={cfg.color} />;
}

function EngagementScoreBadge({ score }) {
  if (score == null) return <span className={styles.dateDash}>-</span>;
  const cls = score >= 85 ? styles.engGood : score >= 70 ? styles.engFair : styles.engPoor;
  return <span className={`${styles.engBadge} ${cls}`}>{score}%</span>;
}

function CallListItem({ entry, selected, onClick }) {
  return (
    <button
      type="button"
      className={[styles.convItem, selected ? styles.selected : ''].join(' ')}
      onClick={onClick}
    >
      <div className={styles.avatarWrap}>
        <Avatar variant="callCard" initials={getInitials(entry.name)} />
        <span className={styles.avatarBadge} aria-hidden="true">
          <CallDirBadge dir={entry.dir} size={10} />
        </span>
      </div>
      <div className={styles.convInfo}>
        <div className={styles.convNameRow}>
          <div className={styles.convName}>
            {entry.name}
            {entry.pinned && (
              <Icon name="solar:pin-bold" size={10} color="var(--primary-300)" className={styles.pin} />
            )}
          </div>
          <div className={styles.convTime}>{entry.time}</div>
        </div>
        <div className={styles.convPreview}>{entry.status}</div>
      </div>
    </button>
  );
}

function CallsTableRow({ row, onClick }) {
  const goalsMet = row.goalStatus !== '-' && row.goalStatus.includes('4/4');
  const hasGoals = row.goalStatus !== '-';

  return (
    <tr className={[styles.row, row.isNew ? styles.rowNew : ''].filter(Boolean).join(' ')} onClick={onClick}>
      <td className={styles.td}>
        <div className={styles.callsCell}>
          <CallTypeAvatar dir={row.dir} />
          <div className={styles.callsCellText}>
            <span className={styles.callDirText}>{DIR_LABEL[row.dir] || 'Call'}</span>
            <div className={styles.callsAgent}>
              {row.isBot ? <AgentsIcon size={11} /> : <Icon name="solar:user-rounded-linear" size={11} color="var(--neutral-300)" />}
              <span>{row.agent}</span>
            </div>
          </div>
        </div>
      </td>
      <td className={styles.td}><span className={styles.secondaryText}>{row.date}</span></td>
      <td className={styles.td}><span className={styles.secondaryText}>{row.duration}</span></td>
      <td className={styles.td}>
        <div className={styles.goalStatusCell}>
          {hasGoals && (
            <Icon 
              name={goalsMet ? "solar:check-circle-bold" : "solar:close-circle-bold"} 
              size={14} 
              color={goalsMet ? "var(--status-success)" : "var(--status-error)"} 
            />
          )}
          <span className={styles.secondaryText}>
            {row.goalStatus}
          </span>
        </div>
      </td>
      <td className={styles.td}><EngagementScoreBadge score={row.engagementScore} /></td>
      <td className={styles.td}><span className={styles.secondaryText}>{row.ooo}</span></td>
      <td className={styles.td} onClick={e => e.stopPropagation()}>
        <div className={styles.actionsCell}>
          <ActionButton icon="solar:play-circle-linear"   size="L" tooltip="Play recording" />
          <span className={styles.actionDivider} />
          <ActionButton icon="solar:document-text-linear" size="L" tooltip="Transcript" />
          <span className={styles.actionDivider} />
          <ActionButton icon="solar:menu-dots-bold"       size="L" tooltip="More" />
        </div>
      </td>
    </tr>
  );
}

export function CallsView() {
  const [activeInbox, setActiveInbox] = useState('agents');
  const [activeCallId, setActiveCallId] = useState('c1');
  const [listFilter, setListFilter] = useState('all');
  const [listSearch, setListSearch] = useState('');
  const [dialNumber, setDialNumber] = useState('');
  const [callLine, setCallLine] = useState('all');
  const [showSearch, setShowSearch] = useState(false);
  const showToast = useAppStore(s => s.showToast);
  const openDetail = useAppStore(s => s.openDetail);
  const detailPatient = useAppStore(s => s.detailPatient);
  const fetchPatients = useAppStore(s => s.fetchPatients);
  const fetchCallDetails = useAppStore(s => s.fetchCallDetails);

  // Ensure patients + call details are loaded so the DetailDrawer can resolve data
  useEffect(() => { fetchPatients(); fetchCallDetails(); }, [fetchPatients, fetchCallDetails]);

  const filteredList = CALL_LIST.filter(c => {
    // 1. Filter by listFilter (Direction)
    if (listFilter === 'incoming') {
      // Missed and Declined come under Incoming as per request
      if (c.dir !== 'incoming' && c.dir !== 'missed' && c.dir !== 'declined') return false;
    } else if (listFilter === 'outgoing') {
      if (c.dir !== 'outgoing') return false;
    }

    // 2. Filter by search
    if (!listSearch) return true;
    return c.name.toLowerCase().includes(listSearch.toLowerCase());
  });

  const activeCount = filteredList.filter(c => c.status === 'Call Back').length;
  const activeLabel =
    INBOX_ITEMS.find(i => i.id === activeInbox)?.label
    || CHANNEL_ITEMS.find(i => i.id === activeInbox)?.label
    || 'Calls';

  const handleRowClick = (row) => {
    if (row.patientId) {
      openDetail(row.patientId);
    } else {
      showToast('Call details — coming soon');
    }
  };

  const thStyle = {
    padding: '8px 14px',
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--neutral-300)',
    borderBottom: '1px solid var(--neutral-150)',
    background: 'var(--neutral-0)',
    position: 'sticky',
    top: 0,
    zIndex: 2,
    textAlign: 'left',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  };

  return (
    <div className={styles.page}>
      <TopBar />

      <div className={styles.panels}>
        {/* ── Left commPanel ── */}
        <div className={styles.commPanel}>
          <div className={styles.commPanelHeader}>
            <Button
              variant="primary"
              size="L"
              leadingIcon="solar:add-circle-bold"
              fullWidth
              onClick={() => showToast('New call – coming soon')}
            >
              New Call
            </Button>
          </div>

          <div className={styles.commSection}>Inbox</div>
          {INBOX_ITEMS.map(item => {
            const isActive = activeInbox === item.id;
            const iconColor = isActive ? 'var(--primary-300)' : 'var(--neutral-300)';
            return (
              <button
                key={item.id}
                type="button"
                className={[styles.commMenuItem, isActive ? styles.active : ''].join(' ')}
                onClick={() => setActiveInbox(item.id)}
              >
                {item.isCustomIcon
                  ? <MissedCallIcon size={16} color={iconColor} />
                  : <Icon name={item.icon} size={16} color={iconColor} />}
                <span className={styles.commMenuLabel}>{item.label}</span>
              </button>
            );
          })}

          <div className={styles.commSection} style={{ marginTop: 8 }}>Channels</div>
          {CHANNEL_ITEMS.map(item => {
            const isActive = activeInbox === item.id;
            const iconColor = isActive ? 'var(--primary-300)' : 'var(--neutral-300)';
            return (
              <button
                key={item.id}
                type="button"
                className={[styles.commMenuItem, isActive ? styles.active : ''].join(' ')}
                onClick={() => setActiveInbox(item.id)}
              >
                <Icon name={item.icon} size={16} color={iconColor} />
                <span className={styles.commMenuLabel}>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Middle: Call history list ── */}
        <div className={styles.convPanel}>
          <div className={styles.convHeader}>
            <div className={styles.convHeaderLeft}>
              <div className={styles.convHeaderTitle}>{activeLabel}</div>
              {activeCount > 0 && (
                <div className={styles.convHeaderSub}>
                  {activeCount} call{activeCount !== 1 ? 's' : ''} to return
                </div>
              )}
            </div>
            <div className={styles.convHeaderActions}>
              <ActionButton
                icon="solar:magnifer-linear"
                size="L"
                tooltip="Search"
                active={showSearch}
                onClick={() => setShowSearch(!showSearch)}
              />
              <div className={styles.convDivider} />
              <ActionButton icon="solar:refresh-linear"  size="L" tooltip="Refresh" />
              <div className={styles.convDivider} />
              <ActionButton icon="solar:filter-linear"   size="L" tooltip="Filter" />
            </div>
          </div>

          {/* Call line select */}
          <div className={styles.convSelectWrap}>
            <Select value={callLine} onValueChange={setCallLine}>
              <SelectTrigger className={styles.callLineTrigger}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CALL_LINES.map(line => (
                  <SelectItem key={line.id} value={line.id}>{line.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search row — conditional based on showSearch */}
          {showSearch && (
            <div className={styles.convSearch}>
              <div className={styles.convSearchWrap}>
                <span className={styles.convSearchIcon}>
                  <Icon name="solar:magnifer-linear" size={13} />
                </span>
                <Input
                  placeholder="Search calls…"
                  value={listSearch}
                  onChange={e => setListSearch(e.target.value)}
                  style={{ paddingLeft: 28, fontSize: 13 }}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Filter toggle */}
          <div className={styles.convTabs}>
            <Toggle
              items={[
                { key: 'all',      label: 'All' },
                { key: 'incoming', label: 'Incoming' },
                { key: 'outgoing', label: 'Outgoing' },
              ]}
              active={listFilter}
              onChange={setListFilter}
              size="S"
              fullWidth
            />
          </div>

          <div className={styles.convList}>
            {filteredList.map(c => (
              <CallListItem
                key={c.id}
                entry={c}
                selected={activeCallId === c.id}
                onClick={() => setActiveCallId(c.id)}
              />
            ))}
          </div>

          {/* Dial a Number */}
          <div className={styles.dialPad}>
            <div className={styles.dialLabel}>Dial a Number</div>
            <div className={styles.dialRow}>
              <Select defaultValue="us">
                <SelectTrigger className={styles.countryTrigger}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">🇺🇸 +1</SelectItem>
                  <SelectItem value="gb">🇬🇧 +44</SelectItem>
                  <SelectItem value="in">🇮🇳 +91</SelectItem>
                </SelectContent>
              </Select>
              <div className={styles.dialInputWrap}>
                <Input
                  placeholder="Enter Number Here"
                  value={dialNumber}
                  onChange={e => setDialNumber(e.target.value)}
                  style={{ paddingRight: 32 }}
                />
                <button
                  type="button"
                  className={styles.dialBtn}
                  onClick={() => showToast('Dial pad – coming soon')}
                  aria-label="Open dial pad"
                >
                  <Icon name="solar:dialpad-linear" size={16} color="var(--primary-300)" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Main panel ── */}
        <div className={styles.mainPanel}>
          {/* Profile banner */}
          <div className={styles.profileBanner}>
            <div className={styles.profileContent}>
              <Avatar variant="patient" initials="WJ" className={styles.profileAvatar} />
              <div className={styles.profileInfo}>
                <div className={styles.profileNameRow}>
                  <span className={styles.profileName}>Williamy Jammy</span>
                  <ActionButton
                    icon="solar:square-top-down-linear"
                    size="L"
                    tooltip="Open patient record"
                    iconColor="var(--primary-300)"
                  />
                </div>
                <div className={styles.profileMeta}>
                  <span>Patient</span>
                  <span className={styles.metaDot}>•</span>
                  <span>Male</span>
                  <span className={styles.metaDot}>•</span>
                  <span>31Y (03-29-1992)</span>
                  <span className={styles.metaDot}>•</span>
                  <span>(581) 824-1591</span>
                </div>
                <div className={styles.profileActions}>
                  <ActionButton icon="solar:home-2-linear"           size="L" tooltip="Home" />
                  <span className={styles.profileActionDivider} />
                  <ActionButton icon="solar:phone-linear"            size="L" tooltip="Call" />
                  <span className={styles.profileActionDivider} />
                  <ActionButton icon="solar:letter-linear"           size="L" tooltip="Email" />
                  <span className={styles.profileActionDivider} />
                  <ActionButton icon="solar:chat-round-dots-linear"  size="L" tooltip="Chat" />
                  <span className={styles.profileActionDivider} />
                  <ActionButton icon="solar:videocamera-linear"      size="L" tooltip="Video" />
                  <span className={styles.profileActionDivider} />
                  <ActionButton icon="solar:folder-linear"           size="L" tooltip="Files" />
                  <span className={styles.profileActionDivider} />
                  <ActionButton icon="solar:phone-calling-linear"    size="L" tooltip="Call history" />
                </div>
              </div>
            </div>
          </div>

          {/* To: subtitle */}
          <div className={styles.toRow}>To: +1 25648 84230</div>

          {/* Calls table — semantic <table> matching WorklistTable/AllPatientsTable */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, minWidth: 220 }}>Calls</th>
                  <th style={thStyle}>Date &amp; Time</th>
                  <th style={thStyle}>Duration</th>
                  <th style={thStyle}>Goal Status</th>
                  <th style={thStyle}>Engagement Score</th>
                  <th style={thStyle}>Out of Office</th>
                  <th style={{ ...thStyle, width: 180 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {CALLS_ROWS.map(row => (
                  <CallsTableRow key={row.id} row={row} onClick={() => handleRowClick(row)} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Drawer — renders when a row is clicked */}
      {detailPatient && <DetailDrawer />}
    </div>
  );
}
