import { useState } from 'react'
import { format } from 'date-fns'
import {
  CheckSquare, RefreshCw, Target, DollarSign,
  ArrowUpRight, Sparkles, ChevronRight, Plus,
  Circle, CircleDot, CheckCircle2, Zap, TrendingUp,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent, cn } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import StatWidget from '@/components/dashboard/StatWidget'
import TaskDonutChart from '@/components/dashboard/TaskDonutChart'
import HabitBarChart from '@/components/dashboard/HabitBarChart'
import GoalProgressList from '@/components/dashboard/GoalProgressList'
import { useTaskCounts, useTodayTasks, useUpdateTask } from '@/hooks/useTasks'
import { useHabitsToday, useHabitWeeklyStats, useToggleHabit } from '@/hooks/useHabits'
import { useGoals } from '@/hooks/useGoals'
import { useFinanceMonth } from '@/hooks/useFinance'
import { useAppStore } from '@/store/useAppStore'

const PRIORITY_DOT = {
  urgent:  'bg-red-500',
  high:    'bg-orange-500',
  medium:  'bg-yellow-500',
  low:     'bg-zinc-600',
}

const STATUS_ICON = {
  todo:        <Circle className="w-4 h-4 text-zinc-500" />,
  in_progress: <CircleDot className="w-4 h-4 text-blue-400" />,
  done:        <CheckCircle2 className="w-4 h-4 text-green-400" />,
}

function TodayTaskRow({ task, onToggle }) {
  const isDone = task.status === 'done'

  return (
    <div
      className={cn(
        'flex items-center gap-3 py-2.5 px-3 rounded-lg group transition-all duration-150',
        'hover:bg-white/[0.03]',
        isDone && 'opacity-60'
      )}
    >
      <button
        onClick={() => onToggle(task)}
        className="flex-shrink-0 hover:scale-110 transition-transform"
      >
        {STATUS_ICON[task.status]}
      </button>

      <div className="flex-1 min-w-0">
        <span className={cn(
          'text-sm text-zinc-200 group-hover:text-white transition-colors',
          isDone && 'line-through text-zinc-500'
        )}>
          {task.title}
        </span>
        {task.projects && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: task.projects.color ?? '#7c3aed' }}
            />
            <span className="text-xs text-zinc-600">{task.projects.name}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className={cn('w-1.5 h-1.5 rounded-full', PRIORITY_DOT[task.priority])} />
        {task.due_date && (
          <span className="text-xs text-zinc-600">
            {format(new Date(task.due_date), 'MMM d')}
          </span>
        )}
      </div>
    </div>
  )
}

