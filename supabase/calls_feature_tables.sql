-- =============================================================
-- Migration: calls_feature_tables
-- Moves hardcoded UI config from CallsView.jsx into Supabase:
--   INBOX_ITEMS + CHANNEL_ITEMS  →  call_nav_items
--   CALL_LINES                   →  call_lines
--   CALL_LIST                    →  call_sessions
--   CALLS_ROWS                   →  derived from call_details
--                                   (adds direction + is_bot columns)
-- =============================================================


-- ─────────────────────────────────────────────
-- 1. call_nav_items
--    Left-panel navigation: inbox items + channel items
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.call_nav_items (
  id             TEXT PRIMARY KEY,
  section        TEXT NOT NULL CHECK (section IN ('inbox', 'channel')),
  icon           TEXT,
  label          TEXT NOT NULL,
  is_custom_icon BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.call_nav_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "call_nav_items_read_authenticated"
  ON public.call_nav_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "call_nav_items_read_anon"
  ON public.call_nav_items FOR SELECT
  TO anon
  USING (true);

INSERT INTO public.call_nav_items (id, section, icon, label, is_custom_icon, sort_order) VALUES
  ('all',       'inbox',   'solar:inbox-linear',                 'All Calls',      false, 1),
  ('incoming',  'inbox',   'solar:incoming-call-rounded-linear', 'Incoming',       false, 2),
  ('outgoing',  'inbox',   'solar:outgoing-call-rounded-linear', 'Outgoing',       false, 3),
  ('missed',    'inbox',   NULL,                                 'Missed Calls',   true,  4),
  ('voicemail', 'inbox',   'solar:microphone-linear',            'Voicemail',      false, 5),
  ('starred',   'inbox',   'solar:star-linear',                  'Starred',        false, 6),
  ('archived',  'inbox',   'solar:archive-linear',               'Archived',       false, 7),
  ('agents',    'channel', 'solar:user-speak-linear',            'Calling Agents', false, 1),
  ('support',   'channel', 'solar:phone-calling-linear',         'Support Line',   false, 2),
  ('clinical',  'channel', 'solar:stethoscope-linear',           'Clinical Line',  false, 3)
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────
-- 2. call_lines
--    Phone line dropdown in the conversation panel
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.call_lines (
  id           TEXT PRIMARY KEY,
  label        TEXT NOT NULL,
  phone_number TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.call_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "call_lines_read_authenticated"
  ON public.call_lines FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "call_lines_read_anon"
  ON public.call_lines FOR SELECT
  TO anon
  USING (true);

INSERT INTO public.call_lines (id, label, phone_number, sort_order) VALUES
  ('all',      'All Call Lines',             NULL,             1),
  ('support',  'Support — (581) 555-0101',   '(581) 555-0101', 2),
  ('clinical', 'Clinical — (581) 555-0102',  '(581) 555-0102', 3),
  ('billing',  'Billing — (581) 555-0103',   '(581) 555-0103', 4)
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────
-- 3. call_sessions
--    Middle-panel call list (recent / queued calls)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.call_sessions (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  status     TEXT NOT NULL,
  time       TEXT NOT NULL,
  dir        TEXT NOT NULL CHECK (dir IN ('outgoing', 'incoming', 'missed', 'declined')),
  pinned     BOOLEAN NOT NULL DEFAULT FALSE,
  active     BOOLEAN NOT NULL DEFAULT FALSE,
  patient_id TEXT REFERENCES public.patients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.call_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "call_sessions_read_authenticated"
  ON public.call_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "call_sessions_read_anon"
  ON public.call_sessions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "call_sessions_write_authenticated"
  ON public.call_sessions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO public.call_sessions (id, name, status, time, dir, pinned, active) VALUES
  ('c1',  'Williamy Jammy',    'Call Back',     'Now',   'outgoing', true,  true),
  ('c2',  'Dawn Braun',        'Call Back',     '08:44', 'outgoing', true,  false),
  ('c3',  'Natalie Welch',     'Call Back',     '08:44', 'outgoing', true,  false),
  ('c4',  'Dr. Stacy Quigley', 'Missed Call',   '08:44', 'missed',   false, false),
  ('c5',  'Natalie Welch',     'Answered Call', '08:44', 'incoming', false, false),
  ('c6',  'Toby Quigley',      'Answered Call', '08:44', 'incoming', false, false),
  ('c7',  'Natalie Welch',     'Missed Call',   '08:44', 'missed',   false, false),
  ('c8',  'Natalie Welch',     'Missed Call',   '08:44', 'missed',   false, false),
  ('c9',  'Dawn Braun',        'Missed Call',   '08:44', 'missed',   false, false),
  ('c10', 'Natalie Welch',     'Incoming',      '08:44', 'incoming', false, false),
  ('c11', 'Dr. Stacy Quigley', 'Missed Call',   '08:44', 'missed',   false, false),
  ('c12', 'Natalie Welch',     'Answered Call', '08:44', 'incoming', false, false)
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────
-- 4. Extend call_details
--    Add direction (call direction) and is_bot columns
--    so CALLS_ROWS can be derived from the existing table
-- ─────────────────────────────────────────────
ALTER TABLE public.call_details
  ADD COLUMN IF NOT EXISTS direction TEXT,
  ADD COLUMN IF NOT EXISTS is_bot    BOOLEAN NOT NULL DEFAULT FALSE;

-- Seed direction values based on call_type heuristic
UPDATE public.call_details
  SET direction = 'outgoing'
  WHERE direction IS NULL AND call_type IN ('completed', 'ongoing');

UPDATE public.call_details
  SET direction = 'missed'
  WHERE direction IS NULL AND call_type = 'voicemail';

-- Mark Anna / Automation as bot agents
UPDATE public.call_details
  SET is_bot = true
  WHERE agent_name IN ('Anna', 'Automation');
