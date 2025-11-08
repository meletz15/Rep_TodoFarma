-- =========================================================
-- MIGRACIÓN: Crear tabla de presentaciones
-- =========================================================
-- Esta migración crea una tabla para gestionar tipos de presentación

-- Crear tabla de presentaciones
CREATE TABLE IF NOT EXISTS presentacion (
  id_presentacion SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice
CREATE INDEX IF NOT EXISTS ix_presentacion__activo 
ON presentacion(activo) 
WHERE activo = true;

-- Insertar presentaciones predefinidas
INSERT INTO presentacion (nombre, descripcion, activo) VALUES
  ('Tabletas', 'Medicamentos en forma de tabletas', true),
  ('Cápsulas', 'Medicamentos en forma de cápsulas', true),
  ('Jarabe', 'Medicamentos en forma líquida (jarabe)', true),
  ('Suspensión', 'Medicamentos en suspensión líquida', true),
  ('Inyección', 'Medicamentos inyectables', true),
  ('Gotas', 'Medicamentos en forma de gotas', true),
  ('Ungüento', 'Medicamentos tópicos en forma de ungüento', true),
  ('Crema', 'Medicamentos tópicos en forma de crema', true),
  ('Polvo', 'Medicamentos en forma de polvo', true),
  ('Blister', 'Medicamentos en blisters', true),
  ('Líquido', 'Medicamentos en forma líquida', true)
ON CONFLICT (nombre) DO NOTHING;

-- Comentarios
COMMENT ON TABLE presentacion IS 'Tabla para gestionar tipos de presentación de productos farmacéuticos';
COMMENT ON COLUMN presentacion.nombre IS 'Nombre del tipo de presentación (ej: Tabletas, Jarabe, etc.)';
COMMENT ON COLUMN presentacion.descripcion IS 'Descripción del tipo de presentación';
COMMENT ON COLUMN presentacion.activo IS 'Indica si la presentación está activa';

-- Verificar que la tabla se creó correctamente
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'presentacion'
ORDER BY ordinal_position;

