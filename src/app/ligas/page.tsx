'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Copy, Users, Trophy, Share2, Search, Crown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AppLayout } from '@/components/layout/AppLayout'
import { BackButton } from '@/components/ui/BackButton'
import { toast } from 'sonner'
import type { Liga } from '@/types/database'

interface LigaConMiembros extends Liga {
  miembros_count: number
  mi_posicion?: number
  mis_puntos?: number
}

export default function LigasPage() {
  const router = useRouter()
  const supabase = createClient()

  const [userId, setUserId] = useState<string | null>(null)
  const [misLigas, setMisLigas] = useState<LigaConMiembros[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [newLigaNombre, setNewLigaNombre] = useState('')
  const [newLigaDesc, setNewLigaDesc] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      const { data: miembros } = await supabase
        .from('liga_miembros')
        .select('*, liga:ligas(*)')
        .eq('usuario_id', user.id)

      if (miembros) {
        const ligasData: LigaConMiembros[] = []
        for (const m of miembros as unknown as { liga_id: string; liga: Liga; posicion: number | null; puntos: number }[]) {
          const { count } = await supabase
            .from('liga_miembros')
            .select('*', { count: 'exact', head: true })
            .eq('liga_id', m.liga_id)

          ligasData.push({
            ...m.liga,
            miembros_count: count || 0,
            mi_posicion: m.posicion ?? undefined,
            mis_puntos: m.puntos,
          })
        }
        setMisLigas(ligasData)
      }

      setLoading(false)
    }
    load()
  }, [])

  async function handleCreate() {
    if (!userId || !newLigaNombre.trim()) return
    setCreating(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('ligas') as any).insert({
        nombre: newLigaNombre.trim(),
        descripcion: newLigaDesc.trim() || null,
        creador_id: userId,
        torneo_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      }).select().single()

      if (error) throw error

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('liga_miembros') as any).insert({
        liga_id: data.id,
        usuario_id: userId,
        rol: 'admin',
      })

      toast.success('¡Liga creada exitosamente!', { icon: '🏆' })
      setShowCreate(false)
      setNewLigaNombre('')
      setNewLigaDesc('')

      setMisLigas((prev) => [...prev, { ...data, miembros_count: 1, mi_posicion: undefined, mis_puntos: 0 }])
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear liga')
    } finally {
      setCreating(false)
    }
  }

  async function handleJoin() {
    if (!userId || !joinCode.trim()) return
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: liga } = await (supabase.from('ligas') as any)
        .select('*')
        .eq('codigo_invitacion', joinCode.toUpperCase())
        .single()

      if (!liga) { toast.error('Código inválido'); return }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('liga_miembros') as any).insert({
        liga_id: liga.id,
        usuario_id: userId,
        rol: 'miembro',
      })

      if (error) {
        if (error.code === '23505') toast.error('Ya sos miembro de esta liga')
        else throw error
        return
      }

      toast.success(`¡Unido a ${liga.nombre}!`, { icon: '🎉' })
      setShowJoin(false)
      setJoinCode('')
    } catch {
      toast.error('Error al unirse a la liga')
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    toast.success('Código copiado!', { icon: '📋' })
  }

  function shareWhatsApp(liga: LigaConMiembros) {
    const text = `¡Unite a mi liga "${liga.nombre}" en Club del Pleno! Código: ${liga.codigo_invitacion}\n${window.location.origin}/ligas`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <BackButton href="/dashboard" />
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900">🏆 <span className="text-gold-gradient">Mis Ligas</span></h1>
            <p className="text-gray-400 mt-1">Competí con amigos, familia y colegas</p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowJoin(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid #D4C8B8', color: '#D1D5DB' }}
            >
              <Search className="w-4 h-4" />
              Unirse
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #F5C842, #D4A017)', color: '#050810' }}
            >
              <Plus className="w-4 h-4" />
              Crear Liga
            </motion.button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-6xl">⚽</motion.div>
          </div>
        ) : misLigas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-16 text-center"
          >
            <div className="text-7xl mb-6">🏆</div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">No estás en ninguna liga todavía</h2>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">Creá tu propia liga o unite a una con el código de invitación</p>
            <div className="flex gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.04 }}
                onClick={() => setShowCreate(true)}
                className="px-6 py-3 rounded-xl font-bold"
                style={{ background: 'linear-gradient(135deg, #F5C842, #D4A017)', color: '#050810' }}
              >
                Crear Liga
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                onClick={() => setShowJoin(true)}
                className="px-6 py-3 rounded-xl font-semibold text-gray-900"
                style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid #D4C8B8' }}
              >
                Ingresar código
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {misLigas.map((liga, i) => (
              <motion.div
                key={liga.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="glass rounded-2xl p-6 card-hover space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-black text-gray-900">{liga.nombre}</h3>
                    {liga.descripcion && <p className="text-sm text-gray-600 mt-1">{liga.descripcion}</p>}
                  </div>
                  <div className="text-3xl">🏆</div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    {liga.miembros_count} miembro{liga.miembros_count !== 1 ? 's' : ''}
                  </div>
                  {liga.mi_posicion && (
                    <div className="flex items-center gap-1" style={{ color: '#B8860B' }}>
                      <Trophy className="w-4 h-4" />
                      #{liga.mi_posicion}
                    </div>
                  )}
                  {liga.mis_puntos !== undefined && (
                    <span className="text-gray-400">{liga.mis_puntos} pts</span>
                  )}
                </div>

                {/* Invite code */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid #E5DDD0' }}>
                  <Crown className="w-4 h-4 text-amber-700 flex-shrink-0" />
                  <code className="flex-1 font-mono text-sm font-bold tracking-widest" style={{ color: '#B8860B' }}>
                    {liga.codigo_invitacion}
                  </code>
                  <button onClick={() => copyCode(liga.codigo_invitacion)} className="text-gray-500 hover:text-gray-900 transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => shareWhatsApp(liga)} className="text-gray-500 hover:text-green-400 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create modal */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
              onClick={() => setShowCreate(false)}
            >
              <motion.div
                initial={{ scale: 0.8, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="glass rounded-3xl p-8 max-w-md w-full space-y-5"
              >
                <h2 className="text-2xl font-black text-gray-900">🏆 Crear Liga Privada</h2>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Nombre de la Liga *</label>
                  <input
                    value={newLigaNombre}
                    onChange={(e) => setNewLigaNombre(e.target.value)}
                    placeholder="Ej: Liga Amigos, Liga Oficina..."
                    maxLength={50}
                    className="w-full px-4 py-3.5 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none transition-all"
                    style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid #D4C8B8' }}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Descripción (opcional)</label>
                  <textarea
                    value={newLigaDesc}
                    onChange={(e) => setNewLigaDesc(e.target.value)}
                    placeholder="Describe tu liga..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none resize-none transition-all"
                    style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid #D4C8B8' }}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-3 rounded-xl font-semibold text-gray-600"
                    style={{ background: 'rgba(0,0,0,0.04)' }}
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!newLigaNombre.trim() || creating}
                    onClick={handleCreate}
                    className="flex-1 py-3 rounded-xl font-bold disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #F5C842, #D4A017)', color: '#050810' }}
                  >
                    {creating ? '...' : 'Crear Liga 🏆'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Join modal */}
        <AnimatePresence>
          {showJoin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
              onClick={() => setShowJoin(false)}
            >
              <motion.div
                initial={{ scale: 0.8, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="glass rounded-3xl p-8 max-w-sm w-full space-y-5 text-center"
              >
                <div className="text-5xl">🔑</div>
                <h2 className="text-2xl font-black text-gray-900">Unirse a una Liga</h2>
                <p className="text-gray-400 text-sm">Ingresá el código de invitación que te compartió el creador</p>

                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABC12345"
                  maxLength={8}
                  className="w-full px-4 py-3.5 rounded-xl text-gray-900 text-center font-mono font-bold text-xl placeholder-gray-600 focus:outline-none tracking-widest"
                  style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(245,200,66,0.2)' }}
                />

                <div className="flex gap-3">
                  <button onClick={() => setShowJoin(false)} className="flex-1 py-3 rounded-xl font-semibold text-gray-600" style={{ background: 'rgba(0,0,0,0.04)' }}>
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={joinCode.length < 6}
                    onClick={handleJoin}
                    className="flex-1 py-3 rounded-xl font-bold disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #F5C842, #D4A017)', color: '#050810' }}
                  >
                    Unirse 🎉
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
