// TCPA / compliance enrichment per patient
const PATIENT_TCPA = {
  p1:  { tcpaOptIn: true, tcpaTimezone: 'ET', preferredCallWindow: '8:00 AM – 9:00 PM', outreachCategory: 'post-visit', priority: 2 },
  p2:  { tcpaOptIn: true, tcpaTimezone: 'CT', preferredCallWindow: '9:00 AM – 6:00 PM', outreachCategory: 'post-visit', priority: 1 },
  p3:  { tcpaOptIn: true, tcpaTimezone: 'ET', preferredCallWindow: '8:00 AM – 9:00 PM', outreachCategory: 'post-visit', priority: 2 },
  p4:  { tcpaOptIn: false, tcpaTimezone: 'PT', preferredCallWindow: '10:00 AM – 5:00 PM', outreachCategory: 'post-visit', priority: 1 },
  p5:  { tcpaOptIn: true, tcpaTimezone: 'ET', preferredCallWindow: '8:00 AM – 9:00 PM', outreachCategory: 'refill', priority: 2 },
  p6:  { tcpaOptIn: true, tcpaTimezone: 'MT', preferredCallWindow: '9:00 AM – 7:00 PM', outreachCategory: 'post-visit', priority: 3 },
  p7:  { tcpaOptIn: true, tcpaTimezone: 'CT', preferredCallWindow: '8:00 AM – 9:00 PM', outreachCategory: 'care-gap', priority: 3 },
  p8:  { tcpaOptIn: true, tcpaTimezone: 'ET', preferredCallWindow: '8:00 AM – 9:00 PM', outreachCategory: 'post-visit', priority: 2 },
  p9:  { tcpaOptIn: true, tcpaTimezone: 'ET', preferredCallWindow: '10:00 AM – 6:00 PM', outreachCategory: 'post-visit', priority: 2 },
  p10: { tcpaOptIn: true, tcpaTimezone: 'PT', preferredCallWindow: '9:00 AM – 8:00 PM', outreachCategory: 'appointment', priority: 3 },
  p11: { tcpaOptIn: true, tcpaTimezone: 'ET', preferredCallWindow: '8:00 AM – 9:00 PM', outreachCategory: 'post-visit', priority: 1 },
  p12: { tcpaOptIn: true, tcpaTimezone: 'CT', preferredCallWindow: '8:00 AM – 9:00 PM', outreachCategory: 'care-gap', priority: 3 },
  p13: { tcpaOptIn: false, tcpaTimezone: 'ET', preferredCallWindow: '10:00 AM – 4:00 PM', outreachCategory: 'waitlist', priority: 4 },
  p14: { tcpaOptIn: true, tcpaTimezone: 'PT', preferredCallWindow: '9:00 AM – 7:00 PM', outreachCategory: 'post-visit', priority: 1 },
};

