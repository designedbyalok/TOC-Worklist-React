-- ============================================================
-- all_patients table
-- Unified patient directory: combines TOC worklist members + HCC members
-- into a single searchable registry with insurance, PCP and
-- care-program metadata.
--
-- Run in Supabase SQL editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS all_patients (
    -- Identity
    id                      TEXT PRIMARY KEY,
    source                  TEXT CHECK (source IN ('toc', 'hcc', 'manual')) DEFAULT 'manual',
    member_id               TEXT,
    name                    TEXT NOT NULL,
    initials                TEXT,
    gender                  TEXT CHECK (gender IN ('M', 'F', 'O')),
    age                     INT,
    language                TEXT DEFAULT 'en',

    -- Contact info
    email                   TEXT,
    phone                   TEXT,

    -- Location
    city                    TEXT,
    state                   TEXT,
    location                TEXT,

    -- Tags (free-form accent-colored badges)
    tags                    JSONB DEFAULT '[]'::jsonb,

    -- Attributes (insurance / demographics)
    group_number            TEXT,
    family_id               TEXT,
    unique_member_id        TEXT,
    coverage_type           TEXT,
    plan_code               TEXT,
    employee_ssn            TEXT,
    member_ssn              TEXT,
    subscriber_hire_date    DATE,
    tpa                     TEXT,

    -- Clinical
    chronic_conditions      JSONB DEFAULT '[]'::jsonb,
    pcp                     TEXT,
    pcp_initials            TEXT,
    last_visit              DATE,
    active_care_program     TEXT,

    -- Program consents (tri-state: true / false / NULL = unknown)
    ccm_consent             BOOLEAN,
    apcm_consent            BOOLEAN,

    -- Assignment
    assignee                TEXT,
    assignee_initials       TEXT,

    -- Audit
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common filters / searches
CREATE INDEX IF NOT EXISTS all_patients_name_idx      ON all_patients (name);
CREATE INDEX IF NOT EXISTS all_patients_member_id_idx ON all_patients (member_id);
CREATE INDEX IF NOT EXISTS all_patients_source_idx    ON all_patients (source);
CREATE INDEX IF NOT EXISTS all_patients_pcp_idx       ON all_patients (pcp);
CREATE INDEX IF NOT EXISTS all_patients_tags_gin      ON all_patients USING GIN (tags);
CREATE INDEX IF NOT EXISTS all_patients_chronic_gin   ON all_patients USING GIN (chronic_conditions);

-- Keep updated_at fresh on every update
CREATE OR REPLACE FUNCTION all_patients_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS all_patients_touch ON all_patients;
CREATE TRIGGER all_patients_touch
    BEFORE UPDATE ON all_patients
    FOR EACH ROW
    EXECUTE FUNCTION all_patients_touch_updated_at();

-- ============================================================
-- Row Level Security
-- Mirrors the open-access policy used by patients / hcc_members.
-- Tighten later if the app grows per-user scoping.
-- ============================================================
ALTER TABLE all_patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "all_patients_read"  ON all_patients;
DROP POLICY IF EXISTS "all_patients_write" ON all_patients;

CREATE POLICY "all_patients_read"
    ON all_patients FOR SELECT
    USING (true);

CREATE POLICY "all_patients_write"
    ON all_patients FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- Seed data (dummy) — 20 rows blending TOC + HCC archetypes
-- Safe to re-run: ON CONFLICT DO NOTHING.
-- ============================================================
INSERT INTO all_patients (
    id, source, member_id, name, initials, gender, age, language,
    email, phone, city, state, location,
    tags,
    group_number, family_id, unique_member_id, coverage_type, plan_code,
    employee_ssn, member_ssn, subscriber_hire_date, tpa,
    chronic_conditions, pcp, pcp_initials, last_visit, active_care_program,
    ccm_consent, apcm_consent, assignee, assignee_initials
) VALUES
    ('ap-001', 'toc', '2468029990010', 'Carlos Hernandez',  'CH', 'M', 69, 'es',
     'carlos.h@fold.health', '(718) 555-0110', 'Queens',      'NY', 'Queens, NY',
     '["LACE High","Diabetes"]'::jsonb,
     'G100210', 'F10021', 'U100021001', 'HMO', 'PL2210', '***-**-1101', '***-**-2101', '2012-03-15', 'Aetna',
     '["Diabetes","Hypertension"]'::jsonb, 'Dr. Sarah Chen', 'SC', '2025-10-18', 'CCM',
     TRUE,  FALSE, 'Robin Bang', 'RB'),

    ('ap-002', 'toc', '2468029990016', 'William Davis',      'WD', 'M', 77, 'en',
     'william.d@fold.health', '(201) 555-0122', 'Newark',     'NJ', 'Newark, NJ',
     '["LACE High","CHF"]'::jsonb,
     'G100211', 'F10022', 'U100021002', 'Medicare Advantage', 'PL3310', '***-**-1102', '***-**-2102', '2010-06-01', 'BCBS',
     '["CHF","CKD"]'::jsonb, 'Dr. James Park', 'JP', '2025-11-02', 'APCM',
     TRUE,  TRUE,  'Robin Bang', 'RB'),

    ('ap-003', 'toc', '2468029990002', 'James Rivera',       'JR', 'M', 72, 'en',
     'james.r@fold.health', '(347) 555-0133', 'Brooklyn',    'NY', 'Brooklyn, NY',
     '["LACE High","Post-Discharge"]'::jsonb,
     'G100212', 'F10023', 'U100021003', 'PPO', 'PL4410', '***-**-1103', '***-**-2103', '2014-09-20', 'UHC',
     '["Hypertension"]'::jsonb, 'Dr. Elena Rodriguez', 'ER', '2025-11-10', 'TCM',
     NULL,  FALSE, 'You',        'YO'),

    ('ap-004', 'hcc', '2468029989898', 'Ralph Halvorson',    'RH', 'M', 52, 'en',
     'ralph.h@fold.health', '(914) 555-0144', 'Yonkers',     'NY', 'Yonkers, NY',
     '["Risk High","RAF Impact"]'::jsonb,
     'G100213', 'F10024', 'U100021004', 'EPO', 'PL5510', '***-**-1104', '***-**-2104', '2008-11-11', 'Humana',
     '["Diabetes","COPD","Obesity"]'::jsonb, 'Dr. Michael Lee', 'ML', '2025-09-28', 'RPM',
     TRUE,  NULL,  'Ignacio Beer', 'IB'),

    ('ap-005', 'hcc', '2468029989899', 'Terri Schulist',     'TS', 'F', 60, 'es',
     'terri.s@fold.health', '(718) 555-0155', 'Bronx',       'NY', 'Bronx, NY',
     '["Risk High"]'::jsonb,
     'G100214', 'F10025', 'U100021005', 'HMO', 'PL6610', '***-**-1105', '***-**-2105', '2015-02-04', 'Cigna',
     '["Depression","Asthma"]'::jsonb, 'Dr. Priya Patel', 'PP', '2025-08-14', 'BHI',
     FALSE, NULL,  'Robin Bang', 'RB'),

    ('ap-006', 'hcc', '2468029989900', 'Annette Brave',      'AB', 'F', 48, 'yue',
     'annette.b@fold.health', '(347) 555-0166', 'Manhattan', 'NY', 'Manhattan, NY',
     '["Risk Rising"]'::jsonb,
     'G100215', 'F10026', 'U100021006', 'PPO', 'PL7710', '***-**-1106', '***-**-2106', '2013-07-07', 'Anthem',
     '["Hypertension"]'::jsonb, 'Dr. David Kim', 'DK', '2025-10-01', 'CCM',
     TRUE,  TRUE,  'You',        'YO'),

    ('ap-007', 'hcc', '2468029989901', 'Glenn Bauch',        'GB', 'M', 71, 'zh',
     'glenn.b@fold.health', '(646) 555-0177', 'Jersey City', 'NJ', 'Jersey City, NJ',
     '["Risk Medium"]'::jsonb,
     'G100216', 'F10027', 'U100021007', 'Medicare Advantage', 'PL8810', '***-**-1107', '***-**-2107', '2009-04-22', 'Aetna',
     '["CHF","CKD","Diabetes"]'::jsonb, 'Dr. Sarah Chen', 'SC', '2025-11-18', 'APCM',
     NULL,  TRUE,  'Ignacio Beer', 'IB'),

    ('ap-008', 'hcc', '2468029989902', 'Marcus Ziemann',     'MZ', 'M', 58, 'en',
     'marcus.z@fold.health', '(203) 555-0188', 'Stamford',   'CT', 'Stamford, CT',
     '["Risk Medium"]'::jsonb,
     'G100217', 'F10028', 'U100021008', 'HMO', 'PL9910', '***-**-1108', '***-**-2108', '2011-12-30', 'BCBS',
     '["Hypertension","Obesity"]'::jsonb, 'Dr. James Park', 'JP', '2025-10-25', 'CCM',
     TRUE,  FALSE, 'You',        'YO'),

    ('ap-009', 'hcc', '2468029989903', 'Ms. Lloyd Pagac',    'LP', 'F', 65, 'es',
     'lloyd.p@fold.health',  '(973) 555-0199', 'Paterson',   'NJ', 'Paterson, NJ',
     '["Risk Low"]'::jsonb,
     'G100218', 'F10029', 'U100021009', 'PPO', 'PL1010', '***-**-1109', '***-**-2109', '2016-05-18', 'UHC',
     '["Asthma"]'::jsonb, 'Dr. Elena Rodriguez', 'ER', '2025-09-11', 'RPM',
     FALSE, FALSE, 'You',        'YO'),

    ('ap-010', 'hcc', '2468029989904', 'Kendra Crona',       'KC', 'F', 44, 'en',
     'kendra.c@fold.health', '(718) 555-0200', 'Queens',     'NY', 'Queens, NY',
     '["Risk Low"]'::jsonb,
     'G100219', 'F10030', 'U100021010', 'EPO', 'PL1111', '***-**-1110', '***-**-2110', '2018-08-04', 'Humana',
     '["Depression"]'::jsonb, 'Dr. Michael Lee', 'ML', '2025-11-05', 'BHI',
     TRUE,  NULL,  'Ignacio Beer', 'IB'),

    ('ap-011', 'toc', '2468029990001', 'Diana Welch',        'DW', 'F', 55, 'en',
     'diana.w@fold.health', '(914) 555-0211', 'White Plains','NY', 'White Plains, NY',
     '["LACE High"]'::jsonb,
     'G100220', 'F10031', 'U100021011', 'HMO', 'PL1212', '***-**-1111', '***-**-2111', '2014-01-17', 'Cigna',
     '["Hypertension","Diabetes"]'::jsonb, 'Dr. Priya Patel', 'PP', '2025-10-22', 'CCM',
     TRUE,  TRUE,  'Robin Bang', 'RB'),

    ('ap-012', 'toc', '2468029990003', 'Sandra Nguyen',      'SN', 'F', 38, 'vi',
     'sandra.n@fold.health', '(516) 555-0222', 'Hempstead',  'NY', 'Hempstead, NY',
     '["LACE Medium"]'::jsonb,
     'G100221', 'F10032', 'U100021012', 'PPO', 'PL1313', '***-**-1112', '***-**-2112', '2019-10-09', 'Anthem',
     '["Asthma"]'::jsonb, 'Dr. David Kim', 'DK', '2025-09-30', 'TCM',
     NULL,  FALSE, 'You',        'YO'),

    ('ap-013', 'toc', '2468029990004', 'Peter Kim',          'PK', 'M', 62, 'ko',
     'peter.k@fold.health', '(201) 555-0233', 'Hoboken',     'NJ', 'Hoboken, NJ',
     '["LACE Low"]'::jsonb,
     'G100222', 'F10033', 'U100021013', 'Medicare Advantage', 'PL1414', '***-**-1113', '***-**-2113', '2010-03-05', 'Aetna',
     '["Hypertension"]'::jsonb, 'Dr. Sarah Chen', 'SC', '2025-11-14', 'APCM',
     TRUE,  TRUE,  'Robin Bang', 'RB'),

    ('ap-014', 'toc', '2468029990005', 'Maria Lopez',        'ML', 'F', 57, 'es',
     'maria.l@fold.health', '(347) 555-0244', 'Brooklyn',    'NY', 'Brooklyn, NY',
     '["LACE High"]'::jsonb,
     'G100223', 'F10034', 'U100021014', 'HMO', 'PL1515', '***-**-1114', '***-**-2114', '2013-02-20', 'BCBS',
     '["Diabetes","CHF"]'::jsonb, 'Dr. James Park', 'JP', '2025-10-12', 'CCM',
     TRUE,  FALSE, 'Ignacio Beer', 'IB'),

    ('ap-015', 'toc', '2468029990006', 'Brian Thompson',     'BT', 'M', 49, 'en',
     'brian.t@fold.health', '(718) 555-0255', 'Queens',      'NY', 'Queens, NY',
     '["LACE Low"]'::jsonb,
     'G100224', 'F10035', 'U100021015', 'EPO', 'PL1616', '***-**-1115', '***-**-2115', '2017-06-28', 'UHC',
     '["Obesity"]'::jsonb, 'Dr. Elena Rodriguez', 'ER', '2025-08-29', 'RPM',
     FALSE, NULL,  'You',        'YO'),

    ('ap-016', 'hcc', '2468029989905', 'Helen Jackson',      'HJ', 'F', 70, 'en',
     'helen.j@fold.health', '(914) 555-0266', 'Yonkers',     'NY', 'Yonkers, NY',
     '["Risk High"]'::jsonb,
     'G100225', 'F10036', 'U100021016', 'Medicare Advantage', 'PL1717', '***-**-1116', '***-**-2116', '2008-09-01', 'Humana',
     '["COPD","CHF"]'::jsonb, 'Dr. Michael Lee', 'ML', '2025-11-20', 'APCM',
     TRUE,  TRUE,  'Robin Bang', 'RB'),

    ('ap-017', 'hcc', '2468029989906', 'Lisa Brown',         'LB', 'F', 63, 'en',
     'lisa.b@fold.health', '(973) 555-0277', 'Paterson',     'NJ', 'Paterson, NJ',
     '["Risk Rising"]'::jsonb,
     'G100226', 'F10037', 'U100021017', 'HMO', 'PL1818', '***-**-1117', '***-**-2117', '2012-11-11', 'Cigna',
     '["Hypertension","Depression"]'::jsonb, 'Dr. Priya Patel', 'PP', '2025-09-17', 'BHI',
     NULL,  FALSE, 'You',        'YO'),

    ('ap-018', 'toc', '2468029990007', 'Elena Garcia',       'EG', 'F', 74, 'es',
     'elena.g@fold.health', '(718) 555-0288', 'Bronx',       'NY', 'Bronx, NY',
     '["LACE High"]'::jsonb,
     'G100227', 'F10038', 'U100021018', 'Medicare Advantage', 'PL1919', '***-**-1118', '***-**-2118', '2009-05-05', 'Anthem',
     '["Diabetes","CKD"]'::jsonb, 'Dr. David Kim', 'DK', '2025-10-06', 'CCM',
     TRUE,  TRUE,  'Ignacio Beer', 'IB'),

    ('ap-019', 'hcc', '2468029989907', 'Oscar Rivera',       'OR', 'M', 53, 'es',
     'oscar.r@fold.health', '(201) 555-0299', 'Jersey City', 'NJ', 'Jersey City, NJ',
     '["Risk Medium"]'::jsonb,
     'G100228', 'F10039', 'U100021019', 'PPO', 'PL2020', '***-**-1119', '***-**-2119', '2015-08-24', 'Aetna',
     '["Hypertension"]'::jsonb, 'Dr. Sarah Chen', 'SC', '2025-11-01', 'TCM',
     TRUE,  NULL,  'Robin Bang', 'RB'),

    ('ap-020', 'hcc', '2468029989908', 'Nina Patel',         'NP', 'F', 41, 'hi',
     'nina.p@fold.health', '(347) 555-0300', 'Manhattan',    'NY', 'Manhattan, NY',
     '["Risk Low"]'::jsonb,
     'G100229', 'F10040', 'U100021020', 'EPO', 'PL2121', '***-**-1120', '***-**-2120', '2020-01-10', 'BCBS',
     '["Asthma"]'::jsonb, 'Dr. James Park', 'JP', '2025-10-28', 'RPM',
     FALSE, FALSE, 'You',        'YO')
ON CONFLICT (id) DO NOTHING;
