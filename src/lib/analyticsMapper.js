// Maps snake_case DB rows to camelCase JS objects for analytics tables
// Follows the same pattern as patientMapper.js

// ─── KPI Row ────────────────────────────────────────────────
export function kpiRowToJs(row) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    viewKey: row.view_key,
    period: row.period,
    kpis: row.kpis || [],
    insight: row.insight || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Time Series Row ────────────────────────────────────────
export function tsRowToJs(row) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    seriesKey: row.series_key,
    period: row.period,
    label: row.label,
    dataPoints: row.data_points || [],
    meta: row.meta || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Table Row ──────────────────────────────────────────────
export function tableRowToJs(row) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    tableKey: row.table_key,
    period: row.period,
    columns: row.columns || [],
    rows: row.rows || [],
    meta: row.meta || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Progress Bar Row ───────────────────────────────────────
export function barRowToJs(row) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    barKey: row.bar_key,
    period: row.period,
    items: row.items || [],
    meta: row.meta || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Config Row ─────────────────────────────────────────────
export function configRowToJs(row) {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    configKey: row.config_key,
    period: row.period,
    configData: row.config_data || {},
    meta: row.meta || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Group Time Series ──────────────────────────────────────
// Takes an array of time series rows and groups them by series_key
// Returns { [seriesKey]: dataPoints[] }
export function groupTimeSeries(rows) {
  const grouped = {};
  for (const row of rows) {
    const mapped = tsRowToJs(row);
    grouped[mapped.seriesKey] = mapped.dataPoints;
  }
  return grouped;
}

// ─── Helpers: index KPIs by view_key ────────────────────────
export function indexKpisByView(rows) {
  const indexed = {};
  for (const row of rows) {
    const mapped = kpiRowToJs(row);
    indexed[mapped.viewKey] = {
      kpis: mapped.kpis,
      insight: mapped.insight,
    };
  }
  return indexed;
}

// ─── Helpers: index tables by table_key ─────────────────────
export function indexTablesByKey(rows) {
  const indexed = {};
  for (const row of rows) {
    const mapped = tableRowToJs(row);
    indexed[mapped.tableKey] = {
      columns: mapped.columns,
      rows: mapped.rows,
    };
  }
  return indexed;
}

// ─── Helpers: index bars by bar_key ─────────────────────────
export function indexBarsByKey(rows) {
  const indexed = {};
  for (const row of rows) {
    const mapped = barRowToJs(row);
    indexed[mapped.barKey] = mapped.items;
  }
  return indexed;
}

// ─── Helpers: index configs by config_key ───────────────────
export function indexConfigsByKey(rows) {
  const indexed = {};
  for (const row of rows) {
    const mapped = configRowToJs(row);
    indexed[mapped.configKey] = mapped.configData;
  }
  return indexed;
}
