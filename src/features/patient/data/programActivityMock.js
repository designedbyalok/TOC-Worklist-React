export const PROGRAM_ACTIVITY_BY_MONTH = [
  {
    month: 'January 2025',
    cards: [
      {
        id: 'SNP-Jan',
        date: '1/30',
        day: 'Mon',
        program: 'SNP Program Updates',
        status: 'Engaged',
        statusType: 'success',
        activities: '3 Activities: Previsit Details \u2022 Upload Document \u2022 Send Letter \u2022 Outreach Log',
        avatars: [
          { initials: 'DC', variant: 'assignee' },
          { initials: 'SP', variant: 'assignee' },
          { initials: '+1', variant: 'count' },
        ],
        expanded: true,
        timelineItems: [
          { time: '02:30 PM', coordinator: 'Delores Conn (Co-Ordinator)', title: 'AMTX COC UTR Letter', status: 'Send Successfully to Patient', statusType: 'success', iconType: 'document', iconBg: '#e5f8fb', iconColor: '#109cae' },
          { time: '02:30 PM', coordinator: 'Delores Conn (Co-Ordinator)', title: 'Discharge Summary Document Added', status: '', statusType: '', iconType: 'document', iconBg: '#fdf7e5', iconColor: '#eeb200' },
          { time: '02:30 PM', coordinator: 'Delores Conn (Co-Ordinator)', title: 'Pre-visit Details', status: 'Reviewed', statusType: 'success', iconType: 'clipboard', iconBg: '#eee5ff', iconColor: '#5800ff' },
          { date: '06/01', time: '12:30 PM', coordinator: 'Delores Conn (Co-Ordinator)', title: '4th Outreach - Outgoing Call', status: 'Attended / Scheduled Appointment', statusType: 'success', iconType: 'call', iconBg: '#fff', iconColor: '#6f7a90' },
        ],
      },
    ],
  },
  {
    month: 'December 2024',
    cards: [
      {
        id: 'SNP-Dec',
        date: '12/30',
        day: 'Mon',
        program: 'SNP Program Updates',
        status: 'Engaged',
        statusType: 'success',
        activities: '3 Activities: Previsit Details \u2022 Upload Document \u2022 Send Letter \u2022 Outreach Log',
        avatars: [
          { initials: 'DC', variant: 'assignee' },
          { initials: 'SP', variant: 'assignee' },
          { initials: '+1', variant: 'count' },
        ],
        expanded: false,
        timelineItems: [],
      },
      {
        id: 'TOC-Dec',
        date: '1/11',
        day: 'Mon',
        program: 'TOC Program Updates',
        status: 'UTR',
        statusType: 'error',
        activities: '3 Activities: Previsit Details \u2022 Upload Document \u2022 Send Letter \u2022 Outreach Log',
        avatars: [{ initials: 'DC', variant: 'assignee' }],
        expanded: false,
        timelineItems: [],
      },
      {
        id: 'HUI-Dec',
        date: '12/11',
        day: 'Sat',
        program: 'HUI Program Updates',
        status: 'New',
        statusType: 'primary',
        activities: '3 Activities: Previsit Details \u2022 Upload Document \u2022 Send Letter \u2022 Outreach Log',
        avatars: [
          { initials: 'AJ', variant: 'assignee' },
          { initials: 'SP', variant: 'assignee' },
          { initials: '+1', variant: 'count' },
        ],
        expanded: false,
        timelineItems: [],
      },
    ],
  },
];

export const PROFILE_TABS = [
  'Overview', 'Timeline', 'Notes', 'Assessments', 'Care Management',
  'Tasks', 'Documents', 'Orders & Referrals', 'Demographics',
];

export const CM_FILTERS = [
  { label: 'Date' },
  { label: 'Assigned to' },
  { label: 'Status' },
  { label: 'Program', active: true, value: 'All' },
  { label: 'Action Type' },
  { label: 'Action Status' },
];
