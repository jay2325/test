import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'

export function useGoals({ horizon, status = 'active' } = {}) {
  const { user } = useAppStore()

  return useQuery({
    queryKey: ['goals', user?.id, { horizon, status }],
    enabled: !!user?.id,
    queryFn: async () => {
      let q = db.goals()
        .select('*')
        .eq('user_id', user.id)
      if (status) q = q.eq('status', status)
      if (horizon) q = q.eq('horizon', horizon)
      q = q.order('created_at', { ascending: false })
      const { data, error } = await q
      if (error) throw error
      return data
    },
  })
}

export function useCreateGoal() {
  const { user } = useAppStore()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (goal) => {
      const { data, error } = await db.goals()
        .insert({ ...goal, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals', user?.id] }),
  })
}

export function useUpdateGoal() {
  const { user } = useAppStore()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await db.goals()
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals', user?.id] }),
  })
}
