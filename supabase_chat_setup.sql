-- ============================================================
-- Chat Platform Setup — run in Supabase SQL Editor
-- ============================================================

-- 1. user_profiles: public mirror of auth.users for chat
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name  TEXT,
  full_name  TEXT,
  email      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.user_profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_insert" ON public.user_profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update" ON public.user_profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- 2. direct_messages: one-to-one messages between users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content      TEXT        NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  read_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS dm_sender_idx    ON public.direct_messages (sender_id);
CREATE INDEX IF NOT EXISTS dm_recipient_idx ON public.direct_messages (recipient_id);
CREATE INDEX IF NOT EXISTS dm_created_idx   ON public.direct_messages (created_at DESC);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dm_select" ON public.direct_messages
  FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "dm_insert" ON public.direct_messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "dm_update" ON public.direct_messages
  FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid());

-- 3. Enable Realtime for direct_messages
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
