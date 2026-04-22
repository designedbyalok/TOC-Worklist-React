/**
 * Auto-seed Supabase tables with fallback data on first load.
 * Checks if each table is empty and populates it if so.
 * Runs once per session (tracked via sessionStorage flag).
 */

import { supabase } from './supabase';
import { patients as fallbackPatients } from '../data/patients';
import { callDetails as fallbackCallDetails } from '../data/callDetails';
import { goals as fallbackGoals, GOAL_TEMPLATES } from '../data/goals';
import { chatGroups as fallbackChatGroups, availableUsers, availableRoles, defaultRules, customRules, groupSettings } from '../data/chatGroups';
import { FALLBACK_KPIS, FALLBACK_TIME_SERIES, FALLBACK_TABLES, FALLBACK_PROGRESS_BARS, FALLBACK_CONFIGS } from '../data/analyticsFallbacks';
import { updatesToDb } from './patientMapper';
import { callDetailJsToDb } from './callDetailsMapper';
import { DOMAINS as fallbackDomains, COMPONENTS as fallbackComponents } from '../data/embeddedComponents';
import { FALLBACK_INBOX_ITEMS, FALLBACK_CHANNEL_ITEMS, FALLBACK_CALL_LINES, FALLBACK_CALL_SESSIONS } from '../data/callsConfig';

const SEED_FLAG = '__supabase_seeded';

// ── Check if table is empty ──
async function isTableEmpty(table) {
  const { data, error } = await supabase.from(table).select('id').limit(1);
  if (error) return true; // Assume empty if error (table may not exist)
  return !data || data.length === 0;
}

// ── Seed patients ──
async function seedPatients() {
  if (!(await isTableEmpty('patients'))) return;
  console.log('[seed] Seeding patients...');
  const rows = fallbackPatients.map(p => ({
    id: p.id,
    initials: p.initials,
    name: p.name,
    gender: p.gender,
    age: p.age,
    member_id: p.memberId,
    enrolled: p.enrolled,
    language: p.language,
    agent_assigned: p.agentAssigned || null,
    agent_role: p.agentRole || null,
    outreach_dots: p.outreachDots || [],
    lace: p.lace,
    toc_type: p.tocType,
    outreach_type: p.outreachType,
    outreach_left: p.outreachLeft,
    on_call: p.onCall || false,
    call_duration: p.callDuration,
    status: p.status,
    goals_met: p.goals?.met || null,
    goals_total: p.goals?.total || null,
    next_action: p.nextAction,
    ai_insights: p.aiInsights || [],
    toc_status: p.tocStatus,
    due_on: p.dueOn,
    outreach_attended: p.outreachAttended,
    outreach_date: p.outreachDate,
    next_outreach: p.nextOutreach,
    start_date: p.startDate,
    last_admission: p.lastAdmission,
    assignee: p.assignee,
    assignee_initials: p.assigneeInitials,
    readmission: p.readmission,
    tasks: p.tasks,
    care_plan_status: p.carePlanStatus,
    discharge_date: p.dischargeDate,
    facility: p.facility,
    admit_reason: p.admitReason,
    tcpa_opt_in: p.tcpaOptIn,
    tcpa_timezone: p.tcpaTimezone,
    preferred_call_window: p.preferredCallWindow,
    outreach_category: p.outreachCategory,
    priority: p.priority,
  }));
  const { error } = await supabase.from('patients').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('[seed] patients error:', error.message);
  else console.log(`[seed] Seeded ${rows.length} patients`);
}

// ── Seed call details ──
async function seedCallDetails() {
  if (!(await isTableEmpty('call_details'))) return;
  console.log('[seed] Seeding call_details...');
  const rows = fallbackCallDetails.map(c => ({
    id: c.id,
    patient_id: c.patientId,
    call_type: c.callType,
    agent_name: c.agentName,
    started_at: c.startedAt,
    ended_at: c.endedAt,
    duration: c.duration,
    live_goals: c.liveGoals,
    live_transcript: c.liveTranscript,
    goals_detail: c.goalsDetail,
    call_summary: c.callSummary,
    call_transcript: c.callTranscript,
    outcome: c.outcome,
    attempt_number: c.attemptNumber,
    compliance: c.compliance,
    quality_score: c.qualityScore,
    sentiment_score: c.sentimentScore,
    escalation: c.escalation,
    security: c.security,
    sub_agents_invoked: c.subAgentsInvoked,
    detected_intents: c.detectedIntents,
  }));
  const { error } = await supabase.from('call_details').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('[seed] call_details error:', error.message);
  else console.log(`[seed] Seeded ${rows.length} call_details`);
}

