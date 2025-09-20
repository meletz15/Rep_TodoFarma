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
-- TABLA: roles (INSERTAR SOLO SI NO EXISTEN)
-- =========================================================
INSERT INTO roles (nombre, descripcion, activo, fecha_creacion) 
SELECT 'ADMIN', 'Administrador del sistema con acceso completo', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'ADMIN');

INSERT INTO roles (nombre, descripcion, activo, fecha_creacion) 
SELECT 'VENDEDOR', 'Vendedor con acceso a ventas y consultas', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'VENDEDOR');

INSERT INTO roles (nombre, descripcion, activo, fecha_creacion) 
SELECT 'FARMACEUTICO', 'Farmacéutico con acceso a inventario y productos', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'FARMACEUTICO');

INSERT INTO roles (nombre, descripcion, activo, fecha_creacion) 
SELECT 'CAJERO', 'Cajero con acceso limitado a ventas', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'CAJERO');

INSERT INTO roles (nombre, descripcion, activo, fecha_creacion) 
SELECT 'SUPERVISOR', 'Supervisor con acceso a reportes y supervisión', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'SUPERVISOR');

-- =========================================================
-- TABLA: usuarios (INSERTAR SOLO SI NO EXISTEN)
-- =========================================================
INSERT INTO usuarios (nombre, apellido, correo, contrasena_hash, rol_id, estado, fecha_registro) 
SELECT 'María Elena', 'González', 'admin@todofarma.com', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA', 1, 'ACTIVO', NOW()
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'admin@todofarma.com');

INSERT INTO usuarios (nombre, apellido, correo, contrasena_hash, rol_id, estado, fecha_registro) 
SELECT 'Carlos Alberto', 'Rodríguez', 'carlos.rodriguez@todofarma.com', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA', 2, 'ACTIVO', NOW()
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'carlos.rodriguez@todofarma.com');

INSERT INTO usuarios (nombre, apellido, correo, contrasena_hash, rol_id, estado, fecha_registro) 
SELECT 'Ana Patricia', 'Martínez', 'ana.martinez@todofarma.com', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA', 3, 'ACTIVO', NOW()
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'ana.martinez@todofarma.com');

INSERT INTO usuarios (nombre, apellido, correo, contrasena_hash, rol_id, estado, fecha_registro) 
SELECT 'Luis Fernando', 'Hernández', 'luis.hernandez@todofarma.com', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA', 4, 'ACTIVO', NOW()
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'luis.hernandez@todofarma.com');

INSERT INTO usuarios (nombre, apellido, correo, contrasena_hash, rol_id, estado, fecha_registro) 
SELECT 'Sandra Milena', 'López', 'sandra.lopez@todofarma.com', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA', 5, 'ACTIVO', NOW()
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'sandra.lopez@todofarma.com');

-- =========================================================
-- TABLA: marca (INSERTAR SOLO SI NO EXISTEN)
-- =========================================================
INSERT INTO marca (nombre, descripcion, activo, created_at, updated_at) 
SELECT 'Bayer', 'Laboratorio farmacéutico alemán líder mundial', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'Bayer');

INSERT INTO marca (nombre, descripcion, activo, created_at, updated_at) 
SELECT 'Pfizer', 'Multinacional farmacéutica estadounidense', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'Pfizer');

INSERT INTO marca (nombre, descripcion, activo, created_at, updated_at) 
SELECT 'Novartis', 'Compañía farmacéutica suiza multinacional', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'Novartis');

INSERT INTO marca (nombre, descripcion, activo, created_at, updated_at) 
SELECT 'Roche', 'Empresa farmacéutica suiza especializada en oncología', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'Roche');

INSERT INTO marca (nombre, descripcion, activo, created_at, updated_at) 
SELECT 'GSK', 'GlaxoSmithKline - Compañía farmacéutica británica', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'GSK');

INSERT INTO marca (nombre, descripcion, activo, created_at, updated_at) 
SELECT 'Sanofi', 'Laboratorio farmacéutico francés multinacional', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'Sanofi');

