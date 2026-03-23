import { useEffect } from 'react';
import { AppLayout } from './layouts/AppLayout';
import { useAppStore } from './store/useAppStore';

function App() {
  const fetchPatients = useAppStore(s => s.fetchPatients);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return <AppLayout />;
}

export default App;
