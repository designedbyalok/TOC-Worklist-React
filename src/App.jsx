import { useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AppLayout } from './layouts/AppLayout';
import { useAppStore } from './store/useAppStore';
import { initRouter } from './lib/router';
import { seedDatabaseIfEmpty } from './lib/seedDatabase';

function App() {
  const routerInit = useRef(false);
  const seeded = useRef(false);

  // Auto-seed empty tables once (no eager data fetching — pages fetch what they need)
  useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      seedDatabaseIfEmpty();
    }
  }, []);

  // Initialize hash router (once)
  useEffect(() => {
    if (!routerInit.current) {
      routerInit.current = true;
      initRouter(useAppStore);
    }
  }, []);

  return (
    <>
      <AppLayout />
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;
