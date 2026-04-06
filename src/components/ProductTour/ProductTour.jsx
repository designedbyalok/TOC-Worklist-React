import { useState, useCallback, useEffect } from 'react';
import { Joyride, STATUS, ACTIONS } from 'react-joyride';
import { supabase } from '../../lib/supabase';
import { TourTooltip } from './TourTooltip';

const TOUR_STORAGE_KEY = 'fold_seen_tours';
const DB_TABLE = 'user_tour_status';

/* ── Local fallback (for unauthenticated / dev mode) ── */

function getLocalSeenTours() {
  try {
    return JSON.parse(localStorage.getItem(TOUR_STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function markLocalTourSeen(tourId) {
  const seen = getLocalSeenTours();
  seen[tourId] = Date.now();
  localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(seen));
}

/* ── Supabase persistence ── */

async function getUserId() {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  } catch { return null; }
}

async function getDbSeenTours(userId) {
  if (!userId) return {};
  try {
    const { data } = await supabase
      .from(DB_TABLE)
      .select('tour_id, seen_at')
      .eq('user_id', userId);
    const map = {};
    (data || []).forEach(row => { map[row.tour_id] = row.seen_at; });
    return map;
  } catch { return {}; }
}

async function markDbTourSeen(userId, tourId) {
  if (!userId) return;
  try {
    await supabase
      .from(DB_TABLE)
      .upsert({ user_id: userId, tour_id: tourId, seen_at: new Date().toISOString() }, { onConflict: 'user_id,tour_id' });
  } catch { /* silent — local fallback covers it */ }
}

/**
 * ProductTour — wraps React Joyride with Fold Health design system.
 * Tour state is persisted to Supabase (cross-device) with localStorage fallback.
 */
export function ProductTour({ tourId, steps, run = true, onFinish, continuous = true }) {
  const [running, setRunning] = useState(false);
  const [checked, setChecked] = useState(false);

  // Check both local and DB on mount
  useEffect(() => {
    if (!run) { setChecked(true); return; }

    // Quick local check first (instant, no flicker)
    const localSeen = getLocalSeenTours();
    if (localSeen[tourId]) { setChecked(true); return; }

    // Then check DB for cross-device persistence
    let cancelled = false;
    (async () => {
      const userId = await getUserId();
      if (cancelled) return;
      if (userId) {
        const dbSeen = await getDbSeenTours(userId);
        if (cancelled) return;
        if (dbSeen[tourId]) {
          // Sync to local so next check is instant
          markLocalTourSeen(tourId);
          setChecked(true);
          return;
        }
      }
      // Not seen anywhere — show the tour
      setRunning(true);
      setChecked(true);
    })();
    return () => { cancelled = true; };
  }, [tourId, run]);

  // Mark as seen immediately when tour starts (both local + DB)
  useEffect(() => {
    if (!running) return;
    markLocalTourSeen(tourId);
    (async () => {
      const userId = await getUserId();
      if (userId) markDbTourSeen(userId, tourId);
    })();
  }, [running, tourId]);

  const handleCallback = useCallback((data) => {
    const { status, action } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED || action === ACTIONS.CLOSE) {
      setRunning(false);
      onFinish?.();
    }
  }, [onFinish]);

  if (!checked || !running || !steps?.length) return null;

  return (
    <Joyride
      steps={steps}
      run={running}
      continuous={continuous}
      showSkipButton
      showProgress={false}
      disableOverlayClose={false}
      disableScrolling={false}
      spotlightClicks
      callback={handleCallback}
      tooltipComponent={TourTooltip}
      styles={{
        options: {
          zIndex: 10000,
          overlayColor: 'rgba(0, 0, 0, 0.35)',
        },
        spotlight: {
          borderRadius: 8,
        },
      }}
      floaterProps={{
        disableAnimation: true,
      }}
    />
  );
}

/**
 * Reset a specific tour so it shows again (both local + DB).
 */
export async function resetTour(tourId) {
  const seen = getLocalSeenTours();
  delete seen[tourId];
  localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(seen));
  const userId = await getUserId();
  if (userId) {
    try {
      await supabase.from(DB_TABLE).delete().eq('user_id', userId).eq('tour_id', tourId);
    } catch { /* silent */ }
  }
}

/**
 * Reset all tours (both local + DB).
 */
export async function resetAllTours() {
  localStorage.removeItem(TOUR_STORAGE_KEY);
  const userId = await getUserId();
  if (userId) {
    try {
      await supabase.from(DB_TABLE).delete().eq('user_id', userId);
    } catch { /* silent */ }
  }
}
