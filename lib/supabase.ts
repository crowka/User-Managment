// project/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Check required environment variables
if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('Missing environment variable VITE_SUPABASE_URL');
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable VITE_SUPABASE_ANON_KEY');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Get a Supabase instance with the service role key for admin operations
export function getServiceSupabase() {
  if (!import.meta.env.VITE_SUPABASE_SERVICE_KEY) {
    throw new Error('Missing environment variable VITE_SUPABASE_SERVICE_KEY');
  }

  return createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_SERVICE_KEY
  );
}
