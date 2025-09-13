-- Script de datos de prueba para los nuevos módulos
-- Ejecutar después de haber creado las tablas

-- 1. Insertar datos de prueba para PEDIDOS
-- Primero necesitamos algunos proveedores y productos

-- Insertar proveedor de prueba si no existe
INSERT INTO proveedores (nombre, contacto, telefono, email, direccion, activo) 
VALUES ('Farmacia Central', 'Juan Pérez', '555-0101', 'juan@farmaciacentral.com', 'Av. Principal 123', true)
ON CONFLICT (email) DO NOTHING;

-- Insertar productos de prueba si no existen
INSERT INTO producto (nombre, descripcion, precio, stock, id_categoria, id_marca, activo) 
VALUES 
  ('Paracetamol 500mg', 'Analgésico y antipirético', 2.50, 100, 1, 1, true),
  ('Ibuprofeno 400mg', 'Antiinflamatorio no esteroideo', 3.20, 80, 1, 1, true),
  ('Amoxicilina 500mg', 'Antibiótico de amplio espectro', 5.80, 50, 1, 1, true)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar pedido de prueba
INSERT INTO pedido (proveedor_id, usuario_id, fecha_pedido, estado, total_costo, observacion) 
VALUES (1, 1, NOW(), 'CREADO', 0.00, 'Pedido de prueba para medicamentos básicos');

-- Insertar detalles del pedido
INSERT INTO pedido_detalle (id_pedido, id_producto, cantidad, costo_unitario) 
VALUES 
  (1, 1, 50, 2.00),  -- Paracetamol
  (1, 2, 30, 2.80),  -- Ibuprofeno
  (1, 3, 20, 5.00);  -- Amoxicilina

-- Actualizar el total del pedido
UPDATE pedido SET total_costo = (
  SELECT SUM(cantidad * costo_unitario) 
  FROM pedido_detalle 
  WHERE id_pedido = 1
) WHERE id_pedido = 1;

-- 2. Insertar datos de prueba para CAJA
-- Abrir una caja
INSERT INTO caja (fecha_apertura, usuario_apertura, saldo_inicial, estado, observacion) 
VALUES (NOW(), 1, 100.00, 'ABIERTO', 'Apertura de caja de prueba');

-- 3. Insertar datos de prueba para VENTAS
-- Primero necesitamos un cliente
INSERT INTO cliente (nombres, apellidos, telefono, email, direccion, activo) 
VALUES ('María', 'González', '555-0202', 'maria@email.com', 'Calle Secundaria 456', true)
ON CONFLICT (email) DO NOTHING;

-- Insertar venta de prueba
INSERT INTO venta (fecha, cliente_id, usuario_id, caja_id, estado, total, observacion) 
VALUES (NOW(), 1, 1, 1, 'EMITIDA', 0.00, 'Venta de prueba');

-- Insertar detalles de la venta
INSERT INTO venta_detalle (id_venta, id_producto, cantidad, precio_unitario) 
VALUES 
  (1, 1, 2, 2.50),  -- Paracetamol
  (1, 2, 1, 3.20);  -- Ibuprofeno

-- Actualizar el total de la venta
UPDATE venta SET total = (
  SELECT SUM(cantidad * precio_unitario) 
  FROM venta_detalle 
  WHERE id_venta = 1
) WHERE id_venta = 1;

-- 4. Insertar movimientos de inventario manuales para probar
INSERT INTO inventario_movimiento (producto_id, fecha, tipo, cantidad, signo, referencia, usuario_id, observacion) 
VALUES 
  (1, NOW(), 'AJUSTE_ENTRADA', 10, 1, 'Ajuste inicial', 1, 'Stock inicial de prueba'),
  (2, NOW(), 'AJUSTE_ENTRADA', 5, 1, 'Ajuste inicial', 1, 'Stock inicial de prueba'),
  (3, NOW(), 'AJUSTE_ENTRADA', 3, 1, 'Ajuste inicial', 1, 'Stock inicial de prueba');

-- 5. Cambiar estado del pedido a RECIBIDO para probar el trigger
UPDATE pedido SET estado = 'RECIBIDO' WHERE id_pedido = 1;

-- Verificar los datos insertados
SELECT 'PEDIDOS' as tabla, COUNT(*) as registros FROM pedido
UNION ALL
SELECT 'PEDIDO_DETALLE', COUNT(*) FROM pedido_detalle
UNION ALL
SELECT 'CAJA', COUNT(*) FROM caja
UNION ALL
SELECT 'VENTA', COUNT(*) FROM venta
UNION ALL
SELECT 'VENTA_DETALLE', COUNT(*) FROM venta_detalle
UNION ALL
SELECT 'INVENTARIO_MOVIMIENTO', COUNT(*) FROM inventario_movimiento;

-- Verificar el stock actualizado de los productos
SELECT p.nombre, p.stock, p.precio 
FROM producto p 
WHERE p.id_producto IN (1, 2, 3)
ORDER BY p.id_producto;
