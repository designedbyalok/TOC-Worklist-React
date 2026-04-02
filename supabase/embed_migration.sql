-- ============================================================
-- Embedded Components: Domains, Components, and Audit Log
-- ============================================================

-- Domain Registry
CREATE TABLE IF NOT EXISTS embed_domains (
  id SERIAL PRIMARY KEY,
  vendor TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'Internal',
  hipaa TEXT NOT NULL DEFAULT 'Pending BAA',
  enabled BOOLEAN NOT NULL DEFAULT true,
  added_date TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE embed_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for embed_domains" ON embed_domains FOR ALL USING (true);

-- Component Library
CREATE TABLE IF NOT EXISTS embed_components (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT DEFAULT '',
  domain_id INTEGER REFERENCES embed_domains(id) ON DELETE SET NULL,
  domain TEXT,
  surfaces JSONB DEFAULT '[]',
  placements JSONB DEFAULT '{}',
  web_config JSONB DEFAULT '{}',
  sidecar_config JSONB DEFAULT '{}',
  mobile_config JSONB DEFAULT '{}',
  url TEXT DEFAULT '',
  staging_url TEXT DEFAULT '',
  token_lifetime INTEGER DEFAULT 5,
  context_fields JSONB DEFAULT '[]',
  visible_to TEXT DEFAULT 'All providers',
  activation TEXT DEFAULT 'always',
  condition TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  previewed BOOLEAN NOT NULL DEFAULT false,
  domain_removed BOOLEAN NOT NULL DEFAULT false,
  errors_24h INTEGER DEFAULT 0,
  last_loaded TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE embed_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for embed_components" ON embed_components FOR ALL USING (true);

-- Audit Log (shared across entity types)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,       -- 'Domain' | 'Component'
  entity_id INTEGER NOT NULL,
  entity_name TEXT NOT NULL,
  action TEXT NOT NULL,            -- 'created' | 'updated' | 'deleted' | 'enabled' | 'disabled' | 'previewed'
  user_name TEXT NOT NULL DEFAULT 'Current User',
  details TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for audit_logs" ON audit_logs FOR ALL USING (true);

-- Index for fast audit log lookups by entity
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs (created_at DESC);
