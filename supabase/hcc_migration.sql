-- HCC Supabase Migration
-- Generated from mock data (32 members + diagnosis gaps)

-- ══════════════════════════════════════════════════════════════════════════════
-- Table: hcc_members (worklist rows — 32 patients)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS hcc_members (
  id              text PRIMARY KEY,
  member_id       text NOT NULL,
  name            text NOT NULL,
  initials        text,
  gender          text,
  age             text,
  current_visit   int,
  total_visits    int,
  dos_list        jsonb DEFAULT '[]',
  chart_count     int,
  doc_status      jsonb DEFAULT '[]',
  open_icds       int DEFAULT 0,
  create_date     text,
  due_label       text,
  due_color       text,
  support_name    text,
  support_status  text,
  coder_name      text,
  coder_status    text,
  reviewer1_name  text,
  reviewer1_status text,
  reviewer2_name  text,
  reviewer2_status text,
  reviewer3_name  text,
  reviewer3_status text,
  rendering_provider text,
  visit_type      text,
  raf_score       text,
  raf_impact      text,
  risk_utilization boolean DEFAULT false,
  ipa             text,
  health_plan     text,
  pcp             text,
  decile          text,
  cohort          text,
  risk_level      text,
  advillness      text,
  frailty         text,
  language        text DEFAULT 'en',
  created_at      timestamptz DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- Table: hcc_diagnosis_gaps (ICD codes mapped to members)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS hcc_diagnosis_gaps (
  id              text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_name     text NOT NULL,
  code            text NOT NULL,
  description     text,
  hcc_category    text,
  status          text DEFAULT 'New',
  type            text,
  docs_count      int DEFAULT 0,
  comments_count  int DEFAULT 0,
  notes_count     int DEFAULT 0,
  raf_weight      float DEFAULT 0,
  last_activity   text,
  last_activity_by text,
  dismiss_reason  text,
  is_linked       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hcc_gaps_member ON hcc_diagnosis_gaps(member_name);

-- ══════════════════════════════════════════════════════════════════════════════
-- Seed: hcc_members (32 rows)
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-1', 'M-1000-2500', 'Annette Brave', 'AB', 'M', '67y 3m',
  1, 4, '[{"date":"03/04/2025","label":"Overdue by 1 week","labelColor":"var(--status-error)"},{"date":"06/11/2025","label":"Due in 3 Days","labelColor":"var(--status-warning)"},{"date":"11/10/2024","label":"Due in 5 Days","labelColor":"var(--status-warning)"},{"date":"03/10/2024","label":"Due in 2 weeks","labelColor":"var(--neutral-200)"}]'::jsonb,
  5, '["pending","pending","pending","pending","pending"]'::jsonb, 8,
  '08/01/2025', 'Overdue: 1w', 'var(--status-error)',
  'A. Beauchamp', 'In Progress', NULL, 'Assign',
  NULL, 'Assign', NULL, 'Assign', NULL, 'Assign',
  'Dr. Mallory Hayes', 'Walk-in', '3.579', '0.213', true,
  'ACP', 'Scan', 'Dr. Roland G.', '9', 'PCP', 'Low',
  '2', '2', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-2', 'M-1017-2531', 'Frank Green', 'FG', 'M', '68y 8m',
  1, 2, '[{"date":"09/28/2023","label":"Overdue by 5 Days","labelColor":"var(--status-error)"},{"date":"04/15/2024","label":"Due in 2 weeks","labelColor":"var(--neutral-200)"}]'::jsonb,
  3, '["passed","passed","pending"]'::jsonb, 8,
  '08/15/2025', 'Overdue: 5D', 'var(--status-error)',
  'M. Thompson', 'Completed', 'Deborah Hintz', 'Records Requested',
  NULL, 'Assign', NULL, 'Assign', NULL, 'Assign',
  'Dr. Indigo I', 'Telehealth', '2.841', '0.142', true,
  'IPA-1', 'Lab', 'Dr. Sandra K.', '7', 'HCC', 'Medium',
  '3', '1', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-3', 'M-1034-2562', 'Brian Carter', 'BC', 'M', '72y 5m',
  1, 2, '[{"date":"11/29/2023","label":"Overdue by 2 Days","labelColor":"var(--status-error)"},{"date":"05/20/2024","label":"Due in 5 Days","labelColor":"var(--status-warning)"}]'::jsonb,
  4, '["passed","passed","passed","passed"]'::jsonb, 12,
  '08/27/2025', 'Overdue: 2D', 'var(--status-error)',
  'L. Torrance', 'Completed', 'Deborah Hintz', 'Completed',
  'M. Almeda', 'Completed', 'N Richards', 'Completed', NULL, 'Assign',
  'Dr. Ulysses Horne', 'Walk-in', '4.102', '0.318', false,
  'ACP', 'Scan', 'Dr. Ulysses H.', '10', 'PCP', 'High',
  '5', '4', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-4', 'M-1051-2593', 'David Evans', 'DE', 'M', '75y 1m',
  2, 2, '[{"date":"03/08/2026","label":"Due Today","labelColor":"var(--status-warning)"},{"date":"09/10/2025","label":"Due in 5 Days","labelColor":"var(--status-warning)"}]'::jsonb,
  5, '["passed","passed","pending","pending","failed"]'::jsonb, 15,
  '09/02/2026', 'Due Today', 'var(--status-warning)',
  'E. Johnson', 'In Progress', 'Deborah Hintz', 'Records Requested',
  'E. Fortier', 'Completed', NULL, 'Assign', NULL, 'Assign',
  'Dr. Tatum', 'Walk-in', '5.210', '0.441', true,
  'IPA-2', 'Lab', 'Dr. Tatum', '10', 'HCC', 'High',
  '6', '5', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-6', 'M-1085-2655', 'Grace Hill', 'GH', 'F', '70y 10m',
  1, 3, '[{"date":"01/15/2024","label":"Due Today","labelColor":"var(--status-warning)"},{"date":"06/22/2024","label":"Due in 5 Days","labelColor":"var(--status-warning)"},{"date":"11/30/2024","label":"Due in 2 weeks","labelColor":"var(--neutral-200)"}]'::jsonb,
  5, '["passed","passed","pending","failed","pending"]'::jsonb, 11,
  '09/19/2025', 'Due Today', 'var(--status-warning)',
  'O. Twist', 'Completed', 'Deborah Hintz', 'Records Requested',
  'B. Olafson', 'New', NULL, 'Assign', NULL, 'Assign',
  'Dr. Eamon', 'Walk-in', '2.990', '0.187', false,
  'IPA-3', 'X-Ray', 'Dr. Eamon', '8', 'HCC', 'Medium',
  '3', '3', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-7', 'M-1102-2686', 'Cynthia Davis', 'CD', 'F', '65y 2m',
  NULL, NULL, '[{"date":"05/22/2024","label":"Due in 3 Days","labelColor":"var(--status-info)"}]'::jsonb,
  NULL, '[]'::jsonb, 10,
  '10/05/2025', 'Due in 3D', 'var(--status-info)',
  'A. Beauchamp', 'Awaiting', NULL, 'Assign',
  NULL, 'Assign', NULL, 'Assign', NULL, 'Assign',
  'Dr. Reed MacLeod', 'Telehealth', '1.820', '0.091', true,
  'ACP', 'Lab', 'Dr. Reed M.', '5', 'PCP', 'Low',
  '1', '1', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-8', 'M-1119-2717', 'Emily Foster', 'EF', 'F', '60y 0m',
  NULL, NULL, '[{"date":"12/01/2023","label":"Due in 4 Days","labelColor":"var(--status-info)"}]'::jsonb,
  NULL, '[]'::jsonb, 5,
  '10/08/2025', 'Due in 4D', 'var(--status-info)',
  'K. Stroman', 'Completed', 'Deborah Hintz', 'Returned',
  NULL, 'Assign', NULL, 'Assign', NULL, 'Assign',
  'Dr. Tatum', 'Walk-in', '2.115', '0.123', false,
  'IPA-1', 'Scan', 'Dr. Tatum', '6', 'HCC', 'Low',
  '2', '1', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-10', 'M-1153-2779', 'William Jammy', 'WJ', 'M', '60y 10m',
  2, 2, '[{"date":"07/04/2024","label":"Due in 5 Days","labelColor":"var(--status-info)"},{"date":"01/20/2024","label":"Due in 2 weeks","labelColor":"var(--neutral-200)"}]'::jsonb,
  3, '["passed","passed","passed"]'::jsonb, 11,
  '11/22/2025', 'Due in 5D', 'var(--status-info)',
  'Oliver Twist', 'Completed', 'D Hintz', 'Completed',
  'N Richards', 'Completed', 'N Richards', 'Completed', NULL, 'Assign',
  'Dr. Sarah Connor', 'Walk-in', '3.220', '0.265', true,
  'ACP', 'Lab', 'Dr. Sarah C.', '9', 'HCC', 'Medium',
  '4', '2', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-12', 'M-1187-2841', 'Robert Kim', 'RK', 'M', '71y 4m',
  1, 3, '[{"date":"02/14/2025","label":"Overdue by 3 Days","labelColor":"var(--status-error)"},{"date":"07/20/2025","label":"Due in 5 Days","labelColor":"var(--status-warning)"},{"date":"12/10/2024","label":"Due in 2 weeks","labelColor":"var(--neutral-200)"}]'::jsonb,
  4, '["pending","pending","pending","pending"]'::jsonb, 9,
  '08/05/2025', 'Overdue: 3D', 'var(--status-error)',
  'A. Beauchamp', 'Awaiting', NULL, 'Assign',
  NULL, 'Assign', NULL, 'Assign', NULL, 'Assign',
  'Dr. Susan Park', 'Walk-in', '3.110', '0.198', true,
  'IPA-1', 'Scan', 'Dr. Susan P.', '8', 'HCC', 'High',
  '4', '3', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-13', 'M-1204-2872', 'Maria Santos', 'MS', 'F', '63y 7m',
  1, 2, '[{"date":"04/10/2025","label":"Overdue by 1 week","labelColor":"var(--status-error)"},{"date":"10/15/2025","label":"Due in 14D","labelColor":"var(--neutral-200)"}]'::jsonb,
  NULL, '[]'::jsonb, 7,
  '08/10/2025', 'Overdue: 1w', 'var(--status-error)',
  'K. Stroman', 'Awaiting', NULL, 'Assign',
  NULL, 'Assign', NULL, 'Assign', NULL, 'Assign',
  'Dr. Alan Morse', 'Telehealth', '2.340', '0.118', false,
  'ACP', 'Lab', 'Dr. Alan M.', '6', 'PCP', 'Medium',
  '2', '2', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-14', 'M-1221-2903', 'James Walker', 'JW', 'M', '78y 2m',
  1, 4, '[{"date":"01/22/2025","label":"Overdue by 2 weeks","labelColor":"var(--status-error)"},{"date":"05/08/2025","label":"Due in 3 Days","labelColor":"var(--status-warning)"},{"date":"09/14/2025","label":"Due in 5 Days","labelColor":"var(--status-warning)"},{"date":"01/05/2026","label":"Due in 21D","labelColor":"var(--neutral-200)"}]'::jsonb,
  6, '["passed","passed","passed","passed","passed","passed"]'::jsonb, 18,
  '07/20/2025', 'Overdue: 2w', 'var(--status-error)',
  'M. Thompson', 'Completed', 'Deborah Hintz', 'Completed',
  'M. Almeda', 'In Progress', NULL, 'Assign', NULL, 'Assign',
  'Dr. Calvin Reed', 'Walk-in', '5.880', '0.512', true,
  'IPA-2', 'Scan', 'Dr. Calvin R.', '10', 'HCC', 'High',
  '7', '5', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-15', 'M-1238-2934', 'Helen Park', 'HP', 'F', '69y 11m',
  1, 2, '[{"date":"03/18/2025","label":"Due Today","labelColor":"var(--status-warning)"},{"date":"08/22/2025","label":"Due in 14D","labelColor":"var(--neutral-200)"}]'::jsonb,
  3, '["failed","failed","failed"]'::jsonb, 6,
  '09/01/2025', 'Due Today', 'var(--status-warning)',
  'L. Torrance', 'Insufficient', NULL, 'Assign',
  NULL, 'Assign', NULL, 'Assign', NULL, 'Assign',
  'Dr. Nancy Wu', 'Walk-in', '2.670', '0.145', false,
  'IPA-3', 'X-Ray', 'Dr. Nancy W.', '7', 'PCP', 'Medium',
  '3', '2', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-16', 'M-1255-2965', 'Thomas Reed', 'TR', 'M', '74y 6m',
  1, 3, '[{"date":"02/28/2026","label":"Due Today","labelColor":"var(--status-warning)"},{"date":"08/05/2025","label":"Due in 5 Days","labelColor":"var(--status-warning)"},{"date":"02/01/2025","label":"Due in 2 weeks","labelColor":"var(--neutral-200)"}]'::jsonb,
  5, '["passed","passed","passed","passed","passed"]'::jsonb, 14,
  '09/10/2025', 'Due Today', 'var(--status-warning)',
  'O. Twist', 'Completed', 'P. Plourde', 'Completed',
  'B. Olafson', 'Completed', 'K. Patel', 'Completed', NULL, 'Assign',
  'Dr. Jesse Flynn', 'Walk-in', '4.450', '0.367', true,
  'ACP', 'Lab', 'Dr. Jesse F.', '9', 'HCC', 'High',
  '6', '4', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-17', 'M-1272-2996', 'Linda Chen', 'LC', 'F', '66y 1m',
  1, 2, '[{"date":"05/01/2025","label":"Due in 3 Days","labelColor":"var(--status-info)"},{"date":"11/10/2025","label":"Due in 21D","labelColor":"var(--neutral-200)"}]'::jsonb,
  2, '["pending","pending"]'::jsonb, 5,
  '10/12/2025', 'Due in 3D', 'var(--status-info)',
  'E. Johnson', 'Completed', 'Deborah Hintz', 'Records Received',
  NULL, 'Assign', NULL, 'Assign', NULL, 'Assign',
  'Dr. Mallory Hayes', 'Telehealth', '1.980', '0.099', true,
  'IPA-1', 'Scan', 'Dr. Roland G.', '5', 'PCP', 'Low',
  '1', '1', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-18', 'M-1289-3027', 'Michael Ortiz', 'MO', 'M', '80y 3m',
  1, 3, '[{"date":"04/25/2025","label":"Due in 4 Days","labelColor":"var(--status-info)"},{"date":"10/30/2025","label":"Due in 14D","labelColor":"var(--neutral-200)"},{"date":"03/15/2025","label":"Due in 21D","labelColor":"var(--neutral-200)"}]'::jsonb,
  7, '["passed","passed","passed","failed","failed","pending","pending"]'::jsonb, 22,
  '09/15/2025', 'Due in 4D', 'var(--status-info)',
  'K. Stroman', 'Records Requested', 'Deborah Hintz', 'In Progress',
  'E. Fortier', 'New', NULL, 'Assign', NULL, 'Assign',
  'Dr. Ulysses Horne', 'Walk-in', '6.100', '0.580', true,
  'IPA-2', 'Scan', 'Dr. Ulysses H.', '10', 'HCC', 'High',
  '8', '5', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-19', 'M-1306-3058', 'Patricia Moore', 'PM', 'F', '62y 8m',
  1, 2, '[{"date":"06/15/2025","label":"Due in 5 Days","labelColor":"var(--status-info)"},{"date":"12/20/2025","label":"Due in 14D","labelColor":"var(--neutral-200)"}]'::jsonb,
  NULL, '[]'::jsonb, 4,
  '11/01/2025', 'Due in 5D', 'var(--status-info)',
  NULL, 'Assign', NULL, 'Assign',
  NULL, 'Assign', NULL, 'Assign', NULL, 'Assign',
  'Dr. Reed MacLeod', 'Telehealth', '1.560', '0.078', false,
  'ACP', 'Lab', 'Dr. Reed M.', '4', 'PCP', 'Low',
  '1', '1', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-20', 'M-1323-3089', 'Charles Rivera', 'CR', 'M', '73y 9m',
  1, 3, '[{"date":"07/01/2025","label":"Due in 5 Days","labelColor":"var(--status-info)"},{"date":"01/14/2026","label":"Due in 14D","labelColor":"var(--neutral-200)"},{"date":"04/05/2025","label":"Due in 21D","labelColor":"var(--neutral-200)"}]'::jsonb,
  4, '["passed","passed","pending","pending"]'::jsonb, 11,
  '10/25/2025', 'Due in 5D', 'var(--status-info)',
  'A. Beauchamp', 'Completed', 'P. Plourde', 'Records Requested',
  NULL, 'Assign', NULL, 'Assign', NULL, 'Assign',
  'Dr. Calvin Reed', 'Walk-in', '3.720', '0.245', true,
  'IPA-3', 'X-Ray', 'Dr. Calvin R.', '8', 'HCC', 'Medium',
  '4', '3', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-21', 'M-1340-3120', 'Dorothy Nguyen', 'DN', 'F', '77y 0m',
  1, 2, '[{"date":"08/12/2025","label":"Due in 14D","labelColor":"var(--neutral-200)"},{"date":"02/20/2026","label":"Due in 21D","labelColor":"var(--neutral-200)"}]'::jsonb,
  3, '["passed","passed","passed"]'::jsonb, 9,
  '11/05/2025', 'Due in 14D', 'var(--neutral-200)',
  'M. Thompson', 'Completed', 'Deborah Hintz', 'Completed',
  'N Richards', 'Completed', NULL, 'Assign', NULL, 'Assign',
  'Dr. Eamon', 'Walk-in', '3.880', '0.302', true,
  'ACP', 'Scan', 'Dr. Eamon', '9', 'PCP', 'High',
  '5', '4', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-22', 'M-1357-3151', 'Richard Scott', 'RS', 'M', '64y 5m',
  1, 2, '[{"date":"09/05/2025","label":"Due in 14D","labelColor":"var(--neutral-200)"},{"date":"03/10/2026","label":"Due in 21D","labelColor":"var(--neutral-200)"}]'::jsonb,
  NULL, '[]'::jsonb, 3,
  '11/15/2025', 'Due in 14D', 'var(--neutral-200)',
  NULL, 'Assign', NULL, 'Assign',
  NULL, 'Assign', NULL, 'Assign', NULL, 'Assign',
  'Dr. Susan Park', 'Telehealth', '1.230', '0.062', false,
  'IPA-1', 'Lab', 'Dr. Susan P.', '3', 'PCP', 'Low',
  '1', '1', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-23', 'M-1374-3182', 'Sandra Lee', 'SL', 'F', '68y 3m',
  1, 3, '[{"date":"10/18/2025","label":"Due in 21D","labelColor":"var(--neutral-200)"},{"date":"04/22/2026","label":"Due in 21D","labelColor":"var(--neutral-200)"},{"date":"07/30/2025","label":"Due in 5 Days","labelColor":"var(--status-warning)"}]'::jsonb,
  5, '["passed","passed","passed","pending","pending"]'::jsonb, 13,
  '09/28/2025', 'Due in 21D', 'var(--neutral-200)',
  'L. Torrance', 'Completed', 'Deborah Hintz', 'In Progress',
  'M. Almeda', 'New', NULL, 'Assign', NULL, 'Assign',
  'Dr. Jesse Flynn', 'Walk-in', '4.010', '0.312', true,
  'IPA-2', 'Scan', 'Dr. Jesse F.', '9', 'HCC', 'High',
  '5', '4', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-24', 'M-1391-3213', 'Kevin Brown', 'KB', 'M', '58y 11m',
  1, 2, '[{"date":"11/20/2025","label":"Due in 21D","labelColor":"var(--neutral-200)"},{"date":"05/15/2026","label":"Due in 21D","labelColor":"var(--neutral-200)"}]'::jsonb,
  2, '["pending","pending"]'::jsonb, 6,
  '10/10/2025', 'Due in 21D', 'var(--neutral-200)',
  'E. Johnson', 'In Progress', NULL, 'Assign',
  NULL, 'Assign', NULL, 'Assign', NULL, 'Assign',
  'Dr. Nancy Wu', 'Telehealth', '2.050', '0.103', false,
  'ACP', 'Lab', 'Dr. Nancy W.', '5', 'PCP', 'Low',
  '2', '2', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-25', 'M-1408-3244', 'Lisa White', 'LW', 'F', '72y 7m',
  1, 3, '[{"date":"12/08/2025","label":"Overdue by 4 Days","labelColor":"var(--status-error)"},{"date":"06/01/2026","label":"Due in 5 Days","labelColor":"var(--status-warning)"},{"date":"09/25/2025","label":"Due in 21D","labelColor":"var(--neutral-200)"}]'::jsonb,
  4, '["failed","failed","failed","failed"]'::jsonb, 10,
  '08/18/2025', 'Overdue: 4D', 'var(--status-error)',
  'O. Twist', 'Assign', NULL, 'Assign',
  NULL, 'Assign', NULL, 'Assign', NULL, 'Assign',
  'Dr. Alan Morse', 'Walk-in', '3.450', '0.228', false,
  'IPA-3', 'X-Ray', 'Dr. Alan M.', '8', 'HCC', 'High',
  '4', '3', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-26', 'M-1425-3275', 'Daniel Martinez', 'DM', 'M', '76y 2m',
  1, 2, '[{"date":"01/30/2026","label":"Overdue by 1 week","labelColor":"var(--status-error)"},{"date":"07/15/2026","label":"Due in 14D","labelColor":"var(--neutral-200)"}]'::jsonb,
  5, '["passed","passed","passed","failed","pending"]'::jsonb, 16,
  '07/28/2025', 'Overdue: 1w', 'var(--status-error)',
  'K. Stroman', 'In Progress', 'P. Plourde', 'In Progress',
  'B. Olafson', 'New', NULL, 'Assign', NULL, 'Assign',
  'Dr. Calvin Reed', 'Walk-in', '4.780', '0.401', true,
  'IPA-1', 'Scan', 'Dr. Calvin R.', '9', 'HCC', 'High',
  '6', '5', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-27', 'M-1442-3306', 'Michelle Jackson', 'MJ', 'F', '61y 5m',
  1, 2, '[{"date":"02/25/2026","label":"Due Today","labelColor":"var(--status-warning)"},{"date":"08/30/2026","label":"Due in 21D","labelColor":"var(--neutral-200)"}]'::jsonb,
  NULL, '[]'::jsonb, 4,
  '10/20/2025', 'Due Today', 'var(--status-warning)',
  NULL, 'Assign', NULL, 'Assign',
  NULL, 'Assign', NULL, 'Assign', NULL, 'Assign',
  'Dr. Mallory Hayes', 'Telehealth', '1.640', '0.082', false,
  'ACP', 'Lab', 'Dr. Roland G.', '4', 'PCP', 'Low',
  '1', '1', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-28', 'M-1459-3337', 'Christopher Thompson', 'CT', 'M', '79y 8m',
  1, 3, '[{"date":"03/20/2026","label":"Due in 3 Days","labelColor":"var(--status-info)"},{"date":"09/25/2026","label":"Due in 14D","labelColor":"var(--neutral-200)"},{"date":"12/12/2025","label":"Due in 5 Days","labelColor":"var(--status-warning)"}]'::jsonb,
  6, '["passed","passed","passed","passed","passed","passed"]'::jsonb, 20,
  '07/15/2025', 'Due in 3D', 'var(--status-info)',
  'M. Thompson', 'Completed', 'Deborah Hintz', 'Completed',
  'E. Fortier', 'Completed', 'N Richards', 'In Progress', NULL, 'Assign',
  'Dr. Jesse Flynn', 'Walk-in', '5.620', '0.490', true,
  'IPA-2', 'Scan', 'Dr. Jesse F.', '10', 'HCC', 'High',
  '7', '5', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-29', 'M-1476-3368', 'Amanda Wilson', 'AW', 'F', '67y 0m',
  1, 2, '[{"date":"04/12/2026","label":"Due in 4 Days","labelColor":"var(--status-info)"},{"date":"10/18/2026","label":"Due in 21D","labelColor":"var(--neutral-200)"}]'::jsonb,
  3, '["pending","pending","pending"]'::jsonb, 8,
  '09/05/2025', 'Due in 4D', 'var(--status-info)',
  'A. Beauchamp', 'In Progress', NULL, 'Assign',
  NULL, 'Assign', NULL, 'Assign', NULL, 'Assign',
  'Dr. Susan Park', 'Telehealth', '2.780', '0.162', true,
  'ACP', 'Lab', 'Dr. Susan P.', '7', 'PCP', 'Medium',
  '3', '2', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-30', 'M-1493-3399', 'Matthew Harris', 'MH', 'M', '70y 1m',
  1, 3, '[{"date":"05/05/2026","label":"Due in 5 Days","labelColor":"var(--status-info)"},{"date":"11/10/2026","label":"Due in 14D","labelColor":"var(--neutral-200)"},{"date":"02/20/2026","label":"Due in 2 weeks","labelColor":"var(--neutral-200)"}]'::jsonb,
  4, '["passed","passed","pending","failed"]'::jsonb, 12,
  '08/22/2025', 'Due in 5D', 'var(--status-info)',
  'L. Torrance', 'Completed', 'P. Plourde', 'Records Requested',
  'M. Almeda', 'In Progress', NULL, 'Assign', NULL, 'Assign',
  'Dr. Eamon', 'Walk-in', '3.890', '0.287', true,
  'IPA-3', 'X-Ray', 'Dr. Eamon', '8', 'HCC', 'Medium',
  '4', '3', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-31', 'M-1510-3430', 'Jessica Clark', 'JC', 'F', '59y 4m',
  1, 2, '[{"date":"06/18/2026","label":"Due in 14D","labelColor":"var(--neutral-200)"},{"date":"12/22/2026","label":"Due in 21D","labelColor":"var(--neutral-200)"}]'::jsonb,
  NULL, '[]'::jsonb, 3,
  '11/18/2025', 'Due in 14D', 'var(--neutral-200)',
  NULL, 'Assign', NULL, 'Assign',
  NULL, 'Assign', NULL, 'Assign', NULL, 'Assign',
  'Dr. Alan Morse', 'Telehealth', '1.120', '0.056', false,
  'IPA-1', 'Lab', 'Dr. Alan M.', '2', 'PCP', 'Low',
  '1', '1', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-32', 'M-1527-3461', 'Andrew Lewis', 'AL', 'M', '73y 6m',
  1, 3, '[{"date":"07/22/2026","label":"Due in 21D","labelColor":"var(--neutral-200)"},{"date":"01/28/2027","label":"Due in 21D","labelColor":"var(--neutral-200)"},{"date":"04/15/2026","label":"Due in 5 Days","labelColor":"var(--status-warning)"}]'::jsonb,
  5, '["passed","passed","passed","passed","pending"]'::jsonb, 15,
  '09/08/2025', 'Due in 21D', 'var(--neutral-200)',
  'O. Twist', 'Completed', 'Deborah Hintz', 'Completed',
  'K. Patel', 'Completed', 'B. Olafson', 'New', NULL, 'Assign',
  'Dr. Calvin Reed', 'Walk-in', '4.320', '0.356', true,
  'IPA-2', 'Scan', 'Dr. Calvin R.', '9', 'HCC', 'High',
  '5', '4', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-33', 'M-1544-3492', 'Jennifer Robinson', 'JR', 'F', '65y 9m',
  1, 2, '[{"date":"08/28/2026","label":"Overdue by 3 Days","labelColor":"var(--status-error)"},{"date":"02/15/2027","label":"Due in 21D","labelColor":"var(--neutral-200)"}]'::jsonb,
  3, '["pending","pending","pending"]'::jsonb, 7,
  '08/12/2025', 'Overdue: 3D', 'var(--status-error)',
  'E. Johnson', 'Assign', NULL, 'Assign',
  NULL, 'Assign', NULL, 'Assign', NULL, 'Assign',
  'Dr. Nancy Wu', 'Telehealth', '2.210', '0.111', false,
  'ACP', 'Lab', 'Dr. Nancy W.', '6', 'PCP', 'Medium',
  '2', '2', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-5', 'M-1068-2624', 'Annette Brave', 'AB', 'M', '67y 3m',
  2, 4, '[{"date":"06/11/2025","label":"Due Today","labelColor":"var(--status-warning)"},{"date":"03/04/2025","label":"Due in 5 Days","labelColor":"var(--status-warning)"},{"date":"11/10/2024","label":"Due in 2 weeks","labelColor":"var(--neutral-200)"}]'::jsonb,
  3, '["passed","passed","pending"]'::jsonb, 6,
  '09/25/2025', 'Due Today', 'var(--status-warning)',
  'D. Hintz', 'Completed', NULL, 'Assign',
  NULL, 'Assign', NULL, 'Assign', NULL, 'Assign',
  'Dr. Indigo I', 'Walk-in', '3.579', '0.213', true,
  'ACP', 'Scan', 'Dr. Roland G.', '9', 'HCC', 'Low',
  '2', '2', 'en'
);
INSERT INTO hcc_members (id, member_id, name, initials, gender, age, current_visit, total_visits, dos_list, chart_count, doc_status, open_icds, create_date, due_label, due_color, support_name, support_status, coder_name, coder_status, reviewer1_name, reviewer1_status, reviewer2_name, reviewer2_status, reviewer3_name, reviewer3_status, rendering_provider, visit_type, raf_score, raf_impact, risk_utilization, ipa, health_plan, pcp, decile, cohort, risk_level, advillness, frailty, language) VALUES (
  'hcc-9', 'M-1136-2748', 'Grace Hill', 'GH', 'F', '70y 10m',
  2, 3, '[{"date":"10/08/2025","label":"Due in 5 Days","labelColor":"var(--status-info)"},{"date":"06/22/2024","label":"Due in 5 Days","labelColor":"var(--status-warning)"},{"date":"01/15/2024","label":"Due in 2 weeks","labelColor":"var(--neutral-200)"}]'::jsonb,
  2, '["passed","pending"]'::jsonb, 11,
  '11/01/2025', 'Due in 5D', 'var(--status-info)',
  'O. Twist', 'Completed', 'P. Plourde', 'Completed',
  'K. Patel', 'New', NULL, 'Assign', NULL, 'Assign',
  'Dr. Ulysses Horne', 'Telehealth', '2.990', '0.187', true,
  'IPA-3', 'X-Ray', 'Dr. Ulysses H.', '8', 'PCP', 'Medium',
  '3', '3', 'en'
);

-- ══════════════════════════════════════════════════════════════════════════════
-- Seed: hcc_diagnosis_gaps (linked ICDs)
-- ══════════════════════════════════════════════════════════════════════════════
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Annette Brave', 'E11.22', 'Type 2 diabetes with diabetic chronic kidney disease', 'HCC 18 - Diabetes w/ Complications', 'New', 'Suspect',
  3, 2, 0, 0.302,
  '06/27/2025', 'A. Beauchamp (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Annette Brave', 'E11.21', 'Type 2 diabetes with diabetic nephropathy', 'HCC 18 - Diabetes w/ Complications', 'Accepted', NULL,
  1, 0, 1, 0.302,
  '06/27/2025', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Annette Brave', 'E44.0', 'Moderate protein-calorie malnutrition', 'HCC 18 - Diabetes w/ Complications', 'New', NULL,
  1, 0, 0, 0.201,
  '06/27/2025', 'Dr Aldo Richman (Physician)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Annette Brave', 'E41.0', 'Nutritional marasmus', 'HCC Not Linked', 'Dismissed', NULL,
  1, 3, 1, 0.081,
  '06/27/2025', 'Deborah Hintz (Coder)', 'Not clinically supported', true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Annette Brave', 'E11.51', 'Type 2 diabetes mellitus with diabetic peripheral angiopathy without gangrene', 'HCC 18 - Diabetes w/ Complications', 'New', 'Manual',
  1, 0, 1, 0.118,
  '06/27/2025', 'Dr Aldo Richman (Physician)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Frank Green', 'I50.9', 'Heart failure, unspecified', 'HCC 85 - Congestive Heart Failure', 'Accepted', NULL,
  2, 1, 0, 0.331,
  '09/28/2023', 'L. Schmidt (Reviewer 1)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Frank Green', 'E11.9', 'Type 2 DM w/o complications', 'HCC 18 - Diabetes w/ Complications', 'New', NULL,
  1, 0, 0, 0.195,
  '09/28/2023', 'J. Levesque (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Frank Green', 'J44.1', 'COPD with acute exacerbation', 'HCC 111 - COPD', 'In Progress', NULL,
  2, 1, 0, 0.392,
  '09/28/2023', 'J. Levesque (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Brian Carter', 'F32.1', 'Major depressive disorder, single episode', 'HCC 58 - Major Depression', 'Accepted', NULL,
  2, 0, 1, 0.309,
  '11/29/2023', 'M. Almeda (Reviewer 1)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Brian Carter', 'E11.65', 'Type 2 DM with hyperglycemia', 'HCC 18 - Diabetes w/ Complications', 'Accepted', NULL,
  1, 1, 0, 0.302,
  '11/29/2023', 'D. Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Brian Carter', 'I48.91', 'Unspecified atrial fibrillation', 'HCC 96 - Atrial Fibrillation', 'New', 'Suspect',
  2, 0, 0, 0.421,
  '11/29/2023', 'D. Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Brian Carter', 'M79.3', 'Panniculitis, unspecified', 'HCC 40 - Rheumatoid Arthritis', 'Dismissed', NULL,
  1, 0, 0, 0.081,
  '05/20/2024', 'D. Hintz (Coder)', 'Not supported by documentation', true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'David Evans', 'E11.65', 'Type 2 DM with hyperglycemia', 'HCC 18 - Diabetes w/ Complications', 'New', 'Suspect',
  1, 0, 0, 0.195,
  '03/08/2026', 'E. Johnson (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'David Evans', 'I50.23', 'Acute on chronic systolic (congestive) heart failure', 'HCC 85 - Congestive Heart Failure', 'In Progress', NULL,
  2, 1, 1, 0.389,
  '03/08/2026', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'David Evans', 'G35', 'Multiple sclerosis', 'HCC 77 - Multiple Sclerosis', 'New', NULL,
  1, 0, 0, 0.455,
  '03/08/2026', 'E. Fortier (Reviewer 1)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'David Evans', 'I48.0', 'Paroxysmal atrial fibrillation', 'HCC 96 - Atrial Fibrillation', 'New', NULL,
  1, 1, 0, 0.421,
  '03/08/2026', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'David Evans', 'N18.5', 'Chronic kidney disease, stage 5', 'HCC 27 - End-Stage Renal Disease', 'Accepted', NULL,
  2, 0, 1, 0.65,
  '03/08/2026', 'E. Fortier (Reviewer 1)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Grace Hill', 'E11.21', 'Type 2 diabetes with diabetic nephropathy', 'HCC 18 - Diabetes w/ Complications', 'New', NULL,
  2, 1, 0, 0.302,
  '01/15/2024', 'O. Twist (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Grace Hill', 'G47.33', 'Obstructive sleep apnea', 'HCC 86 - Sleep Apnea', 'New', 'Suspect',
  1, 0, 0, 0.164,
  '01/15/2024', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Grace Hill', 'I48.0', 'Paroxysmal atrial fibrillation', 'HCC 96 - Atrial Fibrillation', 'Accepted', NULL,
  1, 0, 1, 0.421,
  '01/15/2024', 'B. Olafson (Reviewer 1)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Grace Hill', 'N18.3', 'Chronic kidney disease, stage 3', 'HCC 27 - End-Stage Renal Disease', 'New', NULL,
  1, 1, 0, 0.184,
  '01/15/2024', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Cynthia Davis', 'E11.9', 'Type 2 DM without complications', 'HCC 19 - Diabetes w/o Complication', 'New', NULL,
  1, 0, 0, 0.195,
  '05/22/2024', 'A. Beauchamp (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Cynthia Davis', 'J44.1', 'COPD with acute exacerbation', 'HCC 111 - COPD', 'New', 'Suspect',
  2, 1, 0, 0.392,
  '05/22/2024', 'A. Beauchamp (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Cynthia Davis', 'G47.33', 'Obstructive sleep apnea', 'HCC 86 - Sleep Apnea', 'Accepted', NULL,
  1, 0, 1, 0.164,
  '05/22/2024', 'A. Beauchamp (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Cynthia Davis', 'I48.91', 'Unspecified atrial fibrillation', 'HCC 96 - Atrial Fibrillation', 'New', NULL,
  1, 0, 0, 0.421,
  '05/22/2024', 'A. Beauchamp (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Emily Foster', 'E11.9', 'Type 2 DM without complications', 'HCC 19 - Diabetes w/o Complication', 'New', NULL,
  1, 0, 0, 0.195,
  '12/01/2023', 'K. Stroman (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Emily Foster', 'G47.33', 'Obstructive sleep apnea', 'HCC 86 - Sleep Apnea', 'Accepted', NULL,
  1, 0, 0, 0.164,
  '12/01/2023', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Emily Foster', 'F33.1', 'Major depressive disorder, recurrent, moderate', 'HCC 58 - Major Depression', 'New', 'Suspect',
  1, 1, 0, 0.309,
  '12/01/2023', 'K. Stroman (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'William Jammy', 'E11.21', 'Type 2 diabetes with diabetic nephropathy', 'HCC 18 - Diabetes w/ Complications', 'New', NULL,
  2, 0, 1, 0.302,
  '07/04/2024', 'Oliver Twist (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'William Jammy', 'I50.9', 'Heart failure, unspecified', 'HCC 85 - Congestive Heart Failure', 'New', 'Suspect',
  1, 1, 0, 0.331,
  '07/04/2024', 'D. Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'William Jammy', 'I48.91', 'Unspecified atrial fibrillation', 'HCC 96 - Atrial Fibrillation', 'Accepted', NULL,
  1, 0, 0, 0.421,
  '07/04/2024', 'N. Richards (Reviewer 2)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'William Jammy', 'J44.0', 'COPD with acute lower respiratory infection', 'HCC 111 - COPD', 'New', NULL,
  1, 0, 0, 0.321,
  '07/04/2024', 'D. Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Robert Kim', 'E11.9', 'Type 2 DM without complications', 'HCC 19 - Diabetes w/o Complication', 'New', NULL,
  1, 0, 0, 0.195,
  '02/14/2025', 'A. Beauchamp (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Robert Kim', 'I50.9', 'Heart failure, unspecified', 'HCC 85 - Congestive Heart Failure', 'New', 'Recapture',
  2, 1, 0, 0.331,
  '02/14/2025', 'A. Beauchamp (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Robert Kim', 'J44.1', 'COPD with acute exacerbation', 'HCC 111 - COPD', 'Accepted', NULL,
  1, 0, 1, 0.392,
  '02/14/2025', 'P. Plourde (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Robert Kim', 'G47.33', 'Obstructive sleep apnea', 'HCC 86 - Sleep Apnea', 'New', 'Suspect',
  1, 0, 0, 0.164,
  '02/14/2025', 'A. Beauchamp (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Maria Santos', 'E11.65', 'Type 2 DM with hyperglycemia', 'HCC 18 - Diabetes w/ Complications', 'New', 'Suspect',
  1, 0, 0, 0.195,
  '04/10/2025', 'K. Stroman (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Maria Santos', 'I48.91', 'Unspecified atrial fibrillation', 'HCC 96 - Atrial Fibrillation', 'In Progress', NULL,
  2, 1, 0, 0.421,
  '04/10/2025', 'K. Stroman (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Maria Santos', 'G47.33', 'Obstructive sleep apnea', 'HCC 86 - Sleep Apnea', 'New', NULL,
  1, 0, 0, 0.164,
  '04/10/2025', 'K. Stroman (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'James Walker', 'E11.65', 'Type 2 DM with hyperglycemia', 'HCC 18 - Diabetes w/ Complications', 'New', NULL,
  2, 1, 0, 0.195,
  '01/22/2025', 'M. Thompson (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'James Walker', 'I50.23', 'Acute on chronic systolic (congestive) heart failure', 'HCC 85 - Congestive Heart Failure', 'New', 'Recapture',
  1, 0, 0, 0.389,
  '01/22/2025', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'James Walker', 'J44.0', 'COPD with acute lower respiratory infection', 'HCC 111 - COPD', 'In Progress', NULL,
  2, 2, 1, 0.321,
  '01/22/2025', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'James Walker', 'F32.1', 'Major depressive disorder, single episode', 'HCC 58 - Major Depression', 'New', 'Suspect',
  1, 0, 0, 0.309,
  '01/22/2025', 'M. Almeda (Reviewer 1)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'James Walker', 'N18.3', 'Chronic kidney disease, stage 3', 'HCC 27 - End-Stage Renal Disease', 'Accepted', NULL,
  1, 1, 0, 0.184,
  '01/22/2025', 'M. Almeda (Reviewer 1)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Helen Park', 'E11.22', 'Type 2 diabetes with diabetic chronic kidney disease', 'HCC 18 - Diabetes w/ Complications', 'New', NULL,
  2, 0, 0, 0.302,
  '03/18/2025', 'L. Torrance (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Helen Park', 'I50.9', 'Heart failure, unspecified', 'HCC 85 - Congestive Heart Failure', 'In Progress', NULL,
  1, 1, 0, 0.331,
  '03/18/2025', 'L. Torrance (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Helen Park', 'F32.1', 'Major depressive disorder, single episode', 'HCC 58 - Major Depression', 'Dismissed', 'Suspect',
  1, 0, 0, 0.309,
  '03/18/2025', 'L. Torrance (Support Team)', 'Insufficient clinical evidence', true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Thomas Reed', 'E11.22', 'Type 2 diabetes with diabetic chronic kidney disease', 'HCC 18 - Diabetes w/ Complications', 'New', NULL,
  2, 1, 0, 0.302,
  '02/28/2026', 'O. Twist (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Thomas Reed', 'I25.10', 'Atherosclerotic heart disease of native coronary artery without angina', 'HCC 108 - Vascular Disease', 'In Progress', NULL,
  1, 0, 1, 0.288,
  '02/28/2026', 'P. Plourde (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Thomas Reed', 'J45.50', 'Severe persistent asthma, uncomplicated', 'HCC 110 - Asthma', 'New', 'Suspect',
  1, 1, 0, 0.271,
  '02/28/2026', 'O. Twist (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Thomas Reed', 'F33.1', 'Major depressive disorder, recurrent, moderate', 'HCC 58 - Major Depression', 'New', NULL,
  1, 0, 0, 0.309,
  '02/28/2026', 'B. Olafson (Reviewer 1)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Thomas Reed', 'E66.01', 'Morbid (severe) obesity due to excess calories', 'HCC 22 - Morbid Obesity', 'Dismissed', NULL,
  1, 0, 0, 0.272,
  '02/28/2026', 'P. Plourde (Coder)', 'Coded incorrectly', true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Linda Chen', 'E11.22', 'Type 2 diabetes with diabetic chronic kidney disease', 'HCC 18 - Diabetes w/ Complications', 'New', 'Suspect',
  1, 0, 0, 0.302,
  '05/01/2025', 'E. Johnson (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Linda Chen', 'I50.23', 'Acute on chronic systolic (congestive) heart failure', 'HCC 85 - Congestive Heart Failure', 'New', 'Recapture',
  1, 1, 0, 0.389,
  '05/01/2025', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Michael Ortiz', 'E11.22', 'Type 2 diabetes with diabetic chronic kidney disease', 'HCC 18 - Diabetes w/ Complications', 'New', 'Suspect',
  2, 1, 0, 0.302,
  '04/25/2025', 'K. Stroman (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Michael Ortiz', 'E11.65', 'Type 2 DM with hyperglycemia', 'HCC 18 - Diabetes w/ Complications', 'In Progress', NULL,
  1, 0, 1, 0.195,
  '04/25/2025', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Michael Ortiz', 'I50.9', 'Heart failure, unspecified', 'HCC 85 - Congestive Heart Failure', 'New', NULL,
  3, 2, 0, 0.331,
  '04/25/2025', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Michael Ortiz', 'I48.91', 'Unspecified atrial fibrillation', 'HCC 96 - Atrial Fibrillation', 'New', 'Suspect',
  1, 0, 0, 0.421,
  '04/25/2025', 'K. Stroman (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Michael Ortiz', 'J44.1', 'COPD with acute exacerbation', 'HCC 111 - COPD', 'New', NULL,
  2, 1, 0, 0.392,
  '04/25/2025', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Michael Ortiz', 'G47.33', 'Obstructive sleep apnea', 'HCC 86 - Sleep Apnea', 'New', NULL,
  1, 0, 0, 0.164,
  '04/25/2025', 'E. Fortier (Reviewer 1)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Michael Ortiz', 'M79.3', 'Panniculitis, unspecified', 'HCC 40 - Rheumatoid Arthritis', 'Dismissed', NULL,
  1, 0, 0, 0.081,
  '04/25/2025', 'Deborah Hintz (Coder)', 'Not supported by documentation', true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Patricia Moore', 'E11.9', 'Type 2 DM without complications', 'HCC 19 - Diabetes w/o Complication', 'New', NULL,
  1, 0, 0, 0.195,
  '06/15/2025', 'K. Stroman (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Patricia Moore', 'G47.33', 'Obstructive sleep apnea', 'HCC 86 - Sleep Apnea', 'New', 'Suspect',
  1, 1, 0, 0.164,
  '06/15/2025', 'K. Stroman (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Charles Rivera', 'E11.9', 'Type 2 DM without complications', 'HCC 19 - Diabetes w/o Complication', 'New', NULL,
  1, 0, 0, 0.195,
  '07/01/2025', 'A. Beauchamp (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Charles Rivera', 'I25.10', 'Atherosclerotic heart disease of native coronary artery without angina', 'HCC 108 - Vascular Disease', 'New', 'Recapture',
  2, 1, 0, 0.288,
  '07/01/2025', 'P. Plourde (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Charles Rivera', 'G47.33', 'Obstructive sleep apnea', 'HCC 86 - Sleep Apnea', 'Accepted', NULL,
  1, 0, 1, 0.164,
  '07/01/2025', 'P. Plourde (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Charles Rivera', 'F32.1', 'Major depressive disorder, single episode', 'HCC 58 - Major Depression', 'New', 'Suspect',
  1, 0, 0, 0.309,
  '07/01/2025', 'A. Beauchamp (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Dorothy Nguyen', 'E11.22', 'Type 2 diabetes with diabetic chronic kidney disease', 'HCC 18 - Diabetes w/ Complications', 'Accepted', NULL,
  2, 0, 1, 0.302,
  '08/12/2025', 'M. Thompson (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Dorothy Nguyen', 'I48.91', 'Unspecified atrial fibrillation', 'HCC 96 - Atrial Fibrillation', 'New', NULL,
  1, 1, 0, 0.421,
  '08/12/2025', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Dorothy Nguyen', 'N18.5', 'Chronic kidney disease, stage 5', 'HCC 27 - End-Stage Renal Disease', 'In Progress', NULL,
  2, 0, 0, 0.65,
  '08/12/2025', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Dorothy Nguyen', 'M06.00', 'Rheumatoid arthritis, unspecified, unspecified site', 'HCC 40 - Rheumatoid Arthritis', 'New', 'Suspect',
  1, 1, 0, 0.421,
  '08/12/2025', 'N. Richards (Reviewer 2)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Richard Scott', 'G47.33', 'Obstructive sleep apnea', 'HCC 86 - Sleep Apnea', 'New', 'Suspect',
  1, 0, 0, 0.164,
  '09/05/2025', 'K. Stroman (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Richard Scott', 'F33.1', 'Major depressive disorder, recurrent, moderate', 'HCC 58 - Major Depression', 'In Progress', NULL,
  1, 1, 0, 0.309,
  '09/05/2025', 'K. Stroman (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Sandra Lee', 'E11.22', 'Type 2 diabetes with diabetic chronic kidney disease', 'HCC 18 - Diabetes w/ Complications', 'New', 'Suspect',
  2, 1, 0, 0.302,
  '10/18/2025', 'L. Torrance (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Sandra Lee', 'F32.1', 'Major depressive disorder, single episode', 'HCC 58 - Major Depression', 'In Progress', NULL,
  1, 0, 1, 0.309,
  '10/18/2025', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Sandra Lee', 'I48.91', 'Unspecified atrial fibrillation', 'HCC 96 - Atrial Fibrillation', 'New', NULL,
  1, 1, 0, 0.421,
  '10/18/2025', 'M. Almeda (Reviewer 1)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Sandra Lee', 'M06.00', 'Rheumatoid arthritis, unspecified, unspecified site', 'HCC 40 - Rheumatoid Arthritis', 'New', NULL,
  1, 0, 0, 0.421,
  '10/18/2025', 'L. Torrance (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Sandra Lee', 'I50.9', 'Heart failure, unspecified', 'HCC 85 - Congestive Heart Failure', 'Accepted', NULL,
  2, 0, 1, 0.331,
  '10/18/2025', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Kevin Brown', 'E11.65', 'Type 2 DM with hyperglycemia', 'HCC 18 - Diabetes w/ Complications', 'New', 'Suspect',
  1, 0, 0, 0.195,
  '11/20/2025', 'E. Johnson (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Kevin Brown', 'I48.91', 'Unspecified atrial fibrillation', 'HCC 96 - Atrial Fibrillation', 'In Progress', NULL,
  1, 1, 0, 0.421,
  '11/20/2025', 'E. Johnson (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Kevin Brown', 'N18.3', 'Chronic kidney disease, stage 3', 'HCC 27 - End-Stage Renal Disease', 'New', NULL,
  1, 0, 0, 0.184,
  '11/20/2025', 'E. Johnson (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Lisa White', 'I50.9', 'Heart failure, unspecified', 'HCC 85 - Congestive Heart Failure', 'New', 'Recapture',
  2, 1, 0, 0.331,
  '12/08/2025', 'O. Twist (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Lisa White', 'E11.65', 'Type 2 DM with hyperglycemia', 'HCC 18 - Diabetes w/ Complications', 'New', NULL,
  1, 0, 0, 0.195,
  '12/08/2025', 'O. Twist (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Lisa White', 'F33.1', 'Major depressive disorder, recurrent, moderate', 'HCC 58 - Major Depression', 'New', 'Suspect',
  1, 1, 0, 0.309,
  '12/08/2025', 'O. Twist (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Lisa White', 'J44.1', 'COPD with acute exacerbation', 'HCC 111 - COPD', 'Dismissed', NULL,
  1, 0, 0, 0.392,
  '12/08/2025', 'O. Twist (Support Team)', 'Not clinically supported', true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Daniel Martinez', 'E11.21', 'Type 2 diabetes with diabetic nephropathy', 'HCC 18 - Diabetes w/ Complications', 'New', NULL,
  2, 0, 1, 0.302,
  '01/30/2026', 'K. Stroman (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Daniel Martinez', 'I50.9', 'Heart failure, unspecified', 'HCC 85 - Congestive Heart Failure', 'New', 'Suspect',
  1, 1, 0, 0.331,
  '01/30/2026', 'P. Plourde (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Daniel Martinez', 'J44.1', 'COPD with acute exacerbation', 'HCC 111 - COPD', 'In Progress', NULL,
  3, 1, 0, 0.392,
  '01/30/2026', 'P. Plourde (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Daniel Martinez', 'F33.1', 'Major depressive disorder, recurrent, moderate', 'HCC 58 - Major Depression', 'New', NULL,
  1, 0, 0, 0.309,
  '01/30/2026', 'B. Olafson (Reviewer 1)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Daniel Martinez', 'I70.201', 'Atherosclerosis of native arteries of extremities, right leg', 'HCC 108 - Vascular Disease', 'Accepted', NULL,
  2, 0, 1, 0.288,
  '01/30/2026', 'P. Plourde (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Daniel Martinez', 'D68.9', 'Coagulation defect, unspecified', 'HCC 48 - Coagulation Defects', 'New', 'Suspect',
  1, 0, 0, 0.267,
  '01/30/2026', 'K. Stroman (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Michelle Jackson', 'E11.22', 'Type 2 diabetes with diabetic chronic kidney disease', 'HCC 18 - Diabetes w/ Complications', 'New', 'Suspect',
  1, 0, 0, 0.302,
  '02/25/2026', 'K. Stroman (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Michelle Jackson', 'I50.9', 'Heart failure, unspecified', 'HCC 85 - Congestive Heart Failure', 'New', 'Recapture',
  1, 1, 0, 0.331,
  '02/25/2026', 'K. Stroman (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Christopher Thompson', 'E11.22', 'Type 2 diabetes with diabetic chronic kidney disease', 'HCC 18 - Diabetes w/ Complications', 'New', 'Suspect',
  2, 1, 0, 0.302,
  '03/20/2026', 'M. Thompson (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Christopher Thompson', 'I50.9', 'Heart failure, unspecified', 'HCC 85 - Congestive Heart Failure', 'In Progress', NULL,
  3, 2, 1, 0.331,
  '03/20/2026', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Christopher Thompson', 'J44.1', 'COPD with acute exacerbation', 'HCC 111 - COPD', 'New', NULL,
  1, 0, 0, 0.392,
  '03/20/2026', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Christopher Thompson', 'I48.0', 'Paroxysmal atrial fibrillation', 'HCC 96 - Atrial Fibrillation', 'Accepted', NULL,
  1, 0, 1, 0.421,
  '03/20/2026', 'E. Fortier (Reviewer 1)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Christopher Thompson', 'G47.33', 'Obstructive sleep apnea', 'HCC 86 - Sleep Apnea', 'New', 'Suspect',
  1, 1, 0, 0.164,
  '03/20/2026', 'M. Thompson (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Christopher Thompson', 'E66.01', 'Morbid (severe) obesity due to excess calories', 'HCC 22 - Morbid Obesity', 'New', NULL,
  1, 0, 0, 0.272,
  '03/20/2026', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Amanda Wilson', 'E11.21', 'Type 2 diabetes with diabetic nephropathy', 'HCC 18 - Diabetes w/ Complications', 'New', 'Suspect',
  1, 1, 0, 0.302,
  '04/12/2026', 'A. Beauchamp (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Amanda Wilson', 'I25.10', 'Atherosclerotic heart disease of native coronary artery without angina', 'HCC 108 - Vascular Disease', 'New', NULL,
  2, 0, 0, 0.288,
  '04/12/2026', 'A. Beauchamp (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Amanda Wilson', 'F32.1', 'Major depressive disorder, single episode', 'HCC 58 - Major Depression', 'Accepted', NULL,
  1, 0, 1, 0.309,
  '04/12/2026', 'A. Beauchamp (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Amanda Wilson', 'G47.33', 'Obstructive sleep apnea', 'HCC 86 - Sleep Apnea', 'New', NULL,
  1, 0, 0, 0.164,
  '04/12/2026', 'A. Beauchamp (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Matthew Harris', 'E11.22', 'Type 2 diabetes with diabetic chronic kidney disease', 'HCC 18 - Diabetes w/ Complications', 'New', 'Suspect',
  2, 1, 0, 0.302,
  '05/05/2026', 'L. Torrance (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Matthew Harris', 'I50.23', 'Acute on chronic systolic (congestive) heart failure', 'HCC 85 - Congestive Heart Failure', 'New', NULL,
  1, 0, 0, 0.389,
  '05/05/2026', 'P. Plourde (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Matthew Harris', 'J44.0', 'COPD with acute lower respiratory infection', 'HCC 111 - COPD', 'In Progress', NULL,
  2, 1, 1, 0.321,
  '05/05/2026', 'P. Plourde (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Matthew Harris', 'I48.91', 'Unspecified atrial fibrillation', 'HCC 96 - Atrial Fibrillation', 'Accepted', NULL,
  1, 0, 0, 0.421,
  '05/05/2026', 'M. Almeda (Reviewer 1)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Matthew Harris', 'E66.01', 'Morbid (severe) obesity due to excess calories', 'HCC 22 - Morbid Obesity', 'New', NULL,
  1, 0, 0, 0.272,
  '05/05/2026', 'L. Torrance (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Jessica Clark', 'E11.65', 'Type 2 DM with hyperglycemia', 'HCC 18 - Diabetes w/ Complications', 'New', 'Suspect',
  1, 0, 0, 0.195,
  '06/18/2026', 'K. Stroman (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Jessica Clark', 'I48.0', 'Paroxysmal atrial fibrillation', 'HCC 96 - Atrial Fibrillation', 'New', NULL,
  1, 1, 0, 0.421,
  '06/18/2026', 'K. Stroman (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Andrew Lewis', 'E11.22', 'Type 2 diabetes with diabetic chronic kidney disease', 'HCC 18 - Diabetes w/ Complications', 'New', 'Suspect',
  2, 0, 0, 0.302,
  '07/22/2026', 'O. Twist (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Andrew Lewis', 'I50.23', 'Acute on chronic systolic (congestive) heart failure', 'HCC 85 - Congestive Heart Failure', 'New', NULL,
  1, 1, 0, 0.389,
  '07/22/2026', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Andrew Lewis', 'J44.1', 'COPD with acute exacerbation', 'HCC 111 - COPD', 'In Progress', NULL,
  2, 0, 1, 0.392,
  '07/22/2026', 'Deborah Hintz (Coder)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Andrew Lewis', 'I48.0', 'Paroxysmal atrial fibrillation', 'HCC 96 - Atrial Fibrillation', 'New', NULL,
  1, 1, 0, 0.421,
  '07/22/2026', 'K. Patel (Reviewer 2)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Andrew Lewis', 'F33.1', 'Major depressive disorder, recurrent, moderate', 'HCC 58 - Major Depression', 'Accepted', NULL,
  1, 0, 0, 0.309,
  '07/22/2026', 'K. Patel (Reviewer 2)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Andrew Lewis', 'E66.01', 'Morbid (severe) obesity due to excess calories', 'HCC 22 - Morbid Obesity', 'New', 'Suspect',
  1, 0, 0, 0.272,
  '07/22/2026', 'O. Twist (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Jennifer Robinson', 'E11.65', 'Type 2 DM with hyperglycemia', 'HCC 18 - Diabetes w/ Complications', 'New', 'Suspect',
  1, 0, 0, 0.195,
  '08/28/2026', 'E. Johnson (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Jennifer Robinson', 'G47.33', 'Obstructive sleep apnea', 'HCC 86 - Sleep Apnea', 'New', NULL,
  1, 1, 0, 0.164,
  '08/28/2026', 'E. Johnson (Support Team)', NULL, true
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, notes_count, raf_weight, last_activity, last_activity_by, dismiss_reason, is_linked) VALUES (
  'Jennifer Robinson', 'I48.0', 'Paroxysmal atrial fibrillation', 'HCC 96 - Atrial Fibrillation', 'Dismissed', NULL,
  1, 0, 0, 0.421,
  '08/28/2026', 'E. Johnson (Support Team)', 'Resolved prior to encounter', true
);

