-- =========================================================
-- MIGRACIÓN: Agregar fecha_vencimiento y numero_lote a inventario_movimiento
-- =========================================================
-- Esta migración agrega los campos necesarios para rastrear
-- fechas de vencimiento y números de lote por movimiento de inventario

BEGIN;

-- Agregar columnas a inventario_movimiento
ALTER TABLE inventario_movimiento 
ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE,
ADD COLUMN IF NOT EXISTS numero_lote VARCHAR(50);

-- Crear índice para búsquedas por fecha de vencimiento
CREATE INDEX IF NOT EXISTS ix_inventario_movimiento__fecha_vencimiento 
ON inventario_movimiento(fecha_vencimiento) 
WHERE fecha_vencimiento IS NOT NULL;

-- Crear índice para búsquedas por número de lote
CREATE INDEX IF NOT EXISTS ix_inventario_movimiento__numero_lote 
ON inventario_movimiento(numero_lote) 
WHERE numero_lote IS NOT NULL;

COMMIT;

