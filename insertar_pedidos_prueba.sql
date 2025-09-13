-- Script para insertar pedidos de prueba
-- Conectar a la base de datos: psql -d mi_basedatos -U admin -h localhost -p 5435

-- Verificar datos existentes
SELECT 'Proveedores:' as info;
SELECT id, nombre, apellido FROM proveedores LIMIT 3;

SELECT 'Usuarios:' as info;
SELECT id_usuario, nombre, apellido FROM usuarios LIMIT 3;

SELECT 'Productos:' as info;
SELECT id_producto, nombre, precio_unitario FROM producto LIMIT 3;

-- Insertar pedidos de prueba
INSERT INTO pedido (proveedor_id, usuario_id, fecha_pedido, estado, total_costo, observacion) VALUES
(1, 1, NOW(), 'CREADO', 0.00, 'Pedido de prueba 1 - Medicamentos básicos'),
(1, 1, NOW() - INTERVAL '1 day', 'ENVIADO', 0.00, 'Pedido de prueba 2 - Antibióticos'),
(1, 1, NOW() - INTERVAL '2 days', 'RECIBIDO', 0.00, 'Pedido de prueba 3 - Analgésicos')
ON CONFLICT (id_pedido) DO NOTHING;

-- Obtener los IDs de los pedidos insertados
SELECT 'Pedidos insertados:' as info;
SELECT id_pedido, proveedor_id, estado, fecha_pedido FROM pedido ORDER BY id_pedido DESC LIMIT 3;

-- Insertar detalles del pedido 1 (CREADO)
INSERT INTO pedido_detalle (id_pedido, id_producto, cantidad, costo_unitario) VALUES
((SELECT id_pedido FROM pedido WHERE observacion = 'Pedido de prueba 1 - Medicamentos básicos' LIMIT 1), 1, 50, 1.80),
((SELECT id_pedido FROM pedido WHERE observacion = 'Pedido de prueba 1 - Medicamentos básicos' LIMIT 1), 2, 30, 2.50),
((SELECT id_pedido FROM pedido WHERE observacion = 'Pedido de prueba 1 - Medicamentos básicos' LIMIT 1), 3, 20, 7.00)
ON CONFLICT (id_pedido, id_producto) DO NOTHING;

-- Insertar detalles del pedido 2 (ENVIADO)
INSERT INTO pedido_detalle (id_pedido, id_producto, cantidad, costo_unitario) VALUES
((SELECT id_pedido FROM pedido WHERE observacion = 'Pedido de prueba 2 - Antibióticos' LIMIT 1), 1, 25, 1.75),
((SELECT id_pedido FROM pedido WHERE observacion = 'Pedido de prueba 2 - Antibióticos' LIMIT 1), 3, 15, 6.50)
ON CONFLICT (id_pedido, id_producto) DO NOTHING;

-- Insertar detalles del pedido 3 (RECIBIDO)
INSERT INTO pedido_detalle (id_pedido, id_producto, cantidad, costo_unitario) VALUES
((SELECT id_pedido FROM pedido WHERE observacion = 'Pedido de prueba 3 - Analgésicos' LIMIT 1), 1, 40, 1.90),
((SELECT id_pedido FROM pedido WHERE observacion = 'Pedido de prueba 3 - Analgésicos' LIMIT 1), 2, 25, 2.75)
ON CONFLICT (id_pedido, id_producto) DO NOTHING;

-- Actualizar totales de los pedidos
UPDATE pedido SET total_costo = (
    SELECT COALESCE(SUM(cantidad * costo_unitario), 0)
    FROM pedido_detalle 
    WHERE pedido_detalle.id_pedido = pedido.id_pedido
) WHERE observacion LIKE 'Pedido de prueba%';

-- Mostrar pedidos con sus totales
SELECT 'Pedidos con totales:' as info;
SELECT 
    p.id_pedido,
    pr.nombre || ' ' || pr.apellido as proveedor,
    u.nombre || ' ' || u.apellido as usuario,
    p.estado,
    p.total_costo,
    p.fecha_pedido,
    p.observacion
FROM pedido p
JOIN proveedores pr ON p.proveedor_id = pr.id
JOIN usuarios u ON p.usuario_id = u.id_usuario
WHERE p.observacion LIKE 'Pedido de prueba%'
ORDER BY p.id_pedido DESC;

-- Mostrar detalles de los pedidos
SELECT 'Detalles de pedidos:' as info;
SELECT 
    pd.id_pedido,
    p.nombre as producto,
    pd.cantidad,
    pd.costo_unitario,
    pd.subtotal
FROM pedido_detalle pd
JOIN producto p ON pd.id_producto = p.id_producto
WHERE pd.id_pedido IN (
    SELECT id_pedido FROM pedido WHERE observacion LIKE 'Pedido de prueba%'
)
ORDER BY pd.id_pedido, pd.id_pedido_det;
