'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface Props {
  show: boolean
  message?: string
  emoji?: string
  onDone?: () => void
}

export function CelebrationEffect({ show, message = '¡Pleno!', emoji = '🎯', onDone }: Props) {
  const [particles, setParticles] = useState<{ x: number; y: number; color: string; size: number }[]>([])

  useEffect(() => {
    if (!show) return
    const colors = ['#F5C842', '#FFE066', '#D4A017', '#00FF87', '#60A5FA', '#F472B6']
    const p = Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
    }))
    setParticles(p)

    const t = setTimeout(() => {
      onDone?.()
    }, 3000)
    return () => clearTimeout(t)
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          {/* Particles */}
          {particles.map((p, i) => (
            <motion.div
              key={i}
              initial={{ left: `${p.x}%`, top: '-5%', opacity: 1 }}
              animate={{
                top: '110%',
                rotate: Math.random() * 720 - 360,
                opacity: 0,
              }}
              transition={{ duration: 2 + Math.random() * 1.5, delay: i * 0.05, ease: 'easeIn' }}
              className="absolute rounded-sm"
              style={{ width: p.size, height: p.size, background: p.color }}
            />
          ))}

          {/* Central message */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 400 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 1, repeat: 2 }}
              className="text-8xl mb-4"
            >
              {emoji}
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-black text-gold-gradient"
              style={{ filter: 'drop-shadow(0 0 20px rgba(245,200,66,0.5))' }}
            >
              {message}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
