import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../../lib/supabase';
import { Icon } from '../../components/Icon/Icon';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { Avatar } from '../../components/Avatar/Avatar';
import { SearchIconButton } from '../../components/SearchIconButton/SearchIconButton';
import { TableSkeleton } from '../../components/Skeleton/TableSkeleton';
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

  // Measure how many tabs fit
  const measure = useCallback(() => {
    const container = tabsRef.current;
    if (!container) return;
    const maxWidth = container.parentElement.offsetWidth - 200; // leave space for actions
    let total = 0;
    let count = 0;
    const children = container.querySelectorAll('[data-tab-item]');
    for (const child of children) {
      total += child.offsetWidth + 4;
      if (total > maxWidth) break;
      count++;
    }
    setVisibleCount(Math.max(1, count));
  }, []);

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
      <div ref={tabsRef} style={{ position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap', display: 'flex', gap: 4 }}>
        {tabs.map(tab => <div key={tab} data-tab-item style={{ padding: '10px 8px', fontSize: 14 }}>{tab}</div>)}
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
          <div className={`${styles.tab} ${overflow.includes(activeTab) ? styles.tabActive : ''}`} onClick={() => setMoreOpen(v => !v)}>
            More <Icon name="solar:alt-arrow-down-linear" size={12} color="currentColor" />
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

export function AccountPanel() {
  const [activeTab, setActiveTab] = useState('Users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (!error && data?.length > 0) {
          setUsers(data.map((u, i) => ({
            id: u.id,
            name: u.full_name || u.email?.split('@')[0] || `User ${i + 1}`,
            email: u.email || '',
            initials: getInitials(u.full_name || u.email?.split('@')[0] || '').toUpperCase(),
            status: 'Active',
            role: MOCK_ROLES[i % MOCK_ROLES.length],
            extraRoles: Math.floor(Math.random() * 14) + 1,
            location: MOCK_LOCATIONS[i % MOCK_LOCATIONS.length],
            extraLocations: Math.floor(Math.random() * 12),
          })));
        } else {
          setUsers(FALLBACK_USERS);
        }
      } catch {
        setUsers(FALLBACK_USERS);
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchVal.trim()) return users;
    const q = searchVal.toLowerCase();
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q) || u.location.toLowerCase().includes(q));
  }, [users, searchVal]);

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
                    <th>User Name</th>
                    <th>Status</th>
                    <th>Roles</th>
                    <th>Practice Location</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className={styles.userCell}>
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
                          <span className={styles.roleName}>{user.role}</span>
                          {user.extraRoles > 0 && <Badge variant="ai-neutral" icon="solar:users-group-rounded-linear" label={`+${user.extraRoles}`} />}
                        </div>
                      </td>
                      <td>
                        <div className={styles.locationCell}>
                          <span>{user.location}</span>
                          {user.extraLocations > 0 && <Badge variant="ai-neutral" icon="solar:map-point-linear" label={`+${user.extraLocations}`} />}
                        </div>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <ActionButton icon="solar:chat-round-line-linear" size="L" tooltip="Message" />
                          <span className={styles.actionDivider} />
                          <ActionButton icon="solar:user-cross-linear" size="L" tooltip={user.status === 'Active' ? 'Disable User' : 'Enable User'} />
                          <span className={styles.actionDivider} />
                          <ActionButton icon="solar:menu-dots-bold" size="L" tooltip="More Options" />
                        </div>
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
    </div>
  );
}
