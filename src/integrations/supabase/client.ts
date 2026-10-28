import { createClient } from '@supabase/supabase-js';
import { getEnv } from '@/utils/environment';
import { Database } from '@/lib/database.types';

// Browser client: uses ONLY the publishable key. Privileged operations run in Edge Functions.
export const supabase = createClient<Database>(
  getEnv('VITE_SUPABASE_URL') || '',
  getEnv('VITE_SUPABASE_PUBLISHABLE_KEY') || ''
);
