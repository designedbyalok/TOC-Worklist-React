-- Sticky Notes for P360 Patient Profile
-- Reusable notes attached to patients, with audit history

CREATE TABLE IF NOT EXISTS sticky_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  text TEXT NOT NULL DEFAULT '',
  author_name TEXT,
  author_date TIMESTAMPTZ DEFAULT now(),
  ehr_profile TEXT DEFAULT 'Central Profile',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sticky_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON sticky_notes FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS sticky_note_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sticky_note_id UUID REFERENCES sticky_notes(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL,
  author_name TEXT,
  action TEXT DEFAULT 'added a Note',
  note_text TEXT,
  ehr_instance TEXT DEFAULT 'Central Profile',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sticky_note_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON sticky_note_history FOR ALL USING (true) WITH CHECK (true);

-- Auto-update updated_at on sticky_notes
CREATE OR REPLACE FUNCTION update_sticky_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sticky_notes_updated_at
  BEFORE UPDATE ON sticky_notes FOR EACH ROW
  EXECUTE FUNCTION update_sticky_notes_updated_at();

-- Seed data
INSERT INTO sticky_notes (patient_id, text, author_name, author_date, ehr_profile)
VALUES
('p1', 'Exercise caution when discussing family matters, as mentioning parents can potentially trigger strong emotions or be sensitive for individuals with a history of heart problems in their family. It''s important to create a safe and considerate environment for everyone involved', 'Eva Jones', '2023-09-18 09:30:00', 'Central Profile'),
('p1', 'Patient has been showing good signs of adherence since last week. Needs some inspiration', 'Richard William', '2023-09-18 09:30:00', 'APC');

INSERT INTO sticky_note_history (sticky_note_id, patient_id, author_name, action, note_text, ehr_instance, created_at)
SELECT id, 'p1', 'Ivy Ralph', 'Updated a Note', 'Patient''s BP at the start of goal tracking was 145/90. Initial focus to be on lifestyle adjustments before considering medication changes.', 'Central Profile', '2025-01-10 17:00:00'
FROM sticky_notes WHERE patient_id = 'p1' LIMIT 1;

INSERT INTO sticky_note_history (sticky_note_id, patient_id, author_name, action, note_text, ehr_instance, created_at)
SELECT id, 'p1', 'Robert Langdon', 'Updated a Note', 'The patient needed a detailed care plan for CKD, emphasizing medication, check-ups, diet changes, and physical therapy for optimal recovery.', 'Central Profile', '2025-01-10 17:00:00'
FROM sticky_notes WHERE patient_id = 'p1' LIMIT 1;

INSERT INTO sticky_note_history (sticky_note_id, patient_id, author_name, action, note_text, ehr_instance, created_at)
SELECT id, 'p1', 'Robert Langdon', 'added a Note', 'The patient needed a detailed care plan for CKD, emphasizing medication, check-ups, diet changes, and physical therapy for optimal recovery.', 'Central Profile', '2025-01-10 17:00:00'
FROM sticky_notes WHERE patient_id = 'p1' LIMIT 1;
