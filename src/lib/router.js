/**
 * Hash-based router for the TOC Worklist prototype.
 * Bidirectional sync between URL hash and Zustand store.
 */

// ── Parse hash into structured route ──
export function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const segments = raw.split('/').filter(Boolean);
  return {
    page: segments[0] || 'population',
    section: segments[1] || null,
    tab: segments[2] || null,
    id: segments[3] || null,
    sub: segments[4] || null,
  };
}

// ── Build hash from parts ──
export function buildHash(...parts) {
  const clean = parts.filter(p => p != null && p !== '');
  return '#/' + clean.join('/');
}

// ── Derive hash from store state ──
export function stateToHash(state) {
  const { activePage, activeTab, settingsNavItem, settingsTab, messageTab,
    goalDetailId, goalWizardOpen, goalWizardEditId,
    chatGroupDetailId, agentRulesGroupId, businessHoursOpen } = state;

  if (activePage === 'builder') return buildHash('builder');
  if (activePage === 'analytics') {
    const view = state.analyticsView || 'executive';
    return view === 'executive' ? buildHash('analytics') : buildHash('analytics', view);
  }

  if (activePage === 'settings') {
    if (settingsNavItem === 'messages') {
      if (businessHoursOpen) return buildHash('settings', 'messages', 'business-hours');
      if (agentRulesGroupId) return buildHash('settings', 'messages', 'chat-settings', agentRulesGroupId, 'rules');
      if (chatGroupDetailId) return buildHash('settings', 'messages', 'chat-settings', chatGroupDetailId);
      return buildHash('settings', 'messages', messageTab || 'chat-settings');
    }
    if (settingsNavItem === 'embedded-components') {
      const ecTab = state.embeddedComponentsTab || 'domain-registry';
      return buildHash('settings', 'embedded-components', ecTab);
    }
    if (settingsNavItem === 'account') {
      const acTab = state.accountTab || 'users';
      return buildHash('settings', 'account', acTab);
    }
    // Agents section
    if (goalWizardOpen) return buildHash('settings', 'agents', 'goals', goalWizardEditId ? String(goalWizardEditId) : 'new');
    if (goalDetailId) return buildHash('settings', 'agents', 'goals', String(goalDetailId));
    if (settingsTab && settingsTab !== 'agents') return buildHash('settings', 'agents', settingsTab.replace(/ /g, '-'));
    return buildHash('settings', 'agents');
  }

  return buildHash('population', activeTab || 'worklist');
}

// ── Map parsed route → store state updates ──
export function hashToState(route) {
  // Always clear all drawer/overlay states on any navigation
  const updates = {
    goalDetailId: null, goalWizardOpen: false, goalWizardEditId: null,
    chatGroupDetailId: null, agentRulesGroupId: null, businessHoursOpen: false,
  };

  if (route.page === 'builder') { updates.activePage = 'builder'; return updates; }
  if (route.page === 'analytics') {
    updates.activePage = 'analytics';
    updates.analyticsView = route.section || 'executive';
    return updates;
  }

  if (route.page === 'settings') {
    updates.activePage = 'settings';
    if (route.section === 'messages') {
      updates.settingsNavItem = 'messages';
      if (route.tab === 'business-hours') {
        updates.businessHoursOpen = true; updates.chatGroupDetailId = null; updates.agentRulesGroupId = null;
      } else if (route.tab === 'chat-settings' && route.id) {
        if (route.sub === 'rules') {
          updates.agentRulesGroupId = isNaN(route.id) ? route.id : Number(route.id);
          updates.chatGroupDetailId = null; updates.businessHoursOpen = false;
        } else {
          updates.chatGroupDetailId = route.id === 'new' ? 'new' : (isNaN(route.id) ? route.id : Number(route.id));
          updates.agentRulesGroupId = null; updates.businessHoursOpen = false;
        }
      } else {
        updates.messageTab = route.tab || 'chat-settings';
        updates.chatGroupDetailId = null; updates.agentRulesGroupId = null; updates.businessHoursOpen = false;
      }
      return updates;
    }
    // Embedded Components section
    if (route.section === 'embedded-components') {
      updates.settingsNavItem = 'embedded-components';
      updates.embeddedComponentsTab = route.tab || 'domain-registry';
      return updates;
    }
    // Account / IAM section
    if (route.section === 'account') {
      updates.settingsNavItem = 'account';
      updates.accountTab = route.tab || 'users';
      return updates;
    }
    // Agents section
    updates.settingsNavItem = 'agents';
    if (route.section === 'agents' && route.tab === 'goals') {
      if (route.id === 'new') {
        updates.goalWizardOpen = true; updates.goalWizardEditId = null; updates.goalDetailId = null;
      } else if (route.id) {
        updates.goalDetailId = isNaN(Number(route.id)) ? route.id : Number(route.id);
        updates.goalWizardOpen = false;
      } else {
        updates.settingsTab = 'goals'; updates.goalDetailId = null; updates.goalWizardOpen = false;
      }
    } else if (route.section === 'agents' && route.tab) {
      updates.settingsTab = route.tab.replace(/-/g, ' ');
    } else {
      updates.settingsTab = 'agents';
    }
    return updates;
  }

  // Population
  updates.activePage = 'population';
  updates.activeTab = route.section === 'queue' ? 'queue' : 'worklist';
  return updates;
}

// ── Push current store state to hash (called from store setters) ──
let _syncing = false;

export function updateHash(getState) {
  if (_syncing) return;
  _syncing = true;
  try {
    const state = typeof getState === 'function' ? getState() : getState;
    const hash = stateToHash(state);
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
  } finally {
    _syncing = false;
  }
}

// ── Sync hash → store (on hashchange or initial load) ──
export function syncFromHash(setState, getState) {
  if (_syncing) return;
  _syncing = true;
  try {
    const route = parseHash();
    const updates = hashToState(route);
    if (Object.keys(updates).length > 0) {
      if (updates.activePage) sessionStorage.setItem('activePage', updates.activePage);
      if (updates.activeTab) sessionStorage.setItem('activeTab', updates.activeTab);
      if (updates.settingsTab) sessionStorage.setItem('settingsTab', updates.settingsTab);
      if (updates.settingsNavItem) sessionStorage.setItem('settingsNavItem', updates.settingsNavItem);
      setState(updates);
    }
  } finally {
    _syncing = false;
  }
}

// ── Initialize: hashchange listener + initial sync ──
export function initRouter(store) {
  // On initial load
  if (window.location.hash && window.location.hash !== '#/' && window.location.hash !== '#') {
    syncFromHash(store.setState.bind(store), store.getState.bind(store));
  } else {
    updateHash(store.getState.bind(store));
  }

  // Browser back/forward
  window.addEventListener('hashchange', () => {
    syncFromHash(store.setState.bind(store), store.getState.bind(store));
  });
}
