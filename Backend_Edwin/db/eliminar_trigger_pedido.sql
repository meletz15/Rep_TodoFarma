-- Eliminar trigger que duplica movimientos de inventario al recibir pedidos
-- El trigger tr_pedido__on_recibido crea movimientos sin fecha_vencimiento ni numero_lote
-- Ahora los movimientos se crean manualmente en pedidoModel.js con lógica correcta

DROP TRIGGER IF EXISTS tr_pedido__on_recibido ON pedido;

-- Opcional: Eliminar la función también si no se usa en otro lugar
-- DROP FUNCTION IF EXISTS tr_pedido_estado_recibido();

