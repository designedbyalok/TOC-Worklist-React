import { useState, useCallback } from 'react';
import { Joyride, STATUS, ACTIONS } from 'react-joyride';
import { TourTooltip } from './TourTooltip';

const TOUR_STORAGE_KEY = 'fold_seen_tours';

function getSeenTours() {
  try {
    return JSON.parse(localStorage.getItem(TOUR_STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function markTourSeen(tourId) {
  const seen = getSeenTours();
  seen[tourId] = Date.now();
  localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(seen));
}

/**
 * ProductTour — wraps React Joyride with Fold Health design system.
 */
export function ProductTour({ tourId, steps, run = true, onFinish, continuous = true }) {
  const [running, setRunning] = useState(() => {
    if (!run) return false;
    const seen = getSeenTours();
    return !seen[tourId];
  });

  const handleCallback = useCallback((data) => {
    const { status, action } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED || action === ACTIONS.CLOSE) {
      markTourSeen(tourId);
      setRunning(false);
      onFinish?.();
    }
  }, [tourId, onFinish]);

  if (!running || !steps?.length) return null;

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

export function resetTour(tourId) {
  const seen = getSeenTours();
  delete seen[tourId];
  localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(seen));
}

export function resetAllTours() {
  localStorage.removeItem(TOUR_STORAGE_KEY);
}
