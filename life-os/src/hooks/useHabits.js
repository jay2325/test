import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { format, subDays, eachDayOfInterval } from 'date-fns'

export function useHabits() {
  const { user } = useAppStore()

  return useQuery({
    queryKey: ['habits', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await db.habits()
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useHabitsToday() {
  const { user } = useAppStore()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['habits-today', user?.id, today],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data: habits, error: hErr } = await db.habits()
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (hErr) throw hErr

      const { data: logs, error: lErr } = await db.habitLogs()
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)

      if (lErr) throw lErr

      const logMap = Object.fromEntries(logs.map(l => [l.habit_id, l]))

      return habits.map(h => ({
        ...h,
        completed: logMap[h.id]?.completed ?? false,
        log_id: logMap[h.id]?.id ?? null,
      }))
    },
  })
}

export function useHabitWeeklyStats() {
  const { user } = useAppStore()
  const today = new Date()

  return useQuery({
    queryKey: ['habits-weekly', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const days = eachDayOfInterval({
        start: subDays(today, 6),
        end: today,
      })

      const { data, error } = await db.habitLogs()
        .select('date, completed')
        .eq('user_id', user.id)
        .gte('date', format(days[0], 'yyyy-MM-dd'))
        .lte('date', format(today, 'yyyy-MM-dd'))

      if (error) throw error

      // Build chart data: one bar per day
      return days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const dayLogs = data.filter(l => l.date === dateStr)
        const completed = dayLogs.filter(l => l.completed).length
        return {
          day: format(day, 'EEE'),
          date: dateStr,
          completed,
          total: dayLogs.length,
          rate: dayLogs.length ? Math.round((completed / dayLogs.length) * 100) : 0,
        }
      })
    },
  })
}

export function useToggleHabit() {
  const { user } = useAppStore()
  const qc = useQueryClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useMutation({
    mutationFn: async ({ habitId, completed, logId }) => {
      if (logId) {
        // Update existing log
        const { data, error } = await db.habitLogs()
          .update({ completed })
          .eq('id', logId)
          .select()
          .single()
        if (error) throw error
        return data
      } else {
        // Create new log
        const { data, error } = await db.habitLogs()
          .upsert({
            user_id: user.id,
            habit_id: habitId,
            date: today,
            completed,
          })
          .select()
          .single()
        if (error) throw error
        return data
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits-today', user?.id] })
      qc.invalidateQueries({ queryKey: ['habits-weekly', user?.id] })
    },
  })
}
