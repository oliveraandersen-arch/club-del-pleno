'use client'
export const dynamic = 'force-dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trophy, BarChart2, Swords } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { RankingCard } from '@/components/features/RankingCard'
import { BackButton } from '@/components/ui/BackButton'
import type { RankingConUsuario } from '@/types/database'

type Filter = 'global' | 'grupos' | 'octavos' | 'cuartos' | 'semifinal' | 'final'

export default function RankingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [ranking, setRanking] = useState<RankingConUsuario[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('global')
  const [myPos, setMyPos] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('ranking')
        .select('*, usuario:usuarios(*)')
        .eq('torneo_id', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')
        .order('puntos', { ascending: false })
        .limit(100)

      if (data) {
        const ranked = (data as unknown as RankingConUsuario[]).map((r, i) => ({ ...r, posicion: i + 1 }))
        setRanking(ranked)
        const me = ranked.find((r) => r.usuario_id === user.id)
        if (me) setMyPos(me.posicion ?? null)
      }

      setLoading(false)
    }
    load()
  }, [])

  const top3 = ranking.slice(0, 3)
  const rest = ranking.slice(3)

  const PODIUM_COLORS = ['#F5C842', '#C0C0C0', '#CD7F32']
  const PODIUM_HEIGHTS = [160, 120, 100]
  const PODIUM_ORDER = [1, 0, 2] // silver, gold, bronze

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <BackButton href="/dashboard" />
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900">
                🏆 <span className="text-gold-gradient">Ranking Global</span>
              </h1>
              <p className="text-gray-400 mt-1">Copa del Mundo FIFA 2026</p>
            </div>
            <Link href="/comparador">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#A78BFA' }}
              >
                <Swords className="w-4 h-4" />
                Comparar
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* My position banner */}
        {myPos && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-gold rounded-2xl p-4 flex items-center justify-between"
          >
            <div>
              <div className="text-sm text-gray-600">Tu posición actual</div>
              <div className="text-3xl font-black text-gold-gradient">#{myPos}</div>
            </div>
            <div className="text-5xl animate-podium-bounce">👤</div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'global', label: 'General' },
            { key: 'grupos', label: 'Grupos' },
            { key: 'octavos', label: 'Octavos' },
            { key: 'cuartos', label: 'Cuartos' },
            { key: 'semifinal', label: 'Semis' },
            { key: 'final', label: 'Final' },
          ].map((f) => (
            <motion.button
              key={f.key}
              whileHover={{ scale: 1.03 }}
              onClick={() => setFilter(f.key as Filter)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: filter === f.key ? 'rgba(184,134,11,0.12)' : 'rgba(0,0,0,0.04)',
                border: filter === f.key ? '1px solid rgba(184,134,11,0.3)' : '1px solid #E5DDD0',
                color: filter === f.key ? '#B8860B' : '#6B6260',
              }}
            >
              {f.label}
            </motion.button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-6xl">⚽</motion.div>
          </div>
        ) : ranking.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <p className="text-gray-400">El ranking se actualizará cuando terminen los primeros partidos</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            {top3.length >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-3xl p-8"
              >
                <h2 className="text-center text-xl font-black text-gray-900 mb-8">🥇 El Podio 🥇</h2>
                <div className="flex items-end justify-center gap-6">
                  {PODIUM_ORDER.map((rankIdx) => {
                    const entry = top3[rankIdx]
                    if (!entry) return null
                    const pos = rankIdx + 1
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ y: 60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: rankIdx * 0.2 + 0.3, type: 'spring', damping: 15 }}
                        className="flex flex-col items-center gap-3"
                      >
                        {/* Crown/medal */}
                        <motion.div
                          animate={{ y: [-4, 4, -4] }}
                          transition={{ duration: 2 + rankIdx * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                          className="text-4xl"
                        >
                          {pos === 1 ? '👑' : pos === 2 ? '🥈' : '🥉'}
                        </motion.div>

                        {/* Avatar */}
                        <Link href={`/perfil/${entry.usuario?.username}`}>
                          <div
                            className="w-16 h-16 rounded-full overflow-hidden border-4 cursor-pointer hover:scale-105 transition-transform"
                            style={{ borderColor: PODIUM_COLORS[rankIdx] }}
                          >
                            {entry.usuario?.foto_url ? (
                              <img src={entry.usuario.foto_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center text-xl font-black"
                                style={{ background: `linear-gradient(135deg, ${PODIUM_COLORS[rankIdx]}33, ${PODIUM_COLORS[rankIdx]}11)`, color: PODIUM_COLORS[rankIdx] }}
                              >
                                {entry.usuario?.username?.[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="text-center">
                          <div className="font-bold text-gray-900 text-sm max-w-[80px] truncate">
                            {entry.usuario?.nombre_visible || entry.usuario?.username}
                          </div>
                          <div className="font-black text-lg" style={{ color: PODIUM_COLORS[rankIdx] }}>
                            {entry.puntos} pts
                          </div>
                        </div>

                        {/* Podium base */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: PODIUM_HEIGHTS[rankIdx] }}
                          transition={{ delay: 0.5 + rankIdx * 0.1, duration: 0.8, ease: 'easeOut' }}
                          className="w-24 rounded-t-xl flex items-start justify-center pt-3"
                          style={{
                            background: `linear-gradient(180deg, ${PODIUM_COLORS[rankIdx]}30, ${PODIUM_COLORS[rankIdx]}10)`,
                            border: `1px solid ${PODIUM_COLORS[rankIdx]}30`,
                          }}
                        >
                          <span className="text-2xl font-black" style={{ color: PODIUM_COLORS[rankIdx] }}>
                            {pos}
                          </span>
                        </motion.div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Rest of ranking */}
            <div className="space-y-2">
              {rest.map((entry, i) => (
                <RankingCard
                  key={entry.id}
                  entry={entry}
                  index={i + 3}
                  isCurrentUser={entry.usuario_id === userId}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
