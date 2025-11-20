const { pool } = require('./src/config/db');
const CargaController = require('./src/controllers/cargaController');

async function completarFechasVencimiento() {
  let cliente = null;
  try {
    console.log('🔍 Validando y completando fechas de vencimiento...');
    console.log('='.repeat(80));
    
    cliente = await pool.connect();
    await cliente.query('BEGIN');
    
    // Obtener productos sin fecha de vencimiento
    const productosSinFecha = await cliente.query(
      'SELECT id_producto, nombre, stock FROM producto WHERE fecha_vencimiento IS NULL'
    );
    
    console.log(`\n📋 Productos sin fecha de vencimiento: ${productosSinFecha.rows.length}`);
    
    if (productosSinFecha.rows.length === 0) {
      console.log('✅ Todos los productos ya tienen fecha de vencimiento');
      await cliente.query('COMMIT');
      return;
    }
    
    let actualizados = 0;
    let errores = 0;
    
    console.log('\n💾 Asignando fechas de vencimiento aleatorias...');
    
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
        actualizados++;
      } catch (error) {
        console.error(`   ❌ Error al actualizar "${producto.nombre}": ${error.message}`);
        errores++;
      }
    }
    
    await cliente.query('COMMIT');
    
    console.log('\n📊 RESUMEN:');
    console.log('='.repeat(80));
    console.log(`   Productos actualizados: ${actualizados}`);
    console.log(`   Errores: ${errores}`);
    console.log('\n✅ Proceso completado');
    
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

completarFechasVencimiento();

