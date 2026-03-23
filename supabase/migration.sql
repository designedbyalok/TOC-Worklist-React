-- ============================================================
-- TOC Worklist: Supabase Schema + Seed Data
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- 1. Create the patients table
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  initials TEXT NOT NULL,
  name TEXT NOT NULL,
  gender TEXT,
  age TEXT,
  member_id TEXT,
  enrolled BOOLEAN DEFAULT FALSE,
  language TEXT DEFAULT 'en',

  -- Agent
  agent_assigned TEXT DEFAULT '',
  agent_role TEXT DEFAULT '',

  -- Clinical
  lace TEXT,
  toc_type TEXT,
  outreach_type TEXT,
  outreach_left TEXT,
  on_call BOOLEAN DEFAULT FALSE,
  call_duration TEXT,

  -- Status
  status TEXT DEFAULT 'scheduled',
  scheduled_time TEXT,
  goals JSONB,
  next_action TEXT,

  -- Outreach
  outreach_dots JSONB DEFAULT '[]'::JSONB,
  toc_status TEXT,
  due_on TEXT,
  outreach_attended INTEGER DEFAULT 0,
  outreach_date TEXT,
  next_outreach TEXT,

  -- Dates & Assignment
  start_date TEXT,
  last_admission TEXT,
  assignee TEXT,
  assignee_initials TEXT,

  -- Misc
  readmission TEXT DEFAULT 'No',
  tasks INTEGER DEFAULT 0,
  care_plan_status TEXT DEFAULT 'none',
  discharge_date TEXT,
  facility TEXT,
  admit_reason TEXT,

  -- Complex nested data (JSONB)
  ai_insights JSONB DEFAULT '[]'::JSONB,
  attempts JSONB DEFAULT '[]'::JSONB,
  goals_detail JSONB DEFAULT '[]'::JSONB,
  call_summary JSONB,
  call_date TEXT,
  call_duration_full TEXT,
  call_transcript JSONB DEFAULT '[]'::JSONB,
  live_goals JSONB DEFAULT '[]'::JSONB,
  live_transcript JSONB DEFAULT '[]'::JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (allow all for prototype)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON patients
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 4. Seed data
INSERT INTO patients (id, initials, name, gender, age, member_id, enrolled, language, agent_assigned, agent_role, outreach_dots, lace, toc_type, outreach_type, outreach_left, on_call, call_duration, status, scheduled_time, goals, next_action, ai_insights, toc_status, due_on, outreach_attended, outreach_date, next_outreach, start_date, last_admission, assignee, assignee_initials, readmission, tasks, care_plan_status, discharge_date, facility, admit_reason, attempts, goals_detail, call_summary, call_date, call_duration_full, call_transcript, live_goals, live_transcript)
VALUES
-- p1: Ralph Halvorson
('p1', 'RH', 'Ralph Halvorson', 'M', '52y 5m', '#2468029989898', true, 'en', '', '', '["success","pending","pending"]'::JSONB, 'High', 'IP', '48h', '2h left', false, NULL, 'completed', NULL, '{"met":3,"total":3}'::JSONB, '__MED_REVIEW__',
 '[{"label":"Readmission Risk","cls":"ai-tag-risk","icon":"solar:danger-triangle-bold"},{"label":"Needs CCM Plan","cls":"ai-tag-care","icon":"solar:clipboard-heart-bold"},{"label":"Med Non-Adherence","cls":"ai-tag-med","icon":"solar:pill-bold"}]'::JSONB,
 'enrolled', '07/30/2025', 1, '11/12/25', '11/19/2025', '08/15/2025', '09/15/2025', 'Ignacio Beer', 'IB', 'Yes', 1, 'updated', '11/03/2025', 'St. Mary Hospital', 'CHF exacerbation', '[]'::JSONB,
 '[{"name":"Patient Outreach","desc":"Establish first contact within 2 business days of discharge.","pass":true},{"name":"Schedule ToC Appointment","desc":"Book follow-up appointment with PCP or care coordinator.","pass":true},{"name":"Medication Review","desc":"Review current medications and identify any discrepancies.","pass":true}]'::JSONB,
 '{"keyPoints":["Patient reported ongoing fatigue and mild shortness of breath.","Confirmed taking prescribed medications as instructed but occasional forgetfulness.","Advised to maintain hydration and incorporate light physical activity.","Expressed concern about upcoming lab results."],"actionItems":["Schedule follow-up call next week.","Send medication reminder tips.","Share resources on fatigue management."]}'::JSONB,
 '11/28/2025 10:55', '05:29',
 '[{"sender":"agent","name":"Anna","text":"Hello, this is Fold Health care support calling for your TOC follow-up.","time":"9:28 PM"},{"sender":"patient","name":"Ralph Halvorson","text":"Yes, sure","time":"9:28 PM"}]'::JSONB,
 '[{"name":"Patient Outreach","done":true,"time":"1:10"},{"name":"Schedule ToC Appointment","done":true,"time":"2:05"},{"name":"Medication Review","done":true,"time":"3:42"}]'::JSONB,
 '[{"sender":"agent","name":"Anna","text":"Hello Ralph, this is Fold Health calling for your follow-up.","time":"10:55 AM"},{"sender":"patient","name":"Ralph Halvorson","text":"Better than last week, but still some shortness of breath.","time":"10:55 AM"}]'::JSONB),

