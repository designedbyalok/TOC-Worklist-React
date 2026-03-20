import { create } from 'zustand';
import { patients as initialPatients } from '../data/patients';

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

export const useAppStore = create((set, get) => ({
  // Navigation
  activeTab: 'worklist',
  subnavCollapsed: false,
  viewBy: 'window',

  // Table
  patients: initialPatients.map(p => ({ ...p })),
  selectedIds: [],
  currentPage: 1,
  perPage: 25,

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

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSubnav: () => set(s => ({ subnavCollapsed: !s.subnavCollapsed })),
  setViewBy: (v) => set({ viewBy: v }),

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

  updatePatient: (id, updates) => set(s => ({
    patients: s.patients.map(p => p.id === id ? { ...p, ...updates } : p)
  })),

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
    set(s => ({
      patients: s.patients.map(p => p.id === workflowPatient.id ? { ...p, ...updates } : p),
      workflowPatient: null,
      toast: 'Workflow saved successfully'
    }));
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
    // Start timers
    get().startCallTimers();
    setTimeout(() => set({ toastSuccess: false }), 3500);
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
    }, 1000);
    set({ callTimerRef: ref });
  },

  openCallPopover: (patientId, btnRef) => set({ callPopoverPatient: patientId, callPopoverBtnRef: btnRef }),
  closeCallPopover: () => set({ callPopoverPatient: null, callPopoverBtnRef: null }),

  startActiveCall: (patientId) => {
    const state = get();
    if (state.activeCallTimerRef) clearInterval(state.activeCallTimerRef);
    set(s => ({
      patients: s.patients.map(p => p.id === patientId ? { ...p, status: 'oncall', onCall: true, callDuration: '00:00' } : p),
      activeCallPatient: patientId,
      activeCallSeconds: 0,
      callPopoverPatient: null,
      callPopoverBtnRef: null
    }));
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
    const { activeCallTimerRef, activeCallPatient } = get();
    if (activeCallTimerRef) clearInterval(activeCallTimerRef);
    set(s => ({
      patients: s.patients.map(p => p.id === activeCallPatient ? { ...p, status: 'scheduled', onCall: false } : p),
      activeCallPatient: null,
      activeCallSeconds: 0,
      activeCallTimerRef: null
    }));
  },

  showToast: (msg) => {
    set({ toast: msg });
    setTimeout(() => set(s => s.toast === msg ? { toast: null } : {}), 2800);
  },

  setShowInvokeModal: (v) => set({ showInvokeModal: v }),
  setShowCreateNew: (v) => set({ showCreateNew: v }),
  setShowFilterBar: (v) => set({ showFilterBar: v }),
  clearQueueTabDot: () => set({ queueTabDot: false }),

  nextDate,
}));