INSERT INTO marca (nombre, descripcion, activo, created_at, updated_at) 
SELECT 'Merck', 'Compañía farmacéutica estadounidense', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'Merck');

INSERT INTO marca (nombre, descripcion, activo, created_at, updated_at) 
SELECT 'Johnson & Johnson', 'Corporación multinacional estadounidense', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'Johnson & Johnson');

INSERT INTO marca (nombre, descripcion, activo, created_at, updated_at) 
SELECT 'Abbott', 'Compañía de dispositivos médicos y farmacéuticos', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'Abbott');

INSERT INTO marca (nombre, descripcion, activo, created_at, updated_at) 
SELECT 'Teva', 'Compañía farmacéutica israelí especializada en genéricos', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'Teva');

-- =========================================================
-- TABLA: categoria (INSERTAR SOLO SI NO EXISTEN)
-- =========================================================
INSERT INTO categoria (nombre, descripcion, activo, created_at, updated_at) 
SELECT 'Analgésicos', 'Medicamentos para aliviar el dolor', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre = 'Analgésicos');

INSERT INTO categoria (nombre, descripcion, activo, created_at, updated_at) 
SELECT 'Antibióticos', 'Medicamentos para combatir infecciones bacterianas', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre = 'Antibióticos');

INSERT INTO categoria (nombre, descripcion, activo, created_at, updated_at) 
SELECT 'Antiinflamatorios', 'Medicamentos para reducir la inflamación', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre = 'Antiinflamatorios');

INSERT INTO categoria (nombre, descripcion, activo, created_at, updated_at) 
SELECT 'Vitaminas', 'Suplementos vitamínicos y minerales', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre = 'Vitaminas');

INSERT INTO categoria (nombre, descripcion, activo, created_at, updated_at) 
SELECT 'Antihistamínicos', 'Medicamentos para alergias', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre = 'Antihistamínicos');

INSERT INTO categoria (nombre, descripcion, activo, created_at, updated_at) 
SELECT 'Antiacidos', 'Medicamentos para problemas digestivos', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre = 'Antiacidos');

INSERT INTO categoria (nombre, descripcion, activo, created_at, updated_at) 
SELECT 'Antitusivos', 'Medicamentos para la tos', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre = 'Antitusivos');

INSERT INTO categoria (nombre, descripcion, activo, created_at, updated_at) 
SELECT 'Antipiréticos', 'Medicamentos para reducir la fiebre', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre = 'Antipiréticos');

INSERT INTO categoria (nombre, descripcion, activo, created_at, updated_at) 
SELECT 'Antisépticos', 'Productos para desinfección y limpieza', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre = 'Antisépticos');

INSERT INTO categoria (nombre, descripcion, activo, created_at, updated_at) 
SELECT 'Cuidado Personal', 'Productos de higiene y cuidado personal', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre = 'Cuidado Personal');

-- =========================================================
-- TABLA: cliente (INSERTAR SOLO SI NO EXISTEN)
-- =========================================================
INSERT INTO cliente (nombres, apellidos, nit, email, telefono, direccion, observaciones, activo, created_at, updated_at) 
SELECT 'Juan Carlos', 'Pérez González', '12345678-9', 'juan.perez@email.com', '+57 300 123 4567', 'Calle 123 #45-67, Bogotá', 'Cliente frecuente, paga al contado', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM cliente WHERE nit = '12345678-9');

INSERT INTO cliente (nombres, apellidos, nit, email, telefono, direccion, observaciones, activo, created_at, updated_at) 
SELECT 'María Fernanda', 'López Martínez', '87654321-0', 'maria.lopez@email.com', '+57 310 987 6543', 'Carrera 45 #78-90, Medellín', 'Prefiere productos naturales', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM cliente WHERE nit = '87654321-0');

INSERT INTO cliente (nombres, apellidos, nit, email, telefono, direccion, observaciones, activo, created_at, updated_at) 
SELECT 'Carlos Alberto', 'García Rodríguez', '11223344-5', 'carlos.garcia@email.com', '+57 320 555 1234', 'Avenida 80 #12-34, Cali', 'Cliente corporativo', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM cliente WHERE nit = '11223344-5');