-- p2: Terri Schulist
('p2', 'TS', 'Terri Schulist', 'F', '61y 8m', '#2468029989898', true, 'es', '', '', '["failed","success","pending"]'::JSONB, 'High', 'IP', '48h', '12h left', false, NULL, 'scheduled', '11/15/2025 10:30 AM', NULL, 'Initial outreach — first contact attempt',
 '[{"label":"High Risk Patient","cls":"ai-tag-risk","icon":"solar:shield-warning-bold"},{"label":"Fall Risk","cls":"ai-tag-social","icon":"solar:running-2-bold"}]'::JSONB,
 'engaged', '04/25/2024', 1, '11/12/25', '11/14/2025', '08/15/2025', '09/15/2025', 'Robin Bang', 'RB', 'No', 0, 'none', '11/03/2025', 'General Hospital', 'Pneumonia', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB,
 '[{"name":"Patient Outreach","done":true,"time":"2:28"},{"name":"Schedule ToC Appointment","done":false,"time":null},{"name":"Medication Review","done":false,"time":null}]'::JSONB,
 '[{"sender":"agent","name":"Anna","text":"Hello, this is Fold Health calling to follow up after your recent hospital stay.","time":"9:45 PM"},{"sender":"patient","name":"Terri Schulist","text":"Yes, go ahead.","time":"9:45 PM"}]'::JSONB),

-- p3: Annette Brave
('p3', 'AB', 'Annette Brave', 'O', '48y 4m', '#2468029989898', true, 'yue', '', '', '["success","pending","pending"]'::JSONB, 'High', 'ED', '48h', '4h left', false, NULL, 'scheduled', '11/15/2025 11:00 AM', NULL, 'Callback scheduled – inbound call detected',
 '[{"label":"Financial Aid","cls":"ai-tag-social","icon":"solar:wallet-money-bold"},{"label":"Social Isolation","cls":"ai-tag-social","icon":"solar:user-block-bold"},{"label":"Depression Screen","cls":"ai-tag-care","icon":"solar:clipboard-heart-bold"}]'::JSONB,
 'engaged', '07/08/2024', 1, '11/12/25', '11/13/2025', '08/15/2025', '09/15/2025', 'You', 'ME', 'No', 2, 'pending', '11/04/2025', 'ER – City Medical', 'Chest pain, rule out ACS', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB,
 '[{"name":"Patient Outreach","done":true,"time":"1:15"},{"name":"Schedule ToC Appointment","done":true,"time":"3:02"},{"name":"Medication Review","done":false,"time":null}]'::JSONB,
 '[{"sender":"agent","name":"Anna","text":"Hi Annette, this is Fold Health calling about your recent ER visit.","time":"10:12 AM"},{"sender":"patient","name":"Annette Brave","text":"I am doing better, the chest pain has not come back.","time":"10:12 AM"}]'::JSONB),

