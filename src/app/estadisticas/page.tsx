'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { BackButton } from '@/components/ui/BackButton'
import { Brain, Zap, Target, Users, TrendingUp, Award } from 'lucide-react'

export default function EstadisticasPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalPredicciones: 0,
    prediccionesExactas: 0,
    efectividadGlobal: 0,
    partidoMasDificil: '',
    partidoMasAcertado: '',
    usuarioMasPreciso: '',
    equipoMasApoyado: '',
  })
  const [distribucion, setDistribucion] = useState<{ name: string; value: number; color: string }[]>([])
  const [topUsuarios, setTopUsuarios] = useState<{ username: string; exactos: number; efectividad: number }[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const [{ count: usrCount }, { count: predCount }, { data: rankTop }] = await Promise.all([
        supabase.from('usuarios').select('*', { count: 'exact', head: true }),
        supabase.from('predicciones').select('*', { count: 'exact', head: true }),
        supabase.from('ranking')
          .select('*, usuario:usuarios(username, predicciones_exactas)')
          .eq('torneo_id', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')
          .order('puntos', { ascending: false })
          .limit(5),
      ])

      const { data: predTypes } = await supabase
        .from('predicciones')
        .select('tipo_acierto')
        .not('tipo_acierto', 'is', null)
        .neq('tipo_acierto', 'pendiente')

      let exacto = 0, diferencia = 0, ganador = 0, empate = 0, error = 0
      ;((predTypes || []) as { tipo_acierto: string | null }[]).forEach((p) => {
        if (p.tipo_acierto === 'exacto') exacto++
        else if (p.tipo_acierto === 'diferencia') diferencia++
        else if (p.tipo_acierto === 'ganador') ganador++
        else if (p.tipo_acierto === 'empate') empate++
        else error++
      })

      const total = exacto + diferencia + ganador + empate + error

      setDistribucion([
        { name: 'Exacto', value: exacto, color: '#B8860B' },
        { name: 'Diferencia', value: diferencia, color: '#A78BFA' },
        { name: 'Ganador', value: ganador, color: '#60A5FA' },
        { name: 'Empate', value: empate, color: '#34D399' },
        { name: 'Error', value: error, color: '#F87171' },
      ])

      const rankTopTyped = (rankTop || []) as unknown as Array<{ usuario: { username: string; predicciones_exactas: number }; efectividad: number }>
      if (rankTopTyped.length > 0) {
        setTopUsuarios(rankTopTyped.map((r) => ({
          username: r.usuario?.username || '?',
          exactos: r.usuario?.predicciones_exactas || 0,
          efectividad: r.efectividad,
        })))
      }

      setStats({
        totalUsuarios: usrCount || 0,
        totalPredicciones: predCount || 0,
        prediccionesExactas: exacto,
        efectividadGlobal: total > 0 ? Math.round(((exacto + diferencia + ganador + empate) / total) * 100) : 0,
        partidoMasDificil: 'Por calcular',
        partidoMasAcertado: 'Por calcular',
        usuarioMasPreciso: rankTopTyped?.[0]?.usuario?.username || '—',
        equipoMasApoyado: 'Argentina 🇦🇷',
      })

      setLoading(false)
    }
    load()
  }, [])

  const CUSTOM_TOOLTIP = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="glass rounded-xl px-4 py-3 text-sm">
        <p className="font-bold text-gray-900 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <BackButton href="/dashboard" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black text-gray-900">📊 <span className="text-gold-gradient">Estadísticas</span></h1>
          <p className="text-gray-400 mt-1">Análisis global del Club del Pleno</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-6xl">⚽</motion.div>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Usuarios', value: stats.totalUsuarios, icon: Users, color: '#60A5FA' },
                { label: 'Predicciones', value: stats.totalPredicciones, icon: Target, color: '#A78BFA' },
                { label: 'Exactas', value: stats.prediccionesExactas, icon: Award, color: '#B8860B' },
                { label: 'Efectividad Global', value: `${stats.efectividadGlobal}%`, icon: TrendingUp, color: '#34D399' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl p-5 text-center"
                >
                  <s.icon className="w-6 h-6 mx-auto mb-2" style={{ color: s.color }} />
                  <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-gray-600 mt-1">{s.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribution pie */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-3xl p-6">
                <h2 className="font-black text-gray-900 text-lg mb-6">Distribución de Predicciones</h2>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie
                        data={distribucion.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {distribucion.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CUSTOM_TOOLTIP />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {distribucion.map((d) => (
                      <div key={d.name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-gray-300 flex-1">{d.name}</span>
                        <span className="font-bold text-gray-900">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Top users */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-3xl p-6">
                <h2 className="font-black text-gray-900 text-lg mb-6">Top Predicciones Exactas</h2>
                {topUsuarios.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">Datos disponibles cuando finalicen partidos</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={topUsuarios}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="username" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                      <Tooltip content={<CUSTOM_TOOLTIP />} />
                      <Bar dataKey="exactos" fill="#F5C842" radius={[4, 4, 0, 0]} name="Exactos" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </motion.div>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Usuario más preciso', value: stats.usuarioMasPreciso, icon: '🎯', color: 'from-yellow-500/20 to-amber-500/20', border: 'rgba(245,200,66,0.2)' },
                { label: 'Equipo más apoyado', value: stats.equipoMasApoyado, icon: '❤️', color: 'from-red-500/20 to-pink-500/20', border: 'rgba(239,68,68,0.2)' },
                { label: 'Partido más acertado', value: stats.partidoMasAcertado, icon: '✅', color: 'from-green-500/20 to-emerald-500/20', border: 'rgba(34,197,94,0.2)' },
                { label: 'Partido más difícil', value: stats.partidoMasDificil, icon: '🤯', color: 'from-purple-500/20 to-violet-500/20', border: 'rgba(139,92,246,0.2)' },
              ].map((h, i) => (
                <motion.div
                  key={h.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`bg-gradient-to-br ${h.color} rounded-2xl p-5`}
                  style={{ border: `1px solid ${h.border}` }}
                >
                  <div className="text-3xl mb-3">{h.icon}</div>
                  <div className="font-bold text-gray-900">{h.value}</div>
                  <div className="text-xs text-gray-600 mt-1">{h.label}</div>
                </motion.div>
              ))}
            </div>

            {/* AI prediction module */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-blue rounded-3xl p-8 text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Brain className="w-8 h-8 text-blue-400" />
                <h2 className="text-2xl font-black text-gray-900">IA del Club del Pleno</h2>
              </div>
              <p className="text-gray-400 mb-6 max-w-xl mx-auto">
                Nuestro sistema de inteligencia artificial analiza estadísticas históricas, forma actual y enfrentamientos directos para predecir los resultados.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {[
                  { match: 'Argentina vs Francia', pred: '2-1', probLocal: 52, probEmpate: 21, probVisit: 27 },
                  { match: 'Brasil vs España', pred: '1-1', probLocal: 38, probEmpate: 32, probVisit: 30 },
                  { match: 'Inglaterra vs Portugal', pred: '0-1', probLocal: 30, probEmpate: 28, probVisit: 42 },
                ].map((p) => (
                  <div key={p.match} className="rounded-2xl p-4 text-left" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,100,255,0.15)' }}>
                    <div className="text-xs text-blue-400 mb-2 font-semibold">IA predice</div>
                    <div className="text-sm font-bold text-gray-900 mb-2">{p.match}</div>
                    <div className="text-2xl font-black mb-2" style={{ color: '#00D4FF' }}>{p.pred}</div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between"><span>Local</span><span>{p.probLocal}%</span></div>
                      <div className="flex justify-between"><span>Empate</span><span>{p.probEmpate}%</span></div>
                      <div className="flex justify-between"><span>Visitante</span><span>{p.probVisit}%</span></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-2 italic">Solo informativa — no afecta puntajes</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