INSERT INTO cliente (nombres, apellidos, nit, email, telefono, direccion, observaciones, activo, created_at, updated_at) 
SELECT 'Ana Patricia', 'Hernández Silva', '55667788-9', 'ana.hernandez@email.com', '+57 315 777 8888', 'Calle 50 #23-45, Barranquilla', 'Alergia a la penicilina', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM cliente WHERE nit = '55667788-9');

INSERT INTO cliente (nombres, apellidos, nit, email, telefono, direccion, observaciones, activo, created_at, updated_at) 
SELECT 'Luis Fernando', 'Morales Vargas', '99887766-5', 'luis.morales@email.com', '+57 300 999 0000', 'Carrera 15 #67-89, Bucaramanga', 'Cliente VIP', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM cliente WHERE nit = '99887766-5');

INSERT INTO cliente (nombres, apellidos, nit, email, telefono, direccion, observaciones, activo, created_at, updated_at) 
SELECT 'Sandra Milena', 'Jiménez Torres', '44332211-7', 'sandra.jimenez@email.com', '+57 318 444 5555', 'Avenida 68 #90-12, Pereira', 'Embarazada - consultar medicamentos', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM cliente WHERE nit = '44332211-7');

INSERT INTO cliente (nombres, apellidos, nit, email, telefono, direccion, observaciones, activo, created_at, updated_at) 
SELECT 'Roberto Carlos', 'González Pérez', '77889900-3', 'roberto.gonzalez@email.com', '+57 312 666 7777', 'Calle 100 #34-56, Manizales', 'Diabético tipo 2', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM cliente WHERE nit = '77889900-3');

INSERT INTO cliente (nombres, apellidos, nit, email, telefono, direccion, observaciones, activo, created_at, updated_at) 
SELECT 'Carmen Rosa', 'Vargas López', '22334455-1', 'carmen.vargas@email.com', '+57 317 888 9999', 'Carrera 30 #78-90, Cartagena', 'Cliente mayor de edad', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM cliente WHERE nit = '22334455-1');

INSERT INTO cliente (nombres, apellidos, nit, email, telefono, direccion, observaciones, activo, created_at, updated_at) 
SELECT 'Diego Alejandro', 'Martínez García', '66778899-4', 'diego.martinez@email.com', '+57 319 111 2222', 'Avenida 40 #56-78, Santa Marta', 'Cliente joven, prefiere genéricos', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM cliente WHERE nit = '66778899-4');

INSERT INTO cliente (nombres, apellidos, nit, email, telefono, direccion, observaciones, activo, created_at, updated_at) 
SELECT 'Patricia Elena', 'Silva Hernández', '33445566-8', 'patricia.silva@email.com', '+57 314 333 4444', 'Calle 70 #12-34, Ibagué', 'Cliente frecuente, descuentos especiales', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM cliente WHERE nit = '33445566-8');

-- =========================================================
-- TABLA: proveedores (INSERTAR SOLO SI NO EXISTEN)
-- =========================================================
INSERT INTO proveedores (nombre, apellido, direccion, telefono, correo, empresa, estado) 
SELECT 'Distribuidora', 'Farmacéutica Nacional', 'Carrera 50 #25-80, Bogotá', '+57 1 234 5678', 'ventas@dfn.com.co', 'Distribuidora Farmacéutica Nacional S.A.S.', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM proveedores WHERE correo = 'ventas@dfn.com.co');

INSERT INTO proveedores (nombre, apellido, direccion, telefono, correo, empresa, estado) 
SELECT 'Laboratorios', 'Bayer Colombia', 'Avenida 68 #25-15, Bogotá', '+57 1 345 6789', 'contacto@bayer.com.co', 'Bayer S.A.', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM proveedores WHERE correo = 'contacto@bayer.com.co');

INSERT INTO proveedores (nombre, apellido, direccion, telefono, correo, empresa, estado) 
SELECT 'Pfizer', 'Colombia Ltda', 'Calle 100 #11-20, Bogotá', '+57 1 456 7890', 'info@pfizer.com.co', 'Pfizer Colombia Ltda.', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM proveedores WHERE correo = 'info@pfizer.com.co');

