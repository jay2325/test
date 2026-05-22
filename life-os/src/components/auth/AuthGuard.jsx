import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { supabase } from '@/lib/supabase'

export default function AuthGuard({ children }) {
  const { user, setUser } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/auth')
      else setUser(session.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') navigate('/auth')
      else if (session) setUser(session.user)
    })

    return () => subscription.unsubscribe()
  }, [navigate, setUser])

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return children
}
