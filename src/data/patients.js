export const patients = [
  {
    id: 'p1', initials: 'RH', name: 'Ralph Halvorson',
    gender: 'M', age: '52y 5m', memberId: '#2468029989898', enrolled: true, language: 'en',
    agentAssigned: '', agentRole: '', outreachDots: ['success','pending','pending'],
    lace: 'High', tocType: 'IP',
    outreachType: '48h', outreachLeft: '2h left', onCall: false, callDuration: null,
    status: 'completed', goals: { met: 3, total: 3 },
    nextAction: '__MED_REVIEW__',
    aiInsights: [
      { label: 'Readmission Risk', cls: 'ai-tag-risk', icon: 'solar:danger-triangle-bold' },
      { label: 'Needs CCM Plan', cls: 'ai-tag-care', icon: 'solar:clipboard-heart-bold' },
      { label: 'Med Non-Adherence', cls: 'ai-tag-med', icon: 'solar:pill-bold' }
    ],
    tocStatus: 'enrolled', dueOn: '07/30/2025', outreachAttended: 1, outreachDate: '11/12/25', nextOutreach: '11/19/2025',
    startDate: '08/15/2025', lastAdmission: '09/15/2025', assignee: 'Ignacio Beer', assigneeInitials: 'IB',
    readmission: 'Yes', tasks: 1, carePlanStatus: 'updated',
    dischargeDate: '11/03/2025', facility: 'St. Mary Hospital', admitReason: 'CHF exacerbation', attempts: [],
    goalsDetail: [
      { name: 'Patient Outreach', desc: 'Establish first contact within 2 business days of discharge.', pass: true },
      { name: 'Schedule ToC Appointment', desc: 'Book follow-up appointment with PCP or care coordinator.', pass: true },
      { name: 'Medication Review', desc: 'Review current medications and identify any discrepancies.', pass: true }
    ],
    callSummary: {
      keyPoints: [
        'Patient reported ongoing fatigue and mild shortness of breath. No new symptoms identified.',
        'Confirmed taking prescribed medications as instructed but occasional forgetfulness with evening dose.',
        'Advised to maintain hydration and incorporate light physical activity.',
        'Expressed concern about upcoming lab results and asked for timeline clarification.'
      ],
      actionItems: [
        'Schedule follow-up call next week to review lab results.',
        'Send medication reminder tips via email or app notification.',
        'Share resources on fatigue management and mindfulness practices.'
      ]
    },
    callDate: '11/28/2025 10:55', callDurationFull: '05:29',
    callTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello, this is the Fold Health care support assistant calling as part of your Transitions of Care follow-up program. I'm reaching out because you were recently discharged from the hospital, and we want to make sure you're recovering safely. Is now a good time to talk for about 5 minutes?", time: '9:28 PM' },
      { sender: 'patient', name: 'Ralph Halvorson', text: 'Yes, sure', time: '9:28 PM' },
      { sender: 'agent', name: 'Anna', text: "That is great. To make sure I'm speaking with the right person, could you please confirm your full name and date of birth?", time: '9:29 PM' },
      { sender: 'patient', name: 'Ralph Halvorson', text: 'My name is Ralph Halvorson. And my date of birth is March fifteenth nineteen seventy-three.', time: '9:29 PM' },
      { sender: 'agent', name: 'Anna', text: 'Thank you Ralph. Can you confirm what day you returned home from the hospital or facility?', time: '9:30 PM' }
    ],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:10' },
      { name: 'Schedule ToC Appointment', done: true, time: '2:05' },
      { name: 'Medication Review', done: true, time: '3:42' }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Ralph, this is Fold Health calling for your follow-up after your recent hospital stay. How are you feeling today?", time: '10:55 AM' },
      { sender: 'patient', name: 'Ralph Halvorson', text: 'Better than last week, but still some shortness of breath.', time: '10:55 AM' },
      { sender: 'agent', name: 'Anna', text: "I'm glad to hear you're improving. Let me go through a few things with you to make sure your recovery is on track.", time: '10:56 AM' }
    ]
  },
  {
    id: 'p2', initials: 'TS', name: 'Terri Schulist',
    gender: 'F', age: '61y 8m', memberId: '#2468029989898', enrolled: true, language: 'es',
    agentAssigned: '', agentRole: '', outreachDots: ['failed','success','pending'],
    lace: 'High', tocType: 'IP',
    outreachType: '48h', outreachLeft: '12h left', onCall: false, callDuration: null,
    status: 'scheduled', scheduledTime: '11/15/2025 10:30 AM', goals: null,
    nextAction: 'Initial outreach — first contact attempt',
    aiInsights: [
      { label: 'High Risk Patient', cls: 'ai-tag-risk', icon: 'solar:shield-warning-bold' },
      { label: 'Fall Risk', cls: 'ai-tag-social', icon: 'solar:running-2-bold' }
    ],
    tocStatus: 'engaged', dueOn: '04/25/2024', outreachAttended: 1, outreachDate: '11/12/25', nextOutreach: '11/14/2025',
    startDate: '08/15/2025', lastAdmission: '09/15/2025', assignee: 'Robin Bang', assigneeInitials: 'RB',
    readmission: 'No', tasks: 0, carePlanStatus: 'none',
    dischargeDate: '11/03/2025', facility: 'General Hospital', admitReason: 'Pneumonia', attempts: [],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '2:28' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello, this is the Fold Health care support assistant. I'm calling to follow up after your recent hospital stay. Is this a good time?", time: '9:45 PM' },
      { sender: 'patient', name: 'Terri Schulist', text: 'Yes, go ahead.', time: '9:45 PM' },
      { sender: 'agent', name: 'Anna', text: "Great. I'd like to ask you a few questions about how you've been feeling since discharge. Have you experienced any new symptoms or worsening of existing ones?", time: '9:46 PM' }
    ]
  },
  {
    id: 'p3', initials: 'AB', name: 'Annette Brave',
    gender: 'O', age: '48y 4m', memberId: '#2468029989898', enrolled: true, language: 'yue',
    agentAssigned: '', agentRole: '', outreachDots: ['success','pending','pending'],
    lace: 'High', tocType: 'ED',
    outreachType: '48h', outreachLeft: '4h left', onCall: false, callDuration: null,
    status: 'scheduled', scheduledTime: '11/15/2025 11:00 AM', goals: null,
    nextAction: 'Callback scheduled – inbound call detected',
    aiInsights: [
      { label: 'Financial Aid', cls: 'ai-tag-social', icon: 'solar:wallet-money-bold' },
      { label: 'Social Isolation', cls: 'ai-tag-social', icon: 'solar:user-block-bold' },
      { label: 'Depression Screen', cls: 'ai-tag-care', icon: 'solar:clipboard-heart-bold' }
    ],
    tocStatus: 'engaged', dueOn: '07/08/2024', outreachAttended: 1, outreachDate: '11/12/25', nextOutreach: '11/13/2025',
    startDate: '08/15/2025', lastAdmission: '09/15/2025', assignee: 'You', assigneeInitials: 'ME',
    readmission: 'No', tasks: 2, carePlanStatus: 'pending',
    dischargeDate: '11/04/2025', facility: 'ER – City Medical', admitReason: 'Chest pain, rule out ACS', attempts: [],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:15' },
      { name: 'Schedule ToC Appointment', done: true, time: '3:02' },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hi Annette, this is Fold Health calling. We're following up on your recent ER visit. How are you feeling today?", time: '10:12 AM' },
      { sender: 'patient', name: 'Annette Brave', text: "I'm doing better, the chest pain hasn't come back.", time: '10:12 AM' },
      { sender: 'agent', name: 'Anna', text: "That's good to hear. We'd like to offer you enrollment in our Transitional Care program. Would you be interested?", time: '10:13 AM' },
      { sender: 'patient', name: 'Annette Brave', text: 'Yes, that sounds helpful. Sign me up.', time: '10:13 AM' }
    ]
  },
  {
    id: 'p4', initials: 'GB', name: 'Glenn Bauch',
    gender: 'F', age: '66y 1m', memberId: '#2468029989898', enrolled: false, language: 'zh',
    agentAssigned: '', agentRole: '', outreachDots: ['failed','failed','failed'],
    lace: 'Medium', tocType: 'IP',
    outreachType: '7d', outreachLeft: '3d 5h left', onCall: false,
    status: 'failed', goals: null,
    nextAction: 'Paused – awaiting coordinator review',
    aiInsights: [
      { label: 'Transport Barrier', cls: 'ai-tag-social', icon: 'solar:bus-bold' },
      { label: 'Care Coordination', cls: 'ai-tag-care', icon: 'solar:clipboard-list-bold' }
    ],
    tocStatus: 'attempted', dueOn: '08/12/2024', outreachAttended: 0, outreachDate: null, nextOutreach: '11/08/2025',
    startDate: '08/15/2025', lastAdmission: '09/15/2025', assignee: 'Ignacio Beer', assigneeInitials: 'IB',
    readmission: 'No', tasks: 1, carePlanStatus: 'none',
    dischargeDate: '11/02/2025', facility: 'Regional Medical Center', admitReason: 'Hip fracture post-fall',
    attempts: [
      { time: '11/05/2025 08:15 AM', outcome: 'No answer – voicemail left' },
      { time: '11/05/2025 10:45 AM', outcome: 'No answer' },
      { time: '11/05/2025 02:30 PM', outcome: 'Line busy' }
    ]
  },
  {
    id: 'p5', initials: 'MZ', name: 'Marcus Ziemann',
    gender: 'O', age: '50y 3m', memberId: '#2468029989898', enrolled: false, language: 'en',
    agentAssigned: '', agentRole: '', outreachDots: ['failed','success','pending'],
    lace: 'Medium', tocType: 'ED',
    outreachType: '7d', outreachLeft: '2d 8h left', onCall: false, callDuration: null,
    status: 'scheduled', scheduledTime: '11/13/2025 03:00 PM', goals: null,
    nextAction: 'Verify medication reconciliation',
    aiInsights: [
      { label: 'Med Non-Adherence', cls: 'ai-tag-med', icon: 'solar:pill-bold' },
      { label: 'Asthma Action Plan', cls: 'ai-tag-care', icon: 'solar:clipboard-heart-bold' }
    ],
    tocStatus: 'engaged', dueOn: '12/17/2024', outreachAttended: 1, outreachDate: '11/12/25', nextOutreach: '11/19/2025',
    startDate: '08/15/2025', lastAdmission: '09/15/2025', assignee: 'You', assigneeInitials: 'ME',
    readmission: 'Yes', tasks: 0, carePlanStatus: 'updated',
    dischargeDate: '11/04/2025', facility: 'ER – Northside', admitReason: 'Severe asthma attack', attempts: [],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '0:45' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Marcus, I'm calling from Fold Health to check in after your recent ER visit for asthma. Are you doing okay?", time: '11:30 AM' },
      { sender: 'patient', name: 'Marcus Ziemann', text: 'Better now, but I ran out of my inhaler refill.', time: '11:30 AM' },
      { sender: 'agent', name: 'Anna', text: "I can help with that. Let me verify your current medications and make sure everything is in order.", time: '11:31 AM' }
    ]
  },
  {
    id: 'p6', initials: 'LP', name: 'Ms. Lloyd Pagac',
    gender: 'M', age: '59y 7m', memberId: '#2468029989898', enrolled: false, language: 'es',
    agentAssigned: '', agentRole: '', outreachDots: ['pending','pending','pending'],
    lace: 'Low', tocType: 'IP',
    outreachType: '7d', outreachLeft: '4d 12h left', onCall: false,
    status: 'scheduled', scheduledTime: '11/12/2025 10:00 AM', goals: null,
    nextAction: 'Call patient today',
    aiInsights: [
      { label: 'Post-Surgical', cls: 'ai-tag-care', icon: 'solar:clipboard-heart-bold' },
      { label: 'PT Needed', cls: 'ai-tag-neutral', icon: 'solar:running-2-bold' }
    ],
    tocStatus: 'new', dueOn: '06/21/2025', outreachAttended: 0, outreachDate: null, nextOutreach: '11/12/2025',
    startDate: '08/15/2025', lastAdmission: '09/15/2025', assignee: 'You', assigneeInitials: 'ME',
    readmission: 'No', tasks: 0, carePlanStatus: 'none',
    dischargeDate: '11/01/2025', facility: "St. Luke's", admitReason: 'Elective knee replacement', attempts: []
  },
  {
    id: 'p7', initials: 'KC', name: 'Kendra Crona',
    gender: 'M', age: '64y 9m', memberId: '#2468029989898', enrolled: false, language: 'en',
    agentAssigned: '', agentRole: '', outreachDots: ['pending','pending','pending'],
    lace: 'Low', tocType: 'ED',
    outreachType: '7d', outreachLeft: '5d left', onCall: false,
    status: 'scheduled', scheduledTime: '11/13/2025 02:00 PM', goals: null,
    nextAction: 'Paused – awaiting coordinator review',
    aiInsights: [
      { label: 'Recurrent UTI', cls: 'ai-tag-risk', icon: 'solar:danger-triangle-bold' },
      { label: 'Antibiotic Adhere.', cls: 'ai-tag-med', icon: 'solar:pill-bold' }
    ],
    tocStatus: 'new', dueOn: '10/04/2024', outreachAttended: 0, outreachDate: null, nextOutreach: '11/13/2025',
    startDate: '08/15/2025', lastAdmission: '09/15/2025', assignee: 'Ignacio Beer', assigneeInitials: 'IB',
    readmission: 'Yes', tasks: 1, carePlanStatus: 'none',
    dischargeDate: '11/01/2025', facility: 'ER – Eastside', admitReason: 'Urinary tract infection', attempts: []
  }
];
