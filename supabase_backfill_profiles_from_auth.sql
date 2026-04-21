-- ============================================================
-- Backfill profiles from auth.users
--
-- Problem: after consolidating user_profiles -> profiles, some chat
-- conversations render as "Unknown" because the direct_messages rows
-- reference auth users who never got a profiles row (e.g. users who
-- signed up but never loaded the app, or whose user_profiles entry
-- was missing for some other reason).
--
-- Fix: one-shot insert-only backfill from auth.users for any auth
-- account that still has no profiles row. Uses raw_user_meta_data
-- (where supabase.auth.signUp stores `options.data`) for the name
-- fields when available. Role/status are set to the same safe
-- defaults the app uses on first login.
--
-- Safe to re-run: ON CONFLICT DO NOTHING leaves existing rows alone.
-- ============================================================

INSERT INTO profiles (
    id,
    email,
    first_name,
    last_name,
    full_name,
    status,
    role,
    clinical_roles,
    admin_role,
    updated_at
)
SELECT
    u.id,
    u.email,
    NULLIF(u.raw_user_meta_data->>'first_name', '')                        AS first_name,
    NULLIF(u.raw_user_meta_data->>'last_name',  '')                        AS last_name,
    COALESCE(
        NULLIF(u.raw_user_meta_data->>'full_name', ''),
        TRIM(
            CONCAT_WS(' ',
                NULLIF(u.raw_user_meta_data->>'first_name', ''),
                NULLIF(u.raw_user_meta_data->>'last_name',  '')
            )
        ),
        u.email
    )                                                                      AS full_name,
    'Active'     AS status,
    'Viewer'     AS role,
    '{}'::text[] AS clinical_roles,
    'Employer'   AS admin_role,
    NOW()        AS updated_at
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- Report: count of rows now in profiles vs auth.users — run this separately
-- to confirm everyone made it across.
--
--   SELECT
--     (SELECT COUNT(*) FROM auth.users) AS auth_users,
--     (SELECT COUNT(*) FROM profiles)   AS profiles_rows;
