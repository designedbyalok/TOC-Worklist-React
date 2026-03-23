// Maps snake_case DB rows to camelCase JS objects and vice versa

export function dbToJs(row) {
  return {
    id: row.id,
    initials: row.initials,
    name: row.name,
    gender: row.gender,
    age: row.age,
    memberId: row.member_id,
    enrolled: row.enrolled,
    language: row.language,
    agentAssigned: row.agent_assigned || '',
    agentRole: row.agent_role || '',
    outreachDots: row.outreach_dots || [],
    lace: row.lace,
    tocType: row.toc_type,
    outreachType: row.outreach_type,
    outreachLeft: row.outreach_left,
    onCall: row.on_call || false,
    callDuration: row.call_duration,
    status: row.status,
    scheduledTime: row.scheduled_time,
    goals: row.goals,
    nextAction: row.next_action,
    aiInsights: row.ai_insights || [],
    tocStatus: row.toc_status,
    dueOn: row.due_on,
    outreachAttended: row.outreach_attended,
    outreachDate: row.outreach_date,
    nextOutreach: row.next_outreach,
    startDate: row.start_date,
    lastAdmission: row.last_admission,
    assignee: row.assignee,
    assigneeInitials: row.assignee_initials,
    readmission: row.readmission,
    tasks: row.tasks,
    carePlanStatus: row.care_plan_status,
    dischargeDate: row.discharge_date,
    facility: row.facility,
    admitReason: row.admit_reason,
    attempts: row.attempts || [],
    goalsDetail: row.goals_detail || [],
    callSummary: row.call_summary,
    callDate: row.call_date,
    callDurationFull: row.call_duration_full,
    callTranscript: row.call_transcript || [],
    liveGoals: row.live_goals || [],
    liveTranscript: row.live_transcript || [],
  };
}

export function jsToDb(patient) {
  const row = {};
  const map = {
    id: 'id',
    initials: 'initials',
    name: 'name',
    gender: 'gender',
    age: 'age',
    memberId: 'member_id',
    enrolled: 'enrolled',
    language: 'language',
    agentAssigned: 'agent_assigned',
    agentRole: 'agent_role',
    outreachDots: 'outreach_dots',
    lace: 'lace',
    tocType: 'toc_type',
    outreachType: 'outreach_type',
    outreachLeft: 'outreach_left',
    onCall: 'on_call',
    callDuration: 'call_duration',
    status: 'status',
    scheduledTime: 'scheduled_time',
    goals: 'goals',
    nextAction: 'next_action',
    aiInsights: 'ai_insights',
    tocStatus: 'toc_status',
    dueOn: 'due_on',
    outreachAttended: 'outreach_attended',
    outreachDate: 'outreach_date',
    nextOutreach: 'next_outreach',
    startDate: 'start_date',
    lastAdmission: 'last_admission',
    assignee: 'assignee',
    assigneeInitials: 'assignee_initials',
    readmission: 'readmission',
    tasks: 'tasks',
    carePlanStatus: 'care_plan_status',
    dischargeDate: 'discharge_date',
    facility: 'facility',
    admitReason: 'admit_reason',
    attempts: 'attempts',
    goalsDetail: 'goals_detail',
    callSummary: 'call_summary',
    callDate: 'call_date',
    callDurationFull: 'call_duration_full',
    callTranscript: 'call_transcript',
    liveGoals: 'live_goals',
    liveTranscript: 'live_transcript',
  };

  for (const [jsKey, dbKey] of Object.entries(map)) {
    if (jsKey in patient) {
      row[dbKey] = patient[jsKey];
    }
  }
  return row;
}

// Convert only changed fields from camelCase to snake_case
export function updatesToDb(updates) {
  return jsToDb(updates);
}
