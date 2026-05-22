import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase, db } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'

export function useUser() {
  const { user, profile, setUser, setProfile } = useAppStore()

  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    )
    return () => subscription.unsubscribe()
  }, [setUser])

  // Fetch profile when user is set
  useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await db.userProfiles()
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) throw error
      setProfile(data)
      return data
    },
  })

  return { user, profile, isAuthed: !!user }
}
