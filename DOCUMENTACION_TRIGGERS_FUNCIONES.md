# Documentación de Triggers y Funciones - Base de Datos TodoFarma

## 📋 Resumen
Este documento describe todas las funciones y triggers personalizados implementados en la base de datos del sistema TodoFarma.

---

## 🔧 FUNCIONES PERSONALIZADAS

### 1. `set_updated_at()`
**Tipo:** Función Trigger  
**Propósito:** Actualiza automáticamente el campo `updated_at` con la fecha y hora actual antes de cualquier operación UPDATE.

**Lógica:**
- Se ejecuta antes de actualizar un registro
- Establece `NEW.updated_at = NOW()`
- Retorna el registro modificado

**Uso:** Aplicada a múltiples tablas para mantener un registro automático de la última modificación.

---

### 2. `fn_caja_abierta_id()`
**Tipo:** Función Escalar  
**Retorna:** `BIGINT`  
**Propósito:** Obtiene el ID de la caja que está actualmente abierta.

**Lógica:**
- Busca en la tabla `caja` el registro con estado 'ABIERTO'
- Retorna el `id_caja` más reciente (ordenado por `fecha_apertura DESC`)
- Retorna `NULL` si no hay caja abierta

**Uso:** Utilizada por otros triggers para validar que exista una caja abierta antes de realizar operaciones.

---

### 3. `calcular_subtotal()`
**Tipo:** Función Trigger  
**Propósito:** Calcula automáticamente el subtotal de un detalle de pedido cuando el estado cambia a recibido (estado = 1).

**Lógica:**
- Se ejecuta antes de INSERT o UPDATE
- Si `NEW.estado = 1` (recibido):
  - Calcula: `subtotal = cantidad * precio_proveedor`
  - Establece `fecha_recepcion = CURRENT_DATE`
- Retorna el registro modificado

**Uso:** Automatiza el cálculo del subtotal en pedidos recibidos.

---

### 4. `pasar_a_inventario()`
**Tipo:** Función Trigger  
**Propósito:** Transfiere automáticamente productos de un pedido recibido al inventario.

**Lógica:**
- Se ejecuta cuando un detalle de pedido cambia a estado = 1 (recibido)
- Inserta un registro en la tabla `inventario` con:
  - `id_pedido`, `id_producto`, `id`, `stock`, `fecha_vencimiento`
- Retorna el registro procesado

**Uso:** Automatiza la incorporación de productos al inventario cuando se recibe un pedido.

---

### 5. `procesar_devolucion()`
**Tipo:** Función Trigger  
**Propósito:** Procesa devoluciones reduciendo el stock del inventario.

**Lógica:**
- Se ejecuta cuando se registra una devolución
- Actualiza el inventario: `stock = stock - cantidad_devolucion`
- Busca el registro específico por `id_producto`, `id` y `id_pedido`
- Retorna el registro procesado

**Uso:** Maneja automáticamente las devoluciones de productos.

---

### 6. `tr_inv_mov_apply_stock()`
**Tipo:** Función Trigger  
**Propósito:** Aplica movimientos de inventario actualizando el stock del producto automáticamente.

**Lógica:**
- Se ejecuta DESPUÉS de INSERT en `inventario_movimiento`
- Calcula el nuevo stock: `stock_actual + (signo * cantidad)`
  - `signo = 1` para entradas (aumenta stock)
  - `signo = -1` para salidas (disminuye stock)
- Valida que no haya stock negativo:
  - Si es salida (`signo = -1`) y el stock resultante es negativo, lanza excepción
- Actualiza el stock en la tabla `producto`
- Actualiza `updated_at` del producto

**Uso:** Mantiene el stock de productos sincronizado con los movimientos de inventario.

---

### 7. `tr_pedido_estado_recibido()`
**Tipo:** Función Trigger  
**Propósito:** Cuando un pedido cambia a estado 'RECIBIDO', genera automáticamente movimientos de entrada en el inventario.

**Lógica:**
- Se ejecuta DESPUÉS de UPDATE en la columna `estado` de la tabla `pedido`
- Verifica si el estado cambió de cualquier valor a 'RECIBIDO'
- Para cada detalle del pedido:
  - Crea un registro en `inventario_movimiento` con:
    - Tipo: 'ENTRADA_COMPRA'
    - Cantidad del detalle
    - Signo: 1 (entrada)
    - Referencia: 'Pedido {id_pedido}'
    - Observación: 'Recepción de pedido'
- Retorna el registro procesado

**Uso:** Automatiza el registro de entrada de productos al inventario cuando se recibe un pedido completo.

---

### 8. `tr_venta_assert_caja_abierta()`
**Tipo:** Función Trigger  
**Propósito:** Valida que exista una caja abierta antes de permitir crear una venta con estado 'EMITIDA'.

