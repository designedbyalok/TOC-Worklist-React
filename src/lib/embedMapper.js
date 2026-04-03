/**
 * Mapper: embed_domains, embed_components, audit_logs
 * Converts between snake_case (DB) and camelCase (JS).
 */

// ── Domain ──
export function domainDbToJs(row) {
  return {
    id: row.id,
    vendor: row.vendor,
    domain: row.domain,
    category: row.category,
    hipaa: row.hipaa,
    enabled: row.enabled,
    addedDate: row.added_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function domainJsToDb(js) {
  const db = {};
  if (js.vendor !== undefined) db.vendor = js.vendor;
  if (js.domain !== undefined) db.domain = js.domain;
  if (js.category !== undefined) db.category = js.category;
  if (js.hipaa !== undefined) db.hipaa = js.hipaa;
  if (js.enabled !== undefined) db.enabled = js.enabled;
  if (js.addedDate !== undefined) db.added_date = js.addedDate;
  return db;
}

// ── Component ──
export function componentDbToJs(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description || '',
    domainId: row.domain_id,
    domain: row.domain,
    surfaces: row.surfaces || [],
    placements: row.placements || {},
    webConfig: row.web_config || {},
    sidecarConfig: row.sidecar_config || {},
    mobileConfig: row.mobile_config || {},
    url: row.url || '',
    stagingUrl: row.staging_url || '',
    tokenLifetime: row.token_lifetime || 5,
    contextFields: row.context_fields || [],
    visibleTo: row.visible_to || 'All providers',
    activation: row.activation || 'always',
    condition: row.condition,
    enabled: row.enabled,
    previewed: row.previewed,
    domainRemoved: row.domain_removed,
    errors24h: row.errors_24h || 0,
    lastLoaded: row.last_loaded,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function componentJsToDb(js) {
  const db = {};
  if (js.name !== undefined) db.name = js.name;
  if (js.category !== undefined) db.category = js.category;
  if (js.description !== undefined) db.description = js.description;
  if (js.domainId !== undefined) db.domain_id = js.domainId;
  if (js.domain !== undefined) db.domain = js.domain;
  if (js.surfaces !== undefined) db.surfaces = js.surfaces;
  if (js.placements !== undefined) db.placements = js.placements;
  if (js.webConfig !== undefined) db.web_config = js.webConfig;
  if (js.sidecarConfig !== undefined) db.sidecar_config = js.sidecarConfig;
  if (js.mobileConfig !== undefined) db.mobile_config = js.mobileConfig;
  if (js.url !== undefined) db.url = js.url;
  if (js.stagingUrl !== undefined) db.staging_url = js.stagingUrl;
  if (js.tokenLifetime !== undefined) db.token_lifetime = js.tokenLifetime;
  if (js.contextFields !== undefined) db.context_fields = js.contextFields;
  if (js.visibleTo !== undefined) db.visible_to = js.visibleTo;
  if (js.activation !== undefined) db.activation = js.activation;
  if (js.condition !== undefined) db.condition = js.condition;
  if (js.enabled !== undefined) db.enabled = js.enabled;
  if (js.previewed !== undefined) db.previewed = js.previewed;
  if (js.domainRemoved !== undefined) db.domain_removed = js.domainRemoved;
  if (js.errors24h !== undefined) db.errors_24h = js.errors24h;
  if (js.lastLoaded !== undefined) db.last_loaded = js.lastLoaded;
  return db;
}

// ── Audit Log ──
export function auditLogDbToJs(row) {
  let detailsText = row.details || '';
  let changes = null;
  // Parse structured changes from JSON details
  if (detailsText && detailsText.startsWith('{')) {
    try {
      const parsed = JSON.parse(detailsText);
      detailsText = parsed.text || '';
      changes = parsed.changes || null;
    } catch (e) { /* not JSON, use as plain text */ }
  }

  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    entityName: row.entity_name,
    action: row.action,
    user: row.user_name,
    details: detailsText,
    changes, // [{field, from, to, type: 'text'|'status'}]
    category: row.category,
    createdAt: row.created_at,
    date: row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '',
    time: row.created_at ? new Date(row.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '',
  };
}
