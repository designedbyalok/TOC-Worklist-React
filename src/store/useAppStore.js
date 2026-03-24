import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { dbToJs, updatesToDb } from '../lib/patientMapper';
import { callDetailDbToJs, callDetailJsToDb } from '../lib/callDetailsMapper';
import { patients as fallbackPatients } from '../data/patients';
import { callDetails as fallbackCallDetails } from '../data/callDetails';
import { generateFlowFromPrompt } from '../lib/flowGenerator';

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
      console.warn('Supabase fetch failed, using fallback data:', error.message);
      set({
        patients: fallbackPatients.map(p => ({
          ...p,
          agentAssigned: '',
          agentRole: '',
          onCall: false,
          status: (p.status === 'oncall' || p.status === 'queued') ? 'scheduled' : p.status,
          callDuration: (p.status === 'oncall') ? null : p.callDuration,
        })),
        patientsLoading: false,
        patientsError: error.message,
      });
    } else {
      const patients = data.map(dbToJs).map(p => ({
        ...p,
        // Reset transient agent/call state on fresh load —
        // queue should be empty until agents are explicitly invoked
        agentAssigned: '',
        agentRole: '',
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
      set({ callDetails: fallbackCallDetails.map(c => ({ ...c })) });
    } else {
      set({ callDetails: data.map(callDetailDbToJs) });
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
    set(s => ({ callDetails: [record, ...s.callDetails] }));
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
  setActivePage: (page) => { sessionStorage.setItem('activePage', page); set({ activePage: page }); },
  setActiveTab: (tab) => { sessionStorage.setItem('activeTab', tab); set({ activeTab: tab }); },
  setSettingsTab: (tab) => { sessionStorage.setItem('settingsTab', tab); set({ settingsTab: tab }); },
  setShowCreateAgent: (v) => set({ showCreateAgent: v }),
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
    set(s => ({
      agents: s.agents.map(a => a.id === id ? { ...a, ...updates } : a)
    }));
    await supabase.from('agents').update(updates).eq('id', id);
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
      updates = { status: 'completed', goals: workflowPatient.goals || { met: 3, total: 4 }, nextAction: 'All workflow steps completed' };
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
}));
