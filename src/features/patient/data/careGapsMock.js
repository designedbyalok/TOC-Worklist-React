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

export const CARE_GAP_SECTIONS_EXTENDED = [
  {
    title: 'Compliance Measures',
    items: [
      { id: 'cm1', title: 'EED - Eye Exam for Patients With Diabetes', status: 'Open', diagnosis: '', urgent: false },
      { id: 'cm2', title: 'ABA - Adult BMI Assessment', status: 'Open', diagnosis: '', urgent: false },
      { id: 'cm3', title: 'AWV - Annual Wellness Visit', status: 'Open', diagnosis: '', urgent: false },
    ],
  },
  {
    title: 'Labs',
    items: [
      { id: 'lb1', title: 'GSD - Glycemic Screening and Control in Patients with Diabetes', status: 'Open', diagnosis: '', urgent: false },
      { id: 'lb2', title: 'SPC - Statin Therapy for Patients with Cardiovascular Disease', status: 'Open', diagnosis: '', urgent: false },
      { id: 'lb3', title: 'COL - Colorectal Cancer Screening', status: 'Open', diagnosis: '', urgent: false },
    ],
  },
  {
    title: 'Referrals',
    items: [
      { id: 'rf1', title: 'BCS - Breast Cancer Screening', status: 'Open', diagnosis: '', urgent: false },
      { id: 'rf2', title: 'Cardiology Consult', status: 'Open', diagnosis: '', urgent: false },
    ],
  },
  {
    title: 'Diagnosis Gaps',
    items: [],
  },
];

export const CARE_GAP_TABS = ['Gaps(11)', 'PAMI/Hx', 'Vitals/Labs', 'Comms', 'Outreach', 'Summary'];
