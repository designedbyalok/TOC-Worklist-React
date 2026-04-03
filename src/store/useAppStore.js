import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { dbToJs, updatesToDb } from '../lib/patientMapper';
import { callDetailDbToJs, callDetailJsToDb } from '../lib/callDetailsMapper';
import { patients as fallbackPatients } from '../data/patients';
import { callDetails as fallbackCallDetails, enrichCallRecord } from '../data/callDetails';
import { goals as fallbackGoalsData } from '../data/goals';
import { chatGroups as fallbackChatGroups } from '../data/chatGroups';
import { generateFlowFromPrompt } from '../lib/flowGenerator';
import { kpiRowToJs, tsRowToJs, tableRowToJs, barRowToJs, configRowToJs, groupTimeSeries } from '../lib/analyticsMapper';
import { domainDbToJs, domainJsToDb, componentDbToJs, componentJsToDb, auditLogDbToJs } from '../lib/embedMapper';
import { FALLBACK_KPIS, FALLBACK_TIME_SERIES, FALLBACK_TABLES, FALLBACK_PROGRESS_BARS, FALLBACK_CONFIGS } from '../data/analyticsFallbacks';
import { updateHash } from '../lib/router';

function parseDuration(str) {
  const parts = (str || '00:00').split(':').map(Number);
  return parts[0] * 60 + (parts[1] || 0);
}
function formatDuration(secs) {
  const m = Math.floor(secs / 60), s = secs % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function nextDate(lace) {
  const d = new Date();
  d.setDate(d.getDate() + (lace === 'High' ? 7 : lace === 'Medium' ? 14 : 30));
  return d.toISOString().split('T')[0];
}

// Restore navigation state from sessionStorage on reload
const _savedPage = sessionStorage.getItem('activePage') || 'population';
const _savedTab = sessionStorage.getItem('activeTab') || 'worklist';
const _savedSettingsTab = sessionStorage.getItem('settingsTab');

export const useAppStore = create((set, get) => ({
  // Top-level navigation (sidebar) — restored from sessionStorage
  activePage: _savedPage === 'builder' ? 'settings' : _savedPage,
  // Tab navigation within pages
  activeTab: _savedTab,
  subnavCollapsed: false,
  viewBy: 'window',

  // Table
  patients: [],
  patientsLoading: true,
  patientsError: null,
  selectedIds: [],
  currentPage: 1,
  perPage: 10,
  searchQuery: '',

  // Filters
  activeFilters: {},  // { gender: 'F', language: 'es', lace: 'High', ... }
  activeSubnavList: 'TOC',  // which SubNav list is selected

  // Call Details
  callDetails: [],

  // System Health (Phase 3)
  systemHealth: { ehr: 'ok', retell: 'ok', redis: 'ok', supabase: 'ok' },

  // Goals Directory
  goalsData: null, // null = not yet loaded, array = loaded from DB/fallback
  goalsLoading: true,
  goalDetailId: null,
  goalWizardOpen: false,
  goalWizardEditId: null,

  // Settings navigation (left subnav)
  settingsNavItem: sessionStorage.getItem('settingsNavItem') || 'agents',

  // Messages section
  messageTab: 'chat-settings',

  // Chat Groups (Messages > Chat Settings)
  chatGroupsData: null,
  chatGroupsLoading: true,
  chatGroupDetailId: null,
  agentRulesGroupId: null,
  businessHoursOpen: false,

  // Embedded Components
  embeddedComponentsTab: 'domain-registry',
  componentWizardOpen: false,
  componentWizardEditId: null,
  componentPreviewId: null,

  // Agents (settings)
  agents: [],
  agentsLoading: true,
  settingsTab: _savedSettingsTab || 'agents',
  showCreateAgent: false,

  // Agent Builder (canvas)
  builderAgent: null,       // { id, name, prompt } of the agent being edited
  builderFlow: null,        // { id, nodes, edges, viewport, version }
  builderFlowLoading: false,
  builderSelectedNode: null, // id of currently selected node
  builderVersions: [],      // list of saved versions
  builderPrompt: '',        // original creation prompt

  // UI state
  workflowPatient: null,
  workflowStep: 0,
  stepStates: {},
  callPopoverPatient: null,
  callPopoverBtnRef: null,
  outreachPopoverPatient: null,
  activeCallPatient: null,
  activeCallSeconds: 0,
  activeCallTimerRef: null,
  showInvokeModal: false,
  showCreateNew: false,
  showFilterBar: false,
  toast: null,
  toastSuccess: false,
  queueTabDot: false,
  callTimerRef: null,
  detailPatient: null,
  detailPatientCalls: [],
  liveDrawerPatient: null,

  // ─── Supabase: Fetch patients ───
  fetchPatients: async () => {
    set({ patientsLoading: true, patientsError: null });
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Supabase patients fetch failed:', error.message);
      set({
        patients: [],
        patientsLoading: false,
        patientsError: error.message,
      });
    } else {
      const patients = data.map(dbToJs).map(p => ({
        ...p,
        // Reset transient agent/call state on fresh load —
        // queue should be empty until agents are explicitly invoked
        // But preserve agent assignment for completed patients so they show in queue
        agentAssigned: p.status === 'completed' ? (p.agentAssigned || 'Anna') : '',
        agentRole: p.status === 'completed' ? (p.agentRole || 'TOC Outreach') : '',
        onCall: false,
        status: (p.status === 'oncall' || p.status === 'queued') ? 'scheduled' : p.status,
        callDuration: (p.status === 'oncall') ? null : p.callDuration,
      }));
      // Sort by numeric part of id (p1, p2, ... p10, p11, ...)
      patients.sort((a, b) => {
        const na = parseInt(a.id.replace(/\D/g, ''), 10);
        const nb = parseInt(b.id.replace(/\D/g, ''), 10);
        return na - nb;
      });
      set({
        patients,
        patientsLoading: false,
      });
    }
  },

  // ─── Supabase: Fetch call details ───
  fetchCallDetails: async () => {
    const { data, error } = await supabase
      .from('call_details')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('call_details fetch failed, using fallback:', error.message);
      console.warn('Supabase call_details fetch failed:', error.message);
      set({ callDetails: [] });
    } else {
      set({ callDetails: data.map(c => enrichCallRecord(callDetailDbToJs(c))) });
    }
  },

  // Helper: get call records for a patient
  getCallsForPatient: (patientId) => {
    return get().callDetails.filter(c => c.patientId === patientId);
  },

  // Helper: get latest call of a specific type
  getLatestCall: (patientId, callType) => {
    return get().callDetails.find(c => c.patientId === patientId && c.callType === callType);
  },

  // Create a new call record (on agent invoke)
  createCallRecord: (record) => {
    set(s => ({ callDetails: [enrichCallRecord(record), ...s.callDetails] }));
    // Persist to Supabase in background
    supabase.from('call_details').insert(callDetailJsToDb(record)).then(({ error }) => {
      if (error) console.warn('Failed to persist call record:', error.message);
    });
  },

  // Update an existing call record
  updateCallRecord: (callId, updates) => {
    set(s => ({
      callDetails: s.callDetails.map(c => c.id === callId ? { ...c, ...updates } : c)
    }));
  },

  // ─── Supabase: Persist a patient update ───
  persistPatient: async (id, updates) => {
    const dbUpdates = updatesToDb(updates);
    const { error } = await supabase
      .from('patients')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Failed to persist patient update:', error.message);
    }
  },

  // Actions
  setActivePage: (page) => { sessionStorage.setItem('activePage', page); set({ activePage: page }); updateHash(get); },
  setActiveTab: (tab) => { sessionStorage.setItem('activeTab', tab); set({ activeTab: tab }); updateHash(get); },
  setSettingsTab: (tab) => { sessionStorage.setItem('settingsTab', tab); set({ settingsTab: tab }); updateHash(get); },
  setShowCreateAgent: (v) => set({ showCreateAgent: v }),

  // Settings nav
  setSettingsNavItem: (item) => { sessionStorage.setItem('settingsNavItem', item); set({ settingsNavItem: item }); updateHash(get); },

  // Chat Groups actions
  setMessageTab: (tab) => { set({ messageTab: tab }); updateHash(get); },
  setChatGroupDetailId: (id) => { set({ chatGroupDetailId: id }); updateHash(get); },
  setAgentRulesGroupId: (id) => { set({ agentRulesGroupId: id }); updateHash(get); },
  setBusinessHoursOpen: (open) => { set({ businessHoursOpen: open }); updateHash(get); },

  setEmbeddedComponentsTab: (tab) => { set({ embeddedComponentsTab: tab }); updateHash(get); },
  setComponentWizard: (open, editId = null) => { set({ componentWizardOpen: open, componentWizardEditId: editId }); },
  setComponentPreviewId: (id) => { set({ componentPreviewId: id }); },

  fetchChatGroups: async () => {
    set({ chatGroupsLoading: true });
    const { data, error } = await supabase
      .from('chat_groups')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('chat_groups fetch failed, using fallback:', error.message);
      console.warn('Supabase chat_groups fetch failed:', error.message);
      set({ chatGroupsData: [], chatGroupsLoading: false });
    } else {
      const mapped = data.map(row => ({
        id: row.id,
        name: row.name,
        users: row.users || [],
        roles: row.roles || [],
        location: row.location || 'Global Template',
        updated: row.updated_at ? new Date(row.updated_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '',
        updatedBy: row.updated_by || '',
        activeChats: row.active_chats || 0,
        hasAgent: row.has_agent || false,
        agentName: row.agent_name || '',
      }));
      set({ chatGroupsData: mapped, chatGroupsLoading: false });
    }
  },

  addChatGroup: async (group) => {
    const row = {
      name: group.name,
      users: group.users || [],
      roles: group.roles || [],
      location: group.location || 'Global Template',
      updated_by: group.updatedBy || '',
      active_chats: 0,
      has_agent: group.hasAgent || false,
      agent_name: group.agentName || null,
    };
    let { data, error } = await supabase.from('chat_groups').insert(row).select();
    if (error) {
      console.warn('Failed to create chat group:', error.message);
      // Show user feedback
      get().showToast?.('Failed to save group. Please try again.');
      return;
    }
    if (data?.[0]) {
      const newGroup = {
        id: data[0].id, name: data[0].name, users: data[0].users || [], roles: data[0].roles || [],
        location: data[0].location, updated: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        updatedBy: data[0].updated_by || '', activeChats: 0, hasAgent: data[0].has_agent, agentName: data[0].agent_name || '',
      };
      set(s => ({ chatGroupsData: [newGroup, ...(s.chatGroupsData || [])] }));
      get().logAudit('ChatGroup', newGroup.id, newGroup.name, 'created', `Chat group created`, 'Lifecycle');
    }
  },

  updateChatGroup: async (id, updates) => {
    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.users !== undefined) dbUpdates.users = updates.users;
    if (updates.roles !== undefined) dbUpdates.roles = updates.roles;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.hasAgent !== undefined) dbUpdates.has_agent = updates.hasAgent;
    if (updates.agentName !== undefined) dbUpdates.agent_name = updates.agentName;
    dbUpdates.updated_at = new Date().toISOString();
    const { error } = await supabase.from('chat_groups').update(dbUpdates).eq('id', id);
    if (error) { console.warn('Failed to update chat group:', error.message); return; }
    set(s => ({
      chatGroupsData: (s.chatGroupsData || []).map(g => g.id === id ? {
        ...g, ...updates,
        updated: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      } : g),
    }));
    const group = (get().chatGroupsData || []).find(g => g.id === id);
    get().logAudit('ChatGroup', id, group?.name || '', 'updated', Object.keys(updates).join(', ') + ' changed', 'Configuration');
  },

  deleteChatGroup: async (id) => {
    const group = (get().chatGroupsData || []).find(g => g.id === id);
    set(s => ({ chatGroupsData: (s.chatGroupsData || []).filter(g => g.id !== id) }));
    const { error } = await supabase.from('chat_groups').delete().eq('id', id);
    if (error) console.warn('Failed to delete chat group:', error.message);
    if (group) get().logAudit('ChatGroup', id, group.name, 'deleted', 'Chat group deleted', 'Lifecycle');
  },

  // Knowledge Base add trigger (used by AgentsTable to tell KnowledgeBasePanel to open add form)
  kbAddTrigger: false,
  setKbAddTrigger: (v) => set({ kbAddTrigger: v }),

  // Domain Registry add trigger (used by EmbeddedComponentsSettings to tell DomainRegistryPanel to open add modal)
  domainAddTrigger: false,
  setDomainAddTrigger: (v) => set({ domainAddTrigger: v }),

  // ── Embed Domains (Supabase-backed) ──
  embedDomains: [],
  embedDomainsLoading: false,
  fetchEmbedDomains: async () => {
    set({ embedDomainsLoading: true });
    const { data, error } = await supabase.from('embed_domains').select('*').order('id');
    if (error) { console.warn('[store] embed_domains fetch failed:', error.message); set({ embedDomainsLoading: false }); return; }
        set({ embedDomains: (data || []).map(domainDbToJs), embedDomainsLoading: false });
  },
  addEmbedDomain: async (domain) => {
    // Check for duplicate domain
    const existing = get().embedDomains.find(d => d.domain?.toLowerCase() === domain.domain?.toLowerCase());
    if (existing) {
      get().showToast(`Domain "${domain.domain}" is already registered`);
      return null;
    }
    const row = domainJsToDb(domain);
    const { data, error } = await supabase.from('embed_domains').insert(row).select();
    if (error) {
      console.warn('[store] addEmbedDomain failed:', error.message);
      if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
        get().showToast(`Domain "${domain.domain}" already exists`);
      } else {
        get().showToast(`Failed to register domain: ${error.message}`);
      }
      return null;
    }
        const newDomain = domainDbToJs(data[0]);
    set(s => ({ embedDomains: [newDomain, ...s.embedDomains] }));
    get().logAudit('Domain', newDomain.id, newDomain.domain, 'created', `Registered — category: ${newDomain.category}, HIPAA: ${newDomain.hipaa}`, 'Lifecycle');
    return newDomain;
  },
  updateEmbedDomain: async (id, updates) => {
    const oldDomain = get().embedDomains.find(d => d.id === id);
    const dbUpdates = domainJsToDb(updates);
    await supabase.from('embed_domains').update(dbUpdates).eq('id', id);
    set(s => ({ embedDomains: s.embedDomains.map(d => d.id === id ? { ...d, ...updates } : d) }));
    const changes = [];
    if (oldDomain) {
      for (const key of Object.keys(updates)) {
        if (oldDomain[key] !== updates[key]) {
          changes.push({ field: key, from: String(oldDomain[key] || ''), to: String(updates[key] || ''), type: key === 'enabled' ? 'status' : 'text' });
        }
      }
    }
    get().logAudit('Domain', id, oldDomain?.domain || '', 'updated', Object.keys(updates).join(', ') + ' changed', 'Configuration', changes);
  },
  deleteEmbedDomain: async (id) => {
    // Block deletion if components reference this domain
    const compsUsingDomain = get().embedComponents.filter(c => c.domainId === id);
    if (compsUsingDomain.length > 0) {
      get().showToast(`Cannot delete — ${compsUsingDomain.length} component(s) use this domain. Remove or reassign them first.`);
      return false;
    }
    const domain = get().embedDomains.find(d => d.id === id);
    await supabase.from('embed_domains').delete().eq('id', id);
    set(s => ({ embedDomains: s.embedDomains.filter(d => d.id !== id) }));
    if (domain) get().logAudit('Domain', id, domain.domain, 'deleted', `Domain removed`, 'Lifecycle');
    return true;
  },
  toggleEmbedDomain: async (id) => {
    const domain = get().embedDomains.find(d => d.id === id);
    if (!domain) return;
    const newEnabled = !domain.enabled;
    await supabase.from('embed_domains').update({ enabled: newEnabled }).eq('id', id);
    set(s => ({ embedDomains: s.embedDomains.map(d => d.id === id ? { ...d, enabled: newEnabled } : d) }));
    get().logAudit('Domain', id, domain.domain, newEnabled ? 'enabled' : 'disabled', newEnabled ? 'Domain enabled' : 'Domain disabled', 'Status',
      [{ field: 'enabled', from: domain.enabled ? 'Enabled' : 'Disabled', to: newEnabled ? 'Enabled' : 'Disabled', type: 'status' }]);
  },

  // ── Embed Components (Supabase-backed) ──
  embedComponents: [],
  embedComponentsLoading: false,
  fetchEmbedComponents: async () => {
    set({ embedComponentsLoading: true });
    const { data, error } = await supabase.from('embed_components').select('*').order('id');
    if (error) { console.warn('[store] embed_components fetch failed:', error.message); set({ embedComponentsLoading: false }); return; }
        set({ embedComponents: (data || []).map(componentDbToJs), embedComponentsLoading: false });
  },
  addEmbedComponent: async (comp) => {
        const row = componentJsToDb(comp);
    const { data, error } = await supabase.from('embed_components').insert(row).select();
    if (error) { console.warn('[store] addEmbedComponent failed:', error.message); return null; }
        const newComp = componentDbToJs(data[0]);
    set(s => ({ embedComponents: [newComp, ...s.embedComponents] }));
    get().logAudit('Component', newComp.id, newComp.name, 'created', `Created on domain ${newComp.domain}`, 'Lifecycle');
    return newComp;
  },
  updateEmbedComponent: async (id, updates) => {
    const oldComp = get().embedComponents.find(c => c.id === id);
    const dbUpdates = componentJsToDb(updates);
    await supabase.from('embed_components').update(dbUpdates).eq('id', id);
    set(s => ({ embedComponents: s.embedComponents.map(c => c.id === id ? { ...c, ...updates } : c) }));
    // Build structured changes for rich audit log
    const changes = [];
    if (oldComp) {
      const trackFields = ['name', 'category', 'description', 'domain', 'url', 'visibleTo', 'activation', 'tokenLifetime', 'enabled'];
      for (const key of trackFields) {
        if (updates[key] !== undefined && String(oldComp[key] || '') !== String(updates[key] || '')) {
          changes.push({ field: key, from: String(oldComp[key] || ''), to: String(updates[key] || ''), type: key === 'enabled' ? 'status' : 'text' });
        }
      }
    }
    get().logAudit('Component', id, oldComp?.name || '', 'updated', Object.keys(updates).join(', ') + ' changed', 'Configuration', changes);
  },
  deleteEmbedComponent: async (id) => {
    const comp = get().embedComponents.find(c => c.id === id);
    await supabase.from('embed_components').delete().eq('id', id);
    set(s => ({ embedComponents: s.embedComponents.filter(c => c.id !== id) }));
    if (comp) get().logAudit('Component', id, comp.name, 'deleted', `Component removed`, 'Lifecycle');
  },
  toggleEmbedComponent: async (id) => {
    const comp = get().embedComponents.find(c => c.id === id);
    if (!comp) return;
    const newEnabled = !comp.enabled;
    await supabase.from('embed_components').update({ enabled: newEnabled }).eq('id', id);
    set(s => ({ embedComponents: s.embedComponents.map(c => c.id === id ? { ...c, enabled: newEnabled } : c) }));
    get().logAudit('Component', id, comp.name, newEnabled ? 'enabled' : 'disabled', newEnabled ? 'Component enabled' : 'Component disabled', 'Status',
      [{ field: 'enabled', from: comp.enabled ? 'Enabled' : 'Disabled', to: newEnabled ? 'Enabled' : 'Disabled', type: 'status' }]);
  },
  duplicateEmbedComponent: async (id) => {
    const comp = get().embedComponents.find(c => c.id === id);
    if (!comp) return null;
        const dup = { ...comp, name: comp.name + ' (Copy)', enabled: false, id: undefined };
    const row = componentJsToDb(dup);
    delete row.id;
    const { data, error } = await supabase.from('embed_components').insert(row).select();
    if (error) { console.warn('[store] duplicateEmbedComponent failed:', error.message); return null; }
        const newComp = componentDbToJs(data[0]);
    set(s => ({ embedComponents: [...s.embedComponents, newComp] }));
    get().logAudit('Component', newComp.id, newComp.name, 'created', `Duplicated from "${comp.name}"`, 'Lifecycle');
    return newComp;
  },

  // ── Audit Log (Supabase-backed) ──
  // changes: JSON string of [{field, from, to, type}] for rich diff display
  logAudit: async (entityType, entityId, entityName, action, details, category, changes) => {
    // Get the current user's full name from Supabase auth
    let userName = 'Current User';
    try {
      const { data } = await supabase.auth.getUser();
      const meta = data?.user?.user_metadata || {};
      if (meta.first_name && meta.last_name) userName = `${meta.first_name} ${meta.last_name}`;
      else if (meta.full_name) userName = meta.full_name;
      else if (data?.user?.email) userName = data.user.email.split('@')[0];
    } catch (e) { /* fallback to Current User */ }
    const row = {
      entity_type: entityType, entity_id: entityId, entity_name: entityName,
      action, user_name: userName, details: details || null,
      category: category || null,
    };
    // Store changes in the details field as JSON if provided
    if (changes && changes.length > 0) {
      row.details = JSON.stringify({ text: details, changes });
    }
    const { error } = await supabase.from('audit_logs').insert(row);
    if (error) console.warn('[store] logAudit failed:', error.message);
  },
  fetchAuditLogs: async (entityType, entityId) => {
    let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (entityType) query = query.eq('entity_type', entityType);
    if (entityId) query = query.eq('entity_id', entityId);
    const { data, error } = await query.limit(100);
    if (error) { console.warn('[store] fetchAuditLogs failed:', error.message); return []; }
        return (data || []).map(auditLogDbToJs);
  },

  // FAQs
  faqsData: null,
  fetchFaqs: async () => {
    const { data, error } = await supabase.from('faqs').select('*').order('id');
    if (error) { console.warn('[store] faqs fetch failed:', error.message); return; }
    set({ faqsData: data.map(r => ({ id: r.id, question: r.question, answer: r.answer, category: r.category, updatedAt: r.updated_at || r.created_at })) });
  },
  addFaq: async (faq) => {
    const row = { question: faq.question, answer: faq.answer, category: faq.category };
    const { data, error } = await supabase.from('faqs').insert(row).select();
    if (!error && data && data[0]) {
      const r = data[0];
      set(s => ({ faqsData: [...(s.faqsData || []), { id: r.id, question: r.question, answer: r.answer, category: r.category, updatedAt: (r.updated_at || r.created_at || '').slice(0, 10) }] }));
    }
  },
  updateFaq: async (id, updates) => {
    const now = new Date().toISOString();
    await supabase.from('faqs').update({ ...updates, updated_at: now }).eq('id', id);
    set(s => ({ faqsData: (s.faqsData || []).map(f => f.id === id ? { ...f, ...updates, updatedAt: now.slice(0, 10) } : f) }));
  },
  deleteFaq: async (id) => {
    await supabase.from('faqs').delete().eq('id', id);
    set(s => ({ faqsData: (s.faqsData || []).filter(f => f.id !== id) }));
  },

  // Agent Rules
  agentRulesData: null,
  fetchAgentRules: async () => {
    const { data, error } = await supabase.from('agent_rules').select('*').order('sort_order');
    if (error) { console.warn('[store] agent_rules fetch failed:', error.message); return; }
    set({ agentRulesData: data.map(r => ({ id: r.id, name: r.name, type: r.type, locked: r.locked, enabled: r.enabled, condition: r.condition_text, action: r.action_text, priority: r.priority_label, sortOrder: r.sort_order })) });
  },
  addAgentRule: async (rule) => {
    const row = { name: rule.name, type: 'custom', locked: false, enabled: true, condition_text: rule.condition, action_text: rule.action, sort_order: rule.sortOrder || 99 };
    const { data, error } = await supabase.from('agent_rules').insert(row).select();
    if (!error && data) {
      const mapped = { id: data[0].id, name: data[0].name, type: 'custom', locked: false, enabled: true, condition: data[0].condition_text, action: data[0].action_text, sortOrder: data[0].sort_order };
      set(s => ({ agentRulesData: [...(s.agentRulesData || []), mapped] }));
    }
  },
  updateAgentRule: async (id, updates) => {
    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.enabled !== undefined) dbUpdates.enabled = updates.enabled;
    if (updates.condition !== undefined) dbUpdates.condition_text = updates.condition;
    if (updates.action !== undefined) dbUpdates.action_text = updates.action;
    await supabase.from('agent_rules').update(dbUpdates).eq('id', id);
    set(s => ({ agentRulesData: (s.agentRulesData || []).map(r => r.id === id ? { ...r, ...updates } : r) }));
  },
  deleteAgentRule: async (id) => {
    await supabase.from('agent_rules').delete().eq('id', id);
    set(s => ({ agentRulesData: (s.agentRulesData || []).filter(r => r.id !== id) }));
  },

  // Chat Participants
  participantsData: null,
  fetchParticipants: async () => {
    const { data, error } = await supabase.from('chat_participants').select('*').order('id');
    if (error) { console.warn('[store] chat_participants fetch failed:', error.message); return; }
    set({ participantsData: data.map(r => ({ id: r.id, name: r.name, role: r.role, type: r.type, isAgent: r.is_agent })) });
  },

  // Business Hours
  businessHoursData: null,
  fetchBusinessHoursData: async () => {
    const { data, error } = await supabase.from('business_hours').select('*').order('id');
    if (error) { console.warn('[store] business_hours fetch failed:', error.message); return; }
    set({ businessHoursData: data.map(r => ({ id: r.id, day: r.day_of_week, available: r.available, slots: r.slots })) });
  },
  updateBusinessHoursDay: async (id, updates) => {
    const dbUpdates = {};
    if (updates.available !== undefined) dbUpdates.available = updates.available;
    if (updates.slots !== undefined) dbUpdates.slots = updates.slots;
    await supabase.from('business_hours').update(dbUpdates).eq('id', id);
    set(s => ({ businessHoursData: (s.businessHoursData || []).map(d => d.id === id ? { ...d, ...updates } : d) }));
  },

  // Holidays
  holidaysData: null,
  fetchHolidays: async () => {
    const { data, error } = await supabase.from('holidays').select('*').order('date');
    if (error) { console.warn('[store] holidays fetch failed:', error.message); return; }
    set({ holidaysData: data.map(r => ({ id: r.id, date: r.date, name: r.name })) });
  },
  addHoliday: async (holiday) => {
    const { data, error } = await supabase.from('holidays').insert({ date: holiday.date, name: holiday.name }).select();
    if (!error && data) set(s => ({ holidaysData: [...(s.holidaysData || []), { id: data[0].id, date: data[0].date, name: data[0].name }] }));
  },
  deleteHoliday: async (id) => {
    await supabase.from('holidays').delete().eq('id', id);
    set(s => ({ holidaysData: (s.holidaysData || []).filter(h => h.id !== id) }));
  },

  // Goals actions
  setGoalDetailId: (id) => { set({ goalDetailId: id }); updateHash(get); },
  setGoalWizard: (open, editId) => { set({ goalWizardOpen: open, goalWizardEditId: editId || null }); updateHash(get); },

  fetchGoals: async () => {
    set({ goalsLoading: true });
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('goals fetch failed, using fallback:', error.message);
      console.warn('Supabase goals fetch failed:', error.message);
      set({ goalsData: [], goalsLoading: false });
    } else {
      // Map DB snake_case → JS camelCase
      const mapped = data.map(row => ({
        id: row.id,
        name: row.name,
        program: row.program,
        programColor: row.program_color || (row.program === 'TCM' ? 'purple' : row.program === 'Outreach' ? 'blue' : 'amber'),
        description: row.description || '',
        status: row.status || 'draft',
        weightedScoring: row.weighted_scoring || false,
        passingScore: row.passing_score || 100,
        mode: row.mode || 'all-mandatory',
        steps: row.steps || [],
        successMetrics: row.success_metrics || [],
        agents: row.agents || [],
        completionRate: row.completion_rate || 0,
        totalRuns: row.total_runs || 0,
        created: row.created_at ? row.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
      }));
      set({ goalsData: mapped, goalsLoading: false });
    }
  },

  addGoal: async (goal) => {
    // Optimistic update
    set(s => {
      const current = s.goalsData || [];
      return { goalsData: [goal, ...current] };
    });
    // Persist to Supabase
    const row = {
      id: goal.id,
      name: goal.name,
      program: goal.program,
      program_color: goal.programColor,
      description: goal.description,
      status: goal.status,
      weighted_scoring: goal.weightedScoring,
      passing_score: goal.passingScore,
      mode: goal.mode,
      steps: goal.steps,
      success_metrics: goal.successMetrics,
      agents: goal.agents,
      completion_rate: goal.completionRate,
      total_runs: goal.totalRuns,
    };
    const { error } = await supabase.from('goals').insert(row);
    if (error) console.warn('Failed to persist goal:', error.message);
    get().logAudit('Goal', goal.id, goal.name, 'created', `Goal created — program: ${goal.program}, status: ${goal.status}`, 'Lifecycle');
  },

  updateGoal: async (goal) => {
    // Optimistic update
    set(s => {
      const current = s.goalsData || [];
      return { goalsData: current.map(g => g.id === goal.id ? goal : g) };
    });
    // Persist to Supabase
    const row = {
      name: goal.name,
      program: goal.program,
      program_color: goal.programColor,
      description: goal.description,
      status: goal.status,
      weighted_scoring: goal.weightedScoring,
      passing_score: goal.passingScore,
      mode: goal.mode,
      steps: goal.steps,
      success_metrics: goal.successMetrics,
      agents: goal.agents,
    };
    const { error } = await supabase.from('goals').update(row).eq('id', goal.id);
    if (error) console.warn('Failed to update goal:', error.message);
    get().logAudit('Goal', goal.id, goal.name, 'updated', `Goal updated — ${goal.name}`, 'Configuration');
  },

  deleteGoal: async (id) => {
    const goal = (get().goalsData || []).find(g => g.id === id);
    set(s => ({ goalsData: (s.goalsData || []).filter(g => g.id !== id) }));
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) console.warn('Failed to delete goal:', error.message);
    if (goal) get().logAudit('Goal', id, goal.name, 'deleted', `Goal deleted`, 'Lifecycle');
  },

  toggleSubnav: () => set(s => ({ subnavCollapsed: !s.subnavCollapsed })),
  setViewBy: (v) => set({ viewBy: v, currentPage: 1 }),
  setActiveFilters: (filters) => set({ activeFilters: filters, currentPage: 1 }),
  setFilter: (key, value) => set(s => {
    const next = { ...s.activeFilters };
    if (value === null || value === undefined) {
      delete next[key];
    } else {
      next[key] = value;
    }
    return { activeFilters: next, currentPage: 1 };
  }),
  clearAllFilters: () => set({ activeFilters: {}, currentPage: 1 }),
  setActiveSubnavList: (list) => set({ activeSubnavList: list, currentPage: 1 }),

  fetchAgents: async () => {
    set({ agentsLoading: true });
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Failed to fetch agents:', error.message);
      set({ agents: [], agentsLoading: false });
    } else {
      // Sort by numeric part of id for consistent order
      data.sort((a, b) => {
        const na = parseInt(a.id.replace(/\D/g, ''), 10);
        const nb = parseInt(b.id.replace(/\D/g, ''), 10);
        return na - nb;
      });
      set({ agents: data, agentsLoading: false });
    }
  },

  updateAgent: async (id, updates) => {
    const agent = get().agents.find(a => a.id === id);
    set(s => ({
      agents: s.agents.map(a => a.id === id ? { ...a, ...updates } : a)
    }));
    await supabase.from('agents').update(updates).eq('id', id);
    get().logAudit('Agent', id, agent?.name || '', 'updated', Object.keys(updates).join(', ') + ' changed', 'Configuration');
  },

  // ─── Agent Builder actions ───
  openBuilder: (agent, prompt) => {
    sessionStorage.setItem('activePage', 'builder');
    set({ builderAgent: agent, activePage: 'builder', builderSelectedNode: null, builderPrompt: prompt || '' });
    get().fetchFlow(agent.id, prompt);
  },

  closeBuilder: () => {
    sessionStorage.setItem('activePage', 'settings');
    set({ builderAgent: null, builderFlow: null, builderSelectedNode: null, builderVersions: [], builderPrompt: '', activePage: 'settings' });
  },

  setBuilderSelectedNode: (nodeId) => set({ builderSelectedNode: nodeId }),

  fetchFlow: async (agentId, prompt) => {
    set({ builderFlowLoading: true });

    // Generate flow from prompt or use defaults
    const generated = prompt ? generateFlowFromPrompt(prompt) : null;

    const defaultNodes = generated?.nodes || [
      { id: 'start', type: 'startNode', position: { x: 200, y: 300 }, data: { label: 'Starts Here' } },
      { id: 'n1', type: 'conversationNode', position: { x: 380, y: 240 }, data: { label: 'Introduction & Patient Verification', prompt: 'Hello, this is the Fold Health care support assistant calling as part of your Transitions of Care follow-up program.\n\nI\'m reaching out because you were recently discharged from the hospital, and we want to make sure you\'re recovering safely.\n\nIs now a good time to talk for about 5 minutes?', nodeType: 'conversation', verified: true, transitions: [{ condition: 'If yes', target: 'Identity Verification' }, { condition: 'If no', target: 'Reschedule Node' }], guardrails: 'Do not share any patient data with the caller.' } },
      { id: 'n2', type: 'conversationNode', position: { x: 600, y: 100 }, data: { label: 'Identity Verification Node', prompt: 'To make sure I\'m speaking with the right person, could you please confirm your full name and date of birth?', nodeType: 'conversation', verified: true, transitions: [{ condition: 'Verified', target: 'Discharge Confirmation' }, { condition: 'Not verified', target: 'Transfer to Staff' }] } },
      { id: 'n3', type: 'conversationNode', position: { x: 550, y: 500 }, data: { label: 'Reschedule Node', prompt: 'No problem. When would be a better time for us to call you back?', nodeType: 'conversation', transitions: [{ condition: 'Save callback time', target: 'End' }] } },
      { id: 'end', type: 'endNode', position: { x: 900, y: 300 }, data: { label: 'End' } },
    ];
    const defaultEdges = generated?.edges || [
      { id: 'e-start-n1', source: 'start', target: 'n1', type: 'smoothstep', animated: true },
      { id: 'e-n1-n2', source: 'n1', target: 'n2', sourceHandle: 't-0', type: 'smoothstep' },
      { id: 'e-n1-n3', source: 'n1', target: 'n3', sourceHandle: 't-1', type: 'smoothstep' },
      { id: 'e-n3-end', source: 'n3', target: 'end', sourceHandle: 't-0', type: 'smoothstep' },
    ];

    try {
      const { data, error } = await supabase
        .from('agent_flows')
        .select('*')
        .eq('agent_id', agentId)
        .eq('is_current', true)
        .single();

      if (error || !data) {
        // Try to create a new flow in the DB
        const { data: newFlow, error: insertErr } = await supabase.from('agent_flows').insert({
          agent_id: agentId,
          version: '1.0',
          nodes: defaultNodes,
          edges: defaultEdges,
          is_current: true,
        }).select().single();

        if (insertErr) {
          // DB table may not exist yet - use local flow
          console.warn('agent_flows table not ready, using local flow:', insertErr.message);
          set({
            builderFlow: { id: 'local', nodes: defaultNodes, edges: defaultEdges, viewport: { x: 0, y: 0, zoom: 1 }, version: '1.0', agent_id: agentId },
            builderFlowLoading: false,
          });
          return;
        }

        set({
          builderFlow: newFlow || { id: 'local', nodes: defaultNodes, edges: defaultEdges, viewport: { x: 0, y: 0, zoom: 1 }, version: '1.0' },
          builderFlowLoading: false,
        });
      } else {
        set({ builderFlow: data, builderFlowLoading: false });
      }

      // Fetch all versions
      const { data: versions } = await supabase
        .from('agent_flows')
        .select('id, version, created_at, is_current')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (versions) set({ builderVersions: versions });
    } catch (err) {
      console.warn('Flow fetch error, using defaults:', err);
      set({
        builderFlow: { id: 'local', nodes: defaultNodes, edges: defaultEdges, viewport: { x: 0, y: 0, zoom: 1 }, version: '1.0' },
        builderFlowLoading: false,
      });
    }
  },

  saveFlow: async (nodes, edges, viewport) => {
    const { builderFlow, builderAgent } = get();
    if (!builderFlow || !builderAgent) return;

    const updates = { nodes, edges, viewport, updated_at: new Date().toISOString() };
    set(s => ({ builderFlow: { ...s.builderFlow, ...updates } }));

    await supabase.from('agent_flows').update(updates).eq('id', builderFlow.id);
    return true;
  },

  createFlowVersion: async (nodes, edges, viewport) => {
    const { builderFlow, builderAgent } = get();
    if (!builderFlow || !builderAgent) return;

    // Mark old as not current
    await supabase.from('agent_flows').update({ is_current: false }).eq('id', builderFlow.id);

    // Parse version
    const parts = (builderFlow.version || '1.0').split('.');
    const newVersion = parts[0] + '.' + (parseInt(parts[1] || 0) + 1);

    const { data: newFlow } = await supabase.from('agent_flows').insert({
      agent_id: builderAgent.id,
      version: newVersion,
      nodes,
      edges,
      viewport,
      is_current: true,
    }).select().single();

    if (newFlow) {
      set({ builderFlow: newFlow });
      // Refresh versions list
      const { data: versions } = await supabase
        .from('agent_flows')
        .select('id, version, created_at, is_current')
        .eq('agent_id', builderAgent.id)
        .order('created_at', { ascending: false });
      if (versions) set({ builderVersions: versions });

      // Also update agent version
      await supabase.from('agents').update({ version: newVersion }).eq('id', builderAgent.id);
    }
    return newVersion;
  },

  switchFlowVersion: async (flowId) => {
    const { builderAgent } = get();
    if (!builderAgent) return;

    // Unset current
    await supabase.from('agent_flows').update({ is_current: false }).eq('agent_id', builderAgent.id).eq('is_current', true);
    // Set new current
    await supabase.from('agent_flows').update({ is_current: true }).eq('id', flowId);
    // Re-fetch
    get().fetchFlow(builderAgent.id);
  },

  updateNodeData: (nodeId, dataUpdates) => {
    set(s => {
      if (!s.builderFlow) return {};
      const nodes = s.builderFlow.nodes.map(n =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...dataUpdates } } : n
      );
      return { builderFlow: { ...s.builderFlow, nodes } };
    });
  },

  setCurrentPage: (page) => set({ currentPage: page }),
  setPerPage: (pp) => set({ perPage: pp, currentPage: 1 }),
  setSearchQuery: (q) => set({ searchQuery: q, currentPage: 1 }),

  selectPatient: (id) => set(s => ({
    selectedIds: s.selectedIds.includes(id)
      ? s.selectedIds.filter(x => x !== id)
      : [...s.selectedIds, id]
  })),
  selectAll: (ids) => set({ selectedIds: ids }),
  clearSelected: () => set({ selectedIds: [] }),

  openWorkflow: (patientId) => {
    const p = get().patients.find(x => x.id === patientId);
    if (!p) return;
    const stepStates = {
      s1: p.status === 'completed' ? 'done' : (p.status === 'oncall' ? 'active' : 'pending'),
      s2: (p.tocStatus === 'enrolled' || p.tocStatus === 'engaged') ? 'active' : 'pending',
      s3: 'pending',
      s4: (p.status === 'scheduled' || p.status === 'queued') ? 'active' : 'pending'
    };
    set({ workflowPatient: p, workflowStep: 0, stepStates });
  },
  closeWorkflow: () => set({ workflowPatient: null }),

  setStepState: (stepId, state) => set(s => ({
    stepStates: { ...s.stepStates, [stepId]: state }
  })),

  updatePatient: (id, updates) => {
    // Optimistic local update
    set(s => ({
      patients: s.patients.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
    // Persist to Supabase in background
    get().persistPatient(id, updates);
  },

  saveWorkflow: () => {
    const { workflowPatient, stepStates } = get();
    if (!workflowPatient) return;
    const allDone = ['s1','s2','s3','s4'].every(s => stepStates[s] === 'done');
    let updates = {};
    if (allDone) {
      updates = { status: 'completed', goals: workflowPatient.goals || { met: 3, total: 4 }, nextAction: '__MED_REVIEW__' };
    } else if (stepStates.s4 === 'done') {
      updates = { status: 'scheduled', nextAction: 'Follow-up appointment confirmed' };
    } else if (stepStates.s3 === 'done') {
      updates = { status: 'scheduled', nextAction: 'Schedule follow-up appointment' };
    } else if (stepStates.s2 === 'done') {
      updates = { nextAction: 'Complete medication reconciliation' };
    }
    // Optimistic local update
    set(s => ({
      patients: s.patients.map(p => p.id === workflowPatient.id ? { ...p, ...updates } : p),
      workflowPatient: null,
      toast: 'Workflow saved successfully'
    }));
    // Persist to Supabase
    if (Object.keys(updates).length > 0) {
      get().persistPatient(workflowPatient.id, updates);
    }
  },

  invokeAgent: (patientIds, agentName, agentRole) => {
    const MAX_CONCURRENT = 3;
    const state = get();
    let activeCount = state.patients.filter(p => p.status === 'oncall' && p.onCall).length;
    const updated = state.patients.map(p => {
      if (!patientIds.includes(p.id)) return p;
      const newP = { ...p, agentAssigned: agentName, agentRole };
      if (p.status !== 'completed' && p.status !== 'failed') {
        if (activeCount < MAX_CONCURRENT) {
          newP.status = 'oncall';
          newP.onCall = true;
          newP.callDuration = '00:00';
          newP.nextAction = 'Live outreach in progress';
          activeCount++;
        } else {
          newP.status = 'queued';
          newP.onCall = false;
          newP.nextAction = 'Queued — waiting for available line';
        }
      }
      return newP;
    });
    set({ patients: updated, selectedIds: [], showInvokeModal: false, toastSuccess: true, queueTabDot: true });

    // Create call records for invoked patients and persist to Supabase
    for (const p of updated) {
      if (patientIds.includes(p.id)) {
        get().persistPatient(p.id, {
          agentAssigned: p.agentAssigned,
          agentRole: p.agentRole,
          status: p.status,
          onCall: p.onCall,
          callDuration: p.callDuration,
          nextAction: p.nextAction,
        });

        // Create an ongoing call record if patient went to oncall
        if (p.status === 'oncall') {
          // Find existing ongoing template from fallback data
          const existing = get().callDetails.find(c => c.patientId === p.id && c.callType === 'ongoing');
          const callId = 'cd-live-' + p.id + '-' + Date.now();
          get().createCallRecord({
            id: callId,
            patientId: p.id,
            callType: 'ongoing',
            agentName: agentName,
            startedAt: new Date().toLocaleString(),
            duration: '00:00',
            liveGoals: existing?.liveGoals || [
              { name: 'Patient Outreach', done: false, time: null },
              { name: 'Schedule ToC Appointment', done: false, time: null },
              { name: 'Medication Review', done: false, time: null },
            ],
            liveTranscript: existing?.liveTranscript || [],
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    get().startCallTimers();
    setTimeout(() => set({ toastSuccess: false }), 3500);
  },

  abortAllAgents: () => {
    const state = get();
    // Stop all call timers
    if (state.callTimerRef) {
      clearInterval(state.callTimerRef);
    }
    const updated = state.patients.map(p => {
      if (!p.agentAssigned) return p;
      const newP = { ...p, agentAssigned: '', agentRole: '', onCall: false, status: p.status === 'oncall' || p.status === 'queued' ? 'scheduled' : p.status };
      return newP;
    });
    set({ patients: updated, callTimerRef: null, queueTabDot: false, toast: 'All agent runs aborted' });
    // Persist changes
    for (const p of updated) {
      if (p.agentAssigned === '') {
        get().persistPatient(p.id, { agentAssigned: '', agentRole: '', onCall: false, status: p.status });
      }
    }
    setTimeout(() => set(s => s.toast === 'All agent runs aborted' ? { toast: null } : {}), 2800);
  },

  startCallTimers: () => {
    const existing = get().callTimerRef;
    if (existing) return;
    const ref = setInterval(() => {
      const state = get();
      const anyActive = state.patients.some(p => p.status === 'oncall' && p.onCall);
      if (!anyActive) {
        clearInterval(ref);
        set({ callTimerRef: null });
        return;
      }
      set(s => ({
        patients: s.patients.map(p => {
          if (p.status !== 'oncall' || !p.onCall) return p;
          const secs = parseDuration(p.callDuration || '00:00') + 1;
          return { ...p, callDuration: formatDuration(secs) };
        })
      }));
      // Note: call duration ticks are NOT persisted every second (too noisy).
      // They get persisted when the call ends.
    }, 1000);
    set({ callTimerRef: ref });
  },

  openCallPopover: (patientId, btnRef) => set({ callPopoverPatient: patientId, callPopoverBtnRef: btnRef }),
  closeCallPopover: () => set({ callPopoverPatient: null, callPopoverBtnRef: null }),

  startActiveCall: (patientId) => {
    const state = get();
    if (state.activeCallTimerRef) clearInterval(state.activeCallTimerRef);
    const updates = { status: 'oncall', onCall: true, callDuration: '00:00' };
    set(s => ({
      patients: s.patients.map(p => p.id === patientId ? { ...p, ...updates } : p),
      activeCallPatient: patientId,
      activeCallSeconds: 0,
      callPopoverPatient: null,
      callPopoverBtnRef: null
    }));
    get().persistPatient(patientId, updates);

    const ref = setInterval(() => {
      set(s => {
        const newSecs = s.activeCallSeconds + 1;
        const timeStr = formatDuration(newSecs);
        return {
          activeCallSeconds: newSecs,
          patients: s.patients.map(p => p.id === patientId ? { ...p, callDuration: timeStr } : p)
        };
      });
    }, 1000);
    set({ activeCallTimerRef: ref });
  },

  endActiveCall: () => {
    const { activeCallTimerRef, activeCallPatient, activeCallSeconds } = get();
    if (activeCallTimerRef) clearInterval(activeCallTimerRef);
    const updates = { status: 'scheduled', onCall: false, callDuration: formatDuration(activeCallSeconds) };
    set(s => ({
      patients: s.patients.map(p => p.id === activeCallPatient ? { ...p, ...updates } : p),
      activeCallPatient: null,
      activeCallSeconds: 0,
      activeCallTimerRef: null
    }));
    if (activeCallPatient) {
      get().persistPatient(activeCallPatient, updates);
    }
  },

  showToast: (msg) => {
    set({ toast: msg });
    setTimeout(() => set(s => s.toast === msg ? { toast: null } : {}), 2800);
  },

  closeToast: () => set({ toast: null }),
  closeToastSuccess: () => set({ toastSuccess: false }),

  openDetail: (patientId) => {
    const p = get().patients.find(x => x.id === patientId);
    if (p) {
      const patientCalls = get().callDetails.filter(c => c.patientId === patientId);
      set({ detailPatient: p, detailPatientCalls: patientCalls });
    }
  },
  closeDetail: () => set({ detailPatient: null, detailPatientCalls: [] }),

  openLiveDrawer: (patientId) => set({ liveDrawerPatient: patientId }),
  closeLiveDrawer: () => set({ liveDrawerPatient: null }),

  setShowInvokeModal: (v) => set({ showInvokeModal: v }),
  setShowCreateNew: (v) => set({ showCreateNew: v }),
  setShowFilterBar: (v) => set({ showFilterBar: v }),
  clearQueueTabDot: () => set({ queueTabDot: false }),

  nextDate,

  // ─── Analytics Data Layer ───
  analyticsCache: {},
  analyticsLoading: {},
  analyticsError: {},
  analyticsPeriod: '2026-03',
  analyticsTenant: 'default',
  analyticsPersona: 'exec',
  analyticsPractice: 'all',
  analyticsOrg: 'aco',
  analyticsPeriodMode: 'ytd',
  analyticsQuarter: 'Q4-2025',
  analyticsView: 'executive',

  setAnalyticsView: (v) => { set({ analyticsView: v }); updateHash(get); },
  setAnalyticsPeriod: (p) => { set({ analyticsPeriod: p, analyticsCache: {} }); },
  setAnalyticsTenant: (t) => { set({ analyticsTenant: t, analyticsCache: {} }); },
  setAnalyticsPersona: (p) => { set({ analyticsPersona: p, analyticsCache: {} }); },
  setAnalyticsPractice: (p) => { set({ analyticsPractice: p, analyticsCache: {} }); },
  setAnalyticsOrg: (o) => { set({ analyticsOrg: o, analyticsCache: {} }); },
  setAnalyticsPeriodMode: (m) => { set({ analyticsPeriodMode: m, analyticsCache: {} }); },
  setAnalyticsQuarter: (q) => { set({ analyticsQuarter: q, analyticsCache: {} }); },
  invalidateAnalyticsCache: () => set({ analyticsCache: {} }),

  fetchAnalytics: async (cacheKey, queryFn) => {
    const cache = get().analyticsCache[cacheKey];
    if (cache && Date.now() - cache.fetchedAt < 5 * 60 * 1000) return cache.data;
    set(s => ({
      analyticsLoading: { ...s.analyticsLoading, [cacheKey]: true },
      analyticsError: { ...s.analyticsError, [cacheKey]: null },
    }));
    try {
      const data = await queryFn();
      set(s => ({
        analyticsCache: { ...s.analyticsCache, [cacheKey]: { data, fetchedAt: Date.now() } },
        analyticsLoading: { ...s.analyticsLoading, [cacheKey]: false },
      }));
      return data;
    } catch (err) {
      set(s => ({
        analyticsLoading: { ...s.analyticsLoading, [cacheKey]: false },
        analyticsError: { ...s.analyticsError, [cacheKey]: err.message },
      }));
      return null;
    }
  },

  fetchViewKpis: async (viewId) => {
    const { analyticsTenant: t, analyticsPeriod: p } = get();
    const key = `kpis:${viewId}:${p}`;
    return get().fetchAnalytics(key, async () => {
      const { data, error } = await supabase
        .from('analytics_kpis').select('*')
        .eq('tenant_id', t).eq('view_key', viewId).eq('period', p)
        .maybeSingle();
      if (error || !data) return FALLBACK_KPIS[viewId] || { kpis: [], insight: null };
      return kpiRowToJs(data);
    });
  },

  fetchTimeSeries: async (seriesKeys) => {
    const { analyticsTenant: t, analyticsPeriod: p } = get();
    const key = `ts:${seriesKeys.join(',')}:${p}`;
    return get().fetchAnalytics(key, async () => {
      const { data, error } = await supabase
        .from('analytics_time_series').select('*')
        .eq('tenant_id', t).in('series_key', seriesKeys).eq('period', p);
      if (error || !data?.length) {
        const result = {};
        seriesKeys.forEach(k => { if (FALLBACK_TIME_SERIES[k]) result[k] = FALLBACK_TIME_SERIES[k]; });
        return result;
      }
      return groupTimeSeries(data);
    });
  },

  fetchViewTable: async (viewId, tableKey) => {
    const { analyticsTenant: t, analyticsPeriod: p } = get();
    const key = `tbl:${tableKey}:${p}`;
    return get().fetchAnalytics(key, async () => {
      const { data, error } = await supabase
        .from('analytics_tables').select('*')
        .eq('tenant_id', t).eq('table_key', tableKey).eq('period', p)
        .maybeSingle();
      if (error || !data) return FALLBACK_TABLES[tableKey] || { columns: [], rows: [] };
      return tableRowToJs(data);
    });
  },

  fetchProgressBars: async (viewId, barKey) => {
    const { analyticsTenant: t, analyticsPeriod: p } = get();
    const key = `bar:${barKey}:${p}`;
    return get().fetchAnalytics(key, async () => {
      const { data, error } = await supabase
        .from('analytics_progress_bars').select('*')
        .eq('tenant_id', t).eq('bar_key', barKey).eq('period', p)
        .maybeSingle();
      if (error || !data) return FALLBACK_PROGRESS_BARS[barKey] || [];
      return barRowToJs(data);
    });
  },

  fetchConfig: async (configKey) => {
    const { analyticsTenant: t } = get();
    const key = `cfg:${configKey}`;
    return get().fetchAnalytics(key, async () => {
      const { data, error } = await supabase
        .from('analytics_configs').select('*')
        .eq('tenant_id', t).eq('config_key', configKey)
        .maybeSingle();
      if (error || !data) return FALLBACK_CONFIGS[configKey] || {};
      return configRowToJs(data);
    });
  },
}));
