import { useState } from 'react'
import { format } from 'date-fns'
import { Search, Bell, Sparkles, PanelLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/components/ui/Card'
import QuickCapture from '@/components/dashboard/QuickCapture'

export default function TopBar({ title, breadcrumb }) {
  const { sidebarCollapsed, toggleSidebar, profile, user } = useAppStore()
  const [captureOpen, setCaptureOpen] = useState(false)
  const today = format(new Date(), 'EEEE, MMMM d')
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <>
      <header className="h-14 flex items-center justify-between px-6 border-b border-white/[0.07] bg-bg-base/80 backdrop-blur-sm sticky top-0 z-10">
        {/* Left: sidebar toggle + breadcrumb */}
        <div className="flex items-center gap-3">
          {sidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] transition-colors"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-zinc-500">Life OS</span>
            {breadcrumb && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-zinc-300 font-medium">{breadcrumb}</span>
              </>
            )}
          </div>
        </div>

        {/* Center: date */}
        <div className="hidden md:block text-xs text-zinc-500 font-medium tracking-wide">
          {today}
        </div>

        {/* Right: actions + avatar */}
        <div className="flex items-center gap-2">
          {/* Quick capture */}
          <button
            onClick={() => setCaptureOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-zinc-500 text-xs hover:bg-white/[0.07] hover:text-zinc-300 transition-all duration-150"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Quick capture</span>
            <kbd className="ml-1 px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono">⌘K</kbd>
          </button>

          {/* AI briefing */}
          <button className="p-2 rounded-lg text-zinc-500 hover:bg-white/[0.05] hover:text-violet-400 transition-colors" title="AI Daily Briefing">
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-lg text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
          </button>

          {/* Avatar */}
          <button className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-xs font-semibold shadow-glow-sm hover:shadow-glow transition-shadow">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </button>
        </div>
      </header>

      <QuickCapture open={captureOpen} onClose={() => setCaptureOpen(false)} />
    </>
  )
}
