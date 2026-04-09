-- P360 Patient Profile data
-- Stores extended clinical profile data separate from the patients table
-- Run in Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS p360_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL UNIQUE,

  -- Banner Row 1: Profile & Metrics
  profile_type TEXT DEFAULT 'Central Profile',
  health_plan_name TEXT,
  health_plan_id TEXT,
  health_plan_desc TEXT,
  consent_given INTEGER DEFAULT 0,
  consent_total INTEGER DEFAULT 4,
  acuity TEXT DEFAULT 'Low',
  raf_score NUMERIC(6,3),
  raf_change NUMERIC(4,2),
  next_appointment_date TEXT,
  last_contact_type TEXT,
  last_contact_days INTEGER,
  programs JSONB DEFAULT '[]'::jsonb,

  -- Banner Row 2: Patient type & Condition tags
  patient_type TEXT DEFAULT 'New Patient',
  condition_tags JSONB DEFAULT '[]'::jsonb,

  -- Expanded: Demographic Details
  location TEXT,
  location_count INTEGER DEFAULT 0,
  languages JSONB DEFAULT '[]'::jsonb,
  language_preference TEXT,
  emails JSONB DEFAULT '[]'::jsonb,
  plan_numbers_primary JSONB DEFAULT '[]'::jsonb,
  plan_numbers_secondary JSONB DEFAULT '[]'::jsonb,

  -- Expanded: Health Status
  chronic_conditions JSONB DEFAULT '[]'::jsonb,
  recent_vitals JSONB,
  opted_out_comms JSONB DEFAULT '[]'::jsonb,

  -- Expanded: Family & Caregiver
  family_caregiver_count INTEGER DEFAULT 0,
  family_members JSONB DEFAULT '[]'::jsonb,
  care_team JSONB DEFAULT '[]'::jsonb,
  care_team_profile_type TEXT DEFAULT 'Central Profile',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE p360_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON p360_profiles FOR ALL USING (true) WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_p360_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER p360_profiles_updated_at
  BEFORE UPDATE ON p360_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_p360_profiles_updated_at();

-- Seed data for existing patients
INSERT INTO p360_profiles (patient_id, profile_type, health_plan_name, health_plan_id, health_plan_desc, consent_given, consent_total, acuity, raf_score, raf_change, next_appointment_date, last_contact_type, last_contact_days, programs, patient_type, condition_tags, location, location_count, languages, language_preference, emails, plan_numbers_primary, plan_numbers_secondary, chronic_conditions, recent_vitals, opted_out_comms, family_caregiver_count, family_members, care_team, care_team_profile_type)
VALUES
-- p1 - Ralph Halvorson
('p1', 'Central Profile', 'JADE Health', '#94949494WIWI', 'SCAN Insurance Handler', 2, 4, 'High-Risk', 4.234, 0.5, '07/23/2025', 'UTR', 45, '["AWV", "HIU"]'::jsonb, 'New Patient', '["Diabetes", "Hypertension", "Needs Transportation"]'::jsonb, 'Los Angeles, CA', 2, '["English", "Chinese"]'::jsonb, 'English', '["annetteBrave09@email.com"]'::jsonb, '["(123) 456-7890", "(234) 567-8901"]'::jsonb, '["(456) 789-0123", "(345) 678-9012"]'::jsonb, '["Diabetes Type 1", "Hypertension"]'::jsonb, '{"date": "05/02/25", "bp": "138/85 mmHg", "weight": "165 lbs", "pulse": "78 bpm", "hba1c": "7.2%"}'::jsonb, '["(581) 824-7666 (Call)", "(581) 824-7667 (Call)"]'::jsonb, 2, '[{"name": "John Lane", "relation": "Brother", "initials": "JL"}, {"name": "Nina Rogers", "relation": "Sister (Caregiver)", "initials": "NR"}]'::jsonb, '[{"name": "Katy Moss", "role": "Plan PCP", "title": "Physician", "initials": "KM"}, {"name": "Willie Murazik", "role": "", "title": "Business/Practice Owner", "initials": "WM"}]'::jsonb, 'Central Profile'),

-- p2 - Terri Schulist
('p2', 'Central Profile', 'JADE Health', '#84838383TSCH', 'SCAN Insurance Handler', 3, 4, 'Medium', 3.150, 0.2, '08/15/2025', 'Attended', 12, '["TCM", "SNP"]'::jsonb, 'Existing Patient', '["COPD", "Asthma"]'::jsonb, 'New York, NY', 1, '["English", "Spanish"]'::jsonb, 'Spanish', '["terri.schulist@email.com"]'::jsonb, '["(212) 555-0101"]'::jsonb, '[]'::jsonb, '["COPD", "Asthma"]'::jsonb, '{"date": "04/28/25", "bp": "125/80 mmHg", "weight": "148 lbs", "pulse": "72 bpm", "hba1c": "N/A"}'::jsonb, '[]'::jsonb, 1, '[{"name": "Maria Schulist", "relation": "Daughter", "initials": "MS"}]'::jsonb, '[{"name": "Dr. James Chen", "role": "Plan PCP", "title": "Physician", "initials": "JC"}]'::jsonb, 'Central Profile');