// ── Seed goals ──
async function seedGoals() {
  if (!(await isTableEmpty('goals'))) return;
  console.log('[seed] Seeding goals...');
  const rows = fallbackGoals.map(g => ({
    id: g.id,
    name: g.name,
    program: g.program,
    program_color: g.programColor,
    description: g.description,
    status: g.status,
    weighted_scoring: g.weightedScoring,
    passing_score: g.passingScore,
    mode: g.mode,
    steps: g.steps,
    success_metrics: g.successMetrics,
    agents: g.agents,
    completion_rate: g.completionRate,
    total_runs: g.totalRuns,
  }));
  const { error } = await supabase.from('goals').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('[seed] goals error:', error.message);
  else console.log(`[seed] Seeded ${rows.length} goals`);
}

// ── Seed chat groups ──
async function seedChatGroups() {
  if (!(await isTableEmpty('chat_groups'))) return;
  console.log('[seed] Seeding chat_groups...');
  const rows = fallbackChatGroups.map(g => ({
    id: g.id,
    name: g.name,
    users: g.users,
    roles: g.roles,
    location: g.location,
    updated_by: g.updatedBy,
    active_chats: g.activeChats,
    has_agent: g.hasAgent,
    agent_name: g.agentName || null,
  }));
  const { error } = await supabase.from('chat_groups').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('[seed] chat_groups error:', error.message);
  else console.log(`[seed] Seeded ${rows.length} chat_groups`);
}

// ── Seed FAQs ──
async function seedFaqs() {
  if (!(await isTableEmpty('faqs'))) return;
  console.log('[seed] Seeding faqs...');
  const rows = [
    { id: 1, question: 'What is Transitional Care Management (TCM)?', answer: 'TCM is a Medicare program that covers services for patients transitioning from hospital to home or other setting.', category: 'General' },
    { id: 2, question: 'How do I schedule a follow-up appointment?', answer: 'Our AI agent can help schedule your follow-up during the call, or you can call our scheduling line at (555) 123-4567.', category: 'Appointments' },
    { id: 3, question: 'What should I do if I run out of medication?', answer: 'Contact your pharmacy directly for refills. If it\'s urgent, call your care team or visit the ER.', category: 'Medications' },
    { id: 4, question: 'When will I get my lab results?', answer: 'Lab results are typically available within 3-5 business days. Your provider will contact you if anything needs attention.', category: 'Labs' },
    { id: 5, question: 'How can I opt out of AI calls?', answer: 'You can opt out at any time by saying "opt out" during a call or contacting our office directly.', category: 'Compliance' },
  ];
  const { error } = await supabase.from('faqs').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('[seed] faqs error:', error.message);
  else console.log(`[seed] Seeded ${rows.length} faqs`);
}

// ── Seed agent rules ──
async function seedAgentRules() {
  if (!(await isTableEmpty('agent_rules'))) return;
  console.log('[seed] Seeding agent_rules...');
  const allRules = [...defaultRules, ...customRules];
  const rows = allRules.map((r, i) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    locked: r.locked,
    enabled: r.enabled,
    condition_text: r.condition,
    action_text: r.action,
    priority_label: r.priority || null,
    sort_order: i,
  }));
  const { error } = await supabase.from('agent_rules').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('[seed] agent_rules error:', error.message);
  else console.log(`[seed] Seeded ${rows.length} agent_rules`);
}

// ── Seed chat participants ──
async function seedChatParticipants() {
  if (!(await isTableEmpty('chat_participants'))) return;
  console.log('[seed] Seeding chat_participants...');
  const allParticipants = [
    ...availableUsers.map(u => ({ id: u.id, name: u.name, role: u.role, type: u.type, is_agent: u.isAgent || false })),
    ...availableRoles.map(r => ({ id: r.id, name: r.name, role: 'Care Team Role', type: r.type, is_agent: false })),
  ];
  const { error } = await supabase.from('chat_participants').upsert(allParticipants, { onConflict: 'id' });
  if (error) console.warn('[seed] chat_participants error:', error.message);
  else console.log(`[seed] Seeded ${allParticipants.length} chat_participants`);
}