const _rawPatients = [
  {
    id: 'p1', initials: 'RH', name: 'Ralph Halvorson',
    gender: 'M', age: '52y 5m', memberId: '#2468029989898', enrolled: true, language: 'en',
    agentAssigned: 'Anna', agentRole: 'TOC Outreach', outreachDots: ['success','pending','pending'],
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
      { sender: 'agent', name: 'Anna', text: "Great. I'd like to ask you a few questions about how you've been feeling since discharge. Have you experienced any new symptoms or worsening of existing ones?", time: '9:46 PM' },
      { sender: 'patient', name: 'Terri Schulist', text: "I've been taking all my medications, but I'm not sure about the new antibiotic dosage.", time: '9:47 PM' },
      { sender: 'agent', name: 'Anna', text: "Let me verify that for you. The antibiotic should be taken twice daily with food. Would you like me to send the instructions in Spanish?", time: '9:47 PM' }
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
      { sender: 'patient', name: 'Annette Brave', text: 'Yes, that sounds helpful. Sign me up.', time: '10:13 AM' },
      { sender: 'patient', name: 'Annette Brave', text: "When is my follow-up appointment? I want to make sure I don't miss it.", time: '10:14 AM' },
      { sender: 'agent', name: 'Anna', text: "Your follow-up is scheduled for next Tuesday at 2 PM with Dr. Chen. I'll send you a reminder the day before.", time: '10:14 AM' }
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
    ],
    liveGoals: [
      { name: 'Patient Outreach', done: false, time: null },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello, this is Anna from Fold Health calling for Glenn Bauch regarding post-discharge follow-up. Is Glenn available?", time: '2:30 PM' },
      { sender: 'agent', name: 'Anna', text: "Unable to reach patient. Leaving voicemail with callback number and will retry.", time: '2:31 PM' }
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
      { sender: 'agent', name: 'Anna', text: "I can help with that. Let me verify your current medications and make sure everything is in order.", time: '11:31 AM' },
      { sender: 'patient', name: 'Marcus Ziemann', text: "I ran out of my rescue inhaler last night. Can you help me get a refill?", time: '11:32 AM' },
      { sender: 'agent', name: 'Anna', text: "I'll contact your pharmacy right away to process the refill. In the meantime, if you experience severe shortness of breath, please call 911.", time: '11:32 AM' }
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
    dischargeDate: '11/01/2025', facility: "St. Luke's", admitReason: 'Elective knee replacement', attempts: [],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:05' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello, this is Fold Health calling for your post-discharge follow-up after your knee replacement at St. Luke's. How is your recovery going?", time: '10:00 AM' },
      { sender: 'patient', name: 'Ms. Lloyd Pagac', text: "It's been tough but physical therapy is helping. The pain is manageable with medication.", time: '10:00 AM' },
      { sender: 'agent', name: 'Anna', text: "Glad to hear PT is going well. Let me review your current medications and make sure everything is on track.", time: '10:01 AM' }
    ]
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
    dischargeDate: '11/01/2025', facility: 'ER – Eastside', admitReason: 'Urinary tract infection', attempts: [],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:12' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Kendra, this is Fold Health calling to follow up after your recent ER visit at ER – Eastside for a urinary tract infection. How are you feeling?", time: '2:00 PM' },
      { sender: 'patient', name: 'Kendra Crona', text: "Better, but I still have some discomfort. I'm finishing the antibiotics they gave me.", time: '2:00 PM' },
      { sender: 'agent', name: 'Anna', text: "It's important to complete the full antibiotic course. Let me check on your follow-up appointment and review your medications.", time: '2:01 PM' }
    ]
  },
  {
    id: 'p8', initials: 'DW', name: 'Diana Welch',
    gender: 'F', age: '55y 2m', memberId: '#2468029990001', enrolled: true, language: 'en',
    agentAssigned: '', agentRole: '', outreachDots: ['success','success','pending'],
    lace: 'High', tocType: 'IP',
    outreachType: '48h', outreachLeft: '6h left', onCall: false, callDuration: null,
    status: 'scheduled', scheduledTime: '11/16/2025 09:00 AM', goals: null,
    nextAction: 'Follow-up medication check',
    aiInsights: [
      { label: 'Diabetes Mgmt', cls: 'ai-tag-care', icon: 'solar:clipboard-heart-bold' },
      { label: 'Med Non-Adherence', cls: 'ai-tag-med', icon: 'solar:pill-bold' }
    ],
    tocStatus: 'enrolled', dueOn: '08/01/2025', outreachAttended: 2, outreachDate: '11/13/25', nextOutreach: '11/20/2025',
    startDate: '08/20/2025', lastAdmission: '09/20/2025', assignee: 'Robin Bang', assigneeInitials: 'RB',
    readmission: 'No', tasks: 1, carePlanStatus: 'updated',
    dischargeDate: '11/05/2025', facility: 'Memorial Hospital', admitReason: 'Diabetic ketoacidosis', attempts: [],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:08' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Diana, this is Fold Health calling for your post-discharge follow-up after your stay at Memorial Hospital for diabetic ketoacidosis. How are you managing?", time: '9:00 AM' },
      { sender: 'patient', name: 'Diana Welch', text: "I'm checking my blood sugar regularly now. The insulin doses are a bit confusing though.", time: '9:00 AM' },
      { sender: 'agent', name: 'Anna', text: "I understand, insulin management can be tricky. Let me review your dosing schedule and make sure we get you set up with an endocrinology follow-up.", time: '9:01 AM' }
    ]
  },
  {
    id: 'p9', initials: 'JR', name: 'James Rivera',
    gender: 'M', age: '72y 0m', memberId: '#2468029990002', enrolled: true, language: 'en',
    agentAssigned: '', agentRole: '', outreachDots: ['success','pending','pending'],
    lace: 'High', tocType: 'IP',
    outreachType: '48h', outreachLeft: '1h left', onCall: false, callDuration: null,
    status: 'scheduled', scheduledTime: '11/14/2025 02:00 PM', goals: null,
    nextAction: 'Confirm PCP appointment',
    aiInsights: [
      { label: 'Readmission Risk', cls: 'ai-tag-risk', icon: 'solar:danger-triangle-bold' },
      { label: 'Fall Risk', cls: 'ai-tag-social', icon: 'solar:running-2-bold' }
    ],
    tocStatus: 'engaged', dueOn: '07/15/2025', outreachAttended: 1, outreachDate: '11/12/25', nextOutreach: '11/18/2025',
    startDate: '08/10/2025', lastAdmission: '09/10/2025', assignee: 'Ignacio Beer', assigneeInitials: 'IB',
    readmission: 'Yes', tasks: 2, carePlanStatus: 'pending',
    dischargeDate: '11/04/2025', facility: 'VA Medical Center', admitReason: 'COPD exacerbation', attempts: [],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:20' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello James, this is Fold Health calling to follow up after your recent stay at the VA Medical Center for COPD. How is your breathing today?", time: '2:00 PM' },
      { sender: 'patient', name: 'James Rivera', text: "It's been better with the new inhaler, but I get winded going up stairs.", time: '2:00 PM' },
      { sender: 'agent', name: 'Anna', text: "That's common during recovery. Let's make sure your PCP appointment is confirmed and review your inhaler technique.", time: '2:01 PM' }
    ]
  },
  {
    id: 'p10', initials: 'SN', name: 'Sandra Nguyen',
    gender: 'F', age: '45y 11m', memberId: '#2468029990003', enrolled: false, language: 'vi',
    agentAssigned: '', agentRole: '', outreachDots: ['failed','pending','pending'],
    lace: 'Medium', tocType: 'ED',
    outreachType: '7d', outreachLeft: '3d left', onCall: false, callDuration: null,
    status: 'scheduled', scheduledTime: '11/15/2025 01:00 PM', goals: null,
    nextAction: 'Retry outreach – language barrier noted',
    aiInsights: [
      { label: 'Language Barrier', cls: 'ai-tag-social', icon: 'solar:user-block-bold' },
      { label: 'Care Coordination', cls: 'ai-tag-care', icon: 'solar:clipboard-list-bold' }
    ],
    tocStatus: 'attempted', dueOn: '09/01/2025', outreachAttended: 0, outreachDate: null, nextOutreach: '11/15/2025',
    startDate: '08/25/2025', lastAdmission: '09/25/2025', assignee: 'You', assigneeInitials: 'ME',
    readmission: 'No', tasks: 1, carePlanStatus: 'none',
    dischargeDate: '11/03/2025', facility: 'ER – Downtown', admitReason: 'Abdominal pain', attempts: [
      { time: '11/06/2025 09:00 AM', outcome: 'No answer – language barrier' }
    ],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:15' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Sandra, this is Fold Health calling to follow up after your ER visit at ER – Downtown for abdominal pain. Do you have an interpreter available or would you prefer Vietnamese?", time: '1:00 PM' },
      { sender: 'patient', name: 'Sandra Nguyen', text: "My daughter can help translate. The stomach pain is mostly gone now.", time: '1:00 PM' },
      { sender: 'agent', name: 'Anna', text: "That's good to hear. Let me go over your discharge instructions and make sure you have a follow-up appointment scheduled.", time: '1:01 PM' }
    ]
  },
  {
    id: 'p11', initials: 'CM', name: 'Clara Mitchell',
    gender: 'F', age: '34y 2m', memberId: '#2468029990011', enrolled: true, language: 'en',
    agentAssigned: '', agentRole: '', outreachDots: ['success','success','success'],
    lace: 'Low', tocType: 'IP',
    outreachType: '7d', outreachLeft: '6d left', onCall: false, callDuration: null,
    status: 'completed', goals: { met: 3, total: 3 },
    nextAction: 'All goals met – enrollment complete',
    aiInsights: [
      { label: 'Benefits Enrolled', cls: 'ai-tag-care', icon: 'solar:clipboard-check-bold' }
    ],
    tocStatus: 'enrolled', dueOn: '07/20/2025', outreachAttended: 3, outreachDate: '11/10/25', nextOutreach: '11/17/2025',
    startDate: '08/01/2025', lastAdmission: '09/01/2025', assignee: 'Robin Bang', assigneeInitials: 'RB',
    readmission: 'No', tasks: 0, carePlanStatus: 'updated',
    dischargeDate: '10/28/2025', facility: 'Applied Laser Technologies', admitReason: 'Healthcare Benefits Update', attempts: [],
    goalsDetail: [
      { name: 'Patient Outreach', desc: 'Establish first contact regarding benefits.', pass: true },
      { name: 'App Enrollment', desc: 'Help patient download and install Fold Care app.', pass: true },
      { name: 'EHR Consent', desc: 'Securely share EHR access via Milu.', pass: true }
    ],
    callSummary: {
      keyPoints: [
        'Patient recovering well with new healthcare benefits access.',
        'Confirmed DOB (February 21st, 1992) and interest in Collaborative Care.',
        'Discussed Fold Care app and secure EHR sharing via Milu.',
        'Informed patient that data protection and optionality are guaranteed.'
      ],
      actionItems: [
        'Confirm Fold Care app installation.',
        'Verify Milu EHR consent signature status.',
        'Schedule follow-up check-in for app navigation support.'
      ]
    },
    callDate: '11/10/2025 09:30', callDurationFull: '06:12',
    callTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Clara, this is Anna from Fold Health calling regarding your healthcare benefits enrollment. How are you today?", time: '9:30 AM' },
      { sender: 'patient', name: 'Clara Mitchell', text: "I'm doing well, thank you. I'm interested in hearing about those benefits.", time: '9:30 AM' },
      { sender: 'agent', name: 'Anna', text: "That's great. I see we have some new features in the Fold Care app including $0 medical services. Have you had a chance to look at the app yet?", time: '9:31 AM' },
      { sender: 'patient', name: 'Clara Mitchell', text: "Not yet, I was waiting for the secure link you mentioned.", time: '9:31 AM' },
      { sender: 'agent', name: 'Anna', text: "Of course, Clara. I'll send that over right now along with the Milu consent form for your records.", time: '9:32 AM' }
    ]
  },
  {
    id: 'p12', initials: 'ML', name: 'Maria Lopez',
    gender: 'F', age: '57y 6m', memberId: '#2468029990005', enrolled: true, language: 'es',
    agentAssigned: '', agentRole: '', outreachDots: ['success','failed','pending'],
    lace: 'High', tocType: 'IP',
    outreachType: '48h', outreachLeft: '8h left', onCall: false, callDuration: null,
    status: 'scheduled', scheduledTime: '11/14/2025 11:00 AM', goals: null,
    nextAction: 'Reschedule missed appointment',
    aiInsights: [
      { label: 'Transport Barrier', cls: 'ai-tag-social', icon: 'solar:bus-bold' },
      { label: 'Readmission Risk', cls: 'ai-tag-risk', icon: 'solar:danger-triangle-bold' }
    ],
    tocStatus: 'engaged', dueOn: '08/05/2025', outreachAttended: 1, outreachDate: '11/11/25', nextOutreach: '11/16/2025',
    startDate: '08/12/2025', lastAdmission: '09/12/2025', assignee: 'Ignacio Beer', assigneeInitials: 'IB',
    readmission: 'Yes', tasks: 1, carePlanStatus: 'pending',
    dischargeDate: '11/02/2025', facility: 'Community General', admitReason: 'Heart failure', attempts: [],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:10' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Maria, this is Fold Health calling to follow up after your hospitalization at Community General for heart failure. How are you feeling at home?", time: '11:00 AM' },
      { sender: 'patient', name: 'Maria Lopez', text: "I'm okay, but I feel short of breath when I walk too much. I'm trying to take my pills every day.", time: '11:00 AM' },
      { sender: 'agent', name: 'Anna', text: "It's very important to stay on your medications. Let me help schedule your cardiology follow-up and review your prescriptions.", time: '11:01 AM' }
    ]
  },
  {
    id: 'p13', initials: 'BT', name: 'Brian Thompson',
    gender: 'M', age: '43y 8m', memberId: '#2468029990006', enrolled: false, language: 'en',
    agentAssigned: '', agentRole: '', outreachDots: ['pending','pending','pending'],
    lace: 'Low', tocType: 'ED',
    outreachType: '7d', outreachLeft: '5d 4h left', onCall: false, callDuration: null,
    status: 'scheduled', scheduledTime: '11/16/2025 03:30 PM', goals: null,
    nextAction: 'Initial outreach pending',
    aiInsights: [
      { label: 'Substance Use', cls: 'ai-tag-risk', icon: 'solar:danger-triangle-bold' }
    ],
    tocStatus: 'new', dueOn: '11/20/2025', outreachAttended: 0, outreachDate: null, nextOutreach: '11/16/2025',
    startDate: '09/01/2025', lastAdmission: '10/01/2025', assignee: 'You', assigneeInitials: 'ME',
    readmission: 'No', tasks: 0, carePlanStatus: 'none',
    dischargeDate: '11/06/2025', facility: 'ER – Westside', admitReason: 'Laceration repair', attempts: [],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:03' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Brian, this is Fold Health calling to check in after your recent ER visit at ER – Westside for a laceration repair. How is the wound healing?", time: '3:30 PM' },
      { sender: 'patient', name: 'Brian Thompson', text: "It's healing okay. I've been keeping it clean and changing the bandage like they told me.", time: '3:30 PM' },
      { sender: 'agent', name: 'Anna', text: "Great job with wound care. Let me make sure you have a follow-up scheduled to check on healing and remove any stitches if needed.", time: '3:31 PM' }
    ]
  },
  {
    id: 'p14', initials: 'EG', name: 'Elena Garcia',
    gender: 'F', age: '74y 1m', memberId: '#2468029990007', enrolled: true, language: 'es',
    agentAssigned: '', agentRole: '', outreachDots: ['success','success','pending'],
    lace: 'High', tocType: 'IP',
    outreachType: '48h', outreachLeft: '3h left', onCall: false, callDuration: null,
    status: 'scheduled', scheduledTime: '11/13/2025 10:00 AM', goals: null,
    nextAction: 'Medication reconciliation needed',
    aiInsights: [
      { label: 'Polypharmacy', cls: 'ai-tag-med', icon: 'solar:pill-bold' },
      { label: 'Readmission Risk', cls: 'ai-tag-risk', icon: 'solar:danger-triangle-bold' },
      { label: 'Needs CCM Plan', cls: 'ai-tag-care', icon: 'solar:clipboard-heart-bold' }
    ],
    tocStatus: 'enrolled', dueOn: '07/25/2025', outreachAttended: 2, outreachDate: '11/12/25', nextOutreach: '11/15/2025',
    startDate: '08/05/2025', lastAdmission: '09/05/2025', assignee: 'Robin Bang', assigneeInitials: 'RB',
    readmission: 'Yes', tasks: 2, carePlanStatus: 'updated',
    dischargeDate: '11/01/2025', facility: 'St. Mary Hospital', admitReason: 'Stroke (ischemic)', attempts: [],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:18' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Elena, this is Fold Health calling for your post-discharge follow-up from St. Mary Hospital after your stroke. How are you recovering?", time: '10:00 AM' },
      { sender: 'patient', name: 'Elena Garcia', text: "I'm doing therapy every day. My right hand is still weak but getting better slowly.", time: '10:00 AM' },
      { sender: 'agent', name: 'Anna', text: "Recovery takes time, and it sounds like you're making progress. Let me review your medications, especially the blood thinner, and schedule your neurology follow-up.", time: '10:01 AM' }
    ]
  },
  {
    id: 'p15', initials: 'RJ', name: 'Robert Johnson',
    gender: 'M', age: '62y 4m', memberId: '#2468029990008', enrolled: false, language: 'en',
    agentAssigned: '', agentRole: '', outreachDots: ['failed','failed','pending'],
    lace: 'Medium', tocType: 'IP',
    outreachType: '7d', outreachLeft: '2d left', onCall: false, callDuration: null,
    status: 'failed', goals: null,
    nextAction: 'Escalate to supervisor – multiple failed attempts',
    aiInsights: [
      { label: 'Social Isolation', cls: 'ai-tag-social', icon: 'solar:user-block-bold' },
      { label: 'Depression Screen', cls: 'ai-tag-care', icon: 'solar:clipboard-heart-bold' }
    ],
    tocStatus: 'attempted', dueOn: '08/20/2025', outreachAttended: 0, outreachDate: null, nextOutreach: '11/14/2025',
    startDate: '08/18/2025', lastAdmission: '09/18/2025', assignee: 'Ignacio Beer', assigneeInitials: 'IB',
    readmission: 'No', tasks: 1, carePlanStatus: 'none',
    dischargeDate: '11/03/2025', facility: 'Veterans Hospital', admitReason: 'Major depressive episode',
    attempts: [
      { time: '11/07/2025 09:30 AM', outcome: 'No answer' },
      { time: '11/07/2025 02:00 PM', outcome: 'No answer – voicemail left' }
    ],
    liveGoals: [
      { name: 'Patient Outreach', done: false, time: null },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello, this is Anna from Fold Health calling for Robert Johnson regarding post-discharge follow-up from Veterans Hospital. Is Robert available?", time: '9:30 AM' },
      { sender: 'agent', name: 'Anna', text: "Unable to reach patient after multiple attempts. Leaving voicemail with crisis support resources and callback number.", time: '9:31 AM' }
    ]
  },
  {
    id: 'p16', initials: 'AW', name: 'Alice Walker',
    gender: 'F', age: '51y 10m', memberId: '#2468029990009', enrolled: true, language: 'en',
    agentAssigned: '', agentRole: '', outreachDots: ['success','pending','pending'],
    lace: 'Medium', tocType: 'ED',
    outreachType: '7d', outreachLeft: '4d left', onCall: false, callDuration: null,
    status: 'scheduled', scheduledTime: '11/15/2025 09:30 AM', goals: null,
    nextAction: 'Schedule follow-up with specialist',
    aiInsights: [
      { label: 'Asthma Action Plan', cls: 'ai-tag-care', icon: 'solar:clipboard-heart-bold' }
    ],
    tocStatus: 'engaged', dueOn: '09/10/2025', outreachAttended: 1, outreachDate: '11/12/25', nextOutreach: '11/19/2025',
    startDate: '08/22/2025', lastAdmission: '09/22/2025', assignee: 'You', assigneeInitials: 'ME',
    readmission: 'No', tasks: 0, carePlanStatus: 'pending',
    dischargeDate: '11/04/2025', facility: 'ER – Central', admitReason: 'Allergic reaction', attempts: [],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:07' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Alice, this is Fold Health calling to follow up after your ER visit at ER – Central for an allergic reaction. How are you doing?", time: '9:30 AM' },
      { sender: 'patient', name: 'Alice Walker', text: "Much better. The swelling went down and I have my EpiPen now just in case.", time: '9:30 AM' },
      { sender: 'agent', name: 'Anna', text: "Good to hear you have your EpiPen. Let's schedule an allergy specialist follow-up and review your action plan for future reactions.", time: '9:31 AM' }
    ]
  },
  {
    id: 'p17', initials: 'CH', name: 'Carlos Hernandez',
    gender: 'M', age: '69y 5m', memberId: '#2468029990010', enrolled: true, language: 'es',
    agentAssigned: '', agentRole: '', outreachDots: ['success','success','success'],
    lace: 'High', tocType: 'IP',
    outreachType: '48h', outreachLeft: '0h left', onCall: false, callDuration: null,
    status: 'completed', goals: { met: 3, total: 3 },
    nextAction: 'All goals met',
    aiInsights: [
      { label: 'Cardiac Rehab', cls: 'ai-tag-care', icon: 'solar:clipboard-heart-bold' }
    ],
    tocStatus: 'enrolled', dueOn: '07/10/2025', outreachAttended: 3, outreachDate: '11/10/25', nextOutreach: '11/17/2025',
    startDate: '07/28/2025', lastAdmission: '08/28/2025', assignee: 'Robin Bang', assigneeInitials: 'RB',
    readmission: 'No', tasks: 0, carePlanStatus: 'updated',
    dischargeDate: '10/30/2025', facility: 'Heart Center', admitReason: 'Myocardial infarction', attempts: [],
    goalsDetail: [
      { name: 'Patient Outreach', desc: 'Establish first contact within 2 business days of discharge.', pass: true },
      { name: 'Schedule ToC Appointment', desc: 'Book follow-up with cardiac rehab program.', pass: true },
      { name: 'Medication Review', desc: 'Review cardiac medications and lifestyle modifications.', pass: true }
    ],
    callSummary: {
      keyPoints: [
        'Patient reports feeling stronger each day since MI hospitalization.',
        'Started cardiac rehabilitation program and attending sessions regularly.',
        'Taking all prescribed medications including beta-blocker and statin.',
        'Family involved in care and monitoring dietary changes.'
      ],
      actionItems: [
        'Follow up on cardiac rehab progress in 2 weeks.',
        'Send heart-healthy diet resources in Spanish.',
        'Coordinate with PCP for comprehensive metabolic panel.'
      ]
    },
    callDate: '11/10/2025 14:15', callDurationFull: '07:45',
    callTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hola Carlos, this is Anna from Fold Health. I'm calling to check on your recovery after your heart attack. How are you doing?", time: '2:15 PM' },
      { sender: 'patient', name: 'Carlos Hernandez', text: "Getting better every day. I started the cardiac rehab program last week.", time: '2:15 PM' },
      { sender: 'agent', name: 'Anna', text: "That's excellent progress. Are you taking all your medications regularly — the metoprolol and atorvastatin?", time: '2:16 PM' },
      { sender: 'patient', name: 'Carlos Hernandez', text: "Yes, my daughter set up reminders on my phone. She's been very helpful with the diet changes too.", time: '2:16 PM' },
      { sender: 'agent', name: 'Anna', text: "Family support makes a huge difference. I'll send some heart-healthy recipes in Spanish for your family. Keep up the great work with cardiac rehab!", time: '2:17 PM' }
    ]
  },
  {
    id: 'p18', initials: 'NP', name: 'Nancy Patel',
    gender: 'F', age: '58y 0m', memberId: '#2468029990011', enrolled: false, language: 'hi',
    agentAssigned: '', agentRole: '', outreachDots: ['failed','pending','pending'],
    lace: 'Medium', tocType: 'IP',
    outreachType: '7d', outreachLeft: '3d 8h left', onCall: false, callDuration: null,
    status: 'scheduled', scheduledTime: '11/14/2025 04:00 PM', goals: null,
    nextAction: 'Retry outreach with interpreter',
    aiInsights: [
      { label: 'Language Barrier', cls: 'ai-tag-social', icon: 'solar:user-block-bold' },
      { label: 'Financial Aid', cls: 'ai-tag-social', icon: 'solar:wallet-money-bold' }
    ],
    tocStatus: 'attempted', dueOn: '09/15/2025', outreachAttended: 0, outreachDate: null, nextOutreach: '11/14/2025',
    startDate: '08/28/2025', lastAdmission: '09/28/2025', assignee: 'Ignacio Beer', assigneeInitials: 'IB',
    readmission: 'No', tasks: 1, carePlanStatus: 'none',
    dischargeDate: '11/02/2025', facility: 'Unity Hospital', admitReason: 'Gallbladder surgery',
    attempts: [
      { time: '11/06/2025 11:00 AM', outcome: 'No answer – interpreter needed' }
    ],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:22' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Nancy, this is Fold Health calling to follow up after your gallbladder surgery at Unity Hospital. How are you recovering?", time: '4:00 PM' },
      { sender: 'patient', name: 'Nancy Patel', text: "The incision is healing well. I'm having some trouble with the diet changes after the surgery.", time: '4:00 PM' },
      { sender: 'agent', name: 'Anna', text: "Dietary adjustments after gallbladder removal are very common. Let me review your post-surgical instructions and schedule a follow-up with your surgeon.", time: '4:01 PM' }
    ]
  },
  {
    id: 'p19', initials: 'TM', name: 'Thomas Moore',
    gender: 'M', age: '47y 9m', memberId: '#2468029990012', enrolled: false, language: 'en',
    agentAssigned: '', agentRole: '', outreachDots: ['pending','pending','pending'],
    lace: 'Low', tocType: 'ED',
    outreachType: '7d', outreachLeft: '6d left', onCall: false, callDuration: null,
    status: 'scheduled', scheduledTime: '11/17/2025 10:00 AM', goals: null,
    nextAction: 'Initial contact – new patient',
    aiInsights: [
      { label: 'Substance Use', cls: 'ai-tag-risk', icon: 'solar:danger-triangle-bold' },
      { label: 'Mental Health', cls: 'ai-tag-care', icon: 'solar:clipboard-heart-bold' }
    ],
    tocStatus: 'new', dueOn: '11/25/2025', outreachAttended: 0, outreachDate: null, nextOutreach: '11/17/2025',
    startDate: '09/05/2025', lastAdmission: '10/05/2025', assignee: 'You', assigneeInitials: 'ME',
    readmission: 'No', tasks: 0, carePlanStatus: 'none',
    dischargeDate: '11/07/2025', facility: 'ER – South', admitReason: 'Anxiety/panic attack', attempts: [],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:14' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Thomas, this is Fold Health calling to follow up after your recent ER visit at ER – South for a panic attack. How have you been feeling?", time: '10:00 AM' },
      { sender: 'patient', name: 'Thomas Moore', text: "I've had a couple more anxiety episodes but nothing as bad as the one that brought me to the ER.", time: '10:00 AM' },
      { sender: 'agent', name: 'Anna', text: "I'm glad it hasn't been as severe. Let's get you connected with a mental health provider and review any medications you were prescribed.", time: '10:01 AM' }
    ]
  },
  {
    id: 'p20', initials: 'LB', name: 'Lisa Brown',
    gender: 'F', age: '63y 7m', memberId: '#2468029990013', enrolled: true, language: 'en',
    agentAssigned: '', agentRole: '', outreachDots: ['success','success','pending'],
    lace: 'High', tocType: 'IP',
    outreachType: '48h', outreachLeft: '5h left', onCall: false, callDuration: null,
    status: 'scheduled', scheduledTime: '11/14/2025 09:00 AM', goals: null,
    nextAction: 'Verify home care setup',
    aiInsights: [
      { label: 'Fall Risk', cls: 'ai-tag-social', icon: 'solar:running-2-bold' },
      { label: 'PT Needed', cls: 'ai-tag-neutral', icon: 'solar:running-2-bold' }
    ],
    tocStatus: 'enrolled', dueOn: '08/10/2025', outreachAttended: 2, outreachDate: '11/12/25', nextOutreach: '11/16/2025',
    startDate: '08/08/2025', lastAdmission: '09/08/2025', assignee: 'Robin Bang', assigneeInitials: 'RB',
    readmission: 'No', tasks: 1, carePlanStatus: 'updated',
    dischargeDate: '11/01/2025', facility: 'Orthopedic Center', admitReason: 'Hip replacement surgery', attempts: [],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:06' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Lisa, this is Fold Health calling to follow up after your hip replacement surgery at Orthopedic Center. How is your mobility?", time: '9:00 AM' },
      { sender: 'patient', name: 'Lisa Brown', text: "I'm using the walker and doing my exercises. The physical therapist comes three times a week.", time: '9:00 AM' },
      { sender: 'agent', name: 'Anna', text: "That's wonderful progress. Let me confirm your orthopedic follow-up and make sure your pain medication is adequate.", time: '9:01 AM' }
    ]
  },
  {
    id: 'p21', initials: 'KS', name: 'Kevin Singh',
    gender: 'M', age: '56y 2m', memberId: '#2468029990014', enrolled: false, language: 'pa',
    agentAssigned: '', agentRole: '', outreachDots: ['failed','failed','failed'],
    lace: 'Medium', tocType: 'IP',
    outreachType: '7d', outreachLeft: '1d left', onCall: false, callDuration: null,
    status: 'failed', goals: null,
    nextAction: 'Final attempt – consider home visit',
    aiInsights: [
      { label: 'Language Barrier', cls: 'ai-tag-social', icon: 'solar:user-block-bold' },
      { label: 'Care Coordination', cls: 'ai-tag-care', icon: 'solar:clipboard-list-bold' }
    ],
    tocStatus: 'attempted', dueOn: '08/25/2025', outreachAttended: 0, outreachDate: null, nextOutreach: '11/12/2025',
    startDate: '08/15/2025', lastAdmission: '09/15/2025', assignee: 'Ignacio Beer', assigneeInitials: 'IB',
    readmission: 'Yes', tasks: 2, carePlanStatus: 'none',
    dischargeDate: '11/01/2025', facility: 'Regional Medical Center', admitReason: 'Pneumonia with sepsis',
    attempts: [
      { time: '11/04/2025 08:00 AM', outcome: 'No answer' },
      { time: '11/05/2025 10:00 AM', outcome: 'No answer – voicemail left' },
      { time: '11/06/2025 03:00 PM', outcome: 'Wrong number' }
    ],
    liveGoals: [
      { name: 'Patient Outreach', done: false, time: null },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello, this is Anna from Fold Health calling for Kevin Singh regarding post-discharge follow-up from Regional Medical Center for pneumonia with sepsis. Is Kevin available?", time: '3:00 PM' },
      { sender: 'agent', name: 'Anna', text: "Unable to reach patient. Wrong number on file. Escalating to care coordinator for updated contact information and possible home visit.", time: '3:01 PM' }
    ]
  },
  {
    id: 'p22', initials: 'JC', name: 'Jennifer Chen',
    gender: 'F', age: '41y 3m', memberId: '#2468029990015', enrolled: true, language: 'zh',
    agentAssigned: '', agentRole: '', outreachDots: ['success','pending','pending'],
    lace: 'Low', tocType: 'ED',
    outreachType: '7d', outreachLeft: '5d 6h left', onCall: false, callDuration: null,
    status: 'scheduled', scheduledTime: '11/16/2025 11:30 AM', goals: null,
    nextAction: 'Follow up on discharge instructions',
    aiInsights: [
      { label: 'Anxiety Mgmt', cls: 'ai-tag-care', icon: 'solar:clipboard-heart-bold' }
    ],
    tocStatus: 'engaged', dueOn: '10/01/2025', outreachAttended: 1, outreachDate: '11/13/25', nextOutreach: '11/20/2025',
    startDate: '09/10/2025', lastAdmission: '10/10/2025', assignee: 'You', assigneeInitials: 'ME',
    readmission: 'No', tasks: 0, carePlanStatus: 'pending',
    dischargeDate: '11/06/2025', facility: 'ER – University', admitReason: 'Migraine with aura', attempts: [],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:09' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Jennifer, this is Fold Health calling to follow up after your ER visit at ER – University for a migraine with aura. How have your headaches been?", time: '11:30 AM' },
      { sender: 'patient', name: 'Jennifer Chen', text: "I had one mild headache since then, but the new medication seems to be helping.", time: '11:30 AM' },
      { sender: 'agent', name: 'Anna', text: "That's encouraging. Let me schedule a neurology follow-up and review your migraine action plan and preventive medications.", time: '11:31 AM' }
    ]
  },
  {
    id: 'p23', initials: 'WD', name: 'William Davis',
    gender: 'M', age: '77y 11m', memberId: '#2468029990016', enrolled: true, language: 'en',
    agentAssigned: '', agentRole: '', outreachDots: ['success','success','success'],
    lace: 'High', tocType: 'IP',
    outreachType: '48h', outreachLeft: '0h left', onCall: false, callDuration: null,
    status: 'completed', goals: { met: 2, total: 3 },
    nextAction: 'Pending – medication review incomplete',
    aiInsights: [
      { label: 'Readmission Risk', cls: 'ai-tag-risk', icon: 'solar:danger-triangle-bold' },
      { label: 'Polypharmacy', cls: 'ai-tag-med', icon: 'solar:pill-bold' },
      { label: 'Fall Risk', cls: 'ai-tag-social', icon: 'solar:running-2-bold' }
    ],
    tocStatus: 'enrolled', dueOn: '07/05/2025', outreachAttended: 3, outreachDate: '11/09/25', nextOutreach: '11/16/2025',
    startDate: '07/20/2025', lastAdmission: '08/20/2025', assignee: 'Robin Bang', assigneeInitials: 'RB',
    readmission: 'Yes', tasks: 1, carePlanStatus: 'updated',
    dischargeDate: '10/25/2025', facility: 'St. Mary Hospital', admitReason: 'Congestive heart failure', attempts: [],
    goalsDetail: [
      { name: 'Patient Outreach', desc: 'Establish first contact within 2 business days of discharge.', pass: true },
      { name: 'Schedule ToC Appointment', desc: 'Book follow-up appointment with PCP.', pass: true },
      { name: 'Medication Review', desc: 'Review heart failure medications and daily weight monitoring.', pass: false }
    ],
    callSummary: {
      keyPoints: [
        'Patient reports mild swelling in ankles, monitoring daily weight as instructed.',
        'Confirmed taking furosemide and lisinopril but missed evening dose occasionally.',
        'PCP follow-up scheduled but patient concerned about transportation.',
        'Needs clarification on fluid intake restrictions.'
      ],
      actionItems: [
        'Schedule follow-up call to review medication adherence.',
        'Arrange transportation assistance for PCP appointment.',
        'Send educational materials on CHF self-management and fluid restriction.'
      ]
    },
    callDate: '11/09/2025 11:00', callDurationFull: '08:15',
    callTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello William, this is Anna from Fold Health. I'm following up after your recent hospitalization for heart failure. How have you been feeling at home?", time: '11:00 AM' },
      { sender: 'patient', name: 'William Davis', text: "Okay mostly, but my ankles are a bit swollen in the evenings.", time: '11:00 AM' },
      { sender: 'agent', name: 'Anna', text: "Are you monitoring your weight daily as your doctor recommended? Any gain of more than 2 pounds in a day should be reported.", time: '11:01 AM' },
      { sender: 'patient', name: 'William Davis', text: "Yes, I check every morning. It's been stable so far. But I sometimes forget my evening pills.", time: '11:01 AM' },
      { sender: 'agent', name: 'Anna', text: "Setting a phone alarm for your evening dose can really help. I also want to make sure you have transportation to your upcoming PCP appointment. Can we arrange that?", time: '11:02 AM' }
    ]
  },
  {
    id: 'p24', initials: 'AF', name: 'Angela Foster',
    gender: 'F', age: '53y 5m', memberId: '#2468029990017', enrolled: false, language: 'en',
    agentAssigned: '', agentRole: '', outreachDots: ['pending','pending','pending'],
    lace: 'Low', tocType: 'ED',
    outreachType: '7d', outreachLeft: '6d 2h left', onCall: false, callDuration: null,
    status: 'scheduled', scheduledTime: '11/18/2025 01:00 PM', goals: null,
    nextAction: 'Initial outreach – new referral',
    aiInsights: [
      { label: 'Financial Aid', cls: 'ai-tag-social', icon: 'solar:wallet-money-bold' }
    ],
    tocStatus: 'new', dueOn: '11/28/2025', outreachAttended: 0, outreachDate: null, nextOutreach: '11/18/2025',
    startDate: '09/15/2025', lastAdmission: '10/15/2025', assignee: 'Ignacio Beer', assigneeInitials: 'IB',
    readmission: 'No', tasks: 0, carePlanStatus: 'none',
    dischargeDate: '11/08/2025', facility: 'ER – Lake View', admitReason: 'Back pain – spinal stenosis', attempts: [],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:11' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Angela, this is Fold Health calling to follow up after your ER visit at ER – Lake View for back pain related to spinal stenosis. How is your pain level?", time: '1:00 PM' },
      { sender: 'patient', name: 'Angela Foster', text: "The pain is manageable with the medication they gave me, but I'm worried about needing surgery.", time: '1:00 PM' },
      { sender: 'agent', name: 'Anna', text: "Let's get you a follow-up with a spine specialist to discuss your options. I'll also review your current pain management plan.", time: '1:01 PM' }
    ]
  },
  {
    id: 'p25', initials: 'RM', name: 'Ricardo Martinez',
    gender: 'M', age: '60y 8m', memberId: '#2468029990018', enrolled: true, language: 'es',
    agentAssigned: '', agentRole: '', outreachDots: ['success','failed','pending'],
    lace: 'Medium', tocType: 'IP',
    outreachType: '7d', outreachLeft: '2d 4h left', onCall: false, callDuration: null,
    status: 'scheduled', scheduledTime: '11/14/2025 03:30 PM', goals: null,
    nextAction: 'Reschedule ToC appointment',
    aiInsights: [
      { label: 'Diabetes Mgmt', cls: 'ai-tag-care', icon: 'solar:clipboard-heart-bold' },
      { label: 'Transport Barrier', cls: 'ai-tag-social', icon: 'solar:bus-bold' }
    ],
    tocStatus: 'engaged', dueOn: '09/01/2025', outreachAttended: 1, outreachDate: '11/11/25', nextOutreach: '11/18/2025',
    startDate: '08/20/2025', lastAdmission: '09/20/2025', assignee: 'You', assigneeInitials: 'ME',
    readmission: 'No', tasks: 1, carePlanStatus: 'pending',
    dischargeDate: '11/03/2025', facility: 'Community Hospital', admitReason: 'Uncontrolled diabetes', attempts: [],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:16' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Ricardo, this is Fold Health calling to follow up after your stay at Community Hospital for uncontrolled diabetes. How are your blood sugar levels?", time: '3:30 PM' },
      { sender: 'patient', name: 'Ricardo Martinez', text: "They've been better since I started the new insulin. I'm checking every morning and before dinner.", time: '3:30 PM' },
      { sender: 'agent', name: 'Anna', text: "That's great discipline. Let me schedule your endocrinology follow-up and make sure your insulin dosing is optimized.", time: '3:31 PM' }
    ]
  },
  {
    id: 'p26', initials: 'HJ', name: 'Helen Jackson',
    gender: 'F', age: '70y 6m', memberId: '#2468029990019', enrolled: true, language: 'en',
    agentAssigned: '', agentRole: '', outreachDots: ['success','success','pending'],
    lace: 'High', tocType: 'IP',
    outreachType: '48h', outreachLeft: '4h left', onCall: false, callDuration: null,
    status: 'scheduled', scheduledTime: '11/13/2025 11:30 AM', goals: null,
    nextAction: 'Review lab results with patient',
    aiInsights: [
      { label: 'Readmission Risk', cls: 'ai-tag-risk', icon: 'solar:danger-triangle-bold' },
      { label: 'Needs CCM Plan', cls: 'ai-tag-care', icon: 'solar:clipboard-heart-bold' }
    ],
    tocStatus: 'enrolled', dueOn: '07/28/2025', outreachAttended: 2, outreachDate: '11/12/25', nextOutreach: '11/15/2025',
    startDate: '08/03/2025', lastAdmission: '09/03/2025', assignee: 'Robin Bang', assigneeInitials: 'RB',
    readmission: 'Yes', tasks: 1, carePlanStatus: 'updated',
    dischargeDate: '11/01/2025', facility: 'Cardiology Center', admitReason: 'Atrial fibrillation', attempts: [],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:19' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Helen, this is Fold Health calling to follow up after your stay at Cardiology Center for atrial fibrillation. How is your heart rhythm feeling?", time: '11:30 AM' },
      { sender: 'patient', name: 'Helen Jackson', text: "I still feel the fluttering sometimes, but the new medication has helped a lot. I'm also watching my blood pressure.", time: '11:30 AM' },
      { sender: 'agent', name: 'Anna', text: "It's good you're monitoring that. Let me review your anticoagulant dosing and schedule your cardiology follow-up to check your rhythm.", time: '11:31 AM' }
    ]
  },
  {
    id: 'p27', initials: 'DO', name: 'David Ortiz',
    gender: 'M', age: '54y 1m', memberId: '#2468029990020', enrolled: false, language: 'es',
    agentAssigned: '', agentRole: '', outreachDots: ['pending','pending','pending'],
    lace: 'Low', tocType: 'ED',
    outreachType: '7d', outreachLeft: '5d 10h left', onCall: false, callDuration: null,
    status: 'scheduled', scheduledTime: '11/17/2025 02:30 PM', goals: null,
    nextAction: 'Initial outreach – new admission',
    aiInsights: [
      { label: 'Substance Use', cls: 'ai-tag-risk', icon: 'solar:danger-triangle-bold' },
      { label: 'Mental Health', cls: 'ai-tag-care', icon: 'solar:clipboard-heart-bold' }
    ],
    tocStatus: 'new', dueOn: '11/22/2025', outreachAttended: 0, outreachDate: null, nextOutreach: '11/17/2025',
    startDate: '09/08/2025', lastAdmission: '10/08/2025', assignee: 'Ignacio Beer', assigneeInitials: 'IB',
    readmission: 'No', tasks: 0, carePlanStatus: 'none',
    dischargeDate: '11/07/2025', facility: 'ER – Harbor', admitReason: 'Alcohol withdrawal', attempts: [],
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:04' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello David, this is Fold Health calling to follow up after your recent ER visit at ER – Harbor. How have you been feeling since discharge?", time: '2:30 PM' },
      { sender: 'patient', name: 'David Ortiz', text: "I'm doing okay. I started attending the outpatient program they recommended.", time: '2:30 PM' },
      { sender: 'agent', name: 'Anna', text: "That's a really positive step. Let me help connect you with ongoing support resources and schedule a follow-up with your care team.", time: '2:31 PM' }
    ]
  }
];

export const patients = _rawPatients.map(p => ({
  ...p,
  ...(PATIENT_TCPA[p.id] || { tcpaOptIn: true, tcpaTimezone: 'ET', preferredCallWindow: '8:00 AM – 9:00 PM', outreachCategory: 'post-visit', priority: 3 }),
}));
