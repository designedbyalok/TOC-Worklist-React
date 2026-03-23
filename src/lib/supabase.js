import { createClient } from '@supabase/supabase-js';

// Env vars for local dev, hardcoded fallback for production builds.
// The anon key is a public client-side key with RLS — safe to embed.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  || 'https://osnihfqqrcchsaqhagcx.supabase.co';

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbmloZnFxcmNjaHNhcWhhZ2N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNTI0NTksImV4cCI6MjA4OTgyODQ1OX0.ZuJQLMriqBcmf_nqLqcwu05x9BM5G_CAWz4R180xZ-w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'public' },
});
