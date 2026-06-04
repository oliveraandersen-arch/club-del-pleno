export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          username: string
          nombre_visible: string | null
          email: string
          foto_url: string | null
          equipo_favorito_id: string | null
          pais_favorito: string | null
          frase_personal: string | null
          nivel: number
          xp: number
          puntos_totales: number
          predicciones_realizadas: number
          predicciones_exactas: number
          racha_actual: number
          mejor_racha: number
          es_admin: boolean
          activo: boolean
          ultimo_acceso: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['usuarios']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['usuarios']['Row']>
      }
      partidos: {
        Row: {
          id: string
          torneo_id: string
          equipo_local_id: string
          equipo_visitante_id: string
          goles_local: number | null
          goles_visitante: number | null
          fecha: string
          estadio: string | null
          ciudad: string | null
          fase: string
          fecha_numero: number
          estado: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['partidos']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['partidos']['Row']>
      }
      equipos: {
        Row: {
          id: string
          nombre: string
          nombre_corto: string
          pais: string
          bandera_url: string | null
          escudo_url: string | null
          ranking_fifa: number
          grupo: string | null
          color_primario: string
          color_secundario: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['equipos']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['equipos']['Row']>
      }
      predicciones: {
        Row: {
          id: string
          usuario_id: string
          partido_id: string
          goles_local: number
          goles_visitante: number
          puntos_obtenidos: number
          tipo_acierto: string | null
          comentario: string | null
          goleadores: Json | null
          confirmada: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['predicciones']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['predicciones']['Row']>
      }
      comentarios: {
        Row: {
          id: string
          usuario_id: string
          partido_id: string
          parent_id: string | null
          contenido: string
          likes: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['comentarios']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['comentarios']['Row']>
      }
      ligas: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          imagen_url: string | null
          codigo_invitacion: string
          creador_id: string
          torneo_id: string
          max_miembros: number
          activa: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ligas']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['ligas']['Row']>
      }
      liga_miembros: {
        Row: {
          id: string
          liga_id: string
          usuario_id: string
          rol: string
          puntos: number
          posicion: number | null
          joined_at: string
        }
        Insert: Omit<Database['public']['Tables']['liga_miembros']['Row'], 'id' | 'joined_at'>
        Update: Partial<Database['public']['Tables']['liga_miembros']['Row']>
      }
      logros: {
        Row: {
          id: string
          nombre: string
          descripcion: string
          icono: string | null
          rareza: string
          xp_recompensa: number
          condicion_tipo: string | null
          condicion_valor: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['logros']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['logros']['Row']>
      }
      usuario_logros: {
        Row: {
          id: string
          usuario_id: string
          logro_id: string
          desbloqueado_at: string
        }
        Insert: Omit<Database['public']['Tables']['usuario_logros']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['usuario_logros']['Row']>
      }
      ranking: {
        Row: {
          id: string
          usuario_id: string
          torneo_id: string
          puntos: number
          posicion: number | null
          posicion_anterior: number | null
          predicciones_exactas: number
          predicciones_correctas: number
          predicciones_incorrectas: number
          efectividad: number
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['ranking']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['ranking']['Row']>
      }
      notificaciones: {
        Row: {
          id: string
          usuario_id: string
          tipo: string
          titulo: string
          mensaje: string | null
          leida: boolean
          datos: Json | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notificaciones']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notificaciones']['Row']>
      }
      actividad: {
        Row: {
          id: string
          usuario_id: string
          tipo: string
          descripcion: string
          datos: Json | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['actividad']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['actividad']['Row']>
      }
      grupo_posiciones: {
        Row: {
          id: string
          torneo_id: string
          equipo_id: string
          grupo: string
          partidos_jugados: number
          victorias: number
          empates: number
          derrotas: number
          goles_favor: number
          goles_contra: number
          diferencia_goles: number
          puntos: number
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['grupo_posiciones']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['grupo_posiciones']['Row']>
      }
      predicciones_especiales: {
        Row: {
          id: string
          usuario_id: string
          torneo_id: string
          campeon_id: string | null
          subcampeon_id: string | null
          semifinalista1_id: string | null
          semifinalista2_id: string | null
          goleador_nombre: string | null
          mejor_jugador_nombre: string | null
          revelacion_id: string | null
          puntos_obtenidos: number
          bloqueado: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['predicciones_especiales']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['predicciones_especiales']['Row']>
      }
      amistades: {
        Row: {
          id: string
          solicitante_id: string
          receptor_id: string
          estado: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['amistades']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['amistades']['Row']>
      }
      torneos: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          anio: number
          pais_sede: string | null
          fecha_inicio: string | null
          fecha_fin: string | null
          estado: string
          imagen_url: string | null
          activo: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['torneos']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['torneos']['Row']>
      }
      niveles: {
        Row: {
          nivel: number
          nombre: string
          xp_requerido: number
          icono: string | null
          color: string | null
        }
        Insert: Database['public']['Tables']['niveles']['Row']
        Update: Partial<Database['public']['Tables']['niveles']['Row']>
      }
      likes_comentarios: {
        Row: {
          id: string
          usuario_id: string
          comentario_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['likes_comentarios']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['likes_comentarios']['Row']>
      }
    }
    Functions: {
      calcular_puntos_prediccion: {
        Args: {
          p_goles_local_pred: number
          p_goles_visitante_pred: number
          p_goles_local_real: number
          p_goles_visitante_real: number
        }
        Returns: number
      }
      actualizar_xp_usuario: {
        Args: { p_usuario_id: string; p_xp: number }
        Returns: void
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Equipo = Tables<'equipos'>
export type Partido = Tables<'partidos'>
export type Usuario = Tables<'usuarios'>
export type Prediccion = Tables<'predicciones'>
export type Comentario = Tables<'comentarios'>
export type Liga = Tables<'ligas'>
export type Logro = Tables<'logros'>
export type Ranking = Tables<'ranking'>
export type Notificacion = Tables<'notificaciones'>
export type Actividad = Tables<'actividad'>
export type Torneo = Tables<'torneos'>
export type PrediccionEspecial = Tables<'predicciones_especiales'>

export type PartidoConEquipos = Partido & {
  equipo_local: Equipo
  equipo_visitante: Equipo
}

export type PrediccionConPartido = Prediccion & {
  partido: PartidoConEquipos
}

export type RankingConUsuario = Ranking & {
  usuario: Usuario
}

export type ComentarioConUsuario = Comentario & {
  usuario: Usuario
  respuestas?: ComentarioConUsuario[]
  liked_by_me?: boolean
}
