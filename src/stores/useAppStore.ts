'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '@/types/database'

interface AppStore {
  usuario: Usuario | null
  setUsuario: (u: Usuario | null) => void
  musicChoice: 'waka' | 'copa' | 'none' | null
  setMusicChoice: (c: 'waka' | 'copa' | 'none') => void
  musicPlaying: boolean
  setMusicPlaying: (p: boolean) => void
  showMusicModal: boolean
  setShowMusicModal: (s: boolean) => void
  notifCount: number
  setNotifCount: (n: number) => void
  sidebarOpen: boolean
  setSidebarOpen: (o: boolean) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      usuario: null,
      setUsuario: (u) => set({ usuario: u }),
      musicChoice: null,
      setMusicChoice: (c) => set({ musicChoice: c, showMusicModal: false }),
      musicPlaying: false,
      setMusicPlaying: (p) => set({ musicPlaying: p }),
      showMusicModal: false,
      setShowMusicModal: (s) => set({ showMusicModal: s }),
      notifCount: 0,
      setNotifCount: (n) => set({ notifCount: n }),
      sidebarOpen: false,
      setSidebarOpen: (o) => set({ sidebarOpen: o }),
    }),
    {
      name: 'club-del-pleno-store',
      partialize: (state) => ({
        musicChoice: state.musicChoice,
        usuario: state.usuario,
      }),
    }
  )
)