-- Not-linked ICDs
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Annette Brave', 'I50.23', 'Acute on chronic systolic (congestive) heart failure', 'HCC 85 - Congestive Heart Failure', 'New', 'Recapture',
  1, 2, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Annette Brave', 'E11.65', 'Type 2 diabetes mellitus with hyperglycemia', 'HCC 18 - Diabetes w/ Complications', 'New', 'Suspect',
  1, 0, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Annette Brave', 'G47.33', 'Obstructive sleep apnea', 'HCC 86 - Sleep Apnea', 'New', NULL,
  1, 0, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Frank Green', 'Z87.39', 'Personal history of other musculoskeletal disorders', 'HCC Not Linked', 'New', 'Recapture',
  1, 0, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Frank Green', 'Z96.641', 'Presence of right artificial hip joint', 'HCC Not Linked', 'New', NULL,
  1, 0, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'David Evans', 'F32.1', 'Major depressive disorder, single episode', 'HCC 58 - Major Depression', 'New', 'Suspect',
  1, 0, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Grace Hill', 'I50.23', 'Acute on chronic systolic (congestive) heart failure', 'HCC 85 - Congestive Heart Failure', 'New', 'Recapture',
  1, 0, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Cynthia Davis', 'F32.1', 'Major depressive disorder, single episode', 'HCC 58 - Major Depression', 'New', NULL,
  1, 0, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'William Jammy', 'F32.1', 'Major depressive disorder, single episode', 'HCC 58 - Major Depression', 'New', 'Suspect',
  1, 0, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Robert Kim', 'F32.1', 'Major depressive disorder, single episode', 'HCC 58 - Major Depression', 'New', 'Suspect',
  1, 1, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'James Walker', 'E66.01', 'Morbid (severe) obesity due to excess calories', 'HCC 22 - Morbid Obesity', 'New', 'Suspect',
  1, 0, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'James Walker', 'N18.3', 'Chronic kidney disease, stage 3', 'HCC 27 - End-Stage Renal Disease', 'New', NULL,
  1, 0, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Helen Park', 'J44.1', 'COPD with acute exacerbation', 'HCC 111 - COPD', 'New', 'Recapture',
  1, 0, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Thomas Reed', 'I50.9', 'Heart failure, unspecified', 'HCC 85 - Congestive Heart Failure', 'New', 'Recapture',
  1, 1, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Thomas Reed', 'G47.33', 'Obstructive sleep apnea', 'HCC 86 - Sleep Apnea', 'New', NULL,
  1, 0, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Michael Ortiz', 'I25.10', 'Atherosclerotic heart disease of native coronary artery', 'HCC 108 - Vascular Disease', 'New', 'Recapture',
  2, 1, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Michael Ortiz', 'E66.01', 'Morbid (severe) obesity due to excess calories', 'HCC 22 - Morbid Obesity', 'New', NULL,
  1, 0, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Charles Rivera', 'I50.9', 'Heart failure, unspecified', 'HCC 85 - Congestive Heart Failure', 'New', 'Recapture',
  1, 0, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Sandra Lee', 'J44.1', 'COPD with acute exacerbation', 'HCC 111 - COPD', 'New', 'Suspect',
  1, 0, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Lisa White', 'E66.01', 'Morbid (severe) obesity due to excess calories', 'HCC 22 - Morbid Obesity', 'New', 'Recapture',
  1, 0, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Daniel Martinez', 'G47.33', 'Obstructive sleep apnea', 'HCC 86 - Sleep Apnea', 'New', 'Suspect',
  1, 0, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Christopher Thompson', 'I25.10', 'Atherosclerotic heart disease of native coronary artery', 'HCC 108 - Vascular Disease', 'New', 'Recapture',
  1, 1, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Amanda Wilson', 'E66.01', 'Morbid (severe) obesity due to excess calories', 'HCC 22 - Morbid Obesity', 'New', 'Recapture',
  1, 0, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Matthew Harris', 'G47.33', 'Obstructive sleep apnea', 'HCC 86 - Sleep Apnea', 'New', 'Suspect',
  1, 0, NULL, false
);
INSERT INTO hcc_diagnosis_gaps (member_name, code, description, hcc_category, status, type, docs_count, comments_count, dismiss_reason, is_linked) VALUES (
  'Andrew Lewis', 'G47.33', 'Obstructive sleep apnea', 'HCC 86 - Sleep Apnea', 'New', 'Suspect',
  1, 0, NULL, false
);
