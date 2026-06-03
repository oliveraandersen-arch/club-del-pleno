'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { VolumeX, Play } from 'lucide-react'

// IDs de YouTube — canción oficial FIFA 2026 + clásicos del mundial
const TRACKS = {
  waka2026: {
    id: 'pRpeEdMmmQ0', // Shakira - Waka Waka (placeholder — reemplazar por ID 2026 cuando esté disponible)
    label: 'Copa Mundial 2026',
    artist: 'FIFA World Cup 2026 — Shakira',
    emoji: '🌍',
    color: 'from-orange-100 to-amber-100',
    border: '#F59E0B',
  },
  waka: {
    id: 'pRpeEdMmmQ0', // Shakira - Waka Waka 2010
    label: 'Waka Waka',
    artist: 'Shakira — South Africa 2010',
    emoji: '🎶',
    color: 'from-yellow-50 to-orange-50',
    border: '#F59E0B',
  },
  copa: {
    id: 'Lm4EN91pAVw', // Ricky Martin - La Copa de la Vida
    label: 'La Copa de la Vida',
    artist: 'Ricky Martin — Francia 1998',
    emoji: '🏆',
    color: 'from-blue-50 to-indigo-50',
    border: '#3B82F6',
  },
  none: {
    id: '',
    label: 'Sin música',
    artist: 'Modo silencioso',
    emoji: '🔇',
    color: 'from-gray-50 to-gray-100',
    border: '#9CA3AF',
  },
}

type TrackKey = keyof typeof TRACKS

export function MusicModal() {
  const { musicChoice, showMusicModal, setShowMusicModal, setMusicChoice } = useAppStore()

  useEffect(() => {
    if (musicChoice === null) {
      const t = setTimeout(() => setShowMusicModal(true), 1500)
      return () => clearTimeout(t)
    }
  }, [musicChoice, setShowMusicModal])

  return (
    <AnimatePresence>
      {showMusicModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(250,247,242,0.92)', backdropFilter: 'blur(12px)' }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            className="rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
            style={{ background: '#FFFFFF', border: '1px solid #E5DDD0' }}
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              className="text-6xl mb-4 inline-block"
            >
              🎵
            </motion.div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">Elegí tu ambiente mundialista</h2>
            <p className="text-gray-500 text-sm mb-7">Seleccioná la banda sonora de tu experiencia</p>

            <div className="space-y-3">
              {(Object.entries(TRACKS) as [TrackKey, typeof TRACKS[TrackKey]][]).map(([key, track], i) => (
                <motion.button
                  key={key}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 + 0.1 }}
                  whileHover={{ scale: 1.02, x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMusicChoice(key as 'waka' | 'copa' | 'none')}
                  className={`w-full p-4 rounded-2xl bg-gradient-to-r ${track.color} flex items-center gap-4 text-left transition-all`}
                  style={{ border: `1.5px solid ${track.border}40` }}
                >
                  <span className="text-3xl">{track.emoji}</span>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">{track.label}</div>
                    <div className="text-xs text-gray-500">{track.artist}</div>
                  </div>
                  {key !== 'none' && <Play className="w-4 h-4 flex-shrink-0" style={{ color: track.border }} />}
                  {key === 'none' && <VolumeX className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </motion.button>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-5">Podés cambiar esto en cualquier momento</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { TRACKS }
export type { TrackKey }
