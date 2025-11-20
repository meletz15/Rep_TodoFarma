const { pool } = require('./src/config/db');
const CargaController = require('./src/controllers/cargaController');

async function completarSalidasFaltantes() {
  let cliente = null;
  try {
    console.log('🔍 Completando fechas de vencimiento y números de lote en salidas...');
    console.log('='.repeat(80));
    
    cliente = await pool.connect();
    await cliente.query('BEGIN');
    
    // Obtener salidas sin fecha de vencimiento o sin número de lote
    const salidasFaltantes = await cliente.query(
      `SELECT im.id_mov, im.producto_id, im.cantidad, p.nombre as producto_nombre, 
              p.fecha_vencimiento as producto_fecha, im.fecha_vencimiento, im.numero_lote
       FROM inventario_movimiento im
       JOIN producto p ON im.producto_id = p.id_producto
       WHERE im.tipo = 'SALIDA_VENTA'
         AND (im.fecha_vencimiento IS NULL OR im.numero_lote IS NULL)
       ORDER BY im.id_mov ASC`
    );
    
    console.log(`\n📋 Salidas a completar: ${salidasFaltantes.rows.length}`);
    
    if (salidasFaltantes.rows.length === 0) {
      console.log('✅ Todas las salidas ya tienen fecha de vencimiento y número de lote');
      await cliente.query('COMMIT');
      return;
    }
    
    let actualizados = 0;
    let errores = 0;
    
    console.log('\n💾 Completando datos faltantes...');
    
    for (const salida of salidasFaltantes.rows) {
      try {
        let fechaVencimiento = salida.fecha_vencimiento;
        let numeroLote = salida.numero_lote;
        
        let fuenteFecha = 'ya tenía';
        
        // Si falta fecha de vencimiento, buscar en lotes disponibles o usar la del producto
        if (!fechaVencimiento) {
          // Buscar lotes disponibles del producto (FIFO)
          const lotesDisponibles = await cliente.query(
            `SELECT 
              im.fecha_vencimiento,
              im.numero_lote,
              SUM(CASE WHEN im.signo = 1 THEN im.cantidad ELSE -im.cantidad END) as stock_disponible
            FROM inventario_movimiento im
            WHERE im.producto_id = $1
              AND im.fecha_vencimiento IS NOT NULL
              AND im.id_mov < $2
            GROUP BY im.producto_id, im.fecha_vencimiento, im.numero_lote
            HAVING SUM(CASE WHEN im.signo = 1 THEN im.cantidad ELSE -im.cantidad END) > 0
            ORDER BY im.fecha_vencimiento ASC, MIN(im.fecha) ASC
            LIMIT 1`,
            [salida.producto_id, salida.id_mov]
          );
          
          if (lotesDisponibles.rows.length > 0) {
            fechaVencimiento = lotesDisponibles.rows[0].fecha_vencimiento;
            fuenteFecha = 'del lote';
            // Si también falta el número de lote, usar el del lote encontrado
            if (!numeroLote) {
              numeroLote = lotesDisponibles.rows[0].numero_lote;
            }
          } else if (salida.producto_fecha) {
            // Usar la fecha del producto
            fechaVencimiento = salida.producto_fecha;
            fuenteFecha = 'del producto';
          } else {
            // Generar una fecha aleatoria
            fechaVencimiento = CargaController.generarFechaVencimientoAleatoria();
            fuenteFecha = 'generada';
          }
        }
        
        // Si falta número de lote, generarlo
        if (!numeroLote) {
          numeroLote = await CargaController.generarSiguienteNumeroLote(cliente);
        }
        
        // Actualizar el movimiento
        await cliente.query(
          'UPDATE inventario_movimiento SET fecha_vencimiento = $1, numero_lote = $2 WHERE id_mov = $3',
          [fechaVencimiento, numeroLote, salida.id_mov]
        );
        
        console.log(`   ✅ Movimiento #${salida.id_mov} (${salida.producto_nombre.substring(0, 30)}) - Fecha: ${fechaVencimiento} (${fuenteFecha}), Lote: ${numeroLote}`);
        actualizados++;
      } catch (error) {
        console.error(`   ❌ Error al actualizar movimiento #${salida.id_mov}: ${error.message}`);
        errores++;
      }
    }
    
    await cliente.query('COMMIT');
    
    console.log('\n📊 RESUMEN:');
    console.log('='.repeat(80));
    console.log(`   Movimientos actualizados: ${actualizados}`);
    console.log(`   Errores: ${errores}`);
    
    // Verificación final
    const verifSinFecha = await cliente.query(
      'SELECT COUNT(*) as total FROM inventario_movimiento WHERE tipo = \'SALIDA_VENTA\' AND fecha_vencimiento IS NULL'
    );
    const verifSinLote = await cliente.query(
      'SELECT COUNT(*) as total FROM inventario_movimiento WHERE tipo = \'SALIDA_VENTA\' AND numero_lote IS NULL'
    );
    
    console.log('\n✅ VERIFICACIÓN FINAL:');
    console.log(`   Salidas sin fecha_vencimiento: ${verifSinFecha.rows[0].total}`);
    console.log(`   Salidas sin numero_lote: ${verifSinLote.rows[0].total}`);
    
    if (verifSinFecha.rows[0].total === 0 && verifSinLote.rows[0].total === 0) {
      console.log('\n🎉 ¡Todas las salidas tienen fecha de vencimiento y número de lote!');
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

completarSalidasFaltantes();

