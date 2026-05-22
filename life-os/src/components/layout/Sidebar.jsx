import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CheckSquare, Target, RefreshCw,
  Calendar, DollarSign, BookOpen, Globe, Wrench,
  ChevronLeft, Zap, Settings, LogOut, Crown,
} from 'lucide-react'
import { cn } from '@/components/ui/Card'
import { useAppStore } from '@/store/useAppStore'
import { supabase } from '@/lib/supabase'

const NAV_ITEMS = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard',         emoji: '🏠' },
  { to: '/tasks',      icon: CheckSquare,     label: 'Tasks & Projects',  emoji: '📋' },
  { to: '/goals',      icon: Target,          label: 'Goals & Vision',    emoji: '🎯' },
  { to: '/habits',     icon: RefreshCw,       label: 'Habits & Health',   emoji: '🔁' },
  { to: '/planner',    icon: Calendar,        label: 'Weekly Planner',    emoji: '📅' },
  { to: '/finance',    icon: DollarSign,      label: 'Revenue & Finance', emoji: '💰' },
  { to: '/knowledge',  icon: BookOpen,        label: 'Knowledge Base',    emoji: '📚' },
  { to: '/life',       icon: Globe,           label: 'Life & Fun',        emoji: '🌍' },
  { to: '/tools',      icon: Wrench,          label: 'Resources & Tools', emoji: '⚙️' },
]

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, profile } = useAppStore()
  const isPro = profile?.tier === 'pro' || profile?.tier === 'power'

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-bg-card border-r border-white/[0.07]',
        'transition-all duration-300 ease-in-out flex-shrink-0',
        sidebarCollapsed ? 'w-[64px]' : 'w-[240px]'
      )}
    >
      {/* Logo + collapse */}
      <div className={cn(
        'flex items-center h-14 px-4 border-b border-white/[0.07]',
        sidebarCollapsed ? 'justify-center' : 'justify-between'
      )}>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shadow-glow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-gradient">Life OS</span>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shadow-glow-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
        )}
        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto space-y-0.5 px-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label, emoji }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-accent/10 text-accent-light border border-accent/20'
                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
              )
            }
            title={sidebarCollapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="truncate">{label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Upgrade banner */}
      {!isPro && !sidebarCollapsed && (
        <div className="px-3 pb-3">
          <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Crown className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-semibold text-violet-300">Go Pro</span>
            </div>
            <p className="text-xs text-zinc-400 mb-2.5 leading-relaxed">
              Unlock all modules, charts, and AI features.
            </p>
            <button className="w-full py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-violet-500 transition-colors shadow-glow-sm">
              Upgrade — $19/mo
            </button>
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className={cn(
        'border-t border-white/[0.07] py-3 px-2 space-y-0.5',
      )}>
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors"
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && <span>Settings</span>}
        </NavLink>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}