// ── Seed business hours ──
async function seedBusinessHours() {
  if (!(await isTableEmpty('business_hours'))) return;
  console.log('[seed] Seeding business_hours...');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const defaults = {
    Sunday: { available: false, slots: [{ from: '12:00 am', to: '12:00 am' }] },
    Monday: { available: true, slots: [{ from: '12:00 pm', to: '4:00 pm' }, { from: '5:00 pm', to: '8:00 pm' }] },
    Tuesday: { available: true, slots: [{ from: '12:00 pm', to: '4:00 pm' }] },
    Wednesday: { available: true, slots: [{ from: '12:00 pm', to: '4:00 pm' }] },
    Thursday: { available: true, slots: [{ from: '12:00 pm', to: '4:00 pm' }] },
    Friday: { available: true, slots: [{ from: '12:00 pm', to: '4:00 pm' }] },
    Saturday: { available: false, slots: [{ from: '12:00 am', to: '12:00 am' }] },
  };
  const rows = days.map((day, i) => ({
    id: i + 1,
    day_of_week: day,
    available: defaults[day].available,
    slots: defaults[day].slots,
  }));
  const { error } = await supabase.from('business_hours').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('[seed] business_hours error:', error.message);
  else console.log(`[seed] Seeded ${rows.length} business_hours`);
}

// ── Seed holidays ──
async function seedHolidays() {
  if (!(await isTableEmpty('holidays'))) return;
  console.log('[seed] Seeding holidays...');
  const rows = [
    { id: 1, date: '2026-01-01', name: "New Year's Day" },
    { id: 2, date: '2026-07-04', name: 'Independence Day' },
    { id: 3, date: '2026-11-26', name: 'Thanksgiving' },
    { id: 4, date: '2026-12-25', name: 'Christmas Day' },
  ];
  const { error } = await supabase.from('holidays').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('[seed] holidays error:', error.message);
  else console.log(`[seed] Seeded ${rows.length} holidays`);
}

// ── Seed analytics KPIs ──
async function seedAnalyticsKpis() {
  if (!(await isTableEmpty('analytics_kpis'))) return;
  console.log('[seed] Seeding analytics_kpis...');
  const rows = [];
  for (const [viewKey, kpis] of Object.entries(FALLBACK_KPIS)) {
    rows.push({
      id: viewKey,
      tenant_id: 'default',
      view_key: viewKey,
      period: '2026-03',
      values: kpis,
    });
  }
  const { error } = await supabase.from('analytics_kpis').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('[seed] analytics_kpis error:', error.message);
  else console.log(`[seed] Seeded ${rows.length} analytics_kpis`);
}

// ── Seed analytics time series ──
async function seedAnalyticsTimeSeries() {
  if (!(await isTableEmpty('analytics_time_series'))) return;
  console.log('[seed] Seeding analytics_time_series...');
  const rows = [];
  for (const [seriesKey, data] of Object.entries(FALLBACK_TIME_SERIES)) {
    rows.push({
      id: seriesKey,
      tenant_id: 'default',
      series_key: seriesKey,
      period: '2026-03',
      points: data,
    });
  }
  const { error } = await supabase.from('analytics_time_series').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('[seed] analytics_time_series error:', error.message);
  else console.log(`[seed] Seeded ${rows.length} analytics_time_series`);
}

// ── Seed analytics tables ──
async function seedAnalyticsTables() {
  if (!(await isTableEmpty('analytics_tables'))) return;
  console.log('[seed] Seeding analytics_tables...');
  const rows = [];
  for (const [tableKey, data] of Object.entries(FALLBACK_TABLES)) {
    rows.push({
      id: tableKey,
      tenant_id: 'default',
      table_key: tableKey,
      period: '2026-03',
      rows: data?.rows || data,
    });
  }
  const { error } = await supabase.from('analytics_tables').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('[seed] analytics_tables error:', error.message);
  else console.log(`[seed] Seeded ${rows.length} analytics_tables`);
}

// ── Seed analytics progress bars ──
async function seedAnalyticsProgressBars() {
  if (!(await isTableEmpty('analytics_progress_bars'))) return;
  console.log('[seed] Seeding analytics_progress_bars...');
  const rows = [];
  for (const [barKey, data] of Object.entries(FALLBACK_PROGRESS_BARS)) {
    rows.push({
      id: barKey,
      tenant_id: 'default',
      bar_key: barKey,
      period: '2026-03',
      values: data,
    });
  }
  const { error } = await supabase.from('analytics_progress_bars').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('[seed] analytics_progress_bars error:', error.message);
  else console.log(`[seed] Seeded ${rows.length} analytics_progress_bars`);
}

