import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { RefreshCw } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const { completed, total, rate } = payload[0]?.payload ?? {}
  return (
    <div className="bg-bg-elevated border border-white/[0.10] rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-zinc-300 font-medium mb-1">{label}</div>
      <div className="text-zinc-400">{completed}/{total} habits · <span className="text-violet-400">{rate}%</span></div>
    </div>
  )
}

export default function HabitBarChart({ data, loading }) {
  const avgRate = data?.length
    ? Math.round(data.reduce((s, d) => s + d.rate, 0) / data.length)
    : 0

  // Placeholder data for empty state
  const chartData = data?.length
    ? data
    : Array.from({ length: 7 }, (_, i) => ({ day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], rate: 0, completed: 0, total: 0 }))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-zinc-400" />
          <CardTitle>Habit Completion</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-zinc-100">{avgRate}%</span>
          <span className="text-xs text-zinc-500">avg this week</span>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-36 bg-white/[0.02] rounded-lg animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={144}>
            <BarChart data={chartData} barSize={20} barCategoryGap="30%">
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a', fontSize: 11 }}
              />
              <YAxis
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#52525b', fontSize: 10 }}
                tickFormatter={v => `${v}%`}
                width={32}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.rate >= 80 ? '#7c3aed' : entry.rate >= 50 ? '#4c1d95' : '#27272a'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
