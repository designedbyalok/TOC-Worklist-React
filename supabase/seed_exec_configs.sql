-- ═══════════════════════════════════════════════════════════
-- Seed Executive Dashboard config data into analytics_configs
-- Run after analytics_migration.sql
-- ═══════════════════════════════════════════════════════════

-- Cost by Setting inline cards
INSERT INTO analytics_configs (tenant_id, config_key, period, config_data)
VALUES ('default', 'exec_cost_by_setting_inline', '2026-03', '{
  "items": [
    { "label": "IP", "value": "$318", "color": "#0284C7", "note": "↑ $23 over" },
    { "label": "OP", "value": "$142", "color": "#7DD3FC", "note": "✓ Benching" },
    { "label": "ED", "value": "$88", "color": "#B45309", "note": "↑ $8 over" },
    { "label": "Rx", "value": "$163", "color": "#DC2626", "note": "↑ $23 over" },
    { "label": "PAC", "value": "$106", "color": "#059669", "note": "✓ $9 under" },
    { "label": "Prof", "value": "$205", "color": "#7C3AED", "note": "✓ $15 under" }
  ]
}'::jsonb)
ON CONFLICT (tenant_id, config_key, period)
DO UPDATE SET config_data = EXCLUDED.config_data, updated_at = now();

-- Savings trajectory (12 monthly values in $M)
INSERT INTO analytics_configs (tenant_id, config_key, period, config_data)
VALUES ('default', 'exec_savings_trajectory', '2026-03', '{
  "data_points": [0, 0.1, 0.2, 0.35, 0.5, 0.62, 0.75, 0.9, 1.0, 1.1, 1.2, 1.32]
}'::jsonb)
ON CONFLICT (tenant_id, config_key, period)
DO UPDATE SET config_data = EXCLUDED.config_data, updated_at = now();

-- Care program command center
INSERT INTO analytics_configs (tenant_id, config_key, period, config_data)
VALUES ('default', 'exec_care_programs', '2026-03', '{
  "rows": [
    { "abbr": "CCM", "members": "4,823", "saved": "$1,620K", "roi": "3.6x", "status": "green", "alert": "312 eligible members not yet enrolled" },
    { "abbr": "TCM", "members": "2,156", "saved": "$980K", "roi": "3.5x", "status": "green", "alert": "47 overdue TCM contacts" },
    { "abbr": "TOC-IP", "members": "1,284", "saved": "$740K", "roi": "3.9x", "status": "amber", "alert": "24 readmissions this month" },
    { "abbr": "TOC-ED", "members": "1,842", "saved": "$540K", "roi": "3.0x", "status": "red", "alert": "221 high-ED utilizers (3+/yr)" },
    { "abbr": "Quality", "members": "8,420", "saved": "$840K", "roi": "3.8x", "status": "green", "alert": "847 members unscheduled for AWV" },
    { "abbr": "AWV", "members": "5,120", "saved": "$620K", "roi": "3.9x", "status": "red", "alert": "847 members overdue for AWV" },
    { "abbr": "Risk Coding", "members": "5,280", "saved": "$2,100K", "roi": "5.5x", "status": "red", "alert": "962 open HCC suspects" },
    { "abbr": "HRA", "members": "3,840", "saved": "$410K", "roi": "4.6x", "status": "red", "alert": "4,580 eligible without HRA" }
  ]
}'::jsonb)
ON CONFLICT (tenant_id, config_key, period)
DO UPDATE SET config_data = EXCLUDED.config_data, updated_at = now();

-- Executive quality summary progress bars
INSERT INTO analytics_progress_bars (tenant_id, bar_key, period, items)
VALUES ('default', 'executive_quality_summary', '2026-03', '[
  { "label": "AWV Completion", "value": "61%", "pct": 61, "color": "amber", "sub": "Target 80% · 847 unscheduled" },
  { "label": "Diabetes HbA1c Control", "value": "72%", "pct": 72, "color": "teal", "sub": "Target 70% ✓" },
  { "label": "BP Control (<140/90)", "value": "64%", "pct": 64, "color": "purple", "sub": "Target 70%" },
  { "label": "Colorectal Screening", "value": "58%", "pct": 58, "color": "red", "sub": "Target 65%" },
  { "label": "Depression Screening", "value": "83%", "pct": 83, "color": "green", "sub": "Target 80% ✓" }
]'::jsonb)
ON CONFLICT (tenant_id, bar_key, period)
DO UPDATE SET items = EXCLUDED.items, updated_at = now();
