// Fallback data for calls feature configuration.
// Used when Supabase tables (call_nav_items, call_lines, call_sessions) are unavailable.

export const FALLBACK_INBOX_ITEMS = [
  { id: 'all',       section: 'inbox', icon: 'solar:inbox-linear',                 label: 'All Calls',    isCustomIcon: false, sortOrder: 1 },
  { id: 'incoming',  section: 'inbox', icon: 'solar:incoming-call-rounded-linear', label: 'Incoming',     isCustomIcon: false, sortOrder: 2 },
  { id: 'outgoing',  section: 'inbox', icon: 'solar:outgoing-call-rounded-linear', label: 'Outgoing',     isCustomIcon: false, sortOrder: 3 },
  { id: 'missed',    section: 'inbox', icon: null,                                 label: 'Missed Calls', isCustomIcon: true,  sortOrder: 4 },
  { id: 'voicemail', section: 'inbox', icon: 'solar:microphone-linear',            label: 'Voicemail',    isCustomIcon: false, sortOrder: 5 },
  { id: 'starred',   section: 'inbox', icon: 'solar:star-linear',                  label: 'Starred',      isCustomIcon: false, sortOrder: 6 },
  { id: 'archived',  section: 'inbox', icon: 'solar:archive-linear',               label: 'Archived',     isCustomIcon: false, sortOrder: 7 },
];

export const FALLBACK_CHANNEL_ITEMS = [
  { id: 'agents',   section: 'channel', icon: 'solar:user-speak-linear',    label: 'Calling Agents', isCustomIcon: false, sortOrder: 1 },
  { id: 'support',  section: 'channel', icon: 'solar:phone-calling-linear', label: 'Support Line',   isCustomIcon: false, sortOrder: 2 },
  { id: 'clinical', section: 'channel', icon: 'solar:stethoscope-linear',   label: 'Clinical Line',  isCustomIcon: false, sortOrder: 3 },
];

export const FALLBACK_CALL_LINES = [
  { id: 'all',      label: 'All Call Lines',            phoneNumber: null             },
  { id: 'support',  label: 'Support — (581) 555-0101',  phoneNumber: '(581) 555-0101' },
  { id: 'clinical', label: 'Clinical — (581) 555-0102', phoneNumber: '(581) 555-0102' },
  { id: 'billing',  label: 'Billing — (581) 555-0103',  phoneNumber: '(581) 555-0103' },
];

export const FALLBACK_CALL_SESSIONS = [
  { id: 'c1',  name: 'Williamy Jammy',    status: 'Call Back',     time: 'Now',   dir: 'outgoing', pinned: true,  active: true  },
  { id: 'c2',  name: 'Dawn Braun',        status: 'Call Back',     time: '08:44', dir: 'outgoing', pinned: true,  active: false },
  { id: 'c3',  name: 'Natalie Welch',     status: 'Call Back',     time: '08:44', dir: 'outgoing', pinned: true,  active: false },
  { id: 'c4',  name: 'Dr. Stacy Quigley', status: 'Missed Call',   time: '08:44', dir: 'missed',   pinned: false, active: false },
  { id: 'c5',  name: 'Natalie Welch',     status: 'Answered Call', time: '08:44', dir: 'incoming', pinned: false, active: false },
  { id: 'c6',  name: 'Toby Quigley',      status: 'Answered Call', time: '08:44', dir: 'incoming', pinned: false, active: false },
  { id: 'c7',  name: 'Natalie Welch',     status: 'Missed Call',   time: '08:44', dir: 'missed',   pinned: false, active: false },
  { id: 'c8',  name: 'Natalie Welch',     status: 'Missed Call',   time: '08:44', dir: 'missed',   pinned: false, active: false },
  { id: 'c9',  name: 'Dawn Braun',        status: 'Missed Call',   time: '08:44', dir: 'missed',   pinned: false, active: false },
  { id: 'c10', name: 'Natalie Welch',     status: 'Incoming',      time: '08:44', dir: 'incoming', pinned: false, active: false },
  { id: 'c11', name: 'Dr. Stacy Quigley', status: 'Missed Call',   time: '08:44', dir: 'missed',   pinned: false, active: false },
  { id: 'c12', name: 'Natalie Welch',     status: 'Answered Call', time: '08:44', dir: 'incoming', pinned: false, active: false },
];
