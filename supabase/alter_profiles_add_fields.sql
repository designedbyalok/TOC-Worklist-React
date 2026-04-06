-- ============================================================
-- Add extended user profile fields
-- Run in Supabase SQL Editor after create_profiles.sql
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS middle_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credentials TEXT[];  -- e.g. {'Dr', 'NP'}
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_role TEXT DEFAULT 'Business/Practice Owner';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS clinical_roles TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locations TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ehr_mapping TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ehr_user TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS licence_states TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fax TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address_line1 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address_line2 TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
