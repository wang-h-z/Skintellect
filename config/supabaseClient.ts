import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ ERROR: Supabase environment variables are missing');
  throw new Error('Supabase environment variables are missing');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
