import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { CheckSquare } from 'lucide-react'

const STATUS_CONFIG = {
  todo:        { label: 'To Do',      color: '#3f3f46' },
  in_progress: { label: 'In Progress', color: '#3b82f6' },
  done:        { label: 'Done',        color: '#22c55e' },
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-bg-elevated border border-white/[0.10] rounded-lg px-3 py-2 text-xs shadow-xl">
      <span className="text-zinc-300 font-medium">{name}</span>
      <span className="text-zinc-400 ml-2">{value} tasks</span>
    </div>
  )
}

const CustomLegend = ({ payload }) => (
  <div className="flex flex-wrap gap-3 justify-center mt-1">
    {payload?.map(entry => (
      <div key={entry.value} className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="text-xs text-zinc-400">{entry.value}</span>
      </div>
    ))}
  </div>
)

export default function TaskDonutChart({ counts, loading }) {
  const data = Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
    name: cfg.label,
    value: counts?.[key] ?? 0,
    color: cfg.color,
  })).filter(d => d.value > 0)

  const total = data.reduce((s, d) => s + d.value, 0)
  const doneCount = counts?.done ?? 0
  const doneRate = total ? Math.round((doneCount / total) * 100) : 0

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-zinc-400" />
          <CardTitle>Task Status</CardTitle>
        </div>
        <span className="text-xs text-zinc-500">{total} total</span>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center">
        {loading ? (
          <div className="w-40 h-40 rounded-full bg-white/[0.04] animate-pulse mx-auto" />
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center mb-3">
              <CheckSquare className="w-5 h-5 text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-500">No tasks yet</p>
            <p className="text-xs text-zinc-600 mt-1">Add your first task to see stats</p>
          </div>
        ) : (
          <>
            <div className="relative">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-zinc-100">{doneRate}%</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">done</span>
              </div>
            </div>
            <CustomLegend payload={data.map(d => ({ value: d.name, color: d.color }))} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