INSERT INTO proveedores (nombre, apellido, direccion, telefono, correo, empresa, estado) 
SELECT 'Novartis', 'de Colombia S.A.', 'Carrera 7 #32-16, Bogotá', '+57 1 567 8901', 'ventas@novartis.com.co', 'Novartis de Colombia S.A.', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM proveedores WHERE correo = 'ventas@novartis.com.co');

INSERT INTO proveedores (nombre, apellido, direccion, telefono, correo, empresa, estado) 
SELECT 'Roche', 'Colombia S.A.S.', 'Avenida 19 #100-47, Bogotá', '+57 1 678 9012', 'contacto@roche.com.co', 'Roche Colombia S.A.S.', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM proveedores WHERE correo = 'contacto@roche.com.co');

INSERT INTO proveedores (nombre, apellido, direccion, telefono, correo, empresa, estado) 
SELECT 'GSK', 'Colombia S.A.S.', 'Carrera 15 #93-07, Bogotá', '+57 1 789 0123', 'info@gsk.com.co', 'GlaxoSmithKline Colombia S.A.S.', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM proveedores WHERE correo = 'info@gsk.com.co');

INSERT INTO proveedores (nombre, apellido, direccion, telefono, correo, empresa, estado) 
SELECT 'Sanofi', 'Aventis Colombia', 'Calle 80 #10-50, Bogotá', '+57 1 890 1234', 'ventas@sanofi.com.co', 'Sanofi Aventis Colombia S.A.S.', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM proveedores WHERE correo = 'ventas@sanofi.com.co');

INSERT INTO proveedores (nombre, apellido, direccion, telefono, correo, empresa, estado) 
SELECT 'Merck', 'Colombia S.A.S.', 'Avenida 68 #25-15, Bogotá', '+57 1 901 2345', 'contacto@merck.com.co', 'Merck Colombia S.A.S.', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM proveedores WHERE correo = 'contacto@merck.com.co');

INSERT INTO proveedores (nombre, apellido, direccion, telefono, correo, empresa, estado) 
SELECT 'Johnson & Johnson', 'de Colombia', 'Carrera 50 #26-20, Bogotá', '+57 1 012 3456', 'info@jnj.com.co', 'Johnson & Johnson de Colombia S.A.S.', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM proveedores WHERE correo = 'info@jnj.com.co');

INSERT INTO proveedores (nombre, apellido, direccion, telefono, correo, empresa, estado) 
SELECT 'Abbott', 'Colombia S.A.S.', 'Calle 100 #11-20, Bogotá', '+57 1 123 4567', 'ventas@abbott.com.co', 'Abbott Colombia S.A.S.', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM proveedores WHERE correo = 'ventas@abbott.com.co');

-- =========================================================
-- TABLA: producto (INSERTAR SOLO SI NO EXISTEN)
-- =========================================================
INSERT INTO producto (nombre, descripcion, sku, codigo_barras, id_categoria, id_marca, precio_unitario, stock, fecha_vencimiento, activo, created_at, updated_at) 
SELECT 'Acetaminofén 500mg', 'Analgésico y antipirético para dolor y fiebre', 'ACET500-001', '7701234567890', 1, 1, 2500.00, 150, '2025-12-31', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE sku = 'ACET500-001');

INSERT INTO producto (nombre, descripcion, sku, codigo_barras, id_categoria, id_marca, precio_unitario, stock, fecha_vencimiento, activo, created_at, updated_at) 
SELECT 'Ibuprofeno 400mg', 'Antiinflamatorio no esteroideo para dolor e inflamación', 'IBUP400-002', '7701234567891', 3, 2, 3200.00, 120, '2025-11-30', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE sku = 'IBUP400-002');

INSERT INTO producto (nombre, descripcion, sku, codigo_barras, id_categoria, id_marca, precio_unitario, stock, fecha_vencimiento, activo, created_at, updated_at) 
SELECT 'Amoxicilina 500mg', 'Antibiótico de amplio espectro', 'AMOX500-003', '7701234567892', 2, 3, 4500.00, 80, '2025-10-15', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE sku = 'AMOX500-003');

