import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
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
    </>
  );
}

export default App;
