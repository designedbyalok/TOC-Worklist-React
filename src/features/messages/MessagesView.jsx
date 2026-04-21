import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Icon } from '../../components/Icon/Icon';
import { TopBar } from '../../components/TopBar/TopBar';
import { Button } from '../../components/Button/Button';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { Input } from '../../components/Input/Input';
import { useAppStore } from '../../store/useAppStore';
import { Toggle } from '../../components/Toggle/Toggle';
import { ChatArea } from './ChatArea';
import styles from './MessagesView.module.css';

// ── Helpers ──────────────────────────────────────────────────
function getInitials(profile) {
  if (!profile) return '?';
  if (profile.first_name && profile.last_name)
    return (profile.first_name[0] + profile.last_name[0]).toUpperCase();
  if (profile.full_name)
    return profile.full_name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  if (profile.email) return profile.email.slice(0, 2).toUpperCase();
  return '?';
}

function getDisplayName(profile) {
  if (!profile) return 'Unknown';
  if (profile.first_name && profile.last_name) return `${profile.first_name} ${profile.last_name}`;
  if (profile.full_name) return profile.full_name;
  return profile.email?.split('@')[0] || 'Unknown';
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Custom missed call icon ───────────────────────────────────
function MissedCallIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.0671 10.0181L10.4297 10.3625V10.3625L10.0671 10.0181ZM10.3708 9.69847L10.0082 9.35413V9.35413L10.3708 9.69847ZM11.9819 9.47488L11.7325 9.90822V9.90822L11.9819 9.47488ZM13.2556 10.208L13.0061 10.6413L13.2556 10.208ZM13.6144 12.5056L13.977 12.85V12.85L13.6144 12.5056ZM12.6674 13.5027L12.3049 13.1583V13.1583L12.6674 13.5027ZM11.7842 13.9754L11.8333 14.473V14.473L11.7842 13.9754ZM5.21024 10.9835L4.84771 11.3278V11.3278L5.21024 10.9835ZM2.00193 4.64396L1.50264 4.67076L1.50264 4.67076L2.00193 4.64396ZM6.12714 5.87005L6.48967 6.21439V6.21439L6.12714 5.87005ZM6.31835 5.66874L6.68087 6.01309V6.01309L6.31835 5.66874ZM6.42283 3.7954L6.83109 3.50674V3.50674L6.42283 3.7954ZM5.58217 2.60641L5.17391 2.89507L5.17391 2.89507L5.58217 2.60641ZM3.50763 2.40576L3.87016 2.7501V2.7501L3.50763 2.40576ZM2.46123 3.50742L2.0987 3.16308H2.0987L2.46123 3.50742ZM7.37541 8.70393L7.73794 8.35959V8.35959L7.37541 8.70393ZM9.28587 5.75955C9.05932 5.60167 8.74767 5.65734 8.58978 5.8839C8.4319 6.11045 8.48757 6.4221 8.71413 6.57998L9 6.16977L9.28587 5.75955ZM9.54695 6.55093L9.26108 6.96115H9.26108L9.54695 6.55093ZM13.2594 5.88777L12.8521 5.59771L12.8492 5.60189L13.2594 5.88777ZM14.129 4.66667L14.6193 4.56861C14.5664 4.30398 14.313 4.1291 14.0468 4.17347L14.129 4.66667ZM12.0468 4.5068C11.7744 4.5522 11.5904 4.80981 11.6358 5.0822C11.6812 5.35458 11.9388 5.53859 12.2112 5.4932L12.129 5L12.0468 4.5068ZM13.9721 6.43139C14.0262 6.70217 14.2896 6.87778 14.5604 6.82362C14.8312 6.76947 15.0068 6.50605 14.9526 6.23528L14.4623 6.33333L13.9721 6.43139ZM10.7927 7.32431L11.034 6.88637H11.034L10.7927 7.32431ZM12.0514 7.19879L11.7236 6.82126V6.82126L12.0514 7.19879ZM10.0671 10.0181L10.4297 10.3625L10.7333 10.0428L10.3708 9.69847L10.0082 9.35413L9.70462 9.67379L10.0671 10.0181ZM11.9819 9.47488L11.7325 9.90822L13.0061 10.6413L13.2556 10.208L13.505 9.77465L12.2313 9.04153L11.9819 9.47488ZM13.6144 12.5056L13.2519 12.1613L12.3049 13.1583L12.6674 13.5027L13.0299 13.847L13.977 12.85L13.6144 12.5056ZM11.7842 13.9754L11.7351 13.4778C10.7784 13.5722 8.28222 13.4917 5.57277 10.6391L5.21024 10.9835L4.84771 11.3278C7.80063 14.4367 10.6174 14.593 11.8333 14.473L11.7842 13.9754ZM5.21024 10.9835L5.57277 10.6391C2.98869 7.91856 2.55523 5.6237 2.50121 4.61716L2.00193 4.64396L1.50264 4.67076C1.56881 5.90357 2.09227 8.42684 4.84771 11.3278L5.21024 10.9835ZM6.12714 5.87005L6.48967 6.21439L6.68087 6.01309L6.31835 5.66874L5.95582 5.3244L5.76461 5.52571L6.12714 5.87005ZM6.42283 3.7954L6.83109 3.50674L5.99043 2.31775L5.58217 2.60641L5.17391 2.89507L6.01457 4.08406L6.42283 3.7954ZM3.50763 2.40576L3.1451 2.06142L2.0987 3.16308L2.46123 3.50742L2.82376 3.85177L3.87016 2.7501L3.50763 2.40576ZM6.12714 5.87005C5.76461 5.52571 5.76415 5.52619 5.76368 5.52668C5.76352 5.52685 5.76306 5.52735 5.76274 5.52768C5.76211 5.52836 5.76146 5.52905 5.7608 5.52975C5.75949 5.53117 5.75813 5.53264 5.75674 5.53418C5.75394 5.53725 5.75097 5.54058 5.74785 5.54417C5.74162 5.55134 5.73477 5.55954 5.72744 5.5688C5.71278 5.58732 5.69621 5.61008 5.67882 5.63726C5.64394 5.69176 5.60612 5.76354 5.57408 5.85356C5.50895 6.0366 5.47345 6.279 5.51781 6.58171C5.60495 7.17645 5.99465 7.97627 7.01289 9.04828L7.37541 8.70393L7.73794 8.35959C6.78617 7.35756 6.55174 6.74043 6.50724 6.43674C6.48578 6.29024 6.50759 6.21305 6.51621 6.18881C6.52106 6.17518 6.52423 6.17139 6.52113 6.17624C6.51962 6.1786 6.51663 6.183 6.51158 6.18938C6.50906 6.19257 6.50602 6.19625 6.5024 6.20042C6.50058 6.2025 6.49862 6.20471 6.4965 6.20704C6.49545 6.2082 6.49435 6.2094 6.49321 6.21062C6.49264 6.21124 6.49206 6.21186 6.49147 6.21249C6.49117 6.2128 6.49072 6.21328 6.49057 6.21343C6.49012 6.21391 6.48967 6.21439 6.12714 5.87005ZM7.37541 8.70393L7.01289 9.04828C8.02812 10.1171 8.79487 10.5373 9.37988 10.6323C9.68007 10.6811 9.92305 10.6422 10.1071 10.5696C10.197 10.5341 10.2681 10.4924 10.3215 10.4546C10.3482 10.4357 10.3704 10.4178 10.3883 10.402C10.3972 10.3942 10.4051 10.3869 10.412 10.3802C10.4155 10.3769 10.4187 10.3738 10.4216 10.3708C10.4231 10.3693 10.4245 10.3679 10.4258 10.3665C10.4265 10.3658 10.4272 10.3651 10.4278 10.3644C10.4281 10.3641 10.4286 10.3636 10.4287 10.3635C10.4292 10.363 10.4297 10.3625 10.0671 10.0181C9.70462 9.67379 9.70507 9.67331 9.70553 9.67283C9.70568 9.67268 9.70613 9.6722 9.70643 9.67189C9.70703 9.67127 9.70762 9.67066 9.7082 9.67006C9.70937 9.66885 9.71051 9.66769 9.71163 9.66656C9.71386 9.66432 9.71598 9.66223 9.718 9.66028C9.72203 9.65639 9.72564 9.65309 9.72884 9.65029C9.73522 9.64469 9.73996 9.64107 9.74302 9.6389C9.74927 9.63447 9.74863 9.63598 9.74014 9.63933C9.72725 9.64441 9.66668 9.66581 9.54018 9.64527C9.27182 9.60168 8.69271 9.36478 7.73794 8.35959L7.37541 8.70393ZM5.58217 2.60641L5.99043 2.31775C5.31471 1.36203 3.96256 1.20079 3.1451 2.06142L3.50763 2.40576L3.87016 2.7501C4.21872 2.38314 4.83234 2.41197 5.17391 2.89507L5.58217 2.60641ZM2.00193 4.64396L2.50121 4.61716C2.48692 4.35096 2.60284 4.08436 2.82376 3.85177L2.46123 3.50742L2.0987 3.16308C1.74147 3.53918 1.46995 4.06164 1.50264 4.67076L2.00193 4.64396ZM12.6674 13.5027L12.3049 13.1583C12.1189 13.3542 11.9242 13.4591 11.7351 13.4778L11.7842 13.9754L11.8333 14.473C12.3313 14.4238 12.7344 14.1582 13.0299 13.847L12.6674 13.5027ZM6.31835 5.66874L6.68087 6.01309C7.32592 5.33397 7.37158 4.27119 6.83109 3.50674L6.42283 3.7954L6.01457 4.08406C6.296 4.4821 6.25284 5.01169 5.95582 5.3244L6.31835 5.66874ZM13.2556 10.208L13.0061 10.6413C13.5534 10.9563 13.6604 11.7312 13.2519 12.1613L13.6144 12.5056L13.977 12.85C14.847 11.934 14.5936 10.4012 13.505 9.77465L13.2556 10.208ZM10.3708 9.69847L10.7333 10.0428C10.9903 9.77228 11.3907 9.71149 11.7325 9.90822L11.9819 9.47488L12.2313 9.04154C11.499 8.62002 10.5908 8.74085 10.0082 9.35413L10.3708 9.69847ZM9 6.16977L8.71413 6.57998L9.26108 6.96115L9.54695 6.55093L9.83283 6.14072L9.28587 5.75955L9 6.16977ZM13.2594 5.88777L13.6667 6.17781L14.5363 4.95671L14.129 4.66667L13.7217 4.37663L12.8521 5.59773L13.2594 5.88777ZM14.129 4.66667L14.0468 4.17347L12.0468 4.5068L12.129 5L12.2112 5.4932L14.2112 5.15986L14.129 4.66667ZM14.129 4.66667L13.6387 4.76472L13.9721 6.43139L14.4623 6.33333L14.9526 6.23528L14.6193 4.56861L14.129 4.66667ZM9.54695 6.55093L9.26108 6.96115C9.7471 7.29984 10.2009 7.56911 10.5515 7.76226L10.7927 7.32431L11.034 6.88637C10.7071 6.70629 10.2842 6.45529 9.83283 6.14072L9.54695 6.55093ZM13.2594 5.88777L12.8492 5.60189C12.509 6.09001 12.073 6.51792 11.7236 6.82126L12.0514 7.19879L12.3793 7.57633C12.7611 7.24475 13.2641 6.75553 13.6696 6.17364L13.2594 5.88777ZM10.7927 7.32431L10.5515 7.76226C11.1377 8.08519 11.8627 8.02488 12.3793 7.57633L12.0514 7.19879L11.7236 6.82126C11.5347 6.98527 11.2661 7.01423 11.034 6.88637L10.7927 7.32431Z" fill={color} />
    </svg>
  );
}

