import { useRef, useState, useEffect, useCallback } from 'react';
import { Icon } from '../Icon/Icon';
import { ActionButton } from '../ActionButton/ActionButton';
import { Avatar } from '../Avatar/Avatar';
import { Input } from '../Input/Input';
import { Button } from '../Button/Button';
import { CreateNewPopover } from '../CreateNewPopover/CreateNewPopover';
import { PreferencesDrawer } from '../PreferencesDrawer/PreferencesDrawer';
import { ScheduleDrawer } from '../ScheduleDrawer/ScheduleDrawer';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';
import styles from './TopBar.module.css';

/* ── Get user initials from Supabase user_metadata ── */
function getUserInitials(user) {
  if (!user) return 'U';
  const meta = user.user_metadata || {};
  const first = meta.first_name || '';
  const last = meta.last_name || '';
  if (first && last) return (first[0] + last[0]).toUpperCase();
  if (meta.full_name) return meta.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const local = (user.email || '').split('@')[0] || '';
  return local.slice(0, 2).toUpperCase();
}

function getUserDisplayName(user) {
  if (!user) return 'User';
  const meta = user.user_metadata || {};
  if (meta.first_name && meta.last_name) return `${meta.first_name} ${meta.last_name}`;
  if (meta.full_name) return meta.full_name;
  return user.email?.split('@')[0] || 'User';
}

/* ── Profile Popover (Figma node 1904:6423) ── */
function ProfilePopover({ user, onClose, onPreferences }) {
  const popoverRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.user_metadata?.first_name || '');
  const [lastName, setLastName] = useState(user?.user_metadata?.last_name || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const close = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [onClose]);

  const initials = getUserInitials(user);
  const displayName = getUserDisplayName(user);
  const email = user?.email || '';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('__auth_bypass');
    onClose();
  };

  const handleSaveName = async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setSaving(true);
    await supabase.auth.updateUser({
      data: { first_name: firstName.trim(), last_name: lastName.trim(), full_name: `${firstName.trim()} ${lastName.trim()}` },
    });
    setSaving(false);
    setEditing(false);
  };

  return (
    <div ref={popoverRef} style={{
      position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 9999,
      background: '#fff', border: '0.5px solid #D0D6E1', borderRadius: 12,
      padding: 12, width: 300,
      boxShadow: '0 12px 60px rgba(0,0,0,.06)',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* User info */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 8, background: '#FEEEE7',
          border: '0.5px solid #FBCEB7', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 20, color: '#F47A3E',
          fontFamily: "'Inter', sans-serif", flexShrink: 0, position: 'relative',
        }}>
          {initials}
          <div style={{
            position: 'absolute', top: -1, right: -3, width: 10, height: 10,
            borderRadius: '50%', background: '#12B76A', border: '2px solid #fff',
          }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 500, color: '#000', lineHeight: 1.2 }}>{displayName}</div>
          <div style={{ fontSize: 13, color: '#6F7A90', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</div>
        </div>
      </div>

      {/* Editable name section */}
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, padding: '8px 0', borderTop: '0.5px solid #E9ECF1', borderBottom: '0.5px solid #E9ECF1' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: '#6F7A90', marginBottom: 2, display: 'block' }}>First Name</label>
              <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First" autoFocus />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: '#6F7A90', marginBottom: 2, display: 'block' }}>Last Name</label>
              <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <Button variant="ghost" size="S" onClick={() => setEditing(false)}>Cancel</Button>
            <Button variant="primary" size="S" disabled={saving || !firstName.trim() || !lastName.trim()} onClick={handleSaveName}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Menu items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <button onClick={() => { onClose(); onPreferences?.(); }} style={menuItemStyle} onMouseOver={e => e.currentTarget.style.background = '#F6F7F8'} onMouseOut={e => e.currentTarget.style.background = ''}>
          <Icon name="solar:settings-linear" size={20} color="#3A485F" />
          <span>Preferences</span>
        </button>
        <button onClick={onClose} style={menuItemStyle} onMouseOver={e => e.currentTarget.style.background = '#F6F7F8'} onMouseOut={e => e.currentTarget.style.background = ''}>
          <Icon name="solar:users-group-rounded-linear" size={20} color="#3A485F" />
          <span style={{ flex: 1 }}>Switch Account</span>
          <Icon name="solar:alt-arrow-right-linear" size={12} color="#8A94A8" />
        </button>
        <button onClick={handleLogout} style={{ ...menuItemStyle, color: '#D92D20' }} onMouseOver={e => e.currentTarget.style.background = '#FEF2F2'} onMouseOut={e => e.currentTarget.style.background = ''}>
          <Icon name="solar:logout-2-linear" size={20} color="#D92D20" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}

