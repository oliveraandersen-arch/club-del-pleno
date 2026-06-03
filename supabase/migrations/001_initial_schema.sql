-- ============================================================
-- CLUB DEL PLENO — SCHEMA COMPLETO
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- EQUIPOS
-- ============================================================
CREATE TABLE equipos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  nombre_corto VARCHAR(10) NOT NULL,
  pais VARCHAR(100) NOT NULL,
  bandera_url TEXT,
  escudo_url TEXT,
  ranking_fifa INTEGER DEFAULT 0,
  grupo VARCHAR(1),
  color_primario VARCHAR(7) DEFAULT '#000000',
  color_secundario VARCHAR(7) DEFAULT '#ffffff',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TORNEOS
-- ============================================================
CREATE TABLE torneos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  anio INTEGER NOT NULL,
  pais_sede VARCHAR(100),
  fecha_inicio DATE,
  fecha_fin DATE,
  estado VARCHAR(20) DEFAULT 'proximo' CHECK (estado IN ('proximo', 'en_curso', 'finalizado')),
  imagen_url TEXT,
  activo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PARTIDOS
-- ============================================================
CREATE TABLE partidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  torneo_id UUID REFERENCES torneos(id) ON DELETE CASCADE,
  equipo_local_id UUID REFERENCES equipos(id),
  equipo_visitante_id UUID REFERENCES equipos(id),
  goles_local INTEGER,
  goles_visitante INTEGER,
  fecha TIMESTAMPTZ NOT NULL,
  estadio VARCHAR(200),
  ciudad VARCHAR(100),
  fase VARCHAR(50) DEFAULT 'grupos' CHECK (fase IN ('grupos', 'octavos', 'cuartos', 'semifinal', 'tercer_puesto', 'final')),
  fecha_numero INTEGER DEFAULT 1,
  estado VARCHAR(20) DEFAULT 'programado' CHECK (estado IN ('programado', 'en_curso', 'finalizado', 'suspendido')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USUARIOS (extiende auth.users de Supabase)
-- ============================================================
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  nombre_visible VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  foto_url TEXT,
  equipo_favorito_id UUID REFERENCES equipos(id),
  pais_favorito VARCHAR(100),
  frase_personal TEXT,
  nivel INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  puntos_totales INTEGER DEFAULT 0,
  predicciones_realizadas INTEGER DEFAULT 0,
  predicciones_exactas INTEGER DEFAULT 0,
  racha_actual INTEGER DEFAULT 0,
  mejor_racha INTEGER DEFAULT 0,
  es_admin BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  ultimo_acceso TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PREDICCIONES
-- ============================================================
CREATE TABLE predicciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  partido_id UUID REFERENCES partidos(id) ON DELETE CASCADE,
  goles_local INTEGER NOT NULL CHECK (goles_local >= 0),
  goles_visitante INTEGER NOT NULL CHECK (goles_visitante >= 0),
  puntos_obtenidos INTEGER DEFAULT 0,
  tipo_acierto VARCHAR(30) CHECK (tipo_acierto IN ('exacto', 'diferencia', 'ganador', 'empate', 'error', 'pendiente')),
  comentario TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, partido_id)
);

-- ============================================================
-- PREDICCIONES ESPECIALES
-- ============================================================
CREATE TABLE predicciones_especiales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  torneo_id UUID REFERENCES torneos(id) ON DELETE CASCADE,
  campeon_id UUID REFERENCES equipos(id),
  subcampeon_id UUID REFERENCES equipos(id),
  semifinalista1_id UUID REFERENCES equipos(id),
  semifinalista2_id UUID REFERENCES equipos(id),
  goleador_nombre VARCHAR(100),
  mejor_jugador_nombre VARCHAR(100),
  revelacion_id UUID REFERENCES equipos(id),
  puntos_obtenidos INTEGER DEFAULT 0,
  bloqueado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, torneo_id)
);

