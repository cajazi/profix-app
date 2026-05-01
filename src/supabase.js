import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://kufcdoexwufttxhsxhui.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1ZmNkb2V4d3VmdHR4aHN4aHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MzM4MTksImV4cCI6MjA5MTMwOTgxOX0.wBX3pvnqYgPKxd7hsp-PZ-thQPYKAutotVBqBjONebk"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  }
})
