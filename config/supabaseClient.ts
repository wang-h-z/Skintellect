import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://efokgnwngithpsigwshl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmb2tnbnduZ2l0aHBzaWd3c2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyODgxODIsImV4cCI6MjA1Nzg2NDE4Mn0.NGdYvu85KQQbJ6HNd28Fn6FjO2qxd3uoBiJ7w_1hzTQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
