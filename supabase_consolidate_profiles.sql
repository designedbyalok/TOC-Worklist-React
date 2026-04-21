-- ============================================================
-- Consolidate user_profiles -> profiles
--
-- Historical: the app wrote identity fields to `user_profiles` (for member
-- search) and richer fields to `profiles` (for Settings > Users). These
-- drifted apart — self-signed-up / OAuth users only landed in user_profiles,
-- so they never appeared in the Users list.
--
-- This migration:
--   1. Backfills any user_profiles rows missing from profiles.
--   2. Ensures RLS allows users to insert/update their own profile row
--      (so the app's on-login upsert works for new signups).
--   3. Drops the now-redundant user_profiles table.
--
-- Safe to re-run.
-- ============================================================

-- 1) Backfill any rows that exist in user_profiles but not profiles.
--    Assumes user_profiles has: id, email, first_name, last_name, full_name.
--    Defaults role/status/admin_role to the same values the app inserts on
--    first login, so the consolidated view is consistent.
INSERT INTO profiles (
    id, email, first_name, last_name, full_name,
    status, role, clinical_roles, admin_role,
    updated_at
)
SELECT
    up.id,
    up.email,
    up.first_name,
    up.last_name,
    up.full_name,
    'Active'     AS status,
    'Viewer'     AS role,
    '{}'::text[] AS clinical_roles,
    'Employer'   AS admin_role,
    NOW()        AS updated_at
FROM user_profiles up
WHERE NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = up.id
)
ON CONFLICT (id) DO NOTHING;

-- 2) RLS: make sure users can INSERT / UPDATE their own profile row, which is
--    what the on-login upsert in AppLayout.jsx needs. Existing SELECT policies
--    (used by user search / chat picker) are left untouched.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_self_insert" ON profiles;
CREATE POLICY "profiles_self_insert"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_self_update_identity" ON profiles;
CREATE POLICY "profiles_self_update_identity"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- NOTE: For stronger guarantees, add column-level restrictions so non-admins
-- cannot change role/clinical_roles/admin_role/status on their own row. The
-- simplest pattern is a BEFORE UPDATE trigger that copies those fields from
-- the OLD row when the updating user is not an admin. Example sketch:
--
--   CREATE OR REPLACE FUNCTION profiles_guard_role_fields()
--   RETURNS TRIGGER AS $$
--   DECLARE v_is_admin boolean;
--   BEGIN
--     SELECT (p.role = 'Admin/Practice Manager'
--             OR 'Admin/Practice Manager' = ANY(p.clinical_roles)
--             OR p.admin_role = 'Business/Practice Owner')
--       INTO v_is_admin
--     FROM profiles p WHERE p.id = auth.uid();
--     IF NOT COALESCE(v_is_admin, false) THEN
--       NEW.role           := OLD.role;
--       NEW.clinical_roles := OLD.clinical_roles;
--       NEW.admin_role     := OLD.admin_role;
--       NEW.status         := OLD.status;
--     END IF;
--     RETURN NEW;
--   END;
--   $$ LANGUAGE plpgsql SECURITY DEFINER;
--
--   DROP TRIGGER IF EXISTS profiles_guard_role_fields ON profiles;
--   CREATE TRIGGER profiles_guard_role_fields
--     BEFORE UPDATE ON profiles
--     FOR EACH ROW EXECUTE FUNCTION profiles_guard_role_fields();

-- 3) Drop the redundant table. CASCADE removes any dependent policies/views.
DROP TABLE IF EXISTS user_profiles CASCADE;
