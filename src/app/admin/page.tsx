'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield, Users, Trophy, Edit, CheckCircle,
  Loader2, X, Activity, Database, AlertCircle, RefreshCw
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { BackButton } from '@/components/ui/BackButton'
import { toast } from 'sonner'
import type { PartidoConEquipos, Usuario } from '@/types/database'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getFlagEmoji } from '@/components/features/MatchCard'
import { FASES } from '@/lib/constants'

type Tab = 'dashboard' | 'resultados' | 'partidos' | 'usuarios'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()

  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('dashboard')
  const [partidos, setPartidos] = useState<PartidoConEquipos[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [stats, setStats] = useState({ usuarios: 0, predicciones: 0, comentarios: 0, ligas: 0, partidos_jugados: 0 })
  const [editPartido, setEditPartido] = useState<PartidoConEquipos | null>(null)
  const [resultLocal, setResultLocal] = useState(0)
  const [resultVisitante, setResultVisitante] = useState(0)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setRefreshing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/dashboard'); return }

      const { data: userData } = await supabase.from('usuarios').select('*').eq('id', user.id).single()
      if (!(userData as { es_admin?: boolean } | null)?.es_admin) { router.push('/dashboard'); return }

      setAuthorized(true)

      const [
        { count: uCount },
        { count: pCount },
        { count: cCount },
        { count: lCount },
      ] = await Promise.all([
        supabase.from('usuarios').select('*', { count: 'exact', head: true }),
        supabase.from('predicciones').select('*', { count: 'exact', head: true }),
        supabase.from('comentarios').select('*', { count: 'exact', head: true }),
        supabase.from('ligas').select('*', { count: 'exact', head: true }),
      ])

      const { data: pData } = await supabase
        .from('partidos')
        .select(`*, equipo_local:equipos!partidos_equipo_local_id_fkey(*), equipo_visitante:equipos!partidos_equipo_visitante_id_fkey(*)`)
        .order('fecha')
      if (pData) setPartidos(pData as unknown as PartidoConEquipos[])

      const { data: uData } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (uData) setUsuarios(uData)

      setStats({
        usuarios: uCount || 0,
        predicciones: pCount || 0,
        comentarios: cCount || 0,
        ligas: lCount || 0,
        partidos_jugados: (pData as unknown as PartidoConEquipos[])?.filter(p => p.estado === 'finalizado').length || 0,
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  async function saveResult() {
    if (!editPartido) return
    setSaving(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('partidos') as any).update({
        goles_local: resultLocal,
        goles_visitante: resultVisitante,
        estado: 'finalizado',
      }).eq('id', editPartido.id)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: preds } = await (supabase.from('predicciones') as any).select('*').eq('partido_id', editPartido.id)

      if (preds) {
        for (const pred of preds as { id: string; usuario_id: string; goles_local: number; goles_visitante: number }[]) {
          let tipo: string, puntos: number

          if (pred.goles_local === resultLocal && pred.goles_visitante === resultVisitante) {
            tipo = 'exacto'; puntos = 5
          } else if ((pred.goles_local - pred.goles_visitante) === (resultLocal - resultVisitante) && resultLocal !== resultVisitante) {
            tipo = 'diferencia'; puntos = 4
          } else if (pred.goles_local > pred.goles_visitante && resultLocal > resultVisitante) {
            tipo = 'ganador'; puntos = 3
          } else if (pred.goles_local < pred.goles_visitante && resultLocal < resultVisitante) {
            tipo = 'ganador'; puntos = 3
          } else if (pred.goles_local === pred.goles_visitante && resultLocal === resultVisitante) {
            tipo = 'empate'; puntos = 3
          } else {
            tipo = 'error'; puntos = 0
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('predicciones') as any).update({ tipo_acierto: tipo, puntos_obtenidos: puntos }).eq('id', pred.id)

          if (puntos > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.rpc as any)('actualizar_xp_usuario', { p_usuario_id: pred.usuario_id, p_xp: puntos * 5 })
          }
        }
      }

      toast.success(`Resultado ${resultLocal}-${resultVisitante} guardado. Puntos calculados.`, { icon: '✅' })
      setEditPartido(null)
      load()
    } catch {
      toast.error('Error al guardar resultado')
    } finally {
      setSaving(false)
    }
  }

  async function toggleAdmin(userId: string, esAdmin: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('usuarios') as any).update({ es_admin: !esAdmin }).eq('id', userId)
    setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, es_admin: !esAdmin } : u))
    toast.success(esAdmin ? 'Admin removido' : 'Admin asignado')
  }

  const pendientes = partidos.filter(p => p.estado !== 'finalizado')
  const finalizados = partidos.filter(p => p.estado === 'finalizado')

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-6xl">⚽</motion.div>
        </div>
      </AppLayout>
    )
  }

  if (!authorized) return null

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <BackButton href="/dashboard" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl" style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.2)' }}>
              <Shield className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Panel Admin</h1>
              <p className="text-gray-400 text-sm">Club del Pleno — Mundial 2026</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={load}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-300"
            style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid #D4C8B8' }}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </motion.button>
        </motion.div>

        {/* Stats rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Usuarios', value: stats.usuarios, icon: Users, color: '#60A5FA' },
            { label: 'Predicciones', value: stats.predicciones, icon: Activity, color: '#A78BFA' },
            { label: 'Ligas', value: stats.ligas, icon: Trophy, color: '#B8860B' },
            { label: 'Comentarios', value: stats.comentarios, icon: Database, color: '#34D399' },
            { label: 'Partidos jugados', value: stats.partidos_jugados, icon: CheckCircle, color: '#F472B6' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-2xl p-4 text-center"
            >
              <s.icon className="w-4 h-4 mx-auto mb-2" style={{ color: s.color }} />
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Alerta si hay partidos pendientes */}
        {pendientes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-5 py-3 rounded-2xl"
            style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.2)' }}
          >
            <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0" />
            <span className="text-yellow-300 text-sm font-medium">
              {pendientes.length} partido{pendientes.length !== 1 ? 's' : ''} sin resultado cargado
            </span>
            <button
              onClick={() => setTab('resultados')}
              className="ml-auto text-xs font-bold text-amber-700 hover:underline"
            >
              Cargar resultados →
            </button>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(0,0,0,0.04)' }}>
          {([
            ['dashboard', '📊 Resumen'],
            ['resultados', `🎯 Resultados${pendientes.length > 0 ? ` (${pendientes.length})` : ''}`],
            ['partidos', '⚽ Partidos'],
            ['usuarios', '👥 Usuarios'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: tab === key ? 'rgba(245,200,66,0.15)' : 'transparent',
                color: tab === key ? '#F5C842' : '#6B7280',
                border: tab === key ? '1px solid rgba(245,200,66,0.25)' : '1px solid transparent',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* DASHBOARD */}
          {tab === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-5">
                  <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" /> Estado del Torneo
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Total de partidos', value: partidos.length, color: '#1A1A1A' },
                      { label: '✅ Finalizados', value: finalizados.length, color: '#34D399' },
                      { label: '⏱ En curso', value: partidos.filter(p => p.estado === 'en_curso').length, color: '#B8860B' },
                      { label: '📅 Programados', value: partidos.filter(p => p.estado === 'programado').length, color: '#60A5FA' },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between items-center py-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <span className="text-sm text-gray-600">{item.label}</span>
                        <span className="font-bold" style={{ color: item.color }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-5">
                  <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-700" /> Próximos a cargar
                  </h3>
                  {pendientes.slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center gap-2 py-2 border-b text-sm" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <span>{getFlagEmoji(p.equipo_local.pais)}</span>
                      <span className="text-white font-medium">{p.equipo_local.nombre_corto}</span>
                      <span className="text-gray-500">vs</span>
                      <span className="text-white font-medium">{p.equipo_visitante.nombre_corto}</span>
                      <span>{getFlagEmoji(p.equipo_visitante.pais)}</span>
                      <button
                        onClick={() => { setEditPartido(p); setResultLocal(0); setResultVisitante(0); setTab('resultados') }}
                        className="ml-auto text-xs font-bold px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(245,200,66,0.1)', color: '#B8860B' }}
                      >
                        Cargar
                      </button>
                    </div>
                  ))}
                  {pendientes.length === 0 && (
                    <div className="text-center text-gray-500 py-4 text-sm flex items-center gap-2 justify-center">
                      <CheckCircle className="w-4 h-4 text-green-400" /> Todos los resultados cargados
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULTADOS */}
          {tab === 'resultados' && (
            <motion.div key="resultados" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {pendientes.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                  <p className="text-gray-900 font-bold">Todos los resultados están cargados</p>
                </div>
              ) : (
                pendientes.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid #E5DDD0' }}
                  >
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <span className="text-xl">{getFlagEmoji(p.equipo_local.pais)}</span>
                      <span className="font-bold text-gray-900 text-sm">{p.equipo_local.nombre}</span>
                      <span className="text-gray-500 text-xs">vs</span>
                      <span className="font-bold text-gray-900 text-sm">{p.equipo_visitante.nombre}</span>
                      <span className="text-xl">{getFlagEmoji(p.equipo_visitante.pais)}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-500 capitalize">{FASES[p.fase as keyof typeof FASES] || p.fase}</span>
                      <span className="text-xs text-gray-600">{format(new Date(p.fecha), "d MMM", { locale: es })}</span>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => { setEditPartido(p); setResultLocal(0); setResultVisitante(0) }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
                        style={{ background: 'linear-gradient(135deg, #F5C842, #D4A017)', color: '#050810' }}
                      >
                        <Edit className="w-3 h-3" /> Cargar resultado
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}

              {finalizados.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-3 font-medium">Resultados ya cargados ({finalizados.length})</p>
                  <div className="space-y-2">
                    {finalizados.map(p => (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl text-sm opacity-60"
                        style={{ background: 'rgba(0,0,0,0.03)' }}>
                        <span>{getFlagEmoji(p.equipo_local.pais)}</span>
                        <span className="text-gray-900">{p.equipo_local.nombre_corto}</span>
                        <span className="font-black text-gray-900 px-2">{p.goles_local} - {p.goles_visitante}</span>
                        <span className="text-gray-900">{p.equipo_visitante.nombre_corto}</span>
                        <span>{getFlagEmoji(p.equipo_visitante.pais)}</span>
                        <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Cargado
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* PARTIDOS */}
          {tab === 'partidos' && (
            <motion.div key="partidos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {(['grupos', 'octavos', 'cuartos', 'semifinal', 'tercer_puesto', 'final'] as const).map(fase => {
                const pp = partidos.filter(p => p.fase === fase)
                if (pp.length === 0) return null
                return (
                  <div key={fase}>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-4 mb-2">
                      {FASES[fase] || fase}
                    </p>
                    {pp.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl text-sm mb-1"
                        style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid #E5DDD0' }}>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          p.estado === 'finalizado' ? 'bg-green-500/20 text-green-400' :
                          p.estado === 'en_curso' ? 'bg-yellow-500/20 text-amber-700' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>{p.estado}</span>
                        <span className="text-gray-300 flex-1">
                          {getFlagEmoji(p.equipo_local.pais)} {p.equipo_local.nombre_corto}
                          {p.estado === 'finalizado' && <span className="mx-2 font-black text-gray-900">{p.goles_local}-{p.goles_visitante}</span>}
                          {p.estado !== 'finalizado' && <span className="mx-2 text-gray-500">vs</span>}
                          {p.equipo_visitante.nombre_corto} {getFlagEmoji(p.equipo_visitante.pais)}
                        </span>
                        <span className="text-gray-600 text-xs">{format(new Date(p.fecha), "d MMM HH:mm", { locale: es })}</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </motion.div>
          )}

          {/* USUARIOS */}
          {tab === 'usuarios' && (
            <motion.div key="usuarios" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              {usuarios.map((u, i) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid #E5DDD0' }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #2A3A52, #0F1E38)', color: '#555' }}>
                    {u.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{u.username}</span>
                      {u.es_admin && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                          style={{ background: 'rgba(245,200,66,0.15)', color: '#B8860B' }}>ADMIN</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm flex-shrink-0">
                    <div className="text-center">
                      <div className="font-bold text-gray-900">{u.puntos_totales}</div>
                      <div className="text-xs text-gray-600">pts</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-900">Nv.{u.nivel}</div>
                      <div className="text-xs text-gray-600">{u.xp} XP</div>
                    </div>
                    <button
                      onClick={() => toggleAdmin(u.id, u.es_admin)}
                      className="text-xs px-3 py-1.5 rounded-xl font-semibold transition-all"
                      style={{
                        background: u.es_admin ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
                        border: u.es_admin ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.1)',
                        color: u.es_admin ? '#F87171' : '#9CA3AF',
                      }}
                    >
                      {u.es_admin ? 'Quitar admin' : 'Hacer admin'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal cargar resultado */}
        <AnimatePresence>
          {editPartido && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
              onClick={() => setEditPartido(null)}
            >
              <motion.div
                initial={{ scale: 0.8, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="glass rounded-3xl p-8 max-w-sm w-full"
                style={{ border: '1px solid rgba(245,200,66,0.2)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-black text-gray-900">Cargar Resultado</h2>
                  <button onClick={() => setEditPartido(null)} className="text-gray-500 hover:text-gray-900">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-6 capitalize">
                  {FASES[editPartido.fase as keyof typeof FASES]} · {format(new Date(editPartido.fecha), "d 'de' MMMM", { locale: es })}
                </p>

                <div className="flex items-center justify-between gap-4 mb-8">
                  <div className="text-center flex-1">
                    <div className="text-4xl mb-2">{getFlagEmoji(editPartido.equipo_local.pais)}</div>
                    <div className="font-bold text-gray-900 text-sm">{editPartido.equipo_local.nombre}</div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex flex-col items-center gap-1">
                      <button onClick={() => setResultLocal(v => Math.min(20, v + 1))}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold text-gray-900 hover:text-amber-700 transition-colors"
                        style={{ background: 'rgba(0,0,0,0.06)' }}>+</button>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl font-black text-gray-900"
                        style={{ background: 'rgba(245,200,66,0.1)', border: '2px solid rgba(245,200,66,0.3)' }}>
                        {resultLocal}
                      </div>
                      <button onClick={() => setResultLocal(v => Math.max(0, v - 1))}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold text-gray-900 hover:text-red-400 transition-colors"
                        style={{ background: 'rgba(0,0,0,0.06)' }}>−</button>
                    </div>
                    <span className="text-gray-500 text-3xl font-black">:</span>
                    <div className="flex flex-col items-center gap-1">
                      <button onClick={() => setResultVisitante(v => Math.min(20, v + 1))}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold text-gray-900 hover:text-amber-700 transition-colors"
                        style={{ background: 'rgba(0,0,0,0.06)' }}>+</button>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl font-black text-gray-900"
                        style={{ background: 'rgba(245,200,66,0.1)', border: '2px solid rgba(245,200,66,0.3)' }}>
                        {resultVisitante}
                      </div>
                      <button onClick={() => setResultVisitante(v => Math.max(0, v - 1))}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold text-gray-900 hover:text-red-400 transition-colors"
                        style={{ background: 'rgba(0,0,0,0.06)' }}>−</button>
                    </div>
                  </div>

                  <div className="text-center flex-1">
                    <div className="text-4xl mb-2">{getFlagEmoji(editPartido.equipo_visitante.pais)}</div>
                    <div className="font-bold text-gray-900 text-sm">{editPartido.equipo_visitante.nombre}</div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={saving}
                  onClick={saveResult}
                  className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #F5C842, #D4A017)', color: '#050810' }}
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  {saving ? 'Calculando puntos...' : `Confirmar ${resultLocal} - ${resultVisitante}`}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