-- ============================================================
-- RANKING
-- ============================================================
CREATE TABLE ranking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  torneo_id UUID REFERENCES torneos(id) ON DELETE CASCADE,
  puntos INTEGER DEFAULT 0,
  posicion INTEGER,
  posicion_anterior INTEGER,
  predicciones_exactas INTEGER DEFAULT 0,
  predicciones_correctas INTEGER DEFAULT 0,
  predicciones_incorrectas INTEGER DEFAULT 0,
  efectividad DECIMAL(5,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, torneo_id)
);

-- ============================================================
-- COMENTARIOS
-- ============================================================
CREATE TABLE comentarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  partido_id UUID REFERENCES partidos(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comentarios(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LIKES COMENTARIOS
-- ============================================================
CREATE TABLE likes_comentarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  comentario_id UUID REFERENCES comentarios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, comentario_id)
);

-- ============================================================
-- LIGAS PRIVADAS
-- ============================================================
CREATE TABLE ligas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  imagen_url TEXT,
  codigo_invitacion VARCHAR(20) UNIQUE NOT NULL DEFAULT upper(substring(gen_random_uuid()::text, 1, 8)),
  creador_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  torneo_id UUID REFERENCES torneos(id) ON DELETE CASCADE,
  max_miembros INTEGER DEFAULT 50,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MIEMBROS DE LIGAS
-- ============================================================
CREATE TABLE liga_miembros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  liga_id UUID REFERENCES ligas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  rol VARCHAR(20) DEFAULT 'miembro' CHECK (rol IN ('admin', 'miembro')),
  puntos INTEGER DEFAULT 0,
  posicion INTEGER,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(liga_id, usuario_id)
);

-- ============================================================
-- LOGROS / ACHIEVEMENTS
-- ============================================================
CREATE TABLE logros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  icono VARCHAR(50),
  rareza VARCHAR(20) DEFAULT 'comun' CHECK (rareza IN ('comun', 'raro', 'epico', 'legendario')),
  xp_recompensa INTEGER DEFAULT 0,
  condicion_tipo VARCHAR(50),
  condicion_valor INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LOGROS DE USUARIOS
-- ============================================================
CREATE TABLE usuario_logros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  logro_id UUID REFERENCES logros(id) ON DELETE CASCADE,
  desbloqueado_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, logro_id)
);

-- ============================================================
-- NOTIFICACIONES
-- ============================================================
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  mensaje TEXT,
  leida BOOLEAN DEFAULT false,
  datos JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AMISTADES
-- ============================================================
CREATE TABLE amistades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solicitante_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  receptor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(solicitante_id, receptor_id)
);