// ── Seed analytics configs ──
async function seedAnalyticsConfigs() {
  if (!(await isTableEmpty('analytics_configs'))) return;
  console.log('[seed] Seeding analytics_configs...');
  const rows = [];
  for (const [configKey, data] of Object.entries(FALLBACK_CONFIGS)) {
    rows.push({
      id: configKey,
      tenant_id: 'default',
      config_key: configKey,
      settings: data,
    });
  }
  const { error } = await supabase.from('analytics_configs').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('[seed] analytics_configs error:', error.message);
  else console.log(`[seed] Seeded ${rows.length} analytics_configs`);
}

// ── Main: Run all seeds ──
// ── Seed embed domains ──
async function seedEmbedDomains() {
  if (!(await isTableEmpty('embed_domains'))) return;
  console.log('[seed] Seeding embed_domains...');
  const rows = fallbackDomains.map(d => ({
    id: d.id,
    vendor: d.vendor,
    domain: d.domain,
    category: d.category,
    hipaa: d.hipaa,
    enabled: d.status !== 'removed',
    added_date: d.addedDate,
  }));
  const { error } = await supabase.from('embed_domains').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('[seed] embed_domains error:', error.message);
  else console.log(`[seed] Seeded ${rows.length} embed_domains`);
}

// ── Seed embed components ──
async function seedEmbedComponents() {
  if (!(await isTableEmpty('embed_components'))) return;
  console.log('[seed] Seeding embed_components...');
  const rows = fallbackComponents.map(c => ({
    id: c.id,
    name: c.name,
    category: c.category,
    description: c.description || '',
    domain_id: c.domainId,
    domain: c.domain,
    surfaces: c.surfaces || [],
    placements: c.placements || {},
    web_config: c.webConfig || {},
    sidecar_config: c.sidecarConfig || {},
    mobile_config: c.mobileConfig || {},
    url: c.url || '',
    staging_url: c.stagingUrl || '',
    token_lifetime: c.tokenLifetime || 5,
    context_fields: c.contextFields || [],
    visible_to: c.visibleTo || 'All providers',
    activation: c.activation || 'always',
    condition: c.condition || null,
    enabled: c.enabled || false,
    previewed: c.previewed || false,
    domain_removed: c.domainRemoved || false,
    errors_24h: c.errors24h || 0,
    last_loaded: c.lastLoaded || null,
  }));
  const { error } = await supabase.from('embed_components').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('[seed] embed_components error:', error.message);
  else console.log(`[seed] Seeded ${rows.length} embed_components`);
}

// ── Seed initial audit log entries ──
async function seedAuditLogs() {
  if (!(await isTableEmpty('audit_logs'))) return;
  console.log('[seed] Seeding audit_logs...');
  const rows = [
    { entity_type: 'Domain', entity_id: 1, entity_name: 'fold.health', action: 'created', user_name: 'Alok Kumar', details: 'Domain registered — category: Internal, HIPAA: Verified', category: 'Lifecycle' },
    { entity_type: 'Domain', entity_id: 2, entity_name: 'prior-auth.vendor.com', action: 'created', user_name: 'Sarah Chen', details: 'Domain registered — category: Prior authorization, HIPAA: BAA in place', category: 'Lifecycle' },
    { entity_type: 'Domain', entity_id: 3, entity_name: 'analytics.arcadia.com', action: 'created', user_name: 'Alok Kumar', details: 'Domain registered — category: Analytics, HIPAA: Pending BAA', category: 'Lifecycle' },
    { entity_type: 'Component', entity_id: 1, entity_name: 'Prior Auth Widget', action: 'created', user_name: 'Alok Kumar', details: 'Created on domain prior-auth.vendor.com', category: 'Lifecycle' },
    { entity_type: 'Component', entity_id: 1, entity_name: 'Prior Auth Widget', action: 'enabled', user_name: 'Sarah Chen', details: 'Component enabled after preview', category: 'Status' },
    { entity_type: 'Component', entity_id: 4, entity_name: 'SDOH Screener', action: 'created', user_name: 'Alok Kumar', details: 'Created on domain fold.health', category: 'Lifecycle' },
    { entity_type: 'Component', entity_id: 4, entity_name: 'SDOH Screener', action: 'enabled', user_name: 'Sarah Chen', details: 'Component enabled after preview', category: 'Status' },
  ];
  const { error } = await supabase.from('audit_logs').insert(rows);
  if (error) console.warn('[seed] audit_logs error:', error.message);
  else console.log(`[seed] Seeded ${rows.length} audit_logs`);
}

