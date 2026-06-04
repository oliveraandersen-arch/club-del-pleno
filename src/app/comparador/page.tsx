'use client'
export const dynamic = 'force-dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Swords, Target, Trophy, BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { BackButton } from '@/components/ui/BackButton'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import type { Usuario, Ranking } from '@/types/database'
import { getNivel } from '@/lib/constants'

interface UserWithRank extends Usuario {
  ranking?: Ranking
}

export default function ComparadorPage() {
  const router = useRouter()
  const supabase = createClient()

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [userA, setUserA] = useState<UserWithRank | null>(null)
  const [userB, setUserB] = useState<UserWithRank | null>(null)
  const [searchA, setSearchA] = useState('')
  const [searchB, setSearchB] = useState('')
  const [resultsA, setResultsA] = useState<Usuario[]>([])
  const [resultsB, setResultsB] = useState<Usuario[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setCurrentUserId(user.id)

      const { data } = await supabase.from('usuarios').select('*').eq('id', user.id).single()
      if (data) {
        const { data: rank } = await supabase.from('ranking').select('*').eq('usuario_id', user.id).eq('torneo_id', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890').single()
        setUserA({ ...(data as Usuario), ranking: (rank as import('@/types/database').Ranking | null) ?? undefined })
      }
    }
    load()
  }, [])

  async function searchUsers(query: string, setResults: (r: Usuario[]) => void) {
    if (query.length < 2) { setResults([]); return }
    const { data } = await supabase.from('usuarios').select('*').ilike('username', `%${query}%`).limit(5)
    if (data) setResults(data)
  }

  async function selectUser(user: Usuario, setUser: (u: UserWithRank) => void, setSearch: (s: string) => void, setResults: (r: Usuario[]) => void) {
    const { data: rank } = await supabase.from('ranking').select('*').eq('usuario_id', user.id).eq('torneo_id', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890').single()
    setUser({ ...user, ranking: rank ?? undefined })
    setSearch(user.username)
    setResults([])
  }

  const radarData = userA && userB ? [
    { stat: 'Puntos', A: Math.min(100, (userA.ranking?.puntos || 0) / 5), B: Math.min(100, (userB.ranking?.puntos || 0) / 5) },
    { stat: 'Exactos', A: Math.min(100, (userA.predicciones_exactas) * 5), B: Math.min(100, (userB.predicciones_exactas) * 5) },
    { stat: 'Efectividad', A: userA.ranking?.efectividad || 0, B: userB.ranking?.efectividad || 0 },
    { stat: 'Racha', A: Math.min(100, userA.mejor_racha * 10), B: Math.min(100, userB.mejor_racha * 10) },
    { stat: 'Nivel', A: Math.min(100, userA.nivel), B: Math.min(100, userB.nivel) },
    { stat: 'XP', A: Math.min(100, userA.xp / 100), B: Math.min(100, userB.xp / 100) },
  ] : []

  function UserCard({ user, label, color }: { user: UserWithRank | null; label: string; color: string; onSearch: (q: string) => void }) {
    if (!user) return (
      <div className="glass rounded-2xl p-6 text-center text-gray-500">
        <div className="text-4xl mb-2">👤</div>
        <p className="text-sm">Seleccioná {label}</p>
      </div>
    )
    const nivel = getNivel(user.xp)
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: color }}>
            {user.foto_url ? (
              <img src={user.foto_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-black" style={{ background: `${color}20`, color }}>
                {user.username[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="font-black text-gray-900">{user.nombre_visible || user.username}</div>
            <div className="text-xs text-gray-600">@{user.username}</div>
            <div className="text-xs mt-0.5" style={{ color }}>{nivel.icono} {nivel.nombre}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          {[
            { label: 'Puntos', value: user.ranking?.puntos || 0, color: '#B8860B' },
            { label: 'Posición', value: user.ranking?.posicion ? `#${user.ranking.posicion}` : '—', color },
            { label: 'Exactos', value: user.predicciones_exactas, color: '#34D399' },
            { label: 'Efectividad', value: `${user.ranking?.efectividad || 0}%`, color: '#60A5FA' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-2" style={{ background: 'rgba(0,0,0,0.03)' }}>
              <div className="font-black text-lg" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <BackButton href="/ranking" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black text-gray-900">⚔️ <span className="text-gold-gradient">Comparador</span></h1>
          <p className="text-gray-400 mt-1">Enfrentá a dos usuarios cara a cara</p>
        </motion.div>

        {/* Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Usuario A', search: searchA, setSearch: setSearchA, results: resultsA, setResults: setResultsA, setUser: setUserA, color: '#B8860B' },
            { label: 'Usuario B', search: searchB, setSearch: setSearchB, results: resultsB, setResults: setResultsB, setUser: setUserB, color: '#60A5FA' },
          ].map((side) => (
            <div key={side.label} className="relative">
              <label className="text-sm text-gray-600 mb-2 block">{side.label}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  value={side.search}
                  onChange={(e) => {
                    side.setSearch(e.target.value)
                    searchUsers(e.target.value, side.setResults)
                  }}
                  placeholder="Buscar usuario..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none transition-all"
                  style={{ background: 'rgba(0,0,0,0.04)', border: `1px solid ${side.color}30` }}
                />
              </div>
              {side.results.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 rounded-xl z-20 overflow-hidden"
                  style={{ background: '#FFFFFF', border: '1px solid #D4C8B8' }}>
                  {side.results.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => selectUser(u, side.setUser as (u: UserWithRank) => void, side.setSearch, side.setResults)}
                      className="w-full px-4 py-3 flex items-center gap-2 hover:bg-white/5 text-left"
                    >
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: `${side.color}20`, color: side.color }}>
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{u.username}</div>
                        <div className="text-xs text-gray-500">Nivel {u.nivel}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* VS Cards */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
          <UserCard user={userA} label="usuario A" color="#F5C842" onSearch={(q) => searchUsers(q, setResultsA)} />
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center justify-center"
          >
            <div className="text-3xl font-black" style={{ color: '#888' }}>VS</div>
          </motion.div>
          <UserCard user={userB} label="usuario B" color="#60A5FA" onSearch={(q) => searchUsers(q, setResultsB)} />
        </div>

        {/* Radar chart */}
        <AnimatePresence>
          {userA && userB && radarData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass rounded-3xl p-6"
            >
              <h2 className="text-xl font-black text-gray-900 mb-6 text-center">Comparación Visual</h2>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="stat" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Radar name={userA.username} dataKey="A" stroke="#F5C842" fill="#F5C842" fillOpacity={0.15} />
                  <Radar name={userB.username} dataKey="B" stroke="#60A5FA" fill="#60A5FA" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-8 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-0.5 rounded" style={{ background: '#F5C842' }} />
                  <span className="text-gray-300">{userA.username}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-0.5 rounded" style={{ background: '#60A5FA' }} />
                  <span className="text-gray-300">{userB.username}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
