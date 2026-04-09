-- ============================================================
-- Agent Config Table: Stores Configure tab settings per agent
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS agent_config (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  agent_role TEXT,
  use_case_name TEXT,
  description TEXT,
  system_prompt TEXT,
  tone_of_voice TEXT DEFAULT 'professional',
  voice TEXT DEFAULT 'erica',
  empathy_level INTEGER DEFAULT 75,
  speaking_pace INTEGER DEFAULT 75,
  languages JSONB DEFAULT '["english"]',
  adaptations JSONB DEFAULT '[]',
  selected_policies JSONB DEFAULT '[]',
  population_type TEXT DEFAULT 'worklist',
  selected_worklist TEXT,
  modality TEXT DEFAULT 'voice',
  phone TEXT,
  email TEXT,
  office_hours TEXT,
  goal_ids JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id)
);

ALTER TABLE agent_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access on agent_config" ON agent_config
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER agent_config_updated_at
  BEFORE UPDATE ON agent_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
