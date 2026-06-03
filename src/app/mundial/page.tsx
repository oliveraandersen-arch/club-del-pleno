'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { BackButton } from '@/components/ui/BackButton'
import type { Equipo, PartidoConEquipos } from '@/types/database'
import { getFlagEmoji } from '@/components/features/MatchCard'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type Tab = 'grupos' | 'bracket' | 'equipos'

interface GrupoPos {
  equipo: Equipo
  partidos_jugados: number
  victorias: number
  empates: number
  derrotas: number
  goles_favor: number
  goles_contra: number
  diferencia_goles: number
  puntos: number
}

export default function MundialPage() {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('grupos')
  const [grupos, setGrupos] = useState<Record<string, GrupoPos[]>>({})
  const [partidos, setPartidos] = useState<PartidoConEquipos[]>([])
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: posData }, { data: pData }, { data: eqData }] = await Promise.all([
        supabase.from('grupo_posiciones').select('*, equipo:equipos(*)').order('puntos', { ascending: false }),
        supabase.from('partidos').select(`*, equipo_local:equipos!partidos_equipo_local_id_fkey(*), equipo_visitante:equipos!partidos_equipo_visitante_id_fkey(*)`).order('fecha'),
        supabase.from('equipos').select('*').order('ranking_fifa'),
      ])

      if (posData) {
        const g: Record<string, GrupoPos[]> = {}
        posData.forEach((p: { equipo: Equipo; grupo: string; partidos_jugados: number; victorias: number; empates: number; derrotas: number; goles_favor: number; goles_contra: number; diferencia_goles: number; puntos: number }) => {
          if (!g[p.grupo]) g[p.grupo] = []
          g[p.grupo].push({ ...p, equipo: p.equipo })
        })
        setGrupos(g)
      }

      if (pData) setPartidos(pData as unknown as PartidoConEquipos[])
      if (eqData) setEquipos(eqData)
      setLoading(false)
    }
    load()
  }, [])

  const fases = ['octavos', 'cuartos', 'semifinal', 'tercer_puesto', 'final']
  const partidosPorFase = (fase: string) => partidos.filter((p) => p.fase === fase)

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <BackButton href="/dashboard" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black text-gray-900">
            🌍 <span className="text-gold-gradient">Centro del Mundial</span>
          </h1>
          <p className="text-gray-400 mt-1">Copa del Mundo FIFA 2026 — USA / Canadá / México</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {([['grupos', '📊 Grupos'], ['bracket', '🏆 Bracket'], ['equipos', '⚽ Equipos']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="pb-3 px-4 text-sm font-semibold transition-colors relative"
              style={{ color: tab === key ? '#F5C842' : '#6B7280' }}
            >
              {label}
              {tab === key && <motion.div layoutId="world-tab" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: '#F5C842' }} />}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-6xl">⚽</motion.div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* GRUPOS */}
            {tab === 'grupos' && (
              <motion.div key="grupos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {Object.entries(grupos).sort(([a], [b]) => a.localeCompare(b)).map(([letra, equiposGrupo]) => (
                    <motion.div
                      key={letra}
                      whileHover={{ scale: 1.01 }}
                      className="glass rounded-2xl overflow-hidden"
                    >
                      <div
                        className="px-4 py-3 font-black text-lg text-center"
                        style={{ background: 'linear-gradient(135deg, rgba(245,200,66,0.15), rgba(245,200,66,0.05))', borderBottom: '1px solid rgba(245,200,66,0.15)' }}
                      >
                        <span className="text-gold-gradient">Grupo {letra}</span>
                      </div>
                      {/* Table header */}
                      <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 px-4 py-2 text-xs text-gray-500 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <span>Equipo</span>
                        <span className="text-center">PJ</span>
                        <span className="text-center">GF</span>
                        <span className="text-center">GC</span>
                        <span className="text-center">DG</span>
                        <span className="text-center font-bold">Pts</span>
                      </div>
                      {equiposGrupo.map((pos, i) => (
                        <div
                          key={pos.equipo.id}
                          className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 items-center px-4 py-3 text-sm"
                          style={{
                            borderBottom: i < equiposGrupo.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            background: i < 2 ? 'rgba(34,197,94,0.04)' : 'transparent',
                          }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs text-gray-500 w-3">{i + 1}</span>
                            <span className="text-base">{getFlagEmoji(pos.equipo.pais)}</span>
                            <span className="font-medium text-gray-900 truncate">{pos.equipo.nombre_corto}</span>
                            {i < 2 && <span className="text-xs text-green-400">•</span>}
                          </div>
                          <span className="text-center text-gray-600">{pos.partidos_jugados}</span>
                          <span className="text-center text-gray-600">{pos.goles_favor}</span>
                          <span className="text-center text-gray-600">{pos.goles_contra}</span>
                          <span className="text-center text-gray-600">{pos.diferencia_goles > 0 ? '+' : ''}{pos.diferencia_goles}</span>
                          <span className="text-center font-black text-gray-900">{pos.puntos}</span>
                        </div>
                      ))}
                    </motion.div>
                  ))}
                </div>

                {/* Partidos fase de grupos */}
                <div className="mt-8 space-y-4">
                  <h2 className="text-xl font-black text-gray-900">⚽ Partidos — Fase de Grupos</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {partidos.filter(p => p.fase === 'grupos').map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                        style={{
                          background: p.estado === 'finalizado' ? 'rgba(10,22,40,0.6)' : 'rgba(15,30,56,0.5)',
                          border: p.estado === 'en_curso' ? '1px solid rgba(0,255,135,0.3)' : '1px solid #E5DDD0',
                        }}
                      >
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-xl">{getFlagEmoji(p.equipo_local.pais)}</span>
                          <span className="text-sm font-semibold text-gray-900">{p.equipo_local.nombre_corto}</span>
                        </div>
                        <div className="text-center px-2">
                          {p.estado === 'finalizado' ? (
                            <span className="font-black text-gray-900 text-lg">{p.goles_local} - {p.goles_visitante}</span>
                          ) : p.estado === 'en_curso' ? (
                            <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-xs font-bold" style={{ color: '#00FF87' }}>EN VIVO</motion.span>
                          ) : (
                            <span className="text-xs text-gray-600">{format(new Date(p.fecha), 'HH:mm', { locale: es })}</span>
                          )}
                        </div>
                        <div className="flex-1 flex items-center gap-2 justify-end">
                          <span className="text-sm font-semibold text-gray-900">{p.equipo_visitante.nombre_corto}</span>
                          <span className="text-xl">{getFlagEmoji(p.equipo_visitante.pais)}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* BRACKET */}
            {tab === 'bracket' && (
              <motion.div key="bracket" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="space-y-8">
                  {fases.map((fase) => {
                    const fp = partidosPorFase(fase)
                    if (fp.length === 0) return null
                    return (
                      <div key={fase}>
                        <h2 className="text-lg font-black text-gray-900 mb-4 capitalize">
                          {fase === 'octavos' ? '⚔️ Octavos de Final' : fase === 'cuartos' ? '⚡ Cuartos de Final' : fase === 'semifinal' ? '🌟 Semifinales' : fase === 'tercer_puesto' ? '🥉 Tercer Puesto' : '🏆 FINAL'}
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {fp.map((p, i) => (
                            <motion.div
                              key={p.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              className="rounded-2xl p-4 text-center"
                              style={{
                                background: fase === 'final' ? 'rgba(245,200,66,0.08)' : 'rgba(15,30,56,0.6)',
                                border: fase === 'final' ? '1px solid rgba(245,200,66,0.2)' : '1px solid rgba(255,255,255,0.07)',
                              }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-2xl">{getFlagEmoji(p.equipo_local.pais)}</span>
                                  <span className="text-xs font-semibold text-gray-900">{p.equipo_local.nombre_corto}</span>
                                </div>
                                <div className="text-center">
                                  {p.estado === 'finalizado' ? (
                                    <span className="text-xl font-black text-gray-900">{p.goles_local}-{p.goles_visitante}</span>
                                  ) : (
                                    <span className="text-gray-500 text-sm">vs</span>
                                  )}
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-2xl">{getFlagEmoji(p.equipo_visitante.pais)}</span>
                                  <span className="text-xs font-semibold text-gray-900">{p.equipo_visitante.nombre_corto}</span>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">{p.ciudad}</div>
                              <div className="text-xs text-gray-600">{format(new Date(p.fecha), "d MMM", { locale: es })}</div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  {fases.every((f) => partidosPorFase(f).length === 0) && (
                    <div className="glass rounded-2xl p-12 text-center">
                      <div className="text-5xl mb-4">🏆</div>
                      <p className="text-gray-400">Las eliminatorias comenzarán tras la fase de grupos</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* EQUIPOS */}
            {tab === 'equipos' && (
              <motion.div key="equipos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
                  {equipos.map((eq, i) => (
                    <motion.div
                      key={eq.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      whileHover={{ scale: 1.05 }}
                      className="glass rounded-2xl p-4 text-center card-hover"
                    >
                      <div className="text-4xl mb-2">{getFlagEmoji(eq.pais)}</div>
                      <div className="font-bold text-gray-900 text-sm">{eq.nombre_corto}</div>
                      <div className="text-xs text-gray-500 mt-1">#{eq.ranking_fifa} FIFA</div>
                      {eq.grupo && (
                        <div className="text-xs font-bold mt-1" style={{ color: '#B8860B' }}>Grupo {eq.grupo}</div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </AppLayout>
  )
}
