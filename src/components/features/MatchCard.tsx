'use client'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Lock, Clock, MapPin, Star } from 'lucide-react'
import { format, formatDistanceToNow, isPast } from 'date-fns'
import { es } from 'date-fns/locale'
import type { PartidoConEquipos, Prediccion } from '@/types/database'
import { FASES } from '@/lib/constants'

interface Props {
  partido: PartidoConEquipos
  prediccion?: Prediccion | null
  onPredict?: (gLocal: number, gVisitante: number) => Promise<void>
  showResult?: boolean
  compact?: boolean
}

export function MatchCard({ partido, prediccion, onPredict, showResult, compact }: Props) {
  const [golLocal, setGolLocal] = useState(prediccion?.goles_local ?? 0)
  const [golVisitante, setGolVisitante] = useState(prediccion?.goles_visitante ?? 0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const isLocked = partido.estado !== 'programado' || isPast(new Date(partido.fecha))
  const isFinalizado = partido.estado === 'finalizado'

  useEffect(() => {
    if (prediccion) {
      setGolLocal(prediccion.goles_local)
      setGolVisitante(prediccion.goles_visitante)
    }
  }, [prediccion])

  async function handleSave() {
    if (!onPredict || isLocked) return
    setSaving(true)
    await onPredict(golLocal, golVisitante)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function ScoreSelector({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled: boolean }) {
    return (
      <div className="flex flex-col items-center gap-1">
        {!disabled && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(Math.min(20, value + 1))}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            style={{ background: 'rgba(0,0,0,0.04)' }}
          >
            +
          </motion.button>
        )}
        <motion.div
          key={value}
          initial={{ scale: 0.7 }}
          animate={{ scale: 1 }}
          className="score-btn"
          style={{
            background: isLocked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)',
            borderColor: isLocked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.15)',
            color: isFinalizado ? '#9CA3AF' : 'white',
            fontSize: compact ? '1.25rem' : undefined,
            width: compact ? 56 : undefined,
            height: compact ? 56 : undefined,
          }}
        >
          {value}
        </motion.div>
        {!disabled && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(Math.max(0, value - 1))}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            style={{ background: 'rgba(0,0,0,0.04)' }}
          >
            −
          </motion.button>
        )}
      </div>
    )
  }

  function getPuntosBadge() {
    if (!prediccion?.tipo_acierto || prediccion.tipo_acierto === 'pendiente') return null
    const classes: Record<string, string> = {
      exacto: 'acierto-exacto',
      diferencia: 'acierto-diferencia',
      ganador: 'acierto-ganador',
      empate: 'acierto-ganador',
      error: 'acierto-error',
    }
    const labels: Record<string, string> = {
      exacto: `+5 pts 🎯`,
      diferencia: `+4 pts ⚡`,
      ganador: `+3 pts ✅`,
      empate: `+3 pts 🤝`,
      error: `0 pts ❌`,
    }
    return (
      <div className={`text-xs px-2 py-0.5 rounded-full font-semibold ${classes[prediccion.tipo_acierto]}`}>
        {labels[prediccion.tipo_acierto]}
      </div>
    )
  }

  return (
    <motion.div
      layout
      whileHover={{ scale: compact ? 1 : 1.01 }}
      className={`rounded-2xl overflow-hidden card-hover ${compact ? 'p-4' : 'p-5'}`}
      style={{
        background: partido.estado === 'en_curso'
          ? 'rgba(240,253,244,0.95)'
          : isFinalizado
          ? '#F9F6F1'
          : '#FFFFFF',
        border: partido.estado === 'en_curso'
          ? '1.5px solid rgba(22,163,74,0.3)'
          : isFinalizado
          ? '1px solid #E5DDD0'
          : '1px solid #E5DDD0',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      }}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{FASES[partido.fase as keyof typeof FASES] || partido.fase}</span>
          {partido.estado === 'en_curso' && (
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(22,163,74,0.12)', color: '#16A34A' }}
            >
              ⏱ EN VIVO
            </motion.span>
          )}
          {isLocked && partido.estado === 'programado' && (
            <span className="text-xs text-gray-600 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Cerrado
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {getPuntosBadge()}
          {!isFinalizado && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(partido.fecha), { locale: es, addSuffix: true })}
            </div>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-4">
        {/* Local */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="text-3xl">{getFlagEmoji(partido.equipo_local.pais)}</div>
          <div className="text-sm font-semibold text-gray-900 text-center leading-tight">
            {partido.equipo_local.nombre_corto}
          </div>
          {partido.equipo_local.ranking_fifa && (
            <div className="text-xs text-gray-500">#{partido.equipo_local.ranking_fifa}</div>
          )}
        </div>

        {/* Score */}
        <div className="flex items-center gap-2">
          {isFinalizado && showResult ? (
            <div className="flex items-center gap-3">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-3xl font-black text-gray-900"
              >
                {partido.goles_local}
              </motion.span>
              <span className="text-gray-600 font-bold">-</span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-3xl font-black text-gray-900"
              >
                {partido.goles_visitante}
              </motion.span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ScoreSelector value={golLocal} onChange={setGolLocal} disabled={isLocked} />
              <span className="text-gray-500 font-bold text-xl">:</span>
              <ScoreSelector value={golVisitante} onChange={setGolVisitante} disabled={isLocked} />
            </div>
          )}
        </div>

        {/* Visitante */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="text-3xl">{getFlagEmoji(partido.equipo_visitante.pais)}</div>
          <div className="text-sm font-semibold text-gray-900 text-center leading-tight">
            {partido.equipo_visitante.nombre_corto}
          </div>
          {partido.equipo_visitante.ranking_fifa && (
            <div className="text-xs text-gray-500">#{partido.equipo_visitante.ranking_fifa}</div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <MapPin className="w-3 h-3" />
          {partido.ciudad}
        </div>
        <div className="text-xs text-gray-600">
          {format(new Date(partido.fecha), "d MMM, HH:mm", { locale: es })}
        </div>
      </div>

      {/* Save button */}
      {onPredict && !isLocked && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="mt-4 w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          style={{
            background: saved
              ? 'rgba(34,197,94,0.2)'
              : 'rgba(245,200,66,0.1)',
            border: saved
              ? '1px solid rgba(34,197,94,0.3)'
              : '1px solid rgba(245,200,66,0.2)',
            color: saved ? '#86EFAC' : '#F5C842',
          }}
        >
          {saving ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              ⚽
            </motion.div>
          ) : saved ? (
            <>✅ Predicción guardada</>
          ) : (
            <><Star className="w-4 h-4" /> Guardar predicción</>
          )}
        </motion.button>
      )}

      {/* Locked overlay info */}
      {isLocked && !isFinalizado && (
        <div className="mt-3 text-center text-xs text-gray-600 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" /> Predicciones cerradas — partido en curso
        </div>
      )}

      {prediccion && !isFinalizado && (
        <div className="mt-2 text-center text-xs text-gray-500">
          Tu predicción: <span className="text-gray-300 font-semibold">{prediccion.goles_local} - {prediccion.goles_visitante}</span>
        </div>
      )}
    </motion.div>
  )
}

function getFlagEmoji(pais: string): string {
  const flags: Record<string, string> = {
    'Argentina': '🇦🇷', 'Brasil': '🇧🇷', 'Francia': '🇫🇷', 'España': '🇪🇸',
    'Inglaterra': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Portugal': '🇵🇹', 'Alemania': '🇩🇪',
    'Países Bajos': '🇳🇱', 'Uruguay': '🇺🇾', 'México': '🇲🇽', 'Colombia': '🇨🇴',
    'Marruecos': '🇲🇦', 'Italia': '🇮🇹', 'Senegal': '🇸🇳', 'Japón': '🇯🇵',
    'Croacia': '🇭🇷', 'Estados Unidos': '🇺🇸', 'Canadá': '🇨🇦', 'Ecuador': '🇪🇨',
    'Australia': '🇦🇺', 'Serbia': '🇷🇸', 'Ghana': '🇬🇭', 'Corea del Sur': '🇰🇷',
    'Bélgica': '🇧🇪',
  }
  return flags[pais] || '🏳️'
}

export { getFlagEmoji }
