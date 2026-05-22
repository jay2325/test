import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function Card({ children, className, hover = false, glow = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-bg-card rounded-xl border border-white/[0.07] shadow-card',
        hover && 'transition-all duration-200 hover:border-white/[0.12] hover:bg-bg-hover cursor-pointer',
        glow && 'glow-border',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('flex items-center justify-between px-5 pt-5 pb-3', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={cn('text-sm font-semibold text-zinc-200', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('px-5 pb-5', className)} {...props}>
      {children}
    </div>
  )
}
