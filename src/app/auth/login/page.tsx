'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('¡Bienvenido de vuelta!')
      router.push('/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al ingresar'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: 'var(--beige)' }}>
      {/* Background glow */}
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
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="text-6xl inline-block"
          >
            ⚽
          </motion.div>
          <h1 className="text-4xl font-black text-gold-gradient mt-4">CLUB DEL PLENO</h1>
          <p className="text-gray-400 mt-2">Ingresá a tu cuenta</p>
        </div>

        <div
          className="rounded-3xl p-8"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5DDD0',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}
        >
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    background: 'rgba(0,0,0,0.04)',
                    border: '1px solid #D4C8B8',
                    // @ts-expect-error focus ring
                    '--tw-ring-color': 'rgba(245,200,66,0.4)',
                  }}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    background: 'rgba(0,0,0,0.04)',
                    border: '1px solid #D4C8B8',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70"
              style={{
                background: 'linear-gradient(135deg, #F5C842, #D4A017)',
                color: '#050810',
                boxShadow: '0 0 20px rgba(245,200,66,0.2)',
              }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '⚽'}
              {loading ? 'Ingresando...' : 'Entrar al Prode'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              ¿No tenés cuenta?{' '}
              <Link href="/auth/register" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: '#B8860B' }}>
                Registrarte gratis
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          © 2026 Club del Pleno
        </p>
      </motion.div>
    </div>
  )
}