INSERT INTO producto (nombre, descripcion, sku, codigo_barras, id_categoria, id_marca, precio_unitario, stock, fecha_vencimiento, activo, created_at, updated_at) 
SELECT 'Vitamina C 1000mg', 'Suplemento vitamínico para el sistema inmunológico', 'VITC1000-004', '7701234567893', 4, 4, 1800.00, 200, '2026-03-20', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE sku = 'VITC1000-004');

INSERT INTO producto (nombre, descripcion, sku, codigo_barras, id_categoria, id_marca, precio_unitario, stock, fecha_vencimiento, activo, created_at, updated_at) 
SELECT 'Loratadina 10mg', 'Antihistamínico para alergias', 'LORA10-005', '7701234567894', 5, 5, 2800.00, 90, '2025-09-30', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE sku = 'LORA10-005');

INSERT INTO producto (nombre, descripcion, sku, codigo_barras, id_categoria, id_marca, precio_unitario, stock, fecha_vencimiento, activo, created_at, updated_at) 
SELECT 'Omeprazol 20mg', 'Inhibidor de bomba de protones para acidez', 'OMEP20-006', '7701234567895', 6, 6, 3500.00, 110, '2025-08-25', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE sku = 'OMEP20-006');

INSERT INTO producto (nombre, descripcion, sku, codigo_barras, id_categoria, id_marca, precio_unitario, stock, fecha_vencimiento, activo, created_at, updated_at) 
SELECT 'Dextrometorfano 15mg', 'Antitusivo para la tos seca', 'DEXT15-007', '7701234567896', 7, 7, 2200.00, 75, '2025-07-18', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE sku = 'DEXT15-007');

INSERT INTO producto (nombre, descripcion, sku, codigo_barras, id_categoria, id_marca, precio_unitario, stock, fecha_vencimiento, activo, created_at, updated_at) 
SELECT 'Paracetamol 500mg', 'Analgésico y antipirético', 'PARA500-008', '7701234567897', 8, 8, 2000.00, 180, '2025-12-10', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE sku = 'PARA500-008');

INSERT INTO producto (nombre, descripcion, sku, codigo_barras, id_categoria, id_marca, precio_unitario, stock, fecha_vencimiento, activo, created_at, updated_at) 
SELECT 'Alcohol 70%', 'Antiséptico para desinfección', 'ALCO70-009', '7701234567898', 9, 9, 1500.00, 300, '2026-01-15', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE sku = 'ALCO70-009');

INSERT INTO producto (nombre, descripcion, sku, codigo_barras, id_categoria, id_marca, precio_unitario, stock, fecha_vencimiento, activo, created_at, updated_at) 
SELECT 'Jabón Antibacterial', 'Jabón para higiene personal con propiedades antibacterianas', 'JABOANT-010', '7701234567899', 10, 10, 800.00, 250, '2026-02-28', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE sku = 'JABOANT-010');

-- =========================================================
-- TABLA: caja (INSERTAR SOLO SI NO EXISTEN)
-- =========================================================
INSERT INTO caja (usuario_apertura, saldo_inicial, estado, observacion, fecha_apertura, created_at, updated_at) 
SELECT 1, 500000.00, 'ABIERTO', 'Apertura de caja principal', NOW(), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM caja WHERE estado = 'ABIERTO');

-- =========================================================
-- TABLA: venta (INSERTAR SOLO SI NO EXISTEN)
-- =========================================================
INSERT INTO venta (fecha, cliente_id, usuario_id, caja_id, estado, total, observacion, created_at, updated_at) 
SELECT NOW() - INTERVAL '2 hours', 1, 2, 1, 'EMITIDA', 8500.00, 'Venta al contado', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'
WHERE NOT EXISTS (SELECT 1 FROM venta WHERE id_venta = 1);

