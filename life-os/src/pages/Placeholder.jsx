// Placeholder page — swapped out in Phase 2/3
import { Construction } from 'lucide-react'

export default function Placeholder({ title, description, emoji = '🚧' }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] p-8 text-center">
      <div className="text-5xl mb-4">{emoji}</div>
      <h2 className="text-xl font-semibold text-zinc-200 mb-2">{title}</h2>
      <p className="text-zinc-500 text-sm max-w-sm leading-relaxed">
        {description ?? 'This module is coming in Phase 2. Check back soon!'}
      </p>
      <div className="mt-6 px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs text-violet-400 font-medium">
        Coming Phase 2
      </div>
    </div>
  )
}
