export const chatGroups = [
  { id: 1, name: 'Test Raj New', users: ['Alexa Daly'], roles: ['Guardian', 'Nurse Guardian'], location: 'Global Template', updated: '03/13/2026', updatedBy: 'Dr. Sumit Kawale', activeChats: 0, hasAgent: true, agentName: 'Care Assistant' },
  { id: 2, name: 'Global Test Group JJSHB', users: ['Alexa Daly'], roles: [], location: 'Global Template', updated: '01/05/2026', updatedBy: 'Dr. Sumit Kawale', activeChats: 2, hasAgent: false },
  { id: 3, name: 'Sumit Test Extended', users: ['Dr. Sumit Kawale'], roles: [], location: 'Global Template', updated: '01/05/2026', updatedBy: 'Dr. Sumit Kawale', activeChats: 13, hasAgent: true, agentName: 'FAQ Bot' },
  { id: 4, name: 'Sumitk15decv2 Kawale', users: ['Dr. Sumit Kawale'], roles: [], location: 'Global Template', updated: '01/05/2026', updatedBy: 'Dr. Sumit Kawale', activeChats: 1, hasAgent: false },
  { id: 5, name: 'Pop Group Automation Test', users: ['Dr. Sumit Kawale'], roles: [], location: 'Global Template', updated: '01/05/2026', updatedBy: 'Dr. Sumit Kawale', activeChats: 5, hasAgent: false },
  { id: 6, name: '30dec Athena PA', users: ['Alexa Daly'], roles: [], location: 'Global Template', updated: '12/30/2025', updatedBy: 'Pooja Athenademo', activeChats: 0, hasAgent: true, agentName: 'Care Assistant' },
];

// Currently selected participants for a group (editable)
export const groupParticipants = [
  { id: 'u1', name: 'Alexa Daly', role: 'Business/Practice Owner, Physician', type: 'user', isAgent: false },
  { id: 'u2', name: 'Care Assistant', role: 'AI Agent · FAQ Responder', type: 'agent', isAgent: true },
  { id: 'r1', name: 'Guardian', role: 'Care Team Role', type: 'role', isAgent: false },
  { id: 'r2', name: 'Nurse Guardian', role: 'Care Team Role', type: 'role', isAgent: false },
];

// All available users for search/add
export const availableUsers = [
  { id: 'u1', name: 'Alexa Daly', role: 'Business/Practice Owner, Physician', type: 'user', isAgent: false },
  { id: 'u2', name: 'Care Assistant', role: 'AI Agent · FAQ Responder', type: 'agent', isAgent: true },
  { id: 'u3', name: 'Dr. Robert Langdon', role: 'Physician', type: 'user', isAgent: false },
  { id: 'u4', name: 'Fernando Alonso', role: 'Care Manager', type: 'user', isAgent: false },
  { id: 'u5', name: 'Dr. Zachary Simonis', role: 'Business/Practice Owner', type: 'user', isAgent: false },
  { id: 'u6', name: 'Dr. Clara Kozey', role: 'Physician', type: 'user', isAgent: false },
  { id: 'u7', name: 'Ivy Ralph', role: 'Care Manager', type: 'user', isAgent: false },
];

// All available care team roles for search/add
export const availableRoles = [
  { id: 'r1', name: 'Guardian', type: 'role' },
  { id: 'r2', name: 'Nurse Guardian', type: 'role' },
  { id: 'r3', name: 'Primary Care Practitioner', type: 'role' },
  { id: 'r4', name: 'Nurse Practitioner', type: 'role' },
  { id: 'r5', name: 'Care Manager', type: 'role' },
  { id: 'r6', name: 'Medical Assistant', type: 'role' },
  { id: 'r7', name: 'Wellness Consultant', type: 'role' },
  { id: 'r8', name: 'Nutritionist', type: 'role' },
  { id: 'r9', name: 'Physical Therapist', type: 'role' },
];

export const defaultRules = [
  { id: 1, name: 'Emergency detection', type: 'safety', locked: true, enabled: true, condition: 'Message contains emergency keywords (chest pain, can\'t breathe, severe bleeding, overdose)', action: 'Immediate 911 guidance + alert care team', priority: 'Always first' },
  { id: 2, name: 'Crisis detection', type: 'safety', locked: true, enabled: true, condition: 'Message contains crisis keywords (suicide, self-harm, want to die)', action: '988 Lifeline guidance + alert care team', priority: 'Always second' },
  { id: 3, name: 'Staff is typing', type: 'system', locked: true, enabled: true, condition: 'Staff member is actively typing in thread', action: 'Agent holds — defers to human' },
  { id: 4, name: 'Staff already replied', type: 'system', locked: true, enabled: true, condition: 'Staff has replied in this session', action: 'Agent holds for rest of session' },
  { id: 5, name: 'Thread assigned to staff', type: 'system', locked: true, enabled: true, condition: 'Thread assigned to a specific staff member', action: 'Agent holds — staff owns thread' },
  { id: 6, name: 'After-hours acknowledgement', type: 'system', locked: true, enabled: true, condition: 'Message outside business hours + first message of session', action: 'Send after-hours acknowledgement message' },
  { id: 7, name: 'Start debounce timer', type: 'system', locked: true, enabled: true, condition: 'Patient message + unassigned + no staff reply + staff not typing', action: 'Start 90s debounce timer' },
  { id: 8, name: 'FAQ match', type: 'system', locked: true, enabled: true, condition: 'Debounce complete + KB match above confidence threshold', action: 'Reply with matched KB answer' },
  { id: 9, name: 'No FAQ match', type: 'system', locked: true, enabled: true, condition: 'Debounce complete + no KB match above threshold', action: 'Send fallback message + create staff task' },
  { id: 10, name: 'Default fallback', type: 'system', locked: true, enabled: true, condition: 'No other rule matched', action: 'Send fallback + flag thread for staff review' },
];

export const customRules = [
  { id: 11, name: 'Billing disputes to human', type: 'custom', locked: false, enabled: true, condition: 'Message contains "billing dispute" or "overcharged" or "wrong charge"', action: 'Route to billing team immediately' },
  { id: 12, name: 'VIP patients to human', type: 'custom', locked: false, enabled: false, condition: 'Patient flag = VIP', action: 'Route to staff immediately — skip chatbot' },
];

export const groupSettings = [
  { label: 'Debounce Window', value: '90 seconds', hint: 'Global default: 90s', isDefault: true },
  { label: 'FAQ Confidence Threshold', value: '0.75', hint: 'Global default: 0.75', isDefault: true },
  { label: 'After-Hours Ack Frequency', value: 'Once / session', hint: 'Global default: Once / session', isDefault: true },
  { label: 'Inactivity Timeout', value: '30 minutes', hint: 'Global default: 30 min', isDefault: true },
];
