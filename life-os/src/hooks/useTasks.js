import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { format } from 'date-fns'

export function useTasks({ status, projectId, goalId, limit } = {}) {
  const { user } = useAppStore()

  return useQuery({
    queryKey: ['tasks', user?.id, { status, projectId, goalId, limit }],
    enabled: !!user?.id,
    queryFn: async () => {
      let q = db.tasks()
        .select('*, projects(name, color), goals(title)')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (status) q = q.eq('status', status)
      if (projectId) q = q.eq('project_id', projectId)
      if (goalId) q = q.eq('goal_id', goalId)
      if (limit) q = q.limit(limit)

      const { data, error } = await q
      if (error) throw error
      return data
    },
  })
}

export function useTaskCounts() {
  const { user } = useAppStore()

  return useQuery({
    queryKey: ['task-counts', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await db.tasks()
        .select('status')
        .eq('user_id', user.id)
        .neq('status', 'cancelled')
      if (error) throw error

      const counts = { todo: 0, in_progress: 0, done: 0, total: 0 }
      data.forEach(t => {
        counts[t.status] = (counts[t.status] || 0) + 1
        counts.total++
      })
      return counts
    },
  })
}

export function useTodayTasks() {
  const { user } = useAppStore()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['tasks-today', user?.id, today],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await db.tasks()
        .select('*, projects(name, color)')
        .eq('user_id', user.id)
        .or(`due_date.eq.${today},is_today.eq.true`)
        .neq('status', 'cancelled')
        .order('priority', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useCreateTask() {
  const { user } = useAppStore()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (task) => {
      const { data, error } = await db.tasks()
        .insert({ ...task, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', user?.id] })
      qc.invalidateQueries({ queryKey: ['task-counts', user?.id] })
      qc.invalidateQueries({ queryKey: ['tasks-today', user?.id] })
    },
  })
}

export function useUpdateTask() {
  const { user } = useAppStore()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await db.tasks()
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', user?.id] })
      qc.invalidateQueries({ queryKey: ['task-counts', user?.id] })
      qc.invalidateQueries({ queryKey: ['tasks-today', user?.id] })
    },
  })
}