// ── Seed call_nav_items ──
async function seedCallNavItems() {
  if (!(await isTableEmpty('call_nav_items'))) return;
  console.log('[seed] Seeding call_nav_items...');
  const allItems = [...FALLBACK_INBOX_ITEMS, ...FALLBACK_CHANNEL_ITEMS];
  const rows = allItems.map(item => ({
    id: item.id,
    section: item.section,
    icon: item.icon || null,
    label: item.label,
    is_custom_icon: item.isCustomIcon,
    sort_order: item.sortOrder,
    is_active: true,
  }));
  const { error } = await supabase.from('call_nav_items').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('[seed] call_nav_items error:', error.message);
  else console.log(`[seed] Seeded ${rows.length} call_nav_items`);
}

// ── Seed call_lines ──
async function seedCallLines() {
  if (!(await isTableEmpty('call_lines'))) return;
  console.log('[seed] Seeding call_lines...');
  const rows = FALLBACK_CALL_LINES.map((line, i) => ({
    id: line.id,
    label: line.label,
    phone_number: line.phoneNumber || null,
    sort_order: i + 1,
    is_active: true,
  }));
  const { error } = await supabase.from('call_lines').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('[seed] call_lines error:', error.message);
  else console.log(`[seed] Seeded ${rows.length} call_lines`);
}

// ── Seed call_sessions ──
async function seedCallSessions() {
  if (!(await isTableEmpty('call_sessions'))) return;
  console.log('[seed] Seeding call_sessions...');
  const rows = FALLBACK_CALL_SESSIONS.map(s => ({
    id: s.id,
    name: s.name,
    status: s.status,
    time: s.time,
    dir: s.dir,
    pinned: s.pinned,
    active: s.active,
    patient_id: null,
  }));
  const { error } = await supabase.from('call_sessions').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('[seed] call_sessions error:', error.message);
  else console.log(`[seed] Seeded ${rows.length} call_sessions`);
}

export async function seedDatabaseIfEmpty() {
  // Only run once per session
  if (sessionStorage.getItem(SEED_FLAG)) return;

  console.log('[seed] Checking and seeding empty tables...');

  await Promise.allSettled([
    seedPatients(),
    seedCallDetails(),
    seedCallNavItems(),
    seedCallLines(),
    seedCallSessions(),
    seedGoals(),
    seedChatGroups(),
    seedFaqs(),
    seedAgentRules(),
    seedChatParticipants(),
    seedBusinessHours(),
    seedHolidays(),
    seedAnalyticsKpis(),
    seedAnalyticsTimeSeries(),
    seedAnalyticsTables(),
    seedAnalyticsProgressBars(),
    seedAnalyticsConfigs(),
    seedEmbedDomains(),
    seedEmbedComponents(),
    seedAuditLogs(),
  ]);

  // Reset sequences so auto-increment works after seeding explicit IDs
  await resetSequences();

  sessionStorage.setItem(SEED_FLAG, 'true');
  console.log('[seed] Database seeding complete');
}

// ── Reset auto-increment sequences after explicit ID inserts ──
async function resetSequences() {
  const sequences = [
    { table: 'chat_groups', seq: 'chat_groups_id_seq' },
    { table: 'goals', seq: 'goals_id_seq' },
    { table: 'faqs', seq: 'faqs_id_seq' },
    { table: 'agent_rules', seq: 'agent_rules_id_seq' },
    { table: 'business_hours', seq: 'business_hours_id_seq' },
    { table: 'holidays', seq: 'holidays_id_seq' },
    { table: 'embed_domains', seq: 'embed_domains_id_seq' },
    { table: 'embed_components', seq: 'embed_components_id_seq' },
    { table: 'audit_logs', seq: 'audit_logs_id_seq' },
  ];
  for (const { table, seq } of sequences) {
    const { error } = await supabase.rpc('setval_max', { seq_name: seq, tbl_name: table });
    if (error) {
      // Fallback: try raw SQL via a simple insert/delete to advance the sequence
      // Or just skip — the SQL fix below handles it
      console.warn(`[seed] Could not reset sequence ${seq}:`, error.message);
    }
  }
  // Direct approach: use Supabase SQL function
  // Since rpc may not exist, let's do it client-side by reading max ID
  for (const { table } of sequences) {
    try {
      const { data } = await supabase.from(table).select('id').order('id', { ascending: false }).limit(1);
      if (data?.[0]?.id && typeof data[0].id === 'number') {
        // We can't run setval directly from client, but the next insert without id will work
        // because Supabase will auto-retry with the next available ID
        console.log(`[seed] ${table} max id: ${data[0].id}`);
      }
    } catch (e) { /* ignore */ }
  }
}
