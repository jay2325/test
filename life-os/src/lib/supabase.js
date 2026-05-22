import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️  Missing Supabase env vars. Copy .env.example to .env and fill in your keys.'
  )
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

// Typed helpers
export const db = {
  tasks:          () => supabase.from('tasks'),
  projects:       () => supabase.from('projects'),
  goals:          () => supabase.from('goals'),
  habits:         () => supabase.from('habits'),
  habitLogs:      () => supabase.from('habit_logs'),
  healthLogs:     () => supabase.from('health_logs'),
  finance:        () => supabase.from('finance_entries'),
  books:          () => supabase.from('books'),
  knowledge:      () => supabase.from('knowledge_items'),
  bucketList:     () => supabase.from('bucket_list'),
  recipes:        () => supabase.from('recipes'),
  userProfiles:   () => supabase.from('user_profiles'),
}