INSERT INTO venta (fecha, cliente_id, usuario_id, caja_id, estado, total, observacion, created_at, updated_at) 
SELECT NOW() - INTERVAL '4 hours', 2, 3, 1, 'EMITIDA', 12000.00, 'Cliente frecuente', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'
WHERE NOT EXISTS (SELECT 1 FROM venta WHERE id_venta = 2);

INSERT INTO venta (fecha, cliente_id, usuario_id, caja_id, estado, total, observacion, created_at, updated_at) 
SELECT NOW() - INTERVAL '6 hours', 3, 2, 1, 'EMITIDA', 6800.00, 'Venta con descuento', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'
WHERE NOT EXISTS (SELECT 1 FROM venta WHERE id_venta = 3);

-- =========================================================
-- TABLA: venta_detalle (INSERTAR SOLO SI NO EXISTEN)
-- =========================================================
INSERT INTO venta_detalle (id_venta, id_producto, cantidad, precio_unitario) 
SELECT 1, 1, 2, 2500.00
WHERE NOT EXISTS (SELECT 1 FROM venta_detalle WHERE id_venta = 1 AND id_producto = 1);

INSERT INTO venta_detalle (id_venta, id_producto, cantidad, precio_unitario) 
SELECT 1, 4, 1, 1800.00
WHERE NOT EXISTS (SELECT 1 FROM venta_detalle WHERE id_venta = 1 AND id_producto = 4);

INSERT INTO venta_detalle (id_venta, id_producto, cantidad, precio_unitario) 
SELECT 1, 9, 1, 1500.00
WHERE NOT EXISTS (SELECT 1 FROM venta_detalle WHERE id_venta = 1 AND id_producto = 9);

INSERT INTO venta_detalle (id_venta, id_producto, cantidad, precio_unitario) 
SELECT 2, 2, 2, 3200.00
WHERE NOT EXISTS (SELECT 1 FROM venta_detalle WHERE id_venta = 2 AND id_producto = 2);

INSERT INTO venta_detalle (id_venta, id_producto, cantidad, precio_unitario) 
SELECT 2, 5, 1, 2800.00
WHERE NOT EXISTS (SELECT 1 FROM venta_detalle WHERE id_venta = 2 AND id_producto = 5);

INSERT INTO venta_detalle (id_venta, id_producto, cantidad, precio_unitario) 
SELECT 2, 10, 1, 800.00
WHERE NOT EXISTS (SELECT 1 FROM venta_detalle WHERE id_venta = 2 AND id_producto = 10);

INSERT INTO venta_detalle (id_venta, id_producto, cantidad, precio_unitario) 
SELECT 3, 1, 1, 2500.00
WHERE NOT EXISTS (SELECT 1 FROM venta_detalle WHERE id_venta = 3 AND id_producto = 1);

INSERT INTO venta_detalle (id_venta, id_producto, cantidad, precio_unitario) 
SELECT 3, 6, 1, 3500.00
WHERE NOT EXISTS (SELECT 1 FROM venta_detalle WHERE id_venta = 3 AND id_producto = 6);

INSERT INTO venta_detalle (id_venta, id_producto, cantidad, precio_unitario) 
SELECT 3, 9, 1, 1500.00
WHERE NOT EXISTS (SELECT 1 FROM venta_detalle WHERE id_venta = 3 AND id_producto = 9);

-- =========================================================
-- TABLA: pedido (INSERTAR SOLO SI NO EXISTEN)
-- =========================================================
INSERT INTO pedido (proveedor_id, usuario_id, fecha_pedido, estado, total_costo, observacion, created_at, updated_at) 
SELECT 1, 1, NOW() - INTERVAL '5 days', 'RECIBIDO', 250000.00, 'Pedido mensual de productos básicos', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
WHERE NOT EXISTS (SELECT 1 FROM pedido WHERE id_pedido = 1);

INSERT INTO pedido (proveedor_id, usuario_id, fecha_pedido, estado, total_costo, observacion, created_at, updated_at) 
SELECT 2, 1, NOW() - INTERVAL '3 days', 'EN_TRANSITO', 180000.00, 'Pedido de analgésicos Bayer', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
WHERE NOT EXISTS (SELECT 1 FROM pedido WHERE id_pedido = 2);

