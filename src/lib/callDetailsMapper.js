// Maps snake_case DB rows to camelCase JS objects for call_details table

export function callDetailDbToJs(row) {
  return {
    id: row.id,
    patientId: row.patient_id,
    callType: row.call_type,
    agentName: row.agent_name || 'Anna',
    direction: row.direction || null,
    isBot: row.is_bot ?? false,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    duration: row.duration,
    liveGoals: row.live_goals || [],
    liveTranscript: row.live_transcript || [],
    goalsDetail: row.goals_detail || [],
    callSummary: row.call_summary || null,
    callTranscript: row.call_transcript || [],
    outcome: row.outcome || null,
    attemptNumber: row.attempt_number || null,
    createdAt: row.created_at,
  };
}

export function callDetailJsToDb(record) {
  const map = {
    id: 'id',
    patientId: 'patient_id',
    callType: 'call_type',
    agentName: 'agent_name',
    direction: 'direction',
    isBot: 'is_bot',
    startedAt: 'started_at',
    endedAt: 'ended_at',
    duration: 'duration',
    liveGoals: 'live_goals',
    liveTranscript: 'live_transcript',
    goalsDetail: 'goals_detail',
    callSummary: 'call_summary',
    callTranscript: 'call_transcript',
    outcome: 'outcome',
    attemptNumber: 'attempt_number',
    createdAt: 'created_at',
  };

  const row = {};
  for (const [jsKey, dbKey] of Object.entries(map)) {
    if (jsKey in record) {
      row[dbKey] = record[jsKey];
    }
  }
  return row;
}