function HabitCheckRow({ habit, onToggle }) {
  return (
    <button
      onClick={() => onToggle(habit)}
      className={cn(
        'flex items-center gap-3 w-full py-2 px-3 rounded-lg transition-all duration-150',
        'hover:bg-white/[0.03] group text-left'
      )}
    >
      <div
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
          habit.completed
            ? 'border-green-500 bg-green-500/20'
            : 'border-zinc-600 group-hover:border-zinc-400'
        )}
        style={habit.completed ? {} : { borderColor: habit.color }}
      >
        {habit.completed && (
          <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-sm">{habit.icon}</span>
      <span className={cn(
        'text-sm transition-colors',
        habit.completed ? 'text-zinc-500 line-through' : 'text-zinc-200 group-hover:text-white'
      )}>
        {habit.name}
      </span>
      <span className={cn(
        'ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded',
        habit.completed ? 'text-green-400 bg-green-500/10' : 'text-zinc-600 bg-white/[0.03]'
      )}>
        {habit.completed ? 'Done' : 'Pending'}
      </span>
    </button>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile, setCaptureOpen } = useAppStore()
  const today = format(new Date(), 'EEEE, MMMM d')
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  // Data hooks
  const { data: taskCounts, isLoading: countsLoading } = useTaskCounts()
  const { data: todayTasks, isLoading: tasksLoading } = useTodayTasks()
  const { data: habitsToday, isLoading: habitsLoading } = useHabitsToday()
  const { data: weeklyHabits, isLoading: weeklyLoading } = useHabitWeeklyStats()
  const { data: goals, isLoading: goalsLoading } = useGoals({ status: 'active' })
  const { data: finance, isLoading: financeLoading } = useFinanceMonth()

  // Mutations
  const updateTask = useUpdateTask()
  const toggleHabit = useToggleHabit()

  // Derived
  const habitsCompleted = habitsToday?.filter(h => h.completed).length ?? 0
  const habitsTotal = habitsToday?.length ?? 0
  const netIncome = finance?.net ?? 0
  const freedomGap = (profile?.freedom_number ?? 0) - (profile?.current_passive_income ?? 0)

  const handleToggleTask = (task) => {
    const nextStatus = task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in_progress' : 'done'
    updateTask.mutate({ id: task.id, status: nextStatus })
  }

  const handleToggleHabit = (habit) => {
    toggleHabit.mutate({
      habitId: habit.id,
      completed: !habit.completed,
      logId: habit.log_id,
    })
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-sm text-zinc-500 mt-1">{today} · Here's your Life OS overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCaptureOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Capture
          </Button>
          <Button
            variant="primary"
            size="sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Briefing
          </Button>
        </div>
      </div>

      {/* Stat widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatWidget
          label="Tasks today"
          value={todayTasks?.length ?? '—'}
          sub={`${todayTasks?.filter(t => t.status === 'done').length ?? 0} completed`}
          icon={CheckSquare}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
          trend="up"
          trendValue={taskCounts?.in_progress ? `${taskCounts.in_progress} active` : null}
          loading={tasksLoading}
          onClick={() => navigate('/tasks')}
        />
        <StatWidget
          label="Habits done today"
          value={habitsTotal ? `${habitsCompleted}/${habitsTotal}` : '—'}
          sub={habitsTotal ? `${Math.round((habitsCompleted / habitsTotal) * 100)}% completion` : 'No habits set'}
          icon={RefreshCw}
          iconColor="text-violet-400"
          iconBg="bg-violet-500/10"
          trend={habitsCompleted === habitsTotal && habitsTotal > 0 ? 'up' : 'neutral'}
          trendValue={habitsCompleted === habitsTotal && habitsTotal > 0 ? '🔥 Perfect day!' : null}
          loading={habitsLoading}
          onClick={() => navigate('/habits')}
        />
        <StatWidget
          label="Active goals"
          value={goals?.length ?? '—'}
          sub={goals?.filter(g => g.progress_percent >= 75).length
            ? `${goals.filter(g => g.progress_percent >= 75).length} near completion`
            : 'Keep pushing'}
          icon={Target}
          iconColor="text-fuchsia-400"
          iconBg="bg-fuchsia-500/10"
          loading={goalsLoading}
          onClick={() => navigate('/goals')}
        />
        <StatWidget
          label="Net income (month)"
          value={financeLoading ? null : netIncome >= 0
            ? `$${netIncome.toLocaleString()}`
            : `-$${Math.abs(netIncome).toLocaleString()}`}
          sub={profile?.freedom_number
            ? `$${Math.abs(freedomGap).toLocaleString()} gap to freedom`
            : 'Set your freedom number'}
          icon={DollarSign}
          iconColor={netIncome >= 0 ? 'text-green-400' : 'text-red-400'}
          iconBg={netIncome >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}
          trend={netIncome >= 0 ? 'up' : 'down'}
          trendValue={finance?.income ? `$${finance.income.toLocaleString()} in` : null}
          loading={financeLoading}
          onClick={() => navigate('/finance')}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TaskDonutChart counts={taskCounts} loading={countsLoading} />
        <div className="lg:col-span-2">
          <HabitBarChart data={weeklyHabits} loading={weeklyLoading} />
        </div>
      </div>

      {/* Main content row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Today's Tasks */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-zinc-400" />
                <CardTitle>Today's Tasks</CardTitle>
              </div>
              <button
                onClick={() => navigate('/tasks')}
                className="flex items-center gap-0.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                All tasks <ChevronRight className="w-3 h-3" />
              </button>
            </CardHeader>
            <CardContent className="pt-0">
              {tasksLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 bg-white/[0.03] rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : !todayTasks?.length ? (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
                    <CheckSquare className="w-5 h-5 text-zinc-600" />
                  </div>
                  <p className="text-sm text-zinc-500">No tasks for today</p>
                  <button
                    onClick={() => setCaptureOpen(true)}
                    className="mt-2 text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 mx-auto transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add a task
                  </button>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {todayTasks.map(task => (
                    <TodayTaskRow key={task.id} task={task} onToggle={handleToggleTask} />
                  ))}
                  <div className="pt-2">
                    <button
                      onClick={() => setCaptureOpen(true)}
                      className="flex items-center gap-2 px-3 py-2 w-full text-xs text-zinc-600 hover:text-zinc-400 transition-colors rounded-lg hover:bg-white/[0.02]"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add task
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Habits today */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-zinc-400" />
                <CardTitle>Habits</CardTitle>
              </div>
              <div className="text-xs text-zinc-500">
                {habitsCompleted}/{habitsTotal} done
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-0.5">
              {habitsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 bg-white/[0.03] rounded-lg animate-pulse" />
                ))
              ) : !habitsToday?.length ? (
                <div className="py-6 text-center">
                  <p className="text-sm text-zinc-500 mb-1">No habits set</p>
                  <button
                    onClick={() => navigate('/habits')}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Set up habits →
                  </button>
                </div>
              ) : (
                habitsToday.map(habit => (
                  <HabitCheckRow key={habit.id} habit={habit} onToggle={handleToggleHabit} />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Goals progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GoalProgressList goals={goals} loading={goalsLoading} />

        {/* Finance Pulse */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-zinc-400" />
              <CardTitle>Finance Pulse</CardTitle>
            </div>
            <button
              onClick={() => navigate('/finance')}
              className="flex items-center gap-0.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </CardHeader>
          <CardContent className="pt-0">
            {financeLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-12 bg-white/[0.03] rounded-lg animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Income vs Expense bars */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                      Income
                    </span>
                    <span className="text-green-400 font-medium tabular-nums">
                      ${(finance?.income ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-700"
                      style={{ width: `${finance?.income && finance?.expenses ? Math.min((finance.income / Math.max(finance.income, finance.expenses)) * 100, 100) : 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                      Expenses
                    </span>
                    <span className="text-red-400 font-medium tabular-nums">
                      ${(finance?.expenses ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all duration-700"
                      style={{ width: `${finance?.income && finance?.expenses ? Math.min((finance.expenses / Math.max(finance.income, finance.expenses)) * 100, 100) : 0}%` }}
                    />
                  </div>
                </div>

                {/* Net */}
                <div className="pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" />
                      Net
                    </span>
                    <span className={cn(
                      'text-sm font-bold tabular-nums',
                      netIncome >= 0 ? 'text-green-400' : 'text-red-400'
                    )}>
                      {netIncome >= 0 ? '+' : '-'}${Math.abs(netIncome).toLocaleString()}
                    </span>
                  </div>
                  {profile?.freedom_number && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-zinc-600 mb-1">
                        <span>Freedom goal</span>
                        <span>${profile.freedom_number.toLocaleString()}/mo</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full"
                          style={{
                            width: `${Math.min(((profile.current_passive_income ?? 0) / profile.freedom_number) * 100, 100)}%`
                          }}
                        />
                      </div>
                      <p className="text-xs text-zinc-600 mt-1 text-right">
                        {Math.round(((profile.current_passive_income ?? 0) / profile.freedom_number) * 100)}% to 🇪🇸 Spain
                      </p>
                    </div>
                  )}
                </div>

                {/* Recent entries */}
                {finance?.entries?.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {finance.entries.slice(0, 3).map(entry => (
                      <div key={entry.id} className="flex items-center justify-between py-1">
                        <div className="min-w-0">
                          <p className="text-xs text-zinc-300 truncate">{entry.title}</p>
                          <p className="text-[10px] text-zinc-600">{entry.category}</p>
                        </div>
                        <span className={cn(
                          'text-xs font-medium tabular-nums ml-3',
                          entry.type === 'income' ? 'text-green-400' : 'text-red-400'
                        )}>
                          {entry.type === 'income' ? '+' : '-'}${entry.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {!finance?.entries?.length && (
                  <div className="text-center py-4">
                    <p className="text-xs text-zinc-600">No entries this month</p>
                    <button
                      onClick={() => navigate('/finance')}
                      className="text-xs text-violet-400 hover:text-violet-300 mt-1 transition-colors"
                    >
                      Add income or expense →
                    </button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
