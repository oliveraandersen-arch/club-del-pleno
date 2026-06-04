-- Agregar goleadores y confirmación a predicciones
ALTER TABLE predicciones
  ADD COLUMN IF NOT EXISTS goleadores JSONB DEFAULT '{"local":[],"visitante":[]}',
  ADD COLUMN IF NOT EXISTS confirmada BOOLEAN DEFAULT false;

-- Habilitar RLS para el nuevo campo (ya está habilitado en la tabla)
-- No se necesita policy adicional, las existentes cubren estos campos
