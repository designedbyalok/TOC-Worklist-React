import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Icon } from '../../components/Icon/Icon';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { SearchIconButton } from '../../components/SearchIconButton/SearchIconButton';
import { TableSkeleton } from '../../components/Skeleton/TableSkeleton';
import styles from './AccountPanel.module.css';

const TABS = ['Users', 'Teams', 'Access Control', 'Locations', 'Holiday Configuration', 'Merged Or Delayed', 'Allowed Phone', 'Allowed Emails'];

const ROLE_COLORS = {
  'Physician/Doctor': 'ai-care',
  'Nurse': 'toc-engaged',
  'Medical Assistant': 'status-scheduled',
  'Admin/Practice Manager': 'outreach-post-visit',
  'Billing Specialist': 'compliance-warn',
  'Front Desk Staff/Receptionist': 'ai-neutral',
  'Lab Technician': 'status-queued',
  'Pharmacist': 'ai-med',
  'Health Information Manager (HIM)': 'ai-care',
  'Radiologist': 'toc-engaged',
  'Patient': 'ai-neutral',
};

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '');
}

function getAvatarColor(name) {
  const colors = ['#8C5AE2', '#E74C8B', '#145ECC', '#009B53', '#D9A50B', '#E8742C', '#D72825'];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

/* Mock data for users — will be populated from Supabase auth */
const MOCK_LOCATIONS = ['Toms River', 'Montebello', 'Sparks', 'Chesapeake', 'Visalia', 'Lowell', 'Palm Bay', 'Lawton', 'Oceanside', 'Merced', 'Oakland Park'];
const MOCK_ROLES = Object.keys(ROLE_COLORS);

function generateMockUser(authUser, idx) {
  const meta = authUser.user_metadata || {};
  const name = meta.full_name || meta.first_name
    ? `${meta.first_name || ''} ${meta.last_name || ''}`.trim()
    : authUser.email?.split('@')[0] || `User ${idx + 1}`;
  const email = authUser.email || `user${idx}@fold.health`;
  const role = MOCK_ROLES[idx % MOCK_ROLES.length];
  const location = MOCK_LOCATIONS[idx % MOCK_LOCATIONS.length];
  const extraRoles = Math.floor(Math.random() * 14) + 1;
  const extraLocations = Math.floor(Math.random() * 12);

  return {
    id: authUser.id,
    name,
    email,
    initials: getInitials(name).toUpperCase(),
    avatarColor: getAvatarColor(name),
    status: 'Active',
    role,
    extraRoles,
    location,
    extraLocations,
    createdAt: authUser.created_at,
    lastSignIn: authUser.last_sign_in_at,
  };
}

/* Fallback mock users if Supabase admin API isn't available */
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
  id: `fallback-${i}`,
  ...u,
  initials: getInitials(u.name).toUpperCase(),
  avatarColor: getAvatarColor(u.name),
  status: 'Active',
}));

export function AccountPanel() {
  const [activeTab, setActiveTab] = useState('Users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  // Fetch users from Supabase or use fallback
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        // Try fetching from a users table if it exists
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (!error && data?.length > 0) {
          setUsers(data.map((u, i) => generateMockUser(u, i)));
        } else {
          // Use fallback mock data based on Figma design
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
    return users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.location.toLowerCase().includes(q)
    );
  }, [users, searchVal]);

  return (
    <div className={styles.wrapper}>
      {/* Tab bar */}
      <div className={styles.tabBar}>
        <div className={styles.tabs}>
          {TABS.map(tab => (
            <div
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
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
          <Button variant="secondary" size="L" leadingIcon="solar:add-circle-linear">
            + Invite User
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.tableWrap}>
        {activeTab === 'Users' ? (
          loading ? (
            <TableSkeleton rows={10} />
          ) : (
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
                          <div className={styles.userAvatar} style={{ background: user.avatarColor }}>
                            {user.initials}
                          </div>
                          <div className={styles.userInfo}>
                            <span className={styles.userName}>{user.name}</span>
                            <span className={styles.userEmail}>{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.statusCell}>
                          <Icon name="solar:check-circle-bold" size={14} color="#009B53" />
                          <span className={styles.statusText}>Active</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.rolesCell}>
                          <span className={styles.roleName}>{user.role}</span>
                          {user.extraRoles > 0 && (
                            <Badge variant="ai-neutral" icon="solar:users-group-rounded-linear" label={`+${user.extraRoles}`} />
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={styles.locationCell}>
                          <span>{user.location}</span>
                          {user.extraLocations > 0 && (
                            <Badge variant="ai-neutral" icon="solar:map-point-linear" label={`+${user.extraLocations}`} />
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <ActionButton icon="solar:chat-round-line-linear" size="L" tooltip="Message" />
                          <ActionButton icon="solar:users-group-rounded-linear" size="L" tooltip="Manage Roles" />
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
