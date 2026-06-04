'use client'
export const dynamic = 'force-dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { BackButton } from '@/components/ui/BackButton'
import { MatchCard } from '@/components/features/MatchCard'
import { toast } from 'sonner'
import type { PartidoConEquipos, Prediccion } from '@/types/database'
import { FASES } from '@/lib/constants'
import { CommunityPrediction } from '@/components/features/CommunityPrediction'

type Fase = 'todos' | 'grupos' | 'octavos' | 'cuartos' | 'semifinal' | 'final'

export default function ProdePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [partidos, setPartidos] = useState<PartidoConEquipos[]>([])
  const [predicciones, setPredicciones] = useState<Record<string, Prediccion>>({})
  const [faseFilter, setFaseFilter] = useState<Fase>('todos')
  const [selectedPartido, setSelectedPartido] = useState<string | null>(null)
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      const { data: pData } = await supabase
        .from('partidos')
        .select(`
          *,
          equipo_local:equipos!partidos_equipo_local_id_fkey(*),
          equipo_visitante:equipos!partidos_equipo_visitante_id_fkey(*)
        `)
        .order('fecha', { ascending: true })

      if (pData) setPartidos(pData as unknown as PartidoConEquipos[])

      const { data: predData } = await supabase
        .from('predicciones')
        .select('*')
        .eq('usuario_id', user.id)

      if (predData) {
        const map: Record<string, Prediccion> = {}
        ;(predData as Prediccion[]).forEach((p) => { map[p.partido_id] = p })
        setPredicciones(map)
      }

      setLoading(false)
    }
    load()
  }, [])

  async function handlePredict(partidoId: string, gLocal: number, gVisitante: number) {
    if (!userId) return
    setSaving((p) => ({ ...p, [partidoId]: true }))
    try {
      const existing = predicciones[partidoId]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const predTable = supabase.from('predicciones') as any
      if (existing) {
        await predTable.update({ goles_local: gLocal, goles_visitante: gVisitante, updated_at: new Date().toISOString() }).eq('id', existing.id)
      } else {
        await predTable.insert({
          usuario_id: userId,
          partido_id: partidoId,
          goles_local: gLocal,
          goles_visitante: gVisitante,
          tipo_acierto: 'pendiente',
        })
      }

      setPredicciones((p) => ({
        ...p,
        [partidoId]: {
          ...(existing || { id: '', created_at: '', updated_at: '', tipo_acierto: 'pendiente', puntos_obtenidos: 0, comentario: null }),
          partido_id: partidoId,
          usuario_id: userId,
          goles_local: gLocal,
          goles_visitante: gVisitante,
        } as Prediccion,
      }))

      // Save activity
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('actividad') as any).insert({
        usuario_id: userId,
        tipo: 'prediccion',
        descripcion: `Realizó una predicción`,
      })

      toast.success('¡Predicción guardada!', { icon: '⚽' })
    } catch {
      toast.error('Error al guardar la predicción')
    } finally {
      setSaving((p) => ({ ...p, [partidoId]: false }))
    }
  }

  async function handleSaveGoleadores(
    partidoId: string,
    goleadores: { local: { jugador: string; minuto: number | string }[]; visitante: { jugador: string; minuto: number | string }[] }
  ) {
    const existing = predicciones[partidoId]
    if (!existing) return
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('predicciones') as any)
        .update({ goleadores, confirmada: true, updated_at: new Date().toISOString() })
        .eq('id', existing.id)

      setPredicciones(p => ({
        ...p,
        [partidoId]: { ...existing, goleadores: goleadores as unknown as null, confirmada: true },
      }))
      toast.success('¡Goleadores confirmados!', { icon: '⚽' })
    } catch {
      toast.error('Error al guardar goleadores')
    }
  }

  const filteredPartidos = faseFilter === 'todos'
    ? partidos
    : partidos.filter((p) => p.fase === faseFilter)

  const totalPartidos = partidos.length
  const predCount = Object.keys(predicciones).length
  const porcentaje = totalPartidos > 0 ? Math.round((predCount / totalPartidos) * 100) : 0

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-6xl">⚽</motion.div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <BackButton href="/dashboard" />
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <h1 className="text-4xl font-black text-gray-900">
            🎯 <span className="text-gold-gradient">Mis Predicciones</span>
          </h1>
          <p className="text-gray-400">Predecí los resultados antes de que empiece cada partido</p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-gold rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-gray-900 font-bold">{predCount} / {totalPartidos} predicciones</span>
              <span className="text-gray-400 text-sm ml-2">realizadas</span>
            </div>
            <span className="text-amber-700 font-bold">{porcentaje}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${porcentaje}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="h-full xp-bar"
            />
          </div>
          {porcentaje === 100 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 mt-3 text-green-400 text-sm font-semibold"
            >
              <CheckCircle className="w-4 h-4" />
              ¡Completaste todas tus predicciones! Podés ganar el bonus de pleno.
            </motion.div>
          )}
        </motion.div>

        {/* Phase filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['todos', 'grupos', 'octavos', 'cuartos', 'semifinal', 'final'] as const).map((fase) => (
            <motion.button
              key={fase}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFaseFilter(fase)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: faseFilter === fase ? 'rgba(245,200,66,0.15)' : 'rgba(255,255,255,0.04)',
                border: faseFilter === fase ? '1px solid rgba(245,200,66,0.3)' : '1px solid #E5DDD0',
                color: faseFilter === fase ? '#B8860B' : '#6B6260',
              }}
            >
              {fase === 'todos' ? 'Todos' : FASES[fase]}
            </motion.button>
          ))}
        </div>

        {/* Matches grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPartidos.map((partido, i) => (
            <motion.div
              key={partido.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="space-y-2"
            >
              <MatchCard
                partido={partido}
                prediccion={predicciones[partido.id] ?? null}
                onPredict={(gL, gV) => handlePredict(partido.id, gL, gV)}
                onSaveGoleadores={(g) => handleSaveGoleadores(partido.id, g)}
                showResult
              />
              {/* Community prediction stats */}
              <CommunityPrediction partidoId={partido.id} />
            </motion.div>
          ))}
        </div>

        {filteredPartidos.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-400">No hay partidos en esta fase todavía</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
