export const CARE_GAP_SECTIONS = [
  {
    title: 'Preventive Care',
    items: [
      { id: 'cg1', title: 'Annual Wellness Visit', status: 'Open', diagnosis: 'Diabetes, Hypertension', urgent: true },
      { id: 'cg2', title: 'Mammography Screening', status: 'Open', diagnosis: 'Breast Cancer Risk', urgent: false },
      { id: 'cg3', title: 'Colorectal Cancer Screening', status: 'Closed', diagnosis: '', urgent: false },
    ],
  },
  {
    title: 'Chronic Care Management',
    items: [
      { id: 'cg4', title: 'Diabetes HbA1c Testing', status: 'Open', diagnosis: 'Type 2 Diabetes', urgent: true },
      { id: 'cg5', title: 'Blood Pressure Control', status: 'Open', diagnosis: 'Hypertension', urgent: false },
    ],
  },
];

export const CARE_GAP_TABS = ['Gaps (5)', 'PAMI/Hx', 'Vitals/Labs'];
