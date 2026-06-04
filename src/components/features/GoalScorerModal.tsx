'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { X, Plus, Trash2, CheckCircle, Clock } from 'lucide-react'
import type { PartidoConEquipos, Prediccion } from '@/types/database'
import { getFlagEmoji } from './MatchCard'

interface Goleador {
  jugador: string
  minuto: number | string
}

interface GoleadoresData {
  local: Goleador[]
  visitante: Goleador[]
}

interface Props {
  partido: PartidoConEquipos
  prediccion: Prediccion
  onSave: (goleadores: GoleadoresData) => Promise<void>
  onClose: () => void
}

export function GoalScorerModal({ partido, prediccion, onSave, onClose }: Props) {
  const existing = (prediccion.goleadores as unknown as GoleadoresData) || { local: [], visitante: [] }
  const [goleadores, setGoleadores] = useState<GoleadoresData>({
    local: existing.local || [],
    visitante: existing.visitante || [],
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const golesLocal = prediccion.goles_local
  const golesVisitante = prediccion.goles_visitante

  function addGoleador(equipo: 'local' | 'visitante') {
    setGoleadores(prev => ({
      ...prev,
      [equipo]: [...prev[equipo], { jugador: '', minuto: '' }],
    }))
  }

  function removeGoleador(equipo: 'local' | 'visitante', idx: number) {
    setGoleadores(prev => ({
      ...prev,
      [equipo]: prev[equipo].filter((_, i) => i !== idx),
    }))
  }

  function updateGoleador(equipo: 'local' | 'visitante', idx: number, field: 'jugador' | 'minuto', value: string) {
    setGoleadores(prev => ({
      ...prev,
      [equipo]: prev[equipo].map((g, i) =>
        i === idx ? { ...g, [field]: field === 'minuto' ? (value === '' ? '' : Number(value)) : value } : g
      ),
    }))
  }

  async function handleSave() {
    setSaving(true)
    await onSave(goleadores)
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 1200)
  }

  function TeamSection({ equipo, tipo }: { equipo: typeof partido.equipo_local; tipo: 'local' | 'visitante' }) {
    const goles = tipo === 'local' ? golesLocal : golesVisitante
    const lista = goleadores[tipo]

    return (
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{getFlagEmoji(equipo.pais)}</span>
          <div>
            <div className="font-bold text-sm" style={{ color: '#1A1A1A' }}>{equipo.nombre}</div>
            <div className="text-xs" style={{ color: '#B8860B' }}>
              {goles} gol{goles !== 1 ? 'es' : ''} predichos
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {lista.map((g, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <input
                value={g.jugador}
                onChange={e => updateGoleador(tipo, i, 'jugador', e.target.value)}
                placeholder="Jugador"
                className="flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none"
                style={{ background: '#F5F0E8', border: '1px solid #E5DDD0', color: '#1A1A1A' }}
              />
              <input
                type="number"
                value={g.minuto}
                onChange={e => updateGoleador(tipo, i, 'minuto', e.target.value)}
                placeholder="Min"
                min={1}
                max={120}
                className="w-16 px-2 py-2 rounded-xl text-sm text-center focus:outline-none"
                style={{ background: '#F5F0E8', border: '1px solid #E5DDD0', color: '#1A1A1A' }}
              />
              <button
                onClick={() => removeGoleador(tipo, i)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: '#DC2626' }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>

        {lista.length < (goles || 0) && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => addGoleador(tipo)}
            className="mt-2 w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all"
            style={{ background: '#F5F0E8', border: '1px dashed #D4C8B8', color: '#B8860B' }}
          >
            <Plus className="w-3 h-3" /> Agregar goleador
          </motion.button>
        )}

        {lista.length === 0 && goles === 0 && (
          <div className="text-xs py-2 text-center" style={{ color: '#9A9490' }}>Sin goles</div>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl overflow-hidden"
        style={{ background: '#FFFFFF', border: '1px solid #E5DDD0', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #F0EAE0' }}>
          <div>
            <h2 className="font-black text-lg" style={{ color: '#1A1A1A' }}>⚽ Goleadores</h2>
            <p className="text-xs mt-0.5" style={{ color: '#9A9490' }}>
              {getFlagEmoji(partido.equipo_local.pais)} {partido.equipo_local.nombre_corto}
              <span className="font-black mx-2" style={{ color: '#B8860B' }}>
                {prediccion.goles_local} - {prediccion.goles_visitante}
              </span>
              {partido.equipo_visitante.nombre_corto} {getFlagEmoji(partido.equipo_visitante.pais)}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100">
            <X className="w-4 h-4" style={{ color: '#6B6260' }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {(golesLocal ?? 0) + (golesVisitante ?? 0) === 0 ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">🤝</div>
              <p className="text-sm" style={{ color: '#6B6260' }}>
                Predijiste empate 0-0, sin goleadores para agregar.
              </p>
            </div>
          ) : (
            <div className="flex gap-4">
              {(golesLocal ?? 0) > 0 && (
                <TeamSection equipo={partido.equipo_local} tipo="local" />
              )}
              {(golesLocal ?? 0) > 0 && (golesVisitante ?? 0) > 0 && (
                <div className="w-px" style={{ background: '#F0EAE0' }} />
              )}
              {(golesVisitante ?? 0) > 0 && (
                <TeamSection equipo={partido.equipo_visitante} tipo="visitante" />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: '#F5F0E8', color: '#6B6260' }}
          >
            Cancelar
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
            style={{
              background: saved ? '#22C55E' : 'linear-gradient(135deg, #B8860B, #96700A)',
              color: '#fff',
            }}
          >
            {saving ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                ⚽
              </motion.div>
            ) : saved ? (
              <><CheckCircle className="w-4 h-4" /> ¡Guardado!</>
            ) : (
              <><CheckCircle className="w-4 h-4" /> Confirmar goleadores</>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
