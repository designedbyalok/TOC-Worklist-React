import { useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AppLayout } from './layouts/AppLayout';
import { useAppStore } from './store/useAppStore';
import { initRouter } from './lib/router';
import { seedDatabaseIfEmpty } from './lib/seedDatabase';

function App() {
  const fetchPatients = useAppStore(s => s.fetchPatients);
  const fetchCallDetails = useAppStore(s => s.fetchCallDetails);
  const routerInit = useRef(false);

  useEffect(() => {
    // Auto-seed empty tables, then fetch data
    seedDatabaseIfEmpty().then(() => {
      fetchPatients();
      fetchCallDetails();
    });
  }, [fetchPatients, fetchCallDetails]);

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
