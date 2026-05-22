import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      // User
      user: null,
      profile: null,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),

      // Quick capture
      captureOpen: false,
      setCaptureOpen: (open) => set({ captureOpen: open }),

      // Active module
      activeModule: 'dashboard',
      setActiveModule: (module) => set({ activeModule: module }),

      // Daily briefing
      briefing: null,
      briefingLoading: false,
      setBriefing: (briefing) => set({ briefing }),
      setBriefingLoading: (loading) => set({ briefingLoading: loading }),
    }),
    {
      name: 'life-os-app',
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
)