INSERT INTO pedido (proveedor_id, usuario_id, fecha_pedido, estado, total_costo, observacion, created_at, updated_at) 
SELECT 3, 1, NOW() - INTERVAL '2 days', 'PENDIENTE', 320000.00, 'Pedido de antibióticos Pfizer', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
WHERE NOT EXISTS (SELECT 1 FROM pedido WHERE id_pedido = 3);

-- =========================================================
-- TABLA: pedido_detalle (INSERTAR SOLO SI NO EXISTEN)
-- =========================================================
INSERT INTO pedido_detalle (id_pedido, id_producto, cantidad, costo_unitario) 
SELECT 1, 1, 100, 2000.00
WHERE NOT EXISTS (SELECT 1 FROM pedido_detalle WHERE id_pedido = 1 AND id_producto = 1);

INSERT INTO pedido_detalle (id_pedido, id_producto, cantidad, costo_unitario) 
SELECT 1, 4, 50, 1500.00
WHERE NOT EXISTS (SELECT 1 FROM pedido_detalle WHERE id_pedido = 1 AND id_producto = 4);

INSERT INTO pedido_detalle (id_pedido, id_producto, cantidad, costo_unitario) 
SELECT 1, 9, 200, 1200.00
WHERE NOT EXISTS (SELECT 1 FROM pedido_detalle WHERE id_pedido = 1 AND id_producto = 9);

INSERT INTO pedido_detalle (id_pedido, id_producto, cantidad, costo_unitario) 
SELECT 2, 2, 80, 2800.00
WHERE NOT EXISTS (SELECT 1 FROM pedido_detalle WHERE id_pedido = 2 AND id_producto = 2);

INSERT INTO pedido_detalle (id_pedido, id_producto, cantidad, costo_unitario) 
SELECT 3, 3, 50, 3800.00
WHERE NOT EXISTS (SELECT 1 FROM pedido_detalle WHERE id_pedido = 3 AND id_producto = 3);

-- =========================================================
-- TABLA: inventario_movimiento (INSERTAR SOLO SI NO EXISTEN)
-- =========================================================
INSERT INTO inventario_movimiento (producto_id, tipo, cantidad, signo, referencia, pedido_id, venta_id, usuario_id, observacion, fecha_movimiento, created_at) 
SELECT 1, 'ENTRADA_PEDIDO', 100, 1, 'Pedido #1', 1, NULL, 1, 'Recepción de pedido de acetaminofén', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
WHERE NOT EXISTS (SELECT 1 FROM inventario_movimiento WHERE producto_id = 1 AND tipo = 'ENTRADA_PEDIDO' AND pedido_id = 1);

INSERT INTO inventario_movimiento (producto_id, tipo, cantidad, signo, referencia, pedido_id, venta_id, usuario_id, observacion, fecha_movimiento, created_at) 
SELECT 4, 'ENTRADA_PEDIDO', 50, 1, 'Pedido #1', 1, NULL, 1, 'Recepción de pedido de vitamina C', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
WHERE NOT EXISTS (SELECT 1 FROM inventario_movimiento WHERE producto_id = 4 AND tipo = 'ENTRADA_PEDIDO' AND pedido_id = 1);

INSERT INTO inventario_movimiento (producto_id, tipo, cantidad, signo, referencia, pedido_id, venta_id, usuario_id, observacion, fecha_movimiento, created_at) 
SELECT 9, 'ENTRADA_PEDIDO', 200, 1, 'Pedido #1', 1, NULL, 1, 'Recepción de pedido de alcohol', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
WHERE NOT EXISTS (SELECT 1 FROM inventario_movimiento WHERE producto_id = 9 AND tipo = 'ENTRADA_PEDIDO' AND pedido_id = 1);

INSERT INTO inventario_movimiento (producto_id, tipo, cantidad, signo, referencia, pedido_id, venta_id, usuario_id, observacion, fecha_movimiento, created_at) 
SELECT 1, 'SALIDA_VENTA', 2, -1, 'Venta #1', NULL, 1, 2, 'Venta de acetaminofén', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'
WHERE NOT EXISTS (SELECT 1 FROM inventario_movimiento WHERE producto_id = 1 AND tipo = 'SALIDA_VENTA' AND venta_id = 1);

