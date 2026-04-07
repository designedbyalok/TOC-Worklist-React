-- Appointment Types and Appointments tables
-- Run in Supabase Dashboard > SQL Editor

-- ── Appointment Types ──
CREATE TABLE IF NOT EXISTS appointment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  mode TEXT,
  duration TEXT,
  color TEXT NOT NULL DEFAULT '#8C5AE2',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE appointment_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON appointment_types FOR ALL USING (true) WITH CHECK (true);

-- Seed default appointment types
INSERT INTO appointment_types (name, code, mode, duration, color) VALUES
  ('Annual Wellness Visit', 'AWV', 'In-person', '60 min', '#D9A50B'),
  ('Follow-up Appointment', 'Routine', 'In-person/Virtual', '15-30 min', '#8C5AE2'),
  ('Specialty Consultation', 'Routine', 'In-person', '45 min', '#009B53'),
  ('Telehealth Consultation', 'Routine', 'Virtual', '30 min', '#145ECC'),
  ('Lab Results Discussion', 'Routine', 'Virtual', '15 min', '#009B53');

-- ── Appointments ──
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT,
  patient_name TEXT,
  appointment_type_id UUID REFERENCES appointment_types(id),
  appointment_type_name TEXT,
  mode TEXT,
  location TEXT,
  primary_user TEXT,
  secondary_users JSONB DEFAULT '[]'::jsonb,
  date TEXT NOT NULL,
  time_start TEXT NOT NULL,
  time_end TEXT,
  reason_for_visit TEXT,
  member_instruction TEXT,
  staff_instruction TEXT,
  require_rsvp BOOLEAN DEFAULT false,
  recurring BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Scheduled',
  calendar_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON appointments FOR ALL USING (true) WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();
