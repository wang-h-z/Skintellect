import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '@env';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ ERROR: Supabase environment variables are missing');
  throw new Error('Supabase environment variables are missing');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
