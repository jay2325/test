import { useQuery } from '@tanstack/react-query'
import { db } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export function useFinanceMonth(date = new Date()) {
  const { user } = useAppStore()
  const monthStart = format(startOfMonth(date), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(date), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['finance-month', user?.id, monthStart],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await db.finance()
        .select('*')
        .eq('user_id', user.id)
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .order('date', { ascending: false })

      if (error) throw error

      const income = data.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
      const expenses = data.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)

      return {
        entries: data,
        income,
        expenses,
        net: income - expenses,
      }
    },
  })
}
