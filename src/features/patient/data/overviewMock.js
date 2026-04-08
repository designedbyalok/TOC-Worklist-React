export const PATIENT_SYNOPSIS = `Annette Brave is a 56-year-old female with a history of Type 2 Diabetes and Hypertension. Her diabetes is currently poorly controlled with an HbA1c of 8.2% (target <7.0%). Her blood pressure is also above target at 142/88 mmHg.

She is currently enrolled in the HIU and TCM programs. On today's evaluation she appeared well, weighing 180 lb (BMI 29 kg/m\u00B2), with clear lung and heart sounds and no peripheral edema or orthostatic changes. A repeat lipid panel and basic metabolic panel have been ordered to better stratify cardiovascular and renal status before considering uptitration of her ACE inhibitor.

Her next steps include a telephonic check-in with the HIU nurse in two weeks to review home glucose logs and blood pressure readings, followed by an in-person reassessment with Dr. James Wilson on May 12, 2025 for repeat HbA1c, blood pressure measurement, and dietary log review. She is also enrolled in a monthly group diabetes education class beginning June 1, 2025, to reinforce self-management skills and ongoing support.`;

export const RECENT_NOTES = [
  { id: 'n1', title: 'SOAP Note', subtitle: 'No diagnosis reported', status: 'In Progress', statusColor: 'var(--status-warning)', createdBy: 'Dr. Emily Carter', createdDate: '02/19/2024', updatedBy: 'Dr Aldo Richman', updatedDate: '02/19/2024', template: 'SOAP Note' },
  { id: 'n2', title: 'Discharge Summary', subtitle: 'No diagnosis reported', status: 'In Progress', statusColor: 'var(--status-warning)', createdBy: 'Dr. Sarah Thompson', createdDate: '02/19/2024', updatedBy: 'Dr Aldo Richman', updatedDate: '02/19/2024', template: 'Discharge Summary' },
  { id: 'n3', title: 'Progress Note', subtitle: 'No diagnosis reported', status: 'In Progress', statusColor: 'var(--status-warning)', createdBy: 'Dr. Michael Lee', createdDate: '02/19/2024', updatedBy: 'Dr Aldo Richman', updatedDate: '02/19/2024', template: 'Progress Note' },
];

export const ACTIVE_CARE_PROGRAMS = [
  { id: 'cp1', name: 'Annual Wellness Visit (AWV)', status: 'Schedule with PCP', statusLink: true, startDate: '09/01/2024', endDate: '02/19/2024', lastUpdated: '02/19/2024', assignee: 'Aldo Richman', pcp: 'Dr. Rob' },
];

export const UPCOMING_APPOINTMENTS = [
  { id: 'ua1', type: 'Follow-up Appointment', date: '05/12/2025', time: '10:00 AM', provider: 'Dr. James Wilson', location: 'Fold Health, NY', status: 'Confirmed' },
  { id: 'ua2', type: 'Diabetes Education Class', date: '06/01/2025', time: '2:00 PM', provider: 'Group Session', location: 'Fold Health, NY', status: 'Scheduled' },
];

export const CONDITION_TAGS = [
  { label: 'Diabetes', removable: true },
  { label: 'Hypertension', removable: true },
  { label: 'Needs Transportation', removable: true },
];

export const HEADER_METRICS = {
  consent: '2/4',
  acuity: 'High-Risk',
  raf: '4.234',
  rafChange: '+0.5',
  nextAppt: '07/23/2025',
  lastContact: 'UTR(45d)',
  programs: ['AWV', 'HIU'],
  programsMore: 2,
};