**Lógica:**
- Se ejecuta ANTES de INSERT en la tabla `venta`
- Si `NEW.estado = 'EMITIDA'`:
  - Obtiene el `caja_id` del registro o busca una caja abierta usando `fn_caja_abierta_id()`
  - Si no hay caja abierta, lanza excepción: "No hay caja ABIERTO. Debe abrir una caja antes de emitir ventas."
  - Asigna automáticamente el `caja_id` a la venta
- Retorna el registro validado

**Uso:** Garantiza la integridad del negocio: no se pueden emitir ventas sin una caja abierta.

---

### 9. `tr_venta_det_generar_salida()`
**Tipo:** Función Trigger  
**Propósito:** Genera automáticamente un movimiento de salida en el inventario cuando se agrega un producto a una venta emitida.

**Lógica:**
- Se ejecuta DESPUÉS de INSERT en `venta_detalle`
- Obtiene el estado de la venta y el `usuario_id`
- Si la venta tiene estado 'EMITIDA':
  - Crea un registro en `inventario_movimiento` con:
    - Tipo: 'SALIDA_VENTA'
    - Cantidad del detalle
    - Signo: -1 (salida)
    - Referencia: 'Venta {id_venta}'
    - Observación: 'Salida por venta'
- Retorna el registro procesado

**Uso:** Automatiza el registro de salida de productos del inventario cuando se realiza una venta.

---

### 10. `validar_tipo_presentacion()`
**Tipo:** Función Trigger  
**Propósito:** Valida que el valor de `tipo_presentacion` en la tabla `producto` exista y esté activo en la tabla `presentacion`.

**Lógica:**
- Se ejecuta ANTES de INSERT o UPDATE en la columna `tipo_presentacion` de `producto`
- Si `tipo_presentacion` no es NULL:
  - Verifica que exista en `presentacion.nombre` y que esté activo (`activo = true`)
  - Si no existe o no está activo, lanza excepción con mensaje descriptivo
- Retorna el registro validado

**Uso:** Mantiene la integridad referencial entre `producto.tipo_presentacion` y `presentacion.nombre` sin usar foreign keys.

---

### 11. `validar_unidad_medida()`
**Tipo:** Función Trigger  
**Propósito:** Valida que el valor de `unidad_medida` en la tabla `producto` exista y esté activo en la tabla `unidad_medida`.

**Lógica:**
- Se ejecuta ANTES de INSERT o UPDATE en la columna `unidad_medida` de `producto`
- Si `unidad_medida` no es NULL:
  - Verifica que exista en `unidad_medida.simbolo` y que esté activo (`activo = true`)
  - Si no existe o no está activo, lanza excepción con mensaje descriptivo
- Retorna el registro validado

**Uso:** Mantiene la integridad referencial entre `producto.unidad_medida` y `unidad_medida.simbolo` sin usar foreign keys.

---

## ⚡ TRIGGERS IMPLEMENTADOS

### Tabla: `caja`
1. **`tr_caja__updated_at`**
   - **Función:** `set_updated_at()`
   - **Momento:** BEFORE UPDATE
   - **Propósito:** Actualiza automáticamente `updated_at` cuando se modifica un registro de caja.

---

### Tabla: `categoria`
2. **`tr_categoria__updated_at`**
   - **Función:** `set_updated_at()`
   - **Momento:** BEFORE UPDATE
   - **Propósito:** Actualiza automáticamente `updated_at` cuando se modifica una categoría.

---

### Tabla: `cliente`
3. **`tr_cliente__updated_at`**
   - **Función:** `set_updated_at()`
   - **Momento:** BEFORE UPDATE
   - **Propósito:** Actualiza automáticamente `updated_at` cuando se modifica un cliente.

---

### Tabla: `inventario_movimiento`
4. **`tr_inv_mov__apply_stock`**
   - **Función:** `tr_inv_mov_apply_stock()`
   - **Momento:** AFTER INSERT
   - **Propósito:** Aplica automáticamente el movimiento al stock del producto, validando que no quede negativo.

---

### Tabla: `marca`
5. **`tr_marca__updated_at`**
   - **Función:** `set_updated_at()`
   - **Momento:** BEFORE UPDATE
   - **Propósito:** Actualiza automáticamente `updated_at` cuando se modifica una marca.

---

### Tabla: `pedido`
6. **`tr_pedido__updated_at`**
   - **Función:** `set_updated_at()`
   - **Momento:** BEFORE UPDATE
   - **Propósito:** Actualiza automáticamente `updated_at` cuando se modifica un pedido.

7. **`tr_pedido__on_recibido`**
   - **Función:** `tr_pedido_estado_recibido()`
   - **Momento:** AFTER UPDATE OF estado
   - **Propósito:** Cuando un pedido cambia a estado 'RECIBIDO', genera automáticamente movimientos de entrada en el inventario para todos sus detalles.

