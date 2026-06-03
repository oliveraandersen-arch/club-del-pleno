'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, BellOff, Check, CheckCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { BackButton } from '@/components/ui/BackButton'
import { useAppStore } from '@/stores/useAppStore'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Notificacion } from '@/types/database'
import { toast } from 'sonner'

const TIPO_ICONS: Record<string, string> = {
  prediccion: '⚽',
  ranking: '📈',
  logro: '🏆',
  comentario: '💬',
  liga: '🏅',
  resultado: '🎯',
  bienvenida: '👋',
}

export default function NotificacionesPage() {
  const router = useRouter()
  const supabase = createClient()
  const { setNotifCount } = useAppStore()

  const [notifs, setNotifs] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) setNotifs(data)

      // Mark all as read
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('notificaciones') as any)
        .update({ leida: true })
        .eq('usuario_id', user.id)
        .eq('leida', false)

      setNotifCount(0)
      setLoading(false)
    }
    load()

    // Realtime subscription
    const channel = supabase
      .channel('notificaciones')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificaciones' }, (payload) => {
        setNotifs((prev) => [payload.new as Notificacion, ...prev])
        setNotifCount(useAppStore.getState().notifCount + 1)
        toast(payload.new.titulo, { icon: TIPO_ICONS[payload.new.tipo] || '🔔' })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function markAllRead() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('notificaciones') as any).update({ leida: true }).eq('usuario_id', user.id)
    setNotifs((prev) => prev.map((n) => ({ ...n, leida: true })))
    setNotifCount(0)
  }

  const unreadCount = notifs.filter((n) => !n.leida).length

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <BackButton href="/dashboard" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900">
              🔔 <span className="text-gold-gradient">Notificaciones</span>
            </h1>
            {unreadCount > 0 && (
              <p className="text-gray-400 mt-1">{unreadCount} sin leer</p>
            )}
          </div>
          {unreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-300"
              style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid #DDD5C8' }}
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas como leídas
            </motion.button>
          )}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-6xl">⚽</motion.div>
          </div>
        ) : notifs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-16 text-center"
          >
            <BellOff className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-black text-gray-900 mb-2">Sin notificaciones</h2>
            <p className="text-gray-400">Te avisaremos cuando haya actividad importante</p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {notifs.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-4 p-4 rounded-2xl transition-all"
                  style={{
                    background: notif.leida ? 'rgba(255,255,255,0.02)' : 'rgba(245,200,66,0.06)',
                    border: notif.leida ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(245,200,66,0.15)',
                  }}
                >
                  <div className="text-2xl flex-shrink-0 w-10 text-center">
                    {TIPO_ICONS[notif.tipo] || '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{notif.titulo}</p>
                    {notif.mensaje && (
                      <p className="text-gray-400 text-sm mt-0.5">{notif.mensaje}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { locale: es, addSuffix: true })}
                    </p>
                  </div>
                  {!notif.leida && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#F5C842' }} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
