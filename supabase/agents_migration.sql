-- ============================================================
-- Agents Table: Schema + Seed Data
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  use_case TEXT,
  version TEXT DEFAULT '1.0',
  voice JSONB,
  last_updated TEXT,
  last_updated_by TEXT,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access on agents" ON agents
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

INSERT INTO agents (id, name, use_case, version, voice, last_updated, last_updated_by, enabled) VALUES
('a1', 'Anna', 'Post-Discharge Follow-Up Calls', '1.0', '{"name":"Erica","gender":"Female","language":"English"}'::JSONB, '03/16/2026', 'Kari Huels', true),
('a2', 'Lexi', 'Geriatric Care Coordination', '5.0', '{"name":"Erica","gender":"Female","language":"English"}'::JSONB, '03/16/2026', 'Stewart Medhurst', true),
('a3', 'Beacon', 'Hypertension Management', '1.0', '{"name":"Ricardo","gender":"Male","language":"Spanish"}'::JSONB, '03/13/2026', 'Victoria Torphy', false),
('a4', 'Atlas', 'Remote Patient Monitoring', '2.0', '{"name":"Erica","gender":"Female","language":"English"}'::JSONB, '03/06/2026', 'Albert Stehr', false),
('a5', 'Nova', 'Mental Health Support', '1.0', '{"name":"Jia","gender":"Female","language":"Chinese"}'::JSONB, '03/03/2026', 'Luis Stracke', true),
('a6', 'Aether', 'Diabetic Retinopathy Screening', '2.0', '{"name":"Erica","gender":"Female","language":"English"}'::JSONB, '03/01/2026', 'Yvette Cronin PhD', true),
('a7', 'Meridian', 'COPD Remote Monitoring', '3.0', '{"name":"Erica","gender":"Female","language":"English"}'::JSONB, '02/23/2026', 'Corey Stamm', false),
('a8', 'Halcyon', 'Post-Surgery Rehab Support', '5.0', '{"name":"Erica","gender":"Female","language":"English"}'::JSONB, '02/18/2026', 'Mr. Tom Torp', true);
