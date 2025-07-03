import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "tmtc"
const supabaseAnonKey = "tmtc"

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
