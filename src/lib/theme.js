/**
 * Theme system
 * ────────────
 * Three theme settings the user can choose:
 *   - 'light'   → always render the light palette
 *   - 'dark'    → always render the dark palette
 *   - 'system'  → follow OS prefers-color-scheme, live-updating on change
 *
 * Token cascade is driven entirely by `<html data-theme="...">` in tokens.css.
 * The `.dark` class is also applied so Tailwind's `dark:` variant works for
 * the few hand-written utility classes that need explicit overrides.
 *
 * The blocking script in index.html performs the initial paint application
 * BEFORE React mounts, so this module's initTheme() reconciles the store
 * with what the script already wrote (and wires the system listener).
 */

export const THEME_STORAGE_KEY = 'theme';
export const THEME_VALUES = ['light', 'dark', 'system'];

/** Resolve a setting ('system') down to an actual rendered theme. */
export function getResolvedTheme(setting) {
  if (setting === 'system') {
    if (typeof window === 'undefined' || !window.matchMedia) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return setting === 'dark' ? 'dark' : 'light';
}

/** Read the persisted theme setting; defaults to 'light'. */
export function getStoredTheme() {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return THEME_VALUES.includes(v) ? v : 'light';
  } catch {
    return 'light';
  }
}

/** Persist the theme setting. Silently no-ops in private-mode browsers. */
export function persistTheme(setting) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, setting);
  } catch {
    /* localStorage unavailable */
  }
}

/** Apply a resolved theme ('light' | 'dark') to the <html> element. */
export function applyResolvedTheme(resolved) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  root.classList.toggle('dark', resolved === 'dark');
}

/**
 * Apply a theme setting end-to-end:
 *   - Persist to localStorage
 *   - Resolve 'system' → actual
 *   - Update <html data-theme=...> + .dark class
 * Returns the resolved theme.
 */
export function applyTheme(setting) {
  const safe = THEME_VALUES.includes(setting) ? setting : 'light';
  persistTheme(safe);
  const resolved = getResolvedTheme(safe);
  applyResolvedTheme(resolved);
  return resolved;
}

/**
 * Subscribe to OS prefers-color-scheme changes.
 * Only triggers the callback while the active setting is 'system'.
 * Returns an unsubscribe function.
 */
export function subscribeToSystem(getCurrentSetting, onSystemChange) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e) => {
    if (getCurrentSetting() === 'system') {
      const resolved = e.matches ? 'dark' : 'light';
      applyResolvedTheme(resolved);
      onSystemChange?.(resolved);
    }
  };
  // Modern browsers: addEventListener; legacy Safari: addListener
  if (mql.addEventListener) mql.addEventListener('change', handler);
  else mql.addListener(handler);
  return () => {
    if (mql.removeEventListener) mql.removeEventListener('change', handler);
    else mql.removeListener(handler);
  };
}

/**
 * One-time bootstrap called from main.jsx before React mounts.
 *  - Reads stored setting (defaulting to 'light')
 *  - Re-applies it (the index.html inline script already did this; this is a
 *    safety net in case the script failed in some browser)
 *  - Returns { setting, resolved } so the store can hydrate consistently.
 */
export function initTheme() {
  const setting = getStoredTheme();
  const resolved = applyTheme(setting);
  return { setting, resolved };
}
