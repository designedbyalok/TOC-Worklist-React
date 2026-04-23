/* ── Compliance & quality enrichment for call records ── */
const COMPLIANCE_DATA = {
  // completed calls get full compliance
  completed: {
    aiDisclosed: true,
    recordingConsent: 'obtained',
    identityVerified: true,
    emergencyDetected: false,
    tcpaCompliant: 'pass',
  },
  // ongoing calls — consent obtained, identity in-progress
  ongoing: {
    aiDisclosed: true,
    recordingConsent: 'obtained',
    identityVerified: false,
    emergencyDetected: false,
    tcpaCompliant: 'pass',
  },
  // voicemail — minimal compliance (no patient interaction)
  voicemail: {
    aiDisclosed: false,
    recordingConsent: 'na',
    identityVerified: false,
    emergencyDetected: false,
    tcpaCompliant: 'pass',
  },
};

// Per-patient overrides for compliance variety in the prototype
const PATIENT_COMPLIANCE_OVERRIDES = {
  p4: { tcpaCompliant: 'warn', recordingConsent: 'na' }, // Glenn — failed calls
  p10: { identityVerified: false }, // Sandra — interpreter needed
  p14: { emergencyDetected: true }, // Override for demo
};

// Quality & sentiment data for completed calls
const QUALITY_DATA = {
  cd2:  { qualityScore: { overall: 92, intentAccuracy: 95, outcomeAppropriateness: 90, escalationTimeliness: 88, complianceDisclosure: 96 }, sentimentScore: { overall: 78, label: 'positive' } },
  cd4:  { qualityScore: { overall: 78, intentAccuracy: 80, outcomeAppropriateness: 68, escalationTimeliness: 72, complianceDisclosure: 76 }, sentimentScore: { overall: 55, label: 'neutral' } },
  cd6:  { qualityScore: { overall: 85, intentAccuracy: 88, outcomeAppropriateness: 82, escalationTimeliness: 84, complianceDisclosure: 86 }, sentimentScore: { overall: 72, label: 'positive' } },
  cd12: { qualityScore: { overall: 70, intentAccuracy: 75, outcomeAppropriateness: 64, escalationTimeliness: 70, complianceDisclosure: 72 }, sentimentScore: { overall: 42, label: 'negative' } },
  cd16: { qualityScore: { overall: 78, intentAccuracy: 82, outcomeAppropriateness: 76, escalationTimeliness: 74, complianceDisclosure: 80 }, sentimentScore: { overall: 60, label: 'neutral' } },
  cd18: { qualityScore: { overall: 82, intentAccuracy: 85, outcomeAppropriateness: 80, escalationTimeliness: 78, complianceDisclosure: 84 }, sentimentScore: { overall: 65, label: 'positive' } },
  cd21: { qualityScore: { overall: 96, intentAccuracy: 98, outcomeAppropriateness: 95, escalationTimeliness: 92, complianceDisclosure: 98 }, sentimentScore: { overall: 88, label: 'positive' } },
  cdi1: { qualityScore: { overall: 88, intentAccuracy: 90, outcomeAppropriateness: 86, escalationTimeliness: 85, complianceDisclosure: 90 }, sentimentScore: { overall: 75, label: 'positive' } },
  cdi2: { qualityScore: { overall: 65, intentAccuracy: 68, outcomeAppropriateness: 62, escalationTimeliness: 60, complianceDisclosure: 66 }, sentimentScore: { overall: 45, label: 'neutral' } },
  cdi3: { qualityScore: { overall: 94, intentAccuracy: 96, outcomeAppropriateness: 92, escalationTimeliness: 90, complianceDisclosure: 95 }, sentimentScore: { overall: 82, label: 'positive' } },
};

// Escalation data for select calls
const ESCALATION_DATA = {
  cd7:  { trigger: 'max-turns', detail: 'Patient unreachable after 3 attempts', confidence: null, sentiment: null },
  cd12: { trigger: 'sentiment', detail: 'Patient expressed frustration about inhaler refill', confidence: 62, sentiment: -0.35 },
};

// Security metadata
const SECURITY_DATA = {
  completed: { piiScrubbed: true, stateCompliance: 'TX', dataRetentionDays: 90, promptInjectionDetected: false },
  ongoing: { piiScrubbed: false, stateCompliance: 'TX', dataRetentionDays: 90, promptInjectionDetected: false },
  voicemail: { piiScrubbed: true, stateCompliance: 'TX', dataRetentionDays: 90, promptInjectionDetected: false },
};

// Sub-agents and intents for select calls
const SUBAGENT_DATA = {
  cd2:  { subAgentsInvoked: ['Identity Verifier', 'Med Reconciler', 'Appointment Scheduler'], detectedIntents: ['confirm-identity', 'review-medications', 'schedule-followup'] },
  cd21: { subAgentsInvoked: ['Identity Verifier', 'Med Reconciler', 'Appointment Scheduler', 'Cardiac Rehab Referrer'], detectedIntents: ['confirm-identity', 'medication-adherence', 'schedule-followup', 'rehab-referral'] },
  cd4:  { subAgentsInvoked: ['Identity Verifier', 'Language Detector'], detectedIntents: ['confirm-identity', 'language-preference', 'medication-question'] },
};

export function enrichCallRecord(record) {
  const base = COMPLIANCE_DATA[record.callType] || COMPLIANCE_DATA.ongoing;
  const patientOverride = PATIENT_COMPLIANCE_OVERRIDES[record.patientId] || {};
  const quality = QUALITY_DATA[record.id] || null;
  const escalation = ESCALATION_DATA[record.id] || null;
  const security = SECURITY_DATA[record.callType] || SECURITY_DATA.ongoing;
  const subagent = SUBAGENT_DATA[record.id] || null;

  return {
    ...record,
    direction: record.direction || (record.callType === 'voicemail' ? 'missed' : record.callType === 'declined' ? 'declined' : 'outgoing'),
    compliance: { ...base, ...patientOverride },
    qualityScore: quality?.qualityScore || null,
    sentimentScore: quality?.sentimentScore || null,
    escalation,
    security,
    subAgentsInvoked: subagent?.subAgentsInvoked || null,
    detectedIntents: subagent?.detectedIntents || null,
  };
}

