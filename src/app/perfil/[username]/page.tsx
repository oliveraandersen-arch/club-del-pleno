'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Trophy, Star, Target, BarChart2, MessageSquare, Award, Edit3, Share2, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { AchievementModal } from '@/components/features/AchievementModal'
import { getFlagEmoji } from '@/components/features/MatchCard'
import { getProgresoNivel, getNivel } from '@/lib/constants'
import type { Usuario, Logro, Prediccion, Actividad } from '@/types/database'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

type Tab = 'estadisticas' | 'historial' | 'logros'

export default function PerfilPage() {
  const { username } = useParams<{ username: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Usuario | null>(null)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('estadisticas')
  const [logros, setLogros] = useState<(Logro & { desbloqueado: boolean; desbloqueado_at?: string })[]>([])
  const [historial, setHistorial] = useState<(Actividad & { usuario: { username: string } })[]>([])
  const [prediccionStats, setPrediccionStats] = useState({ total: 0, exactos: 0, correctos: 0 })
  const [selectedLogro, setSelectedLogro] = useState<(Logro & { desbloqueado: boolean; desbloqueado_at?: string }) | null>(null)
  const [ranking, setRanking] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user?.id ?? null)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profileData } = await (supabase.from('usuarios') as any)
        .select('*')
        .eq('username', username)
        .single()

      if (!profileData) { router.push('/dashboard'); return }
      const pd = profileData as Usuario
      setProfile(pd)

      // Logros
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [{ data: todosLogros }, { data: desbloqueados }] = await Promise.all([
        (supabase.from('logros') as any).select('*').order('rareza'),
        (supabase.from('usuario_logros') as any).select('*, logro:logros(*)').eq('usuario_id', pd.id),
      ])

      if (todosLogros) {
        const desblSet = new Set((desbloqueados || []).map((d: { logro_id: string }) => d.logro_id))
        const desblMap = new Map((desbloqueados || []).map((d: { logro_id: string; desbloqueado_at: string }) => [d.logro_id, d.desbloqueado_at]))
        setLogros((todosLogros as Logro[]).map((l) => ({
          ...l,
          desbloqueado: desblSet.has(l.id),
          desbloqueado_at: desblMap.get(l.id) as string | undefined,
        })))
      }

      // Historial
      const { data: actData } = await supabase
        .from('actividad')
        .select('*, usuario:usuarios(username)')
        .eq('usuario_id', pd.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (actData) setHistorial(actData as unknown as typeof historial)

      // Predicciones stats
      const { data: preds } = await supabase
        .from('predicciones')
        .select('tipo_acierto')
        .eq('usuario_id', pd.id)

      if (preds) {
        const predsTyped = preds as { tipo_acierto: string | null }[]
        setPrediccionStats({
          total: predsTyped.length,
          exactos: predsTyped.filter((p) => p.tipo_acierto === 'exacto').length,
          correctos: predsTyped.filter((p) => ['exacto', 'diferencia', 'ganador', 'empate'].includes(p.tipo_acierto || '')).length,
        })
      }

      // Ranking position
      const { data: rankData } = await supabase
        .from('ranking')
        .select('posicion')
        .eq('usuario_id', pd.id)
        .eq('torneo_id', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')
        .single()

      if (rankData) setRanking((rankData as { posicion: number | null }).posicion)

      setLoading(false)
    }
    load()
  }, [username])

  const isOwn = currentUser === profile?.id
  const nivelInfo = profile ? getProgresoNivel(profile.xp) : null
  const desbloqueadosCount = logros.filter((l) => l.desbloqueado).length

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    toast.success('¡Link copiado!')
  }

  const RAREZA_ORDER = ['legendario', 'epico', 'raro', 'comun']
  const logrosByRareza = RAREZA_ORDER.map((r) => ({
    rareza: r,
    items: logros.filter((l) => l.rareza === r),
  })).filter((g) => g.items.length > 0)

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-6xl">⚽</motion.div>
        </div>
      </AppLayout>
    )
  }

  if (!profile) return null

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #FFFFFF, #F5F0E8)',
            border: '1px solid #DDD5C8',
          }}
        >
          {/* BG decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #F5C842, transparent)' }} />
          </div>

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <motion.div whileHover={{ scale: 1.05 }} className="relative">
              <div
                className="w-24 h-24 rounded-full overflow-hidden border-4"
                style={{ borderColor: nivelInfo?.actual?.color || '#F5C842' }}
              >
                {profile.foto_url ? (
                  <img src={profile.foto_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-3xl font-black"
                    style={{ background: 'linear-gradient(135deg, #F5C842, #D4A017)', color: '#050810' }}
                  >
                    {profile.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              {/* Level badge */}
              <div
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2"
                style={{
                  background: 'var(--beige)',
                  borderColor: nivelInfo?.actual?.color || '#F5C842',
                  color: nivelInfo?.actual?.color || '#F5C842',
                }}
              >
                {profile.nivel}
              </div>
            </motion.div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-gray-900">
                  {profile.nombre_visible || profile.username}
                </h1>
                {ranking && (
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.3)', color: '#B8860B' }}
                  >
                    #{ranking} Ranking
                  </span>
                )}
              </div>
              <div className="text-gray-400 text-sm mt-1">@{profile.username}</div>

              {profile.frase_personal && (
                <p className="text-gray-300 mt-2 italic">"{profile.frase_personal}"</p>
              )}

              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {nivelInfo && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="text-xl">{nivelInfo.actual.icono}</span>
                    <span style={{ color: nivelInfo.actual.color }}>{nivelInfo.actual.nombre}</span>
                    <span className="text-gray-500">· Nivel {profile.nivel}</span>
                  </div>
                )}
                {profile.pais_favorito && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    {getFlagEmoji(profile.pais_favorito)} {profile.pais_favorito}
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  {desbloqueadosCount} logros
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="p-2.5 rounded-xl text-gray-600 hover:text-gray-900 transition-colors"
                style={{ background: 'rgba(0,0,0,0.04)' }}
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
              {!isOwn && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.2)', color: '#B8860B' }}
                >
                  <UserPlus className="w-4 h-4" /> Seguir
                </motion.button>
              )}
            </div>
          </div>

          {/* XP bar */}
          {nivelInfo && (
            <div className="mt-6">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>{nivelInfo.actual.nombre} · {profile.xp} XP</span>
                <span>→ {nivelInfo.siguiente.nombre} · {nivelInfo.siguiente.xp} XP</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${nivelInfo.porcentaje}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                  className="h-full xp-bar"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Predicciones', value: prediccionStats.total, icon: Target, color: '#60A5FA' },
            { label: 'Exactos', value: profile.predicciones_exactas, icon: Star, color: '#B8860B' },
            { label: 'Efectividad', value: `${prediccionStats.total > 0 ? Math.round((prediccionStats.correctos / prediccionStats.total) * 100) : 0}%`, icon: BarChart2, color: '#34D399' },
            { label: 'Mejor Racha', value: profile.mejor_racha, icon: Trophy, color: '#F472B6' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-4 text-center"
            >
              <s.icon className="w-4 h-4 mx-auto mb-2" style={{ color: s.color }} />
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {(['estadisticas', 'historial', 'logros'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="pb-3 px-4 text-sm font-semibold capitalize transition-colors relative"
              style={{ color: tab === t ? '#F5C842' : '#6B7280' }}
            >
              {t === 'estadisticas' ? '📊 Estadísticas' : t === 'historial' ? '📅 Historial' : '🏆 Logros'}
              {tab === t && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: '#F5C842' }} />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {tab === 'estadisticas' && (
            <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Racha Actual', value: profile.racha_actual, desc: 'partidos seguidos', emoji: '🔥' },
                  { label: 'Mejor Racha', value: profile.mejor_racha, desc: 'racha máxima', emoji: '⚡' },
                  { label: 'Predicciones Exactas', value: profile.predicciones_exactas, desc: 'marcadores exactos', emoji: '🎯' },
                  { label: 'Total Predicciones', value: prediccionStats.total, desc: 'realizadas', emoji: '📊' },
                  { label: 'Logros Desbloqueados', value: desbloqueadosCount, desc: `de ${logros.length} posibles`, emoji: '🏆' },
                  { label: 'XP Total', value: profile.xp, desc: 'puntos de experiencia', emoji: '⭐' },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-4 glass rounded-2xl p-5"
                  >
                    <div className="text-3xl">{s.emoji}</div>
                    <div>
                      <div className="text-2xl font-black text-gray-900">{s.value}</div>
                      <div className="text-sm font-semibold text-gray-300">{s.label}</div>
                      <div className="text-xs text-gray-500">{s.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === 'historial' && (
            <motion.div key="hist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
              {historial.length === 0 ? (
                <div className="glass rounded-2xl p-8 text-center text-gray-500">Sin actividad registrada aún</div>
              ) : (
                historial.map((act, i) => (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-3 p-4 rounded-xl"
                    style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid #E5DDD0' }}
                  >
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: '#F5C842' }} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">{act.descripcion}</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {format(new Date(act.created_at), "d 'de' MMMM, HH:mm", { locale: es })}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {tab === 'logros' && (
            <motion.div key="logros" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="text-sm text-gray-600">
                <span className="text-amber-700 font-bold">{desbloqueadosCount}</span> de <span className="font-bold">{logros.length}</span> logros desbloqueados
              </div>
              {logrosByRareza.map((group) => (
                <div key={group.rareza}>
                  <h3 className="text-sm font-bold mb-3 capitalize" style={{
                    color: group.rareza === 'legendario' ? '#F5C842' : group.rareza === 'epico' ? '#A78BFA' : group.rareza === 'raro' ? '#60A5FA' : '#9CA3AF'
                  }}>
                    {group.rareza === 'legendario' ? '💎 Legendario' : group.rareza === 'epico' ? '⚡ Épico' : group.rareza === 'raro' ? '✨ Raro' : '⚪ Común'}
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {group.items.map((logro, i) => (
                      <motion.button
                        key={logro.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
                        whileHover={{ scale: 1.08 }}
                        onClick={() => setSelectedLogro(logro)}
                        className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
                        style={{
                          background: logro.desbloqueado
                            ? `rgba(${logro.rareza === 'legendario' ? '245,200,66' : logro.rareza === 'epico' ? '139,92,246' : logro.rareza === 'raro' ? '59,130,246' : '107,114,128'},0.15)`
                            : 'rgba(255,255,255,0.02)',
                          border: logro.desbloqueado
                            ? `1px solid rgba(${logro.rareza === 'legendario' ? '245,200,66' : logro.rareza === 'epico' ? '139,92,246' : logro.rareza === 'raro' ? '59,130,246' : '107,114,128'},0.3)`
                            : '1px solid rgba(255,255,255,0.05)',
                          opacity: logro.desbloqueado ? 1 : 0.4,
                        }}
                      >
                        <span className="text-2xl">{logro.desbloqueado ? logro.icono : '🔒'}</span>
                        <span className="text-xs text-gray-600 text-center leading-tight line-clamp-2">{logro.nombre}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Achievement detail modal */}
        <AnimatePresence>
          {selectedLogro && (
            <AchievementModal logro={selectedLogro} onClose={() => setSelectedLogro(null)} />
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
