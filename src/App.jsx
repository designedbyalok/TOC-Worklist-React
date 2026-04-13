import { useEffect, useRef, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './features/auth/LoginPage';
import { useAppStore } from './store/useAppStore';
import { supabase } from './lib/supabase';
import { initRouter } from './lib/router';
import { seedDatabaseIfEmpty } from './lib/seedDatabase';

function App() {
  const routerInit = useRef(false);
  const seeded = useRef(false);
  const [session, setSession] = useState(undefined); // undefined = loading, null = unauthenticated
  const [bypassed, setBypassed] = useState(() => sessionStorage.getItem('__auth_bypass') === 'true');

  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-seed empty tables once (always — RLS is open for prototype)
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

  const isAuthenticated = session || bypassed;

  // Loading state while checking auth
  if (session === undefined && !bypassed) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontFamily: "'Inter', sans-serif", color: 'var(--neutral-200)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 290 290" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M290 145C290 159.088 284.404 172.599 274.442 182.561C264.48 192.522 250.969 198.119 236.881 198.119H145C137.334 198.119 129.839 200.392 123.465 204.651C117.09 208.911 112.122 214.965 109.188 222.047C106.254 229.13 105.487 236.924 106.982 244.443C108.478 251.962 112.17 258.869 117.591 264.29C123.012 269.711 129.919 273.403 137.438 274.899C144.957 276.394 152.751 275.627 159.834 272.693C166.917 269.759 172.97 264.791 177.23 258.416C181.489 252.042 183.762 244.548 183.762 236.881V212.475C183.762 210.571 184.519 208.746 185.865 207.399C187.211 206.053 189.037 205.297 190.941 205.297C192.844 205.297 194.67 206.053 196.016 207.399C197.363 208.746 198.119 210.571 198.119 212.475V236.881C198.119 247.387 195.003 257.657 189.167 266.392C183.33 275.128 175.034 281.936 165.328 285.957C155.622 289.977 144.941 291.029 134.637 288.979C124.333 286.93 114.868 281.871 107.439 274.442C100.011 267.013 94.9515 257.548 92.9019 247.244C90.8523 236.94 91.9042 226.26 95.9246 216.553C99.9451 206.847 106.753 198.551 115.489 192.714C124.224 186.878 134.494 183.762 145 183.762H236.881C247.162 183.762 257.021 179.678 264.29 172.409C271.56 165.14 275.644 155.28 275.644 145C275.644 134.72 271.56 124.86 264.29 117.591C257.021 110.321 247.162 106.238 236.881 106.238H212.475C210.571 106.238 208.746 105.481 207.4 104.135C206.053 102.789 205.297 100.963 205.297 99.0594C205.297 97.1556 206.053 95.3298 207.4 93.9836C208.746 92.6375 210.571 91.8812 212.475 91.8812H236.881C250.969 91.8812 264.48 97.4776 274.442 107.439C284.404 117.401 290 130.912 290 145Z" fill="var(--primary-300)" opacity="0.3"/>
          </svg>
          <div style={{ marginTop: 12, fontSize: 14 }}>Loading...</div>
        </div>
      </div>
    );
  }

  // Not authenticated — show login
  if (!isAuthenticated) {
    if (window.location.hash !== '#/login') window.location.hash = '#/login';
    return <LoginPage onBypass={() => { sessionStorage.setItem('__auth_bypass', 'true'); setBypassed(true); window.location.hash = '#/population/worklist'; }} />;
  }

  // Authenticated — clear login hash if present
  if (window.location.hash === '#/login' || window.location.hash === '') {
    window.location.hash = '#/population/worklist';
  }

  // Authenticated — show app
  return (
    <>
      <AppLayout />
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;
