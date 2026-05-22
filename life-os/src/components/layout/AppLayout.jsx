import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const PAGE_TITLES = {
  '/':          { title: 'Dashboard',         breadcrumb: 'Dashboard' },
  '/tasks':     { title: 'Tasks & Projects',  breadcrumb: 'Tasks & Projects' },
  '/goals':     { title: 'Goals & Vision',    breadcrumb: 'Goals & Vision' },
  '/habits':    { title: 'Habits & Health',   breadcrumb: 'Habits & Health' },
  '/planner':   { title: 'Weekly Planner',    breadcrumb: 'Weekly Planner' },
  '/finance':   { title: 'Revenue & Finance', breadcrumb: 'Revenue & Finance' },
  '/knowledge': { title: 'Knowledge Base',    breadcrumb: 'Knowledge Base' },
  '/life':      { title: 'Life & Fun',        breadcrumb: 'Life & Fun' },
  '/tools':     { title: 'Resources & Tools', breadcrumb: 'Resources & Tools' },
  '/settings':  { title: 'Settings',          breadcrumb: 'Settings' },
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const meta = PAGE_TITLES[pathname] ?? { breadcrumb: '' }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar breadcrumb={meta.breadcrumb} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
