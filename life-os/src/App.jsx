import { Routes, Route, Navigate } from 'react-router-dom'
import { useUser } from '@/hooks/useUser'
import AppLayout from '@/components/layout/AppLayout'
import AuthGuard from '@/components/auth/AuthGuard'
import Auth from '@/pages/Auth'
import Dashboard from '@/pages/Dashboard'
import Placeholder from '@/pages/Placeholder'

export default function App() {
  // Initialize auth listener globally
  useUser()

  return (
    <Routes>
      {/* Public */}
      <Route path="/auth" element={<Auth />} />

      {/* Protected app shell */}
      <Route
        path="/"
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="tasks"    element={<Placeholder title="Tasks & Projects" emoji="📋" description="Full task manager with board view, filters, and project tracking. Coming in Phase 1 completion." />} />
        <Route path="goals"    element={<Placeholder title="Goals & Vision" emoji="🎯" description="Goal hierarchy from 5-year vision down to weekly milestones. Coming in Phase 1 completion." />} />
        <Route path="habits"   element={<Placeholder title="Habits & Health" emoji="🔁" description="Daily habit tracker with streaks, completion charts, and health logging. Coming in Phase 1 completion." />} />
        <Route path="planner"  element={<Placeholder title="Weekly Planner" emoji="📅" description="Time-blocked weekly view with drag-and-drop scheduling. Coming in Phase 3." />} />
        <Route path="finance"  element={<Placeholder title="Revenue & Finance" emoji="💰" description="Income/expense tracker, recurring payments, and passive income goal dashboard. Coming in Phase 2." />} />
        <Route path="knowledge" element={<Placeholder title="Knowledge Base" emoji="📚" description="Your second brain — capture articles, notes, ideas, and books. Coming in Phase 2." />} />
        <Route path="life"     element={<Placeholder title="Life & Fun" emoji="🌍" description="Bucket list, recipes, travel countdown. Coming in Phase 3." />} />
        <Route path="tools"    element={<Placeholder title="Resources & Tools" emoji="⚙️" description="Pomodoro timer, Eisenhower Matrix, time blocking template. Coming in Phase 3." />} />
        <Route path="settings" element={<Placeholder title="Settings" emoji="⚙️" description="Account, billing, and preferences. Coming soon." />} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
