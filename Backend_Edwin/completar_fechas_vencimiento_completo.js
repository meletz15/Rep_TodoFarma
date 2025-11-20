const { pool } = require('./src/config/db');
const CargaController = require('./src/controllers/cargaController');

async function completarFechasVencimientoCompleto() {
  let cliente = null;
  try {
    console.log('🔍 Validando y completando fechas de vencimiento en productos e inventario...');
    console.log('='.repeat(80));
    
    cliente = await pool.connect();
    await cliente.query('BEGIN');
    
    // ============================================
    // 1. PRODUCTOS SIN FECHA DE VENCIMIENTO
    // ============================================
    console.log('\n📦 PRODUCTOS:');
    console.log('-'.repeat(80));
    
    const productosSinFecha = await cliente.query(
      'SELECT id_producto, nombre, stock FROM producto WHERE fecha_vencimiento IS NULL'
    );
    
    console.log(`Productos sin fecha de vencimiento: ${productosSinFecha.rows.length}`);
    
    let productosActualizados = 0;
    let productosErrores = 0;
    
    if (productosSinFecha.rows.length > 0) {
      console.log('\n💾 Asignando fechas de vencimiento aleatorias a productos...');
      
      for (const producto of productosSinFecha.rows) {
        try {
          // Generar fecha de vencimiento aleatoria
          const fechaVencimiento = CargaController.generarFechaVencimientoAleatoria();
          
          // Actualizar producto
          await cliente.query(
            'UPDATE producto SET fecha_vencimiento = $1 WHERE id_producto = $2',
            [fechaVencimiento, producto.id_producto]
          );
          
          console.log(`   ✅ "${producto.nombre}" - Fecha: ${fechaVencimiento}`);
          productosActualizados++;
        } catch (error) {
          console.error(`   ❌ Error al actualizar "${producto.nombre}": ${error.message}`);
          productosErrores++;
        }
      }
    } else {
      console.log('✅ Todos los productos ya tienen fecha de vencimiento');
    }
    
    // ============================================
    // 2. MOVIMIENTOS DE INVENTARIO SIN FECHA DE VENCIMIENTO
    // ============================================
    console.log('\n📋 MOVIMIENTOS DE INVENTARIO:');
    console.log('-'.repeat(80));
    
    // Obtener movimientos sin fecha de vencimiento
    const movimientosSinFecha = await cliente.query(
      `SELECT im.id_mov, im.producto_id, im.cantidad, p.nombre as producto_nombre, p.fecha_vencimiento as producto_fecha
       FROM inventario_movimiento im
       JOIN producto p ON im.producto_id = p.id_producto
       WHERE im.fecha_vencimiento IS NULL`
    );
    
    console.log(`Movimientos sin fecha de vencimiento: ${movimientosSinFecha.rows.length}`);
    
    let movimientosActualizados = 0;
    let movimientosErrores = 0;
    
    if (movimientosSinFecha.rows.length > 0) {
      console.log('\n💾 Asignando fechas de vencimiento a movimientos...');
      
      for (const movimiento of movimientosSinFecha.rows) {
        try {
          let fechaVencimiento = null;
          
          // Si el producto tiene fecha de vencimiento, usar esa
          if (movimiento.producto_fecha) {
            fechaVencimiento = movimiento.producto_fecha;
          } else {
            // Si no, generar una aleatoria
            fechaVencimiento = CargaController.generarFechaVencimientoAleatoria();
          }
          
          // Actualizar movimiento
          await cliente.query(
            'UPDATE inventario_movimiento SET fecha_vencimiento = $1 WHERE id_mov = $2',
            [fechaVencimiento, movimiento.id_mov]
          );
          
          const fuente = movimiento.producto_fecha ? 'del producto' : 'aleatoria';
          console.log(`   ✅ Movimiento #${movimiento.id_mov} (${movimiento.producto_nombre}) - Fecha: ${fechaVencimiento} (${fuente})`);
          movimientosActualizados++;
        } catch (error) {
          console.error(`   ❌ Error al actualizar movimiento #${movimiento.id_mov}: ${error.message}`);
          movimientosErrores++;
        }
      }
    } else {
      console.log('✅ Todos los movimientos ya tienen fecha de vencimiento');
    }
    
    await cliente.query('COMMIT');
    
    // ============================================
    // RESUMEN FINAL
    // ============================================
    console.log('\n📊 RESUMEN FINAL:');
    console.log('='.repeat(80));
    console.log('PRODUCTOS:');
    console.log(`   Actualizados: ${productosActualizados}`);
    console.log(`   Errores: ${productosErrores}`);
    console.log('\nMOVIMIENTOS DE INVENTARIO:');
    console.log(`   Actualizados: ${movimientosActualizados}`);
    console.log(`   Errores: ${movimientosErrores}`);
    
    // Verificación final
    const verifProductos = await cliente.query(
      'SELECT COUNT(*) as total FROM producto WHERE fecha_vencimiento IS NULL'
    );
    const verifMovimientos = await cliente.query(
      'SELECT COUNT(*) as total FROM inventario_movimiento WHERE fecha_vencimiento IS NULL'
    );
    
    console.log('\n✅ VERIFICACIÓN FINAL:');
    console.log(`   Productos sin fecha: ${verifProductos.rows[0].total}`);
    console.log(`   Movimientos sin fecha: ${verifMovimientos.rows[0].total}`);
    
    if (verifProductos.rows[0].total === 0 && verifMovimientos.rows[0].total === 0) {
      console.log('\n🎉 ¡Todas las fechas de vencimiento han sido completadas!');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    if (cliente) {
      try {
        await cliente.query('ROLLBACK');
      } catch (e) {
        // Ignorar
      }
    }
    process.exit(1);
  } finally {
    if (cliente) {
      cliente.release();
    }
  }
}

completarFechasVencimientoCompleto();

