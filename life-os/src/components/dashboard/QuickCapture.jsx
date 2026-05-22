import { useState, useEffect, useRef } from 'react'
import { X, Zap, ArrowRight, Sparkles } from 'lucide-react'
import { useCreateTask } from '@/hooks/useTasks'
import { cn } from '@/components/ui/Card'

const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent']
const PRIORITY_COLORS = {
  low: 'text-zinc-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  urgent: 'text-red-400',
}

export default function QuickCapture({ open, onClose }) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('medium')
  const [isToday, setIsToday] = useState(false)
  const [aiRoute, setAiRoute] = useState(null)
  const inputRef = useRef(null)
  const createTask = useCreateTask()

  useEffect(() => {
    if (open) {
      setText('')
      setPriority('medium')
      setIsToday(false)
      setAiRoute(null)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        open ? onClose() : void 0
      }
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return

    await createTask.mutateAsync({
      title: text.trim(),
      priority,
      is_today: isToday,
      status: 'todo',
    })

    setText('')
    onClose()
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg px-4 animate-slide-up">
        <div className="bg-bg-elevated border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07]">
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-zinc-300">Quick Capture</span>
            <span className="ml-auto text-xs text-zinc-600">Press Enter to save · Esc to close</span>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="What's on your mind? Add a task, idea, or note..."
              className="w-full bg-transparent text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none leading-relaxed"
            />

            {/* Options */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {/* Priority */}
              <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-1">
                {PRIORITY_OPTIONS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150',
                      priority === p
                        ? `bg-white/[0.08] ${PRIORITY_COLORS[p]}`
                        : 'text-zinc-600 hover:text-zinc-400'
                    )}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>

              {/* Today toggle */}
              <button
                type="button"
                onClick={() => setIsToday(!isToday)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150',
                  isToday
                    ? 'bg-violet-500/10 border-violet-500/30 text-violet-300'
                    : 'bg-white/[0.04] border-white/[0.06] text-zinc-500 hover:text-zinc-300'
                )}
              >
                📌 Today
              </button>

              {/* AI route hint */}
              {text.length > 10 && (
                <div className="flex items-center gap-1 text-xs text-zinc-600 ml-auto">
                  <Sparkles className="w-3 h-3 text-violet-500" />
                  <span>AI routing available on Power plan</span>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button
                type="submit"
                disabled={!text.trim() || createTask.isPending}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  text.trim()
                    ? 'bg-accent text-white hover:bg-violet-500 shadow-glow-sm'
                    : 'bg-white/[0.04] text-zinc-600 cursor-not-allowed'
                )}
              >
                {createTask.isPending ? 'Saving...' : 'Save task'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
