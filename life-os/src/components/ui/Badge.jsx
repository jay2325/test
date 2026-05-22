import { cn } from './Card'

const variants = {
  default:     'bg-white/[0.06] text-zinc-300 border-white/[0.08]',
  todo:        'bg-zinc-800 text-zinc-300 border-zinc-700',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  done:        'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled:   'bg-red-500/10 text-red-400 border-red-500/20',
  urgent:      'bg-red-500/10 text-red-400 border-red-500/20',
  high:        'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium:      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low:         'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  active:      'bg-violet-500/10 text-violet-400 border-violet-500/20',
  pro:         'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 border-violet-500/30',
  free:        'bg-zinc-800 text-zinc-400 border-zinc-700',
}

export function Badge({ children, variant = 'default', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
        variants[variant] ?? variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
