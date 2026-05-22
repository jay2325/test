import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/components/ui/Card'

export default function StatWidget({
  label,
  value,
  sub,
  icon: Icon,
  iconColor = 'text-violet-400',
  iconBg = 'bg-violet-500/10',
  trend,          // 'up' | 'down' | 'neutral'
  trendValue,     // e.g. "+12%" or "3 done"
  loading = false,
  onClick,
}) {
  return (
    <div
      className={cn(
        'bg-bg-card rounded-xl border border-white/[0.07] shadow-card p-5',
        'flex flex-col gap-4',
        onClick && 'cursor-pointer hover:border-white/[0.12] hover:bg-bg-hover transition-all duration-200'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon className={cn('w-4.5 h-4.5', iconColor)} />
        </div>

        {trendValue && (
          <div className={cn(
            'flex items-center gap-0.5 text-xs font-medium',
            trend === 'up' ? 'text-green-400' :
            trend === 'down' ? 'text-red-400' : 'text-zinc-500'
          )}>
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend === 'neutral' && <Minus className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>

      <div>
        {loading ? (
          <div className="space-y-2">
            <div className="h-7 w-16 bg-white/[0.05] rounded-md animate-pulse" />
            <div className="h-3.5 w-24 bg-white/[0.03] rounded-md animate-pulse" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-zinc-100 tabular-nums tracking-tight">
              {value ?? '—'}
            </div>
            <div className="text-xs text-zinc-500 mt-1">{label}</div>
            {sub && <div className="text-xs text-zinc-600 mt-0.5">{sub}</div>}
          </>
        )}
      </div>
    </div>
  )
}