-- ============================================================
-- ACTIVIDAD FEED
-- ============================================================
CREATE TABLE actividad (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  descripcion TEXT NOT NULL,
  datos JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NIVELES
-- ============================================================
CREATE TABLE niveles (
  nivel INTEGER PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  xp_requerido INTEGER NOT NULL,
  icono VARCHAR(50),
  color VARCHAR(7)
);

-- ============================================================
-- TABLA DE GRUPOS (fase de grupos)
-- ============================================================
CREATE TABLE grupo_posiciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  torneo_id UUID REFERENCES torneos(id) ON DELETE CASCADE,
  equipo_id UUID REFERENCES equipos(id) ON DELETE CASCADE,
  grupo VARCHAR(1) NOT NULL,
  partidos_jugados INTEGER DEFAULT 0,
  victorias INTEGER DEFAULT 0,
  empates INTEGER DEFAULT 0,
  derrotas INTEGER DEFAULT 0,
  goles_favor INTEGER DEFAULT 0,
  goles_contra INTEGER DEFAULT 0,
  diferencia_goles INTEGER DEFAULT 0,
  puntos INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(torneo_id, equipo_id)
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_predicciones_usuario ON predicciones(usuario_id);
CREATE INDEX idx_predicciones_partido ON predicciones(partido_id);
CREATE INDEX idx_partidos_torneo ON partidos(torneo_id);
CREATE INDEX idx_partidos_fecha ON partidos(fecha);
CREATE INDEX idx_ranking_torneo ON ranking(torneo_id);
CREATE INDEX idx_ranking_puntos ON ranking(puntos DESC);
CREATE INDEX idx_comentarios_partido ON comentarios(partido_id);
CREATE INDEX idx_actividad_usuario ON actividad(usuario_id);
CREATE INDEX idx_actividad_created ON actividad(created_at DESC);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE predicciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE predicciones_especiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes_comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE ligas ENABLE ROW LEVEL SECURITY;
ALTER TABLE liga_miembros ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE amistades ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividad ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_logros ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking ENABLE ROW LEVEL SECURITY;

-- Usuarios: cualquiera puede leer, solo el dueño puede escribir
CREATE POLICY "usuarios_read_all" ON usuarios FOR SELECT USING (true);
CREATE POLICY "usuarios_update_own" ON usuarios FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "usuarios_insert_own" ON usuarios FOR INSERT WITH CHECK (auth.uid() = id);

-- Predicciones: cualquiera puede leer, solo el dueño puede escribir
CREATE POLICY "predicciones_read_all" ON predicciones FOR SELECT USING (true);
CREATE POLICY "predicciones_insert_own" ON predicciones FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "predicciones_update_own" ON predicciones FOR UPDATE USING (auth.uid() = usuario_id);

-- Predicciones especiales
CREATE POLICY "pred_esp_read_all" ON predicciones_especiales FOR SELECT USING (true);
CREATE POLICY "pred_esp_insert_own" ON predicciones_especiales FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "pred_esp_update_own" ON predicciones_especiales FOR UPDATE USING (auth.uid() = usuario_id);

-- Comentarios
CREATE POLICY "comentarios_read_all" ON comentarios FOR SELECT USING (true);
CREATE POLICY "comentarios_insert_auth" ON comentarios FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "comentarios_update_own" ON comentarios FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "comentarios_delete_own" ON comentarios FOR DELETE USING (auth.uid() = usuario_id);

-- Likes
CREATE POLICY "likes_read_all" ON likes_comentarios FOR SELECT USING (true);
CREATE POLICY "likes_insert_own" ON likes_comentarios FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "likes_delete_own" ON likes_comentarios FOR DELETE USING (auth.uid() = usuario_id);

-- Ligas
CREATE POLICY "ligas_read_all" ON ligas FOR SELECT USING (true);
CREATE POLICY "ligas_insert_auth" ON ligas FOR INSERT WITH CHECK (auth.uid() = creador_id);
CREATE POLICY "ligas_update_own" ON ligas FOR UPDATE USING (auth.uid() = creador_id);

-- Liga miembros
CREATE POLICY "liga_miembros_read_all" ON liga_miembros FOR SELECT USING (true);
CREATE POLICY "liga_miembros_insert_own" ON liga_miembros FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "liga_miembros_delete_own" ON liga_miembros FOR DELETE USING (auth.uid() = usuario_id);

-- Notificaciones: solo el dueño
CREATE POLICY "notif_read_own" ON notificaciones FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "notif_update_own" ON notificaciones FOR UPDATE USING (auth.uid() = usuario_id);

-- Ranking público
CREATE POLICY "ranking_read_all" ON ranking FOR SELECT USING (true);

-- Amistades
CREATE POLICY "amistades_read_own" ON amistades FOR SELECT USING (auth.uid() = solicitante_id OR auth.uid() = receptor_id);
CREATE POLICY "amistades_insert_own" ON amistades FOR INSERT WITH CHECK (auth.uid() = solicitante_id);
CREATE POLICY "amistades_update_own" ON amistades FOR UPDATE USING (auth.uid() = receptor_id);

-- Actividad
CREATE POLICY "actividad_read_all" ON actividad FOR SELECT USING (true);
CREATE POLICY "actividad_insert_own" ON actividad FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Logros de usuarios
CREATE POLICY "usuario_logros_read_all" ON usuario_logros FOR SELECT USING (true);

-- Tablas públicas (sin RLS)
ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "equipos_read_all" ON equipos FOR SELECT USING (true);

ALTER TABLE torneos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "torneos_read_all" ON torneos FOR SELECT USING (true);

ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partidos_read_all" ON partidos FOR SELECT USING (true);

ALTER TABLE logros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logros_read_all" ON logros FOR SELECT USING (true);

ALTER TABLE niveles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "niveles_read_all" ON niveles FOR SELECT USING (true);

ALTER TABLE grupo_posiciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "grupo_posiciones_read_all" ON grupo_posiciones FOR SELECT USING (true);

-- ============================================================
-- FUNCIONES
-- ============================================================

-- Función para calcular puntos de predicción
CREATE OR REPLACE FUNCTION calcular_puntos_prediccion(
  p_goles_local_pred INTEGER,
  p_goles_visitante_pred INTEGER,
  p_goles_local_real INTEGER,
  p_goles_visitante_real INTEGER
) RETURNS INTEGER AS $$
BEGIN
  -- Resultado exacto
  IF p_goles_local_pred = p_goles_local_real AND p_goles_visitante_pred = p_goles_visitante_real THEN
    RETURN 5;
  END IF;

  -- Misma diferencia de goles
  IF (p_goles_local_pred - p_goles_visitante_pred) = (p_goles_local_real - p_goles_visitante_real)
     AND (p_goles_local_pred - p_goles_visitante_pred) != 0 THEN
    RETURN 4;
  END IF;

  -- Ganador correcto (local)
  IF p_goles_local_pred > p_goles_visitante_pred AND p_goles_local_real > p_goles_visitante_real THEN
    RETURN 3;
  END IF;

  -- Ganador correcto (visitante)
  IF p_goles_local_pred < p_goles_visitante_pred AND p_goles_local_real < p_goles_visitante_real THEN
    RETURN 3;
  END IF;

  -- Empate correcto
  IF p_goles_local_pred = p_goles_visitante_pred AND p_goles_local_real = p_goles_visitante_real THEN
    RETURN 3;
  END IF;

  RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar XP de usuario
CREATE OR REPLACE FUNCTION actualizar_xp_usuario(p_usuario_id UUID, p_xp INTEGER) RETURNS VOID AS $$
DECLARE
  v_xp_actual INTEGER;
  v_nivel_actual INTEGER;
  v_nuevo_nivel INTEGER;
BEGIN
  SELECT xp, nivel INTO v_xp_actual, v_nivel_actual FROM usuarios WHERE id = p_usuario_id;

  UPDATE usuarios SET xp = xp + p_xp WHERE id = p_usuario_id;

  -- Calcular nuevo nivel basado en XP total
  SELECT MAX(nivel) INTO v_nuevo_nivel
  FROM niveles
  WHERE xp_requerido <= (v_xp_actual + p_xp);

  IF v_nuevo_nivel IS NOT NULL AND v_nuevo_nivel > v_nivel_actual THEN
    UPDATE usuarios SET nivel = v_nuevo_nivel WHERE id = p_usuario_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DATOS INICIALES — NIVELES
-- ============================================================
INSERT INTO niveles (nivel, nombre, xp_requerido, icono, color) VALUES
(1, 'Fanático', 0, '⚽', '#6B7280'),
(2, 'Aficionado', 100, '🏟️', '#6B7280'),
(3, 'Hincha', 250, '🎽', '#3B82F6'),
(4, 'Seguidor', 500, '🏅', '#3B82F6'),
(5, 'Experto', 1000, '⭐', '#8B5CF6'),
(6, 'Analista', 2000, '📊', '#8B5CF6'),
(7, 'Pronosticador', 3500, '🔮', '#F59E0B'),
(8, 'Maestro', 5500, '🏆', '#F59E0B'),
(9, 'Gran Maestro', 8000, '👑', '#EF4444'),
(10, 'Leyenda', 12000, '🌟', '#EF4444'),
(11, 'Campeón', 17000, '🥇', '#EC4899'),
(12, 'Dios del Prode', 25000, '⚡', '#EC4899'),
(20, 'Oráculo Supremo', 50000, '🔱', '#FFD700'),
(50, 'Inmortal', 150000, '💎', '#00FFFF'),
(100, 'El Elegido', 500000, '🌈', '#FF6B6B');

-- ============================================================
-- DATOS INICIALES — LOGROS
-- ============================================================
INSERT INTO logros (nombre, descripcion, icono, rareza, xp_recompensa, condicion_tipo, condicion_valor) VALUES
-- Comunes
('Primer Pronóstico', 'Realizaste tu primera predicción', '⚽', 'comun', 50, 'predicciones_total', 1),
('Bienvenido al Club', 'Completaste tu perfil', '👋', 'comun', 100, 'perfil_completo', 1),
('Social', 'Dejaste tu primer comentario', '💬', 'comun', 50, 'comentarios_total', 1),
('En Racha', 'Acertaste 3 partidos seguidos', '🔥', 'comun', 150, 'racha', 3),
('Semana Completa', 'Predijiste todos los partidos de una fecha', '📅', 'comun', 200, 'fecha_completa', 1),
('Curioso', 'Visitaste todas las secciones', '🗺️', 'comun', 75, 'secciones_visitadas', 1),
('Madrugador', 'Predijiste antes de que todos los demás', '🌅', 'comun', 100, 'primero_fecha', 1),
('Optimista', 'Predijiste 10 victorias locales', '🏠', 'comun', 75, 'victorias_local_pred', 10),
('Empate Justo', 'Acertaste 5 empates exactos', '🤝', 'comun', 100, 'empates_exactos', 5),
('Fan del Gol', 'Predijiste más de 3 goles en 10 partidos', '💥', 'comun', 75, 'goles_altos_pred', 10),

-- Raros
('Adivino', 'Acertaste 5 resultados exactos', '🔮', 'raro', 300, 'exactos_total', 5),
('Experto Mundialista', 'Acertaste 20 predicciones', '🌍', 'raro', 400, 'correctas_total', 20),
('Top 10', 'Llegaste al top 10 del ranking', '📈', 'raro', 500, 'posicion_ranking', 10),
('Liga Champion', 'Ganaste una liga privada', '🏆', 'raro', 600, 'ligas_ganadas', 1),
('Racha de Fuego', 'Acertaste 5 partidos seguidos', '🔥🔥', 'raro', 400, 'racha', 5),
('Profeta', 'Acertaste el resultado de la final', '🎯', 'raro', 500, 'final_acertada', 1),
('Crítico Deportivo', 'Comentaste 20 partidos', '📰', 'raro', 300, 'comentarios_total', 20),
('Popular', 'Recibiste 50 likes en comentarios', '❤️', 'raro', 350, 'likes_recibidos', 50),
('Conector', 'Invitaste a 5 amigos', '👥', 'raro', 400, 'amigos_invitados', 5),
('Creador de Ligas', 'Creaste 3 ligas privadas', '🏟️', 'raro', 350, 'ligas_creadas', 3),

-- Épicos
('Rey del Pleno', 'Acertaste 10 resultados exactos', '👑', 'epico', 800, 'exactos_total', 10),
('Imparable', 'Acertaste 7 partidos seguidos', '⚡', 'epico', 1000, 'racha', 7),
('Oráculo', 'Acertaste el campeón del mundial', '🔮', 'epico', 1500, 'campeon_acertado', 1),
('Goleador Mental', 'Acertaste 3 marcadores exactos con goles', '⚽⚽⚽', 'epico', 700, 'marcadores_exactos', 3),
('Top 3', 'Llegaste al podio del ranking global', '🥉', 'epico', 1200, 'posicion_ranking', 3),
('Influencer', 'Tus predicciones fueron vistas 1000 veces', '📱', 'epico', 900, 'vistas_predicciones', 1000),
('Dominador de Grupos', 'Acertaste todos los clasificados de un grupo', '📊', 'epico', 1100, 'grupo_completo', 1),
('Mente Fría', 'Acertaste eliminados en instancias definitorias', '🧠', 'epico', 800, 'eliminaciones_acertadas', 5),
('Fiel a sus Colores', 'Acertaste 10 partidos de tu equipo favorito', '🎽', 'epico', 700, 'equipo_favorito_acertado', 10),
('El Último de Pie', 'Ganaste la liga privada en el último partido', '🏅', 'epico', 1000, 'liga_remontada', 1),

-- Legendarios
('Leyenda del Mundial', 'Acertaste 20 resultados exactos', '⭐⭐⭐', 'legendario', 3000, 'exactos_total', 20),
('El Elegido', 'Terminaste 1° en el ranking global', '🌟', 'legendario', 5000, 'posicion_ranking', 1),
('Oráculo del Fútbol', 'Acertaste campeón, goleador y mejor jugador', '🔱', 'legendario', 4000, 'triple_especial', 1),
('Pleno Perfecto', 'Acertaste todos los partidos de una fecha', '💎', 'legendario', 3500, 'fecha_perfecta', 1),
('Dios del Prode', 'Alcanzaste el nivel máximo', '👁️', 'legendario', 5000, 'nivel_max', 100),
('Invencible', 'Acertaste 10 partidos seguidos', '🛡️', 'legendario', 4000, 'racha', 10),
('Omnisciente', 'Acertaste exacto todos los cuartos de final', '🌌', 'legendario', 3500, 'cuartos_exactos', 4),
('El Profeta', 'Acertaste la final exactamente', '📜', 'legendario', 4500, 'final_exacta', 1),
('Coleccionista', 'Desbloqueaste 40 logros', '🗝️', 'legendario', 3000, 'logros_total', 40),
('Club del Pleno', 'Completaste el 100% de predicciones del mundial', '🏆🌍', 'legendario', 5000, 'predicciones_completas', 1),

-- Especiales extra
('Veloz', 'Predijiste un partido en menos de 10 segundos', '💨', 'comun', 50, 'velocidad_prediccion', 1),
('Nocturno', 'Predijiste a las 3AM', '🦉', 'raro', 300, 'prediccion_nocturna', 1),
('Maratonista', 'Usaste la app 30 días seguidos', '🏃', 'epico', 1500, 'dias_consecutivos', 30),
('Negacionista', 'Predijiste derrota de Argentina en 5 partidos', '😤', 'comun', 100, 'arg_derrotas_pred', 5),
('Argentino del Corazón', 'Predijiste 10 victorias de Argentina', '🩵🤍💙', 'raro', 400, 'arg_victorias_pred', 10),
('El Sorpresivo', 'Acertaste 3 resultados sorpresa (favorito pierde)', '😲', 'epico', 1200, 'sorpresas_acertadas', 3),
('Antipático', 'Fuiste primero toda la fase de grupos', '😎', 'legendario', 2500, 'lider_grupos', 1),
('Vengador', 'Subiste del puesto 20 al top 5', '⬆️', 'epico', 1000, 'remontada_ranking', 1),
('Social Media Star', 'Compartiste 10 predicciones por WhatsApp', '📲', 'raro', 300, 'compartidos_whatsapp', 10),
('Completista', 'Predijiste todos los partidos de la fase de grupos', '✅', 'raro', 500, 'grupos_completo', 1);

-- ============================================================
-- FUNCIÓN: Trigger para crear usuario en tabla usuarios
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO usuarios (id, email, username, nombre_visible)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'nombre_visible', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
