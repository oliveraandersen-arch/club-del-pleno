export const TORNEO_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

export const PUNTAJE = {
  EXACTO: 5,
  DIFERENCIA: 4,
  GANADOR: 3,
  EMPATE: 3,
  ERROR: 0,
  BONUS_FECHA_PLENA: 10,
  BONUS_CAMPEON: 25,
  BONUS_FINALISTAS: 10,
  BONUS_SEMIFINALISTAS: 5,
  BONUS_GOLEADOR: 15,
  BONUS_MEJOR_JUGADOR: 15,
} as const

export const FASES = {
  grupos: 'Fase de Grupos',
  octavos: 'Octavos de Final',
  cuartos: 'Cuartos de Final',
  semifinal: 'Semifinales',
  tercer_puesto: 'Tercer Puesto',
  final: 'Final',
} as const

export const ESTADOS_PARTIDO = {
  programado: 'Programado',
  en_curso: 'En curso',
  finalizado: 'Finalizado',
  suspendido: 'Suspendido',
} as const

export const XP_ACCIONES = {
  prediccion: 10,
  prediccion_exacta: 50,
  prediccion_correcta: 20,
  comentario: 5,
  like_recibido: 2,
  logro_desbloqueado: 100,
  login_diario: 15,
  amigo_invitado: 75,
} as const

export const NIVELES_CONFIG = [
  { nivel: 1, nombre: 'Fanático', xp: 0, icono: '⚽', color: '#6B7280' },
  { nivel: 2, nombre: 'Aficionado', xp: 100, icono: '🏟️', color: '#6B7280' },
  { nivel: 3, nombre: 'Hincha', xp: 250, icono: '🎽', color: '#3B82F6' },
  { nivel: 4, nombre: 'Seguidor', xp: 500, icono: '🏅', color: '#3B82F6' },
  { nivel: 5, nombre: 'Experto', xp: 1000, icono: '⭐', color: '#8B5CF6' },
  { nivel: 6, nombre: 'Analista', xp: 2000, icono: '📊', color: '#8B5CF6' },
  { nivel: 7, nombre: 'Pronosticador', xp: 3500, icono: '🔮', color: '#F59E0B' },
  { nivel: 8, nombre: 'Maestro', xp: 5500, icono: '🏆', color: '#F59E0B' },
  { nivel: 9, nombre: 'Gran Maestro', xp: 8000, icono: '👑', color: '#EF4444' },
  { nivel: 10, nombre: 'Leyenda', xp: 12000, icono: '🌟', color: '#EF4444' },
  { nivel: 20, nombre: 'Oráculo Supremo', xp: 50000, icono: '🔱', color: '#FFD700' },
  { nivel: 50, nombre: 'Inmortal', xp: 150000, icono: '💎', color: '#00FFFF' },
  { nivel: 100, nombre: 'El Elegido', xp: 500000, icono: '🌈', color: '#FF6B6B' },
]

export function getNivel(xp: number) {
  let nivel = NIVELES_CONFIG[0]
  for (const n of NIVELES_CONFIG) {
    if (xp >= n.xp) nivel = n
    else break
  }
  return nivel
}

export function getProgresoNivel(xp: number) {
  let actual = NIVELES_CONFIG[0]
  let siguiente = NIVELES_CONFIG[1]
  for (let i = 0; i < NIVELES_CONFIG.length - 1; i++) {
    if (xp >= NIVELES_CONFIG[i].xp && xp < NIVELES_CONFIG[i + 1].xp) {
      actual = NIVELES_CONFIG[i]
      siguiente = NIVELES_CONFIG[i + 1]
      break
    }
  }
  const xpEnNivel = xp - actual.xp
  const xpNecesario = siguiente.xp - actual.xp
  return {
    actual,
    siguiente,
    porcentaje: Math.min(100, Math.round((xpEnNivel / xpNecesario) * 100)),
    xpEnNivel,
    xpNecesario,
  }
}