-- p4: Glenn Bauch
('p4', 'GB', 'Glenn Bauch', 'F', '66y 1m', '#2468029989898', false, 'zh', '', '', '["failed","failed","failed"]'::JSONB, 'Medium', 'IP', '7d', '3d 5h left', false, NULL, 'failed', NULL, NULL, 'Paused – awaiting coordinator review',
 '[{"label":"Transport Barrier","cls":"ai-tag-social","icon":"solar:bus-bold"},{"label":"Care Coordination","cls":"ai-tag-care","icon":"solar:clipboard-list-bold"}]'::JSONB,
 'attempted', '08/12/2024', 0, NULL, '11/08/2025', '08/15/2025', '09/15/2025', 'Ignacio Beer', 'IB', 'No', 1, 'none', '11/02/2025', 'Regional Medical Center', 'Hip fracture post-fall',
 '[{"time":"11/05/2025 08:15 AM","outcome":"No answer – voicemail left"},{"time":"11/05/2025 10:45 AM","outcome":"No answer"},{"time":"11/05/2025 02:30 PM","outcome":"Line busy"}]'::JSONB,
 '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p5: Marcus Ziemann
('p5', 'MZ', 'Marcus Ziemann', 'O', '50y 3m', '#2468029989898', false, 'en', '', '', '["failed","success","pending"]'::JSONB, 'Medium', 'ED', '7d', '2d 8h left', false, NULL, 'scheduled', '11/13/2025 03:00 PM', NULL, 'Verify medication reconciliation',
 '[{"label":"Med Non-Adherence","cls":"ai-tag-med","icon":"solar:pill-bold"},{"label":"Asthma Action Plan","cls":"ai-tag-care","icon":"solar:clipboard-heart-bold"}]'::JSONB,
 'engaged', '12/17/2024', 1, '11/12/25', '11/19/2025', '08/15/2025', '09/15/2025', 'You', 'ME', 'Yes', 0, 'updated', '11/04/2025', 'ER – Northside', 'Severe asthma attack', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB,
 '[{"name":"Patient Outreach","done":true,"time":"0:45"},{"name":"Schedule ToC Appointment","done":false,"time":null},{"name":"Medication Review","done":false,"time":null}]'::JSONB,
 '[{"sender":"agent","name":"Anna","text":"Hello Marcus, calling from Fold Health to check in after your recent ER visit.","time":"11:30 AM"},{"sender":"patient","name":"Marcus Ziemann","text":"Better now, but I ran out of my inhaler refill.","time":"11:30 AM"}]'::JSONB),

-- p6: Ms. Lloyd Pagac
('p6', 'LP', 'Ms. Lloyd Pagac', 'M', '59y 7m', '#2468029989898', false, 'es', '', '', '["pending","pending","pending"]'::JSONB, 'Low', 'IP', '7d', '4d 12h left', false, NULL, 'scheduled', '11/12/2025 10:00 AM', NULL, 'Call patient today',
 '[{"label":"Post-Surgical","cls":"ai-tag-care","icon":"solar:clipboard-heart-bold"},{"label":"PT Needed","cls":"ai-tag-neutral","icon":"solar:running-2-bold"}]'::JSONB,
 'new', '06/21/2025', 0, NULL, '11/12/2025', '08/15/2025', '09/15/2025', 'You', 'ME', 'No', 0, 'none', '11/01/2025', 'St. Luke''s', 'Elective knee replacement', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p7: Kendra Crona
('p7', 'KC', 'Kendra Crona', 'M', '64y 9m', '#2468029989898', false, 'en', '', '', '["pending","pending","pending"]'::JSONB, 'Low', 'ED', '7d', '5d left', false, NULL, 'scheduled', '11/13/2025 02:00 PM', NULL, 'Paused – awaiting coordinator review',
 '[{"label":"Recurrent UTI","cls":"ai-tag-risk","icon":"solar:danger-triangle-bold"},{"label":"Antibiotic Adhere.","cls":"ai-tag-med","icon":"solar:pill-bold"}]'::JSONB,
 'new', '10/04/2024', 0, NULL, '11/13/2025', '08/15/2025', '09/15/2025', 'Ignacio Beer', 'IB', 'Yes', 1, 'none', '11/01/2025', 'ER – Eastside', 'Urinary tract infection', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p8: Diana Welch
('p8', 'DW', 'Diana Welch', 'F', '55y 2m', '#2468029990001', true, 'en', '', '', '["success","success","pending"]'::JSONB, 'High', 'IP', '48h', '6h left', false, NULL, 'scheduled', '11/16/2025 09:00 AM', NULL, 'Follow-up medication check',
 '[{"label":"Diabetes Mgmt","cls":"ai-tag-care","icon":"solar:clipboard-heart-bold"},{"label":"Med Non-Adherence","cls":"ai-tag-med","icon":"solar:pill-bold"}]'::JSONB,
 'enrolled', '08/01/2025', 2, '11/13/25', '11/20/2025', '08/20/2025', '09/20/2025', 'Robin Bang', 'RB', 'No', 1, 'updated', '11/05/2025', 'Memorial Hospital', 'Diabetic ketoacidosis', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p9: James Rivera
('p9', 'JR', 'James Rivera', 'M', '72y 0m', '#2468029990002', true, 'en', '', '', '["success","pending","pending"]'::JSONB, 'High', 'IP', '48h', '1h left', false, NULL, 'scheduled', '11/14/2025 02:00 PM', NULL, 'Confirm PCP appointment',
 '[{"label":"Readmission Risk","cls":"ai-tag-risk","icon":"solar:danger-triangle-bold"},{"label":"Fall Risk","cls":"ai-tag-social","icon":"solar:running-2-bold"}]'::JSONB,
 'engaged', '07/15/2025', 1, '11/12/25', '11/18/2025', '08/10/2025', '09/10/2025', 'Ignacio Beer', 'IB', 'Yes', 2, 'pending', '11/04/2025', 'VA Medical Center', 'COPD exacerbation', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p10: Sandra Nguyen
('p10', 'SN', 'Sandra Nguyen', 'F', '45y 11m', '#2468029990003', false, 'vi', '', '', '["failed","pending","pending"]'::JSONB, 'Medium', 'ED', '7d', '3d left', false, NULL, 'scheduled', '11/15/2025 01:00 PM', NULL, 'Retry outreach – language barrier noted',
 '[{"label":"Language Barrier","cls":"ai-tag-social","icon":"solar:user-block-bold"},{"label":"Care Coordination","cls":"ai-tag-care","icon":"solar:clipboard-list-bold"}]'::JSONB,
 'attempted', '09/01/2025', 0, NULL, '11/15/2025', '08/25/2025', '09/25/2025', 'You', 'ME', 'No', 1, 'none', '11/03/2025', 'ER – Downtown', 'Abdominal pain',
 '[{"time":"11/06/2025 09:00 AM","outcome":"No answer – language barrier"}]'::JSONB,
 '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p11: Peter Kim
('p11', 'PK', 'Peter Kim', 'M', '68y 3m', '#2468029990004', true, 'ko', '', '', '["success","success","success"]'::JSONB, 'Low', 'IP', '7d', '6d left', false, NULL, 'completed', NULL, '{"met":3,"total":3}'::JSONB, 'All goals met – discharge complete',
 '[{"label":"Post-Surgical","cls":"ai-tag-care","icon":"solar:clipboard-heart-bold"}]'::JSONB,
 'enrolled', '07/20/2025', 3, '11/10/25', '11/17/2025', '08/01/2025', '09/01/2025', 'Robin Bang', 'RB', 'No', 0, 'updated', '10/28/2025', 'Mercy Hospital', 'Cardiac stent placement', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p12: Maria Lopez
('p12', 'ML', 'Maria Lopez', 'F', '57y 6m', '#2468029990005', true, 'es', '', '', '["success","failed","pending"]'::JSONB, 'High', 'IP', '48h', '8h left', false, NULL, 'scheduled', '11/14/2025 11:00 AM', NULL, 'Reschedule missed appointment',
 '[{"label":"Transport Barrier","cls":"ai-tag-social","icon":"solar:bus-bold"},{"label":"Readmission Risk","cls":"ai-tag-risk","icon":"solar:danger-triangle-bold"}]'::JSONB,
 'engaged', '08/05/2025', 1, '11/11/25', '11/16/2025', '08/12/2025', '09/12/2025', 'Ignacio Beer', 'IB', 'Yes', 1, 'pending', '11/02/2025', 'Community General', 'Heart failure', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p13: Brian Thompson
('p13', 'BT', 'Brian Thompson', 'M', '43y 8m', '#2468029990006', false, 'en', '', '', '["pending","pending","pending"]'::JSONB, 'Low', 'ED', '7d', '5d 4h left', false, NULL, 'scheduled', '11/16/2025 03:30 PM', NULL, 'Initial outreach pending',
 '[{"label":"Substance Use","cls":"ai-tag-risk","icon":"solar:danger-triangle-bold"}]'::JSONB,
 'new', '11/20/2025', 0, NULL, '11/16/2025', '09/01/2025', '10/01/2025', 'You', 'ME', 'No', 0, 'none', '11/06/2025', 'ER – Westside', 'Laceration repair', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p14: Elena Garcia
('p14', 'EG', 'Elena Garcia', 'F', '74y 1m', '#2468029990007', true, 'es', '', '', '["success","success","pending"]'::JSONB, 'High', 'IP', '48h', '3h left', false, NULL, 'scheduled', '11/13/2025 10:00 AM', NULL, 'Medication reconciliation needed',
 '[{"label":"Polypharmacy","cls":"ai-tag-med","icon":"solar:pill-bold"},{"label":"Readmission Risk","cls":"ai-tag-risk","icon":"solar:danger-triangle-bold"},{"label":"Needs CCM Plan","cls":"ai-tag-care","icon":"solar:clipboard-heart-bold"}]'::JSONB,
 'enrolled', '07/25/2025', 2, '11/12/25', '11/15/2025', '08/05/2025', '09/05/2025', 'Robin Bang', 'RB', 'Yes', 2, 'updated', '11/01/2025', 'St. Mary Hospital', 'Stroke (ischemic)', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p15: Robert Johnson
('p15', 'RJ', 'Robert Johnson', 'M', '62y 4m', '#2468029990008', false, 'en', '', '', '["failed","failed","pending"]'::JSONB, 'Medium', 'IP', '7d', '2d left', false, NULL, 'failed', NULL, NULL, 'Escalate to supervisor – multiple failed attempts',
 '[{"label":"Social Isolation","cls":"ai-tag-social","icon":"solar:user-block-bold"},{"label":"Depression Screen","cls":"ai-tag-care","icon":"solar:clipboard-heart-bold"}]'::JSONB,
 'attempted', '08/20/2025', 0, NULL, '11/14/2025', '08/18/2025', '09/18/2025', 'Ignacio Beer', 'IB', 'No', 1, 'none', '11/03/2025', 'Veterans Hospital', 'Major depressive episode',
 '[{"time":"11/07/2025 09:30 AM","outcome":"No answer"},{"time":"11/07/2025 02:00 PM","outcome":"No answer – voicemail left"}]'::JSONB,
 '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p16: Alice Walker
('p16', 'AW', 'Alice Walker', 'F', '51y 10m', '#2468029990009', true, 'en', '', '', '["success","pending","pending"]'::JSONB, 'Medium', 'ED', '7d', '4d left', false, NULL, 'scheduled', '11/15/2025 09:30 AM', NULL, 'Schedule follow-up with specialist',
 '[{"label":"Asthma Action Plan","cls":"ai-tag-care","icon":"solar:clipboard-heart-bold"}]'::JSONB,
 'engaged', '09/10/2025', 1, '11/12/25', '11/19/2025', '08/22/2025', '09/22/2025', 'You', 'ME', 'No', 0, 'pending', '11/04/2025', 'ER – Central', 'Allergic reaction', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p17: Carlos Hernandez
('p17', 'CH', 'Carlos Hernandez', 'M', '69y 5m', '#2468029990010', true, 'es', '', '', '["success","success","success"]'::JSONB, 'High', 'IP', '48h', '0h left', false, NULL, 'completed', NULL, '{"met":3,"total":3}'::JSONB, 'All goals met',
 '[{"label":"Cardiac Rehab","cls":"ai-tag-care","icon":"solar:clipboard-heart-bold"}]'::JSONB,
 'enrolled', '07/10/2025', 3, '11/10/25', '11/17/2025', '07/28/2025', '08/28/2025', 'Robin Bang', 'RB', 'No', 0, 'updated', '10/30/2025', 'Heart Center', 'Myocardial infarction', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p18: Nancy Patel
('p18', 'NP', 'Nancy Patel', 'F', '58y 0m', '#2468029990011', false, 'hi', '', '', '["failed","pending","pending"]'::JSONB, 'Medium', 'IP', '7d', '3d 8h left', false, NULL, 'scheduled', '11/14/2025 04:00 PM', NULL, 'Retry outreach with interpreter',
 '[{"label":"Language Barrier","cls":"ai-tag-social","icon":"solar:user-block-bold"},{"label":"Financial Aid","cls":"ai-tag-social","icon":"solar:wallet-money-bold"}]'::JSONB,
 'attempted', '09/15/2025', 0, NULL, '11/14/2025', '08/28/2025', '09/28/2025', 'Ignacio Beer', 'IB', 'No', 1, 'none', '11/02/2025', 'Unity Hospital', 'Gallbladder surgery',
 '[{"time":"11/06/2025 11:00 AM","outcome":"No answer – interpreter needed"}]'::JSONB,
 '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p19: Thomas Moore
('p19', 'TM', 'Thomas Moore', 'M', '47y 9m', '#2468029990012', false, 'en', '', '', '["pending","pending","pending"]'::JSONB, 'Low', 'ED', '7d', '6d left', false, NULL, 'scheduled', '11/17/2025 10:00 AM', NULL, 'Initial contact – new patient',
 '[{"label":"Substance Use","cls":"ai-tag-risk","icon":"solar:danger-triangle-bold"},{"label":"Mental Health","cls":"ai-tag-care","icon":"solar:clipboard-heart-bold"}]'::JSONB,
 'new', '11/25/2025', 0, NULL, '11/17/2025', '09/05/2025', '10/05/2025', 'You', 'ME', 'No', 0, 'none', '11/07/2025', 'ER – South', 'Anxiety/panic attack', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p20: Lisa Brown
('p20', 'LB', 'Lisa Brown', 'F', '63y 7m', '#2468029990013', true, 'en', '', '', '["success","success","pending"]'::JSONB, 'High', 'IP', '48h', '5h left', false, NULL, 'scheduled', '11/14/2025 09:00 AM', NULL, 'Verify home care setup',
 '[{"label":"Fall Risk","cls":"ai-tag-social","icon":"solar:running-2-bold"},{"label":"PT Needed","cls":"ai-tag-neutral","icon":"solar:running-2-bold"}]'::JSONB,
 'enrolled', '08/10/2025', 2, '11/12/25', '11/16/2025', '08/08/2025', '09/08/2025', 'Robin Bang', 'RB', 'No', 1, 'updated', '11/01/2025', 'Orthopedic Center', 'Hip replacement surgery', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p21: Kevin Singh
('p21', 'KS', 'Kevin Singh', 'M', '56y 2m', '#2468029990014', false, 'pa', '', '', '["failed","failed","failed"]'::JSONB, 'Medium', 'IP', '7d', '1d left', false, NULL, 'failed', NULL, NULL, 'Final attempt – consider home visit',
 '[{"label":"Language Barrier","cls":"ai-tag-social","icon":"solar:user-block-bold"},{"label":"Care Coordination","cls":"ai-tag-care","icon":"solar:clipboard-list-bold"}]'::JSONB,
 'attempted', '08/25/2025', 0, NULL, '11/12/2025', '08/15/2025', '09/15/2025', 'Ignacio Beer', 'IB', 'Yes', 2, 'none', '11/01/2025', 'Regional Medical Center', 'Pneumonia with sepsis',
 '[{"time":"11/04/2025 08:00 AM","outcome":"No answer"},{"time":"11/05/2025 10:00 AM","outcome":"No answer – voicemail left"},{"time":"11/06/2025 03:00 PM","outcome":"Wrong number"}]'::JSONB,
 '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p22: Jennifer Chen
('p22', 'JC', 'Jennifer Chen', 'F', '41y 3m', '#2468029990015', true, 'zh', '', '', '["success","pending","pending"]'::JSONB, 'Low', 'ED', '7d', '5d 6h left', false, NULL, 'scheduled', '11/16/2025 11:30 AM', NULL, 'Follow up on discharge instructions',
 '[{"label":"Anxiety Mgmt","cls":"ai-tag-care","icon":"solar:clipboard-heart-bold"}]'::JSONB,
 'engaged', '10/01/2025', 1, '11/13/25', '11/20/2025', '09/10/2025', '10/10/2025', 'You', 'ME', 'No', 0, 'pending', '11/06/2025', 'ER – University', 'Migraine with aura', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p23: William Davis
('p23', 'WD', 'William Davis', 'M', '77y 11m', '#2468029990016', true, 'en', '', '', '["success","success","success"]'::JSONB, 'High', 'IP', '48h', '0h left', false, NULL, 'completed', NULL, '{"met":2,"total":3}'::JSONB, 'Pending – medication review incomplete',
 '[{"label":"Readmission Risk","cls":"ai-tag-risk","icon":"solar:danger-triangle-bold"},{"label":"Polypharmacy","cls":"ai-tag-med","icon":"solar:pill-bold"},{"label":"Fall Risk","cls":"ai-tag-social","icon":"solar:running-2-bold"}]'::JSONB,
 'enrolled', '07/05/2025', 3, '11/09/25', '11/16/2025', '07/20/2025', '08/20/2025', 'Robin Bang', 'RB', 'Yes', 1, 'updated', '10/25/2025', 'St. Mary Hospital', 'Congestive heart failure', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p24: Angela Foster
('p24', 'AF', 'Angela Foster', 'F', '53y 5m', '#2468029990017', false, 'en', '', '', '["pending","pending","pending"]'::JSONB, 'Low', 'ED', '7d', '6d 2h left', false, NULL, 'scheduled', '11/18/2025 01:00 PM', NULL, 'Initial outreach – new referral',
 '[{"label":"Financial Aid","cls":"ai-tag-social","icon":"solar:wallet-money-bold"}]'::JSONB,
 'new', '11/28/2025', 0, NULL, '11/18/2025', '09/15/2025', '10/15/2025', 'Ignacio Beer', 'IB', 'No', 0, 'none', '11/08/2025', 'ER – Lake View', 'Back pain – spinal stenosis', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p25: Ricardo Martinez
('p25', 'RM', 'Ricardo Martinez', 'M', '60y 8m', '#2468029990018', true, 'es', '', '', '["success","failed","pending"]'::JSONB, 'Medium', 'IP', '7d', '2d 4h left', false, NULL, 'scheduled', '11/14/2025 03:30 PM', NULL, 'Reschedule ToC appointment',
 '[{"label":"Diabetes Mgmt","cls":"ai-tag-care","icon":"solar:clipboard-heart-bold"},{"label":"Transport Barrier","cls":"ai-tag-social","icon":"solar:bus-bold"}]'::JSONB,
 'engaged', '09/01/2025', 1, '11/11/25', '11/18/2025', '08/20/2025', '09/20/2025', 'You', 'ME', 'No', 1, 'pending', '11/03/2025', 'Community Hospital', 'Uncontrolled diabetes', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p26: Helen Jackson
('p26', 'HJ', 'Helen Jackson', 'F', '70y 6m', '#2468029990019', true, 'en', '', '', '["success","success","pending"]'::JSONB, 'High', 'IP', '48h', '4h left', false, NULL, 'scheduled', '11/13/2025 11:30 AM', NULL, 'Review lab results with patient',
 '[{"label":"Readmission Risk","cls":"ai-tag-risk","icon":"solar:danger-triangle-bold"},{"label":"Needs CCM Plan","cls":"ai-tag-care","icon":"solar:clipboard-heart-bold"}]'::JSONB,
 'enrolled', '07/28/2025', 2, '11/12/25', '11/15/2025', '08/03/2025', '09/03/2025', 'Robin Bang', 'RB', 'Yes', 1, 'updated', '11/01/2025', 'Cardiology Center', 'Atrial fibrillation', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB),

-- p27: David Ortiz
('p27', 'DO', 'David Ortiz', 'M', '54y 1m', '#2468029990020', false, 'es', '', '', '["pending","pending","pending"]'::JSONB, 'Low', 'ED', '7d', '5d 10h left', false, NULL, 'scheduled', '11/17/2025 02:30 PM', NULL, 'Initial outreach – new admission',
 '[{"label":"Substance Use","cls":"ai-tag-risk","icon":"solar:danger-triangle-bold"},{"label":"Mental Health","cls":"ai-tag-care","icon":"solar:clipboard-heart-bold"}]'::JSONB,
 'new', '11/22/2025', 0, NULL, '11/17/2025', '09/08/2025', '10/08/2025', 'Ignacio Beer', 'IB', 'No', 0, 'none', '11/07/2025', 'ER – Harbor', 'Alcohol withdrawal', '[]'::JSONB, '[]'::JSONB, NULL, NULL, NULL, '[]'::JSONB, '[]'::JSONB, '[]'::JSONB);
