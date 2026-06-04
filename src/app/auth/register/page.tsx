'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const STEPS = ['Cuenta', 'Perfil', '¡Listo!']

const EQUIPOS_POPULARES = [
  { id: 'e1000001-0000-0000-0000-000000000001', nombre: 'Argentina', flag: '🇦🇷' },
  { id: 'e1000003-0000-0000-0000-000000000003', nombre: 'Brasil', flag: '🇧🇷' },
  { id: 'e1000002-0000-0000-0000-000000000002', nombre: 'Francia', flag: '🇫🇷' },
  { id: 'e1000004-0000-0000-0000-000000000004', nombre: 'España', flag: '🇪🇸' },
  { id: 'e1000005-0000-0000-0000-000000000005', nombre: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'e1000006-0000-0000-0000-000000000006', nombre: 'Portugal', flag: '🇵🇹' },
  { id: 'e1000007-0000-0000-0000-000000000007', nombre: 'Alemania', flag: '🇩🇪' },
  { id: 'e1000008-0000-0000-0000-000000000008', nombre: 'Países Bajos', flag: '🇳🇱' },
]

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    nombre: '',
    equipoFavorito: '',
    pais: '',
    frase: '',
  })

  function update(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function handleRegister() {
    setLoading(true)
    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            username: form.username,
            nombre_visible: form.nombre || form.username,
          },
        },
      })
      if (error) throw error

      const user = signUpData.user
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const usuariosTable = supabase.from('usuarios') as any

        // Upsert: crea el perfil si el trigger no lo hizo, o actualiza si ya existe
        await usuariosTable.upsert({
          id: user.id,
          email: form.email,
          username: form.username,
          nombre_visible: form.nombre || form.username,
          equipo_favorito_id: form.equipoFavorito || null,
          pais_favorito: form.pais || null,
          frase_personal: form.frase || null,
        }, { onConflict: 'id' })
      }

      setStep(2)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al registrarse'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: 'var(--beige)' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #F5C842, transparent)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚽</div>
          <h1 className="text-3xl font-black text-gold-gradient">CLUB DEL PLENO</h1>
          <p className="text-gray-400 text-sm mt-1">Creá tu cuenta gratuita</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: i === step ? 1.1 : 1,
                  background: i < step ? '#22C55E' : i === step ? '#F5C842' : 'rgba(255,255,255,0.1)',
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ color: i <= step ? '#050810' : '#666' }}
              >
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </motion.div>
              <span className="text-xs font-medium" style={{ color: i === step ? '#F5C842' : '#555' }}>
                {s}
              </span>
              {i < STEPS.length - 1 && <div className="w-6 h-px" style={{ background: i < step ? '#22C55E' : '#333' }} />}
            </div>
          ))}
        </div>

        <div
          className="rounded-3xl p-8"
          style={{ background: '#FFFFFF', border: '1px solid #E5DDD0', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
        >
          <AnimatePresence mode="wait">
            {/* STEP 0 */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Creá tu cuenta</h2>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Usuario *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      value={form.username}
                      onChange={(e) => update('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                      required
                      placeholder="tu_usuario"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none transition-all"
                      style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid #D4C8B8' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      required
                      placeholder="tu@email.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none transition-all"
                      style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid #D4C8B8' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Contraseña *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                      required
                      minLength={6}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none transition-all"
                      style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid #D4C8B8' }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!form.email || !form.password || !form.username}
                  onClick={() => setStep(1)}
                  className="w-full py-4 rounded-xl font-bold text-lg disabled:opacity-50 transition-all"
                  style={{ background: 'linear-gradient(135deg, #F5C842, #D4A017)', color: '#050810' }}
                >
                  Continuar →
                </motion.button>

                <p className="text-center text-sm text-gray-500">
                  ¿Ya tenés cuenta?{' '}
                  <Link href="/auth/login" className="font-semibold" style={{ color: '#B8860B' }}>
                    Ingresar
                  </Link>
                </p>
              </motion.div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Personalizá tu perfil</h2>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Nombre visible</label>
                  <input
                    value={form.nombre}
                    onChange={(e) => update('nombre', e.target.value)}
                    placeholder={form.username}
                    className="w-full px-4 py-3.5 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none transition-all"
                    style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid #D4C8B8' }}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-3 block">Equipo favorito</label>
                  <div className="grid grid-cols-4 gap-2">
                    {EQUIPOS_POPULARES.map((eq) => (
                      <motion.button
                        key={eq.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => update('equipoFavorito', form.equipoFavorito === eq.id ? '' : eq.id)}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all"
                        style={{
                          background: form.equipoFavorito === eq.id ? 'rgba(245,200,66,0.15)' : 'rgba(255,255,255,0.04)',
                          border: form.equipoFavorito === eq.id ? '1px solid rgba(245,200,66,0.4)' : '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <span className="text-2xl">{eq.flag}</span>
                        <span className="text-gray-400 truncate w-full text-center">{eq.nombre.split(' ')[0]}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Frase personal (opcional)</label>
                  <input
                    value={form.frase}
                    onChange={(e) => update('frase', e.target.value)}
                    placeholder="Ej: Soy el mejor pronosticador..."
                    maxLength={100}
                    className="w-full px-4 py-3.5 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none transition-all"
                    style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid #D4C8B8' }}
                  />
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setStep(0)}
                    className="flex-1 py-4 rounded-xl font-semibold text-gray-600 transition-all"
                    style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid #DDD5C8' }}
                  >
                    ← Atrás
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    onClick={handleRegister}
                    className="flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70 transition-all"
                    style={{ background: 'linear-gradient(135deg, #F5C842, #D4A017)', color: '#050810' }}
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '🎉'}
                    {loading ? 'Creando...' : 'Crear Cuenta'}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 10 }}
                  className="text-7xl mb-6"
                >
                  🏆
                </motion.div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">¡Bienvenido al Club!</h2>
                <p className="text-gray-400 mb-8">
                  Tu cuenta fue creada exitosamente. ¡Ahora podés empezar a predecir!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push('/dashboard')}
                  className="px-10 py-4 rounded-2xl font-bold text-lg"
                  style={{ background: 'linear-gradient(135deg, #F5C842, #D4A017)', color: '#050810' }}
                >
                  Ir al Dashboard ⚽
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
