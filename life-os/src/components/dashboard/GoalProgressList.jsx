import { Target, ChevronRight, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/components/ui/Card'

const HORIZON_LABELS = {
  '5_year':   '5yr',
  '1_year':   '1yr',
  quarterly:  'Q',
  monthly:    'Mo',
  weekly:     'Wk',
}

const HORIZON_COLORS = {
  '5_year':  'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
  '1_year':  'bg-violet-500/10 text-violet-400 border-violet-500/20',
  quarterly: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  monthly:   'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  weekly:    'bg-green-500/10 text-green-400 border-green-500/20',
}

function ProgressBar({ value, color = '#7c3aed' }) {
  return (
    <div className="relative h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  )
}

export default function GoalProgressList({ goals, loading }) {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-zinc-400" />
          <CardTitle>Active Goals</CardTitle>
        </div>
        <button
          onClick={() => navigate('/goals')}
          className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-0.5 transition-colors"
        >
          View all <ChevronRight className="w-3 h-3" />
        </button>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-white/[0.04] rounded animate-pulse w-3/4" />
              <div className="h-1.5 bg-white/[0.03] rounded-full animate-pulse" />
            </div>
          ))
        ) : !goals?.length ? (
          <div className="py-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
              <Target className="w-5 h-5 text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-500 mb-1">No active goals</p>
            <button
              onClick={() => navigate('/goals')}
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 mx-auto transition-colors"
            >
              <Plus className="w-3 h-3" /> Add your first goal
            </button>
          </div>
        ) : (
          goals.slice(0, 5).map(goal => (
            <div key={goal.id} className="group">
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm">{goal.emoji ?? '🎯'}</span>
                  <span className="text-sm text-zinc-200 truncate group-hover:text-white transition-colors">
                    {goal.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span
                    className={cn(
                      'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border',
                      HORIZON_COLORS[goal.horizon] ?? HORIZON_COLORS['1_year']
                    )}
                  >
                    {HORIZON_LABELS[goal.horizon] ?? goal.horizon}
                  </span>
                  <span className="text-xs text-zinc-500 tabular-nums">
                    {goal.progress_percent}%
                  </span>
                </div>
              </div>
              <ProgressBar value={goal.progress_percent} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
