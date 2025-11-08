-- =========================================================
-- MIGRACIÓN: Crear tabla de unidades de medida
-- =========================================================
-- Esta migración crea una tabla para gestionar unidades de medida

-- Crear tabla de unidades de medida
CREATE TABLE IF NOT EXISTS unidad_medida (
  id_unidad_medida SERIAL PRIMARY KEY,
  nombre VARCHAR(20) NOT NULL UNIQUE,
  simbolo VARCHAR(10) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice
CREATE INDEX IF NOT EXISTS ix_unidad_medida__activo 
ON unidad_medida(activo) 
WHERE activo = true;

-- Insertar unidades de medida predefinidas
INSERT INTO unidad_medida (nombre, simbolo, descripcion, activo) VALUES
  ('Unidades', 'unidades', 'Unidades individuales', true),
  ('Mililitros', 'ml', 'Mililitros (volumen líquido)', true),
  ('Gramos', 'g', 'Gramos (peso)', true),
  ('Kilogramos', 'kg', 'Kilogramos (peso)', true),
  ('Litros', 'L', 'Litros (volumen líquido)', true),
  ('Miligramos', 'mg', 'Miligramos (peso)', true),
  ('Tabletas', 'tabletas', 'Tabletas', true),
  ('Cápsulas', 'cápsulas', 'Cápsulas', true),
  ('Gotas', 'gotas', 'Gotas', true)
ON CONFLICT (nombre) DO NOTHING;

-- Comentarios
COMMENT ON TABLE unidad_medida IS 'Tabla para gestionar unidades de medida de productos farmacéuticos';
COMMENT ON COLUMN unidad_medida.nombre IS 'Nombre de la unidad de medida (ej: Mililitros, Gramos, etc.)';
COMMENT ON COLUMN unidad_medida.simbolo IS 'Símbolo de la unidad (ej: ml, g, kg, etc.)';
COMMENT ON COLUMN unidad_medida.descripcion IS 'Descripción de la unidad de medida';
COMMENT ON COLUMN unidad_medida.activo IS 'Indica si la unidad de medida está activa';

-- Verificar que la tabla se creó correctamente
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'unidad_medida'
ORDER BY ordinal_position;

