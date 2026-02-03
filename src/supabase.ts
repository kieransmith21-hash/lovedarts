/**
 * Supabase Client
 *
 * Direct Supabase client initialization.
 * Imported by services - never exposed globally.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabaseClient = (window as any).supabase.createClient(
  supabaseUrl,
  supabaseKey
)