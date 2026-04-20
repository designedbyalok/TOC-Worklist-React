import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Icon } from '../../components/Icon/Icon';
import { Button } from '../../components/Button/Button';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import styles from './MessagesView.module.css';

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

function formatMsgTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function shouldShowTimestamp(msg, prevMsg) {
  if (!prevMsg) return true;
  return new Date(msg.created_at) - new Date(prevMsg.created_at) > 5 * 60 * 1000;
}

export function ChatArea({ currentUser, otherUser, onConversationUpdate }) {
  const [messages, setMessages]   = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);
  const bottomRef  = useRef(null);
  const channelRef = useRef(null);
  const textareaRef = useRef(null);

  const markRead = useCallback(async (msgs) => {
    const unreadIds = msgs
      .filter(m => m.recipient_id === currentUser.id && !m.read_at)
      .map(m => m.id);
    if (unreadIds.length === 0) return;
    await supabase.from('direct_messages').update({ read_at: new Date().toISOString() }).in('id', unreadIds);
    onConversationUpdate?.();
  }, [currentUser.id, onConversationUpdate]);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('direct_messages')
      .select('*')
      .or(
        `and(sender_id.eq.${currentUser.id},recipient_id.eq.${otherUser.id}),` +
        `and(sender_id.eq.${otherUser.id},recipient_id.eq.${currentUser.id})`
      )
      .order('created_at', { ascending: true });
    const msgs = data || [];
    setMessages(msgs);
    setLoading(false);
    markRead(msgs);
  }, [currentUser.id, otherUser.id, markRead]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Supabase Realtime subscription
  useEffect(() => {
    channelRef.current?.unsubscribe();
    const key = `dm-${[currentUser.id, otherUser.id].sort().join('-')}`;
    channelRef.current = supabase
      .channel(key)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, (payload) => {
        const msg = payload.new;
        const relevant =
          (msg.sender_id === currentUser.id && msg.recipient_id === otherUser.id) ||
          (msg.sender_id === otherUser.id   && msg.recipient_id === currentUser.id);
        if (!relevant) return;
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
        if (msg.recipient_id === currentUser.id) {
          supabase.from('direct_messages').update({ read_at: new Date().toISOString() }).eq('id', msg.id)
            .then(() => onConversationUpdate?.());
        }
      })
      .subscribe();
    return () => channelRef.current?.unsubscribe();
  }, [currentUser.id, otherUser.id, onConversationUpdate]);

  const sendMessage = async () => {
    const content = inputValue.trim();
    if (!content || sending) return;
    setInputValue('');
    setSending(true);

    const optId = `opt-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: optId, sender_id: currentUser.id, recipient_id: otherUser.id,
      content, created_at: new Date().toISOString(), read_at: null,
    }]);

    const { data } = await supabase
      .from('direct_messages')
      .insert({ sender_id: currentUser.id, recipient_id: otherUser.id, content })
      .select().single();

    if (data) {
      setMessages(prev => prev.map(m => m.id === optId ? data : m));
      onConversationUpdate?.();
    }
    setSending(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleInput = (e) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const initials = getInitials(otherUser);
  const displayName = getDisplayName(otherUser);

  return (
    <div className={styles.chatPanel}>
      {/* Header */}
      <div className={styles.chatHeader}>
        <div className={styles.convAvatar} style={{ width: 40, height: 40, borderRadius: 10, fontSize: 14 }}>
          {initials}
        </div>
        <div className={styles.chatHeaderInfo}>
          <div className={styles.chatHeaderName}>
            {displayName}
            <Icon name="solar:alt-arrow-right-linear" size={12} color="var(--neutral-300)" />
          </div>
          <div className={styles.chatHeaderMeta}>{otherUser.email}</div>
        </div>
        <div className={styles.chatHeaderActions}>
          <ActionButton icon="solar:phone-linear"      size="S" tooltip="Call" />
          <div className={styles.divider} />
          <ActionButton icon="solar:videocamera-linear" size="S" tooltip="Video" />
          <div className={styles.divider} />
          <ActionButton icon="solar:magnifer-linear"   size="S" tooltip="Search" />
          <div className={styles.divider} />
          <ActionButton icon="solar:info-circle-linear" size="S" tooltip="Info" />
          <div className={styles.divider} />
          <ActionButton icon="solar:menu-dots-bold"    size="S" tooltip="More" />
        </div>
      </div>

      {/* Messages */}
      <div className={styles.chatMessages}>
        {loading ? (
          <div className={styles.chatLoading}>Loading messages…</div>
        ) : messages.length === 0 ? (
          <div className={styles.chatEmpty}>
            <div className={styles.chatEmptyAvatar}>{initials}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--neutral-500)' }}>{displayName}</div>
            <div style={{ fontSize: 13, color: 'var(--neutral-300)' }}>No messages yet. Say hello!</div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.sender_id === currentUser.id;
            const prevMsg = messages[idx - 1];
            const showTimestamp = shouldShowTimestamp(msg, prevMsg);
            const showAvatar = !isOwn && (!prevMsg || prevMsg.sender_id !== msg.sender_id);
            return (
              <div key={msg.id}>
                {showTimestamp && <div className={styles.msgDateSep}>{formatMsgTime(msg.created_at)}</div>}
                <div
                  className={[styles.msgRow, isOwn ? styles.own : ''].filter(Boolean).join(' ')}
                  style={{ marginTop: showTimestamp || showAvatar ? 8 : 2 }}
                >
                  {!isOwn && (
                    <div className={styles.msgAvatar} style={{ visibility: showAvatar ? 'visible' : 'hidden' }}>
                      {initials}
                    </div>
                  )}
                  <div className={[styles.msgBubble, isOwn ? styles.mine : styles.other].join(' ')}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={styles.chatInput}>
        <div className={styles.chatInputToolbar}>
          <label className={styles.chatInputSwitch}>
            <div className={styles.switchTrack}><div className={styles.switchThumb} /></div>
            <span className={styles.switchLabel}>Internal</span>
          </label>
          <div className={styles.chatInputActions}>
            <ActionButton icon="solar:paperclip-linear"          size="S" tooltip="Attach file" />
            <ActionButton icon="solar:emoji-funny-square-linear" size="S" tooltip="Emoji" />
            <ActionButton icon="solar:gallery-add-linear"        size="S" tooltip="Image" />
            <ActionButton icon="solar:clock-circle-linear"       size="S" tooltip="Schedule" />
          </div>
        </div>

        <div className={styles.chatInputRow}>
          <textarea
            ref={textareaRef}
            className={styles.chatInputBox}
            placeholder="Visible to everyone • Shift+Enter to change the line"
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <Button
            variant="primary"
            size="L"
            iconOnly
            leadingIcon="solar:plain-2-bold"
            disabled={!inputValue.trim() || sending}
            onClick={sendMessage}
          />
        </div>

        <div className={styles.chatInputFooter}>
          <span style={{ fontSize: 12, color: 'var(--neutral-300)' }}>
            Press Enter to send •{' '}
            <span style={{ color: 'var(--primary-300)', cursor: 'pointer' }}>Change</span>
          </span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--neutral-300)', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: 14, height: 14, accentColor: 'var(--primary-300)' }} />
            Archive on send
          </label>
        </div>
      </div>
    </div>
  );
}
