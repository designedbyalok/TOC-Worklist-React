// Ancillary mock data shown in the non-Codes / non-Activity tabs of the DiagPanel.
// Phase 2 uses static stubs — same content for every drawer. Phase 3 will move these
// to per-member records in the store and wire CRUD.

export const COMMENTS = [
  { id: 'c1', author: 'Deborah Hintz', role: 'Coder', time: '2 hours ago', body: 'Chart review complete for DOS 03/04/2025. All diabetes-related codes supported by endocrinology consult.' },
  { id: 'c2', author: 'M. Almeda', role: 'Reviewer 1', time: 'Yesterday', body: 'Recommend reopening E11.65 — additional lab documentation has surfaced since last dismissal.' },
  { id: 'c3', author: 'A. Beauchamp', role: 'Support Team', time: '3 days ago', body: 'Requested records from primary care. Expected return by end of week.' },
];

export const DOCUMENTS = [
  { id: 'd1', name: 'Discharge_Summary_AB_030425.pdf', type: 'Discharge Summary', size: '124 KB', uploadedBy: 'A. Beauchamp', uploadedAt: '03/15/2025', status: 'passed' },
  { id: 'd2', name: 'Endocrinology_Consult.pdf', type: 'Consult Note', size: '88 KB', uploadedBy: 'Deborah Hintz', uploadedAt: '03/20/2025', status: 'passed' },
  { id: 'd3', name: 'Lab_Panel_HbA1c.pdf', type: 'Lab Report', size: '56 KB', uploadedBy: 'Deborah Hintz', uploadedAt: '03/22/2025', status: 'pending' },
  { id: 'd4', name: 'Cardiac_Echo_Report.pdf', type: 'Imaging', size: '412 KB', uploadedBy: 'M. Almeda', uploadedAt: '04/02/2025', status: 'passed' },
  { id: 'd5', name: 'Nephrology_Note.pdf', type: 'Consult Note', size: '72 KB', uploadedBy: 'A. Beauchamp', uploadedAt: '04/05/2025', status: 'failed' },
];

export const NOTES = [
  { id: 'n1', author: 'Deborah Hintz', initials: 'DH', time: '1 day ago', body: 'Follow up on nephropathy staging at next visit. Current coding reflects stage 2 progression.' },
  { id: 'n2', author: 'P. Plourde', initials: 'PP', time: '3 days ago', body: 'Patient expressed confusion about medication reconciliation. Flagged for care coordinator follow-up.' },
  { id: 'n3', author: 'E. Fortier', initials: 'EF', time: '1 week ago', body: 'All accepted codes cross-referenced against encounter documentation. No discrepancies identified.' },
  { id: 'n4', author: 'A. Beauchamp', initials: 'AB', time: '2 weeks ago', body: 'Member preferred Spanish language materials for follow-up care instructions.' },
  { id: 'n5', author: 'M. Almeda', initials: 'MA', time: '3 weeks ago', body: 'Dismissal reason documented per audit compliance — see attached dismissal log.' },
];

export const CLAIMS = [
  { id: 'cl1', number: 'CLM-7845921', dos: '03/04/2025', amount: '$1,284.50', status: 'Paid' },
  { id: 'cl2', number: 'CLM-7845944', dos: '06/11/2025', amount: '$892.00', status: 'Pending' },
];

export const OUTREACH = [
  { id: 'o1', type: 'Phone Call', channel: 'Voice', time: 'Today, 2:15 PM', by: 'Delores Conn', outcome: 'Spoke with patient — confirmed next appointment' },
  { id: 'o2', type: 'SMS', channel: 'Text', time: 'Yesterday, 10:30 AM', by: 'System', outcome: 'Appointment reminder delivered' },
  { id: 'o3', type: 'Email', channel: 'Email', time: '3 days ago', by: 'Care Team', outcome: 'Medication reconciliation summary sent' },
  { id: 'o4', type: 'Phone Call', channel: 'Voice', time: '1 week ago', by: 'A. Beauchamp', outcome: 'No answer — voicemail left' },
];

export const HISTORY = [
  { id: 'h1', at: '04/05/2025 14:22', by: 'M. Almeda (Reviewer 1)', action: 'Accepted', target: 'E11.22 Type 2 diabetes w/ nephropathy' },
  { id: 'h2', at: '04/02/2025 09:48', by: 'Deborah Hintz (Coder)', action: 'Submitted for review', target: 'DOS 03/04/2025' },
  { id: 'h3', at: '03/28/2025 16:05', by: 'Deborah Hintz (Coder)', action: 'Accepted', target: 'E11.65 Type 2 DM w/ hyperglycemia' },
  { id: 'h4', at: '03/25/2025 11:30', by: 'Deborah Hintz (Coder)', action: 'Dismissed', target: 'E41.0 Nutritional marasmus' },
  { id: 'h5', at: '03/22/2025 10:15', by: 'A. Beauchamp (Support Team)', action: 'Records received', target: 'Endocrinology consult note' },
  { id: 'h6', at: '03/15/2025 09:00', by: 'A. Beauchamp (Support Team)', action: 'Chart requested', target: 'Discharge summary from PCP' },
];
