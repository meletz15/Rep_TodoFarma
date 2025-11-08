# Guía de Prueba - Implementación de Presentaciones y Conversión de Blisters

## ✅ Estado de la Implementación

### FASE 1: Presentaciones de Productos ✅ COMPLETADA
- ✅ Migración SQL creada
- ✅ Backend actualizado (modelo, controlador)
- ✅ Frontend actualizado (modelo, formulario, tabla)

### FASE 2: Conversión de Blisters ✅ COMPLETADA
- ✅ Backend: Método `crearConversion()` implementado
- ✅ Endpoint `POST /api/inventario/conversion` creado
- ✅ Frontend: Modal de conversión implementado
- ✅ Botón "Desglosar" agregado en tabla de inventario

## 🚀 Pasos para Probar

### 1. Ejecutar la Migración SQL (IMPORTANTE)

**Antes de probar, debes ejecutar la migración SQL:**

```bash
cd Backend_Edwin
psql -U tu_usuario -d todofarma -f db/migracion_presentaciones.sql
```

O desde pgAdmin/DBeaver, ejecuta el contenido de:
`Backend_Edwin/db/migracion_presentaciones.sql`

### 2. Backend está Corriendo ✅

El backend ya está iniciado y funcionando en `http://localhost:3002`

### 3. Probar FASE 1: Presentaciones de Productos

#### 3.1 Crear un Producto con Presentación
1. Ve a la sección **Productos**
2. Haz clic en **Nuevo Producto**
3. Completa el formulario y en la sección **Presentación**:
   - **Tipo de Presentación**: Selecciona "Blister" (o cualquier otro tipo)
   - **Cantidad**: Ingresa 20 (ejemplo: 20 tabletas por blister)
   - **Unidad de Medida**: Selecciona "tabletas"
4. Guarda el producto
5. Verifica que en la tabla aparece la columna **Presentación** con el formato: "20 tabletas Blister"

#### 3.2 Editar Presentación de un Producto Existente
1. Haz clic en el botón **Editar** de cualquier producto
2. Completa los campos de presentación
3. Guarda los cambios
4. Verifica que la presentación se actualiza en la tabla

### 4. Probar FASE 2: Conversión de Blisters a Pastillas Sueltas

#### 4.1 Preparación: Crear Productos Relacionados

**Producto 1: Blister**
- Nombre: "Paracetamol 500mg Blister"
- Tipo de Presentación: **Blister**
- Cantidad: **20** (20 tabletas por blister)
- Unidad: **tabletas**
- Stock: 10 (tener stock disponible)

**Producto 2: Pastilla Suelta**
- Nombre: "Paracetamol 500mg Pastilla Suelta" (o "Paracetamol 500mg Tabletas")
- Tipo de Presentación: **Tabletas**
- Cantidad: **1**
- Unidad: **tabletas**
- Stock: 0

**Nota**: El sistema busca automáticamente el producto de pastilla suelta relacionado por nombre. Asegúrate de que el nombre del producto suelto contenga palabras clave como "suelta", "suelto" o que sea tipo "Tabletas" sin "blister" en el nombre.

#### 4.2 Realizar Conversión

1. Ve a la sección **Inventario** → Tab **Inventario Total**
2. Busca el producto tipo **Blister** que creaste
3. Verás un botón con ícono de desglosar (📦) en la columna **Acciones**
4. Haz clic en el botón **Desglosar**
5. Se abrirá un modal que muestra:
   - Producto Blister seleccionado
   - Producto Destino (Pastilla Suelta) encontrado automáticamente
   - Campo para ingresar cantidad de blisters a desglosar
   - Resumen de la conversión
6. Ingresa la cantidad de blisters (ejemplo: 2)
7. Verifica el resumen:
   - Blisters a desglosar: 2
   - Pastillas sueltas resultantes: 40 (2 blisters × 20 tabletas)
   - Stock blister después: 8 (10 - 2)
   - Stock pastillas después: 40 (0 + 40)
8. Haz clic en **Confirmar Conversión**
9. Confirma en el diálogo de confirmación
10. Verifica que:
    - El stock del blister disminuyó
    - El stock de pastillas sueltas aumentó
    - Aparecen 2 movimientos en la tabla de movimientos:
      - Salida: AJUSTE_SALIDA del blister
      - Entrada: AJUSTE_ENTRADA de pastillas sueltas

## 🔍 Verificaciones Adicionales

### Verificar Movimientos de Inventario
1. Ve a **Inventario** → Tab **Movimientos de Inventario**
2. Busca los movimientos con referencia "CONVERSION"
3. Verifica que hay 2 movimientos relacionados:
   - Uno con signo negativo (salida del blister)
   - Uno con signo positivo (entrada de pastillas)

### Verificar Stock Actualizado
1. Ve a **Inventario** → Tab **Inventario Total**
2. Verifica que:
   - El stock del blister disminuyó correctamente
   - El stock de pastillas sueltas aumentó correctamente

## ⚠️ Notas Importantes

1. **Migración SQL**: Debes ejecutar la migración antes de probar, o los campos de presentación no estarán disponibles.

2. **Búsqueda de Producto Destino**: El sistema busca automáticamente el producto de pastilla suelta relacionado. Si no lo encuentra, muestra un mensaje. En ese caso:
   - Asegúrate de que el producto suelto tenga un nombre similar al blister
   - O que contenga palabras clave como "suelta", "suelto"
   - O que sea tipo "Tabletas" sin "blister" en el nombre

3. **Validaciones**:
   - Solo se pueden desglosar productos tipo "Blister"
   - Debe haber stock disponible
   - El producto destino debe existir

4. **Factor de Conversión**: Se toma automáticamente de `cantidad_presentacion` del producto blister. Si un blister tiene 20 tabletas, al desglosar 1 blister se obtienen 20 pastillas sueltas.

## 🐛 Solución de Problemas

### Si no aparece el botón "Desglosar":
- Verifica que el producto sea tipo "Blister" (no "Tabletas" u otro)
- Verifica que tenga stock > 0

### Si no encuentra el producto destino:
- Crea el producto de pastilla suelta con un nombre similar
- Asegúrate de que no tenga "blister" en el nombre
- Usa palabras clave como "suelta" o "suelto"

### Si hay error al convertir:
- Verifica que haya suficiente stock del blister
- Verifica que el producto destino exista
- Revisa la consola del navegador para ver errores específicos

## 📝 Archivos Modificados

### Backend:
- `Backend_Edwin/db/migracion_presentaciones.sql` (NUEVO)
- `Backend_Edwin/src/models/productoModel.js`
- `Backend_Edwin/src/controllers/productoController.js`
- `Backend_Edwin/src/models/inventarioModel.js`
- `Backend_Edwin/src/controllers/inventarioController.js`
- `Backend_Edwin/src/routes/inventarioRoutes.js`

### Frontend:
- `FrontEnd_Edwin/src/app/models/producto.model.ts`
- `FrontEnd_Edwin/src/app/pages/productos/productos.component.ts`
- `FrontEnd_Edwin/src/app/pages/productos/productos.component.html`
- `FrontEnd_Edwin/src/app/models/inventario.model.ts`
- `FrontEnd_Edwin/src/app/services/inventario.service.ts`
- `FrontEnd_Edwin/src/app/pages/inventario/inventario.component.ts`
- `FrontEnd_Edwin/src/app/pages/inventario/inventario.component.html`

---

**¡Todo listo para probar!** 🎉