// ── Communication sidebar config ─────────────────────────────
const INBOX_ITEMS = [
  { id: 'assigned',    icon: 'solar:user-check-linear',         label: 'Assigned to me',    badge: 8 },
  { id: 'mentions',   icon: 'solar:mention-square-linear',      label: 'Mentions' },
  { id: 'others',     icon: 'solar:users-group-rounded-linear', label: 'Assigned to Others' },
  { id: 'unassigned', icon: 'solar:user-cross-linear',          label: 'Unassigned' },
  { id: 'missed',     icon: 'solar:call-missed-linear',         label: 'Missed Calls', isCustomIcon: true },
  { id: 'starred',    icon: 'solar:star-linear',                label: 'Starred' },
  { id: 'archived',   icon: 'solar:archive-linear',             label: 'Archived' },
];

const CHANNEL_ITEMS = [
  { id: 'all',      icon: 'solar:chat-round-call-linear', label: 'All Conversations' },
  { id: 'chat',     icon: 'solar:chat-round-linear',      label: 'Chat' },
  { id: 'sms',      icon: 'solar:chat-square-linear',     label: 'SMS',   badge: 3 },
  { id: 'calls',    icon: 'solar:phone-calling-linear',   label: 'Calls', badge: 2 },
  { id: 'email',    icon: 'solar:letter-linear',          label: 'Email', badge: 1 },
  { id: 'efax',     icon: 'solar:printer-linear',         label: 'E-fax' },
  { id: 'internal', icon: 'solar:user-speak-linear',      label: 'Internal Chat' },
];

