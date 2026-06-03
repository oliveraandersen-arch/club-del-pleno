'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useRef } from 'react'
import { ArrowRight, Trophy, Users, Zap, Star, ChevronDown, Globe } from 'lucide-react'
import { StadiumBackground } from '@/components/features/StadiumBackground'

const FEATURES = [
  {
    icon: '⚽',
    title: 'Predecí cada partido',
    desc: 'Marcador exacto, diferencia o ganador. Cada acierto suma puntos para el ranking.',
    color: 'from-green-500/20 to-emerald-500/20',
    border: 'rgba(34,197,94,0.2)',
  },
  {
    icon: '🏆',
    title: 'Competí en ligas privadas',
    desc: 'Creá tu propia liga con tus amigos, familia o colegas. ¿Quién conoce mejor el fútbol?',
    color: 'from-yellow-500/20 to-amber-500/20',
    border: 'rgba(245,200,66,0.2)',
  },
  {
    icon: '🎮',
    title: 'Gamificación total',
    desc: 'Más de 50 logros desbloqueables, sistema de niveles y XP. La adicción está garantizada.',
    color: 'from-purple-500/20 to-violet-500/20',
    border: 'rgba(139,92,246,0.2)',
  },
  {
    icon: '📊',
    title: 'Estadísticas en tiempo real',
    desc: 'Ranking actualizado en vivo, análisis de tus predicciones y comparación de usuarios.',
    color: 'from-blue-500/20 to-cyan-500/20',
    border: 'rgba(59,130,246,0.2)',
  },
]

const STATS = [
  { label: 'Partidos del Mundial', value: '104', icon: '⚽' },
  { label: 'Puntos máximos posibles', value: '600+', icon: '🏅' },
  { label: 'Logros desbloqueables', value: '50+', icon: '🏆' },
  { label: 'Ligas privadas', value: '∞', icon: '🎮' },
]

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 100])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--beige)' }}>
      <StadiumBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 h-16 flex items-center px-6"
        style={{ background: 'rgba(250,247,242,0.92)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-2xl">⚽</span>
            <span className="text-gold-gradient font-black text-xl tracking-tight">CLUB DEL PLENO</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Link href="/auth/login">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Ingresar
              </motion.button>
            </Link>
            <Link href="/auth/register">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: 'linear-gradient(135deg, #F5C842, #D4A017)', color: '#050810' }}
              >
                Registrarse
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ y, opacity }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          {/* Ball animation */}
          <motion.div
            animate={{ y: [-20, 20, -20], rotate: [0, 360] }}
            transition={{ y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 8, repeat: Infinity, ease: 'linear' } }}
            className="text-8xl mb-8 inline-block"
          >
            ⚽
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="font-black leading-none mb-4">
              <span
                className="block text-6xl sm:text-8xl md:text-9xl"
                style={{
                  background: 'linear-gradient(135deg, #F5C842 0%, #FFE066 30%, #F5C842 60%, #D4A017 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 40px rgba(245,200,66,0.3))',
                }}
              >
                CLUB DEL
              </span>
              <span
                className="block text-6xl sm:text-8xl md:text-9xl"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #F5C842 50%, #ffffff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                PLENO
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl sm:text-2xl text-gray-700 mb-4 font-light"
          >
            Donde los verdaderos expertos predicen el Mundial.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-gray-500 mb-12 max-w-lg mx-auto"
          >
            Predecí resultados, competí en ligas privadas, desbloqueá logros y convertite en el campeón del prode 2026.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/auth/register">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(245,200,66,0.4)' }}
                whileTap={{ scale: 0.97 }}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-bold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #F5C842, #D4A017)',
                  color: '#050810',
                  boxShadow: '0 0 20px rgba(245,200,66,0.2)',
                }}
              >
                <Trophy className="w-5 h-5" />
                Entrar al Prode
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </motion.button>
            </Link>
            <Link href="/auth/login">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-semibold text-gray-900 transition-all"
                style={{
                  background: 'rgba(0,0,0,0.05)',
                  border: '1px solid #D4C8B8',
                }}
              >
                Ya tengo cuenta
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20 max-w-3xl mx-auto"
          >
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + i * 0.1 }}
                className="glass rounded-2xl p-4 text-center"
              >
                <div className="text-3xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-black text-gold-gradient">{stat.value}</div>
                <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              Todo lo que necesitás para
              <br />
              <span className="text-gold-gradient">dominar el Mundial</span>
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Una plataforma completa, social y altamente adictiva para el fanático del fútbol más exigente.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`rounded-3xl p-8 bg-gradient-to-br ${f.color} card-hover`}
                style={{ border: `1px solid ${f.border}` }}
              >
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              ¿Cómo se suman los puntos?
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              { pts: 5, label: 'Resultado Exacto', desc: 'Acertaste el marcador exacto del partido', emoji: '🎯', color: '#B8860B' },
              { pts: 4, label: 'Misma Diferencia', desc: 'Acertaste la diferencia de goles (ej: ganó por 2)', emoji: '⚡', color: '#A78BFA' },
              { pts: 3, label: 'Ganador Correcto', desc: 'Acertaste quién ganó el partido', emoji: '✅', color: '#60A5FA' },
              { pts: 3, label: 'Empate Correcto', desc: 'Predijiste correctamente que terminaba empatado', emoji: '🤝', color: '#34D399' },
              { pts: 10, label: 'BONUS: Fecha Plena', desc: 'Acertaste todos los partidos de una fecha', emoji: '💥', color: '#F472B6' },
              { pts: 25, label: 'BONUS: Campeón del Mundial', desc: 'Predijiste correctamente al campeón', emoji: '👑', color: '#B8860B' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 rounded-2xl p-4 glass card-hover"
              >
                <div className="text-3xl w-10 text-center">{item.emoji}</div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">{item.label}</div>
                  <div className="text-sm text-gray-600">{item.desc}</div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="text-2xl font-black"
                  style={{ color: item.color }}
                >
                  +{item.pts} pts
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto rounded-3xl p-12 text-center glass-gold"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-7xl mb-6"
          >
            🏆
          </motion.div>
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            ¿Listo para ser el campeón del prode?
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Registrate gratis, invitá a tus amigos y que empiece la competencia.
          </p>
          <Link href="/auth/register">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(245,200,66,0.5)' }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-4 rounded-2xl text-xl font-black transition-all"
              style={{
                background: 'linear-gradient(135deg, #F5C842, #D4A017)',
                color: '#050810',
              }}
            >
              Registrarse Gratis 🎉
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xl">⚽</span>
          <span className="text-gold-gradient font-black text-lg">CLUB DEL PLENO</span>
        </div>
        <p className="text-gray-600 text-sm">
          Inspirado por la pasión futbolera y el espíritu competitivo de Tim Payne.
        </p>
        <p className="text-gray-700 text-xs mt-2">
          © 2026 Club del Pleno. Hecho con ❤️ para los fanáticos del fútbol.
        </p>
      </footer>
    </div>
  )
}
