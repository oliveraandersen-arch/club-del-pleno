'use client'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Logro } from '@/types/database'

interface Props {
  logro: Logro & { desbloqueado: boolean; desbloqueado_at?: string }
  onClose: () => void
}

const RAREZA_STYLES: Record<string, { color: string; glow: string; label: string }> = {
  comun: { color: '#555', glow: 'rgba(107,114,128,0.3)', label: 'Común' },
  raro: { color: '#60A5FA', glow: 'rgba(59,130,246,0.3)', label: 'Raro' },
  epico: { color: '#A78BFA', glow: 'rgba(139,92,246,0.3)', label: 'Épico' },
  legendario: { color: '#B8860B', glow: 'rgba(245,200,66,0.4)', label: 'Legendario' },
}

export function AchievementModal({ logro, onClose }: Props) {
  const style = RAREZA_STYLES[logro.rareza] || RAREZA_STYLES.comun

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.7, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 20, stiffness: 400 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-3xl p-8 max-w-sm w-full text-center relative"
        style={{
          background: '#FFFFFF',
          border: `1px solid ${style.color}30`,
          boxShadow: `0 0 40px ${style.glow}`,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
        >
          <X className="w-5 h-5" />
        </button>

        {logro.desbloqueado ? (
          <>
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
              transition={{ duration: 1, repeat: 2 }}
              className="text-7xl mb-4"
            >
              {logro.icono}
            </motion.div>
            {/* Sparkles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, Math.cos(i * 60 * Math.PI / 180) * 60],
                  y: [0, Math.sin(i * 60 * Math.PI / 180) * 60],
                }}
                transition={{ duration: 1, delay: i * 0.1, repeat: 2 }}
                className="absolute top-1/3 left-1/2 w-2 h-2 rounded-full pointer-events-none"
                style={{ background: style.color }}
              />
            ))}
          </>
        ) : (
          <div className="text-7xl mb-4 opacity-30">🔒</div>
        )}

        <div
          className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 rareza-${logro.rareza}`}
        >
          {style.label}
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-2">{logro.nombre}</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">{logro.descripcion}</p>

        <div className="flex items-center justify-center gap-2 text-amber-700 font-semibold">
          <span>⭐</span>
          <span>+{logro.xp_recompensa} XP</span>
        </div>

        {logro.desbloqueado && logro.desbloqueado_at && (
          <p className="text-xs text-gray-600 mt-3">
            Desbloqueado el{' '}
            {new Date(logro.desbloqueado_at).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}

        {!logro.desbloqueado && (
          <p className="text-xs text-gray-600 mt-3 italic">Aún no desbloqueado</p>
        )}
      </motion.div>
    </motion.div>
  )
}
