import { useMemo } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { Badge } from '../../../components/Badge/Badge';
import { Avatar } from '../../../components/Avatar/Avatar';
import { useAppStore } from '../../../store/useAppStore';
// No local fallback — data loaded from DB via store

const thStyle = {
  textAlign: 'left', padding: '8px 16px', color: '#6F7A90', fontWeight: 500,
  fontSize: 12, whiteSpace: 'nowrap', borderBottom: '1px solid #D0D6E1',
  background: 'var(--neutral-0)', position: 'sticky', top: 0,
};
const tdStyle = { padding: '10px 16px', fontSize: 13, color: 'var(--neutral-400)', verticalAlign: 'middle' };

export function ChatSettingsPanel({ searchQuery = '' }) {
  const showToast = useAppStore(s => s.showToast);
  const setChatGroupDetailId = useAppStore(s => s.setChatGroupDetailId);
  const chatGroupsData = useAppStore(s => s.chatGroupsData) || [];

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return chatGroupsData;
    const q = searchQuery.toLowerCase();
    return chatGroupsData.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.users.some(u => u.toLowerCase().includes(q)) ||
      (g.agentName || '').toLowerCase().includes(q)
    );
  }, [chatGroupsData, searchQuery]);

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Inter', sans-serif" }}>
      <thead>
        <tr>
          <th style={thStyle}>Group Name</th>
          <th style={thStyle}>Active Chat Groups</th>
          <th style={thStyle}>Group Users</th>
          <th style={{ ...thStyle, cursor: 'pointer' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Location <Icon name="solar:sort-vertical-linear" size={12} color="#8A94A8" />
            </span>
          </th>
          <th style={thStyle}>Last Updated</th>
          <th style={thStyle}>Action</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map(g => (
          <tr
            key={g.id}
            style={{ borderBottom: '1px solid #EAECF0', cursor: 'pointer', transition: 'background .1s' }}
            onClick={() => setChatGroupDetailId(g.id)}
            onMouseOver={e => e.currentTarget.style.background = 'var(--primary-25, #faf8ff)'}
            onMouseOut={e => e.currentTarget.style.background = ''}
          >
            <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--neutral-500)' }}>
              {g.name}
            </td>
            <td style={tdStyle}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--neutral-400)' }}>
                <Icon name="solar:users-group-rounded-linear" size={14} color="var(--neutral-300)" />
                {g.activeChats}
              </span>
            </td>
            <td style={tdStyle}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {g.users.slice(0, 1).map((u, i) => {
                  const initials = u.split(' ').map(n => n[0]).join('').slice(0, 2);
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Avatar variant="assignee" initials={initials} />
                      <span style={{ fontSize: 13, color: 'var(--neutral-400)' }}>{u}</span>
                    </div>
                  );
                })}
                {(g.users.length + g.roles.length) > 1 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    padding: '1px 6px', borderRadius: 4, fontSize: 11, fontWeight: 500,
                    color: 'var(--primary-300)', background: 'var(--primary-50, #F5F0FF)',
                    border: '0.5px solid var(--primary-200)',
                  }}>
                    <Icon name="solar:users-group-rounded-linear" size={10} color="var(--primary-300)" />
                    +{g.users.length + g.roles.length - 1}
                  </span>
                )}
              </div>
            </td>
            <td style={{ ...tdStyle, fontSize: 13, color: 'var(--neutral-300)' }}>{g.location}</td>
            <td style={{ ...tdStyle, fontSize: 12, color: 'var(--neutral-200)' }}>
              {g.updated} by {g.updatedBy}
            </td>
            <td style={tdStyle} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                  onClick={() => setChatGroupDetailId(g.id)}>
                  <Icon name="solar:pen-linear" size={16} color="var(--neutral-200)" />
                </button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                  onClick={() => showToast('More options')}>
                  <Icon name="solar:menu-dots-linear" size={16} color="var(--neutral-200)" />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {filtered.length === 0 && (
          <tr>
            <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--neutral-200)' }}>
              <Icon name="solar:chat-square-linear" size={32} color="var(--neutral-200)" />
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--neutral-300)', marginTop: 8 }}>No groups found</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your search or create a new group.</div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
