/**
 * Supabase Client
 * 
 * Direct Supabase client initialization.
 * Imported by services - never exposed globally.
 */

const supabaseUrl = 'https://gdrspcldtijxszgyrpwb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkcnNwY2xkdGlqeHN6Z3lycHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNDExMjMsImV4cCI6MjA4NTYxNzEyM30.pvRqwpK2TM4vL8_r3MXxYUAVzs0DHh2YNwtY8ebtmTY'

export const supabaseClient = (window as any).supabase.createClient(supabaseUrl, supabaseKey)