// ── Main component ────────────────────────────────────────────
export function MessagesView() {
  const setMessagesUnreadCount = useAppStore(s => s.setMessagesUnreadCount);
  const pendingChatUserEmail = useAppStore(s => s.pendingChatUserEmail);
  const setPendingChatUserEmail = useAppStore(s => s.setPendingChatUserEmail);

  const [currentUser, setCurrentUser]     = useState(null);
  const [profiles, setProfiles]           = useState({});
  const [allProfiles, setAllProfiles]     = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [filterTab, setFilterTab]         = useState('all');
  const [activeChannel, setActiveChannel] = useState('chat');
  const [searchQuery, setSearchQuery]     = useState('');
  const [showNewChat, setShowNewChat]     = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');
  const [convRefreshKey, setConvRefreshKey] = useState(0);
  const [showSearch, setShowSearch]       = useState(false);
  const newChatRef = useRef(null);

  // ── Load current user ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data?.user;
      if (user) setCurrentUser(user);
    });
  }, []);

  // ── Load all user profiles + watch for new ones ──
  const refreshProfiles = useCallback(() => {
    supabase.from('user_profiles').select('*').then(({ data }) => {
      setAllProfiles(data || []);
      const map = {};
      (data || []).forEach(p => { map[p.id] = p; });
      setProfiles(map);
    });
  }, []);

  useEffect(() => { refreshProfiles(); }, [refreshProfiles]);

  useEffect(() => {
    const ch = supabase
      .channel('user-profiles-watch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, refreshProfiles)
      .subscribe();
    return () => ch.unsubscribe();
  }, [refreshProfiles]);

  // ── Load & derive conversations ──
  const loadConversations = useCallback(async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: false });

    if (!data) return;

    const convMap = {};
    data.forEach(msg => {
      const otherId = msg.sender_id === currentUser.id ? msg.recipient_id : msg.sender_id;
      if (!convMap[otherId]) {
        convMap[otherId] = { userId: otherId, lastMessage: msg.content, lastTime: msg.created_at, unreadCount: 0 };
      }
      if (msg.recipient_id === currentUser.id && !msg.read_at) {
        convMap[otherId].unreadCount++;
      }
    });

    const convList = Object.values(convMap).sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));
    setConversations(convList);

    // Update global unread count for Sidebar badge
    const total = convList.reduce((sum, c) => sum + c.unreadCount, 0);
    setMessagesUnreadCount(total);
  }, [currentUser, setMessagesUnreadCount]);

  useEffect(() => {
    if (currentUser) loadConversations();
  }, [currentUser, loadConversations, convRefreshKey]);

  // ── Realtime: refresh on incoming messages ──
  useEffect(() => {
    if (!currentUser) return;
    const ch = supabase
      .channel('msg-inbox')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'direct_messages',
        filter: `recipient_id=eq.${currentUser.id}`,
      }, () => setConvRefreshKey(k => k + 1))
      .subscribe();
    return () => ch.unsubscribe();
  }, [currentUser]);

  // ── Stable onConversationUpdate so ChatArea deps don't cascade ──
  const handleConversationUpdate = useCallback(() => setConvRefreshKey(k => k + 1), []);

  // ── Consume pendingChatUserEmail set by external navigation ──
  useEffect(() => {
    if (!pendingChatUserEmail || !allProfiles.length) return;
    const match = allProfiles.find(p => p.email === pendingChatUserEmail);
    if (match) {
      setProfiles(prev => ({ ...prev, [match.id]: match }));
      setSelectedUserId(match.id);
      setShowNewChat(false);
      setNewChatSearch('');
      setActiveChannel('chat');
    }
    setPendingChatUserEmail(null);
  }, [pendingChatUserEmail, allProfiles, setPendingChatUserEmail]);

  // ── Close new-chat on outside click ──
  useEffect(() => {
    if (!showNewChat) return;
    const handler = (e) => {
      if (newChatRef.current && !newChatRef.current.contains(e.target)) {
        setShowNewChat(false);
        setNewChatSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNewChat]);

  // ── Derived ──
  const filteredConversations = conversations.filter(conv => {
    if (filterTab === 'unread' && conv.unreadCount === 0) return false;
    if (!searchQuery) return true;
    const profile = profiles[conv.userId];
    const q = searchQuery.toLowerCase();
    return getDisplayName(profile).toLowerCase().includes(q) || (profile?.email || '').toLowerCase().includes(q);
  });

  const filteredNewUsers = allProfiles.filter(p => {
    if (p.id === currentUser?.id) return false;
    if (!newChatSearch) return true;
    const q = newChatSearch.toLowerCase();
    return getDisplayName(p).toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q);
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const selectedProfile = selectedUserId ? profiles[selectedUserId] : null;

  const openConversation = (userId) => {
    setSelectedUserId(userId);
    setShowNewChat(false);
    setNewChatSearch('');
  };

  return (
    <div className={styles.page}>
      <TopBar />

      <div className={styles.panels}>
        {/* ── Communication sidebar ── */}
        <div className={styles.commPanel}>
          <div style={{ padding: '12px 12px 4px' }}>
            <Button
              variant="primary"
              size="L"
              leadingIcon="solar:add-circle-bold"
              fullWidth
              onClick={() => setShowNewChat(true)}
            >
              Create New
            </Button>
          </div>

          <div className={styles.commSection}>Inbox</div>
          {INBOX_ITEMS.map(item => {
            const isActive = activeChannel === item.id;
            return (
              <button
                key={item.id}
                className={[styles.commMenuItem, isActive ? styles.active : ''].join(' ')}
                onClick={() => setActiveChannel(item.id)}
              >
                {item.isCustomIcon
                  ? <MissedCallIcon size={16} color={isActive ? 'var(--primary-300)' : 'var(--neutral-300)'} />
                  : <Icon name={item.icon} size={16} color={isActive ? 'var(--primary-300)' : 'var(--neutral-300)'} />}
                <span className={styles.commMenuLabel}>{item.label}</span>
                {item.badge != null && <span className={styles.commBadge}>{item.badge}</span>}
              </button>
            );
          })}

          <div className={styles.commSection} style={{ marginTop: 8 }}>Channels</div>
          {CHANNEL_ITEMS.map(item => {
            const isActive = activeChannel === item.id;
            const badge = item.id === 'chat' ? (totalUnread > 0 ? totalUnread : null) : item.badge ?? null;
            return (
              <button
                key={item.id}
                className={[styles.commMenuItem, isActive ? styles.active : ''].join(' ')}
                onClick={() => setActiveChannel(item.id)}
              >
                <Icon name={item.icon} size={16} color={isActive ? 'var(--primary-300)' : 'var(--neutral-300)'} />
                <span className={styles.commMenuLabel}>{item.label}</span>
                {badge != null && <span className={styles.commBadge}>{badge}</span>}
              </button>
            );
          })}
        </div>

        {/* ── Conversation list ── */}
        <div className={styles.convPanel}>
          <div className={styles.convHeader}>
            <div className={styles.convHeaderLeft}>
              <div className={styles.convHeaderTitle}>Chats</div>
              {totalUnread > 0 && (
                <div className={styles.convHeaderSub}>{totalUnread} unread chat{totalUnread !== 1 ? 's' : ''}</div>
              )}
            </div>
            <div className={styles.convHeaderActions}>
              <ActionButton icon="solar:pen-new-square-linear" size="S" tooltip="New chat" onClick={() => setShowNewChat(true)} />
              <div className={styles.convDivider} />
              <ActionButton
                icon="solar:magnifer-linear"
                size="S"
                tooltip="Search"
                onClick={() => { setShowSearch(v => !v); if (showSearch) setSearchQuery(''); }}
              />
              <div className={styles.convDivider} />
              <ActionButton icon="solar:filter-linear" size="S" tooltip="Filter" />
              <div className={styles.convDivider} />
              <ActionButton icon="solar:menu-dots-bold" size="S" tooltip="More" />
            </div>
          </div>

          <div className={styles.convTabs}>
            <Toggle
              items={[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'pinned', label: 'Pinned' },
              ]}
              active={filterTab}
              onChange={setFilterTab}
              size="S"
              fullWidth
            />
          </div>

          {showSearch && (
            <div className={styles.convSearch}>
              <div className={styles.convSearchWrap}>
                <span className={styles.convSearchIcon}><Icon name="solar:magnifer-linear" size={13} /></span>
                <Input
                  autoFocus
                  placeholder="Search conversations…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: 28, paddingRight: 30, fontSize: 12 }}
                />
                <button
                  className={styles.convSearchClear}
                  onClick={() => { setSearchQuery(''); setShowSearch(false); }}
                >
                  <Icon name="solar:close-circle-bold" size={15} />
                </button>
              </div>
            </div>
          )}

          <div className={styles.convList}>
            {filteredConversations.length === 0 ? (
              <div className={styles.emptyConv}>
                <div className={styles.emptyConvIcon}>
                  <Icon name="solar:chat-round-linear" size={28} />
                </div>
                <div className={styles.emptyConvText}>
                  {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
                </div>
                {!searchQuery && (
                  <Button variant="primary" size="L" leadingIcon="solar:pen-new-square-linear" onClick={() => setShowNewChat(true)}>
                    Start a chat
                  </Button>
                )}
              </div>
            ) : (
              filteredConversations.map(conv => {
                const profile = profiles[conv.userId];
                const isSelected = selectedUserId === conv.userId;
                return (
                  <div
                    key={conv.userId}
                    className={[styles.convItem, isSelected ? styles.selected : ''].join(' ')}
                    onClick={() => openConversation(conv.userId)}
                  >
                    <div className={styles.convAvatar}>{getInitials(profile)}</div>
                    <div className={styles.convInfo}>
                      <div className={styles.convNameRow}>
                        <div className={[styles.convName, conv.unreadCount === 0 ? styles.muted : ''].join(' ')}>
                          {getDisplayName(profile)}
                        </div>
                        <div className={styles.convTime}>{formatTime(conv.lastTime)}</div>
                      </div>
                      <div className={styles.convPreviewRow}>
                        <div className={styles.convPreview}>{conv.lastMessage}</div>
                        {conv.unreadCount > 0 && <span className={styles.convUnread}>{conv.unreadCount}</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat area ── */}
        {selectedUserId && selectedProfile && currentUser ? (
          <ChatArea
            key={selectedUserId}
            currentUser={currentUser}
            otherUser={selectedProfile}
            onConversationUpdate={handleConversationUpdate}
          />
        ) : (
          <div className={styles.chatPanel}>
            <div className={styles.noConvPlaceholder}>
              <div className={styles.noConvIcon}>
                <Icon name="solar:chat-round-linear" size={32} />
              </div>
              <div className={styles.noConvText}>Select a conversation or start a new one</div>
              <Button variant="primary" size="L" leadingIcon="solar:pen-new-square-linear" onClick={() => setShowNewChat(true)}>
                New Message
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── New chat modal ── */}
      {showNewChat && (
        <div className={styles.newChatOverlay}>
          <div ref={newChatRef} className={styles.newChatBox}>
            <div className={styles.newChatHeader}>
              <div className={styles.newChatTitle}>New Message</div>
              <ActionButton
                icon="solar:close-circle-linear"
                size="S"
                onClick={() => { setShowNewChat(false); setNewChatSearch(''); }}
              />
            </div>
            <Input
              autoFocus
              placeholder="Search by name or email…"
              value={newChatSearch}
              onChange={e => setNewChatSearch(e.target.value)}
              style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', height: 40, fontSize: 14 }}
            />
            <div className={styles.newChatList}>
              {filteredNewUsers.length === 0 ? (
                <div className={styles.newChatEmpty}>
                  {newChatSearch ? 'No users found' : 'No other users available yet'}
                </div>
              ) : (
                filteredNewUsers.map(p => (
                  <div
                    key={p.id}
                    className={styles.newChatUser}
                    onClick={() => {
                      setProfiles(prev => ({ ...prev, [p.id]: p }));
                      openConversation(p.id);
                      setActiveChannel('chat');
                    }}
                  >
                    <div className={styles.convAvatar}>{getInitials(p)}</div>
                    <div className={styles.newChatUserInfo}>
                      <div className={styles.newChatUserName}>{getDisplayName(p)}</div>
                      <div className={styles.newChatUserEmail}>{p.email}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
