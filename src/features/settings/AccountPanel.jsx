import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../store/useAppStore';
import { Icon } from '../../components/Icon/Icon';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { Avatar } from '../../components/Avatar/Avatar';
import { Drawer } from '../../components/Drawer/Drawer';
import { Input } from '../../components/Input/Input';
import { SearchIconButton } from '../../components/SearchIconButton/SearchIconButton';
import { TableSkeleton } from '../../components/Skeleton/TableSkeleton';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { useTableSort } from '../../components/Table/useTableSort';
import { SortableHeader } from '../../components/Table/SortableHeader';
import { AuditLogContent } from './panels/AuditLogDrawer';
import styles from './AccountPanel.module.css';

const ALL_TABS = ['Users', 'Teams', 'Access Control', 'Locations', 'Holiday Configuration', 'Merged Or Delayed', 'Allowed Phone', 'Allowed Emails'];

const ROLE_COLORS = {
  'Physician/Doctor': 'ai-care', 'Nurse': 'toc-engaged', 'Medical Assistant': 'status-scheduled',
  'Admin/Practice Manager': 'outreach-post-visit', 'Billing Specialist': 'compliance-warn',
  'Front Desk Staff/Receptionist': 'ai-neutral', 'Lab Technician': 'status-queued',
  'Pharmacist': 'ai-med', 'Health Information Manager (HIM)': 'ai-care',
  'Radiologist': 'toc-engaged', 'Patient': 'ai-neutral',
};

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '');
}

const MOCK_ROLES = Object.keys(ROLE_COLORS);
const MOCK_LOCATIONS = ['Toms River', 'Montebello', 'Sparks', 'Chesapeake', 'Visalia', 'Lowell', 'Palm Bay', 'Lawton', 'Oceanside', 'Merced', 'Oakland Park'];

const FALLBACK_USERS = [
  { name: 'Amy Brenneman', email: 'amy.brenneman@email.com', role: 'Physician/Doctor', location: 'Toms River', extraRoles: 4, extraLocations: 0 },
  { name: 'Michael Corleone', email: 'michael.corleone@email.com', role: 'Nurse', location: 'Montebello', extraRoles: 9, extraLocations: 12 },
  { name: 'Larry Sanders', email: 'larry.sanders@email.com', role: 'Medical Assistant', location: 'Sparks', extraRoles: 6, extraLocations: 0 },
  { name: 'Tina Turner', email: 'tina.turner@email.com', role: 'Admin/Practice Manager', location: 'Chesapeake', extraRoles: 12, extraLocations: 1 },
  { name: 'Manny Grizwald', email: 'manny.grizwald@email.com', role: 'Billing Specialist', location: 'Visalia', extraRoles: 10, extraLocations: 4 },
  { name: 'Bobby Brown', email: 'bobby.brown@email.com', role: 'Front Desk Staff/Receptionist', location: 'Lowell', extraRoles: 0, extraLocations: 2 },
  { name: 'Charlie Chaplin', email: 'charlie.chaplin@email.com', role: 'Lab Technician', location: 'Palm Bay', extraRoles: 13, extraLocations: 3 },
  { name: 'John Doe', email: 'john.doe@email.com', role: 'Pharmacist', location: 'Lawton', extraRoles: 10, extraLocations: 2 },
  { name: 'Bruce Springsteen', email: 'bruce.springsteen@email.com', role: 'Health Information Manager (HIM)', location: 'Oceanside', extraRoles: 14, extraLocations: 40 },
  { name: 'Elon Butters', email: 'elon.butters@email.com', role: 'Radiologist', location: 'Merced', extraRoles: 9, extraLocations: 7 },
  { name: 'Samatha Abington', email: 'samanthab@email.com', role: 'Patient', location: 'Oakland Park', extraRoles: 1, extraLocations: 4 },
].map((u, i) => ({
  id: `fallback-${i}`, ...u,
  initials: getInitials(u.name).toUpperCase(),
  status: 'Active',
}));

