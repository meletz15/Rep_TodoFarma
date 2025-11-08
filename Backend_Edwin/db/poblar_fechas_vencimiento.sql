-- =========================================================
-- SCRIPT: Poblar fechas de vencimiento y números de lote
-- =========================================================
-- Este script actualiza los movimientos de inventario existentes
-- que no tengan fecha_vencimiento, asignándoles fechas aleatorias
-- y números de lote generados automáticamente.
-- =========================================================

BEGIN;

-- Actualizar movimientos de tipo ENTRADA que no tengan fecha_vencimiento
-- Generar fechas de vencimiento entre 30 días y 2 años desde la fecha del movimiento
-- Generar números de lote únicos basados en el ID del movimiento y la fecha

UPDATE inventario_movimiento
SET 
  fecha_vencimiento = (
    fecha + 
    INTERVAL '30 days' + 
    (FLOOR(RANDOM() * 690) || ' days')::INTERVAL
  )::DATE,
  numero_lote = 'LOTE-' || 
    TO_CHAR(fecha, 'YYYYMMDD') || '-' || 
    LPAD(id_mov::TEXT, 6, '0')
WHERE 
  fecha_vencimiento IS NULL 
  AND tipo IN ('ENTRADA_COMPRA', 'AJUSTE_ENTRADA', 'DEVOLUCION_COMPRA')
  AND signo = 1; -- Solo movimientos de entrada (signo positivo)

-- Actualizar también movimientos de tipo SALIDA que puedan tener fecha_vencimiento
-- (aunque normalmente las salidas no deberían tener fecha de vencimiento,
-- esto es para casos especiales donde se quiera rastrear)
-- Por ahora, solo actualizamos entradas

-- Verificar cuántos registros se actualizaron
DO $$
DECLARE
  registros_actualizados INTEGER;
BEGIN
  GET DIAGNOSTICS registros_actualizados = ROW_COUNT;
  RAISE NOTICE 'Registros actualizados: %', registros_actualizados;
END $$;

COMMIT;

-- Verificación: Mostrar algunos registros actualizados
SELECT 
  id_mov,
  producto_id,
  tipo,
  fecha,
  fecha_vencimiento,
  numero_lote,
  cantidad,
  (fecha_vencimiento - CURRENT_DATE) as dias_para_vencer
FROM inventario_movimiento
WHERE fecha_vencimiento IS NOT NULL
ORDER BY fecha_vencimiento ASC
LIMIT 10;

