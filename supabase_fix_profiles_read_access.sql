-- ============================================================
-- Fix: authenticated users can't read all profiles
--
-- Symptom: after consolidating user_profiles -> profiles, the Messages
-- chat list shows "Unknown" for every conversation and the New Chat
-- user picker is empty, even though the Settings > Users page
-- (queried with the same client) loads the same profiles correctly
-- in some contexts. The common cause: the existing SELECT policy on
-- `profiles` is scoped only to the `anon` role (or is otherwise
-- narrower for `authenticated`), so once a user logs in and the
-- JWT switches them to the `authenticated` role, the reads that
-- MessagesView depends on come back empty without an error.
--
-- This migration drops any restrictive/narrow SELECT policies and
-- installs a single permissive policy that lets any authenticated
-- session read every profile row. Anon reads are left untouched
-- (anon chat pickers still aren't a thing, but nothing is blocking
-- them either).
--
-- Safe to re-run.
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop any pre-existing SELECT policies that may be narrowing access.
-- Adjust names here if your Supabase dashboard uses different ones.
DROP POLICY IF EXISTS "profiles_read_all"                ON profiles;
DROP POLICY IF EXISTS "profiles_read_all_authenticated"  ON profiles;
DROP POLICY IF EXISTS "profiles_select_own"              ON profiles;
DROP POLICY IF EXISTS "profiles_select_authenticated"    ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- Permit every signed-in user to read every profile row.
-- Member/user search and chat picker both need this.
CREATE POLICY "profiles_read_all_authenticated"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

-- Keep the INSERT / UPDATE self-only policies we already installed.
-- (No-op drops + recreates so the file is self-contained.)
DROP POLICY IF EXISTS "profiles_self_insert" ON profiles;
CREATE POLICY "profiles_self_insert"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_self_update_identity" ON profiles;
CREATE POLICY "profiles_self_update_identity"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Diagnostic: after running, check which policies are attached:
--
--   SELECT polname, polcmd, polroles::regrole[], pg_get_expr(polqual, polrelid)
--     FROM pg_policy
--    WHERE polrelid = 'public.profiles'::regclass;
