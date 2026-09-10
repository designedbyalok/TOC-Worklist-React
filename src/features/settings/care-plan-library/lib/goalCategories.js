// The goal category enum, in natural read order: physical measurements first,
// lifestyle, then Assessment (structured instruments), then the free-form
// Others catch-all bucket.
export const GOAL_CATEGORIES = ['Vitals', 'Labs', 'Diet', 'Exercise', 'Assessment', 'Others'];

// Older seeded rows carry the previous labels ('Vital' / 'Activity' /
// 'Lab result' / 'Other'). Map them to the new enum on read so every surface
// lands on the correct tab even before `bun run seed` re-runs. Assessment kept
// its name across the rename.
const LEGACY_CATEGORY_MAP = {
  Vital: 'Vitals',
  Activity: 'Exercise',
  'Lab result': 'Labs',
  Other: 'Others',
};

export const normalizeCategory = (c) => LEGACY_CATEGORY_MAP[c] || c || GOAL_CATEGORIES[0];

// Leading glyph for a goal row, keyed to its (normalized) category so the icon
// always matches the category tooltip. Vitals read as a heart-pulse, Labs a
// test tube, Diet a donut, Exercise a running figure, Assessment a clipboard;
// Others (and anything unmapped) fall back to a generic target.
const CATEGORY_ICON = {
  Vitals: 'solar:heart-pulse-linear',
  Labs: 'solar:test-tube-linear',
  Diet: 'solar:donut-linear',
  Exercise: 'solar:running-linear',
  Assessment: 'solar:clipboard-list-linear',
  Others: 'solar:target-linear',
};

// An uncategorized goal keeps the generic target (its tooltip reads "Goal"),
// rather than defaulting to the first enum category's icon.
export const goalCategoryIcon = (c) => (c ? CATEGORY_ICON[normalizeCategory(c)] : CATEGORY_ICON.Others) || CATEGORY_ICON.Others;
