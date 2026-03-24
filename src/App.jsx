import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AppLayout } from './layouts/AppLayout';
import { useAppStore } from './store/useAppStore';

function App() {
  const fetchPatients = useAppStore(s => s.fetchPatients);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return (
    <>
      <AppLayout />
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;
