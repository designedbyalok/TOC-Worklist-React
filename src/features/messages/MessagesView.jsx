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

// ── Communication sidebar config ─────────────────────────────
const INBOX_ITEMS = [
  { id: 'assigned',    icon: 'solar:user-check-linear',         label: 'Assigned to me',    badge: 8 },
  { id: 'mentions',   icon: 'solar:mention-square-linear',      label: 'Mentions' },
  { id: 'others',     icon: 'solar:users-group-rounded-linear', label: 'Assigned to Others' },
  { id: 'unassigned', icon: 'solar:user-cross-linear',          label: 'Unassigned' },
  { id: 'missed',     icon: 'solar:call-missed-linear',         label: 'Missed Calls' },
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
                <Icon name={item.icon} size={16} color={isActive ? 'var(--primary-300)' : 'var(--neutral-300)'} />
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
            onConversationUpdate={() => setConvRefreshKey(k => k + 1)}
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
