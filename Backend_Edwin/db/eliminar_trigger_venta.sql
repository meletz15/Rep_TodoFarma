-- Eliminar trigger que duplica movimientos de inventario al crear ventas
-- El trigger tr_venta_det__generar_salida crea movimientos sin fecha_vencimiento ni numero_lote
-- Ahora los movimientos se crean manualmente en ventaModel.js con lógica FIFO correcta

DROP TRIGGER IF EXISTS tr_venta_det__generar_salida ON venta_detalle;

-- Opcional: Eliminar la función también si no se usa en otro lugar
-- DROP FUNCTION IF EXISTS tr_venta_det_generar_salida();

