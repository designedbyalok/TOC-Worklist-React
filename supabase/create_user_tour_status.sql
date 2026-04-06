-- Create user_tour_status table for cross-device tour persistence
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/osnihfqqrcchsaqhagcx/sql

CREATE TABLE IF NOT EXISTS user_tour_status (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    UUID NOT NULL,
  tour_id    TEXT NOT NULL,
  seen_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, tour_id)
);

-- Enable RLS
ALTER TABLE user_tour_status ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own tour status
CREATE POLICY "Users can read own tour status"
  ON user_tour_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tour status"
  ON user_tour_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tour status"
  ON user_tour_status FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tour status"
  ON user_tour_status FOR DELETE
  USING (auth.uid() = user_id);

-- Allow anon access for dev mode (no auth)
CREATE POLICY "Anon can read all tour status"
  ON user_tour_status FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can insert tour status"
  ON user_tour_status FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can upsert tour status"
  ON user_tour_status FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Anon can delete tour status"
  ON user_tour_status FOR DELETE
  TO anon
  USING (true);
