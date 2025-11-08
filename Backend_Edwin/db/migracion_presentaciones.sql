-- =========================================================
-- MIGRACIÓN: Agregar campos de presentación a producto
-- =========================================================
-- Esta migración agrega campos para manejar presentaciones
-- de productos farmacéuticos (Tabletas, Jarabe, Cápsulas, etc.)

-- Agregar columnas de presentación
ALTER TABLE producto 
ADD COLUMN IF NOT EXISTS tipo_presentacion VARCHAR(50),
ADD COLUMN IF NOT EXISTS cantidad_presentacion NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS unidad_medida VARCHAR(20);

-- Crear índice para búsquedas por tipo de presentación
CREATE INDEX IF NOT EXISTS ix_producto__tipo_presentacion 
ON producto(tipo_presentacion) 
WHERE tipo_presentacion IS NOT NULL;

-- Comentarios para documentación
COMMENT ON COLUMN producto.tipo_presentacion IS 'Tipo de presentación: Tabletas, Jarabe, Cápsulas, Inyección, Suspensión, Gotas, Ungüento, Crema, Polvo, etc.';
COMMENT ON COLUMN producto.cantidad_presentacion IS 'Cantidad de la presentación: 10, 20, 30, 100, 200, etc.';
COMMENT ON COLUMN producto.unidad_medida IS 'Unidad de medida: unidades, ml, mg, g, L, kg, etc.';

-- Verificar que las columnas se agregaron correctamente
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  numeric_precision,
  numeric_scale
FROM information_schema.columns 
WHERE table_name = 'producto' 
  AND column_name IN ('tipo_presentacion', 'cantidad_presentacion', 'unidad_medida');

