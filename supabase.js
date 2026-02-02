const SUPABASE_URL = "https://gdrspcldtijxszgyrpwb.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkcnNwY2xkdGlqeHN6Z3lycHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNDExMjMsImV4cCI6MjA4NTYxNzEyM30.pvRqwpK2TM4vL8_r3MXxYUAVzs0DHh2YNwtY8ebtmTY"

window.db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)

// quick test
window.db
  .from("profiles")
  .select("*")
  .then(res => console.log(res))
