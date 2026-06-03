'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Lock, Star, Trophy, Target } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { BackButton } from '@/components/ui/BackButton'
import { getFlagEmoji } from '@/components/features/MatchCard'
import { toast } from 'sonner'
import type { Equipo, PrediccionEspecial } from '@/types/database'
import { PUNTAJE } from '@/lib/constants'

export default function PrediccionesEspecialesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId] = useState<string | null>(null)
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [pred, setPred] = useState<PrediccionEspecial | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    campeon_id: '',
    subcampeon_id: '',
    semifinalista1_id: '',
    semifinalista2_id: '',
    goleador_nombre: '',
    mejor_jugador_nombre: '',
    revelacion_id: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      const [{ data: eqs }, { data: predData }] = await Promise.all([
        supabase.from('equipos').select('*').order('ranking_fifa'),
        supabase.from('predicciones_especiales').select('*')
          .eq('usuario_id', user.id)
          .eq('torneo_id', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')
          .single(),
      ])

      if (eqs) setEquipos(eqs as import('@/types/database').Equipo[])
      if (predData) {
        const pd = predData as import('@/types/database').PrediccionEspecial
        setPred(pd)
        setForm({
          campeon_id: pd.campeon_id || '',
          subcampeon_id: pd.subcampeon_id || '',
          semifinalista1_id: pd.semifinalista1_id || '',
          semifinalista2_id: pd.semifinalista2_id || '',
          goleador_nombre: pd.goleador_nombre || '',
          mejor_jugador_nombre: pd.mejor_jugador_nombre || '',
          revelacion_id: pd.revelacion_id || '',
        })
      }

      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    if (!userId) return
    setSaving(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const table = supabase.from('predicciones_especiales') as any
      if (pred) {
        await table.update({ ...form, updated_at: new Date().toISOString() }).eq('id', pred.id)
      } else {
        await table.insert({
          ...form,
          usuario_id: userId,
          torneo_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          campeon_id: form.campeon_id || null,
          subcampeon_id: form.subcampeon_id || null,
          semifinalista1_id: form.semifinalista1_id || null,
          semifinalista2_id: form.semifinalista2_id || null,
          revelacion_id: form.revelacion_id || null,
        })
      }
      toast.success('¡Predicciones especiales guardadas!', { icon: '🔮' })
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  function TeamSelector({ value, onChange, label, disabled, exclude }: {
    value: string; onChange: (v: string) => void; label: string; disabled?: boolean; exclude?: string[]
  }) {
    const available = equipos.filter((e) => !exclude?.includes(e.id) || e.id === value)
    return (
      <div>
        <label className="text-sm text-gray-600 mb-2 block">{label}</label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {available.map((eq) => (
            <motion.button
              key={eq.id}
              whileHover={disabled ? {} : { scale: 1.05 }}
              whileTap={disabled ? {} : { scale: 0.95 }}
              disabled={disabled}
              onClick={() => onChange(value === eq.id ? '' : eq.id)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all"
              style={{
                background: value === eq.id ? 'rgba(245,200,66,0.15)' : 'rgba(255,255,255,0.03)',
                border: value === eq.id ? '1px solid rgba(245,200,66,0.4)' : '1px solid #E5DDD0',
                opacity: disabled ? 0.6 : 1,
              }}
            >
              <span className="text-xl">{getFlagEmoji(eq.pais)}</span>
              <span className="text-gray-400 truncate w-full text-center leading-tight">{eq.nombre_corto}</span>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  const isLocked = pred?.bloqueado ?? false

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <BackButton href="/dashboard" />
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black text-gray-900">
            🔮 <span className="text-gold-gradient">Predicciones Especiales</span>
          </h1>
          <p className="text-gray-400 mt-1">Predecí los resultados del torneo antes de que empiece</p>
        </motion.div>

        {/* Points info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Campeón', pts: PUNTAJE.BONUS_CAMPEON, emoji: '🏆' },
            { label: 'Finalistas', pts: PUNTAJE.BONUS_FINALISTAS, emoji: '🥈' },
            { label: 'Goleador', pts: PUNTAJE.BONUS_GOLEADOR, emoji: '⚽' },
            { label: 'Mejor Jugador', pts: PUNTAJE.BONUS_MEJOR_JUGADOR, emoji: '⭐' },
          ].map((item) => (
            <div key={item.label} className="glass rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{item.emoji}</div>
              <div className="text-xl font-black" style={{ color: '#B8860B' }}>+{item.pts} pts</div>
              <div className="text-xs text-gray-600">{item.label}</div>
            </div>
          ))}
        </div>

        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <Lock className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-300 font-semibold">Las predicciones especiales están bloqueadas — el torneo ya comenzó</span>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-6xl">⚽</motion.div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="glass rounded-3xl p-6 space-y-8">
              {/* Campeón */}
              <TeamSelector
                value={form.campeon_id}
                onChange={(v) => setForm((p) => ({ ...p, campeon_id: v }))}
                label="🏆 Campeón del Mundial (+25 pts)"
                disabled={isLocked}
                exclude={[form.subcampeon_id, form.semifinalista1_id, form.semifinalista2_id].filter(Boolean)}
              />

              {/* Subcampeón */}
              <TeamSelector
                value={form.subcampeon_id}
                onChange={(v) => setForm((p) => ({ ...p, subcampeon_id: v }))}
                label="🥈 Subcampeón (+10 pts)"
                disabled={isLocked}
                exclude={[form.campeon_id, form.semifinalista1_id, form.semifinalista2_id].filter(Boolean)}
              />

              {/* Semifinalistas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <TeamSelector
                  value={form.semifinalista1_id}
                  onChange={(v) => setForm((p) => ({ ...p, semifinalista1_id: v }))}
                  label="🥉 Semifinalista 1 (+5 pts)"
                  disabled={isLocked}
                  exclude={[form.campeon_id, form.subcampeon_id, form.semifinalista2_id].filter(Boolean)}
                />
                <TeamSelector
                  value={form.semifinalista2_id}
                  onChange={(v) => setForm((p) => ({ ...p, semifinalista2_id: v }))}
                  label="🥉 Semifinalista 2 (+5 pts)"
                  disabled={isLocked}
                  exclude={[form.campeon_id, form.subcampeon_id, form.semifinalista1_id].filter(Boolean)}
                />
              </div>

              {/* Goleador */}
              <div>
                <label className="text-sm text-gray-600 mb-2 block">⚽ Goleador del Torneo (+15 pts)</label>
                <input
                  value={form.goleador_nombre}
                  onChange={(e) => setForm((p) => ({ ...p, goleador_nombre: e.target.value }))}
                  disabled={isLocked}
                  placeholder="Nombre del goleador..."
                  className="w-full px-4 py-3.5 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none transition-all disabled:opacity-60"
                  style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid #D4C8B8' }}
                />
              </div>

              {/* Mejor jugador */}
              <div>
                <label className="text-sm text-gray-600 mb-2 block">⭐ Mejor Jugador (+15 pts)</label>
                <input
                  value={form.mejor_jugador_nombre}
                  onChange={(e) => setForm((p) => ({ ...p, mejor_jugador_nombre: e.target.value }))}
                  disabled={isLocked}
                  placeholder="Nombre del mejor jugador..."
                  className="w-full px-4 py-3.5 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none transition-all disabled:opacity-60"
                  style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid #D4C8B8' }}
                />
              </div>

              {/* Revelación */}
              <TeamSelector
                value={form.revelacion_id}
                onChange={(v) => setForm((p) => ({ ...p, revelacion_id: v }))}
                label="💫 Equipo Revelación"
                disabled={isLocked}
              />
            </div>

            {/* Save */}
            {!isLocked && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #F5C842, #D4A017)', color: '#050810' }}
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? 'Guardando...' : 'Guardar Predicciones Especiales 🔮'}
              </motion.button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
