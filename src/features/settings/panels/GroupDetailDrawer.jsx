import { useState, useMemo } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { Avatar } from '../../../components/Avatar/Avatar';
import { Button } from '../../../components/Button/Button';
import { ActionButton } from '../../../components/ActionButton/ActionButton';
import { Drawer } from '../../../components/Drawer/Drawer';
import { Badge } from '../../../components/Badge/Badge';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../../components/ui/tooltip';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import { useAppStore } from '../../../store/useAppStore';
import { Switch } from '../../../components/Switch/Switch';
import { availableUsers, availableRoles } from '../../../data/chatGroups'; // Participant lists — TODO: move to store

const labelStyle = { fontSize: 14, color: 'var(--neutral-300)', fontWeight: 400, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 };
const reqDot = <span style={{ color: 'var(--status-error)', fontSize: 14, lineHeight: 1 }}>*</span>;
const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 4, border: '0.5px solid var(--neutral-150)',
  fontSize: 14, fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box',
  color: 'var(--neutral-400)',
};

export function GroupDetailDrawer() {
  const chatGroupDetailId = useAppStore(s => s.chatGroupDetailId);
  const setChatGroupDetailId = useAppStore(s => s.setChatGroupDetailId);
  const setAgentRulesGroupId = useAppStore(s => s.setAgentRulesGroupId);
  const setBusinessHoursOpen = useAppStore(s => s.setBusinessHoursOpen);
  const addChatGroup = useAppStore(s => s.addChatGroup);
  const updateChatGroup = useAppStore(s => s.updateChatGroup);
  const showToast = useAppStore(s => s.showToast);
  const chatGroupsData = useAppStore(s => s.chatGroupsData) || [];

  const group = chatGroupsData.find(g => g.id === chatGroupDetailId);
  const isNew = chatGroupDetailId === 'new';

  // Form state
  const [scope, setScope] = useState(isNew ? 'location' : 'global');
  const [location, setLocation] = useState('');
  const [groupName, setGroupName] = useState(isNew ? '' : (group?.name || ''));
  const [welcomeMsg, setWelcomeMsg] = useState(isNew ? '' : 'Hey this is a test');
  const [oooMsg, setOooMsg] = useState(isNew ? '' : 'test');

  // Participants state (functional)
  const [selectedUserIds, setSelectedUserIds] = useState(
    isNew ? ['u1', 'u2'] : ['u1', 'u2']
  );
  const [selectedRoleIds, setSelectedRoleIds] = useState(
    isNew ? ['r1', 'r2'] : ['r1', 'r2']
  );
  const [chatEnabled, setChatEnabled] = useState({});
  const [enableAll, setEnableAll] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTab, setSearchTab] = useState('users');
  const [searchOpen, setSearchOpen] = useState(false);

  if (!group && !isNew) return null;

  const selectedUsers = availableUsers.filter(u => selectedUserIds.includes(u.id));
  const selectedRoles = availableRoles.filter(r => selectedRoleIds.includes(r.id));

  const filteredSearchUsers = useMemo(() => {
    if (!searchQuery.trim()) return availableUsers;
    const q = searchQuery.toLowerCase();
    return availableUsers.filter(u => u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredSearchRoles = useMemo(() => {
    if (!searchQuery.trim()) return availableRoles;
    const q = searchQuery.toLowerCase();
    return availableRoles.filter(r => r.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const toggleUser = (userId) => {
    setSelectedUserIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };
  const toggleRole = (roleId) => {
    setSelectedRoleIds(prev => prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]);
  };
  const removeUser = (userId) => setSelectedUserIds(prev => prev.filter(id => id !== userId));
  const removeRole = (roleId) => setSelectedRoleIds(prev => prev.filter(id => id !== roleId));

  const toggleChatForUser = (userId, val) => {
    setChatEnabled(prev => ({ ...prev, [userId]: val }));
  };
  const handleEnableAll = (val) => {
    setEnableAll(val);
    const newMap = {};
    selectedUsers.filter(u => !u.isAgent).forEach(u => { newMap[u.id] = val; });
    setChatEnabled(newMap);
  };
  const clearAll = () => { setSelectedUserIds([]); setSelectedRoleIds([]); setChatEnabled({}); };

  const handleConfigureRules = () => {
    if (!group) return;
    setChatGroupDetailId(null);
    setTimeout(() => setAgentRulesGroupId(group.id), 200);
  };
  const handleBusinessHours = (e) => {
    e.preventDefault();
    setChatGroupDetailId(null);
    setTimeout(() => setBusinessHoursOpen?.(true), 200);
  };

  const title = isNew ? 'Configure Chat Group' : 'Configure Chat Group';
  const ctaLabel = isNew ? 'Create' : 'Update';

  const headerRight = (
    <Button variant="primary" size="L" onClick={async () => {
      if (!groupName.trim()) { showToast('Group name is required'); return; }
      const groupData = {
        name: groupName.trim(),
        users: selectedUsers.filter(u => !u.isAgent).map(u => u.name),
        roles: selectedRoles.map(r => r.name),
        location: scope === 'location' ? (location || 'Global Template') : 'Global Template',
        hasAgent: selectedUsers.some(u => u.isAgent),
        agentName: selectedUsers.find(u => u.isAgent)?.name || null,
        updatedBy: 'Current User',
      };
      if (isNew) {
        await addChatGroup(groupData);
        showToast('Group created');
      } else {
        await updateChatGroup(group.id, groupData);
        showToast('Group updated');
      }
      setChatGroupDetailId(null);
    }}>
      {ctaLabel}
    </Button>
  );

  return (
    <TooltipProvider>
      <Drawer title={title} onClose={() => setChatGroupDetailId(null)} headerRight={headerRight}>
        {/* Create Group for */}
        <div style={{ marginBottom: 20 }}>
          <div style={labelStyle}>Create Group for {reqDot}</div>
          <RadioGroup value={scope} onValueChange={setScope} className="flex gap-6 mt-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: scope === 'location' ? 'var(--neutral-500)' : 'var(--neutral-300)' }}>
              <RadioGroupItem value="location" />
              <span>Location</span>
              <Icon name="solar:info-circle-linear" size={13} color="var(--neutral-200)" />
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: scope === 'global' ? 'var(--neutral-500)' : 'var(--neutral-300)' }}>
              <RadioGroupItem value="global" />
              <span>Global (Template Only)</span>
              <Icon name="solar:info-circle-linear" size={13} color="var(--neutral-200)" />
            </label>
          </RadioGroup>
        </div>

        {/* Location dropdown (only when Location scope) */}
        {scope === 'location' && (
          <div style={{ marginBottom: 20 }}>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Choose the location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-york">New York</SelectItem>
                <SelectItem value="los-angeles">Los Angeles</SelectItem>
                <SelectItem value="chicago">Chicago</SelectItem>
                <SelectItem value="houston">Houston</SelectItem>
                <SelectItem value="philadelphia">Philadelphia</SelectItem>
                <SelectItem value="san-antonio">San Antonio</SelectItem>
                <SelectItem value="phoenix">Phoenix</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Group Name */}
        <div style={{ marginBottom: 4 }}>
          <div style={labelStyle}>Group Name {reqDot}</div>
          <div style={{ position: 'relative' }}>
            <input value={groupName} onChange={e => setGroupName(e.target.value.slice(0, 50))}
              placeholder="Enter group name e.g. ortho group" style={inputStyle} />
            <span style={{ position: 'absolute', right: 12, top: 9, fontSize: 12, color: 'var(--neutral-200)' }}>
              {groupName.length}/50
            </span>
          </div>
        </div>

        {/* Group Name Preview */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--neutral-200)', marginBottom: 6 }}>Group Name Preview</div>
          <div style={{ padding: '12px 16px', background: 'var(--neutral-50)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-50, #F5F0FF)', border: '1.5px solid var(--primary-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="solar:chat-round-dots-linear" size={16} color="var(--primary-300)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: 'var(--neutral-500)' }}>
                [patient_name] - <span style={{ color: 'var(--neutral-200)' }}>{groupName || 'Group Name'}</span>
                <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--neutral-200)' }}>23:54</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--neutral-200)' }}>[patient_name] was added</div>
            </div>
          </div>
        </div>

        {/* Create Group With */}
        <div style={{ marginBottom: 20 }}>
          <div style={labelStyle}>Create Group With <Icon name="solar:info-circle-linear" size={13} color="var(--neutral-200)" /> {reqDot}</div>

          {/* Search input with dropdown */}
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 8, cursor: 'text' }}
              onClick={() => setSearchOpen(true)}>
              <Icon name="solar:magnifer-linear" size={14} color="var(--neutral-200)" />
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search user and care team roles to add in group"
                style={{ border: 'none', outline: 'none', fontSize: 13, color: 'var(--neutral-400)', fontFamily: "'Inter', sans-serif", flex: 1, background: 'transparent' }}
              />
            </div>

            {/* Search Dropdown */}
            {searchOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 5 }} onClick={() => setSearchOpen(false)} />
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                  background: '#fff', border: '0.5px solid var(--neutral-150)', borderRadius: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,.1)', maxHeight: 280, overflow: 'hidden',
                  marginTop: 4,
                }}>
                  {/* Tabs */}
                  <div style={{ display: 'flex', borderBottom: '0.5px solid var(--neutral-150)' }}>
                    {['users', 'roles'].map(tab => (
                      <div key={tab} onClick={() => setSearchTab(tab)} style={{
                        flex: 1, textAlign: 'center', padding: '10px 0', fontSize: 13, cursor: 'pointer',
                        color: searchTab === tab ? 'var(--neutral-500)' : 'var(--neutral-200)',
                        fontWeight: searchTab === tab ? 600 : 400,
                        borderBottom: searchTab === tab ? '2px solid var(--neutral-500)' : '2px solid transparent',
                      }}>
                        {tab === 'users' ? 'Users' : 'Care Team Roles'}
                      </div>
                    ))}
                  </div>

                  {/* List */}
                  <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                    {searchTab === 'users' ? filteredSearchUsers.map(u => {
                      const isSelected = selectedUserIds.includes(u.id);
                      const initials = u.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                      return (
                        <div key={u.id} onClick={() => toggleUser(u.id)} style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                          borderBottom: '0.5px solid var(--neutral-75, #F3F4F7)', cursor: 'pointer',
                        }}>
                          <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: 'var(--primary-300)', width: 16, height: 16, cursor: 'pointer' }} />
                          <Avatar variant={u.isAgent ? 'agent' : 'assignee'} initials={initials} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--neutral-500)' }}>{u.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--neutral-200)' }}>{u.role}</div>
                          </div>
                        </div>
                      );
                    }) : filteredSearchRoles.map(r => {
                      const isSelected = selectedRoleIds.includes(r.id);
                      return (
                        <div key={r.id} onClick={() => toggleRole(r.id)} style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                          borderBottom: '0.5px solid var(--neutral-75, #F3F4F7)', cursor: 'pointer',
                        }}>
                          <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: 'var(--primary-300)', width: 16, height: 16, cursor: 'pointer' }} />
                          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--neutral-500)' }}>{r.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Selected Users and Roles */}
          {(selectedUsers.length > 0 || selectedRoles.length > 0) && (
            <div style={{ border: '0.5px solid var(--neutral-150)', borderRadius: 4, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ padding: '10px 14px', borderBottom: '0.5px solid var(--neutral-150)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--neutral-500)' }}>Selected Users and Roles</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--neutral-300)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={enableAll} onChange={e => handleEnableAll(e.target.checked)}
                      style={{ accentColor: 'var(--primary-300)' }} />
                    Enable all 1:1 Chat
                  </label>
                  <Button variant="danger" size="S" leadingIcon="solar:close-circle-linear" onClick={clearAll}>Clear All Selection</Button>
                </div>
              </div>

              {/* Users section */}
              {selectedUsers.length > 0 && (
                <div style={{ padding: '4px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ fontSize: 12, color: 'var(--neutral-200)' }}>Users</span>
                    <span style={{ fontSize: 11, color: 'var(--neutral-200)', display: 'flex', alignItems: 'center', gap: 2 }}>
                      Allow 1:1 Chat
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span style={{ cursor: 'help', display: 'inline-flex' }}>
                            <Icon name="solar:info-circle-linear" size={11} color="var(--neutral-200)" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" style={{ maxWidth: 200 }}>
                          <p>Enable 1:1 Chat</p>
                          <p style={{ marginTop: 2, opacity: 0.8 }}>Allows patients from the selected location to initiate 1:1 chats with users or user roles that have this setting enabled.</p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </div>
                  {selectedUsers.map(p => {
                    const initials = p.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                    return (
                      <div key={p.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                        borderBottom: '0.5px solid var(--neutral-75, #F3F4F7)',
                      }}>
                        <Avatar variant={p.isAgent ? 'agent' : 'assignee'} initials={initials} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {p.name}
                            {p.isAgent && <Badge variant="ai-care" label="AI Agent" />}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--neutral-200)' }}>{p.role}</div>
                        </div>
                        {p.isAgent ? (
                          <Button variant="tertiary" size="S" leadingIcon="solar:settings-linear" trailingIcon="solar:alt-arrow-right-linear" onClick={handleConfigureRules}>
                            Configure Rules
                          </Button>
                        ) : (
                          <>
                            <Switch checked={chatEnabled[p.id] || false} onChange={(val) => toggleChatForUser(p.id, val)} />
                            <ActionButton icon="solar:close-circle-linear" size="L" tooltip="Remove user" onClick={() => removeUser(p.id)} />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Care Team Roles section */}
              {selectedRoles.length > 0 && (
                <div style={{ padding: '4px 14px', paddingBottom: 10 }}>
                  <div style={{ fontSize: 12, color: 'var(--neutral-200)', padding: '6px 0' }}>Care Team Roles</div>
                  {selectedRoles.map(r => (
                    <div key={r.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 0', borderBottom: '0.5px solid var(--neutral-75, #F3F4F7)',
                    }}>
                      <span style={{ fontSize: 14, color: 'var(--neutral-500)' }}>{r.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Switch checked={chatEnabled[r.id] || false} onChange={(val) => setChatEnabled(prev => ({ ...prev, [r.id]: val }))} />
                        <ActionButton icon="solar:close-circle-linear" size="L" tooltip="Remove role" onClick={() => removeRole(r.id)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Welcome Message */}
        <div style={{ marginBottom: 20 }}>
          <div style={labelStyle}>Welcome Message <Icon name="solar:info-circle-linear" size={13} color="var(--neutral-200)" /></div>
          <div style={{ position: 'relative' }}>
            <textarea value={welcomeMsg} onChange={e => setWelcomeMsg(e.target.value.slice(0, 300))}
              placeholder="Write a welcome message for this group"
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical', lineHeight: 1.5 }} />
            <span style={{ position: 'absolute', right: 12, bottom: 8, fontSize: 11, color: 'var(--neutral-200)' }}>
              {welcomeMsg.length}/300
            </span>
          </div>
        </div>

        {/* OOO Auto Reply */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...labelStyle, color: 'var(--neutral-200)' }}>Out Of Office - Auto Reply <Icon name="solar:info-circle-linear" size={13} color="var(--neutral-200)" /></div>
          <div style={{ position: 'relative' }}>
            <textarea value={oooMsg} onChange={e => setOooMsg(e.target.value.slice(0, 300))}
              placeholder="Set up an automatic reply"
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical', lineHeight: 1.5 }} />
            <span style={{ position: 'absolute', right: 12, bottom: 8, fontSize: 11, color: 'var(--neutral-200)' }}>
              {oooMsg.length}/300
            </span>
          </div>
        </div>

        {/* Business Hours Link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <a href="#" onClick={handleBusinessHours} style={{
            fontSize: 13, color: 'var(--primary-300)', fontWeight: 500, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 3,
          }}>
            See Business Hours <Icon name="solar:arrow-right-up-linear" size={12} color="var(--primary-300)" />
          </a>
        </div>
      </Drawer>
    </TooltipProvider>
  );
}
