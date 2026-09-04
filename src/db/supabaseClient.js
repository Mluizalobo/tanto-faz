import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseConfig.js'

export const supabaseReady = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const supabase = supabaseReady ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null