/* ── Overflow Tabs: visible tabs + "More" dropdown ── */
function OverflowTabs({ tabs, activeTab, onTabChange }) {
  const [visibleCount, setVisibleCount] = useState(tabs.length);
  const [moreOpen, setMoreOpen] = useState(false);
  const tabsRef = useRef(null);
  const moreBtnRef = useRef(null);

  // Measure how many tabs fit in the available space
  const measure = useCallback(() => {
    const measurer = tabsRef.current;
    if (!measurer) return;
    // Find the .tabs parent container
    const tabsContainer = measurer.closest('[class*="tabs"]') || measurer.parentElement;
    const tabBar = tabsContainer?.parentElement;
    if (!tabBar) return;
    // Measure available width (tab bar minus actions area)
    const actionsEl = tabBar.querySelector('[class*="tabActions"]');
    const availableWidth = tabBar.offsetWidth - (actionsEl?.offsetWidth || 200) - 16;
    // Measure total width of all tabs
    let totalAllTabs = 0;
    const children = measurer.querySelectorAll('[data-tab-item]');
    const widths = [];
    for (const child of children) {
      const w = child.offsetWidth + 4;
      widths.push(w);
      totalAllTabs += w;
    }
    // If all tabs fit, show all (no More button needed)
    if (totalAllTabs <= availableWidth) {
      setVisibleCount(tabs.length);
      return;
    }
    // Otherwise, fit as many as possible leaving 70px for "More ▾"
    let total = 0;
    let count = 0;
    for (const w of widths) {
      if (total + w > availableWidth - 70) break;
      total += w;
      count++;
    }
    setVisibleCount(Math.max(1, count));
  }, [tabs.length]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure, tabs]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!moreOpen) return;
    const close = (e) => { if (!moreBtnRef.current?.contains(e.target)) setMoreOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [moreOpen]);

  // If activeTab is in overflow, swap it with the last visible tab
  const activeIdx = tabs.indexOf(activeTab);
  let displayTabs = [...tabs];
  if (activeIdx >= visibleCount) {
    const swapIdx = visibleCount - 1;
    [displayTabs[swapIdx], displayTabs[activeIdx]] = [displayTabs[activeIdx], displayTabs[swapIdx]];
  }

  const visible = displayTabs.slice(0, visibleCount);
  const overflow = displayTabs.slice(visibleCount);

  return (
    <>
      {/* Hidden measurer */}
      <div ref={tabsRef} style={{ position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap', display: 'flex', gap: 4, pointerEvents: 'none' }}>
        {tabs.map(tab => <div key={tab} data-tab-item style={{ padding: '10px 8px', fontSize: 14, fontWeight: 500 }}>{tab}</div>)}
      </div>

      {/* Visible tabs */}
      {visible.map(tab => (
        <div
          key={tab}
          className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </div>
      ))}

      {/* More dropdown */}
      {overflow.length > 0 && (
        <div style={{ position: 'relative' }} ref={moreBtnRef}>
          <div className={`${styles.tab} ${styles.tabMore} ${overflow.includes(activeTab) ? styles.tabActive : ''}`} onClick={() => setMoreOpen(v => !v)}>
            More<Icon name="solar:alt-arrow-down-linear" size={12} color="currentColor" style={{ marginLeft: 3, flexShrink: 0 }} />
          </div>
          {moreOpen && createPortal(
            <div className={styles.moreDropdown} style={{
              position: 'fixed',
              top: moreBtnRef.current.getBoundingClientRect().bottom + 4,
              left: moreBtnRef.current.getBoundingClientRect().left,
              zIndex: 9999,
            }}>
              {overflow.map(tab => (
                <button key={tab} className={styles.moreItem} onClick={() => { onTabChange(tab); setMoreOpen(false); }}>
                  {tab}
                </button>
              ))}
            </div>,
            document.body
          )}
        </div>
      )}
    </>
  );
}

/* ── Overflow Badge with hover dropdown ── */
function OverflowBadge({ count, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  return (
    <div
      className={styles.overflowBadgeWrap}
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Badge variant="ai-neutral" label={`+${count}`} />
      {open && items.length > 0 && (
        <div className={styles.overflowDropdown}>
          {items.map((item, i) => (
            <div key={i} className={styles.overflowItem}>{item}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AccountPanel() {
  const storeTab = useAppStore(s => s.accountTab);
  const setStoreTab = useAppStore(s => s.setAccountTab);
  // Map store key to display name
  const tabKeyToName = (key) => ALL_TABS.find(t => t.toLowerCase().replace(/ /g, '-') === key) || 'Users';
  const tabNameToKey = (name) => name.toLowerCase().replace(/ /g, '-');
  const [activeTab, setActiveTabLocal] = useState(tabKeyToName(storeTab || 'users'));
  const setActiveTab = (tab) => { setActiveTabLocal(tab); setStoreTab(tabNameToKey(tab)); };
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const showToast = useAppStore(s => s.showToast);

  // Fetch users from profiles table (synced with Supabase Auth)
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data?.length > 0) {
        setUsers(data.map(u => ({
          id: u.id,
          name: u.full_name?.trim() || u.email?.split('@')[0] || 'Unknown',
          email: u.email || '',
          initials: getInitials(u.full_name?.trim() || u.email?.split('@')[0] || '').toUpperCase(),
          status: u.status || 'Active',
          role: u.clinical_roles?.length > 0 ? u.clinical_roles[0] : (u.role || 'Viewer'),
          clinicalRoles: u.clinical_roles || [],
          extraRoles: u.clinical_roles?.length > 1 ? u.clinical_roles.length - 1 : (u.extra_roles || 0),
          location: u.locations?.length > 0 ? u.locations[0] : (u.practice_location || ''),
          locations: u.locations || [],
          extraLocations: u.locations?.length > 1 ? u.locations.length - 1 : (u.extra_locations || 0),
          department: u.department || '',
          phone: u.phone || u.mobile || '',
          avatarUrl: u.avatar_url || '',
          lastActiveAt: u.last_active_at,
          createdAt: u.created_at,
          _raw: u, // raw DB row for edit drawer
        })));
      } else {
        // Fallback to mock data if profiles table doesn't exist yet
        setUsers(FALLBACK_USERS);
      }
    } catch {
      setUsers(FALLBACK_USERS);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Toggle user status (Active/Inactive)
  const toggleUserStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', user.id);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      showToast(`${user.name} ${newStatus === 'Active' ? 'enabled' : 'disabled'}`);
    }
  };

  // Delete user (profiles + auth via Edge Function)
  const deleteUser = async (user) => {
    if (!confirm(`Delete ${user.name}? This will permanently remove them from the platform.`)) return;
    try {
      // Try Edge Function first (deletes from both auth + profiles)
      const { error: fnError } = await supabase.functions.invoke('delete-user', {
        body: { userId: user.id },
      });
      if (fnError) {
        // Fallback: delete from profiles only (if Edge Function not deployed yet)
        await supabase.from('profiles').delete().eq('id', user.id);
      }
      setUsers(prev => prev.filter(u => u.id !== user.id));
      showToast(`${user.name} deleted`);
    } catch {
      // Fallback: delete from profiles only
      await supabase.from('profiles').delete().eq('id', user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      showToast(`${user.name} deleted`);
    }
  };

  // Reset password via Supabase Auth
  const resetPassword = async (user) => {
    if (!user.email) { showToast('No email address for this user'); return; }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/#/reset-password`,
      });
      if (error) showToast(`Error: ${error.message}`);
      else showToast(`Password reset email sent to ${user.email}`);
    } catch {
      showToast('Failed to send password reset email');
    }
  };

  // Save edited user profile to DB
  const saveUserProfile = async (userId, updates) => {
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (!error) {
      await fetchUsers();
      showToast('Profile updated');
      setEditingUser(null);
    } else {
      showToast(`Error: ${error.message}`);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchVal.trim()) return users;
    const q = searchVal.toLowerCase();
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q) || u.location.toLowerCase().includes(q));
  }, [users, searchVal]);

  const { sorted: sortedUsers, sortKey: userSortKey, sortDir: userSortDir, requestSort: requestUserSort } = useTableSort(filteredUsers, 'name');

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabBar}>
        <div className={styles.tabs}>
          <OverflowTabs tabs={ALL_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <div className={styles.tabActions}>
          <div className={styles.searchWrap}>
            {searchOpen ? (
              <div className={styles.searchInput}>
                <Icon name="solar:magnifer-linear" size={15} color="var(--neutral-300)" />
                <input autoFocus type="text" placeholder="Search users..." value={searchVal} onChange={e => setSearchVal(e.target.value)} />
                <button className={styles.searchClose} onClick={() => { setSearchOpen(false); setSearchVal(''); }}>&#x2715;</button>
              </div>
            ) : (
              <SearchIconButton title="Search" onClick={() => setSearchOpen(true)} />
            )}
          </div>
          <ActionButton icon="solar:filter-linear" size="L" tooltip="Filter" />
          <span className={styles.tabDivider} />
          <Button variant="secondary" size="L" leadingIcon="solar:add-circle-linear">+ Invite User</Button>
        </div>
      </div>

      <div className={styles.tableWrap}>
        {activeTab === 'Users' ? (
          loading ? <TableSkeleton rows={10} /> : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <SortableHeader label="User Name" sortKey="name" currentKey={userSortKey} currentDir={userSortDir} onSort={requestUserSort} />
                    <SortableHeader label="Status" sortKey="status" currentKey={userSortKey} currentDir={userSortDir} onSort={requestUserSort} />
                    <SortableHeader label="Roles" sortKey="role" currentKey={userSortKey} currentDir={userSortDir} onSort={requestUserSort} />
                    <SortableHeader label="Practice Location" sortKey="location" currentKey={userSortKey} currentDir={userSortDir} onSort={requestUserSort} />
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className={styles.userCell} onClick={() => setViewingUser(user)} style={{ cursor: 'pointer' }}>
                          <Avatar variant="assignee" initials={user.initials} />
                          <div className={styles.userInfo}>
                            <span className={styles.userName}>{user.name}</span>
                            <span className={styles.userEmail}>{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge
                          variant={user.status === 'Active' ? 'status-completed' : 'status-failed'}
                          icon={user.status === 'Active' ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                          label={user.status}
                        />
                      </td>
                      <td>
                        <div className={styles.rolesCell}>
                          <Badge variant={ROLE_COLORS[user.role] || 'ai-neutral'} label={user.role} />
                          {user.extraRoles > 0 && (
                            <OverflowBadge count={user.extraRoles} items={user.clinicalRoles?.slice(1) || []} />
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={styles.locationCell}>
                          <span>{user.location}</span>
                          {user.extraLocations > 0 && (
                            <OverflowBadge count={user.extraLocations} items={user.locations?.slice(1) || []} />
                          )}
                        </div>
                      </td>
                      <td>
                        <UserActions
                          user={user}
                          onResetPassword={() => resetPassword(user)}
                          onToggleStatus={() => toggleUserStatus(user)}
                          onEdit={() => setEditingUser(user)}
                          onDelete={() => deleteUser(user)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className={styles.emptyState}>
                  <Icon name="solar:magnifer-linear" size={40} color="var(--neutral-150)" />
                  <p className={styles.emptyTitle}>No users found</p>
                </div>
              )}
            </>
          )
        ) : (
          <div className={styles.emptyState}>
            <Icon name="solar:widget-linear" size={40} color="var(--neutral-150)" />
            <p className={styles.emptyTitle}>{activeTab}</p>
            <p className={styles.emptyDesc}>This section is coming soon.</p>
          </div>
        )}
      </div>

      {/* View User Drawer (read-only) */}
      {viewingUser && (
        <ViewUserDrawer
          user={viewingUser}
          onClose={() => setViewingUser(null)}
          onEdit={() => { setEditingUser(viewingUser); setViewingUser(null); }}
        />
      )}

      {/* Edit User Drawer */}
      {editingUser && (
        <EditUserDrawer
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={(updates) => saveUserProfile(editingUser.id, updates)}
        />
      )}
    </div>
  );
}

/* ── User Row Actions: Reset Password, Disable, More (Edit/Delete) ── */

function UserActions({ user, onResetPassword, onToggleStatus, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  return (
    <div className={styles.actions}>
      <ActionButton icon="solar:password-linear" size="L" tooltip="Reset Password" onClick={onResetPassword} />
      <span className={styles.actionDivider} />
      <ActionButton
        icon={user.status === 'Active' ? 'solar:user-cross-linear' : 'solar:user-check-linear'}
        size="L"
        tooltip={user.status === 'Active' ? 'Disable User' : 'Enable User'}
        onClick={onToggleStatus}
      />
      <span className={styles.actionDivider} />
      <div style={{ position: 'relative' }} ref={menuRef}>
        <ActionButton icon="solar:menu-dots-bold" size="L" tooltip="More Options" onClick={() => setMenuOpen(v => !v)} />
        {menuOpen && createPortal(
          <div className={styles.moreDropdown} style={{
            position: 'fixed',
            top: menuRef.current.getBoundingClientRect().bottom + 4,
            right: window.innerWidth - menuRef.current.getBoundingClientRect().right,
            zIndex: 9999,
          }}>
            <button className={styles.moreItem} onClick={() => { onEdit(); setMenuOpen(false); }}>
              <Icon name="solar:pen-linear" size={16} color="var(--neutral-300)" /> Edit User
            </button>
            <div className={styles.moreDivider} />
            <button className={`${styles.moreItem} ${styles.moreItemDanger}`} onClick={() => { onDelete(); setMenuOpen(false); }}>
              <Icon name="solar:trash-bin-minimalistic-linear" size={16} color="var(--status-error)" /> Delete User
            </button>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}

/* ── View User Drawer (Read-Only) ── */

const VIEW_TABS = ['User Details', 'Business Hours', 'Assigned Patients', 'Audit Log'];

function ViewUserDrawer({ user, onClose, onEdit }) {
  const raw = user._raw || {};
  const [viewTab, setViewTab] = useState('User Details');

  const adminRole = raw.admin_role || 'Business/Practice Owner';
  const roles = raw.clinical_roles?.length > 0 ? raw.clinical_roles : (raw.role && raw.role !== 'Viewer' ? [raw.role] : []);
  const locations = raw.locations?.length > 0 ? raw.locations : [];
  const languages = raw.languages?.length > 0 ? raw.languages : [];
  const credentials = raw.credentials?.length > 0 ? raw.credentials : [];
  const licenceStates = raw.licence_states?.length > 0 ? raw.licence_states : [];

  return (
    <Drawer title="User Profile" onClose={onClose} bodyClassName={styles.editDrawerBody} headerStyle={{ padding: '12px 16px' }} titleStyle={{ fontSize: 14 }}>
      {/* User header */}
      <div className={styles.editHeader}>
        <Avatar variant="assignee" initials={user.initials} className={styles.editAvatar} />
        <div className={styles.editHeaderInfo}>
          <div className={styles.editHeaderName}>
            {user.name}
            {user.status === 'Active' && <Icon name="solar:verified-check-bold" size={16} color="#009B53" />}
          </div>
          <span className={styles.editHeaderEmail}>{user.email}</span>
        </div>
        <div className={styles.editHeaderActions}>
          <div className={styles.editHeaderActionItem}>
            <ActionButton icon="solar:phone-calling-rounded-linear" size="L" tooltip="Call" />
            <span className={styles.editHeaderActionLabel}>Call</span>
          </div>
          <span className={styles.editHeaderDivider} />
          <div className={styles.editHeaderActionItem}>
            <ActionButton icon="solar:chat-round-line-linear" size="L" tooltip="Chat" />
            <span className={styles.editHeaderActionLabel}>Chat</span>
          </div>
          <span className={styles.editHeaderDivider} />
          <div className={styles.editHeaderActionItem}>
            <ActionButton icon="solar:videocamera-record-linear" size="L" tooltip="Meet" />
            <span className={styles.editHeaderActionLabel}>Meet</span>
          </div>
          <span className={styles.editHeaderDivider} />
          <ActionButton icon="solar:menu-dots-bold" size="L" tooltip="More" />
        </div>
      </div>

      {/* Inner tabs */}
      <div className={styles.drawerTabs}>
        {VIEW_TABS.map(tab => (
          <div key={tab} className={`${styles.drawerTab} ${viewTab === tab ? styles.drawerTabActive : ''}`} onClick={() => setViewTab(tab)}>
            {tab}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <ActionButton icon="solar:pen-linear" size="S" tooltip="Edit Profile" onClick={onEdit} />
      </div>

      {viewTab === 'Audit Log' ? (
        <div className={styles.formScroll}>
          <AuditLogContent entityType="UserProfile" entityId={user.id} />
        </div>
      ) : viewTab === 'User Details' ? (
        <div className={styles.formScroll}>
          {/* Administrative Role */}
          <div className={styles.viewSection}>
            <div className={styles.viewSectionLabel}>Administrative Role</div>
            <div className={styles.viewBadges}>
              <Badge variant="ai-neutral" label={adminRole} />
            </div>
          </div>

          {/* Roles */}
          {roles.length > 0 && (
            <div className={styles.viewSection}>
              <div className={styles.viewSectionLabel}>Roles</div>
              <div className={styles.viewBadges}>
                {roles.map(r => <Badge key={r} variant="ai-care" label={r} />)}
              </div>
            </div>
          )}

          {/* Location */}
          {locations.length > 0 && (
            <div className={styles.viewSection}>
              <div className={styles.viewSectionLabel}>Location</div>
              <div className={styles.viewBadges}>
                {locations.map(l => <Badge key={l} variant="ai-neutral" label={l} />)}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div className={styles.viewSection}>
              <div className={styles.viewSectionLabel}>Languages</div>
              <div className={styles.viewBadges}>
                {languages.map(l => <Badge key={l} variant="toc-engaged" label={l} />)}
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className={styles.viewSection}>
            <div className={styles.viewSectionTitle}>Basic Info</div>
            <div className={styles.viewGrid}>
              <div className={styles.viewField}>
                <span className={styles.viewFieldLabel}>First Name</span>
                <span className={styles.viewFieldValue}>{raw.first_name || user.name?.split(' ')[0] || '-'}</span>
              </div>
              <div className={styles.viewField}>
                <span className={styles.viewFieldLabel}>Middle Name</span>
                <span className={styles.viewFieldValue}>{raw.middle_name || '-'}</span>
              </div>
              <div className={styles.viewField}>
                <span className={styles.viewFieldLabel}>Last Name</span>
                <span className={styles.viewFieldValue}>{raw.last_name || user.name?.split(' ').slice(1).join(' ') || '-'}</span>
              </div>
              <div className={styles.viewField}>
                <span className={styles.viewFieldLabel}>Date of Birth</span>
                <span className={styles.viewFieldValue}>{raw.date_of_birth || '-'}</span>
              </div>
              <div className={styles.viewField}>
                <span className={styles.viewFieldLabel}>Credentials</span>
                <span className={styles.viewFieldValue}>{credentials.length > 0 ? credentials.join(', ') : '-'}</span>
              </div>
              <div className={styles.viewField}>
                <span className={styles.viewFieldLabel}>Email</span>
                <span className={styles.viewFieldValue}>{user.email || '-'}</span>
              </div>
            </div>
          </div>

          {/* Profile */}
          {raw.bio && (
            <div className={styles.viewSection}>
              <div className={styles.viewFieldLabel}>Profile</div>
              <p className={styles.viewBio}>{raw.bio}</p>
            </div>
          )}

          {/* Licence State & Gender */}
          <div className={styles.viewSection}>
            <div className={styles.viewGrid}>
              <div className={styles.viewField}>
                <span className={styles.viewFieldLabel}>Licence State</span>
                <span className={styles.viewFieldValue}>{licenceStates.length > 0 ? licenceStates.join(', ') : '-'}</span>
              </div>
              <div className={styles.viewField}>
                <span className={styles.viewFieldLabel}>Gender</span>
                <span className={styles.viewFieldValue}>{raw.gender || '-'}</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className={styles.viewSection}>
            <div className={styles.viewSectionTitle}>Contact Info</div>
            <div className={styles.viewGrid}>
              <div className={styles.viewField}>
                <span className={styles.viewFieldLabel}>Mobile Number</span>
                <span className={styles.viewFieldValue}>{raw.mobile || raw.phone || '-'}</span>
              </div>
              <div className={styles.viewField}>
                <span className={styles.viewFieldLabel}>Email</span>
                <span className={styles.viewFieldValue}>{user.email || '-'}</span>
              </div>
              <div className={styles.viewField}>
                <span className={styles.viewFieldLabel}>Fax Number</span>
                <span className={styles.viewFieldValue}>{raw.fax || '-'}</span>
              </div>
              <div className={styles.viewField}>
                <span className={styles.viewFieldLabel}>Zipcode</span>
                <span className={styles.viewFieldValue}>{raw.zip_code || '-'}</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className={styles.viewSection}>
            <div className={styles.viewSectionTitle}>Additional Info</div>
            <div className={styles.viewGrid}>
              <div className={styles.viewField}>
                <span className={styles.viewFieldLabel}>Address Line 1</span>
                <span className={styles.viewFieldValue}>{raw.address_line1 || '-'}</span>
              </div>
              <div className={styles.viewField}>
                <span className={styles.viewFieldLabel}>Address Line 2</span>
                <span className={styles.viewFieldValue}>{raw.address_line2 || '-'}</span>
              </div>
              <div className={styles.viewField}>
                <span className={styles.viewFieldLabel}>State</span>
                <span className={styles.viewFieldValue}>{raw.state || '-'}</span>
              </div>
              <div className={styles.viewField}>
                <span className={styles.viewFieldLabel}>City</span>
                <span className={styles.viewFieldValue}>{raw.city || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Icon name="solar:widget-linear" size={40} color="var(--neutral-150)" />
          <p className={styles.emptyTitle}>{viewTab}</p>
          <p className={styles.emptyDesc}>Coming soon.</p>
        </div>
      )}
    </Drawer>
  );
}

/* ── Edit User Drawer ── */

const ADMIN_ROLES = ['Business/Practice Owner', 'Operations/Clinical Analyst', 'Employer'];
const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const DRAWER_TABS = ['User Details', 'Business Hours', 'Assigned Patients'];
const EHR_SYSTEMS = ['Athena Health', 'Epic', 'Cerner', 'eClinicalWorks', 'Allscripts', 'NextGen', 'Greenway Health', 'DrChrono'];
const LANGUAGE_OPTIONS = ['English', 'Spanish', 'Cantonese', 'Mandarin', 'Vietnamese', 'Korean', 'Tagalog', 'Arabic', 'French', 'Hindi', 'Portuguese', 'Russian'];
const LOCATION_OPTIONS = ['SEB Office', 'Downtown Clinic', 'AstranaCare Centennial Hills', 'Valley Medical Center', 'Sunrise Health', 'Palm Desert Office', 'Riverside Clinic', 'Carson City Center'];

/* Tag input helper — renders removable badges inside an input-like container */
function TagInput({ value = [], onChange, placeholder }) {
  const [inputVal, setInputVal] = useState('');
  const addTag = () => {
    const v = inputVal.trim();
    if (v && !value.includes(v)) { onChange([...value, v]); setInputVal(''); }
  };
  const removeTag = (tag) => onChange(value.filter(t => t !== tag));
  return (
    <div className={styles.tagInput}>
      {value.map(tag => (
        <span key={tag} className={styles.tag}>
          {tag}
          <button className={styles.tagClose} onClick={() => removeTag(tag)}>
            <Icon name="solar:close-linear" size={10} color="var(--neutral-300)" />
          </button>
        </span>
      ))}
      <input
        className={styles.tagInputField}
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
        placeholder={value.length === 0 ? placeholder : ''}
      />
    </div>
  );
}

/* ── Multi-select helper (checkbox list inside a select-like container) ── */
function MultiSelectField({ label, required, options, value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);
  const toggle = (opt) => {
    onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  };
  return (
    <div className={styles.formField}>
      <label className={styles.formLabel}>{label} {required && <span className={styles.required}>*</span>}</label>
      <div ref={ref} style={{ position: 'relative' }}>
        <div className={styles.tagInput} onClick={() => setOpen(v => !v)} style={{ cursor: 'pointer' }}>
          {value.length > 0 ? value.map(v => (
            <span key={v} className={styles.tag}>
              {v}
              <button className={styles.tagClose} onClick={e => { e.stopPropagation(); toggle(v); }}>
                <Icon name="solar:close-linear" size={10} color="var(--neutral-300)" />
              </button>
            </span>
          )) : <span style={{ color: 'var(--neutral-200)', fontSize: 14 }}>Select...</span>}
          <Icon name="solar:alt-arrow-down-linear" size={10} color="var(--neutral-300)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
        </div>
        {open && (
          <div className={styles.multiSelectDropdown}>
            {options.map(opt => (
              <label key={opt} className={styles.multiSelectOption}>
                <input type="checkbox" checked={value.includes(opt)} onChange={() => toggle(opt)} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Inline Audit Log for User Profile ── */
function EditUserDrawer({ user, onClose, onSave }) {
  const raw = user._raw || {};
  const logAudit = useAppStore(s => s.logAudit);
  const showToast = useAppStore(s => s.showToast);
  const [drawerTab, setDrawerTab] = useState('User Details');
  const [form, setForm] = useState({
    first_name: raw.first_name || user.name?.split(' ')[0] || '',
    middle_name: raw.middle_name || '',
    last_name: raw.last_name || user.name?.split(' ').slice(1).join(' ') || '',
    date_of_birth: raw.date_of_birth || '',
    gender: raw.gender || '',
    admin_role: raw.admin_role || 'Business/Practice Owner',
    role: raw.role || user.role || 'Viewer',
    bio: raw.bio || '',
    mobile: raw.mobile || raw.phone || user.phone || '',
    email: raw.email || user.email || '',
    fax: raw.fax || '',
    zip_code: raw.zip_code || '',
    address_line1: raw.address_line1 || '',
    address_line2: raw.address_line2 || '',
    state: raw.state || '',
    city: raw.city || '',
    locations: raw.locations || [],
    languages: raw.languages || [],
    credentials: raw.credentials || [],
    licence_states: raw.licence_states || [],
    clinical_roles: raw.clinical_roles || [],
    ehr_mapping: raw.ehr_mapping || '',
    ehr_user: raw.ehr_user || '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    const updates = {
      full_name: `${form.first_name} ${form.last_name}`.trim(),
      first_name: form.first_name, middle_name: form.middle_name, last_name: form.last_name,
      date_of_birth: form.date_of_birth, gender: form.gender,
      admin_role: form.admin_role, role: form.role, bio: form.bio,
      mobile: form.mobile, fax: form.fax, zip_code: form.zip_code,
      address_line1: form.address_line1, address_line2: form.address_line2,
      state: form.state, city: form.city,
      locations: form.locations, languages: form.languages,
      credentials: form.credentials, licence_states: form.licence_states,
      clinical_roles: form.clinical_roles, ehr_mapping: form.ehr_mapping, ehr_user: form.ehr_user,
    };
    // Build changes for audit log
    const changes = [];
    for (const [key, val] of Object.entries(updates)) {
      const oldVal = raw[key];
      const newStr = Array.isArray(val) ? val.join(', ') : String(val || '');
      const oldStr = Array.isArray(oldVal) ? (oldVal || []).join(', ') : String(oldVal || '');
      if (newStr !== oldStr) changes.push({ field: key, from: oldStr, to: newStr, type: 'text' });
    }
    if (changes.length > 0) {
      logAudit('UserProfile', user.id, user.name, 'updated', `Profile updated: ${changes.map(c => c.field).join(', ')}`, 'Configuration', changes);
    }
    onSave(updates);
  };

  const handleDiscard = () => { onClose(); };

  return (
    <Drawer title="User Profile" onClose={onClose} bodyClassName={styles.editDrawerBody} headerStyle={{ padding: '12px 16px' }} titleStyle={{ fontSize: 14 }}>
      {/* User header — warm gradient */}
      <div className={styles.editHeader}>
        <Avatar variant="assignee" initials={user.initials} className={styles.editAvatar} />
        <div className={styles.editHeaderInfo}>
          <div className={styles.editHeaderName}>
            {user.name}
            {user.status === 'Active' && <Icon name="solar:verified-check-bold" size={16} color="#009B53" />}
          </div>
          <span className={styles.editHeaderEmail}>{user.email}</span>
        </div>
        <div className={styles.editHeaderActions}>
          <div className={styles.editHeaderActionItem}>
            <ActionButton icon="solar:phone-calling-rounded-linear" size="L" tooltip="Call" />
            <span className={styles.editHeaderActionLabel}>Call</span>
          </div>
          <span className={styles.editHeaderDivider} />
          <div className={styles.editHeaderActionItem}>
            <ActionButton icon="solar:chat-round-line-linear" size="L" tooltip="Chat" />
            <span className={styles.editHeaderActionLabel}>Chat</span>
          </div>
          <span className={styles.editHeaderDivider} />
          <div className={styles.editHeaderActionItem}>
            <ActionButton icon="solar:videocamera-record-linear" size="L" tooltip="Meet" />
            <span className={styles.editHeaderActionLabel}>Meet</span>
          </div>
          <span className={styles.editHeaderDivider} />
          <ActionButton icon="solar:menu-dots-bold" size="L" tooltip="More" />
        </div>
      </div>

      {/* Inner tabs */}
      <div className={styles.drawerTabs}>
        {DRAWER_TABS.map(tab => (
          <div key={tab} className={`${styles.drawerTab} ${drawerTab === tab ? styles.drawerTabActive : ''}`} onClick={() => setDrawerTab(tab)}>
            {tab}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <Button variant="ghost" size="S" onClick={handleDiscard}>Discard</Button>
        <Button variant="primary" size="S" onClick={handleSave}>Save</Button>
      </div>

      {drawerTab === 'User Details' ? (
        <div className={styles.formScroll}>
          {/* Administrative Roles */}
          <div className={styles.formSection}>
            <label className={styles.formLabel}>Administrative Roles <span className={styles.required}>*</span></label>
            <RadioGroup value={form.admin_role} onValueChange={v => set('admin_role', v)} className={styles.radioGroup}>
              {ADMIN_ROLES.map(role => (
                <label key={role} className={styles.radioItem}>
                  <RadioGroupItem value={role} />
                  <span>{role}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Clinical & Operational Roles */}
          <div className={styles.formSection}>
            <p className={styles.formHint}>Select at least one role if the user interacts with patients or schedules appointments.</p>
            <MultiSelectField label="Clinical & Operational Roles" required options={MOCK_ROLES} value={form.clinical_roles} onChange={v => { set('clinical_roles', v); if (v.length > 0) set('role', v[0]); }} />
          </div>

          {/* Location */}
          <MultiSelectField label="Location" required options={LOCATION_OPTIONS} value={form.locations} onChange={v => set('locations', v)} />

          {/* Map User to EHR */}
          <div className={styles.formSection}>
            <label className={styles.formLabel}>Map User to EHR <span className={styles.required}>*</span></label>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <Select value={form.ehr_mapping || undefined} onValueChange={v => set('ehr_mapping', v)}>
                  <SelectTrigger><SelectValue placeholder="Select EHR system" /></SelectTrigger>
                  <SelectContent>
                    {EHR_SYSTEMS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className={styles.formField}>
                <Select value={form.ehr_user || undefined} onValueChange={v => set('ehr_user', v)}>
                  <SelectTrigger><SelectValue placeholder="Select EHR user" /></SelectTrigger>
                  <SelectContent>
                    {[`${form.first_name} ${form.last_name} (${form.ehr_mapping || 'EHR'})`, 'Amy Brenneman (Athena Health)', 'John Doe (Epic)', 'Jane Smith (Cerner)'].filter(Boolean).map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Languages */}
          <MultiSelectField label="Languages" required options={LANGUAGE_OPTIONS} value={form.languages} onChange={v => set('languages', v)} />

          {/* Basic Info */}
          <div className={styles.formSection}>
            <h4 className={styles.formSectionTitle}>Basic Info</h4>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>First Name <span className={styles.required}>*</span></label>
                <Input value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="First name" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Middle Name</label>
                <Input value={form.middle_name} onChange={e => set('middle_name', e.target.value)} placeholder="Middle name" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Last Name <span className={styles.required}>*</span></label>
                <Input value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Last name" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Date of Birth</label>
                <div className={styles.dateInputWrap}>
                  <input
                    type="date"
                    className={styles.dateInput}
                    value={form.date_of_birth || ''}
                    onChange={e => set('date_of_birth', e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Credentials <span className={styles.required}>*</span></label>
                <TagInput value={form.credentials} onChange={v => set('credentials', v)} placeholder="e.g. Dr, NP" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Gender <span className={styles.required}>*</span></label>
                <Select value={form.gender || undefined} onValueChange={v => set('gender', v)}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Profile */}
          <div className={styles.formSection}>
            <label className={styles.formLabel}>Profile</label>
            <textarea className={styles.formTextarea} rows={5} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Brief bio or description..." />
          </div>

          {/* Licence State */}
          <div className={styles.formSection}>
            <label className={styles.formLabel}>Licence State <span className={styles.required}>*</span></label>
            <TagInput value={form.licence_states} onChange={v => set('licence_states', v)} placeholder="Add state..." />
          </div>

          {/* Contact Info */}
          <div className={styles.formSection}>
            <h4 className={styles.formSectionTitle}>Contact Info</h4>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Mobile Number <span className={styles.required}>*</span></label>
                <Input value={form.mobile} onChange={e => set('mobile', e.target.value)} placeholder="+1 234 567 890" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Email <span className={styles.required}>*</span></label>
                <Input value={form.email} disabled />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Fax Number <span className={styles.required}>*</span></label>
                <Input value={form.fax} onChange={e => set('fax', e.target.value)} placeholder="+1 234 567 890" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Zip Code <span className={styles.required}>*</span></label>
                <Input value={form.zip_code} onChange={e => set('zip_code', e.target.value)} placeholder="12345" />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className={styles.formSection}>
            <h4 className={styles.formSectionTitle}>Additional Info</h4>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Address Line 1 <span className={styles.required}>*</span></label>
                <Input value={form.address_line1} onChange={e => set('address_line1', e.target.value)} placeholder="Street address" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Address Line 2 <span className={styles.required}>*</span></label>
                <Input value={form.address_line2} onChange={e => set('address_line2', e.target.value)} placeholder="Apt, suite, etc." />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>State <span className={styles.required}>*</span></label>
                <Input value={form.state} onChange={e => set('state', e.target.value)} placeholder="State" />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>City <span className={styles.required}>*</span></label>
                <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Icon name="solar:widget-linear" size={40} color="var(--neutral-150)" />
          <p className={styles.emptyTitle}>{drawerTab}</p>
          <p className={styles.emptyDesc}>Coming soon.</p>
        </div>
      )}
    </Drawer>
  );
}
