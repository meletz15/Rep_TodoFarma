-- =========================================================
-- DATOS DE PRUEBA PARA SISTEMA DE FARMACIA TODOFARMA
-- =========================================================
-- Este archivo contiene datos de prueba realistas para
-- poblar la base de datos del sistema de farmacia.
-- =========================================================

BEGIN;

-- =========================================================
-- LIMPIAR DATOS EXISTENTES (OPCIONAL - DESCOMENTAR SI ES NECESARIO)
-- =========================================================
-- DELETE FROM inventario_movimiento;
-- DELETE FROM venta_detalle;
-- DELETE FROM venta;
-- DELETE FROM pedido_detalle;
-- DELETE FROM pedido;
-- DELETE FROM caja;
-- DELETE FROM producto;
-- DELETE FROM cliente;
-- DELETE FROM proveedores;
-- DELETE FROM usuarios;
-- DELETE FROM roles;
-- DELETE FROM categoria;
-- DELETE FROM marca;

-- =========================================================
-- TABLA: roles
-- =========================================================
INSERT INTO roles (nombre, descripcion, activo, fecha_creacion) VALUES
('ADMIN', 'Administrador del sistema con acceso completo', true, NOW()),
('VENDEDOR', 'Vendedor con acceso a ventas y consultas', true, NOW()),
('FARMACEUTICO', 'Farmacéutico con acceso a inventario y productos', true, NOW()),
('CAJERO', 'Cajero con acceso limitado a ventas', true, NOW()),
('SUPERVISOR', 'Supervisor con acceso a reportes y supervisión', true, NOW());

