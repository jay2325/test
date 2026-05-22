import { cn } from './Card'

const variants = {
  primary:   'bg-accent text-white hover:bg-violet-500 active:bg-violet-700 shadow-glow-sm',
  secondary: 'bg-white/[0.06] border border-white/[0.08] text-zinc-200 hover:bg-white/[0.10]',
  ghost:     'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200',
  danger:    'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-2.5 text-sm rounded-lg',
  icon: 'p-2 rounded-lg',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 font-medium transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
