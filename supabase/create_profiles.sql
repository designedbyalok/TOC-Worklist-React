-- ============================================================
-- Profiles table — extends Supabase Auth with custom user data
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  full_name       TEXT,
  role            TEXT DEFAULT 'Viewer',
  department      TEXT,
  practice_location TEXT,
  phone           TEXT,
  status          TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
  avatar_url      TEXT,
  extra_roles     INT DEFAULT 0,
  extra_locations INT DEFAULT 0,
  last_active_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- All authenticated users can read all profiles (needed for user list)
CREATE POLICY "Authenticated users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can insert/update/delete any profile (use service_role for admin ops)
-- Anon access for dev mode
CREATE POLICY "Anon can read all profiles"
  ON profiles FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can insert profiles"
  ON profiles FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update profiles"
  ON profiles FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Anon can delete profiles"
  ON profiles FOR DELETE
  TO anon
  USING (true);

-- Service role has full access (used by Edge Functions)
CREATE POLICY "Service role full access"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      CONCAT(
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        ' ',
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      )
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 5. Auto-update updated_at on profile changes
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- 6. Backfill existing auth users into profiles
INSERT INTO profiles (id, email, full_name)
SELECT
  id,
  email,
  COALESCE(
    raw_user_meta_data->>'full_name',
    CONCAT(
      COALESCE(raw_user_meta_data->>'first_name', ''),
      ' ',
      COALESCE(raw_user_meta_data->>'last_name', '')
    )
  )
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- 7. Create index for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