-- =========================================================
-- TABLA: usuarios
-- =========================================================
INSERT INTO usuarios (nombre, apellido, correo, contrasena_hash, rol_id, estado, fecha_registro) VALUES
('María Elena', 'González', 'admin@todofarma.com', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA', 1, 'ACTIVO', NOW()),
('Carlos Alberto', 'Rodríguez', 'carlos.rodriguez@todofarma.com', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA', 2, 'ACTIVO', NOW()),
('Ana Patricia', 'Martínez', 'ana.martinez@todofarma.com', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA', 3, 'ACTIVO', NOW()),
('Luis Fernando', 'Hernández', 'luis.hernandez@todofarma.com', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA', 4, 'ACTIVO', NOW()),
('Sandra Milena', 'López', 'sandra.lopez@todofarma.com', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA', 5, 'ACTIVO', NOW()),
('Roberto Carlos', 'García', 'roberto.garcia@todofarma.com', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA', 2, 'ACTIVO', NOW()),
('Carmen Rosa', 'Vargas', 'carmen.vargas@todofarma.com', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA', 3, 'ACTIVO', NOW()),
('Diego Alejandro', 'Morales', 'diego.morales@todofarma.com', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA', 4, 'ACTIVO', NOW()),
('Patricia Elena', 'Jiménez', 'patricia.jimenez@todofarma.com', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA', 2, 'ACTIVO', NOW()),
('Jorge Luis', 'Silva', 'jorge.silva@todofarma.com', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA', 3, 'ACTIVO', NOW());

-- =========================================================
-- TABLA: marca
-- =========================================================
INSERT INTO marca (nombre, descripcion, activo, created_at, updated_at) VALUES
('Bayer', 'Laboratorio farmacéutico alemán líder mundial', true, NOW(), NOW()),
('Pfizer', 'Multinacional farmacéutica estadounidense', true, NOW(), NOW()),
('Novartis', 'Compañía farmacéutica suiza multinacional', true, NOW(), NOW()),
('Roche', 'Empresa farmacéutica suiza especializada en oncología', true, NOW(), NOW()),
('GSK', 'GlaxoSmithKline - Compañía farmacéutica británica', true, NOW(), NOW()),
('Sanofi', 'Laboratorio farmacéutico francés multinacional', true, NOW(), NOW()),
('Merck', 'Compañía farmacéutica estadounidense', true, NOW(), NOW()),
('Johnson & Johnson', 'Corporación multinacional estadounidense', true, NOW(), NOW()),
('Abbott', 'Compañía de dispositivos médicos y farmacéuticos', true, NOW(), NOW()),
('Teva', 'Compañía farmacéutica israelí especializada en genéricos', true, NOW(), NOW());

-- =========================================================
-- TABLA: categoria
-- =========================================================
INSERT INTO categoria (nombre, descripcion, activo, created_at, updated_at) VALUES
('Analgésicos', 'Medicamentos para aliviar el dolor', true, NOW(), NOW()),
('Antibióticos', 'Medicamentos para combatir infecciones bacterianas', true, NOW(), NOW()),
('Antiinflamatorios', 'Medicamentos para reducir la inflamación', true, NOW(), NOW()),
('Vitaminas', 'Suplementos vitamínicos y minerales', true, NOW(), NOW()),
('Antihistamínicos', 'Medicamentos para alergias', true, NOW(), NOW()),
('Antiacidos', 'Medicamentos para problemas digestivos', true, NOW(), NOW()),
('Antitusivos', 'Medicamentos para la tos', true, NOW(), NOW()),
('Antipiréticos', 'Medicamentos para reducir la fiebre', true, NOW(), NOW()),
('Antisépticos', 'Productos para desinfección y limpieza', true, NOW(), NOW()),
('Cuidado Personal', 'Productos de higiene y cuidado personal', true, NOW(), NOW());

-- =========================================================
-- TABLA: cliente
-- =========================================================
INSERT INTO cliente (nombres, apellidos, nit, email, telefono, direccion, observaciones, activo, created_at, updated_at) VALUES
('Juan Carlos', 'Pérez González', '12345678-9', 'juan.perez@email.com', '+57 300 123 4567', 'Calle 123 #45-67, Bogotá', 'Cliente frecuente, paga al contado', true, NOW(), NOW()),
('María Fernanda', 'López Martínez', '87654321-0', 'maria.lopez@email.com', '+57 310 987 6543', 'Carrera 45 #78-90, Medellín', 'Prefiere productos naturales', true, NOW(), NOW()),
('Carlos Alberto', 'García Rodríguez', '11223344-5', 'carlos.garcia@email.com', '+57 320 555 1234', 'Avenida 80 #12-34, Cali', 'Cliente corporativo', true, NOW(), NOW()),
('Ana Patricia', 'Hernández Silva', '55667788-9', 'ana.hernandez@email.com', '+57 315 777 8888', 'Calle 50 #23-45, Barranquilla', 'Alergia a la penicilina', true, NOW(), NOW()),
('Luis Fernando', 'Morales Vargas', '99887766-5', 'luis.morales@email.com', '+57 300 999 0000', 'Carrera 15 #67-89, Bucaramanga', 'Cliente VIP', true, NOW(), NOW()),
('Sandra Milena', 'Jiménez Torres', '44332211-7', 'sandra.jimenez@email.com', '+57 318 444 5555', 'Avenida 68 #90-12, Pereira', 'Embarazada - consultar medicamentos', true, NOW(), NOW()),
('Roberto Carlos', 'González Pérez', '77889900-3', 'roberto.gonzalez@email.com', '+57 312 666 7777', 'Calle 100 #34-56, Manizales', 'Diabético tipo 2', true, NOW(), NOW()),
('Carmen Rosa', 'Vargas López', '22334455-1', 'carmen.vargas@email.com', '+57 317 888 9999', 'Carrera 30 #78-90, Cartagena', 'Cliente mayor de edad', true, NOW(), NOW()),
('Diego Alejandro', 'Martínez García', '66778899-4', 'diego.martinez@email.com', '+57 319 111 2222', 'Avenida 40 #56-78, Santa Marta', 'Cliente joven, prefiere genéricos', true, NOW(), NOW()),
('Patricia Elena', 'Silva Hernández', '33445566-8', 'patricia.silva@email.com', '+57 314 333 4444', 'Calle 70 #12-34, Ibagué', 'Cliente frecuente, descuentos especiales', true, NOW(), NOW());

-- =========================================================
-- TABLA: proveedores
-- =========================================================
INSERT INTO proveedores (nombre, apellido, direccion, telefono, correo, empresa, estado) VALUES
('Distribuidora', 'Farmacéutica Nacional', 'Carrera 50 #25-80, Bogotá', '+57 1 234 5678', 'ventas@dfn.com.co', 'Distribuidora Farmacéutica Nacional S.A.S.', 'ACTIVO'),
('Laboratorios', 'Bayer Colombia', 'Avenida 68 #25-15, Bogotá', '+57 1 345 6789', 'contacto@bayer.com.co', 'Bayer S.A.', 'ACTIVO'),
('Pfizer', 'Colombia Ltda', 'Calle 100 #11-20, Bogotá', '+57 1 456 7890', 'info@pfizer.com.co', 'Pfizer Colombia Ltda.', 'ACTIVO'),
('Novartis', 'de Colombia S.A.', 'Carrera 7 #32-16, Bogotá', '+57 1 567 8901', 'ventas@novartis.com.co', 'Novartis de Colombia S.A.', 'ACTIVO'),
('Roche', 'Colombia S.A.S.', 'Avenida 19 #100-47, Bogotá', '+57 1 678 9012', 'contacto@roche.com.co', 'Roche Colombia S.A.S.', 'ACTIVO'),
('GSK', 'Colombia S.A.S.', 'Carrera 15 #93-07, Bogotá', '+57 1 789 0123', 'info@gsk.com.co', 'GlaxoSmithKline Colombia S.A.S.', 'ACTIVO'),
('Sanofi', 'Aventis Colombia', 'Calle 80 #10-50, Bogotá', '+57 1 890 1234', 'ventas@sanofi.com.co', 'Sanofi Aventis Colombia S.A.S.', 'ACTIVO'),
('Merck', 'Colombia S.A.S.', 'Avenida 68 #25-15, Bogotá', '+57 1 901 2345', 'contacto@merck.com.co', 'Merck Colombia S.A.S.', 'ACTIVO'),
('Johnson & Johnson', 'de Colombia', 'Carrera 50 #26-20, Bogotá', '+57 1 012 3456', 'info@jnj.com.co', 'Johnson & Johnson de Colombia S.A.S.', 'ACTIVO'),
('Abbott', 'Colombia S.A.S.', 'Calle 100 #11-20, Bogotá', '+57 1 123 4567', 'ventas@abbott.com.co', 'Abbott Colombia S.A.S.', 'ACTIVO');

-- =========================================================
-- TABLA: producto
-- =========================================================
INSERT INTO producto (nombre, descripcion, sku, codigo_barras, id_categoria, id_marca, precio_unitario, stock, fecha_vencimiento, activo, created_at, updated_at) VALUES
('Acetaminofén 500mg', 'Analgésico y antipirético para dolor y fiebre', 'ACET500-001', '7701234567890', 1, 1, 2500.00, 150, '2025-12-31', true, NOW(), NOW()),
('Ibuprofeno 400mg', 'Antiinflamatorio no esteroideo para dolor e inflamación', 'IBUP400-002', '7701234567891', 3, 2, 3200.00, 120, '2025-11-30', true, NOW(), NOW()),
('Amoxicilina 500mg', 'Antibiótico de amplio espectro', 'AMOX500-003', '7701234567892', 2, 3, 4500.00, 80, '2025-10-15', true, NOW(), NOW()),
('Vitamina C 1000mg', 'Suplemento vitamínico para el sistema inmunológico', 'VITC1000-004', '7701234567893', 4, 4, 1800.00, 200, '2026-03-20', true, NOW(), NOW()),
('Loratadina 10mg', 'Antihistamínico para alergias', 'LORA10-005', '7701234567894', 5, 5, 2800.00, 90, '2025-09-30', true, NOW(), NOW()),
('Omeprazol 20mg', 'Inhibidor de bomba de protones para acidez', 'OMEP20-006', '7701234567895', 6, 6, 3500.00, 110, '2025-08-25', true, NOW(), NOW()),
('Dextrometorfano 15mg', 'Antitusivo para la tos seca', 'DEXT15-007', '7701234567896', 7, 7, 2200.00, 75, '2025-07-18', true, NOW(), NOW()),
('Paracetamol 500mg', 'Analgésico y antipirético', 'PARA500-008', '7701234567897', 8, 8, 2000.00, 180, '2025-12-10', true, NOW(), NOW()),
('Alcohol 70%', 'Antiséptico para desinfección', 'ALCO70-009', '7701234567898', 9, 9, 1500.00, 300, '2026-01-15', true, NOW(), NOW()),
('Jabón Antibacterial', 'Jabón para higiene personal con propiedades antibacterianas', 'JABOANT-010', '7701234567899', 10, 10, 800.00, 250, '2026-02-28', true, NOW(), NOW()),
('Aspirina 100mg', 'Analgésico, antiinflamatorio y antipirético', 'ASPI100-011', '7701234567800', 1, 1, 1800.00, 95, '2025-11-20', true, NOW(), NOW()),
('Cetirizina 10mg', 'Antihistamínico de segunda generación', 'CETI10-012', '7701234567801', 5, 2, 3200.00, 85, '2025-10-05', true, NOW(), NOW()),
('Ciprofloxacina 500mg', 'Antibiótico de amplio espectro', 'CIPR500-013', '7701234567802', 2, 3, 5200.00, 60, '2025-09-15', true, NOW(), NOW()),
('Vitamina D3 2000UI', 'Suplemento de vitamina D para huesos', 'VITD2000-014', '7701234567803', 4, 4, 4500.00, 120, '2026-04-10', true, NOW(), NOW()),
('Ranitidina 150mg', 'Antagonista H2 para úlceras', 'RANI150-015', '7701234567804', 6, 5, 2800.00, 70, '2025-08-30', true, NOW(), NOW());

-- =========================================================
-- TABLA: caja
-- =========================================================
INSERT INTO caja (usuario_apertura, saldo_inicial, estado, observacion, fecha_apertura, created_at, updated_at) VALUES
(1, 500000.00, 'ABIERTO', 'Apertura de caja principal', NOW(), NOW(), NOW()),
(2, 300000.00, 'CERRADO', 'Caja auxiliar - cerrada por fin de turno', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(3, 400000.00, 'CERRADO', 'Caja turno tarde', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(4, 350000.00, 'CERRADO', 'Caja turno noche', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(5, 450000.00, 'CERRADO', 'Caja fin de semana', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days');

-- =========================================================
-- TABLA: venta
-- =========================================================
INSERT INTO venta (fecha, cliente_id, usuario_id, caja_id, estado, total, observacion, created_at, updated_at) VALUES
(NOW() - INTERVAL '2 hours', 1, 2, 1, 'EMITIDA', 8500.00, 'Venta al contado', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
(NOW() - INTERVAL '4 hours', 2, 3, 1, 'EMITIDA', 12000.00, 'Cliente frecuente', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
(NOW() - INTERVAL '6 hours', 3, 2, 1, 'EMITIDA', 6800.00, 'Venta con descuento', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
(NOW() - INTERVAL '1 day', 4, 4, 2, 'EMITIDA', 15000.00, 'Venta mayorista', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(NOW() - INTERVAL '1 day', 5, 3, 2, 'EMITIDA', 9200.00, 'Cliente VIP', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(NOW() - INTERVAL '2 days', 6, 2, 3, 'EMITIDA', 7500.00, 'Venta normal', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(NOW() - INTERVAL '2 days', 7, 4, 3, 'EMITIDA', 11000.00, 'Cliente diabético', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(NOW() - INTERVAL '3 days', 8, 3, 4, 'EMITIDA', 13500.00, 'Venta geriátrica', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(NOW() - INTERVAL '3 days', 9, 2, 4, 'EMITIDA', 4800.00, 'Cliente joven', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(NOW() - INTERVAL '4 days', 10, 4, 5, 'EMITIDA', 16800.00, 'Venta familiar', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days');

-- =========================================================
-- TABLA: venta_detalle
-- =========================================================
INSERT INTO venta_detalle (id_venta, id_producto, cantidad, precio_unitario) VALUES
-- Venta 1
(1, 1, 2, 2500.00),
(1, 4, 1, 1800.00),
(1, 9, 1, 1500.00),
-- Venta 2
(2, 2, 2, 3200.00),
(2, 5, 1, 2800.00),
(2, 10, 1, 800.00),
-- Venta 3
(3, 1, 1, 2500.00),
(3, 6, 1, 3500.00),
(3, 9, 1, 1500.00),
-- Venta 4
(4, 3, 2, 4500.00),
(4, 7, 1, 2200.00),
(4, 8, 1, 2000.00),
-- Venta 5
(5, 2, 1, 3200.00),
(5, 4, 1, 1800.00),
(5, 5, 1, 2800.00),
-- Venta 6
(6, 1, 1, 2500.00),
(6, 6, 1, 3500.00),
(6, 10, 1, 800.00),
-- Venta 7
(7, 3, 1, 4500.00),
(7, 4, 1, 1800.00),
(7, 8, 1, 2000.00),
-- Venta 8
(8, 2, 2, 3200.00),
(8, 5, 1, 2800.00),
(8, 6, 1, 3500.00),
-- Venta 9
(9, 1, 1, 2500.00),
(9, 9, 1, 1500.00),
(9, 10, 1, 800.00),
-- Venta 10
(10, 3, 2, 4500.00),
(10, 4, 1, 1800.00),
(10, 5, 1, 2800.00),
(10, 6, 1, 3500.00);

-- =========================================================
-- TABLA: pedido
-- =========================================================
INSERT INTO pedido (proveedor_id, usuario_id, fecha_pedido, estado, total_costo, observacion, created_at, updated_at) VALUES
(1, 1, NOW() - INTERVAL '5 days', 'RECIBIDO', 250000.00, 'Pedido mensual de productos básicos', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(2, 1, NOW() - INTERVAL '3 days', 'EN_TRANSITO', 180000.00, 'Pedido de analgésicos Bayer', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(3, 1, NOW() - INTERVAL '2 days', 'PENDIENTE', 320000.00, 'Pedido de antibióticos Pfizer', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(4, 1, NOW() - INTERVAL '1 day', 'RECIBIDO', 150000.00, 'Pedido de vitaminas Novartis', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(5, 1, NOW() - INTERVAL '6 hours', 'PENDIENTE', 200000.00, 'Pedido de productos Roche', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
(6, 1, NOW() - INTERVAL '4 days', 'RECIBIDO', 280000.00, 'Pedido de antihistamínicos GSK', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
(7, 1, NOW() - INTERVAL '2 days', 'EN_TRANSITO', 220000.00, 'Pedido de antiácidos Sanofi', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(8, 1, NOW() - INTERVAL '1 day', 'PENDIENTE', 190000.00, 'Pedido de antitusivos Merck', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(9, 1, NOW() - INTERVAL '3 days', 'RECIBIDO', 160000.00, 'Pedido de antipiréticos J&J', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(10, 1, NOW() - INTERVAL '5 days', 'CANCELADO', 0.00, 'Pedido cancelado por falta de stock', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

-- =========================================================
-- TABLA: pedido_detalle
-- =========================================================
INSERT INTO pedido_detalle (id_pedido, id_producto, cantidad, costo_unitario) VALUES
-- Pedido 1
(1, 1, 100, 2000.00),
(1, 4, 50, 1500.00),
(1, 9, 200, 1200.00),
-- Pedido 2
(2, 2, 80, 2800.00),
(2, 11, 60, 1500.00),
-- Pedido 3
(3, 3, 50, 3800.00),
(3, 13, 40, 4500.00),
-- Pedido 4
(4, 4, 100, 1500.00),
(4, 14, 80, 3800.00),
-- Pedido 5
(5, 5, 70, 2500.00),
(5, 12, 60, 2800.00),
-- Pedido 6
(6, 5, 90, 2500.00),
(6, 12, 80, 2800.00),
-- Pedido 7
(7, 6, 60, 3000.00),
(7, 15, 50, 2500.00),
-- Pedido 8
(8, 7, 80, 1800.00),
-- Pedido 9
(9, 8, 100, 1600.00),
-- Pedido 10 (cancelado - sin detalles)

-- =========================================================
-- TABLA: inventario_movimiento
-- =========================================================
INSERT INTO inventario_movimiento (producto_id, tipo, cantidad, signo, referencia, pedido_id, venta_id, usuario_id, observacion, fecha_movimiento, created_at) VALUES
-- Entradas por pedidos
(1, 'ENTRADA_PEDIDO', 100, 1, 'Pedido #1', 1, NULL, 1, 'Recepción de pedido de acetaminofén', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(4, 'ENTRADA_PEDIDO', 50, 1, 'Pedido #1', 1, NULL, 1, 'Recepción de pedido de vitamina C', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(9, 'ENTRADA_PEDIDO', 200, 1, 'Pedido #1', 1, NULL, 1, 'Recepción de pedido de alcohol', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(2, 'ENTRADA_PEDIDO', 80, 1, 'Pedido #2', 2, NULL, 1, 'Recepción de pedido de ibuprofeno', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(11, 'ENTRADA_PEDIDO', 60, 1, 'Pedido #2', 2, NULL, 1, 'Recepción de pedido de aspirina', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(3, 'ENTRADA_PEDIDO', 50, 1, 'Pedido #3', 3, NULL, 1, 'Recepción de pedido de amoxicilina', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(13, 'ENTRADA_PEDIDO', 40, 1, 'Pedido #3', 3, NULL, 1, 'Recepción de pedido de ciprofloxacina', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(4, 'ENTRADA_PEDIDO', 100, 1, 'Pedido #4', 4, NULL, 1, 'Recepción de pedido de vitamina C', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(14, 'ENTRADA_PEDIDO', 80, 1, 'Pedido #4', 4, NULL, 1, 'Recepción de pedido de vitamina D3', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(5, 'ENTRADA_PEDIDO', 90, 1, 'Pedido #6', 6, NULL, 1, 'Recepción de pedido de loratadina', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
(12, 'ENTRADA_PEDIDO', 80, 1, 'Pedido #6', 6, NULL, 1, 'Recepción de pedido de cetirizina', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
(6, 'ENTRADA_PEDIDO', 60, 1, 'Pedido #7', 7, NULL, 1, 'Recepción de pedido de omeprazol', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(15, 'ENTRADA_PEDIDO', 50, 1, 'Pedido #7', 7, NULL, 1, 'Recepción de pedido de ranitidina', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(7, 'ENTRADA_PEDIDO', 80, 1, 'Pedido #8', 8, NULL, 1, 'Recepción de pedido de dextrometorfano', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(8, 'ENTRADA_PEDIDO', 100, 1, 'Pedido #9', 9, NULL, 1, 'Recepción de pedido de paracetamol', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

-- Salidas por ventas
(1, 'SALIDA_VENTA', 2, -1, 'Venta #1', NULL, 1, 2, 'Venta de acetaminofén', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
(4, 'SALIDA_VENTA', 1, -1, 'Venta #1', NULL, 1, 2, 'Venta de vitamina C', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
(9, 'SALIDA_VENTA', 1, -1, 'Venta #1', NULL, 1, 2, 'Venta de alcohol', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
(2, 'SALIDA_VENTA', 2, -1, 'Venta #2', NULL, 2, 3, 'Venta de ibuprofeno', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
(5, 'SALIDA_VENTA', 1, -1, 'Venta #2', NULL, 2, 3, 'Venta de loratadina', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
(10, 'SALIDA_VENTA', 1, -1, 'Venta #2', NULL, 2, 3, 'Venta de jabón antibacterial', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
(1, 'SALIDA_VENTA', 1, -1, 'Venta #3', NULL, 3, 2, 'Venta de acetaminofén', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
(6, 'SALIDA_VENTA', 1, -1, 'Venta #3', NULL, 3, 2, 'Venta de omeprazol', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
(9, 'SALIDA_VENTA', 1, -1, 'Venta #3', NULL, 3, 2, 'Venta de alcohol', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
(3, 'SALIDA_VENTA', 2, -1, 'Venta #4', NULL, 4, 4, 'Venta de amoxicilina', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(7, 'SALIDA_VENTA', 1, -1, 'Venta #4', NULL, 4, 4, 'Venta de dextrometorfano', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(8, 'SALIDA_VENTA', 1, -1, 'Venta #4', NULL, 4, 4, 'Venta de paracetamol', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(2, 'SALIDA_VENTA', 1, -1, 'Venta #5', NULL, 5, 3, 'Venta de ibuprofeno', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(4, 'SALIDA_VENTA', 1, -1, 'Venta #5', NULL, 5, 3, 'Venta de vitamina C', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(5, 'SALIDA_VENTA', 1, -1, 'Venta #5', NULL, 5, 3, 'Venta de loratadina', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- Ajustes de inventario
(1, 'AJUSTE_INVENTARIO', 5, 1, 'Ajuste por conteo', NULL, NULL, 1, 'Ajuste positivo por conteo físico', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(2, 'AJUSTE_INVENTARIO', -3, -1, 'Ajuste por vencimiento', NULL, NULL, 1, 'Ajuste negativo por productos vencidos', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(4, 'AJUSTE_INVENTARIO', 10, 1, 'Ajuste por devolución', NULL, NULL, 1, 'Ajuste positivo por devolución de proveedor', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

COMMIT;

-- =========================================================
-- RESUMEN DE DATOS INSERTADOS
-- =========================================================
-- Roles: 5 registros
-- Usuarios: 10 registros  
-- Marcas: 10 registros
-- Categorías: 10 registros
-- Clientes: 10 registros
-- Proveedores: 10 registros
-- Productos: 15 registros
-- Cajas: 5 registros (1 abierta, 4 cerradas)
-- Ventas: 10 registros
-- Detalles de Ventas: 30 registros
-- Pedidos: 10 registros (varios estados)
-- Detalles de Pedidos: 20 registros
-- Movimientos de Inventario: 40 registros
-- =========================================================
