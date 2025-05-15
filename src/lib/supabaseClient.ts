import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase'; // We'll create this type definition later if needed, or adjust if not generating types

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing. Make sure to set them in your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
