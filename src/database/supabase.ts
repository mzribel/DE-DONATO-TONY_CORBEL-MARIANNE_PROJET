import { createClient } from '@supabase/supabase-js'

// TODO : enlever les creds
const supabaseUrl = ''
const supabaseKey = ''

export const supabase = createClient(supabaseUrl, supabaseKey)
