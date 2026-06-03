'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users } from 'lucide-react'

interface Props {
  partidoId: string
}

export function CommunityPrediction({ partidoId }: Props) {
  const [stats, setStats] = useState<{ localPct: number; empatePct: number; visitantePct: number; total: number } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('predicciones')
        .select('goles_local, goles_visitante')
        .eq('partido_id', partidoId)

      if (!data || data.length === 0) return

      let local = 0, empate = 0, visitante = 0
      ;(data as { goles_local: number; goles_visitante: number }[]).forEach((p) => {
        if (p.goles_local > p.goles_visitante) local++
        else if (p.goles_local === p.goles_visitante) empate++
        else visitante++
      })

      const total = data.length
      setStats({
        localPct: Math.round((local / total) * 100),
        empatePct: Math.round((empate / total) * 100),
        visitantePct: Math.round((visitante / total) * 100),
        total,
      })
    }
    load()
  }, [partidoId])

  if (!stats || stats.total < 3) return null

  const bars = [
    { label: 'Local', pct: stats.localPct, color: '#34D399' },
    { label: 'Empate', pct: stats.empatePct, color: '#B8860B' },
    { label: 'Visitante', pct: stats.visitantePct, color: '#60A5FA' },
  ]

  return (
    <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid #E5DDD0' }}>
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
        <Users className="w-3 h-3" />
        <span>La comunidad dice ({stats.total} votos)</span>
      </div>
      <div className="space-y-1.5">
        {bars.map((b) => (
          <div key={b.label} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16">{b.label}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${b.pct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: b.color }}
              />
            </div>
            <span className="text-xs font-bold w-8 text-right" style={{ color: b.color }}>
              {b.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