---

### Tabla: `producto`
8. **`tr_producto__updated_at`**
   - **Función:** `set_updated_at()`
   - **Momento:** BEFORE UPDATE
   - **Propósito:** Actualiza automáticamente `updated_at` cuando se modifica un producto.

9. **`trg_validar_tipo_presentacion`**
   - **Función:** `validar_tipo_presentacion()`
   - **Momento:** BEFORE INSERT OR UPDATE OF tipo_presentacion
   - **Propósito:** Valida que el tipo de presentación exista y esté activo en la tabla `presentacion`.

10. **`trg_validar_unidad_medida`**
    - **Función:** `validar_unidad_medida()`
    - **Momento:** BEFORE INSERT OR UPDATE OF unidad_medida
    - **Propósito:** Valida que la unidad de medida exista y esté activa en la tabla `unidad_medida`.

---

### Tabla: `venta`
11. **`tr_venta__updated_at`**
    - **Función:** `set_updated_at()`
    - **Momento:** BEFORE UPDATE
    - **Propósito:** Actualiza automáticamente `updated_at` cuando se modifica una venta.

12. **`tr_venta__assert_caja`**
    - **Función:** `tr_venta_assert_caja_abierta()`
    - **Momento:** BEFORE INSERT
    - **Propósito:** Valida que exista una caja abierta antes de permitir crear una venta con estado 'EMITIDA'.

---

### Tabla: `venta_detalle`
13. **`tr_venta_det__generar_salida`**
    - **Función:** `tr_venta_det_generar_salida()`
    - **Momento:** AFTER INSERT
    - **Propósito:** Genera automáticamente un movimiento de salida en el inventario cuando se agrega un producto a una venta emitida.

---

## 📊 FUNCIONES ESTÁNDAR DE POSTGRESQL (UUID)

Las siguientes funciones son parte de la extensión `uuid-ossp` de PostgreSQL y se utilizan para generar identificadores únicos:

- `uuid_generate_v1()` - Genera UUID versión 1 (basado en MAC address y timestamp)
- `uuid_generate_v1mc()` - Genera UUID versión 1 con MAC address aleatorio
- `uuid_generate_v3()` - Genera UUID versión 3 (basado en namespace y nombre)
- `uuid_generate_v4()` - Genera UUID versión 4 (aleatorio)
- `uuid_generate_v5()` - Genera UUID versión 5 (basado en namespace y nombre)
- `uuid_nil()` - Retorna el UUID nil (todo ceros)
- `uuid_ns_dns()` - Namespace DNS para UUID v3/v5
- `uuid_ns_oid()` - Namespace OID para UUID v3/v5
- `uuid_ns_url()` - Namespace URL para UUID v3/v5
- `uuid_ns_x500()` - Namespace X500 para UUID v3/v5

---

## 🔄 FLUJO DE TRIGGERS EN OPERACIONES PRINCIPALES

### Flujo de Venta:
1. **INSERT en `venta`** → `tr_venta__assert_caja` valida caja abierta
2. **INSERT en `venta_detalle`** → `tr_venta_det__generar_salida` crea movimiento de inventario
3. **INSERT en `inventario_movimiento`** → `tr_inv_mov__apply_stock` actualiza stock del producto

### Flujo de Pedido:
1. **UPDATE `pedido.estado` a 'RECIBIDO'** → `tr_pedido__on_recibido` crea movimientos de entrada
2. **INSERT en `inventario_movimiento`** → `tr_inv_mov__apply_stock` actualiza stock del producto

### Flujo de Actualización:
- Cualquier **UPDATE** en tablas con trigger `*__updated_at` → Actualiza automáticamente el campo `updated_at`

---

## ✅ BENEFICIOS DE ESTA ARQUITECTURA

1. **Integridad de Datos:** Los triggers garantizan que las operaciones sigan reglas de negocio consistentes
2. **Automatización:** Reduce la necesidad de lógica en la aplicación para operaciones comunes
3. **Consistencia:** El campo `updated_at` se mantiene automáticamente en todas las tablas
4. **Validación:** Previene operaciones inválidas (ventas sin caja, stock negativo, etc.)
5. **Trazabilidad:** Los movimientos de inventario se registran automáticamente
6. **Integridad Referencial:** Valida relaciones sin usar foreign keys en campos de texto

---

## 📝 NOTAS IMPORTANTES

- Todos los triggers están **habilitados** (`tgenabled = O`)
- Los triggers de validación lanzan excepciones que detienen la operación si fallan
- Los triggers de actualización de stock usan `FOR UPDATE` para evitar condiciones de carrera
- Las validaciones de presentación y unidad de medida solo verifican valores activos


