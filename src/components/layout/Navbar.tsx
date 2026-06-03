'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Trophy, BarChart2, Users, Globe, Shield, Star, Bell,
  Menu, X, Home, Swords, LogOut, ChevronDown
} from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/prode', label: 'Prode', icon: Swords },
  { href: '/ranking', label: 'Ranking', icon: Trophy },
  { href: '/mundial', label: 'Mundial', icon: Globe },
  { href: '/ligas', label: 'Mis Ligas', icon: Users },
  { href: '/estadisticas', label: 'Stats', icon: BarChart2 },
]

export function Navbar() {
  const pathname = usePathname()
  const { usuario, notifCount, setSidebarOpen, sidebarOpen } = useAppStore()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 h-16"
      style={{
        background: 'rgba(250, 247, 242, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #E5DDD0',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <motion.div whileHover={{ rotate: 12 }} className="text-2xl">⚽</motion.div>
          <div className="leading-none">
            <span className="text-gold-gradient font-black text-base tracking-tight">CLUB DEL PLENO</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ y: -1 }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all relative"
                  style={{
                    color: isActive ? '#B8860B' : '#6B6260',
                    background: isActive ? 'rgba(184,134,11,0.08)' : 'transparent',
                  }}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      style={{ background: '#B8860B' }}
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Link href="/notificaciones">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 rounded-xl transition-colors"
              style={{ color: '#6B6260', background: 'rgba(0,0,0,0.04)' }}
            >
              <Bell className="w-4 h-4" />
              {notifCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{ background: '#B8860B', color: '#1A1A1A' }}
                >
                  {notifCount > 9 ? '9+' : notifCount}
                </motion.span>
              )}
            </motion.button>
          </Link>

          {/* User menu */}
          {usuario && (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
                style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid #E5DDD0' }}
              >
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                  {usuario.foto_url ? (
                    <img src={usuario.foto_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-xs font-black"
                      style={{ background: 'linear-gradient(135deg, #B8860B, #96700A)', color: '#1A1A1A' }}
                    >
                      {usuario.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:block max-w-[90px] truncate" style={{ color: '#1A1A1A' }}>
                  {usuario.username}
                </span>
                <ChevronDown className="w-3 h-3" style={{ color: '#9A9490' }} />
              </motion.button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-xl overflow-hidden z-50"
                    style={{ background: '#FFFFFF', border: '1px solid #E5DDD0' }}
                  >
                    <Link href={`/perfil/${usuario.username}`} onClick={() => setUserMenuOpen(false)}>
                      <div className="px-4 py-3 hover:bg-amber-50 flex items-center gap-2.5 text-sm" style={{ color: '#1A1A1A' }}>
                        <Star className="w-4 h-4 text-amber-500" /> Mi Perfil
                      </div>
                    </Link>
                    <Link href="/predicciones-especiales" onClick={() => setUserMenuOpen(false)}>
                      <div className="px-4 py-3 hover:bg-amber-50 flex items-center gap-2.5 text-sm" style={{ color: '#1A1A1A' }}>
                        <Globe className="w-4 h-4 text-blue-500" /> Pred. Especiales
                      </div>
                    </Link>
                    {usuario.es_admin && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)}>
                        <div className="px-4 py-3 hover:bg-amber-50 flex items-center gap-2.5 text-sm font-semibold" style={{ color: '#B8860B' }}>
                          <Shield className="w-4 h-4" /> Panel Admin
                        </div>
                      </Link>
                    )}
                    <div className="h-px bg-gray-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 hover:bg-red-50 flex items-center gap-2.5 text-sm text-red-500"
                    >
                      <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile burger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl"
            style={{ color: '#6B6260', background: 'rgba(0,0,0,0.04)' }}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 top-16 z-20 lg:hidden"
            style={{ background: 'rgba(250,247,242,0.98)', backdropFilter: 'blur(12px)' }}
          >
            <nav className="p-5 space-y-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-semibold"
                      style={{
                        color: isActive ? '#B8860B' : '#3A3530',
                        background: isActive ? 'rgba(184,134,11,0.1)' : 'rgba(0,0,0,0.03)',
                        border: isActive ? '1px solid rgba(184,134,11,0.2)' : '1px solid transparent',
                      }}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </motion.div>
                  </Link>
                )
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
