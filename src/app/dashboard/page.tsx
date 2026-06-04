'use client'
export const dynamic = 'force-dynamic'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Trophy, TrendingUp, TrendingDown, Zap, Star, ArrowRight,
  Clock, Users, BarChart2, Flame, Target, Award
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/stores/useAppStore'
import { AppLayout } from '@/components/layout/AppLayout'
import { MatchCard } from '@/components/features/MatchCard'
import { RankingCard } from '@/components/features/RankingCard'
import { getProgresoNivel } from '@/lib/constants'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { PartidoConEquipos, RankingConUsuario, Actividad } from '@/types/database'

export default function DashboardPage() {
  const { usuario, setUsuario } = useAppStore()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [proxPartidos, setProxPartidos] = useState<PartidoConEquipos[]>([])
  const [ranking, setRanking] = useState<RankingConUsuario[]>([])
  const [actividad, setActividad] = useState<(Actividad & { usuario: { username: string; foto_url: string | null } })[]>([])
  const [miRanking, setMiRanking] = useState<RankingConUsuario | null>(null)
  const [stats, setStats] = useState({ exactos: 0, puntos: 0, efectividad: 0, posicion: 0 })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      // Load user profile
      const { data: userData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single()
      if (userData) setUsuario(userData)

      // Load upcoming matches
      const { data: partidos } = await supabase
        .from('partidos')
        .select(`
          *,
          equipo_local:equipos!partidos_equipo_local_id_fkey(*),
          equipo_visitante:equipos!partidos_equipo_visitante_id_fkey(*)
        `)
        .eq('estado', 'programado')
        .order('fecha', { ascending: true })
        .limit(6)

      if (partidos) setProxPartidos(partidos as unknown as PartidoConEquipos[])

      // Load top ranking
      const { data: rankData } = await supabase
        .from('ranking')
        .select('*, usuario:usuarios(*)')
        .eq('torneo_id', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')
        .order('puntos', { ascending: false })
        .limit(5)

      if (rankData) setRanking(rankData as unknown as RankingConUsuario[])

      // My ranking
      const { data: myRank } = await supabase
        .from('ranking')
        .select('*, usuario:usuarios(*)')
        .eq('torneo_id', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')
        .eq('usuario_id', user.id)
        .single()

      if (myRank) {
        const r = myRank as unknown as RankingConUsuario
        setMiRanking(r)
        setStats({
          exactos: r.predicciones_exactas,
          puntos: r.puntos,
          efectividad: r.efectividad,
          posicion: r.posicion ?? 0,
        })
      }

      // Activity feed
      const { data: actData } = await supabase
        .from('actividad')
        .select('*, usuario:usuarios(username, foto_url)')
        .order('created_at', { ascending: false })
        .limit(10)

      if (actData) setActividad(actData as unknown as typeof actividad)

      setLoading(false)
    }
    load()
  }, [])

  const nivelInfo = usuario ? getProgresoNivel(usuario.xp) : null

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="text-6xl"
          >
            ⚽
          </motion.div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              Hola, <span className="text-gold-gradient">{usuario?.nombre_visible || usuario?.username}</span> 👋
            </h1>
            <p className="text-gray-400 mt-1">
              {format(new Date(), "EEEE d 'de' MMMM", { locale: es })} · Mundial 2026
            </p>
          </div>
          <Link href="/prode">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #F5C842, #D4A017)', color: '#050810' }}
            >
              <Target className="w-4 h-4" />
              Predecir
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Posición',
              value: stats.posicion > 0 ? `#${stats.posicion}` : '—',
              icon: Trophy,
              color: '#B8860B',
              bg: 'rgba(245,200,66,0.1)',
              border: 'rgba(245,200,66,0.2)',
              sub: stats.posicion > 0 ? (
                miRanking && miRanking.posicion_anterior && miRanking.posicion_anterior !== stats.posicion ? (
                  <span className={miRanking.posicion_anterior > stats.posicion ? 'rank-up' : 'rank-down'}>
                    {miRanking.posicion_anterior > stats.posicion ? '↑' : '↓'}
                    {Math.abs(miRanking.posicion_anterior - stats.posicion)} lugares
                  </span>
                ) : <span className="text-gray-500">Sin cambios</span>
              ) : <span className="text-gray-500">Sin ranking aún</span>,
            },
            {
              label: 'Puntos Totales',
              value: stats.puntos,
              icon: Star,
              color: '#A78BFA',
              bg: 'rgba(139,92,246,0.1)',
              border: 'rgba(139,92,246,0.2)',
              sub: <span className="text-gray-500">{nivelInfo?.actual.icono} {nivelInfo?.actual.nombre}</span>,
            },
            {
              label: 'Exactos',
              value: stats.exactos,
              icon: Target,
              color: '#34D399',
              bg: 'rgba(52,211,153,0.1)',
              border: 'rgba(52,211,153,0.2)',
              sub: <span className="text-gray-500">Resultados exactos</span>,
            },
            {
              label: 'Efectividad',
              value: `${stats.efectividad}%`,
              icon: BarChart2,
              color: '#60A5FA',
              bg: 'rgba(96,165,250,0.1)',
              border: 'rgba(96,165,250,0.2)',
              sub: <span className="text-gray-500">De predicciones</span>,
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl p-5 card-hover"
              style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-gray-600 font-medium uppercase tracking-wide">{stat.label}</span>
                <stat.icon className="w-4 h-4 flex-shrink-0" style={{ color: stat.color }} />
              </div>
              <div className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs mt-1">{stat.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* XP / Level bar */}
        {nivelInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 glass-gold"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{nivelInfo.actual.icono}</span>
                <div>
                  <div className="font-bold text-gray-900">{nivelInfo.actual.nombre}</div>
                  <div className="text-xs text-gray-600">Nivel {nivelInfo.actual.nivel}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-amber-700">{usuario?.xp} XP</div>
                <div className="text-xs text-gray-500">→ {nivelInfo.siguiente.nombre}</div>
              </div>
            </div>
            <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${nivelInfo.porcentaje}%` }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                className="h-full rounded-full xp-bar"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{nivelInfo.xpEnNivel} XP</span>
              <span>{nivelInfo.porcentaje}%</span>
              <span>{nivelInfo.xpNecesario} XP</span>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming matches */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-700" />
                Próximos Partidos
              </h2>
              <Link href="/prode" className="text-sm text-amber-700 hover:underline flex items-center gap-1">
                Ver todos <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {proxPartidos.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center text-gray-500">
                No hay partidos próximos programados
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {proxPartidos.slice(0, 4).map((partido, i) => (
                  <motion.div
                    key={partido.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <MatchCard partido={partido} compact />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mini ranking */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-700" />
                  Top 5
                </h2>
                <Link href="/ranking" className="text-sm text-amber-700 hover:underline flex items-center gap-1">
                  Ver ranking <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2">
                {ranking.length === 0 ? (
                  <div className="glass rounded-2xl p-6 text-center text-gray-500 text-sm">
                    El ranking se actualizará cuando comiencen los partidos
                  </div>
                ) : (
                  ranking.map((entry, i) => (
                    <RankingCard
                      key={entry.id}
                      entry={entry}
                      index={i}
                      isCurrentUser={entry.usuario_id === usuario?.id}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Activity feed */}
            <div>
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-orange-400" />
                Actividad
              </h2>

              <div className="space-y-2">
                {actividad.length === 0 ? (
                  <div className="glass rounded-2xl p-6 text-center text-gray-500 text-sm">
                    No hay actividad reciente
                  </div>
                ) : (
                  actividad.map((act, i) => (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid #E5DDD0' }}
                    >
                      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold"
                        style={{ background: 'linear-gradient(135deg, #2A3A52, #0F1E38)', color: '#555' }}
                      >
                        {act.usuario?.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-300 leading-relaxed">{act.descripcion}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {format(new Date(act.created_at), "d MMM, HH:mm", { locale: es })}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="space-y-2">
              {[
                { href: '/predicciones-especiales', icon: '🔮', label: 'Predicciones Especiales', desc: 'Campeón, goleador y más' },
                { href: '/ligas', icon: '🏆', label: 'Mis Ligas', desc: 'Competí con tus amigos' },
                { href: '/mundial', icon: '🌍', label: 'Centro del Mundial', desc: 'Grupos y bracket' },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-4 rounded-2xl card-hover"
                    style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid #E5DDD0' }}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600 ml-auto" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
