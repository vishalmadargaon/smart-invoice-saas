import { createClient } from '@supabase/supabase-js';

// Read the keys from the .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Safety Check: Log an error if keys are missing
if (!supabaseUrl || !supabaseKey) {
  console.error("🚨 Supabase Keys are MISSING! Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);