const menuItemStyle = {
  display: 'flex', alignItems: 'center', gap: 8, padding: 8,
  borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer',
  width: '100%', textAlign: 'left', fontFamily: "'Inter', sans-serif",
  fontSize: 14, fontWeight: 500, color: '#3A485F', transition: 'background .1s',
};

export function TopBar() {
  const toggleSubnav = useAppStore(s => s.toggleSubnav);
  const subnavCollapsed = useAppStore(s => s.subnavCollapsed);
  const activePage = useAppStore(s => s.activePage);
  const showCreateNew = useAppStore(s => s.showCreateNew);
  const setShowCreateNew = useAppStore(s => s.setShowCreateNew);
  const btnRef = useRef(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const initials = getUserInitials(user);
  const isSettings = activePage === 'settings';
  const isAnalytics = activePage === 'analytics';

  return (
    <>
    <header className={styles.topbar}>
      <div className={styles.left}>
        {!isSettings && !isAnalytics && (
          <ActionButton
            icon={subnavCollapsed ? 'solar:alt-arrow-right-linear' : 'solar:sidebar-minimalistic-linear'}
            size="L"
            tooltip="Toggle panel"
            onClick={toggleSubnav}
          />
        )}
        <nav className={styles.breadcrumb}>
          {isAnalytics ? (
            <>
              <a className={styles.breadcrumbLink} href="#" onClick={e => e.preventDefault()}>Analytics</a>
              <span className={styles.sep}>/</span>
              <span className={styles.breadcrumbCurrent}>Fold Insights</span>
            </>
          ) : isSettings ? (
            <>
              <a className={styles.breadcrumbLink} href="#" onClick={e => e.preventDefault()}>Settings</a>
              <span className={styles.sep}>/</span>
              <span className={styles.breadcrumbCurrent}>Automation</span>
            </>
          ) : (
            <>
              <a className={styles.breadcrumbLink} href="#" onClick={e => e.preventDefault()}>Population</a>
              <span className={styles.sep}>/</span>
              <a className={styles.breadcrumbLink} href="#" onClick={e => e.preventDefault()}>Worklists</a>
              <span className={styles.sep}>/</span>
              <span className={styles.breadcrumbCurrent}>TOC</span>
            </>
          )}
        </nav>
      </div>

      <div className={styles.center}>
        <div className={styles.searchBox}>
          <Icon name="solar:magnifer-linear" size={18} color="var(--neutral-200)" />
          <input type="text" placeholder="Search Patients or Members" />
        </div>
        <button className={styles.askUnity}>
          <Icon name="solar:bolt-bold" size={18} />
          Ask Unity
        </button>
      </div>

      <div className={styles.right}>
        <ActionButton
          icon="solar:bell-outline"
          size="L"
          tooltip="Notifications"
          notification
        />
        <div className={styles.createNewWrap}>
          <button
            ref={btnRef}
            className={styles.btnPrimary}
            onClick={() => setShowCreateNew(!showCreateNew)}
          >
            <Icon name="solar:add-circle-bold" size={18} />
            Create New
          </button>
          {showCreateNew && (
            <CreateNewPopover onClose={() => setShowCreateNew(false)} anchorRef={btnRef} />
          )}
        </div>
        <button className={styles.btnSecondary} onClick={() => setShowSchedule(true)}>Schedule</button>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfile(v => !v)}
            title="Profile"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <Avatar variant="provider" initials={initials} />
          </button>
          {showProfile && (
            <ProfilePopover user={user} onClose={() => setShowProfile(false)} onPreferences={() => setShowPreferences(true)} />
          )}
        </div>
      </div>
    </header>

    {showPreferences && <PreferencesDrawer onClose={() => setShowPreferences(false)} />}
    {showSchedule && <ScheduleDrawer onClose={() => setShowSchedule(false)} />}
  </>
  );
}
