import { createClient } from '@supabase/supabase-js';
let supabaseInstance: any = null;

try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseUrl.startsWith('http') && supabaseKey && supabaseKey !== '') {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
} catch (e) {
  console.warn('[Supabase] Failed to initialize client:', e);
}

export const supabase = supabaseInstance;