INSERT INTO inventario_movimiento (producto_id, tipo, cantidad, signo, referencia, pedido_id, venta_id, usuario_id, observacion, fecha_movimiento, created_at) 
SELECT 4, 'SALIDA_VENTA', 1, -1, 'Venta #1', NULL, 1, 2, 'Venta de vitamina C', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'
WHERE NOT EXISTS (SELECT 1 FROM inventario_movimiento WHERE producto_id = 4 AND tipo = 'SALIDA_VENTA' AND venta_id = 1);

INSERT INTO inventario_movimiento (producto_id, tipo, cantidad, signo, referencia, pedido_id, venta_id, usuario_id, observacion, fecha_movimiento, created_at) 
SELECT 9, 'SALIDA_VENTA', 1, -1, 'Venta #1', NULL, 1, 2, 'Venta de alcohol', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'
WHERE NOT EXISTS (SELECT 1 FROM inventario_movimiento WHERE producto_id = 9 AND tipo = 'SALIDA_VENTA' AND venta_id = 1);

INSERT INTO inventario_movimiento (producto_id, tipo, cantidad, signo, referencia, pedido_id, venta_id, usuario_id, observacion, fecha_movimiento, created_at) 
SELECT 2, 'SALIDA_VENTA', 2, -1, 'Venta #2', NULL, 2, 3, 'Venta de ibuprofeno', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'
WHERE NOT EXISTS (SELECT 1 FROM inventario_movimiento WHERE producto_id = 2 AND tipo = 'SALIDA_VENTA' AND venta_id = 2);

INSERT INTO inventario_movimiento (producto_id, tipo, cantidad, signo, referencia, pedido_id, venta_id, usuario_id, observacion, fecha_movimiento, created_at) 
SELECT 5, 'SALIDA_VENTA', 1, -1, 'Venta #2', NULL, 2, 3, 'Venta de loratadina', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'
WHERE NOT EXISTS (SELECT 1 FROM inventario_movimiento WHERE producto_id = 5 AND tipo = 'SALIDA_VENTA' AND venta_id = 2);

INSERT INTO inventario_movimiento (producto_id, tipo, cantidad, signo, referencia, pedido_id, venta_id, usuario_id, observacion, fecha_movimiento, created_at) 
SELECT 10, 'SALIDA_VENTA', 1, -1, 'Venta #2', NULL, 2, 3, 'Venta de jabón antibacterial', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'
WHERE NOT EXISTS (SELECT 1 FROM inventario_movimiento WHERE producto_id = 10 AND tipo = 'SALIDA_VENTA' AND venta_id = 2);

INSERT INTO inventario_movimiento (producto_id, tipo, cantidad, signo, referencia, pedido_id, venta_id, usuario_id, observacion, fecha_movimiento, created_at) 
SELECT 1, 'AJUSTE_INVENTARIO', 5, 1, 'Ajuste por conteo', NULL, NULL, 1, 'Ajuste positivo por conteo físico', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM inventario_movimiento WHERE producto_id = 1 AND tipo = 'AJUSTE_INVENTARIO' AND referencia = 'Ajuste por conteo');

COMMIT;

-- =========================================================
-- RESUMEN DE DATOS INSERTADOS
-- =========================================================
-- Roles: 5 registros (si no existían)
-- Usuarios: 5 registros (si no existían)
-- Marcas: 10 registros (si no existían)
-- Categorías: 10 registros (si no existían)
-- Clientes: 10 registros (si no existían)
-- Proveedores: 10 registros (si no existían)
-- Productos: 10 registros (si no existían)
-- Cajas: 1 registro (si no existía)
-- Ventas: 3 registros (si no existían)
-- Detalles de Ventas: 9 registros (si no existían)
-- Pedidos: 3 registros (si no existían)
-- Detalles de Pedidos: 5 registros (si no existían)
-- Movimientos de Inventario: 10 registros (si no existían)
-- =========================================================