const _rawCallDetails = [
  // ===== p1 – Ralph Halvorson (completed) =====
  // Ongoing record (call in progress before completion)
  {
    id: 'cd1',
    patientId: 'p1',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/28/2025 10:55',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:10' },
      { name: 'Schedule ToC Appointment', done: true, time: '2:05' },
      { name: 'Medication Review', done: true, time: '3:42' }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Ralph, this is Fold Health calling for your follow-up after your recent hospital stay. How are you feeling today?", time: '10:55 AM' },
      { sender: 'patient', name: 'Ralph Halvorson', text: 'Better than last week, but still some shortness of breath.', time: '10:55 AM' },
      { sender: 'agent', name: 'Anna', text: "I'm glad to hear you're improving. Let me go through a few things with you to make sure your recovery is on track.", time: '10:56 AM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/28/2025'
  },
  // Completed record
  {
    id: 'cd2',
    patientId: 'p1',
    callType: 'completed',
    agentName: 'Anna',
    startedAt: '11/28/2025 10:55',
    endedAt: '11/28/2025 11:00',
    duration: '05:29',
    liveGoals: null,
    liveTranscript: null,
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
    callTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello, this is the Fold Health care support assistant calling as part of your Transitions of Care follow-up program. I'm reaching out because you were recently discharged from the hospital, and we want to make sure you're recovering safely. Is now a good time to talk for about 5 minutes?", time: '9:28 PM' },
      { sender: 'patient', name: 'Ralph Halvorson', text: 'Yes, sure', time: '9:28 PM' },
      { sender: 'agent', name: 'Anna', text: "That is great. To make sure I'm speaking with the right person, could you please confirm your full name and date of birth?", time: '9:29 PM' },
      { sender: 'patient', name: 'Ralph Halvorson', text: 'My name is Ralph Halvorson. And my date of birth is March fifteenth nineteen seventy-three.', time: '9:29 PM' },
      { sender: 'agent', name: 'Anna', text: 'Thank you Ralph. Can you confirm what day you returned home from the hospital or facility?', time: '9:30 PM' }
    ],
    outcome: null,
    attemptNumber: null,
    createdAt: '11/28/2025'
  },

  // ===== p2 – Terri Schulist (scheduled, has success in outreachDots) =====
  {
    id: 'cd3',
    patientId: 'p2',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/15/2025 10:30',
    endedAt: null,
    duration: null,
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
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/15/2025'
  },
  // Previous successful outreach
  {
    id: 'cd4',
    patientId: 'p2',
    callType: 'completed',
    agentName: 'Anna',
    startedAt: '11/12/2025 09:30',
    endedAt: '11/12/2025 09:36',
    duration: '06:00',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: [
      { name: 'Patient Outreach', desc: 'Establish first contact within 2 business days of discharge.', pass: true },
      { name: 'Schedule ToC Appointment', desc: 'Book follow-up appointment for pneumonia recovery.', pass: false },
      { name: 'Medication Review', desc: 'Review antibiotic regimen and supportive medications.', pass: false }
    ],
    callSummary: {
      keyPoints: [
        'Patient reached successfully for initial outreach after pneumonia hospitalization.',
        'Confirmed taking antibiotics but expressed confusion about dosage timing.',
        'Language preference noted as Spanish for future communications.'
      ],
      actionItems: [
        'Send medication instructions in Spanish.',
        'Schedule follow-up call to complete remaining goals.'
      ]
    },
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/12/2025'
  },

  // ===== p3 – Annette Brave (scheduled, has success in outreachDots) =====
  {
    id: 'cd5',
    patientId: 'p3',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/15/2025 11:00',
    endedAt: null,
    duration: null,
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
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/15/2025'
  },
  // Previous successful outreach
  {
    id: 'cd6',
    patientId: 'p3',
    callType: 'completed',
    agentName: 'Anna',
    startedAt: '11/12/2025 10:00',
    endedAt: '11/12/2025 10:05',
    duration: '05:15',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: [
      { name: 'Patient Outreach', desc: 'Establish first contact after ER discharge.', pass: true },
      { name: 'Schedule ToC Appointment', desc: 'Book follow-up appointment for chest pain evaluation.', pass: false },
      { name: 'Medication Review', desc: 'Review medications prescribed after ACS rule-out.', pass: false }
    ],
    callSummary: {
      keyPoints: [
        'Initial contact made following ER visit for chest pain.',
        'Patient reports chest pain has not recurred since discharge.',
        'Patient interested in Transitional Care enrollment.'
      ],
      actionItems: [
        'Enroll patient in ToC program.',
        'Schedule follow-up to complete remaining goals.'
      ]
    },
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/12/2025'
  },

  // ===== p4 – Glenn Bauch (failed) =====
  // Ongoing record
  {
    id: 'cd7',
    patientId: 'p4',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/05/2025 14:30',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: false, time: null },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello, this is Anna from Fold Health calling for Glenn Bauch regarding post-discharge follow-up. Is Glenn available?", time: '2:30 PM' },
      { sender: 'agent', name: 'Anna', text: "Unable to reach patient. Leaving voicemail with callback number and will retry.", time: '2:31 PM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/05/2025'
  },
  // Attempt 1
  {
    id: 'cd8',
    patientId: 'p4',
    callType: 'voicemail',
    agentName: 'Anna',
    startedAt: '11/05/2025 08:15',
    endedAt: '11/05/2025 08:16',
    duration: '00:45',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: 'No answer – voicemail left',
    attemptNumber: 1,
    createdAt: '11/05/2025'
  },
  // Attempt 2
  {
    id: 'cd9',
    patientId: 'p4',
    callType: 'voicemail',
    agentName: 'Anna',
    startedAt: '11/05/2025 10:45',
    endedAt: '11/05/2025 10:46',
    duration: '00:30',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: 'No answer',
    attemptNumber: 2,
    createdAt: '11/05/2025'
  },
  // Attempt 3
  {
    id: 'cd10',
    patientId: 'p4',
    callType: 'voicemail',
    agentName: 'Anna',
    startedAt: '11/05/2025 14:30',
    endedAt: '11/05/2025 14:31',
    duration: '00:30',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: 'Line busy',
    attemptNumber: 3,
    createdAt: '11/05/2025'
  },

  // ===== p5 – Marcus Ziemann (scheduled, has success in outreachDots) =====
  {
    id: 'cd11',
    patientId: 'p5',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/13/2025 15:00',
    endedAt: null,
    duration: null,
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
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/13/2025'
  },
  // Previous successful outreach
  {
    id: 'cd12',
    patientId: 'p5',
    callType: 'completed',
    agentName: 'Anna',
    startedAt: '11/12/2025 11:00',
    endedAt: '11/12/2025 11:05',
    duration: '05:30',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: [
      { name: 'Patient Outreach', desc: 'Establish first contact after ER discharge.', pass: true },
      { name: 'Schedule ToC Appointment', desc: 'Book follow-up for severe asthma management.', pass: false },
      { name: 'Medication Review', desc: 'Verify rescue inhaler and controller medication supply.', pass: false }
    ],
    callSummary: {
      keyPoints: [
        'Patient reached after ER visit for severe asthma attack.',
        'Running low on rescue inhaler and needs refill coordination.',
        'Medication reconciliation partially completed.'
      ],
      actionItems: [
        'Coordinate inhaler refill with pharmacy.',
        'Schedule follow-up to complete asthma action plan review.'
      ]
    },
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/12/2025'
  },

  // ===== p6 – Ms. Lloyd Pagac (scheduled, no success in outreachDots) =====
  {
    id: 'cd13',
    patientId: 'p6',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/12/2025 10:00',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:05' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello, this is Fold Health calling for your post-discharge follow-up after your knee replacement at St. Luke's. How is your recovery going?", time: '10:00 AM' },
      { sender: 'patient', name: 'Ms. Lloyd Pagac', text: "It's been tough but physical therapy is helping. The pain is manageable with medication.", time: '10:00 AM' },
      { sender: 'agent', name: 'Anna', text: "Glad to hear PT is going well. Let me review your current medications and make sure everything is on track.", time: '10:01 AM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/12/2025'
  },

  // ===== p7 – Kendra Crona (scheduled, no success in outreachDots) =====
  {
    id: 'cd14',
    patientId: 'p7',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/13/2025 14:00',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:12' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Kendra, this is Fold Health calling to follow up after your recent ER visit at ER – Eastside for a urinary tract infection. How are you feeling?", time: '2:00 PM' },
      { sender: 'patient', name: 'Kendra Crona', text: "Better, but I still have some discomfort. I'm finishing the antibiotics they gave me.", time: '2:00 PM' },
      { sender: 'agent', name: 'Anna', text: "It's important to complete the full antibiotic course. Let me check on your follow-up appointment and review your medications.", time: '2:01 PM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/13/2025'
  },

  // ===== p8 – Diana Welch (scheduled, has success in outreachDots) =====
  {
    id: 'cd15',
    patientId: 'p8',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/16/2025 09:00',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:08' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Diana, this is Fold Health calling for your post-discharge follow-up after your stay at Memorial Hospital for diabetic ketoacidosis. How are you managing?", time: '9:00 AM' },
      { sender: 'patient', name: 'Diana Welch', text: "I'm checking my blood sugar regularly now. The insulin doses are a bit confusing though.", time: '9:00 AM' },
      { sender: 'agent', name: 'Anna', text: "I understand, insulin management can be tricky. Let me review your dosing schedule and make sure we get you set up with an endocrinology follow-up.", time: '9:01 AM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/16/2025'
  },
  // Previous successful outreach
  {
    id: 'cd16',
    patientId: 'p8',
    callType: 'completed',
    agentName: 'Anna',
    startedAt: '11/13/2025 09:00',
    endedAt: '11/13/2025 09:06',
    duration: '06:15',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: [
      { name: 'Patient Outreach', desc: 'Establish first contact within 2 business days of discharge.', pass: true },
      { name: 'Schedule ToC Appointment', desc: 'Book endocrinology follow-up for diabetes management.', pass: false },
      { name: 'Medication Review', desc: 'Review insulin regimen and blood sugar monitoring.', pass: false }
    ],
    callSummary: {
      keyPoints: [
        'Patient recovering from diabetic ketoacidosis episode.',
        'Checking blood sugar regularly but confused about insulin dosing schedule.',
        'Needs endocrinology follow-up appointment.'
      ],
      actionItems: [
        'Schedule endocrinology follow-up.',
        'Send insulin dosing guide and blood sugar log template.'
      ]
    },
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/13/2025'
  },

  // ===== p9 – James Rivera (scheduled, has success in outreachDots) =====
  {
    id: 'cd17',
    patientId: 'p9',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/14/2025 14:00',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:20' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello James, this is Fold Health calling to follow up after your recent stay at the VA Medical Center for COPD. How is your breathing today?", time: '2:00 PM' },
      { sender: 'patient', name: 'James Rivera', text: "It's been better with the new inhaler, but I get winded going up stairs.", time: '2:00 PM' },
      { sender: 'agent', name: 'Anna', text: "That's common during recovery. Let's make sure your PCP appointment is confirmed and review your inhaler technique.", time: '2:01 PM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/14/2025'
  },
  // Previous successful outreach
  {
    id: 'cd18',
    patientId: 'p9',
    callType: 'completed',
    agentName: 'Anna',
    startedAt: '11/12/2025 14:00',
    endedAt: '11/12/2025 14:06',
    duration: '05:45',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: [
      { name: 'Patient Outreach', desc: 'Establish first contact within 2 business days of discharge.', pass: true },
      { name: 'Schedule ToC Appointment', desc: 'Confirm PCP follow-up for COPD management.', pass: false },
      { name: 'Medication Review', desc: 'Review inhaler technique and COPD medications.', pass: false }
    ],
    callSummary: {
      keyPoints: [
        'Patient reached after COPD exacerbation hospitalization at VA Medical Center.',
        'Breathing improved with new inhaler but still experiences shortness of breath with activity.',
        'PCP appointment needs confirmation.'
      ],
      actionItems: [
        'Confirm PCP follow-up appointment.',
        'Review inhaler technique on next call.'
      ]
    },
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/12/2025'
  },

  // ===== p10 – Sandra Nguyen (scheduled, no success in outreachDots) =====
  {
    id: 'cd19',
    patientId: 'p10',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/15/2025 13:00',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:15' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Sandra, this is Fold Health calling to follow up after your ER visit at ER – Downtown for abdominal pain. Do you have an interpreter available or would you prefer Vietnamese?", time: '1:00 PM' },
      { sender: 'patient', name: 'Sandra Nguyen', text: "My daughter can help translate. The stomach pain is mostly gone now.", time: '1:00 PM' },
      { sender: 'agent', name: 'Anna', text: "That's good to hear. Let me go over your discharge instructions and make sure you have a follow-up appointment scheduled.", time: '1:01 PM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/15/2025'
  },

  // ===== p11 – Clara Mitchell (completed) =====
  // Ongoing record
  {
    id: 'cd20',
    patientId: 'p11',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/10/2025 09:30',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:10' },
      { name: 'Schedule ToC Appointment', done: true, time: '2:05' },
      { name: 'Medication Review', done: true, time: '3:42' }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Peter, this is Anna from Fold Health calling for your post-discharge follow-up after your cardiac stent procedure. How are you feeling?", time: '9:30 AM' },
      { sender: 'patient', name: 'Peter Kim', text: "Much better, thank you. The chest pain is completely gone now.", time: '9:30 AM' },
      { sender: 'agent', name: 'Anna', text: "That's wonderful to hear. Have you been taking your aspirin and clopidogrel as prescribed by your cardiologist?", time: '9:31 AM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/10/2025'
  },
  // Completed record
  {
    id: 'cd21',
    patientId: 'p11',
    callType: 'completed',
    agentName: 'Anna',
    startedAt: '11/10/2025 09:30',
    endedAt: '11/10/2025 09:36',
    duration: '04:44',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: [
      { name: 'Patient Outreach', desc: 'Establish first contact regarding benefits.', pass: true },
      { name: 'App Enrollment', desc: 'Help patient download and install Fold Care app.', pass: true },
      { name: 'EHR Consent', desc: 'Securely share EHR access via Milu.', pass: true }
    ],
    callSummary: {
      keyPoints: [
        'Verified patient privacy with date of birth (February 21st, 1992).',
        'Explained health benefits program "Collaborative Care" and "Fold Care" mobile app.',
        'Discussed secure sharing of electronic health records through Milu tool.',
        'Informed patient that participation is optional and data is protected.'
      ],
      actionItems: [
        'Sent secure link for Fold Care app download via text message.',
        'Sent Milu EHR consent form link via text message.',
        'Advised patient to review and sign the consent form.'
      ]
    },
    callTranscript: [
      { sender: 'patient', name: 'Clara Mitchell', text: "Hello, this is Clara Mitchell speaking.", start: 0, end: 4, time: "9:30 AM" },
      { sender: 'agent', name: 'Anna', text: "Hi Clara, this is Anna, an AI assistant calling from Collaborative Care. This call will be recorded for quality assurance and training purposes. I have a quick update regarding your healthcare benefits through Applied Laser Technologies. Is now a good time?", start: 5, end: 20, time: "9:30 AM" },
      { sender: 'patient', name: 'Clara Mitchell', text: "Hi Anna, yes, now is a good time. I can talk for a few minutes.", start: 21, end: 26, time: "9:30 AM" },
      { sender: 'agent', name: 'Anna', text: "Before we can continue, for your privacy, could you please tell me your full date of birth including day, month, and year?", start: 27, end: 35, time: "9:31 AM" },
      { sender: 'patient', name: 'Clara Mitchell', text: "Sure, my date of birth is February 21st, 1992.", start: 36, end: 42, time: "9:31 AM" },
      { sender: 'agent', name: 'Anna', text: "Thank you. I just want to make sure I heard that correctly. Did you say your date of birth is February 21st, 1992?", start: 43, end: 51, time: "9:31 AM" },
      { sender: 'patient', name: 'Clara Mitchell', text: "Yes, that’s correct, my date of birth is February 21st, 1992.", start: 52, end: 58, time: "9:31 AM" },
      { sender: 'agent', name: 'Anna', text: "Um, let me verify that in our system. Just a moment please. Thank you, that's correct. Thanks, Clara. Just a quick reminder, your health benefits plan includes a program called Collaborative Care. It gives you access to many medical and prescription services at no cost. I'd like to help you access these benefits through our mobile app and electronic health record. Is that okay with you?", start: 59, end: 85, time: "9:32 AM" },
      { sender: 'patient', name: 'Clara Mitchell', text: "Yes, that's okay with me. I'd like to be able to use those benefits through the app.", start: 86, end: 93, time: "9:32 AM" },
      { sender: 'agent', name: 'Anna', text: "Great Clara. So, um, Collaborative Care offers a free mobile app called Fold Care. It lets you see your coverage, access $0 care, and a bunch more. I can send you a secure link to download the app right now. Would that be okay?", start: 94, end: 112, time: "9:32 AM" },
      { sender: 'patient', name: 'Clara Mitchell', text: "Yes, that would be fine. Please go ahead and send me the secure link to download the app.", start: 113, end: 120, time: "9:33 AM" },
      { sender: 'agent', name: 'Anna', text: "Great. Would you prefer I send the download link by text message, email, or both?", start: 121, end: 128, time: "9:33 AM" },
      { sender: 'patient', name: 'Clara Mitchell', text: "Um, text message is best for me, please. I'm on my cell right now.", start: 129, end: 136, time: "9:33 AM" },
      { sender: 'agent', name: 'Anna', text: "Perfect. I've sent a link to your phone via text. You should receive it shortly. When you open the message, just tap the link and follow the instructions to install the app. If you run into any trouble, you can always contact the Collaborative Care team and we'll help you out. Okay, the app link is on its way. Now, um, I want to mention one more thing after you download the app. When you log in, it will ask you to approve access to your electronic health record through a tool called Milu. This helps your healthcare providers securely share important info with us to better coordinate your care and access those $0 benefits. Participation is optional and your information is protected. Can I tell you more about it?", start: 137, end: 179, time: "9:34 AM" },
      { sender: 'patient', name: 'Clara Mitchell', text: "Yes, please. I'd like to hear a bit more about how Milu works and what access it has.", start: 180, end: 187, time: "9:34 AM" },
      { sender: 'agent', name: 'Anna', text: "By approving access to your electronic health record, it will allow your healthcare providers to securely share important health information with us so we can better coordinate and support your care. Your privacy is protected and only people involved in your care can see this information. Would you like me to send you the electronic health record consent form?", start: 188, end: 212, time: "9:35 AM" },
      { sender: 'patient', name: 'Clara Mitchell', text: "Yes, please send it. I'd like to review and most likely sign it so everything's connected.", start: 213, end: 220, time: "9:35 AM" },
      { sender: 'agent', name: 'Anna', text: "Um, can I send the electronic health record consent form to you by text message, email, or both?", start: 221, end: 229, time: "9:35 AM" },
      { sender: 'patient', name: 'Clara Mitchell', text: "Text message is perfect for me, please. That's the easiest way for me to review and sign it.", start: 230, end: 237, time: "9:36 AM" },
      { sender: 'agent', name: 'Anna', text: "I'm sending you a text message right now with the Milu consent form link. I've sent the consent form to your phone via text. You should get it shortly. When you open the text, just tap the link and you'll be able to read all the details and check the box if you consent. Take your time reviewing it, there's no rush at all. Thank you for taking the time to speak with me today. I appreciate it. Before we finish, do you have any other questions I can help with?", start: 238, end: 269, time: "9:36 AM" },
      { sender: 'patient', name: 'Clara Mitchell', text: "No, I don't have any other questions right now. Thanks for explaining everything and for sending the links.", start: 270, end: 277, time: "9:37 AM" },
      { sender: 'agent', name: 'Anna', text: "Just to quickly summarize, we have sent you the Fold Care app download link and the Milu consent form to your SMS only. Thank you for taking the time to speak with me today. I appreciate it. If you have any questions in the future, the Urgent Care team will be happy to help. Have a wonderful day and take care. Goodbye.", start: 278, end: 284, time: "9:37 AM" },
      { sender: 'patient', name: 'Clara Mitchell', text: "Thank you so much, Anna. I'll look out for the texts and review everything. Have a good day.", start: 285, end: 290, time: "9:37 AM" }
    ],
    outcome: 'Completed Enrollment',
    attemptNumber: 1,
    createdAt: '04/23/2026'
  },

  // ===== p12 – Maria Lopez (scheduled, has success in outreachDots) =====
  {
    id: 'cd22',
    patientId: 'p12',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/14/2025 11:00',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:10' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Maria, this is Fold Health calling to follow up after your hospitalization at Community General for heart failure. How are you feeling at home?", time: '11:00 AM' },
      { sender: 'patient', name: 'Maria Lopez', text: "I'm okay, but I feel short of breath when I walk too much. I'm trying to take my pills every day.", time: '11:00 AM' },
      { sender: 'agent', name: 'Anna', text: "It's very important to stay on your medications. Let me help schedule your cardiology follow-up and review your prescriptions.", time: '11:01 AM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/14/2025'
  },
  // Previous successful outreach
  {
    id: 'cd23',
    patientId: 'p12',
    callType: 'completed',
    agentName: 'Anna',
    startedAt: '11/11/2025 11:00',
    endedAt: '11/11/2025 11:06',
    duration: '05:50',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: [
      { name: 'Patient Outreach', desc: 'Establish first contact within 2 business days of discharge.', pass: true },
      { name: 'Schedule ToC Appointment', desc: 'Book cardiology follow-up for heart failure management.', pass: false },
      { name: 'Medication Review', desc: 'Review heart failure medications and diuretics.', pass: false }
    ],
    callSummary: {
      keyPoints: [
        'Patient reached after heart failure hospitalization.',
        'Reports shortness of breath with exertion and is trying to adhere to medications.',
        'Transportation barrier noted for follow-up appointments.'
      ],
      actionItems: [
        'Arrange transportation for cardiology follow-up.',
        'Schedule follow-up call to complete medication review.'
      ]
    },
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/11/2025'
  },

  // ===== p13 – Brian Thompson (scheduled, no success in outreachDots) =====
  {
    id: 'cd24',
    patientId: 'p13',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/16/2025 15:30',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:03' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Brian, this is Fold Health calling to check in after your recent ER visit at ER – Westside for a laceration repair. How is the wound healing?", time: '3:30 PM' },
      { sender: 'patient', name: 'Brian Thompson', text: "It's healing okay. I've been keeping it clean and changing the bandage like they told me.", time: '3:30 PM' },
      { sender: 'agent', name: 'Anna', text: "Great job with wound care. Let me make sure you have a follow-up scheduled to check on healing and remove any stitches if needed.", time: '3:31 PM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/16/2025'
  },

  // ===== p14 – Elena Garcia (scheduled, has success in outreachDots) =====
  {
    id: 'cd25',
    patientId: 'p14',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/13/2025 10:00',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:18' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Elena, this is Fold Health calling for your post-discharge follow-up from St. Mary Hospital after your stroke. How are you recovering?", time: '10:00 AM' },
      { sender: 'patient', name: 'Elena Garcia', text: "I'm doing therapy every day. My right hand is still weak but getting better slowly.", time: '10:00 AM' },
      { sender: 'agent', name: 'Anna', text: "Recovery takes time, and it sounds like you're making progress. Let me review your medications, especially the blood thinner, and schedule your neurology follow-up.", time: '10:01 AM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/13/2025'
  },
  // Previous successful outreach
  {
    id: 'cd26',
    patientId: 'p14',
    callType: 'completed',
    agentName: 'Anna',
    startedAt: '11/12/2025 10:00',
    endedAt: '11/12/2025 10:07',
    duration: '06:30',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: [
      { name: 'Patient Outreach', desc: 'Establish first contact within 2 business days of discharge.', pass: true },
      { name: 'Schedule ToC Appointment', desc: 'Book neurology follow-up for post-stroke care.', pass: false },
      { name: 'Medication Review', desc: 'Review anticoagulant therapy and stroke prevention medications.', pass: false }
    ],
    callSummary: {
      keyPoints: [
        'Patient recovering from ischemic stroke with ongoing rehabilitation.',
        'Right hand weakness persists but showing gradual improvement with daily therapy.',
        'Blood thinner and stroke prevention medications need review.'
      ],
      actionItems: [
        'Schedule neurology follow-up appointment.',
        'Review anticoagulant dosing and medication reconciliation.'
      ]
    },
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/12/2025'
  },

  // ===== p15 – Robert Johnson (failed) =====
  // Ongoing record
  {
    id: 'cd27',
    patientId: 'p15',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/07/2025 09:30',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: false, time: null },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello, this is Anna from Fold Health calling for Robert Johnson regarding post-discharge follow-up from Veterans Hospital. Is Robert available?", time: '9:30 AM' },
      { sender: 'agent', name: 'Anna', text: "Unable to reach patient after multiple attempts. Leaving voicemail with crisis support resources and callback number.", time: '9:31 AM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/07/2025'
  },
  // Attempt 1
  {
    id: 'cd28',
    patientId: 'p15',
    callType: 'voicemail',
    agentName: 'Anna',
    startedAt: '11/07/2025 09:30',
    endedAt: '11/07/2025 09:31',
    duration: '00:30',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: 'No answer',
    attemptNumber: 1,
    createdAt: '11/07/2025'
  },
  // Attempt 2
  {
    id: 'cd29',
    patientId: 'p15',
    callType: 'voicemail',
    agentName: 'Anna',
    startedAt: '11/07/2025 14:00',
    endedAt: '11/07/2025 14:01',
    duration: '00:45',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: 'No answer – voicemail left',
    attemptNumber: 2,
    createdAt: '11/07/2025'
  },

  // ===== p16 – Alice Walker (scheduled, has success in outreachDots) =====
  {
    id: 'cd30',
    patientId: 'p16',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/15/2025 09:30',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:07' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Alice, this is Fold Health calling to follow up after your ER visit at ER – Central for an allergic reaction. How are you doing?", time: '9:30 AM' },
      { sender: 'patient', name: 'Alice Walker', text: "Much better. The swelling went down and I have my EpiPen now just in case.", time: '9:30 AM' },
      { sender: 'agent', name: 'Anna', text: "Good to hear you have your EpiPen. Let's schedule an allergy specialist follow-up and review your action plan for future reactions.", time: '9:31 AM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/15/2025'
  },
  // Previous successful outreach
  {
    id: 'cd31',
    patientId: 'p16',
    callType: 'completed',
    agentName: 'Anna',
    startedAt: '11/12/2025 09:30',
    endedAt: '11/12/2025 09:35',
    duration: '05:10',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: [
      { name: 'Patient Outreach', desc: 'Establish first contact after ER discharge.', pass: true },
      { name: 'Schedule ToC Appointment', desc: 'Book allergy specialist follow-up.', pass: false },
      { name: 'Medication Review', desc: 'Review EpiPen prescription and allergy action plan.', pass: false }
    ],
    callSummary: {
      keyPoints: [
        'Patient recovering from allergic reaction treated at ER.',
        'Swelling has resolved and patient has EpiPen on hand.',
        'Needs allergy specialist referral for further evaluation.'
      ],
      actionItems: [
        'Schedule allergy specialist follow-up.',
        'Send allergy action plan resources.'
      ]
    },
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/12/2025'
  },

  // ===== p17 – Carlos Hernandez (completed) =====
  // Ongoing record
  {
    id: 'cd32',
    patientId: 'p17',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/10/2025 14:15',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:10' },
      { name: 'Schedule ToC Appointment', done: true, time: '2:05' },
      { name: 'Medication Review', done: true, time: '3:42' }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hola Carlos, this is Anna from Fold Health. I'm calling to check on your recovery after your heart attack. How are you doing?", time: '2:15 PM' },
      { sender: 'patient', name: 'Carlos Hernandez', text: "Getting better every day. I started the cardiac rehab program last week.", time: '2:15 PM' },
      { sender: 'agent', name: 'Anna', text: "That's excellent progress. Are you taking all your medications regularly — the metoprolol and atorvastatin?", time: '2:16 PM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/10/2025'
  },
  // Completed record
  {
    id: 'cd33',
    patientId: 'p17',
    callType: 'completed',
    agentName: 'Anna',
    startedAt: '11/10/2025 14:15',
    endedAt: '11/10/2025 14:23',
    duration: '07:45',
    liveGoals: null,
    liveTranscript: null,
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
    callTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hola Carlos, this is Anna from Fold Health. I'm calling to check on your recovery after your heart attack. How are you doing?", time: '2:15 PM' },
      { sender: 'patient', name: 'Carlos Hernandez', text: "Getting better every day. I started the cardiac rehab program last week.", time: '2:15 PM' },
      { sender: 'agent', name: 'Anna', text: "That's excellent progress. Are you taking all your medications regularly — the metoprolol and atorvastatin?", time: '2:16 PM' },
      { sender: 'patient', name: 'Carlos Hernandez', text: "Yes, my daughter set up reminders on my phone. She's been very helpful with the diet changes too.", time: '2:16 PM' },
      { sender: 'agent', name: 'Anna', text: "Family support makes a huge difference. I'll send some heart-healthy recipes in Spanish for your family. Keep up the great work with cardiac rehab!", time: '2:17 PM' }
    ],
    outcome: null,
    attemptNumber: null,
    createdAt: '11/10/2025'
  },

  // ===== p18 – Nancy Patel (scheduled, no success in outreachDots) =====
  {
    id: 'cd34',
    patientId: 'p18',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/14/2025 16:00',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:22' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Nancy, this is Fold Health calling to follow up after your gallbladder surgery at Unity Hospital. How are you recovering?", time: '4:00 PM' },
      { sender: 'patient', name: 'Nancy Patel', text: "The incision is healing well. I'm having some trouble with the diet changes after the surgery.", time: '4:00 PM' },
      { sender: 'agent', name: 'Anna', text: "Dietary adjustments after gallbladder removal are very common. Let me review your post-surgical instructions and schedule a follow-up with your surgeon.", time: '4:01 PM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/14/2025'
  },

  // ===== p19 – Thomas Moore (scheduled, no success in outreachDots) =====
  {
    id: 'cd35',
    patientId: 'p19',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/17/2025 10:00',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:14' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Thomas, this is Fold Health calling to follow up after your recent ER visit at ER – South for a panic attack. How have you been feeling?", time: '10:00 AM' },
      { sender: 'patient', name: 'Thomas Moore', text: "I've had a couple more anxiety episodes but nothing as bad as the one that brought me to the ER.", time: '10:00 AM' },
      { sender: 'agent', name: 'Anna', text: "I'm glad it hasn't been as severe. Let's get you connected with a mental health provider and review any medications you were prescribed.", time: '10:01 AM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/17/2025'
  },

  // ===== p20 – Lisa Brown (scheduled, has success in outreachDots) =====
  {
    id: 'cd36',
    patientId: 'p20',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/14/2025 09:00',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:06' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Lisa, this is Fold Health calling to follow up after your hip replacement surgery at Orthopedic Center. How is your mobility?", time: '9:00 AM' },
      { sender: 'patient', name: 'Lisa Brown', text: "I'm using the walker and doing my exercises. The physical therapist comes three times a week.", time: '9:00 AM' },
      { sender: 'agent', name: 'Anna', text: "That's wonderful progress. Let me confirm your orthopedic follow-up and make sure your pain medication is adequate.", time: '9:01 AM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/14/2025'
  },
  // Previous successful outreach
  {
    id: 'cd37',
    patientId: 'p20',
    callType: 'completed',
    agentName: 'Anna',
    startedAt: '11/12/2025 09:00',
    endedAt: '11/12/2025 09:06',
    duration: '05:45',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: [
      { name: 'Patient Outreach', desc: 'Establish first contact within 2 business days of discharge.', pass: true },
      { name: 'Schedule ToC Appointment', desc: 'Book orthopedic follow-up for hip replacement recovery.', pass: false },
      { name: 'Medication Review', desc: 'Review pain management and post-surgical medications.', pass: false }
    ],
    callSummary: {
      keyPoints: [
        'Patient recovering from hip replacement surgery with physical therapy support.',
        'Using walker and performing prescribed exercises regularly.',
        'Pain manageable with current medication regimen.'
      ],
      actionItems: [
        'Confirm orthopedic follow-up appointment.',
        'Assess pain medication adequacy on next call.'
      ]
    },
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/12/2025'
  },

  // ===== p21 – Kevin Singh (failed) =====
  // Ongoing record
  {
    id: 'cd38',
    patientId: 'p21',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/06/2025 15:00',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: false, time: null },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello, this is Anna from Fold Health calling for Kevin Singh regarding post-discharge follow-up from Regional Medical Center for pneumonia with sepsis. Is Kevin available?", time: '3:00 PM' },
      { sender: 'agent', name: 'Anna', text: "Unable to reach patient. Wrong number on file. Escalating to care coordinator for updated contact information and possible home visit.", time: '3:01 PM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/06/2025'
  },
  // Attempt 1
  {
    id: 'cd39',
    patientId: 'p21',
    callType: 'voicemail',
    agentName: 'Anna',
    startedAt: '11/04/2025 08:00',
    endedAt: '11/04/2025 08:01',
    duration: '00:30',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: 'No answer',
    attemptNumber: 1,
    createdAt: '11/04/2025'
  },
  // Attempt 2
  {
    id: 'cd40',
    patientId: 'p21',
    callType: 'voicemail',
    agentName: 'Anna',
    startedAt: '11/05/2025 10:00',
    endedAt: '11/05/2025 10:01',
    duration: '00:45',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: 'No answer – voicemail left',
    attemptNumber: 2,
    createdAt: '11/05/2025'
  },
  // Attempt 3
  {
    id: 'cd41',
    patientId: 'p21',
    callType: 'voicemail',
    agentName: 'Anna',
    startedAt: '11/06/2025 15:00',
    endedAt: '11/06/2025 15:01',
    duration: '00:30',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: 'Wrong number',
    attemptNumber: 3,
    createdAt: '11/06/2025'
  },

  // ===== p22 – Jennifer Chen (scheduled, has success in outreachDots) =====
  {
    id: 'cd42',
    patientId: 'p22',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/16/2025 11:30',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:09' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Jennifer, this is Fold Health calling to follow up after your ER visit at ER – University for a migraine with aura. How have your headaches been?", time: '11:30 AM' },
      { sender: 'patient', name: 'Jennifer Chen', text: "I had one mild headache since then, but the new medication seems to be helping.", time: '11:30 AM' },
      { sender: 'agent', name: 'Anna', text: "That's encouraging. Let me schedule a neurology follow-up and review your migraine action plan and preventive medications.", time: '11:31 AM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/16/2025'
  },
  // Previous successful outreach
  {
    id: 'cd43',
    patientId: 'p22',
    callType: 'completed',
    agentName: 'Anna',
    startedAt: '11/13/2025 11:30',
    endedAt: '11/13/2025 11:36',
    duration: '05:20',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: [
      { name: 'Patient Outreach', desc: 'Establish first contact after ER discharge.', pass: true },
      { name: 'Schedule ToC Appointment', desc: 'Book neurology follow-up for migraine management.', pass: false },
      { name: 'Medication Review', desc: 'Review migraine preventive and acute medications.', pass: false }
    ],
    callSummary: {
      keyPoints: [
        'Patient reached after ER visit for migraine with aura.',
        'New medication appears to be helping reduce headache frequency.',
        'Needs neurology follow-up for ongoing migraine management.'
      ],
      actionItems: [
        'Schedule neurology follow-up.',
        'Send migraine trigger diary template.'
      ]
    },
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/13/2025'
  },

  // ===== p23 – William Davis (completed) =====
  // Ongoing record
  {
    id: 'cd44',
    patientId: 'p23',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/09/2025 11:00',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:10' },
      { name: 'Schedule ToC Appointment', done: true, time: '2:05' },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello William, this is Anna from Fold Health. I'm following up after your recent hospitalization for heart failure. How have you been feeling at home?", time: '11:00 AM' },
      { sender: 'patient', name: 'William Davis', text: "Okay mostly, but my ankles are a bit swollen in the evenings.", time: '11:00 AM' },
      { sender: 'agent', name: 'Anna', text: "Are you monitoring your weight daily as your doctor recommended? Any gain of more than 2 pounds in a day should be reported.", time: '11:01 AM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/09/2025'
  },
  // Completed record
  {
    id: 'cd45',
    patientId: 'p23',
    callType: 'completed',
    agentName: 'Anna',
    startedAt: '11/09/2025 11:00',
    endedAt: '11/09/2025 11:08',
    duration: '08:15',
    liveGoals: null,
    liveTranscript: null,
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
    callTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello William, this is Anna from Fold Health. I'm following up after your recent hospitalization for heart failure. How have you been feeling at home?", time: '11:00 AM' },
      { sender: 'patient', name: 'William Davis', text: "Okay mostly, but my ankles are a bit swollen in the evenings.", time: '11:00 AM' },
      { sender: 'agent', name: 'Anna', text: "Are you monitoring your weight daily as your doctor recommended? Any gain of more than 2 pounds in a day should be reported.", time: '11:01 AM' },
      { sender: 'patient', name: 'William Davis', text: "Yes, I check every morning. It's been stable so far. But I sometimes forget my evening pills.", time: '11:01 AM' },
      { sender: 'agent', name: 'Anna', text: "Setting a phone alarm for your evening dose can really help. I also want to make sure you have transportation to your upcoming PCP appointment. Can we arrange that?", time: '11:02 AM' }
    ],
    outcome: null,
    attemptNumber: null,
    createdAt: '11/09/2025'
  },

  // ===== p24 – Angela Foster (scheduled, no success in outreachDots) =====
  {
    id: 'cd46',
    patientId: 'p24',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/18/2025 13:00',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:11' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Angela, this is Fold Health calling to follow up after your ER visit at ER – Lake View for back pain related to spinal stenosis. How is your pain level?", time: '1:00 PM' },
      { sender: 'patient', name: 'Angela Foster', text: "The pain is manageable with the medication they gave me, but I'm worried about needing surgery.", time: '1:00 PM' },
      { sender: 'agent', name: 'Anna', text: "Let's get you a follow-up with a spine specialist to discuss your options. I'll also review your current pain management plan.", time: '1:01 PM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/18/2025'
  },

  // ===== p25 – Ricardo Martinez (scheduled, has success in outreachDots) =====
  {
    id: 'cd47',
    patientId: 'p25',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/14/2025 15:30',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:16' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Ricardo, this is Fold Health calling to follow up after your stay at Community Hospital for uncontrolled diabetes. How are your blood sugar levels?", time: '3:30 PM' },
      { sender: 'patient', name: 'Ricardo Martinez', text: "They've been better since I started the new insulin. I'm checking every morning and before dinner.", time: '3:30 PM' },
      { sender: 'agent', name: 'Anna', text: "That's great discipline. Let me schedule your endocrinology follow-up and make sure your insulin dosing is optimized.", time: '3:31 PM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/14/2025'
  },
  // Previous successful outreach
  {
    id: 'cd48',
    patientId: 'p25',
    callType: 'completed',
    agentName: 'Anna',
    startedAt: '11/11/2025 15:30',
    endedAt: '11/11/2025 15:36',
    duration: '06:00',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: [
      { name: 'Patient Outreach', desc: 'Establish first contact within 2 business days of discharge.', pass: true },
      { name: 'Schedule ToC Appointment', desc: 'Book endocrinology follow-up for diabetes management.', pass: false },
      { name: 'Medication Review', desc: 'Review insulin regimen and blood sugar monitoring plan.', pass: false }
    ],
    callSummary: {
      keyPoints: [
        'Patient reached after hospitalization for uncontrolled diabetes.',
        'Blood sugar levels improving with new insulin regimen.',
        'Patient monitoring blood sugar twice daily as instructed.'
      ],
      actionItems: [
        'Schedule endocrinology follow-up.',
        'Arrange transportation assistance for appointment.'
      ]
    },
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/11/2025'
  },

  // ===== p26 – Helen Jackson (scheduled, has success in outreachDots) =====
  {
    id: 'cd49',
    patientId: 'p26',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/13/2025 11:30',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:19' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello Helen, this is Fold Health calling to follow up after your stay at Cardiology Center for atrial fibrillation. How is your heart rhythm feeling?", time: '11:30 AM' },
      { sender: 'patient', name: 'Helen Jackson', text: "I still feel the fluttering sometimes, but the new medication has helped a lot. I'm also watching my blood pressure.", time: '11:30 AM' },
      { sender: 'agent', name: 'Anna', text: "It's good you're monitoring that. Let me review your anticoagulant dosing and schedule your cardiology follow-up to check your rhythm.", time: '11:31 AM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/13/2025'
  },
  // Previous successful outreach
  {
    id: 'cd50',
    patientId: 'p26',
    callType: 'completed',
    agentName: 'Anna',
    startedAt: '11/12/2025 11:30',
    endedAt: '11/12/2025 11:37',
    duration: '06:45',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: [
      { name: 'Patient Outreach', desc: 'Establish first contact within 2 business days of discharge.', pass: true },
      { name: 'Schedule ToC Appointment', desc: 'Book cardiology follow-up for atrial fibrillation monitoring.', pass: false },
      { name: 'Medication Review', desc: 'Review anticoagulant therapy and rate control medications.', pass: false }
    ],
    callSummary: {
      keyPoints: [
        'Patient recovering from atrial fibrillation hospitalization.',
        'Still experiencing occasional fluttering but new medication helping significantly.',
        'Monitoring blood pressure at home regularly.'
      ],
      actionItems: [
        'Schedule cardiology follow-up for rhythm check.',
        'Review anticoagulant dosing on next call.'
      ]
    },
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/12/2025'
  },

  // ===== p27 – David Ortiz (scheduled, no success in outreachDots) =====
  {
    id: 'cd51',
    patientId: 'p27',
    callType: 'ongoing',
    agentName: 'Anna',
    startedAt: '11/17/2025 14:30',
    endedAt: null,
    duration: null,
    liveGoals: [
      { name: 'Patient Outreach', done: true, time: '1:04' },
      { name: 'Schedule ToC Appointment', done: false, time: null },
      { name: 'Medication Review', done: false, time: null }
    ],
    liveTranscript: [
      { sender: 'agent', name: 'Anna', text: "Hello David, this is Fold Health calling to follow up after your recent ER visit at ER – Harbor. How have you been feeling since discharge?", time: '2:30 PM' },
      { sender: 'patient', name: 'David Ortiz', text: "I'm doing okay. I started attending the outpatient program they recommended.", time: '2:30 PM' },
      { sender: 'agent', name: 'Anna', text: "That's a really positive step. Let me help connect you with ongoing support resources and schedule a follow-up with your care team.", time: '2:31 PM' }
    ],
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: null,
    attemptNumber: null,
    createdAt: '11/17/2025'
  },

  // ===== Incoming Calls =====
  {
    id: 'cdi1',
    patientId: 'p1',
    callType: 'completed',
    direction: 'incoming',
    agentName: 'Anna',
    startedAt: '11/29/2025 07:30',
    endedAt: '11/29/2025 07:34',
    duration: '04:22',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: [
      { name: 'Patient Outreach', desc: 'Patient called in for follow-up.', pass: true },
      { name: 'Medication Clarification', desc: 'Medication dosage questions resolved.', pass: true },
      { name: 'Appointment Confirmation', desc: 'Follow-up appointment confirmed.', pass: true },
    ],
    callSummary: {
      keyPoints: [
        'Patient called in early morning with question about evening medication dose.',
        'Confirmed correct medication schedule and resolved dosage confusion.',
        'Upcoming follow-up appointment reconfirmed for Thursday at 10 AM.',
      ],
      actionItems: [
        'Send updated medication schedule to patient via app.',
        'Confirm lab appointment for next week.',
      ]
    },
    callTranscript: [
      { sender: 'patient', name: 'Ralph Halvorson', text: "Hi, I had a question about my evening medication — I wasn't sure if I should take it with food.", time: '7:30 AM' },
      { sender: 'agent', name: 'Anna', text: "Good morning Ralph. Your evening dose of lisinopril should be taken with or without food — whichever is easier for you.", time: '7:30 AM' },
      { sender: 'patient', name: 'Ralph Halvorson', text: "That's good to know. And my follow-up appointment is still next Thursday?", time: '7:31 AM' },
      { sender: 'agent', name: 'Anna', text: "Yes, confirmed for Thursday at 10 AM with your PCP. Is there anything else I can help with?", time: '7:31 AM' },
    ],
    outcome: null,
    attemptNumber: null,
    createdAt: '11/29/2025'
  },
  {
    id: 'cdi2',
    patientId: 'p5',
    callType: 'completed',
    direction: 'incoming',
    agentName: 'Anna',
    startedAt: '12/01/2025 14:15',
    endedAt: '12/01/2025 14:18',
    duration: '03:45',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: [
      { name: 'Symptom Check', desc: 'Patient symptoms reviewed.', pass: true },
      { name: 'Medication Review', desc: 'Rescue inhaler usage reviewed.', pass: true },
      { name: 'Specialist Referral', desc: 'Pulmonology referral scheduled.', pass: false },
    ],
    callSummary: {
      keyPoints: [
        'Patient called to report increased rescue inhaler use over the past 2 days.',
        'Breathing improved but still using inhaler 3–4 times daily vs. usual twice.',
        'Pulmonology referral could not be completed during this call.',
      ],
      actionItems: [
        'Follow up on pulmonology referral status.',
        'Monitor inhaler usage and escalate if symptoms worsen.',
      ]
    },
    callTranscript: [
      { sender: 'patient', name: 'Marcus Ziemann', text: "I've been using my inhaler more than usual the past couple days. Is that okay?", time: '2:15 PM' },
      { sender: 'agent', name: 'Anna', text: "How many times a day are you using it, Marcus?", time: '2:15 PM' },
      { sender: 'patient', name: 'Marcus Ziemann', text: "About 3 to 4 times. Usually just twice.", time: '2:16 PM' },
      { sender: 'agent', name: 'Anna', text: "Let's monitor that closely. I'll flag this for a pulmonology referral review. If it gets worse, please call us immediately.", time: '2:16 PM' },
    ],
    outcome: null,
    attemptNumber: null,
    createdAt: '12/01/2025'
  },
  {
    id: 'cdi3',
    patientId: 'p11',
    callType: 'completed',
    direction: 'incoming',
    agentName: 'Anna',
    startedAt: '12/02/2025 18:30',
    endedAt: '12/02/2025 18:35',
    duration: '05:10',
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: [
      { name: 'Symptom Monitoring', desc: 'Post-procedure symptoms reviewed.', pass: true },
      { name: 'Medication Adherence', desc: 'Antiplatelet medications confirmed.', pass: true },
      { name: 'Activity Guidance', desc: 'Post-stent activity restrictions reviewed.', pass: true },
    ],
    callSummary: {
      keyPoints: [
        'Patient called in the evening to report feeling well after cardiac stent procedure.',
        'Confirmed taking all antiplatelet medications as prescribed.',
        'Discussed return-to-activity timeline and lifting restrictions.',
      ],
      actionItems: [
        'Schedule 30-day post-procedure check-in call.',
        'Send cardiac rehab schedule details.',
      ]
    },
    callTranscript: [
      { sender: 'patient', name: 'Clara Mitchell', text: "Just wanted to let you know I've successfully signed the consent form and I'm exploring the app. It looks very helpful.", time: '6:30 PM' },
      { sender: 'agent', name: 'Anna', text: "That's wonderful news, Clara! I'm glad the process was smooth. Have you been able to see the $0 care options yet?", time: '6:30 PM' },
      { sender: 'patient', name: 'Clara Mitchell', text: "Yes, I see them. It's great to have everything in one place.", time: '6:31 PM' },
      { sender: 'agent', name: 'Anna', text: "Perfect. We'll check in again in a few weeks to see how you're liking the program. Have a great evening!", time: '6:31 PM' },
    ],
    outcome: null,
    attemptNumber: null,
    createdAt: '12/02/2025'
  },

  // ===== Declined Calls =====
  {
    id: 'cdd1',
    patientId: 'p4',
    callType: 'declined',
    direction: 'declined',
    agentName: 'Anna',
    startedAt: '11/06/2025 09:00',
    endedAt: '11/06/2025 09:00',
    duration: null,
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: 'Patient declined call',
    attemptNumber: null,
    createdAt: '11/06/2025'
  },
  {
    id: 'cdd2',
    patientId: 'p8',
    callType: 'declined',
    direction: 'declined',
    agentName: 'Anna',
    startedAt: '11/17/2025 16:45',
    endedAt: '11/17/2025 16:45',
    duration: null,
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: 'Patient declined call',
    attemptNumber: null,
    createdAt: '11/17/2025'
  },
  {
    id: 'cdd3',
    patientId: 'p21',
    callType: 'declined',
    direction: 'declined',
    agentName: 'Anna',
    startedAt: '11/07/2025 07:15',
    endedAt: '11/07/2025 07:15',
    duration: null,
    liveGoals: null,
    liveTranscript: null,
    goalsDetail: null,
    callSummary: null,
    callTranscript: null,
    outcome: 'Patient declined call',
    attemptNumber: null,
    createdAt: '11/07/2025'
  },
];

export const callDetails = _rawCallDetails.map(enrichCallRecord);
