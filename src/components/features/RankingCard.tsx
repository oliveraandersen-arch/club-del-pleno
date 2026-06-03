'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { RankingConUsuario } from '@/types/database'
import { getNivel } from '@/lib/constants'

interface Props {
  entry: RankingConUsuario
  index: number
  isCurrentUser?: boolean
}

export function RankingCard({ entry, index, isCurrentUser }: Props) {
  const pos = entry.posicion ?? index + 1
  const diff = entry.posicion_anterior ? entry.posicion_anterior - pos : 0
  const nivel = getNivel(entry.usuario.xp)

  const bgColor = isCurrentUser
    ? '#FFFBEB'
    : pos === 1 ? '#FFFBEB'
    : pos === 2 ? '#F9FAFB'
    : pos === 3 ? '#FFF7ED'
    : '#FFFFFF'

  const borderColor = isCurrentUser
    ? 'rgba(184,134,11,0.3)'
    : pos === 1 ? 'rgba(184,134,11,0.2)'
    : pos === 2 ? '#E5E7EB'
    : pos === 3 ? 'rgba(180,100,30,0.2)'
    : '#E5DDD0'

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ scale: 1.01, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
      style={{ background: bgColor, border: `1px solid ${borderColor}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      {/* Position */}
      <div className="w-9 flex-shrink-0 flex justify-center">
        {pos === 1 ? (
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-xl">🥇</motion.div>
        ) : pos === 2 ? (
          <div className="text-xl">🥈</div>
        ) : pos === 3 ? (
          <div className="text-xl">🥉</div>
        ) : (
          <span className="text-base font-black" style={{ color: isCurrentUser ? '#B8860B' : '#9CA3AF' }}>
            {pos}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden">
        {entry.usuario.foto_url ? (
          <img src={entry.usuario.foto_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-sm font-black"
            style={{
              background: isCurrentUser
                ? 'linear-gradient(135deg, #B8860B, #96700A)'
                : 'linear-gradient(135deg, #E5E7EB, #D1D5DB)',
              color: isCurrentUser ? '#fff' : '#6B7280',
            }}
          >
            {entry.usuario.username?.[0]?.toUpperCase()}
          </div>
        )}
      </div>

      {/* User info */}
      <Link href={`/perfil/${entry.usuario.username}`} className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm truncate" style={{ color: isCurrentUser ? '#92400E' : '#1A1A1A' }}>
            {entry.usuario.nombre_visible || entry.usuario.username}
            {isCurrentUser && ' (vos)'}
          </span>
          <span className="text-xs text-gray-500 flex-shrink-0">
            {nivel.icono} Nv.{entry.usuario.nivel}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {entry.predicciones_exactas} exactos · {entry.efectividad}% efectividad
        </div>
      </Link>

      {/* Points + trend */}
      <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
        <div className="font-black text-base" style={{ color: isCurrentUser ? '#92400E' : '#1A1A1A' }}>
          {entry.puntos}
          <span className="text-xs font-normal text-gray-400 ml-1">pts</span>
        </div>
        {diff !== 0 && (
          <div className={`flex items-center gap-0.5 text-xs font-semibold ${diff > 0 ? 'rank-up' : 'rank-down'}`}>
            {diff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(diff)}
          </div>
        )}
        {diff === 0 && entry.posicion_anterior && (
          <div className="flex items-center gap-0.5 text-xs text-gray-400">
            <Minus className="w-3 h-3" />
          </div>
        )}
      </div>
    </motion.div>
  )
}
